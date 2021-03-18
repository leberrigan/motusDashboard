# Motus Dashboard

To be released 2021. An upgrade for Motus Explore Data tool.

- [Updates](#updates)
- [Site map](#site-map)
- [Data structure](#data-structure)

## Updates

### Latest
* [x] Make a legend
* [x] Save page as PDF
 * [x] Improve PDF output by adding more summary data and a table or two
* [x] Tidy initial summary displayed prior to detailed profile page so there's lots of white space and it's clear what's going on.
* [x] Generate summary to display prior to detailed profile page.
* [x] Reorganize directories and removed unecessary files.

### In development
* [ ] On summary pages, combine species and animals into a single table. Accordion-style: clicking on a species shows animals below it.

### Next
 * [ ] **Profiles:** Develop species profiles
 * [ ] **Profiles:** Develop animal profiles
 * [ ] **Profiles:** Develop station profiles
 * [ ] **Profiles:** Move map legend for selections to top of page (under filters)
 * [ ] **Explore:** Move data summaries to top of hierarchy
 * [ ] **Profiles:** Add a new tab for projects.
 * [ ] **Profiles:** Combine station tables and try to fit them under timeline for each row. Accordion-style so it can be hidden.
 * [ ] **Profiles:** Highlight regions where stations/tagDeps exist in all profile pages
 * [ ] **Profiles:** Improve map control interface
 * [ ] **Explore:** Introduce custom selections
 * [ ] **ALL:** Pare down code so fewer scripts are required
 * [ ] **Profiles:** Think about adding a [streamgraph](https://bl.ocks.org/HarryStevens/c893c7b441298b36f4568bc09df71a1e) for species timelines and antenna activity.

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
