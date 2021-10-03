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
            nSpecies = str_split(species, ";") %>% unlist %>% length,
            country = country[1],
            continent = continent[1]) %>%
  filter(!is.na(lat), !is.na(lon))

stations.df %>% write.csv(paste0(dashboard.dir, 'stations.csv'), row.names = F)


# Animals
animals.df <- paste0(dashboard.dir, 'tag-deps.csv') %>% read.csv()

stationAnimals.df <- stations.df %>% 
  select(id, projID, animals) %>%
  mutate(animals = strsplit(animals, ';')) %>%
  unnest(animals) %>%
  group_by(id, projID) %>%
  mutate(row = row_number()) %>%
  spread(row, animals) %>%
  pivot_longer(matches("[0-9]"), 
               names_to = "row_num", 
               values_to = "animal",
               values_drop_na = T) %>%
  select(-row_num) %>%
  filter(animal != "NA") %>%
  group_by(animal) %>%
  summarise(stations = paste0(unique(id), collapse = ';'),
            projects = paste0(unique(projID), collapse = ';')) %>%
  mutate(id = as.integer(animal)) %>%
  select(-animal)

animals.df %>% 
  left_join(stationAnimals.df, by = 'id') %>%
  write.csv(paste0(dashboard.dir, 'tag-deps.csv'), row.names = F)



# Species
spp.df <- paste0(dashboard.dir, 'spp.csv') %>% read.csv() %>% 
  mutate(projects = gsub(",", ";", projects),
         animals = gsub(",", ";", animals)) %>%
  select(-contains("station"))

stationSpecies.df <- stations.df %>% 
  select(id, projID, species) %>%
  mutate(species = strsplit(species, ';')) %>%
  unnest(species) %>%
  group_by(id, projID) %>%
  mutate(row = row_number()) %>%
  spread(row, species) %>%
  pivot_longer(matches("[0-9]"), 
               names_to = "row_num", 
               values_to = "species",
               values_drop_na = T) %>%
  select(-row_num) %>%
  filter(species != "NA") %>%
  group_by(species) %>%
  summarise(stations = paste0(unique(id), collapse = ';'),
            stationProjects = paste0(unique(projID), collapse = ';')) %>%
  mutate(id = as.integer(species)) %>%
  select(-species)

spp.df %>% 
  left_join(stationSpecies.df, by = 'id') %>%
  write.csv(paste0(dashboard.dir, 'spp.csv'), row.names = F)

