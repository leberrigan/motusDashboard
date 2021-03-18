# Motus Dashboard

To be released 2021. An upgrade for Motus Explore Data tool.

- [Updates](#updates)
- [Site map](#site-map)
- [Data structure](#data-structure)

## Updates

### Latest
* [x] Save page as PDF
 * [x] Improve PDF output by adding more summary data and a table or two
* [x] Generate summary to display prior to detailed profile page.
* [x] Reorganize directories and remove unecessary files.

### In development
 * [ ] Tidy initial summary displayed prior to detailed profile page so there's lots of white space and it's clear what's going on.
 * [ ] Make a legend

### Next
 * [ ] Highlight regions where stations/tagDeps exist in all profile pages
 * [ ] Improve map control interface on profiles
 * [ ] Introduce custom selections
 * [ ] Pare down code so fewer scripts are required

---

## Site Map
```
|> EXPLORE DATA
|
|---|> STATIONS                                            (point or bubble map)
|   |---> STATION PROFILE                                  (deployment location)
|
|---|> ANIMALS                                                       (track map)
|   |---> ANIMAL PROFILE                (deployment location or track of animal)
|
|---|> DATA SUMMARIES                                     (polygon map or table)
    |---|> REGIONAL PROFILE                           (map, figures, and tables)
    |   |---> ANIMAL PROFILE                          (animals tagged in region)
    |   |---> ANIMAL PROFILE                        (animals detected in region)
    |   |---> STATION PROFILE                               (stations in region)
    |
    |---|> PROJECT PROFILE                            (map, figures, and tables)
    |   |---> ANIMAL PROFILE                         (tagged animals in project)
    |   |---> STATION PROFILE                              (stations in project)
    |
    |---|> SPECIES PROFILE                            (map, figures, and tables)
    |   |---> ANIMAL PROFILE                         (tagged animals of species)
    |   |---> STATION PROFILE                      (stations visited by species)
    |   |---> STATION PROFILE                              (stations in project)
    |
    |---|> GROUP PROFILE                              (map, figures, and tables)
        |---> ANIMAL PROFILE                           (tagged animals in group)
        |---> STATION PROFILE                        (stations visited in group)
```

---

## Data structure

### Base
##### TRACKS
- `animal ID`
- `station ID start`
- `station ID end`
- `timestamp start`
- `timestamp end`

### Metadata
##### STATIONS
- `station ID`
- `project ID`
- `latitude`
- `longitude`
- `deployment start (min)`
- `deployment end (max)`
- `groups` - *i.e.; custom groupings*

##### ANIMALS
- `animal ID`
- `species ID`
- `project ID`
- `deployment latitude`
- `deployment longitude`
- `deployment date`
- `lifespan`
- Animal measurements
- `groups` - *i.e.; custom groupings*

##### PROJECTS
- `project ID`
- `name`
- `code`
- `description`
- `contact`
- `affiliations`
- `groups` - *i.e.; custom groupings*

##### Projects

### Calculated

##### REGIONS
- `animals in region`
- `stations in region`

##### Project
- `animals in project`

##### SPECIES
- `animals of species`
- `stations visited by species`

##### GROUPS
- `animals in group`
- `stations in group`
