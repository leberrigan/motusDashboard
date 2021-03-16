## Randomly generate tracks
library(tidyverse)
library(lubridate)
library(fuzzyjoin)
library(geosphere)
library(parallel)


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

tagDeps_grouped <- tagDeps %>%
  group_by(lat, lon, intStart, intEnd, freq) %>%
  summarise(nDeps = n()) %>%
  ungroup()

tagDeps_grouped$id <- rownames(tagDeps_grouped)

# Antenna deployments only needed to get frequency of receiver - other antenna props are not used.

antDeps <- read.csv(paste0(data.dir, 'antenna-deployments.csv')) %>%
  select(recvDeployID, frequency) %>%
  group_by(recvDeployID) %>%
  summarise(freq = paste(unique(frequency), sep = ','))

unique(antDeps$freq)

recvDeps <- read.csv(paste0(data.dir, 'receiver-deployments.csv')) %>% 
  rename(projID = recvProjectID, lat = latitude, lon = longitude) %>%
  mutate(dtEnd = as.Date(if_else(is.na(tsEnd), Sys.time(),as.POSIXct(tsEnd, origin = '1970-01-01'))),
         dtStart = as.Date(dtStart),
         interval = difftime(dtEnd, dtStart, units = 'days'),
         intEnd = as.integer(dtEnd),
         intStart = as.integer(dtStart)) %>%
  left_join(antDeps) %>%
  filter(!is.na(lat), !is.na(lon), !is.na(freq), freq != 'NA')


stations <- recvDeps %>%
  group_by(projID, siteName) %>%
  summarise(nDeps = n())

# How long are animals expected to hang around taggin site?
stopLen_tagSite = days(14)

recvDeps.list <- recvDeps %>% select(intStart, intEnd, lat, lon) %>% split(seq(nrow(recvDeps)))

# Loop through each receiver and find tags that were: 
#  - Deployed within 100 km
#  - Had first 2 weeks of deployment overlap with station deployment.
# And randomly sample 80-100% of them, with weights based on distance.


getOverlaps <- function (x) {
  df <- tagDeps_grouped %>% 
    filter(intStart < x$intEnd,
          intStart + 14 > x$intStart) 
  
  if (nrow(df) > 0) {
    df <- df %>%
      mutate(lon2 = x$lon,
             lat2 = x$lat,
             dist = distHaversine(cbind(lon, lat), cbind(lon2, lat2))) %>%
      filter(!is.na(dist) & dist < 100000) %>%
      select(id, dist)
    
    if (nrow(df) > 0) {
      df[df$id %in% sample(df$id, round(runif(1, 0.8, 1) * nrow(df)), F, 1/(1+df$dist)), ]
    } else {df}
  }
}

time1 <- system.time(overlaps1 <- lapply(recvDeps.list[1:10], getOverlaps))
time1

sample()


numCores <- detectCores() - 1

cl <- makeCluster(numCores, type = 'PSOCK')

clusterEvalQ(cl,  library(tidyverse))
clusterEvalQ(cl,  library(geosphere))
clusterExport(cl, 'tagDeps_grouped')

#time2 <- system.time(parLapply(cl, recvDeps.list[1:100], getOverlaps))

time3 <- system.time(overlaps <- parLapply(cl, recvDeps.list, getOverlaps))

stopCluster(cl)


stationTags <- overlaps %>% sapply(function(x){x$id})


## After the first two weeks, the chance of detecting a tag increases with 
#   time since deployment and decreases with distance to last location detected
## I will likely need to make tracks on a tag-by-tag basis

# Track length will depend on:
# - Current distance to nearest station
# - Remaining lifespan of tag
# - Average time between detections
# - Predicted distance flown will depend on time since detection.
# - Weights of random sample will vary based on predicted distance flown.


tagsDetected <- unlist(stationTags) %>% unique()

tagDeps.df <- tagDeps %>% 
  filter(freq %in% unique(recvDeps$freq)) %>%
 # filter(deployID %in% tagsDetected) %>% 
  select(deployID, intStart, intEnd, lat, lon, lifespan, freq) %>%
  arrange(deployID)

testTag <- 13688

tagDeps.df %>% filter(deployID >= testTag-2 & deployID <= testTag+2)

tagDeps.list <- tagDeps.df %>% split(seq(nrow(tagDeps.df)))

