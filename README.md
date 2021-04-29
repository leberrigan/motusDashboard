# Motus Dashboard

To be released 2021. An upgrade for Motus Explore Data tool.

### **[DEMO](https://leberrigan.github.io/motusDashboard/explore.html)**
- [Updates](#updates)
- [Site map](#site-map)
- [Data structure](#data-structure)
- [Repository](https://github.com/leberrigan/motusDashboard)

## Updates

### Latest
* [x] [2021-04-28] Add in photos for stations, animals, and species
* [x] [2021-04-28] Fix default visibility and date filters.
* [x] [2021-04-28] Fix map colours.
* [x] [2021-04-28] Better separation of 'stations' v. 'stationDeps'.
* [x] [2021-04-23] Add in collaborative regions
* [x] [2021-04-22] Fix some links to profiles
* [x] [2021-04-22] Update filters or reload page when url hash key changes.
* [x] [2021-04-22] Upgrade table sorting, add links to some views,
* [x] [2021-04-22] Add option to view prospective stations.
* [x] [2021-04-22] Add icons to summary tabs.
* [x] [2021-04-20] Tweak `summary.js` so it works for species summaries.
* [x] [2021-04-20] Tweak `summary.js` so it works for animal summaries.
* [x] [2021-04-20] Tweak `summary.js` so it works for station summaries.
* [x] [2021-04-05] Fix animal selections in profiles, therefore summary totals as well.
* [x] [2021-04-05] Fix 'clear filters' button.
* [x] [2021-04-05] Fix timeline.
* [x] [2021-04-05] Revert string compression and omit irrelevant filters from URL.
* [x] [2021-04-05] Make animation controls work.
* [x] [2021-04-01] Add URL string compression.
* [x] [2021-04-01] Fix summary data to include animals detected and stations visited.
* [x] [2021-04-01] Fix `summary.js` receiver timelines so only visible ones are rendered.
* [x] [2021-03-25] Add a third category of detections for foreign detections of local birds.
* [x] [2021-03-24] Combine `regions.js` and `projects.js` into `summary.js` and generalise so it can be used for other summaries.
* [x] [2021-03-23] Move data summaries to top of hierarchy
* [x] [2021-03-19] Fix formatting for mobile (small screens).
* [x] [2021-03-19] Add tooltip to station timelines, showing date and data if data exist.
* [x] [2021-03-19] Combine station tables and try to fit them under timeline for each row. Accordion-style so it can be hidden.
* [x] [2021-03-19] On summary pages, combine species and animals into a single table. Accordion-style: clicking on a species shows animals below it.
* [x] [2021-03-18] Reorganize directories and removed unnecessary files.
* [x] [2021-03-18] Make a legend
* [x] [2021-03-18] Tidy initial summary displayed prior to detailed profile page so there's lots of white space and it's clear what's going on.
* [x] [2021-03-17] Generate summary to display prior to detailed profile page.
* [x] [2021-03-17] Improve PDF output by adding more summary data and a table or two
* [x] [2021-03-16] Save page as PDF

### In development
* [ ] **Profiles** Tweak animal, species, and station profiles to give it more flare.
* [ ] **Management** Station planning map
  * [ ] Add in collaborative regions
  * [ ] Add in table of 'inactive' and 'available' stations
* [ ] **Profiles:** Move selections legend to toggle buttons.
* [ ] **Profiles:** Improve map control interface

### Next
* [ ] **Profiles** Tweak `summary.js` so it works for project 'group' summaries.
* [ ] **Profiles:** Fix calculation of summary statistics
* [ ] **Profiles:** Update radial plot with filters
* [ ] **Profiles:** Highlight regions where stations/tagDeps exist in all profile pages
* [ ] **Explore:** Introduce custom selections
* [ ] **ALL:** Fix URL string compression so it is efficient.
* [ ] **ALL:** Pare down code so fewer scripts are required

### Further down the road...
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
|---|> REGIONAL SUMMARIES                                 (polygon map or table)
|   |---|> REGIONAL PROFILE                           (map, figures, and tables)
|       |---> ANIMAL PROFILE                          (animals tagged in region)
|       |---> ANIMAL PROFILE                        (animals detected in region)
|       |---> STATION PROFILE                               (stations in region)
|   
|---|> PROJECT SUMMARIES                                 (polygon map or table)
|   |---|> PROJECT PROFILE                            (map, figures, and tables)
|       |---> ANIMAL PROFILE                         (tagged animals in project)
|       |---> STATION PROFILE                              (stations in project)
|   
|---|> SPECIES SUMMARIES                                 (polygon map or table)
    |---|> SPECIES PROFILE                            (map, figures, and tables)
        |---> ANIMAL PROFILE                         (tagged animals of species)
        |---> STATION PROFILE                      (stations visited by species)
        |---> STATION PROFILE                              (stations in project)
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

### Calculated

##### REGIONS
- `animals in region`
- `stations in region`

##### PROJECTS
- `animals in project`

##### SPECIES
- `animals of species`
- `stations visited by species`

##### GROUPS
- `animals in group`
- `stations in group`

## Quick stats

### Number of hits: 4,338,50
### Number of runs: 37,684,367

## Summary Views

### PROJECTS
- Animals tagged in this project
- Animals detected by this project's stations
- Species tagged in this project
- Species detected by this project's stations
- Stations deployed in this project
- Stations visited by animals tagged in this project.
- Projects which this project has contributed data to.
- Projects which have contributed to this project.
- Regions where this project has deployments.

### STATIONS
- Animals tagged near this station
- Animals detected by this station
- Species tagged near this stations
- Species detected near this station
- Projects which this station has contributed to (tag projects).
- Number of regions from which detected tags originate.

### REGIONS
- Animals tagged in this region
- Animals detected by this region's stations
- Species tagged in this region
- Species detected in this region
- Stations deployed in this region
- Projects with tags deployed in this region
- Projects with stations deployed in this region
- Foreign projects with tag detections in this region.
- Number of regions from which foreign tags originate.

### SPECIES
- Animals tagged of this species
- Stations which have detected this species.
- Projects that have tagged this species.
- Regions that have detected this species.
- Regions where this species has been tagged.

### ANIMALS
- Stations visited by this animal.
- Projects that have contributed data (station projects).
- Regions where this animal has been detected.


- Number of other animals this animal was detected with.
- Number of different species this animal was detected with.
