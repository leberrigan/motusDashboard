To be completed by Nov 29, 2021
* [x] Come up with a better way to select project groups
* [x] Display project groups better
  * [x] include group summary
  * [x]   Make all tables downloadable
* [ ] Rearrange profile summary info. Move links to 'more info'

Bugs:
* [ ] Fix colour legend
* [ ] tracks map is broken
* [ ] controls hidden div has weird width in explore main
* [ ] viewing a single project with no tag deployments breaks

If there's time:
* [ ] In region summaries, detections timelines need to be differentiated in 'splitData' by using station region
    * For now multi-region summaries have all data in their timelines.
* [*] Improve reporting tool
* [ ] Add a table of detections below detection plot
* [ ] Change default map zoom on profiles to show all tracks
* [*] Tool for tag/station selections using a custom polygon
* [ ] Include taghits daily in detection database


Thoughts:
- Grouping should probably happen the same way no matter what when there are more than 3-5 selections at a time.
  - That is, it should look like 'project groups' currently does, with an grand summary of all selections and then a hidden list of those selections
  - 'Grand summary' may be useful for any number of selections greater than 1
  - Display of individual selections can be controlled via a class, such as 'greatThan3'
- Grouping stations and tags with 'project groups' vs. 'regions'
 - Overlapping regions will make it complicated when trying to make a selection.
   - Some regions will completely overlap others so we'd have to display them separately.
   - To display regions separately, they would need to be categorised (country, state/prov, kba, Motus study area, etc.)
   - If we allow for custom regions to be defined ('Motus study area'), there's potential for overlapping regions within the same category.



//////////// SQL code
 SELECT SUM( CASE WHEN n_hits >= 3 THEN CAST(n_hits AS bigint) ELSE 0 END )
  FROM [motus].[dbo].[det_taghits_runs]


///////////// Scraps
// Test Code
var stationDeps;
Promise.all([d3.csv("https://sandbox.motus.org/data/dashboard/stationDeployments?fmt=csv")]).then(function(response) {
  console.log('Responded: %o', response);
  stationDeps = response[0];
}, function (rejected) {
  console.error('Rejected: %o', rejected)
});

var projects;
Promise.all([d3.csv("https://sandbox.motus.org/data/dashboard/projects?fmt=csv")]).then(function(response) {
  console.log('Responded: %o', response);
  projects = response[0];
}, function (rejected) {
  console.error('Rejected: %o', rejected)
});

var antennaDeps;
Promise.all([d3.csv("https://sandbox.motus.org/data/dashboard/antennaDeployments?fmt=csv")]).then(function(response) {
  console.log('Responded: %o', response);
  antennaDeps = response[0];
}, function (rejected) {
  console.error('Rejected: %o', rejected)
});

var tagDeps;
Promise.all([d3.csv("https://sandbox.motus.org/data/dashboard/tagDeployments?fmt=csv")]).then(function(response) {
  console.log('Responded: %o', response);
  tagDeps = response[0];
}, function (rejected) {
  console.error('Rejected: %o', rejected)
});

var species;
Promise.all([d3.csv("https://sandbox.motus.org/data/dashboard/species?fmt=csv")]).then(function(response) {
  console.log('Responded: %o', response);
  antennaDeps = response[0];
}, function (rejected) {
  console.error('Rejected: %o', rejected)
});
