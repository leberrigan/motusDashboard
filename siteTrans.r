library(tidyverse)
library(motus)
library(lubridate)

dir <- 'E:/Data/'

proj <- 109

motus.sql <- tagme(proj, T, F, dir, forceMeta = T)

alltags.tbl <- motus.sql %>% tbl('alltags')

alldeps.df <- motus.sql %>% tbl('tagdeps') %>% collapse() %>% as_tibble() %>%
  filter(projectID == 109) %>%
  mutate(tsStart = as.POSIXct(tsStart, origin = '1970-01-01'),
         tagDeployID = as.character(deployID),
         bandNumber = ifelse(is.na(markerNumber), bandNumber, markerNumber)) %>%
  filter(year(tsStart) == 2017) %>%
  select(tagDeployID, speciesID, bandNumber, bandLat = latitude, bandLon = longitude, sex, age)

alldeps.df

alltags.df <- alltags.tbl %>% 
  filter(runLen > 2, tagDeployID %in% !!alldeps.df$tagDeployID) %>% 
  collect() %>% as_tibble()

unique(alldeps.df$tagDeployID)[1:32]

dashboard.dir <- "C:/wamp64/www/Motus/Dashboard/Example station interfaces/data/"

siteTrans <- alltags.df %>% filter(runLen > 2, tagDeployID %in% unique(alldeps.df$tagDeployID)[1:16]) %>% siteTrans()

siteTrans %>%
  filter(!grepl('bp', tolower(recvDeployName.y)) &
           !grepl('seal', tolower(recvDeployName.y))) %>%
  mutate(dtStart = as.Date(ts.x),
         dtEnd = as.Date(ts.y)) %>%
  select(tagDeployID, lat1 = lat.x, lon1 = lon.x, lat2 = lat.y, lon2 = lon.y, dtStart, dtEnd) %>%
  write.csv(paste0(dashboard.dir, 'siteTrans1.csv'), row.names = F)

siteTrans <- alltags.df %>% filter(runLen > 2, tagDeployID %in% unique(alldeps.df$tagDeployID)[17:32]) %>% siteTrans()

siteTrans %>%
  filter(!grepl('bp', tolower(recvDeployName.y)) &
           !grepl('seal', tolower(recvDeployName.y))) %>%
  mutate(dtStart = as.Date(ts.x),
         dtEnd = as.Date(ts.y)) %>%
  select(tagDeployID, lat1 = lat.x, lon1 = lon.x, lat2 = lat.y, lon2 = lon.y, dtStart, dtEnd) %>%
  write.csv(paste0(dashboard.dir, 'siteTrans2.csv'), row.names = F)


siteTrans <- alltags.df %>% filter(runLen > 2, tagDeployID %in% unique(alldeps.df$tagDeployID)[33:48]) %>% siteTrans()

siteTrans %>%
  filter(!grepl('bp', tolower(recvDeployName.y)) &
           !grepl('seal', tolower(recvDeployName.y))) %>%
  mutate(dtStart = as.Date(ts.x),
         dtEnd = as.Date(ts.y)) %>%
  select(tagDeployID, lat1 = lat.x, lon1 = lon.x, lat2 = lat.y, lon2 = lon.y, dtStart, dtEnd) %>%
  write.csv(paste0(dashboard.dir, 'siteTrans3.csv'), row.names = F)


siteTrans <- alltags.df %>% filter(runLen > 2, tagDeployID %in% unique(alldeps.df$tagDeployID)[49:64]) %>% siteTrans()

siteTrans %>%
  filter(!grepl('bp', tolower(recvDeployName.y)) &
           !grepl('seal', tolower(recvDeployName.y))) %>%
  mutate(dtStart = as.Date(ts.x),
         dtEnd = as.Date(ts.y)) %>%
  select(tagDeployID, lat1 = lat.x, lon1 = lon.x, lat2 = lat.y, lon2 = lon.y, dtStart, dtEnd) %>%
  write.csv(paste0(dashboard.dir, 'siteTrans4.csv'), row.names = F)

  

  site.name ==  which(deployID == recvDeps.df[site.name = recvDeps.df$site.name]$deployID)
  
  
  
  rbind(read.csv(paste0(dashboard.dir, 'siteTrans1.csv')),
        read.csv(paste0(dashboard.dir, 'siteTrans2.csv')),
      read.csv(paste0(dashboard.dir, 'siteTrans3.csv')),
      read.csv(paste0(dashboard.dir, 'siteTrans4.csv'))) %>%
  rename(tagID = motusTagID, deployID = tagDeployID) %>%
  left_join(select(tagDeps.df, deployID = tagDeployID, projID = tagProjectID, species = speciesID)) %>%
  write.csv(paste0(dashboard.dir, 'siteTrans.csv'), row.names = F)



#
#
#
#
#
#


library(lubridate)
library(tidyverse)

dashboard.dir <- "C:/wamp64/www/Motus/Dashboard/data/"

dir <- 'E:/Data/'

recvDeps.df <- read.csv(paste0(dir, 'receiver-deployments.csv')) %>%
  mutate(dtStart = as.Date(dtStart),
         dtEnd = as.Date(dtEnd))

recvDeps.df %>% head


