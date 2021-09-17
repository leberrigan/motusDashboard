# Prep metadata for dashboard
library(tidyverse)
library(lubridate)
library(fuzzyjoin)
library(geosphere)

dashboard.dir <- "C:/wamp64/www/Motus/Dashboard/data/"
data.dir <- 'E:/Data/'

recvDeps.df <- read.csv(paste0(dashboard.dir, 'recv-deps.csv'))

stations.df <- recvDeps.df %>%
  ungroup() %>%
  mutate(dtStart = as.Date(dtStart),
         dtEnd = if_else(is.na(dtEnd), Sys.Date(), as.Date(dtEnd))) %>%
  filter(nchar(name) > 0 & !is.na(dtStart)) %>%
  group_by(name) %>%
  summarise(nDeps = length(unique(id)),
            stationDeps = paste0(id, collapse = ';'),
            id = id[1],
            name = name[1],
            lat = median(lat[1], na.rm = T),
            lon = median(lon[1], na.rm = T),
            frequency = paste0(unique(frequency), collapse = ';'),
            projID = paste0(unique(projID), collapse = ';'),
            dtStart = as.character(min(dtStart, na.rm = T)),
            dtEnd = as.character(max(dtEnd, na.rm = T)),
            animals = paste0(unique(unlist(str_split(animals, ';'))), collapse = ';'),
            localAnimals = paste0(unique(unlist(str_split(localAnimals, ';'))), collapse = ';'),
            species = paste0(unique(unlist(str_split(species, ';'))), collapse = ';'),
            nAnimals = str_split(animals, ";") %>% unlist %>% length,
            nSpecies = str_split(species, ";") %>% unlist %>% length) %>%
  filter(!is.na(lat), !is.na(lon))

stations.df %>% write.csv(paste0(dashboard.dir, 'stations.csv'), row.names = F)