getTracks <- function(x) {
  
  # x = one row from tagDeps table
  if (!is.null(x)) {
    
    # Will loop through each day of the tags life
    remainingDays <- x$lifespan
    
    # Even if it was 'detected' at tagging site, the last location remains the same at first
    last.location <- c(x$lat, x$lon)
    
    recvDeps <- recvDeps %>% 
      filter(x$freq == freq, (intEnd > x$intStart) & (intStart < x$intEnd) )
    
    y <- list()
    
    daysSinceDetection <- 1
    
    # Were any receivers active?
    if (nrow(recvDeps) > 0) {
      
      while(remainingDays != 0) {
        test <- nrow(recvDeps)
        # Which receivers were active at this time?
        recvs <- recvDeps %>% 
          filter( (intStart <= x$intEnd - remainingDays) & (intEnd >= x$intEnd - remainingDays) ) 
        
#        message(paste0(c(test, nrow(recvs)), collapse = ' - '))
        
        if (nrow(recvs) > 0) {
    
          # Probability of detection at any station depends on proximity to 
          # nearby stations and number of days since last detection.
          #   - If it was detected at banding site (above), use that
          recvs <- recvs %>% 
            mutate(lon2 = last.location[2],
                   lat2 = last.location[1],
                   dist = distHaversine(cbind(lon, lat), cbind(lon2, lat2))) %>%
            filter(dist < 100000 * daysSinceDetection, dist > 0) # every day it can move 100 km
          
          if (nrow(recvs) > 0) {
  
            # how many times has the tag already been detected here?
            
            
          #  message(table(unlist(y)))
            recvs <- recvs %>% rowwise() %>% mutate(numVisits = ifelse(recvDeployID %in% unlist(y),table(unlist(y))[as.character(recvDeployID)],0))
            
            prob.detect.all <- (((daysSinceDetection^0.5)*10)/(((daysSinceDetection^0.5)*100) + (recvs$dist/1000))) * (1/(1 + recvs$numVisits))
            
            
            
            prob.detect.sum <- max(prob.detect.all)
            
         #   prob.detect.sum <- max(sqrt(daysSinceDetection))
            
         #   message(max(recvs$numVisits))
        #    message(paste0(c(nrow(recvs), max(recvs$dist), range(prob.detect.all)), collapse = ' - '))
            message(prob.detect.sum)
          #  message(paste0(daysSinceDetection,  ' - ', sqrt(daysSinceDetection), ' - ',min((recvs$dist) * (1 + recvs$numVisits)), ' - ', prob.detect.sum,  ' - ', paste0(last.location, collapse = ', '), sep = ' - ', collapse = ' - '))
            
            prob.detect.sum <- ifelse(prob.detect.sum > 1, 1, sum(prob.detect.sum))
            
  #          message('Testing first sample')
            if (sample(c(T,F), 1, F, c(prob.detect.sum, 1 - prob.detect.sum))) {
             # message(paste0(length(prob.detect.all),'-',nrow(recvs)))
              if (nrow(recvs) > 1) {
                sampledRecv <- sample(recvs$recvDeployID, 1, F, 1/(1 + prob.detect.all))
              } else {
                sampledRecv <- recvs$recvDeployID[1]
              }          
              y[[x$intEnd - remainingDays]] <- sampledRecv
              
              last.location <- with(recvs[recvs$recvDeployID == sampledRecv, ], c(lat, lon))
              
              daysSinceDetection <- 1
   #           message(paste0("New location: ", sampledRecv, " - ", paste0(last.location, collapse = ', ')))
              
            } else {
         #     warning("No receivers selected!")
              daysSinceDetection <- daysSinceDetection + 1
            }
          } else {
          #  warning("No receivers nearby!")
            daysSinceDetection <- daysSinceDetection + 1
          }
          
        } #else {warning("No receivers active!")}
        
        remainingDays <- remainingDays - 1
      }
    } #else {warning("No receivers active during entire deployment period!")}
    paste0(y, collapse=',')
  } else {
    message('No tag!')
    NA
  }
}

tagsToRun <- sample(1:length(tagDeps.list), 500, F)


tracks<-getTracks(tagDeps.list[[tagsToRun[[1]]]])
testPlot(tracks[which(!is.na(tracks))])
i <- 2
while(is.null(tracks) & i <= 10) {
  tracks<-getTracks(tagDeps.list[[tagsToRun[[i]]]])
  message(i)
  i <- i+1
} 
testPlot(tracks[which(!is.na(tracks))])

testTagListNum <- 9878
time1 <- system.time(tracks1 <- lapply(tagDeps.list[testTagListNum], getTracks))
time2 <- system.time(tracks1 <- lapply(tagDeps.list[tagsToRun[420:430]], getTracks))
testPlot(tracks1[which(!is.na(tracks1))])

