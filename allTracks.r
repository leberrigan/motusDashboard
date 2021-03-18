library(tidyverse)
library(lubridate)
library(fuzzyjoin)

dashboard.dir <- "C:/wamp64/www/Motus/Dashboard/Example station interfaces/data/"
data.dir <- 'E:/Data/'

tags <- read.csv(paste0(data.dir, 'tags.csv')) %>% 
  select(projID = project_id, tagID = id, mfgID = mfg_id, bi = period, freq = nom_freq)

tagDeps <- read.csv(paste0(data.dir, 'tag-deployments.csv')) %>%
  rename(projID = tagProjectID, tagID = tagID, deployID = tagDeployID, lat = latitude, lon = longitude) %>% #, dtStart, dtEnd) %>%
  mutate(lat.r = round(lat/10), lon.r  = round(lon/10),
         dtEnd = as.Date(as.POSIXct(tsEnd, origin = '1970-01-01')),
         dtStart = as.Date(dtStart),
         dtEnd = if_else(is.na(tsEnd), dtStart + days(lifespan), dtEnd),
         intEnd = as.integer(dtEnd),
         intStart = as.integer(dtStart)) %>%
  filter(!is.na(lifespan), !is.na(lat), !is.na(lon)) %>%
  select(-mfgID) %>%
  left_join(tags, by = c('projID','tagID')) %>%
  filter(!is.na(freq))

recvDeps <- read.csv(paste0(data.dir, 'receiver-deployments.csv')) %>% 
  rename(projID = recvProjectID, lat = latitude, lon = longitude) %>%
  mutate(dtEnd = as.Date(if_else(is.na(tsEnd), Sys.time(),as.POSIXct(tsEnd, origin = '1970-01-01'))),
         dtStart = as.Date(dtStart),
         interval = difftime(dtEnd, dtStart, units = 'days'),
         intEnd = as.integer(dtEnd),
         intStart = as.integer(dtStart)) %>% 
  group_by(lat, lon) %>% 
  summarise(recvDeployID=recvDeployID[1], lat=lat[1], lon=lon[1]) 

antDeps <- read.csv(paste0(data.dir, 'antenna-deployments.csv')) %>%
  select(recvDeployID, frequency) %>%
  group_by(recvDeployID) %>%
  summarise(freq = paste(unique(frequency), sep = ','))


Mode <- function(x, na.rm = F) {
  ux <- unique(x[!is.na(x) | !na.rm])
  ux[which.max(tabulate(match(x, ux)))]
}

allTracks.df.raw <- read.csv(paste0(data.dir, 'MotusAllTheTracks.csv')) 
allTracks.df <- allTracks.df.raw %>% 
  rename(deployID = tagDeployId, lat = latitude, lon = longitude) %>%
  left_join(recvDeps, by = c('lat','lon')) %>% 
  group_by(deployID) %>%
  arrange(end_s) %>%
  mutate(lat1 = lag(lat), 
         lon1 = lag(lon), 
         lat2 = lat, 
         lon2 = lon,
         recv1 = lag(recvDeployID),
         recv2 = recvDeployID,
         ts1 = lag(end_s), 
         ts2 = begin_s,
         route = ifelse(recv1 < recv2, paste(recv1, recv2, sep = '.'), paste(recv2, recv1, sep = '.'))
      #   route = ifelse(lat1 < lat2, paste(lat1, lon1, lat2, lon2, sep = ','),  paste(lat2, lon2, lat1, lon1, sep = ','))
#         route = as.integer(as.factor(route))
         ) %>%
  filter(!is.na(route)) %>%
  left_join(select(tagDeps, deployID, projID, species = speciesID, freq), by = 'deployID') %>%
  filter(!is.na(projID)) %>%
  left_join(summarise(group_by(antDeps, recvDeployID), freq = ifelse(freq[1] == 434 & length(freq) > 1, freq[2], freq[1])), by = 'recvDeployID') %>%
  mutate(freq = ifelse(is.na(freq.x), freq.y, freq.x)) %>% 
  group_by(route) %>%
  summarise(animal = paste((deployID), collapse=','),
            species = paste((species), collapse=','),
            type = "LineString",
            frequency = paste(unique(freq)[order(unique(freq))], collapse=','),#Mode(freq, na.rm = T),
            project = paste(unique(projID)[order(unique(projID))], collapse=','),
            recv1 = recv1[1],
            recv2 = recv2[1],
            lon1 = lon1[1],
            lat1 = lat1[1],
            lon2 = lon2[1],
            lat2 = lat2[1],
            tsStart = paste(ts1, collapse=','),
            tsEnd = paste(ts2, collapse=','),
            dtStart = paste(as.Date(as.POSIXct(ts1, origin = '1970-01-01')), collapse=','),
      #      dtStart = (as.Date(as.POSIXct(min(ts1, na.rm = T), origin = '1970-01-01'))),
      #      dtEnd = (as.Date(as.POSIXct(max(ts2, na.rm = T), origin = '1970-01-01'))))
            dtEnd = paste(as.Date(as.POSIXct(ts2, origin = '1970-01-01')), collapse=','))

allTracks.df %>%  write.csv(paste0(dashboard.dir,'siteTrans_real2.csv'), row.names = F)
  