antDeps.df <- read.csv(paste0(dir, 'antenna-deployments.csv')) %>%
  select(recvDeployID, port, bearing, frequency) %>% 
  filter(!is.na(frequency)) %>%
#  pivot_wider(names_from = frequency, values_from = port) %>%
  group_by(recvDeployID) %>%
  summarise(nAnt = n(), 
            frequency = paste0(unique(frequency), collapse = ','))
  
antDeps.df %>% head

recvAntDeps.df <- recvDeps.df %>%
  left_join(antDeps.df, by = 'recvDeployID') %>%
  select(projID = recvProjectID,
         deployID = recvDeployID, 
         status = deploymentStatus, 
         name = siteName, 
         serno = receiverID, 
         dtStart, 
         dtEnd, 
         lat = latitude, 
         lon = longitude,
         nAnt,
         frequency)

recvAntDeps.df %>% write.csv(paste0(dashboard.dir, 'recv-deps.csv'), row.names = F)

recvDeps.df %>%
  group_by
  ggplot(aes())

tagDeps.df <- read.csv(paste0(dir, 'tag-deployments.csv')) %>%
  mutate(dtStart = as.Date(dtStart),
         dtEnd = as.Date(dtEnd, format = '%Y-%m-%d %H:%M'),
         dtEnd = as.Date(ifelse(is.na(dtEnd), dtStart + days(lifespan), dtEnd), origin = '1970-01-01'),
         bandNumber = ifelse(is.na(bandNumber), markerNumber, bandNumber))

tagDeps.df %>% head


tags.df <- read.csv(paste0(dir, 'tags.csv')) %>%
  dplyr::select(tagID , 
         model, 
         frequency = nomFreq,
         manufacturer)

tagDeps2.df <- tagDeps.df %>%
  left_join(tags.df, by = 'tagID') %>%
  dplyr::select(projID = tagProjectID,
         tagID,
         deployID = tagDeployID, 
         status = deploymentStatus, 
         species = speciesID, 
         dtStart, 
         dtEnd, 
         lat = latitude, 
         lon = longitude,
         frequency,
         model,
         manufacturer)

tagDeps2.df %>%
  write.csv(paste0(dashboard.dir, 'tag-deps.csv'), row.names = F)

projs.df <- read.csv(paste0(dir, 'motus-projects.csv')) %>% 
  mutate(dtCreated = as.Date(createdDt, format = '%Y-%m-%d %H:%M'))

projs.df %>% select(id = projectID,
                    dtCreated,
                    name = projectName,
                    shortName = projectCode,
                    description = descriptionLong,
                    shortDescription = descriptionShort) %>%
  write.csv(paste0(dashboard.dir, 'projs.csv'), row.names = F)

species.df <- read.csv(paste0(dir, 'species.csv')) %>% 
  filter(id %in% unique(tagDeps.df$speciesID)) %>%
  arrange(sort)

species.df %>% head

species.df %>% write.csv(paste0(dashboard.dir, 'spp.csv'), row.names = F)

Mode <- function(x, na.rm = F) {
  ux <- unique(x[!is.na(x) | !na.rm])
  ux[which.max(tabulate(match(x, ux)))]
}

stations.df <- recvAntDeps.df %>%
  group_by(name) %>%
  summarise(lat = Mode(lat, na.rm = T),
            lon = Mode(lon, na.rm = T),
            deployID = max(deployID, na.rm = T)) %>%
  filter(!is.na(lat), !is.na(lon))

animals.df <- tagDeps2.df %>% 
  group_by(deployID) %>%
  summarise(lat = Mode(lat, na.rm = T),
            lon = Mode(lon, na.rm = T),
            deployID = max(deployID, na.rm = T)) %>%
  filter(!is.na(lat), !is.na(lon))

  
library(rworldmap)
library(rworldxtra)
library(GISTools)


### Load GEOSPATIAL DATA ###
# Make a new high resolution map
worldMap <- spTransform(getMap(resolution = "high"), CRSobj = CRS("+init=epsg:4326"))

# Make a spatial points data frame of recv deps
stations.sp <- SpatialPoints(stations.df[c("lon", "lat")], proj4string = CRS("+init=epsg:4326"))
animals.sp <- SpatialPoints(animals.df[c("lon", "lat")], proj4string = CRS("+init=epsg:4326"))

stations.inCountries <- poly.counts(stations.sp, worldMap) %>% as.data.frame
animals.inCountries <- poly.counts(animals.sp, worldMap) %>% as.data.frame

station.countries <- over(stations.sp, worldMap) %>% 
  dplyr::select(country = ADM0_A3, continent) %>% 
  cbind(name = stations.df$name)

recvAntDeps.df %>% 
  left_join(station.countries, by = 'name') %>%
  write.csv(paste0(dashboard.dir, 'recv-deps.csv'), row.names = F)


animal.countries <- over(animals.sp, worldMap) %>% 
  dplyr::select(country = ADM0_A3, continent) %>% 
  cbind(deployID = animals.df$deployID)

tagDeps2.df  %>%
  left_join(animal.countries, by = 'deployID') %>%
  write.csv(paste0(dashboard.dir, 'tag-deps.csv'), row.names = F)

plot(worldMap)
points(stations.sp)