testPlot <- function(track.list) {

  track.df <- data.frame(recvID = unlist(lapply(track.list, function(x){paste((x), collapse = ", ")})))
  
  track.df$tagID <- row.names(track.df)
  
  
  track.df <- track.df %>% 
    filter(nchar(recvID) > 0) %>%
    mutate(days = 1) %>%
    separate_rows(recvID, convert = T) %>%
    group_by(tagID) %>%
    mutate(day = cumsum(days),
           date = as.Date(day, origin = '1970-01-01')) %>%
    filter(recvID != 'NULL') %>% 
    mutate(recvDeployID = as.integer(recvID)) %>%
    arrange(tagID, date) %>%
    left_join(recvDeps, by = 'recvDeployID') %>% 
    mutate(dist = distHaversine(cbind(lon, lat), cbind(lag(lon, default = 0), lag(lat, default = 0)))) 
  
  latlon.bounds <- list(range(track.df$lon), range(track.df$lat))
  
  track.df %>%
    ggplot(aes(lon, lat, color = tagID)) +
    geom_polygon(data = worldMap.df, aes(long, lat, group=group), fill="#444444", colour="#999999")+
    geom_line(aes(lon, lat, group = tagID, color = tagID))+
     # geom_segment(aes(x = lag(lon) , xend = lon,
  #                   y = lag(lat) , yend = lat), size = 1)+
    theme(legend.position = 'none')+
    coord_cartesian(xlim = latlon.bounds[[1]], ylim = latlon.bounds[[2]])
}
testRun <- function(tagsToRun) {
  
  numCores <- detectCores() - 1
  
  cl <- makeCluster(numCores, type = 'PSOCK')
  
  clusterEvalQ(cl,  library(tidyverse))
  clusterEvalQ(cl,  library(geosphere))
  clusterExport(cl, 'recvDeps')
  
  t <- parLapply(cl, tagDeps.list[tagsToRun], getTracks)
  
  invisible(stopCluster(cl))
  
  t
  
}



tracks <- testRun(tagsToRun)




tracks.df <- data.frame(recvID = unlist(lapply(tracks, function(x){paste((x), collapse = ", ")})),
                        deployID = tagDeps.df$deployID[as.integer(names(tracks))]) %>% 
  filter(nchar(recvID) > 0) %>%
  mutate(days = 1) %>%
  separate_rows(recvID, convert = T) %>%
  group_by(deployID) %>%
  mutate(day = cumsum(days),
         date = as.Date(day, origin = '1970-01-01')) %>%
  filter(recvID != 'NULL') %>% 
  mutate(recvDeployID = as.integer(recvID)) %>% 
  arrange(deployID, date) %>%
  left_join(recvDeps, by = 'recvDeployID') %>% 
  mutate(dist = distHaversine(cbind(lon, lat), cbind(lag(lon, default = 0), lag(lat, default = 0)))) 

tracks.df %>% 
  select(deployID, date, recvDeployID, lon, lat, recvDeployID, dist) %>%
  mutate(dtStart = date, 
         dtEnd = lead(date),
         deployID = as.integer(deployID),
         lon2 = lead(lon),
         lat2 = lead(lat),
         dist = distHaversine(cbind(lon,lat), cbind(lon2, lat2)),
         recvDeployID2 = lead(recvDeployID)) %>%
  left_join(select(tagDeps, deployID, tagID, species = speciesID, projID, freq, depStart = dtStart, depEnd = dtEnd), by = 'deployID') %>%
  filter(!is.na(species),
         !is.na(dtEnd)) %>%
  mutate(depEnd = as.Date(ifelse(is.na(depEnd), depStart + days(lifespan), depEnd), origin = '1970-01-01')) %>%
  rename(lon1 = lon, lat1 = lat, recvDeployID1 = recvDeployID) %>% 
  select(tagID, deployID, lat1, lon1, lat2, lon2, recvDeployID1, recvDeployID2, dist, dtStart, dtEnd, projID, species, freq) %>%
  write.csv(paste0(dashboard.dir,'siteTrans.csv'), row.names = F)



latlon.bounds <- list(range(tracks.df$lon), range(tracks.df$lat))

tracks.df %>%
  select(deployID, date, recvDeployID, lon, lat) %>%
  left_join(select(tagDeps, deployID, tagID, species = speciesID, projID, freq), by = 'deployID') %>%
  ggplot(aes(lon, lat, color = tagID)) +
  geom_polygon(data = worldMap.df, aes(long, lat, group=group), fill="#444444", colour="#999999")+
  geom_line(aes(lon, lat, group = tagID, color = as.character(freq)))+
  theme(legend.position = 'none')+
  coord_cartesian(xlim = latlon.bounds[[1]], ylim = latlon.bounds[[2]])


numCores <- detectCores() - 1

cl <- makeCluster(numCores, type = 'PSOCK')

clusterEvalQ(cl,  library(tidyverse))
clusterEvalQ(cl,  library(geosphere))
clusterExport(cl, 'recvDeps')
time2 <- system.time(overlaps2 <- parLapply(cl, tagDeps.list[110:120], getTracks))

time2 <- system.time(overlaps2 <- parLapply(cl, tagDeps.list[110:120], getTracks))
time2

unlist(overlaps2)

tagsToRun <- sample(1:length(tagDeps.list), 5000, F)

time3 <- system.time(tracks <- parLapply(cl, tagDeps.list[tagsToRun], getTracks))
time3 <- system.time(tracks <- parLapply(cl, tagDeps.list, getTracks))
time3
tracks %>% saveRDS(paste0(dashboard.dir,'tracks-15NOV21-2.rds'))
tracks <- readRDS(paste0(dashboard.dir,'tracks-15NOV21-2.rds'))

stopCluster(cl)

cl <- makeCluster(numCores, type = 'PSOCK')

clusterEvalQ(cl,  library(tidyverse))
t <- 1

tracks.df <- data.frame(x=I(tracks)) %>% 
  mutate(id=row_number()) %>% 
  unnest %>% 
  group_by(id) %>% mutate(k=paste0("V",row_number())) %>% 
  spread(k,x) %>% select(-id)

tracks.df2 <- data.frame(recvID = unlist(lapply(tracks, function(x){paste((x), collapse = ", ")})))

tracks.df <- lapply(tracks, function(x,y){
  tmp <- data.frame(recvDeployID = unlist(x))
  if (nrow(tmp) > 0) {tmp$tagID <- t}
  #message(y)
  t <- t + 1
})
stopCluster(cl)

tracks.df2 <- data.frame(recvID = unlist(lapply(tracks, function(x){paste((x), collapse = ", ")})))

tracks.df2$tagID <- row.names(tracks.df2)

tracks.df <- tracks.df2 %>% 
  filter(nchar(recvID) > 0) %>%
  mutate(days = 1) %>%
  separate_rows(recvID, convert = T) %>%
  group_by(tagID) %>%
  mutate(day = cumsum(days),
         date = as.Date(day, origin = '1970-01-01')) %>%
  filter(recvID != 'NULL')

tracks.df %>%
  group_by(tagID) %>%
  summarise(nDays = n(), nStations = length(unique(recvID)))

tracks.df3 <- tracks.df %>% 
  mutate(recvDeployID = as.integer(recvID)) %>%
  arrange(tagID, date) %>%
  left_join(recvDeps, by = 'recvDeployID') %>% 
  mutate(dist = distHaversine(cbind(lon, lat), cbind(lag(lon, default = 0), lag(lat, default = 0))))

tracks.df3 %>%
  ggplot(aes(lon, lat, color = tagID)) +
  geom_polygon(data = worldMap.df, aes(long, lat, group=group), fill="#444444", colour="#999999")+
  geom_segment(aes(x = lag(lon) , xend = lon,
                   y = lag(lat) , yend = lat), size = 1)+
  theme(legend.position = 'none')

library(rworldmap)
library(rworldxtra)

### Load GEOSPATIAL DATA ###
# Make a new high resolution map
worldMap <- getMap(resolution = "high")
# Connect up all the points so the polygons are closed
worldMap.df <- fortify(worldMap)
worldMap <- NULL
         







library(tidyverse)
library(motus)
library(parallel)

alltags.tbl <- tagme(projRecv = 109, dir = 'E:/Data') %>% tbl('alltags')
tagDeps.df <- tagme(projRecv = 109, dir = 'E:/Data') %>% tbl('tagdeps') %>% collect() %>% as.data.frame()

tagDeps <- tagDeps.df$deployID

getHits <- function(x) { message(x)
  alltags.tbl %>% filter(tagDeployID == x) %>% collect() %>% as.data.frame() }

cl <- makeCluster(7, type = 'PSOCK')

clusterEvalQ(cl,  library(tidyverse))
clusterExport(cl, 'alltags.tbl')

time2 <- system.time(allDetections.df <- parLapply(cl, tagDeps, getHits) %>% bind_rows())

stopCluster(cl)
