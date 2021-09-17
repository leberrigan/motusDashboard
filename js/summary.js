var detailedView = false;
var exploreProfile_hasLoaded = false;


var timeRange = {};
function exploreSummary({regionBin = "adm0_a3", summaryType = false} = {}) { // {summaryType: String, summaryID: Integer or String, summaryData: Object}

	if (summaryType) {
		dataType = summaryType;
	}
	/*
	if (!summaryID) {
		alert("No summary selected!");
		window.location.href = "explore.html#e=main&d=" + dataType;
	}*/

	var mapLegend = d3.create('div').attr("class", "explore-map-legend hidden")
																	.attr("id", "explore_map_legend");
	mapLegend.append('div')
						.attr("class", "explore-map-legend-header")
						.on('click', function(){	$(this).closest('.explore-map-legend').toggleClass('hidden');	})
							.append('span')
							.text('Map legend')
							.attr('class', 'showHide');

	if (typeof selectedRegions === "undefined") {
		motusData.selectedRegions = motusData.polygons.features.filter(x => motusFilter.regions.includes(x.properties[regionBin])).map(x => ({geometry:x.geometry, properties: x.properties, id: x.properties.adm0_a3, name: x.properties.name}));
		motusData.selectedRegions = motusData.selectedRegions.length > 0 ? motusData.selectedRegions : false;
	} else {
		motusData.selectedRegions = selectedRegions;
	}


	if (typeof selectedProjects === "undefined") {
		motusData.selectedProjects = motusData.projects.filter(x => motusFilter.projects.includes(x.id));
		motusData.selectedProjects = motusData.selectedProjects.length > 0 ? motusData.selectedProjects : false;
	} else {
		motusData.selectedProjects = selectedProjects;
	}

	if ( !['stations','species','animals'].includes(dataType) && typeof selectedAnimals === "undefined" ) {

		if (motusFilter[dataType].map(x => (motusData[ "stationDepsBy" + firstToUpper(dataType) ].get(x) !== undefined)).includes(true)) {
			motusFilter.stations = motusFilter[dataType].filter(x => (motusData[ "stationDepsBy" + firstToUpper(dataType) ].get(x) != undefined)).map(x => (motusData[ "stationDepsBy" + firstToUpper(dataType) ].get(x).map(v => v.id))).flat();
		} else { motusFilter.stations = [];}
		motusData.selectedStations = motusData.stations.filter(x => motusFilter.stations.some(d => x.stationDeps.split(',').includes(d)) );

		motusFilter.stations = motusData.selectedStations.map( x => x.id );

	} else if (typeof selectedStations !== "undefined") {
		motusFilter.stations = selectedStations;

		motusData.selectedStations = motusData.stations.filter(x => motusFilter.stations.some(d => x.stationDeps.split(',').includes(d)) );

		motusFilter.stations = motusData.selectedStations.map( x => x.id );

	} else if (dataType == 'stations') {
		if (motusFilter.stations.length == 0) {
				motusFilter.stations = motusFilter.selections;
		}
		console.log(motusFilter)
		motusData.selectedStations = motusData.stations.filter(x => motusFilter.stations.includes(x.id));

//		motusFilter.stations = motusData.selectedStations.map( x => x.id );
	//	motusData.selectedStationDeps = motusData.stationDeps.filter(x => motusFilter.stations.includes(x.id) );


	} else if ( ['species','animals'].includes(dataType) ) {
		motusData.selectedStations = [];
		motusFilter.stations = [];
	}

	motusData.selectedStationDeps = [];
	motusData.stationDeps.filter(x => motusFilter.stations.includes(x.id) ).forEach(function (x) {
		motusData.selectedStationDeps = motusData.selectedStationDeps.concat( motusData.stationDepsByName.get(x.name) );
	})

	motusFilter.stationDeps = motusData.selectedStationDeps.map(x => x.id);


//	Select Animals

	if ( !['stations','species','animals'].includes(dataType) && typeof selectedAnimals === "undefined" ) {
		if (typeof motusFilter.animals === 'undefined' || motusFilter.animals.length == 0 || motusFilter.animals.includes('all')) {
			motusFilter.animals = motusFilter[dataType]
				.filter(x => (typeof motusData[ "animalsBy" + firstToUpper(dataType) ].get(x) !== 'undefined'))
				.map(x => Array.from(motusData[ "animalsBy" + firstToUpper(dataType) ].get(x).keys())).flat().filter(onlyUnique);
		}
		motusData.selectedAnimals = motusData.animals.filter(x => motusFilter.animals.includes(x.id) );
	} else if ( typeof selectedAnimals !== "undefined" ) {
		motusFilter.animals = selectedAnimals;
		motusData.selectedAnimals = motusData.animals.filter(x => motusFilter.animals.includes(x.id) );
	} else if (dataType == 'stations') {
	//	motusData.tracksByStation = motusData.tracks
	//													.filter(d => motusFilter[dataType].includes(d.recv1) || motusFilter[dataType].includes(d.recv2));

		motusFilter.animals = motusData.selectedStations
														.map( d => d.animals.split(';') )
														.flat()
														.concat( motusData.selectedStations
																			.map(d => d.localAnimals.split(';'))
																			.flat()
																		)
														.filter(onlyUnique);

		motusData.selectedAnimals = motusData.animals.filter(x => motusFilter.animals.includes(x.id) );
														console.log(motusFilter.animals);
	} else if (dataType == 'species') {
		motusData.animalsBySpecies = d3.group(motusData.animals, d => d.species, d => d.id);

		motusData.selectedAnimals = motusFilter[dataType].map(x => (Array.from(motusData[ "animalsBy" + firstToUpper(dataType) ].get(x).values()).flat())).flat();

		motusFilter.animals = motusData.selectedAnimals.map(x => x.id).flat();

		motusData.selectedSpecies = motusData.species.filter(x => motusFilter[dataType].includes(x.id)).map(function(x){return {name: x.english, id: x.id, sort: x.sort};});


	} else if (dataType == 'animals') {

			motusData.selectedAnimals = motusData.animals.filter(x => motusFilter.animals.includes(x.id));

			selectionNames = Object.fromEntries( motusData.selectedAnimals.map(x => [x.id,motusData.speciesByID.get(x.species)[0].english]) );

	}

//	motusFilter.stations = motusFilter.regions.map(x => (motusData[ "stationDepsBy" + firstToUpper(dataType) ].get(x).map(s => s.id))).flat();

	// Get a list of region names from selected polygons
	if (typeof selectionNames === "undefined") {
		motusData.selectionNames = Object.fromEntries( motusData["selected" + firstToUpper(dataType)].map( x => [x.id, x.name] ) );
	} else {
		motusData.selectionNames = selectionNames;
	}

	if (typeof selectedAnimals === "undefined") {
	//	motusFilter.animals = [];

		if ( !['animals', 'species'].includes(dataType) ) {

			if (typeof localAnimals === "undefined") {

				// Make a array of animal IDs for all local using 'animalsByRegions'
			  motusFilter.localAnimals = [];

				if (dataType != 'stations') {

					motusFilter[dataType]
						.forEach(function(x){
							if (motusData[ "animalsBy" + firstToUpper(dataType) ].get( x )) {
								 motusFilter.localAnimals = motusFilter.localAnimals.concat(Array.from(motusData["animalsBy" + firstToUpper(dataType)].get( x ).keys()));
							}
						})
				} else {

					motusFilter.localAnimals = motusData.selectedStations.map(d => d.localAnimals.split(';')).flat()

				}
			} else {

				motusFilter.localAnimals = localAnimals;

			}

			if (typeof remoteAnimals === "undefined") {

				// Search for non-local animals in tracks to or from a local station
				motusFilter.remoteAnimals = [];
/*
				motusData.tracks
					.filter( d => motusFilter.stations.includes(d.recv1) || motusFilter.stations.includes(d.recv2) )
					.forEach(function(d) {
						motusFilter.remoteAnimals += ","+d.animal;
					});

				motusFilter.remoteAnimals = motusFilter.remoteAnimals.split(',').filter(onlyUnique).filter( x => !motusFilter.localAnimals.includes(x) );*/

			} else {
				motusFilter.remoteAnimals = remoteAnimals;
			}

			// List which regions have local animals. This is to avoid error when trying to display detection data.
			motusFilter.selectionsWithAnimals = [];
			if (dataType != 'stations') {
				motusFilter[dataType].forEach(function(x){ if ( motusData["animalsBy" + firstToUpper(dataType)].get( x ) ) { motusFilter.selectionsWithAnimals.push(x) }; });
			} else {
				motusFilter.selectionsWithAnimals = motusData.stationDeps.filter(d => d.localAnimals.length > 0).map(d => d.id).flat();
			}
			//motusFilter.animals = motusFilter.localAnimals;

		} else if (dataType == 'species') {
			motusFilter.localAnimals = motusFilter.animals;
			motusFilter.remoteAnimals = [];
		}  else if (dataType == 'animals') {
			motusFilter.localAnimals = motusFilter.animals;
			motusFilter.remoteAnimals = [];
		} else {
			alert("ERROR: animal filters not set!");
		}

	} else {
		motusFilter.animals = selectedAnimals;
	}


	// All possible combinations of region codes (for colouring tracks)** should be removed
	var selectionCombos = [];

	for (var i = 0; i < motusFilter[dataType].length - 1; i++) {
	  // This is where you'll capture that last value
	  for (var j = i + 1; j < motusFilter[dataType].length; j++) {
			selectionCombos.push( motusFilter[dataType][i] + "," + motusFilter[dataType][j ]);
	  }
	}

	// Add singles to region combos
	selectionCombos = motusFilter[dataType].concat(selectionCombos);

	// *** Above should be removed to '***'

	// Set colour scale based on number of colour combos
	if (dataType == 'regions') {
//		var colourScale = d3.scaleOrdinal().domain(['visiting'].concat(motusFilter[dataType])).range(["#000000"].concat(customColourScale.jnnnnn.slice(0, motusFilter[dataType].length + 1)));
		var colourScale = d3.scaleOrdinal().domain(['visiting'].concat(motusFilter[dataType])).range(["#000000"].concat(customColourScale.jnnnnn.slice(0, motusFilter[dataType].length + 1)));
	} else if (dataType == 'stations') {
		var colourScale = d3.scaleOrdinal().domain(['visiting'].concat(motusFilter[dataType])).range(["#000000"].concat(customColourScale.jnnnnn.slice(0, motusFilter[dataType].length)));
	} else {
		var colourScale = d3.scaleOrdinal().domain(['visiting'].concat(motusFilter[dataType])).range(["#000000"].concat(customColourScale.jnnnnn.slice(0, motusFilter[dataType].length)));
	}
	motusMap.colourScale = colourScale;

//	var colourScale = colourScale;



	// For measuring processing time
	var ts = [moment()];



	/*

		Need to add toggle buttons:
			- Detections by stations in this [region, project] only
			- Detections of animals from this [region, project] only

	*/

	/*

		Load the tracks -- this takes a while

		We could potentially speed things up if we push things to the server

	  How it works:

		1) Table with all tracks is filtered for animals selected with the motusFilter
			- The table has tracks grouped by 'route' so that the animal column must first be split into an array


	*/
	// Create some empty data objects to be populated
	motusData.tracksByAnimal = {};
	motusData.tracksBySpecies = {};
	motusData.tracksByStation = {};
	motusData.stationHits = {};
	motusData.animalsByDayOfYear = [...Array(367).fill(0).map(x => ({local: [], remote: [], visiting: []}))];
	motusData.animalsByHourOfDay = [...Array(24).fill(0).map(x => ({local: [], remote: [], visiting: []}))];

	motusData.allTimes = [];

	motusFilter.animalsDetected = [];

	motusData.selectedTracks = {}

	if (typeof selectedTracks === "undefined") {

		console.log(motusFilter.stations)

		if (!['animals', 'species'].includes(dataType)) {
			var selectedTracks = motusData.tracks.filter( d => motusFilter.stationDeps.includes(d.recv1) || motusFilter.stationDeps.includes(d.recv2) || d.animal.split(',').some( x => motusFilter.animals.includes(x) ) || d.animal.split(',').some( x => motusFilter.localAnimals.includes(x) ) );
		} else {
			var selectedTracks = motusData.tracks.filter( d => d.animal.split(',').some( x => motusFilter.animals.includes(x) ) );
		}
		console.log(selectedTracks);

		selectedTracks.forEach(function(v) {

			var dtStart = v.dtStart.split(',');
			var dtEnd = v.dtEnd.split(',');
			var tsStart = v.tsStart.split(',');
			var tsEnd = v.tsEnd.split(',');
			var allTimes = [];
			var animals = v.animal.split(',');
			var species = v.species.split(',');

			var origin = "visiting";

			if (['species', 'animals'].includes(dataType)) {

				motusFilter.stations.push(v.recv1);
				motusFilter.stations.push(v.recv2);
				var selectedRecv1 = true;
				var selectedRecv2 = true;
			} else {
				// Here I'm fixing the receiver ID's in the tracks so that they are actually station Ids
				// This should be removed and the imported data should have the correct IDs
				if ( motusFilter.stationDeps.includes(v.recv1) && !motusFilter.stations.includes(v.recv1) ) {
//					console.log("recv1 (1): ",v.recv1);
					v.recv1 = motusData.selectedStations.filter( x => x.stationDeps.split(',').includes(v.recv1) )[0].id;
	//				console.log("recv1 (2): ",v.recv1);
				}
				if ( motusFilter.stationDeps.includes(v.recv2) && !motusFilter.stations.includes(v.recv2) ) {
		//			console.log("recv2 (1): ",v.recv2);
					v.recv2 = motusData.selectedStations.filter( x => x.stationDeps.split(',').includes(v.recv2) )[0].id;
		//			console.log("recv2 (2): ",v.recv2);
				}
				var selectedRecv1 = motusFilter.stations.includes(v.recv1);
				var selectedRecv2 = motusFilter.stations.includes(v.recv2);
			}

			if (dataType == 'stations') {
				var selectedIndices = animals.map( (x,i) => motusFilter.animals.includes(x) ? i : -1 ).filter(x => x != -1);
				dtStart = dtStart.filter((x,i) => selectedIndices.includes(i));
				dtEnd = dtEnd.filter((x,i) => selectedIndices.includes(i));
				tsStart = tsStart.filter((x,i) => selectedIndices.includes(i));
				tsEnd = tsEnd.filter((x,i) => selectedIndices.includes(i));
				animals = animals.filter((x,i) => selectedIndices.includes(i));
				species = species.filter((x,i) => selectedIndices.includes(i));
				allTimes = dtStart.concat(dtEnd);
				origin = motusData.selectedStations.filter( x => x.localAnimals.split(';').some( k => animals.includes(k) ) ).map( x => x.id ).join("-");
				origin = origin.length > 0 ? origin : 'visiting';
			}

			if (selectedRecv1 || selectedRecv2) {

				if (!motusData.tracksByStation[v.recv1]) {
					motusData.tracksByStation[v.recv1] = [v.route];
				} else {
					motusData.tracksByStation[v.recv1].push(v.route);
				}
				if (!motusData.tracksByStation[v.recv2]) {
					motusData.tracksByStation[v.recv2] = [v.route];
				} else {
					motusData.tracksByStation[v.recv2].push(v.route);
				}

				motusData.nTracks += animals.length;

			}

			if ( ['projects', 'regions'].includes(dataType) ) {
				motusFilter[dataType].forEach(function(c) {
					if ( typeof motusData["animalsBy" + firstToUpper(dataType)].get( c ) !== 'undefined' &&
					 		 Array.from( motusData["animalsBy" + firstToUpper(dataType)].get( c ).keys() ).some(x => v.animal.split(',').includes(x))	) {
						origin = c;
					}
				});

			} else if ( dataType == 'stations' ) {

			}

			animals.forEach(function(x, i){

				if (motusFilter.localAnimals.includes( x )) {
					if ( !motusFilter.animalsDetected.includes( x ) ) { motusFilter.animalsDetected.push( x ); }
				  allTimes.push(dtStart[i]);
					allTimes.push(dtEnd[i]);
					if (selectedRecv1 || selectedRecv2) {
						motusData.animalsByDayOfYear[moment(dtStart[i]).dayOfYear()].local.push(x);
						motusData.animalsByDayOfYear[moment(dtEnd[i]).dayOfYear()].local.push(x);
						motusData.animalsByHourOfDay[moment(tsStart[i] * 1000).format("H")].local.push(x);
						motusData.animalsByHourOfDay[moment(tsEnd[i] * 1000).format("H")].local.push(x);
					} else {
						motusData.animalsByDayOfYear[moment(dtStart[i]).dayOfYear()].remote.push(x);
						motusData.animalsByDayOfYear[moment(dtEnd[i]).dayOfYear()].remote.push(x);
						motusData.animalsByHourOfDay[moment(tsStart[i] * 1000).format("H")].remote.push(x);
						motusData.animalsByHourOfDay[moment(tsEnd[i] * 1000).format("H")].remote.push(x);
					}
				} else {
					if (selectedRecv1 || selectedRecv2) {motusFilter.remoteAnimals.push(x);}
					if (selectedRecv1) {
						allTimes.push(dtStart[i]);
						motusData.animalsByDayOfYear[moment(dtStart[i]).dayOfYear()].visiting.push(x);
						motusData.animalsByHourOfDay[moment(tsStart[i] * 1000).format("H")].visiting.push(x);
					}
					if (selectedRecv2) {
						allTimes.push(dtEnd[i]);
						motusData.animalsByDayOfYear[moment(dtEnd[i]).dayOfYear()].visiting.push(x);
						motusData.animalsByHourOfDay[moment(tsEnd[i] * 1000).format("H")].visiting.push(x);
					}
				}

				if (motusData.tracksByAnimal[x]) {
					motusData.tracksByAnimal[x].push(v.route);
					motusData.tracksBySpecies[ species[ i ] ].push(v.route);
				} else {
					motusData.tracksByAnimal[x] = [v.route];

					if (motusData.tracksBySpecies[ species[ i ] ]) {
						motusData.tracksBySpecies[ species[ i ] ].push(v.route);
					} else {
						motusData.tracksBySpecies[ species[ i ] ] = [v.route];
					}
				}

		//		animals.push( x );

			});

			motusData.allTimes = motusData.allTimes.concat(allTimes);

//			var colourVal = dataType == 'projects' ? origin : dataType == 'regions' ? origin : dataType == 'stations' ? ( selectedRecv1 ? v.recv1 : selectedRecv2 ? v.recv2 : "other" ) : dataType == 'species' ? v.species.split(',').filter(x=>motusFilter.species.includes(x)).filter(onlyUnique).join(',') : v.animal.split(',').filter(x=>motusFilter.animals.includes(x)).join(',')
			var colourVal = ['projects','regions','stations'].includes(dataType) ? origin : dataType == 'species' ? v.species.split(',').filter(x=>motusFilter.species.includes(x)).filter(onlyUnique).join(',') : v.animal.split(',').filter(x=>motusFilter.animals.includes(x)).join(',')

			motusData.selectedTracks[v.route] = {
				animals: animals.join(','),
				species: v.species,
				type: v.type,
				recv1: v.recv1,
				recv2: v.recv2,
				projID: v.project,
				route: v.route,
				dtStart: moment(d3.min(allTimes)),
				dtEnd: moment(d3.max(allTimes)),
				dtStartList: v.dtStart,
				dtEndList: v.dtEnd,
				origin: origin,
				colourVal: colourVal,
				frequency: v.frequency,
				coordinates: [ [v.lon1, v.lat1], [v.lon2, v.lat2]],
				dist: v.dist,
				dir: v.dir,
				recvProjs: v.recvProjs
			};
		});
	} else {
		motusData.selectedTracks = selectedTracks;
	}

	if (['species', 'animals'].includes(dataType)) {
		motusFilter.visitedStationDeps = motusFilter.stations.filter(onlyUnique);
		var selectedStationNames = motusData.stationDeps.filter(x => motusFilter.stations.includes(x.id) ).map(x => x.name).flat();
		motusFilter.stations = motusData.stations.filter(x => selectedStationNames.includes(x.name)).map(x => x.stationDeps.split(',')).flat();
		motusData.selectedStations = motusData.stationDeps.filter(x => motusFilter.stations.includes(x.id) );
	} else {
		motusFilter.remoteAnimals = 	motusFilter.remoteAnimals.filter(onlyUnique);
		motusFilter.animals = motusFilter.animals.concat(motusFilter.remoteAnimals).filter(onlyUnique);
	}

	motusFilter.animalsDetected = motusFilter.animalsDetected.concat(motusFilter.remoteAnimals).filter(onlyUnique);

	motusData.selectedStationDeployments = d3.group(
		motusData.selectedStations,
		d => d.name
	);


		console.log("motusData: ", motusData);
		console.log("motusFilter: ", motusFilter);

	timeRange.min = new Date(d3.min(motusData.allTimes));
	timeRange.max = new Date(d3.max(motusData.allTimes));

	if (dtLims.min > new Date(d3.min(motusData.allTimes))) {dtLims.min = new Date(d3.min(motusData.allTimes));}
	if (dtLims.max < new Date(d3.max(motusData.allTimes))) {dtLims.max = new Date(d3.max(motusData.allTimes));}


/*

	After looping through tracks, set filters
		- "Selected Animals"

*/







		if (typeof selectedProjects === "undefined") {
			motusFilter.projects = motusData.selectedStations.map( x => x.projID ).flat().concat( motusData.selectedAnimals.map( x => x.projID ).flat() ).filter(onlyUnique);
			motusData.selectedProjects = motusData.projects.filter(x => motusFilter.projects.includes(x.id) );
		} else {
			motusFilter.projects = selectedProjects;
			motusData.selectedProjects = motusData.projects.filter(x => motusFilter.projects.includes(x.id) );
		}

//	console.log(motusData.stationHits);
	/*Array.from(motusData.selectedTracks.values()).filter(d => (motusFilter.stations.includes(d.recv1) || motusFilter.stations.includes(d.recv2))).forEach(function(d){
		regionAnimals += ","+d.animals;
	});*/
	console.log("regionAnimals: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());
	//regionAnimals = regionAnimals.substring(1).split(',').filter(onlyUnique);

	console.log("selectedTracks: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());

	//.filter(onlyUnique);

	console.log("motusMap.setVisibility(): " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());
	//console.log(regionAnimals);
	//console.log(motusData.tracksByAnimal);
	//console.log(selectedTracks);

	motusMap.setVisibility();

	//console.log(motusData.stations.filter(d => motusFilter.stations.includes(d.id)));
//	console.log("Stations: " + motusFilter.stations.length + " - Animals: " +regionAnimals.length);

				//  g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

	console.log("motusMap.regionPaths: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());

	if (!exploreProfile_hasLoaded) {
/*
		motusMap.svg.append("svg:defs").append("svg:marker")
			.attr("id", "station_path")
			.attr("refX", 25)
			.attr("refY", 10)
			.attr("markerWidth", 60)
			.attr("markerHeight", 80)
			.attr("viewBox", "0 0 40 30")
			.attr("markerUnits","userSpaceOnUse")
			.attr("orient", "auto")
			.append("path")
			.attr("d", icon_paths.stations)
			.style('pointer-events', 'auto')
			.style("stroke", "#000")
			.attr("transform", "rotate(90,15,20)");*/

		motusMap.regionPaths = motusMap.g.selectAll("regions")
			.data(motusData.polygons.features)
			.enter().append("path")
			.attr("d", motusMap.path)
			.attr('class', 'explore-map-regions leaflet-zoom-hide')
			.style('stroke', '#000')
			.style('fill', d => motusFilter.regions.includes(d.properties.adm0_a3) ? "#FFF" : "#CCC" )
			.style('stroke-width', '1px');


		motusMap.g.selectAll('stations')
			.data(motusData.stations.filter(d => !motusFilter.stationDeps.includes(d.id)))
			//.data(motusData.stations)
			.enter().append("path")
			.attr("d", motusMap.path.pointRadius(4))
			.style('stroke', '#000')
			.style('fill', '#FF0')
			.attr('id', d => "explore_map_station_" + d.id)
			.attr('class', 'explore-map-station explore-map-r2 leaflet-zoom-hide explore-map-station-other')
			//.style('fill', d => motusFilter.stations.includes(d.id) ? "#F00" : "#000")
			.style('stroke-width', '1px')
			.style('pointer-events', 'auto')
			.on('mouseover', (e,d) => motusMap.dataHover(e, d, 'in', 'station'))
			.on('mouseout', (e,d) => motusMap.dataHover(e, d, 'out', 'station'))
			.on('click', (e,d) => motusMap.dataClick(e, d, 'station'));

		var yesterday = moment().subtract(1, 'days');

		console.log(motusData.stations.filter(d => motusFilter.stations.includes(d.id)).sort((a, b) => d3.ascending(a.id, b.id)));

		motusMap.g.selectAll('stations')
			.data(motusData.stations.filter(d => motusFilter.stationDeps.includes(d.id)).sort((a, b) => d3.ascending(a.id, b.id)))
			//.data(motusData.stations)
			.enter().append("path")
		//	.attr('marker-end','url(#station_path)')
			.attr("d", motusMap.path.pointRadius(6))
		//	.attr("d", "")
			.style('stroke', '#000')
			//.style('fill', (d) => d.dtEnd > yesterday ? '#0F0' : '#F00')
			.style('fill', '#0F0')
			.attr('id', d => "explore_map_station_" + d.id)
			.attr('class', d => 'explore-map-station leaflet-zoom-hide explore-map-station-' + (d.dtEnd > yesterday ? 'active' : 'inactive') )
	//		.style('fill', d => motusFilter.stations.includes(d.id) ? "#F00" : "#000")
			.style('stroke-width', '1px')
			.style('pointer-events', 'auto')
			.on('mouseover', (e,d) => motusMap.dataHover(e, d, 'in', 'station'))
			.on('mouseout', (e,d) => motusMap.dataHover(e, d, 'out', 'station'))
			.on('click', (e,d) => motusMap.dataClick(e, d, 'station'));

		var stations_legend = mapLegend.append('svg')
				.attr('class', 'map-legend-stations')
				.attr('viewBox', `0 0 150 60`)
				.attr('width', '150')
				.attr('height', `60`);

		var g = stations_legend.append("g")
												   .attr('class', 'map-legend-stations-active selected')
													 .on('click', motusMap_legendClick);


		g.append("circle")
			.attr("cx", "10")
			.attr("cy", "15")
			.attr("r", 6)
			.style('stroke', '#000')
			.style('fill', '#0F0')
			.style('stroke-width', '1px')
			.style('pointer-events', 'auto');

		g.append("path")
			.attr('marker-end','url(#station_path)')
			.attr("d", "M10,21 L10,20")
			.style('stroke', '#000')
			.style('fill', '#F00')
			.style('stroke-width', '1px')
			.style('pointer-events', 'auto');

		g.append("text")
				.attr("x", "20")
				.attr("y", "20")
				.text("Selected station");

/*
		var g = stations_legend.append("g")
												   .attr('class', 'map-legend-stations-inactive selected')
													 .on('click', motusMap_legendClick);

		g.append("circle")
				.attr("cx", "10")
				.attr("cy", "35")
				.attr("r", 6)
				.style('stroke', '#000')
				.style('fill', '#F00')
				.style('stroke-width', '1px')
				.style('pointer-events', 'auto');

		g.append("path")
				.attr('marker-end','url(#station_path)')
				.attr("d", "M10,41 L10,40")
				.style('stroke', '#000')
				.style('fill', '#0F0')
				.style('stroke-width', '1px')
				.style('pointer-events', 'auto');

		g.append("text")
				.attr("x", "20")
				.attr("y", "40")
				.text("Inactive station");
*/

		var g = stations_legend.append("g")
												   .attr('class', 'map-legend-stations-other selected')
													 .on('click', motusMap_legendClick);

		g.append("circle")
				.attr("cx", "10")
				.attr("cy", "35")
				.attr("r", 3)
				.style('stroke', '#000')
				.style('fill', '#FF0')
				.style('stroke-width', '1px')
				.style('pointer-events', 'auto');

		g.append("text")
				.attr("x", "20")
				.attr("y", "40")
				.text("Other station");


		motusMap.stationPaths = motusMap.g.selectAll('.explore-map-station')

		if (motusData.selectedRegions) {

			motusMap.regionBounds = d3.geoPath().bounds({features:motusData.selectedRegions, type: "FeatureCollection"});

			motusMap.map.fitBounds( [ [motusMap.regionBounds[0][1], motusMap.regionBounds[0][0]], [motusMap.regionBounds[1][1], motusMap.regionBounds[1][0]]]);
		} else if (dataType == 'stations' ){

			if (motusData.selectedStations.length == 1) {

				motusData.selectionBounds = motusData.selectedStations[0].geometry.coordinates;
				console.log(motusData.selectionBounds)
				motusMap.map.setView(  [motusData.selectionBounds[1], motusData.selectionBounds[0]], 9);

			} else { // If there are more than one points, get the extent of the bounds and fit them.

				var lats = motusData.selectedStations.map( x => x.geometry.coordinates[1]);
				var lons = motusData.selectedStations.map( x => x.geometry.coordinates[0]);
				motusData.selectionBounds = [ d3.extent(lons), d3.extent(lats)];
				console.log(motusData.selectionBounds)
				motusMap.map.fitBounds( [ [motusData.selectionBounds[1][0], motusData.selectionBounds[0][0]], [motusData.selectionBounds[1][1], motusData.selectionBounds[0][1]]]);

			}

		}
		//	alert(1);
		//console.log(regionCombos);

		setProgress(75);

		var colourBy = dataType == 'stations' ? 'recv1' : dataType == 'species' ? 'species' : "origin"

		console.log("motusMap.trackPaths: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());
		motusMap.trackPaths = motusMap.g.selectAll("tracks")
		//	.data(trackDataLink)
			.data(Object.values(motusData.selectedTracks))
		//	.data(Array.from(motusData.selectedTracks.values()).filter(d => (motusFilter.stations.includes(d.recv1) || motusFilter.stations.includes(d.recv2))))
			.enter().append("path")
			.attr('class', (d) => "explore-map-track explore-map-species leaflet-zoom-hide " + d.colourVal.split(',').map( x => "explore-map-track-" + ( x.toLowerCase() ) ).join(" ") )
			.attr("id", (d) => "explore-map-track-" + d.route.replace('.','-'))
			.style('stroke', (d) => colourScale(d.colourVal))
	//		.style('stroke', (d) => (d.origin == 'local' ? colourScale.range()[1] :  colourScale.range()[0] ))
			.style('pointer-events', 'auto')
			.style('stroke-width', '3px')
			.attr("d", motusMap.path)
			.on('mouseover', (e,d) => motusMap.dataHover(e, d, 'in', 'track'))
			.on('mouseout', (e,d) => motusMap.dataHover(e, d, 'out', 'track'))
			.on('click', (e,d) => motusMap.dataClick(e, d, 'track'));

		var h = 20;

		mapLegend.append('div')
			.style('font-weight','bold')
			.text('Tagging location')

		var tracks_svg = mapLegend.append("svg")
			.attr('class','map-legend-tracks');

		var max_length = 0;
		console.log(motusMap.colourScale.domain());
		console.log(colourScale.domain());

		motusMap.colourScale.domain().forEach(function(x, i) {

			var selectionColour = motusMap.colourScale.range()[i];
			var selectionName = x == "remote" || x == 'other' || x == 'visiting' ? firstToUpper( x ) : motusData.selectionNames[ x ];

			var g = tracks_svg.append("g");


			g.append("path")
				.attr("d", `M0,${10 + (i * h)} L30,${10 + (i * h)}`)
				.style('stroke', selectionColour )
				.style('stroke-width', '3px')
				.style('pointer-events', 'auto');


			g.append("text")
				.attr("x", 40)
				.attr("y", h * ( i + 0.75 ) )
				.text( selectionName )
				.style('pointer-events', 'auto');

			var len = $("<div class='get-text-size'></div>").appendTo("body").css('font-size', '14pt').text( selectionName ).width();

			max_length = max_length < len ? len : max_length;

			g.attr("class","map-legend-track-" + x + " selected")
				.style('pointer-events', 'auto')
				.on('click', motusMap_legendClick);

		});

		tracks_svg.attr('viewBox', `0 0 ${50 + max_length} ${motusMap.colourScale.domain().length * h}`)
			.attr('width', 50 + max_length)
			.attr('height', motusMap.colourScale.domain().length * h);


		motusMap.map.on("zoomend", motusMap.reset);


		// Reposition the SVG to cover the features.
		motusMap.reset();
	}
	var countryByTrack = {};

	setProgress(90);

	console.log("regionNames.forEach[0]: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());

	motusData[`selected${firstToUpper(dataType)}`].forEach(function(d) {

		var profile = {
			id: d.id,
			name: d.name
		}
		console.log("Profile %s: %s", profile.id, profile.name);

		console.log(d);

function tempFunction(){}

		if (dataType == 'stations') {
			var station = d;
			var stationDeps = motusData.selectedStationDeps.filter( x => d.stationDeps.split(';').includes(x.id) );
					stationDeps.forEach( x => {x.dtStart = new Date(x.dtStart)});

			var detections = Object.values( motusData.selectedTracks ).filter( x => motusData.tracksByStation[ d.id ].includes( x.route ) );

			var animalsDetected = motusData.selectedAnimals.filter( x => d.animals.split(';').includes(x.id) );
			var speciesDetected = d.species.split(';').filter(onlyUnique);
			var project = motusData.projects.filter(x => x.id == d.projID)[0];

			// Latest activity

			var lastDataProcessed = d.dtEnd;

			// Why is this so complicated? Because we have nested data within each 'detection'
			// Each detection is actually a track segment with a list of events within it.
			// Further, route ID contains the two receiver IDs which make the connection, with the smaller number first
			// This way I can group tracks in either direction together. However,
			// This also means I must pay attention to the direction when looking
			// At the dates since whether I use the start or end dates will depend on the direction.
			// The function below loops through each event and selects either the start or end dates based on
			// the direction and which receiver ID matches.
			var lastDetectionSubIndex = [];
			var dtMax = [];
			var lastDetectedAnimal = [];
			console.log(detections)
			var lastDetectionIndex = detections.length > 0 ? d3.maxIndex( detections, (x) => {
					const dir = x.dir.split(',');
					const recvs = x.route.split('.');
					const maxDate = dir.reduce( (a, dir, i) => {
							if ((dir == -1 && recvs[0] == d.id) ||
									(dir == 1 && recvs[1] == d.id)) {
								a.push(x.dtEndList.split(',')[i]);
							}
							else if ((dir == 1 && recvs[0] == d.id) ||
											 (dir == -1 && recvs[1] == d.id)) {
								a.push(x.dtStartList.split(',')[i])
							}
							return a;
						}, []);
					const maxIndex = d3.maxIndex(maxDate, x => new Date(x))
					dtMax.push( new Date( maxDate[maxIndex] ) );
					lastDetectedAnimal.push( motusData.animals.filter( k => k.id == x.animals.split(',')[maxIndex] )[0] );
					lastDetectionSubIndex.push( maxIndex );
					return new Date( maxDate[maxIndex] );
				} ) : false;
			var lastDetection = detections.length > 0 ? detections[lastDetectionIndex] : false;

			//console.log("lastDetection: %o, lastDetectionIndex: %s, lastDetectionSubIndex: %s, dtMax: %s", lastDetection, lastDetectionIndex, lastDetectionSubIndex, dtMax);
			console.log(dtMax);

			if (lastDetection) {
						lastDetectionSubIndex = lastDetectionSubIndex[lastDetectionIndex];
						console.log(lastDetectionSubIndex);
						lastDetection.lastDetectedAnimal = [lastDetectedAnimal[lastDetectionIndex]];
						lastDetection.dtMax = dtMax[lastDetectionIndex].toISOString().substring(0, 10);

/*

				var lastDetectionIndex = [];

				lastDetection.lastDetectedAnimal = [];
				lastDetection.dir.split(',').forEach( (dir, i) => {
					const recvs = lastDetection.route.split('.');
						if (((dir == -1 && recvs[0] == d.id) ||
								(dir == 1 && recvs[1] == d.id)) &&
								lastDetection.dtEndList.split(',')[i] == dtMax) {

							lastDetection.lastDetectedAnimal.push( motusData.animals.filter( k => k.id == lastDetection.animals.split(',')[i] )[0] );
							lastDetectionIndex.push(i);
						} else if (((dir == 1 && recvs[0] == d.id) ||
										 (dir == -1 && recvs[1] == d.id)) &&
			 								lastDetection.dtStartList.split(',')[i] == dtMax) {

							lastDetection.lastDetectedAnimal.push( motusData.animals.filter( k => k.id == lastDetection.animals.split(',')[i] )[0] );
							lastDetectionIndex.push(i);

						}
				});
*/
				//lastDetection.lastDetectionIndex = lastDetectionIndex;

			}
			var lastStationDeployment = stationDeps.length > 1 ? stationDeps[d3.maxIndex( stationDeps, x => x.dtStart )] : stationDeps[0];
			var lastActivityIndex = d3.maxIndex([lastStationDeployment?lastStationDeployment.dtStart:-1, lastDetection?lastDetection.dtEnd:-1]);


		} else if (["regions", "projects"].includes(dataType)){

			var dataVar = dataType == "projects" ? "projID" : "country";


			//	Deployments


			var stations = motusData.selectedStations.filter( x => x[dataVar] == d.id);

			var	animalsTagged = motusData.selectedAnimals.filter( x => x[dataVar] == d.id);

			animalsTagged.forEach(x=>{x.dtStart = new Date(x.dtStart); x.dtEnd = new Date(x.dtEnd);});

			var	speciesTagged = animalsTagged.map( (x) => x.species ).filter( onlyUnique );

			// 	Detections

			var	animalsDetected = stations.length > 0 ?
															stations.map( x => x.animals.split(';') ).flat().filter(onlyUnique) :
															[];

			var	speciesDetected = stations.length > 0 ?
															stations.map( x => x.species.split(';') ).flat().filter(onlyUnique) :
															[];
			// Station detections
			var tracksByStations = stations.map( (x) => motusData.tracksByStation[ x.id ] ).flat().filter(onlyUnique);

			var detections = Object.values( motusData.selectedTracks ).filter( x => tracksByStations.includes( x.route ) );
			// Tag detections
//			var detections = Object.values( motusData.selectedTracks ).filter( x => x.projID.split(',').includes( d.id ) );
			var tracksByAnimals = animalsTagged.map( (x) => motusData.tracksByAnimal[ x.id ] ).flat().filter(onlyUnique);

			var animalDetections = Object.values( motusData.selectedTracks ).filter( x => tracksByAnimals.includes( x.route ) );


			// Last activity

			var lastActiveTag = animalsTagged.length > 0 ? d3.max( animalsTagged, x => x.dtEnd ) : false;
			var lastActiveStation = stations.length > 0 ? d3.max( stations, x => x.dtEnd ) : false;
		//	var lastDetection = detections.length > 0 ? detections[d3.maxIndex( detections, x => x.dtEnd )] : false;
			var lastDetection = detections.length > 0 ? detections[d3.maxIndex( detections, (x) => {
					const dir = x.dir.split(',');
					const recvProjs = x.recvProjs.split(',');
					const maxDate = dir.reduce( (a, dir, i) => {
							if ((dir == -1 && recvProjs[0] == d.id) ||
									(dir == 1 && recvProjs[1] == d.id)) {
								a.push(x.dtEndList.split(',')[i]);
							}
							else if ((dir == 1 && recvProjs[0] == d.id) ||
											 (dir == -1 && recvProjs[1] == d.id)) {
								a.push(x.dtStartList.split(',')[i])
							}
							return a;
						}, []);
					return d3.max(maxDate, x => new Date(x));
				} )] : false;

			const dtMax = detections.length > 0 ? d3.max( detections, (x) => {
					const dir = x.dir.split(',');
					const recvProjs = x.recvProjs.split(',');
					const maxDate = dir.reduce( (a, dir, i) => {
							if ((dir == -1 && recvProjs[0] == d.id) ||
									(dir == 1 && recvProjs[1] == d.id)) {
								a.push(x.dtEndList.split(',')[i]);
							}
							else if ((dir == 1 && recvProjs[0] == d.id) ||
											 (dir == -1 && recvProjs[1] == d.id)) {
								a.push(x.dtStartList.split(',')[i])
							}
							return a;
						}, []);
					return d3.max(maxDate, x => new Date(x));
				}).toISOString().substring(0, 10) : false;

			console.log(lastDetection);
			console.log(dtMax);

			if (lastDetection) {

				var lastDetectionIndex = [];

				lastDetection.lastDetectedAnimal = [];
				lastDetection.dir.split(',').forEach( (dir, i) => {
					const recvProjs = lastDetection.recvProjs.split(',');
						if (((dir == -1 && recvProjs[0] == d.id) ||
								(dir == 1 && recvProjs[1] == d.id)) &&
								lastDetection.dtEndList.split(',')[i] == dtMax) {

							lastDetection.lastDetectedAnimal.push( motusData.animals.filter( k => k.id == lastDetection.animals.split(',')[i] )[0] );
							lastDetectionIndex.push(i);
						} else if (((dir == 1 && recvProjs[0] == d.id) ||
											 (dir == -1 && recvProjs[1] == d.id)) &&
			 								lastDetection.dtStartList.split(',')[i] == dtMax) {

							lastDetection.lastDetectedAnimal.push( motusData.animals.filter( k => k.id == lastDetection.animals.split(',')[i] )[0] );
							lastDetectionIndex.push(i);

						}
				});

				const lastDetectionStation = lastDetection.recvProjs.split(',')[1] == d.id && (lastDetection.recvProjs.split(',')[0] != d.id || lastDetection.dir.split(',')[lastDetectionIndex[0]] == 1) ? lastDetection.recv2 : lastDetection.recv1;
				lastDetection.lastDetectionIndex = lastDetectionIndex;
				lastDetection.lastDetectionStation = motusData.selectedStations.filter(x => {
					return x.stationDeps.split(',').includes(lastDetectionStation);
				})[0];

			}
			var lastTagDeployment = animalsDetected.length > 0 ? animalsTagged[d3.maxIndex( animalsTagged, x => x.dtStart )] : false;
			var lastStationDeployment = stations.length > 0 ? stations[d3.maxIndex( stations, x => x.dtStart )] : false;
			if (lastStationDeployment) {
				lastStationDeployment.status = lastStationDeployment.status == 'not active' ? 'inactive' : lastStationDeployment.status;
			}
			var lastActivityIndex = d3.maxIndex([lastTagDeployment?lastTagDeployment.dtStart:-1, lastStationDeployment?lastStationDeployment.dtStart:-1, lastDetection?lastDetection.dtEnd:-1]);

		} else {

			var stations = motusData.selectedStations.filter( (x) => x[dataType].split(';').includes(d.id) );

			var detections = Object.values( motusData.selectedTracks ).filter( (x) => x[dataType].split(',').includes(d.id) );

			if (dataType == 'animals'){

			 var animals = motusData.selectedAnimals.filter( x => x.id == d.id)[0];
			 var species = motusData.speciesByID.get(animals.species)[0];//motusFilter.species;
			 var project = motusData.projects.filter(x => x.id == d.projID)[0];

		 } else { // dataType == 'species'

			 var species = motusData.speciesByID.get(d.id)[0];
			 var animals = species.animals.split(',');

		 }
	 }

	  if (dataType == 'stations') {

			profile.summary = {
				animalsDetected: animalsDetected,
				speciesDetected: speciesDetected,
				projects: animalsDetected.map(x => x.projID).filter(onlyUnique),
				countries: animalsDetected.map(x => x.country).filter(onlyUnique),
				detections: detections
			}

			profile.coordinates = d.geometry.coordinates;
			profile.frequency= d.frequency;
			profile.project = project;

			profile.status = d.status=='not active'?'inactive':d.status;

			profile.lastStationDeployment = lastStationDeployment;
			profile.lastDetection = lastDetection;
			profile.lastActivity = [lastStationDeployment, lastDetection][lastActivityIndex];
			profile.lastActivityType = ["Station deployed", "Tag detected"][lastActivityIndex];

			profile.dtStart = d.dtStart;
			profile.dtEnd = d.dtEnd;

		} else if (dataType == 'regions') {

			profile.summary = {
				animalsTagged: animalsTagged.length,
				speciesTagged: speciesTagged.length,
				animalsDetected: motusData.selectedStationDeployments.size > 0 ? animalsDetected.length : 0,
				speciesDetected: motusData.selectedStationDeployments.size > 0 ? speciesDetected.length : 0,
				projects: Array.from(stations.map(x => x.projID).values()).concat(Array.from(animalsTagged.map(x => x.projID).values())).filter(onlyUnique).length,
				stations: stations.length,
				detections: detections
			}

			//	lastData: [Math.round( subset[subset.length-1].lastData )],
		} else if (dataType == 'projects')  {
			profile.subtitle = {text:`Created on ${new Date(d.created_dt).toISOString().substring(0, 10)}`, link: false};

			profile.leadUserId = d.lead_user_id;
			profile.group = d.fee_id;
			profile.lastTagDeployment = lastTagDeployment;
			profile.lastStationDeployment = lastStationDeployment;
			profile.lastDetection = lastDetection;
			profile.lastActivity = [lastTagDeployment, lastStationDeployment, lastDetection][lastActivityIndex];
			profile.lastActivityType = ["Animal tagged", "Station deployed", "Tag detected"][lastActivityIndex];
			profile.status = (new Date() - profile.lastActivity) < (24 * 60 * 60 * 1000) ? "Active" : "Inactive";
			profile.shortDescription = d.description_short;
			profile.description = d.description;

			profile.dtStart = new Date(d.created_dt).toISOString().substring(0, 10);
			profile.dtEnd = profile.lastActivity.dtEnd;

			profile.summary = {
				animalsTagged: animalsTagged.length,
				animalsDetected: stations.length > 0 ? animalsDetected.length : 0,
				stations: stations.length
			}

			profile.stats = {
				animalsTagged: animalsTagged.length,
				speciesTagged: speciesTagged.length,
				animalsDetected: stations.length > 0 ? animalsDetected.length : 0,
				speciesDetected: stations.length > 0 ? speciesDetected.length : 0,
				stations: stations.length,
				countries: Array.from(stations.map(x => x.country).values()).concat(Array.from(motusData.selectedAnimals.map(x => x.country).values())).filter(onlyUnique).length,
				detections: d3.sum(detections.map( x=> x.dtEndList.split(',').length ))
			}

		} else if (dataType == 'species') {

			profile.subtitle = {text:species.scientific, link: false};
			profile.description = devText;
	/*
			profile.inaturalist = `https://www.inaturalist.org/taxa/${encodeURIComponent(species.scientific)}`;
			profile.iucnRedList = `https://apiv3.iucnredlist.org/api/v3/website/${encodeURIComponent(species.scientific)}`;
			profile.ebird = (motusData.speciesByID.get(d.id)[0].group == 'BIRDS' ? '' : false);
*/
			var conservationStatusRandom = Object.keys(conservationStatus)[Math.round(Math.random()*(Object.keys(conservationStatus).length-5))];

			profile.summary = {
				AnimalsTagged: animals,
				Stations: stations,
				Projects: Array.from(stations.map(x => x.projID).values()).concat(Array.from(motusData.selectedAnimals.map(x => x.projID).values())).filter(onlyUnique),
				Countries: Array.from(stations.map(x => x.country).values()).concat(Array.from(motusData.selectedAnimals.map(x => x.country).values())).filter(onlyUnique),
				Detections: detections,
				"iNaturalist": `<a href='https://www.inaturalist.org/taxa/${encodeURIComponent(species.scientific)}' target="_blank"><img src='images/inaturalist_logo_sm.png' alt='iNaturalist Logo'></a>`,
				"IUCN Red List": `<a href='https://apiv3.iucnredlist.org/api/v3/website/${encodeURIComponent(species.scientific)}' target="_blank" class='explore-status-conservation explore-conservation-${conservationStatusRandom} tips' alt='${conservationStatus[conservationStatusRandom]}'>${conservationStatusRandom}</a>`,
				"eBird": (motusData.speciesByID.get(d.id)[0].group == 'BIRDS' ? `<a href='https://www.allaboutbirds.org/guide/${encodeURIComponent(species.english.replace(' ', '_'))}' target="_blank"><img src='images/eBird_logo.png' alt='eBird Logo'></a>` : false)
			}

			profile.status = motusData.selectedAnimals.filter(x => x.species == d.id).reduce((a,c) => {var status = a;if (c.status=='active') {status='active'}return status;}, "inactive");

		} else { // dataType == 'animals' ?

			var conservationStatusRandom = Object.keys(conservationStatus)[Math.round(Math.random()*(Object.keys(conservationStatus).length-5))];

			profile.subtitle = {text:species.scientific, link: false};
			profile.coordinates = d.geometry.coordinates;
			profile.frequency= d.frequency;
			profile.project = project;
			profile.status = d.status;
			profile.name = species.english;
			profile.description = devText;

			profile.dtStart = d.dtStart;
			profile.dtEnd = d.dtEnd;

			profile.summary = {
				stations: stations,
				projects: Array.from(stations.map(x => x.projID).values()).concat(Array.from(motusData.selectedAnimals.map(x => x.projID).values())).filter(onlyUnique),
				countries: Array.from(stations.map(x => x.country).values()).concat(Array.from(motusData.selectedAnimals.map(x => x.country).values())).filter(onlyUnique),
				detections: detections,
				"iNaturalist": `<a href='https://www.inaturalist.org/taxa/${encodeURIComponent(species.scientific)}' target="_blank"><img src='images/inaturalist_logo_sm.png' alt='iNaturalist Logo'></a>`,
				"IUCN Red List": `<a href='https://apiv3.iucnredlist.org/api/v3/website/${encodeURIComponent(species.scientific)}' target="_blank" class='explore-status-conservation explore-conservation-${conservationStatusRandom} tips' alt='${conservationStatus[conservationStatusRandom]}'>${conservationStatusRandom}</a>`,
				"eBird": (motusData.speciesByID.get(d.species)[0].group == 'BIRDS' ? `<a href='https://www.allaboutbirds.org/guide/${encodeURIComponent(species.english.replace(' ', '_'))}' target="_blank"><img src='images/eBird_logo.png' alt='eBird Logo'></a>` : false)
			}

		}

		if (!exploreProfile_hasLoaded) {

			console.log(profile);

			profile.photo = dataType == 'species' || dataType == 'animals' ?
										"photos/species/" + ( speciesPhotos.filter( x => x.includes(species.english.toLowerCase()) ).length > 0 ? speciesPhotos.filter( x => x.includes(species.english.toLowerCase()) )[0] : speciesPhotos[Math.round(Math.random()*(speciesPhotos.length-1))] ) :
									dataType == 'stations' ?
										"photos/stations/" + ( stationPhotos.filter( x => x.includes(station.name.toLowerCase()) ).length > 0 ? stationPhotos.filter( x => x.includes(station.name.toLowerCase()) )[0] : stationPhotos[Math.round(Math.random()*(stationPhotos.length-1))] ) :
//										"photos/stations/" + (stationPhotos[Math.round(Math.random()*(stationPhotos.length-1))]) :
									"";

			addExploreProfile(profile);
		}

	});


//	Object.entries(motusData.selectionNames).forEach(function(a) {
	/*[].forEach(function(a) {

		var k = a[0];
		var v = a[1];

		if (dataType == 'stations') {
			var station = motusData.selectedStations.filter( x => x.id == k)[0];//motusData[ "stationDepsBy" + firstToUpper(dataType) ].get(k);
			var detections = Object.keys(motusData.selectedTracks).length;
		} else if (["regions", "projects"].includes(dataType)){
			var stations = motusData[ "stationDepsBy" + firstToUpper(dataType) ].get(k);
			var detections = Object.keys(motusData.selectedTracks).length;
		} else {
			var stations = motusData.selectedStations.filter( (x) => x[dataType].split(';').includes(k) );
			var detections = Object.values( motusData.selectedTracks ).filter( (x) => x[dataType].split(',').includes(k) ).length;

		}

		stations = typeof stations === 'undefined' ? [] : stations;

		var routes = Array.from(stations.map(x => x.id).values()).map(x => motusData.tracksByStation[x]).flat().filter(x=>typeof x !== 'undefined');

		var animalsTagged = [],
				animalsDetected = [],
				speciesTagged = [],
				speciesDetected = [];

		if (motusData[ "animalsBy" + firstToUpper(dataType) ] && motusData[ "animalsBy" + firstToUpper(dataType) ].get(k)) {

			animalsTagged = motusFilter.localAnimals.filter((x) => motusData[ "animalsBy" + firstToUpper(dataType) ].get(k).get(x));

			speciesTagged = motusData.animals.filter( (x) => motusFilter.localAnimals.includes( x.id ) ).map( (x) => x.species ).filter( onlyUnique );

			animalsDetected = motusFilter.animalsDetected;//.filter((x) => motusData[ "animalsBy" + firstToUpper(dataType) ].get(k).get(x));

			speciesDetected = motusData.animals.filter( (x) => motusFilter.animalsDetected.includes( x.id ) ).map( (x) => x.species ).filter( onlyUnique );

		} else if (dataType == 'stations') {

			animalsDetected = motusData.selectedStations.map(d => d.animals.split(',')).flat();

			speciesDetected = motusData.selectedStations.map(d => d.species.split(',')).flat();

		} else if (dataType == 'animals'){

			var animals = motusData.selectedAnimals.filter( x => x.id == k)[0];
			var species = animals.species;//motusFilter.species;

		} else { // dataType == 'species'

			var species = motusData.speciesByID.get(k);
			var animals = species.animals.split(',');

		}

	//	console.log(Array.from( animals.map( (x) => motusData[ "animalsBy" + firstToUpper(dataType) ].get(k).get(x)[0].).values() ));
		routes.forEach(function(x) {
			if (((typeof countryByTrack[x] === 'undefined') || (countryByTrack[x] === k))) {
				countryByTrack[x] = k;
			} else {
				countryByTrack[x] = (countryByTrack[x] + ',' + k).split(',').sort(d3.ascending).join(',')
			}
		});

	var profile = {};

		if (dataType == 'regions') {
			profile.summary = {
				animalsTagged: [ animalsTagged.length ],
				speciesTagged: [ speciesTagged.length ],
				animalsDetected: [ motusData.selectedStationDeployments.size > 0 ? animalsDetected.length : 0 ],
				speciesDetected: [ motusData.selectedStationDeployments.size > 0 ? speciesDetected.length : 0 ],
				projects: [Array.from(stations.map(x => x.projID).values()).concat(Array.from(animalsTagged.map(x => x.projID).values())).filter(onlyUnique).length],
				stations: [ stations.length ],
				detections: [ detections ]
			}
			//	lastData: [Math.round( subset[subset.length-1].lastData )],
		} else if (dataType == 'projects')  {
			profile.summary = {
				animalsTagged: [ animalsTagged.length ],
				speciesTagged: [ speciesTagged.length ],
				animalsDetected: [ motusData.selectedStationDeployments.size > 0 ? animalsDetected.length : 0 ],
				speciesDetected: [ motusData.selectedStationDeployments.size > 0 ? speciesDetected.length : 0 ],
				stations: [ stations.length ],
				countries: [Array.from(stations.map(x => x.country).values()).concat(Array.from(motusData.selectedAnimals.map(x => x.country).values())).filter(onlyUnique).length],
				detections: [ detections ]
			}
		} else if (dataType == 'stations') {
			profile.summary = {
				animalsDetected: [ animalsDetected.length ],
				speciesDetected: [ speciesDetected.length ],
				projects: [Array.from(stations.map(x => x.projID).values()).concat(Array.from(motusData.selectedAnimals.map(x => x.projID).values())).filter(onlyUnique).length],
				countries: [Array.from(stations.map(x => x.country).values()).concat(Array.from(motusData.selectedAnimals.map(x => x.country).values())).filter(onlyUnique).length],
				detections: [ detections ],
				status: station.status,
				owner: station.projID,
				frequency: station.frequency,
				coordinates: station.geometry.coordinates
			}
		} else if (dataType == 'species') {
			profile.summary = {
				animalsTagged: animals.length,
				stations: stations.length,
				projects: Array.from(stations.map(x => x.projID).values()).concat(Array.from(motusData.selectedAnimals.map(x => x.projID).values())).filter(onlyUnique).length,
				countries: Array.from(stations.map(x => x.country).values()).concat(Array.from(motusData.selectedAnimals.map(x => x.country).values())).filter(onlyUnique).length,
				detections: detections,
				inaturalist: `https://www.inaturalist.org/taxa/${encodeURIComponent(species.scientific)}`,
				iucnRedList: `https://apiv3.iucnredlist.org/api/v3/website/${encodeURIComponent(species.scientific)}`,
				ebird: (motusData.speciesByID.get(k)[0].group == 'BIRDS' ? '' : false),
				about: devText
			}
		} else { // dataType == 'animals' ?
			profile.summary = {
				species: species,
				stations: stations.length,
				projects: Array.from(stations.map(x => x.projID).values()).concat(Array.from(motusData.selectedAnimals.map(x => x.projID).values())).filter(onlyUnique).length,
				countries: Array.from(stations.map(x => x.country).values()).concat(Array.from(motusData.selectedAnimals.map(x => x.country).values())).filter(onlyUnique).length,
				detections: detections,
				inaturalist: `https://www.inaturalist.org/taxa/${encodeURIComponent(motusData.speciesByID.get(species)[0].scientific)}`,
				iucnRedList: `https://apiv3.iucnredlist.org/api/v3/website/${encodeURIComponent(motusData.speciesByID.get(species)[0].scientific)}`
			}
			profile.name = animal.name;
			profile.status = animal.status;
		}
		if (!exploreProfile_hasLoaded) {
			console.log(status);
			profile.photo = dataType == 'species' || dataType == 'animals' ?
										"photos/species/" + ( speciesPhotos.filter( x => x.includes(motusData.speciesByID.get(species)[0].english.toLowerCase()) ) ? speciesPhotos.filter( x => x.includes(motusData.speciesByID.get(species)[0].english.toLowerCase()) )[0] : speciesPhotos[Math.round(Math.random()*(speciesPhotos.length-1))] ) :
									dataType == 'stations' ?
										"photos/stations/" + ( stationPhotos.filter( x => x.includes(station.name.toLowerCase()) ) ? stationPhotos.filter( x => x.includes(station.name.toLowerCase()) )[0] : stationPhotos[Math.round(Math.random()*(stationPhotos.length-1))] ) :
//										"photos/stations/" + (stationPhotos[Math.round(Math.random()*(stationPhotos.length-1))]) :
									"";
			profile = {...{
												id: k,
												name: v,
												summary: {}
											},
										...profile
									};
			addExploreCard(profile);
		}
	});*/
	console.log("Map controls: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());

	var explore_legend = $("<div class='explore-legend' id='explore_legend'></div>");

	colourScale.domain().forEach(function(x){

		var div = explore_legend.append( "<div></div>" );
		div.append( `<div class='explore-legend-icon' style='border-color:${colourScale(x)}'></div>` );
		div.append( `${x=='remote'?x:motusData.selectionNames[x]}` );

	});



	if (!exploreProfile_hasLoaded) {
		addExploreCard({data:"add"});
		//$(".explore-card-profiles-tabs").before(explore_legend);
		$('#explore_map').parent().before($('#explore_card_profiles'));

		$('#explore_map').before("<div class='explore-map-controls'></div>")
		//$('#explore_map').before("<div class='explore-map-controls'>Map legend <input type='button' value='Hide tracks-local'><input type='button' value='Hide tracks-remote'><input type='button' value='Hide stations'><input type='button' value='Hide regions'></div>")
		console.log(mapLegend);
		d3.select(".explore-map-controls").append(()=>mapLegend.node());

		$(".explore-map-controls input[type=button]").click(function(){
			var toggleEls = this.value.toLowerCase().split(' ');
			motusMap.setVisibility(false, toggleEls);
			this.value = (toggleEls[0] == 'hide' ? 'Show' : 'Hide') + " " + toggleEls[1];
		});



	}

	$("#explore_card_profiles").toggleClass('simple-card', !detailedView);

	exploreProfile_hasLoaded = true;

	function motusMap_legendClick() {

		var toggleEls = [
			(this.classList.contains('selected') ? "hide" : "show"),
			 (this.classList[0].split('-')[2] + "-" + this.classList[0].split('-')[3]).toLowerCase()
		 ];

		console.log(toggleEls);

		motusMap.setVisibility(false, toggleEls);

		$(this).toggleClass( 'selected', !this.classList.contains('selected') );

	}

			/*


				Stations


			*/
		if (dataType != 'stations') {
			console.log("Stations: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());

			var tabName = "Stations " +
					(
						dataType != 'species' && dataType != 'animals' ? 'in this ' + dataType.substring(0, dataType.length - 1) :
						"visited by this " + (dataType != 'species' ? 'animal' : dataType)
					);

			//	Add the card dom element to contain the chart
			addExploreCard({
					data:'tabs',
					type:'stationHits',
					header: 'Stations',
					tabs: {
						[`${tabName}`] : stationTable
						//"Station detection timelines": stationTimeline
					},
					defaultTab: 0,
					attachEl:".explore-card-map",
					attachMethod:"after"
				});

			setProgress(70);
		}
			/**********************************************
												Animals
			**********************************************/

			console.log("Animals: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());

			//	Add the card dom element to contain the chart
		//	addExploreCard({data:'chart', type:'tagHits'});


		if (motusFilter.animals.length > 0) {

			addExploreCard({
					data:'tabs',
					type:'tagHits',
					header: 'Detections',
					tabs: {
					//	"Animals in this region": animalTable,,
						"Detections by Hour of Day": animalHourlyTimeline,
						"Detections by Month of Year": animalTimeline
					},
					defaultTab: 0,
					attachEl: ".explore-card-map",
					attachMethod: "after"
				});

			addExploreCard({
					data:'tabs',
					type:'speciesHits',
					header: 'Animals',
					icon: icons.species,
					tabs: {
						[(["animals", "species"].includes(dataType) ? "Species Tagged" : "Species detected")] : speciesTable,
						[(["animals", "species"].includes(dataType) ? "Tagged Animals" : "Animals detected")] : animalsTable
					},
					defaultTab: 0,
					attachEl: ".explore-card-map",
					attachMethod: "after"
				});
			//	Add the timeline
		//	animalTimeline()

		}


		addExploreCard({
				data:'tabs',
				type:'projectsTable',
				header: 'Projects',
				tabs: {
				//	"Animals in this region": animalTable,
					"Projects with stations": function(cardID) {projectsTable(cardID, 'stations');},
					"Projects with tag deployments" : function(cardID) {projectsTable(cardID, 'tags');}
				},
				defaultTab: 0,
				attachEl: ".explore-card-map",
				attachMethod: "after"
			});
	/*

		Finish up

	*/

	console.log("Finish up: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());

	//addExploreCard({data:'custom',type:'options',html:toAppend,attachEl:".explore-card-map",attachMethod:"after"});

	motusFilter.default = motusFilter;

	motusFilter.selections = motusFilter.selections === undefined ? motusFilter[dataType] : motusFilter.selections;

	setCardColours( colourScale )

	motusFilter.animals = ['all'];
	motusFilter.stations = ['all'];
	motusFilter.projects = ['all'];
	motusFilter.species = ['all'];
//	updateURL();

	motusMap.setVisibility();
	console.log("End: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());

	setProgress(100);

	/*

		Functions

	*/

	function projectsTable( cardID, tableType ) {

		console.log("Loading %s - %s", cardID, tableType)

		$(`#explore_card_${cardID} .explore-card-${cardID}-table`).parent().hide();

		if ($(`#explore_card_${cardID} .explore-card-${cardID}-${tableType}-table`).length > 0) {

			$(`#explore_card_${cardID} .explore-card-${cardID}-${tableType}-table`).parent().show();

		} else {

			//$("#explore_card_stationHits .explore-card-header").text("Stations in th" + ( motusFilter.regions.length > 1 ? "ese" : "is") + " region" + ( motusFilter.regions.length > 1 ? "s" : ""));


			motusData.selectedProjects.forEach(function(v){
						v.animals = Array.from( motusData.selectedAnimals.filter( d => d.projID == v.id ).map( d => d.id ).values() )
						v.allAnimals = Array.from( motusData.animals.filter( d => d.projID == v.id ).map( d => d.id ).values() )
						v.species = Array.from( motusData.selectedAnimals.filter( d => d.projID == v.id ).map( d => d.species ).values() ).filter(onlyUnique);
						v.allSpecies = Array.from( motusData.animals.filter( d => d.projID == v.id ).map( d => d.species ).values() ).filter(onlyUnique);
						v.stations = Array.from( motusData.selectedStations.filter( d => d.projID == v.id ).map( d => d.id ).values() )
						v.allStations = Array.from( motusData.stations.filter( d => d.projID == v.id ).map( d => d.id ).values() )
					});



			var projectsTableData = motusData.selectedProjects.filter( d => (tableType == 'stations' && d.stations.length > 0) || (tableType == 'tags' && d.animals.length > 0));

						console.log(projectsTableData);
			if (projectsTableData.length > 0 ) {


				var headers = ["Project #", "Project Name", "Start Date", "Stations Deployed", "Animals tagged", "Species tagged", "Groups"];

				$(`#explore_card_${cardID}`)
					.append( $("<table></table>")
						.attr('class', `explore-card-${cardID}-table explore-card-${cardID}-${tableType}-table`)
						.append( $('<thead></thead>')
							.append( $('<tr></tr>')	)
						)
						.append( $('<tbody></tbody>') )
					)


				var tableDom = projectsTableData.length > 10 ? "Bipt" : "Bt";
				var color_dataType = 'regions' == dataType ? 'country' : 'project';

				$(`#explore_card_${cardID} .explore-card-${cardID}-${tableType}-table`).DataTable({
					data: projectsTableData,
					columns: [
						{className: "explore-table-expandRow", data: null, orderable: false, defaultContent: ""},
						{data: "id", title: "Project #"},
						{data: "name", title: "Project", "createdCell": function(td, cdata, rdata){
							$(td).html(
									`<div class='explore-card-table-legend-icon table_tips' style='border-color:${colourScale(rdata[color_dataType])};background-color:${colourScale(rdata[color_dataType])}'><div class='tip_text'>${firstToUpper(color_dataType)}: ${rdata[color_dataType]}</div></div>`+
									`<a href='javascript:void(0);' onclick='viewProfile("projects", ${rdata.id});'>${rdata.name}</a>`
							);
						}},
						{data: "created_dt", title: "Start date"},
						{className: "table_tips", data: "stations", title: "Stations deployed", "createdCell": function(td, cdata, rdata){
							$(td).html(
									`${rdata.stations.length} of ${rdata.allStations.length}`+
									`${icons.help}<div class='tip_text'>Number of stations with detections of the total deployed in this project</div>`
							);
						}},
						{className: "table_tips", data: "animals", title: "Animals tagged", "createdCell": function(td, cdata, rdata){
							$(td).html(
									`${rdata.animals.length} of ${rdata.allAnimals.length}`+
									`${icons.help}<div class='tip_text'>Number of animals detected of the total deployed in this project</div>`
							);
						}},
						{className: "table_tips", data: "species", title: "Species tagged", "createdCell": function(td, cdata, rdata){
							$(td).html(
									`${rdata.species.length} of ${rdata.allSpecies.length}`+
									`${icons.help}<div class='tip_text'>Number of species detected of the total deployed in this project</div>`
							);
						}},
						{data: "fee_id", title: "Groups", "createdCell": function(td, cdata, rdata){
							$(td).html(
								`<a href='javascript:void(0);' onclick='viewProfile("projectsGroup", ["${rdata.fee_id}"]);'>${rdata.fee_id}</a>`
							);
						}}
					],
					dom: tableDom,
	        buttons: [
						'copyHtml5',
						'excelHtml5',
						'csvHtml5',
						'pdfHtml5'
	        ],
					autoWidth: false,
					columnDefs: [ {
						"targets": 0,
						"orderable": false
					}],
					order: [[1, 'asc']]
				})

				$(`#explore_card_${cardID} .explore-card-${cardID}-${tableType}-table tbody`).on('click', `td.explore-table-expandRow`, function(){

					var tr = $(this).closest('tr');
					var row = $(this).closest('table').DataTable().row( tr );

							//			console.log( row );

					if ( row.child.isShown() ) {
						// This row is already open - close it
						row.child.hide();
						tr.removeClass('shown');
					} else if (typeof row.child() !== 'undefined') {
						// Open this row
						row.child.show();
						tr.addClass('shown');
					} else {
						// Create and open this row
						var newRow = row.child( row.data().description ).show();

					}

				});
			}
		}
	}




	function stationTable( cardID ) {

		$("#explore_card_stationHits .explore-card-stationHits-timeline").parent().hide();

		if ($(`#explore_card_${cardID} .explore-card-${cardID}-table`).length == 0) {

			//$("#explore_card_stationHits .explore-card-header").text("Stations in th" + ( motusFilter.regions.length > 1 ? "ese" : "is") + " region" + ( motusFilter.regions.length > 1 ? "s" : ""));

			var headers = ["Station Name", "Start Date", "Status", "Animals", "Species", "Project"];

			$(`#explore_card_${cardID}`)
				.append( $("<table></table>")
					.attr('class', `explore-card-${cardID}-table`)
					.append( $('<thead></thead>')
						.append( $('<tr></tr>')	)
					)
					.append( $('<tbody></tbody>') )
				)

			//headers.forEach( x => $(`#explore_card_${cardID} .explore-card-${cardID}-table thead tr`).append( $('<th></th>').text(x) ) );


			var stationTableData = Array.from(
											d3.rollup(
												motusData.selectedStations,
												v => ({
													id: ( Array.from( v.map( d => d.id ).values() ) ).join(','),
													name: v[0].name,
													dtStart: moment(d3.min(v, d => d.dtStart)),
													dtEnd: moment(d3.max(v, d => d.dtEnd)),
													nAnimals: v.map(x => x.animals.split(';')).flat().filter(onlyUnique).length,
													nSpp: v.map(x => x.species.split(';')).flat().filter(onlyUnique).length,
													country: v[0].country,
													countryName: typeof motusData.regionByCode.get(v[0].country) !== 'undefined' ? motusData.regionByCode.get(v[0].country)[0].country : 'Not defined',
													project: v[0].projID.split(',')[0],
													projectName: motusData.projects.filter(x => x.id == v[0].projID.split(',')[0])[0].project_name,
												}),
												d => d.name
											).values()
										);


			console.log(stationTableData);

			var totalAnimals = d3.max(stationTableData, v => v.nAnimals);

			console.log(totalAnimals);

			var tableDom = stationTableData.length > 10 ? "ipt" : "t";

			var color_dataType = 'regions' == dataType ? 'country' : 'project';

			$(`#explore_card_${cardID} .explore-card-${cardID}-table`).DataTable({
				data: stationTableData,
				columns: [
					{className: "explore-table-expandRow", data: null, orderable: false, defaultContent: ""},
					{data: "name", title: "Station", "createdCell": function(td, cdata, rdata){
						$(td).html(
								`<div class='explore-card-table-legend-icon table_tips' style='border-color:${colourScale(rdata[color_dataType])};background-color:${colourScale(rdata[color_dataType])}'>`+
									`<div class='tip_text'>${firstToUpper(color_dataType)}: ${color_dataType == 'project' || color_dataType == 'country' ? rdata[color_dataType + "Name"] : rdata[color_dataType]}</div>`+
								`</div>`+
								`<a href='javascript:void(0);' onclick='viewProfile("stations", ${rdata.id});'>${rdata.name}</a>`
						);
					}},
					{data: "dtStart", title: "Start date", "createdCell": function(td, cdata, rdata){
						$(td).html( cdata.toISOString().substr(0,10) );
					}},
					{data: "dtEnd", title: "Status", "createdCell": function(td, cdata, rdata){
						$(td).html( `${(moment().diff(cdata, 'day') < 1 ? "Active" : "Ended on:<br/>" + cdata.toISOString().substr(0,10) )}` );
					}},
					{data: "nAnimals", title: "Number of Animals"},
					{data: "nSpp", title: "Number of Species"},
					{data: "projectName", title: "Project", "createdCell": function(td, cdata, rdata){
						$(td).html(
							`<a href='javascript:void(0);' onclick='viewProfile("projects", [${rdata.project}]);'>${rdata.projectName}</a>`
						);
					}}
				],
				dom: tableDom,
				autoWidth: false,
				columnDefs: [ {
					"targets": 0,
					"orderable": false
				}],
				order: [[1, 'asc']]
			}).on('draw.dt', function(){
				$(`#explore_card_${cardID} .explore-card-${cardID}-table`).DataTable().rows().every(function(){

					this.child( stationTimeline( motusData.selectedStationDeployments.get( this.data().name ), { width: $(this.node() ).width() - 20 }  ) ).hide();
		//			this.nodes().to$();//.addClass('shown');
				});

				$(`#explore_card_${cardID} .explore-card-${cardID}-table tbody`).on('click', `td.explore-table-expandRow`, function(){
					var tr = $(this).closest('tr');
					var row = $(this).closest('table').DataTable().row( tr );

					if ( row.child.isShown() ) {
						// This row is already open - close it
						row.child.hide();
						tr.removeClass('shown');
					} else {
						// Open this row
						row.child.show();
						tr.addClass('shown');
					}

				});
			});

		} else {

			$(`#explore_card_${cardID} .explore-card-${cardID}-table`).parent().show();

		}

	}


	function animalTimeline( cardID ) {


		/*

		I need to create a toggle, or decide on one of the following:
		  1. Show unique animals per month/hour
			2. Show unique species per month/hour


		This plot displays three categories of detections:
			1. Local detections: Animals tagged AND detected in the same region
			2. Remote detections: Animals tagged in the region and detected elsewhere
			3. Visitor detections: Animals tagged elsewhere and detected within the region

		*/

		$("#explore_card_" + cardID + " > div:not(.explore-card-header)").hide();


		if ($(".explore-card-" + cardID + "-timeline").length == 0) {

			$("#explore_card_" + cardID + "")
				.append( $("<div class='explore-card-chart-wrapper'><div class='explore-card-" + cardID + "-timeline'></div></div>") )
		}
		if ($(".explore-card-" + cardID + "-timeline svg.monthly-timeline").length == 0) {

			$(".explore-card-" + cardID + "-timeline").append("<svg class='monthly-timeline'></svg>");

			timelineAxisVals = [];

			motusData.tagHits = {};

			//timeRange = {};

			var animalsByDayOfYear = [];

			const group_by = 'month';
			const gSize = 12;	// size of date groups

			var day = 1;


			for (var i=1; i<=gSize; i++) {
				day = moment().month(i).dayOfYear();
				animalsByDayOfYear[ day ] = { "Julian date": day, visiting: [], local: [], remote: [], total: [] };

				Object.values(motusData.selectionNames).forEach(function(d) {animalsByDayOfYear[ day ][ d ] = [];});
			}


			motusData.animalsByDayOfYear.forEach( function(d, i) {

				if (d.local.length > 0 || d.remote.length > 0 || d.visiting.length > 0) {

					var animalsToday = d.local;

					if (!['animals', 'species'].includes(dataType)) {
						animalsToday = animalsToday.concat(d.visiting);
					}

					if (group_by != 'day') {
						day = moment()[group_by](moment().dayOfYear(i)[group_by]()).dayOfYear();
					} else {
						day = Math.floor( Math.floor( i / gSize ) * gSize );
					}


					motusFilter[ dataType ].forEach(function(k) {
						if  (dataType == 'animals') {
							animalsByDayOfYear[ day ][ motusData.selectionNames[ k ] ] = animalsByDayOfYear[ day ][ motusData.selectionNames[ k ] ].concat(	d.local	);
						} else if (motusData["animalsBy"+firstToUpper(dataType)] && typeof motusData["animalsBy"+firstToUpper(dataType)].get( k ) !== 'undefined') {
							animalsByDayOfYear[ day ][ motusData.selectionNames[ k ] ] = animalsByDayOfYear[ day ][ motusData.selectionNames[ k ] ].concat(
								d.local.filter( x => typeof motusData["animalsBy"+firstToUpper(dataType)].get( k ).get( x ) !== 'undefined' && motusData["animalsBy"+firstToUpper(dataType)].get( k ).get( x ).length > 0 )
							);
						} else if (dataType == 'stations') {
							animalsByDayOfYear[ day ][ motusData.selectionNames[ k ] ] = animalsByDayOfYear[ day ][ motusData.selectionNames[ k ] ].concat(
								d.local
							);
						}


					});
					animalsByDayOfYear[day].local = animalsByDayOfYear[day].local.concat(d.local);

					animalsByDayOfYear[day].remote = animalsByDayOfYear[day].remote.concat(d.remote);
					animalsByDayOfYear[day].visiting = ['animals', 'species'].includes(dataType) ? [] : animalsByDayOfYear[day].visiting.concat(d.visiting);
					animalsByDayOfYear[day].total = animalsByDayOfYear[day].total.concat(animalsToday);

				}
			});

			animalsByDayOfYear = animalsByDayOfYear.map(function(d){

				for (k in d) {

					if (k != "Julian date") d[k] = d[k].filter(onlyUnique).length;

				}

				return d;
			});

			animalsByDayOfYear = animalsByDayOfYear.flat();

			animalsByDayOfYear.columns = Object.keys(animalsByDayOfYear[0])
			animalsByDayOfYear.columns.splice( animalsByDayOfYear.columns.indexOf('total'), 1 );
			animalsByDayOfYear.columns.splice( animalsByDayOfYear.columns.indexOf('local'), 1 );
			animalsByDayOfYear.columns.splice( animalsByDayOfYear.columns.indexOf('remote'), 1 );

			if (['animals', 'species'].includes(dataType)) {
				animalsByDayOfYear.columns.splice( animalsByDayOfYear.columns.indexOf('visiting'), 1 );
			}

			var radialColourScale = d3.scaleOrdinal().domain( ['visiting'].concat( motusFilter[dataType].map(x => motusData.selectionNames[ x ] ) ) ).range( ["#000000"].concat( customColourScale.jnnnnn.slice(0, motusFilter[dataType].length + 1) ) );

			var radialChartConstruct = d3.radialBarChart().colourScale( radialColourScale ).dateFormat('MMM');

			$("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline svg.hourly-timeline").hide();
					$("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline").parent().show();

			console.log(animalsByDayOfYear);

			var radialChart = d3.select(".explore-card-" + cardID + "-timeline svg.monthly-timeline")
				.datum(animalsByDayOfYear).call(radialChartConstruct);

		}
					$("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline svg.hourly-timeline").hide();
							$("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline").parent().show();

		$("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline svg.monthly-timeline").show();
	}

		function animalHourlyTimeline( cardID ) {

console.log("Hourly");
			/*

			I need to create a toggle, or decide on one of the following:
			  1. Show unique animals per month/hour
				2. Show unique species per month/hour


			This plot displays three categories of detections:
				1. Local detections: Animals tagged AND detected in the same region
				2. Remote detections: Animals tagged in the region and detected elsewhere
				3. Visitor detections: Animals tagged elsewhere and detected within the region

			*/

			$("#explore_card_" + cardID + " > div:not(.explore-card-header)").hide();

			if ($(".explore-card-" + cardID + "-timeline").length == 0) {

				$("#explore_card_" + cardID + "")
					.append( $("<div class='explore-card-chart-wrapper'><div class='explore-card-" + cardID + "-timeline'></div></div>") )
			}
			if ($(".explore-card-" + cardID + "-timeline svg.hourly-timeline").length == 0) {

				$(".explore-card-" + cardID + "-timeline").append("<svg class='hourly-timeline'></svg>");

				timelineAxisVals = [];

				motusData.tagHits = {};

				//timeRange = {};

				var animalsByHourOfDay = [];

				const group_by = 'hour';
				const gSize = 24;	// size of hour groups

				for (var i=0; i < gSize; i++) {

					animalsByHourOfDay[ i ] = { "Hour": i, visiting: [], local: [], remote: [], total: [] };

					Object.values(motusData.selectionNames).forEach(function(d) {animalsByHourOfDay[ i ][ d ] = [];});
				}

				motusData.animalsByHourOfDay.forEach( function(d, i) {

					if (d.local.length > 0 || d.remote.length > 0 || d.visiting.length > 0) {

						var animalsToday = d.local;

						if (!['animals', 'species'].includes(dataType)) {
							animalsToday = animalsToday.concat(d.visiting);
						}

						motusFilter[ dataType ].forEach(function(k) {
							if  (dataType == 'animals') {
								animalsByHourOfDay[ i ][ motusData.selectionNames[ k ] ] = animalsByHourOfDay[ i ][ motusData.selectionNames[ k ] ].concat(	d.local	);
							} else if (motusData["animalsBy"+firstToUpper(dataType)] && typeof motusData["animalsBy"+firstToUpper(dataType)].get( k ) !== 'undefined') {
								animalsByHourOfDay[ i ][ motusData.selectionNames[ k ] ] = animalsByHourOfDay[ i ][ motusData.selectionNames[ k ] ].concat(
									d.local.filter( x => typeof motusData["animalsBy"+firstToUpper(dataType)].get( k ).get( x ) !== 'undefined' && motusData["animalsBy"+firstToUpper(dataType)].get( k ).get( x ).length > 0 )
								);
							} else if (dataType == 'stations') {
								animalsByHourOfDay[ i ][ motusData.selectionNames[ k ] ] = animalsByHourOfDay[ i ][ motusData.selectionNames[ k ] ].concat(
									d.local
								);
							}


						});
						animalsByHourOfDay[i].local = animalsByHourOfDay[i].local.concat(d.local);

						animalsByHourOfDay[i].remote = animalsByHourOfDay[i].remote.concat(d.remote);
						animalsByHourOfDay[i].visiting = animalsByHourOfDay[i].visiting.concat(d.visiting);
						animalsByHourOfDay[i].visiting = ['animals', 'species'].includes(dataType) ? [] : animalsByHourOfDay[i].visiting.concat(d.visiting);
						animalsByHourOfDay[i].total = animalsByHourOfDay[i].total.concat(animalsToday);

					}
				});

				animalsByHourOfDay = animalsByHourOfDay.map(function(d){

					for (k in d) {

						if (k != "Hour") d[k] = d[k].filter(onlyUnique).length;

					}

					return d;
				});

				animalsByHourOfDay = animalsByHourOfDay.flat();

				animalsByHourOfDay.columns = Object.keys(animalsByHourOfDay[0])
				animalsByHourOfDay.columns.splice( animalsByHourOfDay.columns.indexOf('total'), 1 );
				animalsByHourOfDay.columns.splice( animalsByHourOfDay.columns.indexOf('local'), 1 );
				animalsByHourOfDay.columns.splice( animalsByHourOfDay.columns.indexOf('remote'), 1 );
				if (['animals', 'species'].includes(dataType)) {
					animalsByHourOfDay.columns.splice( animalsByHourOfDay.columns.indexOf('visiting'), 1 );
				}


				var radialColourScale = d3.scaleOrdinal().domain( ['visiting'].concat( motusFilter[dataType].map(x => motusData.selectionNames[ x ] ) ) ).range( ["#000000"].concat( customColourScale.jnnnnn.slice(0, motusFilter[dataType].length + 1) ) );

				var radialChartConstruct = d3.radialBarChart().colourScale( radialColourScale ).dateFormat('H');

				$("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline svg.monthly-timeline").hide();
						$("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline").parent().show();

				console.log(animalsByHourOfDay);

				var radialChart = d3.select(".explore-card-" + cardID + "-timeline svg.hourly-timeline")
					.datum(animalsByHourOfDay).call(radialChartConstruct);

			}
							$("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline svg.monthly-timeline").hide();

			$("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline").parent().show();
			$("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline svg.hourly-timeline").show();
		}
	if (motusFilter.animals.length > 0 && typeof motusData.selectedAnimals === 'undefined') {
		motusData.selectedAnimals = Array.from(motusData.animals.filter(
											x => motusFilter.animals.includes( x.id )
										).map(d => ({
											id: d.id,
											species: d.species,
											name: motusData.speciesByID.get(d.species)?motusData.speciesByID.get(d.species)[0].english:"Undefined",
											dtStart: moment(d.dtStart),
											dtEnd: moment(d.dtEnd),
											frequency: d.frequency,
											country: d.country,
											project: d.projID,
											nStations: motusData.tracksByAnimal[d.id]?Array.from(motusData.tracksByAnimal[d.id].map(v=>v.split('.')).values()).flat().filter(onlyUnique):[],
											nDays: motusData.tracksByAnimal[d.id]?motusData.tracksByAnimal[d.id].length * 2:0
										})).values());
	}

	function animalTable( speciesID ) {

			var headers = ["Species", "Release Date", "Status", "Stations Visited", "Days detected", "Project"];

			var toReturn = "<table><thead><tr>";

			headers.forEach( x => toReturn+=`<th>${x}</th>` );

			toReturn += "</tr></thead><tbody>";

			var color_dataType = 'regions' == dataType ? 'country' : 'project';

			motusData.animalsTableData.filter( d => d.species == speciesID ).forEach(function(d){

				toReturn += "<tr>"+
											"<td>"+
											`<div class='explore-card-table-legend-icon table_tips' style='border-color:${colourScale(rdata[color_dataType])};background-color:${colourScale(rdata[color_dataType])}'><div class='tip_text'>${firstToUpper(color_dataType)}: ${rdata[color_dataType]}</div></div>`+
												`<a href='javascript:void(0);' onclick='viewProfile(\"animals\", ${d.id});'>${d.name}</a>`+
											"</td>"+
											`<td>${d.dtStart.toISOString().substr(0,10)}</td>`+
											`<td>${(moment().diff(d.dtEnd, 'day') < 1 ? "Active" : "Ended on:<br/>" + d.dtEnd.toISOString().substr(0,10))}</td>`+
											`<td>${d.nStations.length}</td>`+
											`<td>${d.nDays}</td>`+
											`<td><a href='javascript:void(0);' onclick='viewProfile(\"projects\", ${d.project});'>${d.projectName}</a></td>`+
										"</tr>";
			});

			toReturn += "</tbody></table>";

			return toReturn;

	}


	function speciesTable( cardID ) {

		console.log("Species table: " + cardID);

		$("#explore_card_" + cardID + " > div:not(.explore-card-header)").hide();

		if ($('.explore-card-' + cardID + '-speciesTable').length == 0) {

			//$("#explore_card_stationHits .explore-card-header").text("Stations in th" + ( motusFilter.regions.length > 1 ? "ese" : "is") + " region" + ( motusFilter.regions.length > 1 ? "s" : ""));

			var headers = ["", "Species", "Number of animals", "Stations Visited"];

			$("#explore_card_" + cardID)
				.append( $("<table></table>")
					.attr("class", "explore-card-" + cardID + "-speciesTable")
					.append( $('<thead></thead>')
						.append( $('<tr></tr>')	)
					)
					.append( $('<tbody></tbody>') )
				)

			headers.forEach( x => $("#explore_card_" + cardID + " .explore-card-" + cardID + "-speciesTable thead tr").append( $('<th></th>').text(x) ) );


			var color_dataType = 'regions' == dataType ? 'country' : 'project';

			motusData.animalsTableData = Array.from(motusData.selectedAnimals.map(d => ({
													id: d.id,
													species: d.species,
													name: motusData.speciesByID.get(d.species)?motusData.speciesByID.get(d.species)[0].english:"Undefined",
													dtStart: moment(d.dtStart).toISOString().substr(0,10),
													dtEnd: (moment().diff(moment(d.dtEnd), 'day') < 1 ? "Active" : "Ended on:<br/>" + moment(d.dtEnd).toISOString().substr(0,10)),
													frequency: d.frequency,
													country: d.country,
													countryName: typeof motusData.regionByCode.get(d.country) !== 'undefined' ? motusData.regionByCode.get(d.country)[0].country : 'Not defined',
													nStations: (motusData.tracksByAnimal[d.id]?Array.from(motusData.tracksByAnimal[d.id].map(v=>v.split('.')).values()).flat().filter(onlyUnique):[]).length,
													nDays: motusData.tracksByAnimal[d.id]?motusData.tracksByAnimal[d.id].length * 2:0,
													project: d.project,
													projectName: typeof motusData.projects.filter(x => x.id == d.project)[0] !== 'undefined' ? motusData.projects.filter(x => x.id == d.project)[0].project_name : 'Not defined'
												})).values());

			motusData.selectedSpecies = Array.from(
											d3.rollup(
												motusData.animalsTableData,
												function(v) {
													var speciesMeta = motusData.speciesByID.get(v[0].species);
													var stations = (motusData.tracksBySpecies[v[0].species]?Array.from(motusData.tracksBySpecies[v[0].species].map(x=>x.split('.')).values()).flat().filter(onlyUnique):[]);
													var project = v.reduce( function(a, c) { a.push( c.project ); return a; }, [ ]).filter(onlyUnique);
													return {
														id: ( Array.from( v.map( d => d.id ).values() ) ).join(','),
														species: v[0].species,
														name: v[0].name,
														dtStart: d3.min(v, d => d.dtStart),
														dtEnd: d3.max(v, d => d.dtEnd),
														nAnimals: v.length,
														animals: Array.from( v.map( d => d.id ).values() ),
														stations: stations,
														nStations: stations.length,
														country: v.reduce( function(a, c) { a.push( c.country ); return a; }, [ ]).filter(onlyUnique),
														project: project,
														colourName: ['project', 'country'].includes(color_dataType) ? v.reduce( function(a, c) { a.push( c[color_dataType + "Name"] ); return a; }, [ ]).filter(onlyUnique) : v.reduce( function(a, c) { a.push( c[color_dataType] ); return a; }, [ ]).filter(onlyUnique),
														colourCode: v.reduce( function(a, c) { a.push( colourScale( c[color_dataType] ) ); return a; }, [ ]).filter(onlyUnique),
														sort: speciesMeta?speciesMeta[0].sort:999999,
														group: speciesMeta?speciesMeta[0].group:"Unknown"
													}
												},
												d => d.name
											).values()
										);


			var tableDom = motusData.selectedSpecies.length > 10 ? "itp" : "t";

			$("#explore_card_" + cardID + " .explore-card-" + cardID + "-speciesTable").DataTable({
				data: motusData.selectedSpecies,
				columns: [
					{className: "explore-table-expandRow", data: null, orderable: false, defaultContent: ""},
					{data: "name", title: "Species", "createdCell": function(td, cdata, rdata){
						$(td).html(
							rdata[color_dataType].map(
								(d, i) =>
									`<div class='explore-card-table-legend-icon table_tips' style='border-color:${colourScale( d )};background-color:${colourScale( d )}'>`+
										`<div class='tip_text'>${firstToUpper(color_dataType)}: ${rdata.colourName[i]}</div>`+
									`</div>`
								).join('') +
							`<a href='javascript:void(0);' class='tips' alt='View species profile' onclick='viewProfile("species", [${rdata.species}]);'>${rdata.name}</a>`
						);
					}},
					{data: "nAnimals", title: "Animals detected"},
					{data: "nStations", title: "Stations visited"},
					{data: "sort", visible: false, orderable: true}
				],
				dom: tableDom,
				autoWidth: false,
				columnDefs: [ {
					"targets": 0,
					"orderable": false
				}],
				order: [[4, 'asc']]
			});

			initiateTooltip("#explore_card_" + cardID + " .explore-card-" + cardID + "-speciesTable");

				$(`#explore_card_${cardID} .explore-card-${cardID}-speciesTable tbody`).on('click', `td.explore-table-expandRow`, function(){
					var tr = $(this).closest('tr');
					var row = $(this).closest('table').DataTable().row( tr );

							//			console.log( row );

					if ( row.child.isShown() ) {
						// This row is already open - close it
						row.child.hide();
						tr.removeClass('shown');
					} else if (typeof row.child() !== 'undefined') {
						// Open this row
						row.child.show();
						tr.addClass('shown');
					} else {
						// Create and open this row
						var newRow = row.child( `<div class='explore-species-table-animals'><table><thead><tr></tr></thead><tbody></tbody></table></div>` ).show();

					row.child().find('.explore-species-table-animals table').DataTable({
							data: motusData.animalsTableData.filter( d => d.species == row.data().species ),
							columns: [
								{data: "name", title: "Animal", "createdCell": function(td, cdata, rdata){
									$(td).html(
															`<div class='explore-card-table-legend-icon table_tips' style='border-color:${colourScale(rdata[color_dataType])};background-color:${colourScale(rdata[color_dataType])}'><div class='tip_text'>${firstToUpper(color_dataType)}: ${['project','country'].includes(color_dataType)?rdata[color_dataType + "Name"]:rdata[color_dataType]}</div></div>`+
															`<a href='javascript:void(0);' class='tips' alt='View animal profile' onclick='viewProfile("animals", [${rdata.id}]);'>${rdata.name} #${rdata.id}</a>`
														);
								}},
								{data: "dtStart", title: "Release date"},
								{data: "dtEnd", title: "Status"},
								{data: "nStations", title: "Stations visited"},
								{data: "nDays", title: "Days detected"},
								{data: "projectName", title: "Project", "createdCell": function(td, cdata, rdata){
									$(td).html(
										`<a href='javascript:void(0);' onclick='viewProfile("projects", [${rdata.project}]);'>${rdata.projectName}</a>`
									);
								}}
							],
							dom: tableDom,
							autoWidth: false
						});

						initiateTooltip(row.child());

						tr.addClass('shown');
					}

				});


		} else {

			$("#explore_card_" + cardID + " .explore-card-" + cardID + "-speciesTable").parent().show();

		}
	}


	function animalsTable( cardID ) {

		console.log("Species table: " + cardID);

		$("#explore_card_" + cardID + " > div:not(.explore-card-header)").hide();

		if ($('.explore-card-' + cardID + '-speciesTable').length == 0) {

			//$("#explore_card_stationHits .explore-card-header").text("Stations in th" + ( motusFilter.regions.length > 1 ? "ese" : "is") + " region" + ( motusFilter.regions.length > 1 ? "s" : ""));

			var headers = ["", "Species", "Number of animals", "Stations Visited"];

			$("#explore_card_" + cardID)
				.append( $("<table></table>")
					.attr("class", "explore-card-" + cardID + "-speciesTable")
					.append( $('<thead></thead>')
						.append( $('<tr></tr>')	)
					)
					.append( $('<tbody></tbody>') )
				)

			headers.forEach( x => $("#explore_card_" + cardID + " .explore-card-" + cardID + "-speciesTable thead tr").append( $('<th></th>').text(x) ) );


			var color_dataType = 'regions' == dataType ? 'country' : 'project';

			motusData.animalsTableData = Array.from(motusData.selectedAnimals.map(d => ({
													id: d.id,
													species: d.species,
													name: motusData.speciesByID.get(d.species)?motusData.speciesByID.get(d.species)[0].english:"Undefined",
													dtStart: moment(d.dtStart).toISOString().substr(0,10),
													dtEnd: (moment().diff(moment(d.dtEnd), 'day') < 1 ? "Active" : "Ended on:<br/>" + moment(d.dtEnd).toISOString().substr(0,10)),
													frequency: d.frequency,
													country: d.country,
													countryName: typeof motusData.regionByCode.get(d.country) !== 'undefined' ? motusData.regionByCode.get(d.country)[0].country : 'Not defined',
													nStations: (motusData.tracksByAnimal[d.id]?Array.from(motusData.tracksByAnimal[d.id].map(v=>v.split('.')).values()).flat().filter(onlyUnique):[]).length,
													nDays: motusData.tracksByAnimal[d.id]?motusData.tracksByAnimal[d.id].length * 2:0,
													project: d.project,
													projectName: typeof motusData.projects.filter(x => x.id == d.project)[0] !== 'undefined' ? motusData.projects.filter(x => x.id == d.project)[0].project_name : 'Not defined'
												})).values());

			motusData.selectedSpecies = Array.from(
											d3.rollup(
												motusData.animalsTableData,
												function(v) {
													var speciesMeta = motusData.speciesByID.get(v[0].species);
													var stations = (motusData.tracksBySpecies[v[0].species]?Array.from(motusData.tracksBySpecies[v[0].species].map(x=>x.split('.')).values()).flat().filter(onlyUnique):[]);
													var project = v.reduce( function(a, c) { a.push( c.project ); return a; }, [ ]).filter(onlyUnique);
													return {
														id: ( Array.from( v.map( d => d.id ).values() ) ).join(','),
														species: v[0].species,
														name: v[0].name,
														dtStart: d3.min(v, d => d.dtStart),
														dtEnd: d3.max(v, d => d.dtEnd),
														nAnimals: v.length,
														animals: Array.from( v.map( d => d.id ).values() ),
														stations: stations,
														nStations: stations.length,
														country: v.reduce( function(a, c) { a.push( c.country ); return a; }, [ ]).filter(onlyUnique),
														project: project,
														colourName: ['project', 'country'].includes(color_dataType) ? v.reduce( function(a, c) { a.push( c[color_dataType + "Name"] ); return a; }, [ ]).filter(onlyUnique) : v.reduce( function(a, c) { a.push( c[color_dataType] ); return a; }, [ ]).filter(onlyUnique),
														colourCode: v.reduce( function(a, c) { a.push( colourScale( c[color_dataType] ) ); return a; }, [ ]).filter(onlyUnique),
														sort: speciesMeta?speciesMeta[0].sort:999999,
														group: speciesMeta?speciesMeta[0].group:"Unknown"
													}
												},
												d => d.name
											).values()
										);


			var tableDom = motusData.selectedSpecies.length > 10 ? "itp" : "t";

			$("#explore_card_" + cardID + " .explore-card-" + cardID + "-speciesTable").DataTable({
				data: motusData.selectedSpecies,
				columns: [
					{className: "explore-table-expandRow", data: null, orderable: false, defaultContent: ""},
					{data: "name", title: "Species", "createdCell": function(td, cdata, rdata){
						$(td).html(
							rdata[color_dataType].map(
								(d, i) =>
									`<div class='explore-card-table-legend-icon table_tips' style='border-color:${colourScale( d )};background-color:${colourScale( d )}'>`+
										`<div class='tip_text'>${firstToUpper(color_dataType)}: ${rdata.colourName[i]}</div>`+
									`</div>`
								).join('') +
							`<a href='javascript:void(0);' class='tips' alt='View species profile' onclick='viewProfile("species", [${rdata.species}]);'>${rdata.name}</a>`
						);
					}},
					{data: "nAnimals", title: "Animals detected"},
					{data: "nStations", title: "Stations visited"},
					{data: "sort", visible: false, orderable: true}
				],
				dom: tableDom,
				autoWidth: false,
				columnDefs: [ {
					"targets": 0,
					"orderable": false
				}],
				order: [[4, 'asc']]
			});

			initiateTooltip("#explore_card_" + cardID + " .explore-card-" + cardID + "-speciesTable");

				$(`#explore_card_${cardID} .explore-card-${cardID}-speciesTable tbody`).on('click', `td.explore-table-expandRow`, function(){
					var tr = $(this).closest('tr');
					var row = $(this).closest('table').DataTable().row( tr );

							//			console.log( row );

					if ( row.child.isShown() ) {
						// This row is already open - close it
						row.child.hide();
						tr.removeClass('shown');
					} else if (typeof row.child() !== 'undefined') {
						// Open this row
						row.child.show();
						tr.addClass('shown');
					} else {
						// Create and open this row
						var newRow = row.child( `<div class='explore-species-table-animals'><table><thead><tr></tr></thead><tbody></tbody></table></div>` ).show();

					row.child().find('.explore-species-table-animals table').DataTable({
							data: motusData.animalsTableData.filter( d => d.species == row.data().species ),
							columns: [
								{data: "name", title: "Animal", "createdCell": function(td, cdata, rdata){
									$(td).html(
															`<div class='explore-card-table-legend-icon table_tips' style='border-color:${colourScale(rdata[color_dataType])};background-color:${colourScale(rdata[color_dataType])}'><div class='tip_text'>${firstToUpper(color_dataType)}: ${['project','country'].includes(color_dataType)?rdata[color_dataType + "Name"]:rdata[color_dataType]}</div></div>`+
															`<a href='javascript:void(0);' class='tips' alt='View animal profile' onclick='viewProfile("animals", [${rdata.id}]);'>${rdata.name} #${rdata.id}</a>`
														);
								}},
								{data: "dtStart", title: "Release date"},
								{data: "dtEnd", title: "Status"},
								{data: "nStations", title: "Stations visited"},
								{data: "nDays", title: "Days detected"},
								{data: "projectName", title: "Project", "createdCell": function(td, cdata, rdata){
									$(td).html(
										`<a href='javascript:void(0);' onclick='viewProfile("projects", [${rdata.project}]);'>${rdata.projectName}</a>`
									);
								}}
							],
							dom: tableDom,
							autoWidth: false
						});

						initiateTooltip(row.child());

						tr.addClass('shown');
					}

				});


		} else {

			$("#explore_card_" + cardID + " .explore-card-" + cardID + "-speciesTable").parent().show();

		}
	}


}

function addExploreProfile(profile) {

	if ($("#explore_card_profile_" + profile.id).length == 0) {


		// If no profiles exist, creat the necessary wrapper and control elements


		if ($("#explore_card_profiles").length == 0) {

			if (motusData["selected"+firstToUpper(dataType)].length == 1) {
				document.title = profile.name +
													(dataType == 'animals' ? " #" + profile.id : "") +
													(" Motus " + firstToUpper(dataType!='species'?dataType.slice(0,-1):dataType)) +
													" Summary"
			}
			if (typeof profile.dtStart !== 'undefined' && typeof profile.dtEnd !== 'undefined') {
			//	timeline.setSlider([profile.dtStart, profile.dtEnd]);
				motusFilter.dtStart = new Date(profile.dtStart);
				motusFilter.dtEnd = new Date(profile.dtEnd);
			}
			$("#exploreContent .explore-card-wrapper")
				.append(`<div class='explore-card' id='explore_card_profiles'>`+
									`<div class='explore-card-add explore-card-${dataType}' alt='Add a ${dataType=='species'?dataType:dataType.slice(0,-1)}'>`+
										`<select class='explore-card-add-${dataType}' data-placeholder='Select a ${dataType=='species'?dataType:dataType.slice(0,-1)}'>`+
											`<option></option>`+
										`</select>`+
									`</div>`+
									`<div class='explore-card-profiles-toggles'></div>`+
								`</div>`+
								`<div class='explore-card-profiles-tabs'>`+
									`<div class='explore-card-tab expand-menu-btn'>${icons.expand}</div>`+
									`<div class='explore-profiles-tab-wrapper'></div>`+
								`</div>`);

			addExploreTab('explore-card-map', 'Map', {selected: true, icon: icons.map});

			if (["stations","regions","projects"].includes(dataType)) {

				var toggleText = dataType == "stations" ? `Animals tagged near this ${dataType.slice(0,-1)} only` : `Animals tagged in this ${dataType.slice(0,-1)} only`;

				$("#exploreContent .explore-card-profiles-toggles").append(`<button class='toggleButton'>${toggleText}</button>`);

				$("#exploreContent .explore-card-profiles-toggles .toggleButton").click(function(e){$(this).toggleClass('selected');setFilter.call(this, e);});

			}

			$("#exploreContent .explore-card-profiles-tabs .expand-menu-btn").click(function(){$(this).parent().toggleClass('expanded');});

		}



		//	Add Explore Profile HTML

		$("#explore_card_profiles")
			.prepend(`<div class='explore-card-profile grid-container' id='explore_card_profile_${profile.id}'>`+
								`<div class='explore-card-image tips enlarge' alt='Click to expand'><img src='' alt='Click to expand'/><div class='explore-card-image-bg'></div><div class='explore-card-image-icon'>${icons.camera}</div></div>`+
						//	 	`<div class='explore-card-name'><div style='font-size:${24 - (Math.floor(profile.label.length/15)*2)}pt;'>${profile.label}</div></div>`+
							 	`<div class='explore-card-name'>`+
									`<div class='explore-card-name-text'>${profile.name} <div class='${(profile.subtitle&&profile.subtitle.link)?'link':''}'>${profile.subtitle?profile.subtitle.text:''}</div></div>`+
									(typeof profile.status !== 'undefined' ? `<div class='explore-profile-status explore-profile-status-${profile.status.toLowerCase()} tips' alt='${profile.status}'>${profile.status.toLowerCase()}</div>`:'')+
								//	`<div class='btn add_btn explore-card-add tips' alt='Compare with another ${dataType=="species"?dataType:dataType.slice(0, -1)}'>${icons.remove}</div>`+
								//	`<div class='btn explore-card-remove remove_btn tips' alt='Remove this ${dataType=="species"?dataType:dataType.slice(0, -1)}'>${icons.remove}</div>`+
								`</div>`+
								`<div class='explore-profile-summary-wrapper'>`+
									Object.entries(profile.summary).map( (d,i) => {
										var profileDataType = d[0].replace('Detected', '').replace('Tagged', '').replace('Segments', '').toLowerCase();
										return `<div class='explore-card-profile-data explore-card-data${i + 1}' onclick='showProfileData("${profile.id}", "${d[0]}")'>`+
															`${icons[profileDataType] || ""}`+
															`<div class='explore-profile-data-label'>${d[0].replace('Det', ' Det').replace('Tag', ' Tag').replace('Seg', ' Seg')}</div>`+
															`<div class='explore-profile-data-value ${icons[profileDataType]!=undefined? "" : "colspan2"}'>${typeof d[1] == "object" ? d[1].length :  d[1]}</div>`+
														`</div>`;
									}).join('')+
									(dataType == 'projects' ?
									`<div class='explore-profile-shortDescription'>${profile.shortDescription}</div>`
									 : "")+
								"</div>"+
								`<div class='explore-profile-info'>`+
									`<div class='expand_btn'> info</div>`+
									`<div class='explore-profile-info-section'><h4>Latest Activity</h4>`+
									(
										profile.lastDetection && profile.lastDetection.lastDetectedAnimal.length > 1 ?
										`<div style='font-size:10pt;'>Tags detected: ${profile.lastDetection.lastDetectedAnimal.length} animals of ${profile.lastDetection.lastDetectedAnimal.map(x=>x.species).filter(onlyUnique).length} species on ${profile.lastDetection.dtEnd.toISOString().substring(0, 10).replace("T", " @ ")}</div>`
											:
										profile.lastDetection && profile.lastDetection.lastDetectedAnimal.length == 1 ?
										`<div style='font-size:10pt;' ${dataType == 'stations' ? '' : "class='colspan2'"}>Tag detected: `+
										`<div class='explore-status-button' onclick='showProfileData("${profile.lastDetection.lastDetectedAnimal[0].id}", "animals")'>${(typeof motusData.speciesByID.get(profile.lastDetection.lastDetectedAnimal[0].species)==='undefined')?"Unknown species":motusData.speciesByID.get(profile.lastDetection.lastDetectedAnimal[0].species)[0].english} #${profile.lastDetection.lastDetectedAnimal[0].id} `+
										`<div class='explore-status-icon explore-status-icon-${profile.lastDetection.lastDetectedAnimal[0].status.toLowerCase()} tips' alt='${profile.lastDetection.lastDetectedAnimal[0].status}'> </div>`+
										`</div> on <b>${profile.lastDetection.dtEnd.toISOString().substring(0, 10).replace("T", " @ ")}</b>`+
										( dataType == 'stations' ? '' :
											` at <div class='explore-status-button' onclick='showProfileData("${profile.lastDetection.lastDetectionStation.id}", "stations")'>${profile.lastDetection.lastDetectionStation.name} `+
											`<div class='explore-status-icon explore-status-icon-${profile.lastDetection.lastDetectionStation.status.toLowerCase()} tips' alt='${profile.lastDetection.lastDetectionStation.status}'> </div>`+
											`</div>`
										)+
										`</div>`
											: ''
									)+
										(profile.lastTagDeployment?
											`<div style='font-size:10pt;'>Tag deployed: `+
											`<div class='explore-status-button' onclick='showProfileData("${profile.lastTagDeployment.id}", "animals")'>${(typeof motusData.speciesByID.get(profile.lastTagDeployment.species)==='undefined')?"Unknown species":motusData.speciesByID.get(profile.lastTagDeployment.species)[0].english} #${profile.lastStationDeployment.id} `+
											`<div class='explore-status-icon explore-status-icon-${profile.lastTagDeployment.status.toLowerCase()} tips' alt='${profile.lastTagDeployment.status}'> </div>`+
											`</div> on <b>${profile.lastTagDeployment.dtStart.toISOString().substring(0, 10).replace("T", " @ ")}</b></div>`
											:''
										)+
									(
										profile.lastStationDeployment ?
											`<div style='font-size:10pt;'>Station deployed: `+
											`<div class='explore-status-button' onclick='showProfileData("${profile.lastStationDeployment.id}", "stations")'>${profile.lastStationDeployment.name} `+
											`<div class='explore-status-icon explore-status-icon-${profile.lastStationDeployment.status.toLowerCase()} tips' alt='${profile.lastStationDeployment.status}'> </div>`+
											`</div> on <b>${profile.lastStationDeployment.dtStart.toISOString().substring(0, 10).replace("T", " @ ")}</b></div>`
											:	''
										)+
								`</div>`+

								(dataType == 'projects' ?
									`<div class='explore-profile-info-section'><h4>Metrics</h4>`+
										Object.entries(profile.stats).map( (d,i) => {
											var profileDataType = d[0].replace('Detected', '').replace('Tagged', '').replace('Segments', '');
											return `<div class='explore-profile-info-stat'>`+
																`<div class='explore-profile-stat-label'>${firstToUpper(d[0].replace('Det', ' Det').replace('Tag', ' Tag').replace('Seg', ' Seg'))}</div>`+
																`<div class='explore-profile-stat-value' onclick='showProfileData("${profile.id}", "${profileDataType}")'>${typeof d[1] == "object" ? d[1].length :  d[1]}</div>`+
															"</div>";

										}).join('')+
									`</div><div class='explore-profile-info-section'><h4>Affiliations</h4>`+
									`<div class='explore-profile-user'>Principal investigator: <a href="javascript:void(0);">User #${profile.leadUserId}</a></div>`+
	 							 	`<div class='explore-profile-group'>Group(s): ${profile.group.length>0?'<a href="javascript:void(0);">'+profile.group+'</a>':"None"}</div>`+
									`</div><div class='explore-profile-info-section'><h4>Detailed Description</h4>`+
									`<div class='explore-profile-description colspan2'>${profile.description}</div>`+
									`</div>`
								 : dataType == 'species' ?
								 `<div class='explore-profile-info-section'><h4>Description</h4>`+
								 	`<div class='explore-profile-description colspan2'>${profile.description}</div>`+
								 `</div>`

								 : dataType == 'animals' ?
								 `<div class='explore-profile-info-section'><h4>Metrics</h4>`+
								 	`<div>Deployment location: <div class='explore-status-button'>${profile.coordinates.join(", ")} ${icons.target}</div></div>`+
								 `</div><div class='explore-profile-info-section'><h4>Affiliations</h4>`+
									 `<div class='explore-profile-info-project'>Project: <a href="javascript:void(0);">${profile.project.name} (#${profile.project.id})</a></div>`+
									 `<div class='explore-profile-user'>Principal investigator: <a href="javascript:void(0);">User #${profile.project.lead_user_id}</a></div>`+
									 `<div class='explore-profile-group'>Group(s): ${profile.project.fee_id.length>0?'<a href="javascript:void(0);">'+profile.project.fee_id+'</a>':"None"}</div>`+
								 `</div><div class='explore-profile-info-section'><h4>Description</h4>`+
								 	`<div class='explore-profile-description colspan2'>${profile.description}</div>`+
								 `</div>`

								 : dataType == 'stations' ?
								 `<div class='explore-profile-info-section'><h4>Metrics</h4>`+
								 	`<div> Deployment location: <div class='explore-status-button'>${profile.coordinates.join(", ")} ${icons.target}</div></div>`+
								 `</div>`+
						//	 `<div class='explore-profile-info-antennas'>Antennas: <div class='explore-status-button' onclick='viewAntennaRanges(populateAntennaInfo);'>Load antenna configuration</div></div>`+

								 `<div class='explore-profile-info-section explore-profile-info-antennas'><h4>Antennas</h4>`+
								 	`<div class='add-antennas-btn'><div class='explore-status-button' onclick='viewAntennaRanges(populateAntennaInfo);'>Load antenna configuration</div></div>`+
								 `</div>`+

								 `<div class='explore-profile-info-section'><h4>Affiliations</h4>`+
									 `<div class='explore-profile-info-project'>Project: <a href="javascript:void(0);">${profile.project.name} (#${profile.project.id})</a></div>`+
									 `<div class='explore-profile-user'>Principal investigator: <a href="javascript:void(0);">User #${profile.project.lead_user_id}</a></div>`+
									 `<div class='explore-profile-group'>Group(s): ${profile.project.fee_id.length>0?'<a href="javascript:void(0);">'+profile.project.fee_id+'</a>':"None"}</div>`+
								 `</div>`

								 : '')+
							 `</div>`+
							"</div>");


		profile.el = $("#explore_card_profile_" + profile.id).get(0);

		$(profile.el).find(".explore-profile-info .expand_btn").click(function(){$(this).parent().toggleClass("expanded");});


		if (profile.photo == "") {

			$("#explore_card_profile_" + profile.id).addClass("no-photo").removeClass('tips');

		} else {
			$("#explore_card_profile_" + profile.id + " .explore-card-image")
				.click(function(){
					initiateLightbox(this);
			}).find('img').attr("src", profile.photo)
			.siblings(".explore-card-image-bg").css("background-image", `url("${profile.photo}")`);

		}

		$("#explore_card_profile_" + profile.id + " .explore-card-name").click(function(){
				$(this).closest(".explore-card-profile").toggleClass('expanded');
		})

		$("#explore_card_profile_" + profile.id + " .explore-card-remove").click(function(){removeExploreCard(this, exploreType)});

		if (motusFilter[exploreType][0] === 'all') {motusFilter[exploreType] = [];}

		motusFilter[exploreType].push(String(profile.id));
		motusFilter[exploreType] = motusFilter[exploreType].filter(onlyUnique);

		if ($("#exploreContent .explore-card-profile").length == 1) {
	//		$(".explore-card-wrapper").addClass('solo-card');
	//		$("#explore_card_profiles").addClass('solo-card');
			$(".explore-card-wrapper #explore_card_profiles .explore-card-profile").addClass('expanded');
			try { motusMap.setColour('id'); }
			catch(err) { console.log("motusMap not yet created"); }
		} else {
			$(".explore-card-wrapper").removeClass('solo-card');
			$("#explore_card_profiles").removeClass('solo-card');
			$(".explore-card-wrapper #explore_card_profiles .explore-card-profile").removeClass('expanded');
			try { motusMap.setColour('species'); }
			catch(err) { console.log("motusMap not yet created"); }
		}
	} else {
		$("#explore_card_profile_" + profile.id).addClass('flash')
		setTimeout('$("#explore_card_profile_' + profile.id + '").removeClass("flash");',250);
	}

	initiateTooltip(profile.el)
}

function populateAntennaInfo() {

//	Only for profiles
	if (exploreType != 'main') {

//	Loop through each profile
		Object.entries(motusData.selectionNames).forEach((d) => {

//	Remove the button to add antenna info
			$(`#explore_card_profile_${d[0]} .explore-profile-info-antennas .add-antennas-btn`).remove();

//	Select the appropriate antenna deployments and loop through each one
			motusData.antennas.features.filter( x => x.id == d[0] ).forEach( x => {

//	Add a row with the antenna properties of interest
				$(`#explore_card_profile_${d[0]} .explore-profile-info-antennas`).append(
					`<div class='colspan2'><div>Port ${x.properties.port}:</div><div>Bearing: ${x.properties.bearing}</div><div>Antenna type: ${x.properties.type}</div><div>Frequency: ${x.properties.freq}</div><div>Height: ${x.properties.height}</div></div>`
				);

			});
		});
	}
}
function stationTimeline( d, {
															width = 300,
															height = 60,
															timelineScale = d3.scaleLinear().domain([ timeRange.min, timeRange.max ]).range([ 0, width ]),
															dayWidth = timelineScale( timeRange.min + (1 * 24 * 60 * 60 * 1000) ),
															colourScale = d3.scaleSequential(d3.interpolateTurbo).domain([ 1, 10 ]),
															timelineSVG = $("<svg width='"+width+"' height='"+height+"' style='margin:-8px 0;cursor:pointer;'></svg>"),
															resize = false,
															dataSource = 'station'
														} = {} ) {

	if (width > 0) {

		dayWidth = dayWidth < 1 ? 1 : dayWidth;

		var timeFormat = ( timeRange.range / (1000 * 60 * 60 * 24 * 365) ) * ( 300 / width ) > 2 ? "%Y" :
							( ( timeRange.range / (1000 * 60 * 60 * 24 * 365) ) * ( 300 / width ) > 1 ? "%b %Y" : "%Y-%m-%d" );

		var x_scale = d3.scaleTime()
									.domain( [ new Date(timeRange.min), new Date(timeRange.max) ] )
									.range( [0, width] );

		var axis_x = d3.axisTop( x_scale )
										.tickFormat( d3.timeFormat( timeFormat ) )
										.ticks( Math.round( width /  75 ) );

		var hasData = false;

		var svg = d3.select( timelineSVG[0] )
								.on("touchstart touchmove mousemove", dataHover)
								.on("touchend mouseleave", function(e) {dataHover(e, "out");});

		var stationHits = {};

		if (dataSource != 'station') {
			if (d.length > 0) {
				hasData = true;
			}
			d.forEach(function(trackData) {

				var dtsStart = trackData.dtStartList.split(',');
				var dtsEnd = trackData.dtEndList.split(',');
				var stations = trackData.route.split('.');
				var projects = trackData.projID.split(',');
				var species = trackData.species.split(',');
				var animals = trackData.animals.split(',');

				var dates = [];
				var spp = [];

				trackData.dir.split(',').forEach((dir ,i) => {
					if (( motusFilter.projects.includes('all') || motusFilter.projects.includes(projects[i]) ) &&
							( motusFilter.species.includes('all') || motusFilter.species.includes(species[i]) ) &&
							( motusFilter.animals.includes('all') || motusFilter.animals.includes(animals[i]) )) {

							if ( motusFilter.stations.includes('all') || motusFilter.stations.includes(stations[0]) ) {
								dates.push( dir == 1 ? dtsStart[i] : dtsEnd[i] );
								spp.push(species[i]);
							}
							if ( motusFilter.stations.includes('all') || motusFilter.stations.includes(stations[1]) ) {
								dates.push( dir == 1 ? dtsEnd[i] : dtsStart[i] );
								spp.push(species[i]);
							}
					}
				}, []);

				//var dates = trackData.dir.split(',')

			//	console.log(trackData);
			//	console.log(dates);
//				var dates = dtsStart.concat(dtsEnd);

				var data = countInstances( dates.map(k => new Date(k).valueOf()) );

			//	console.log(data);
				//var spp = {};

				spp.forEach(function(k, i){

		//			if ( spp.length != 0 && typeof data[2] !== 'undefined' && data[2][data[2].length - 1] == dates[i]) {

					if ( typeof data[2] !== 'undefined' && data[0][data[2].length - 1] == dates[i]) {

						data[2][i].push(k);

					} else if ( typeof data[2] !== 'undefined' ) {

						data[2].push([k]);

					} else {

						data[2] = [[k]];

					}

				});


				var date_str;

				for (var i = 0; i < data[0].length; i++) {
					date_str = new Date( data[0][i] ).toISOString().substr(0, 10);
					if ( typeof stationHits[ date_str ] !== 'undefined' ) {
						stationHits[ date_str ].count += data[1][i];
						stationHits[ date_str ].species = stationHits[ date_str ].species.concat(data[2][i]).filter(onlyUnique);
					} else {
						stationHits[ date_str ] = {date: data[0][i], count: data[1][i], species: data[2][i].filter(onlyUnique)};
					}
				}
			});
		} else {
			d.forEach(function(v) {

				var w = width * ((new Date(v.dtEnd).valueOf()) - (new Date(v.dtStart).valueOf())) / timeRange.range;
				var x = width * ((new Date(v.dtStart).valueOf()) - timeRange.min) / timeRange.range;

				svg
					.append('rect')
					.attr('width', w)
					.attr('height', height)
					.attr('x', x)
					.style('fill', '#CCCCCC');


				var g = d3.select( timelineSVG[0] )
					.append('g');

				w = width * ( 24 * 60 * 60 * 3000 ) / timeRange.range;

				if (typeof motusData.tracksByStation[v.id] !== 'undefined') {

					hasData = true;

					motusData.tracksByStation[v.id].forEach(function(x){

						var datePos = ( x.split('.')[0] == v.id ? 'dtStart' : 'dtEnd' ) + 'List';

						var trackData = motusData.selectedTracks[x];

						if (typeof trackData[datePos] !== 'undefined') {

							var dates = trackData[datePos].split(',');

							var data = countInstances( dates.map(k => moment(k).valueOf()) );

							var spp = {};

							trackData.species.split(',').forEach(function(k, i){

					//			if ( spp.length != 0 && typeof data[2] !== 'undefined' && data[2][data[2].length - 1] == dates[i]) {

								if ( typeof data[2] !== 'undefined' && data[0][data[2].length - 1] == dates[i]) {

									data[2][i].push(k);

								} else if ( typeof data[2] !== 'undefined' ) {

									data[2].push([k]);

								} else {

									data[2] = [[k]];

								}

							});
							var date_str;

							for (var i = 0; i < data[0].length; i++) {
								date_str = new Date( data[0][i] ).toISOString().substr(0, 10);
								if ( typeof stationHits[ date_str ] !== 'undefined' ) {
									stationHits[ date_str ].count += data[1][i];
									stationHits[ date_str ].species = stationHits[ date_str ].species.concat(data[2][i]).filter(onlyUnique);
								} else {
									stationHits[ date_str ] = {date: data[0][i], count: data[1][i], species: data[2][i].filter(onlyUnique)};
								}
							}
						}

					});

				} else {
					// no data
				}

			});
		}
		var maxCount = d3.max(Object.values(stationHits), x => x.count);

		var maxSpp = d3.max(Object.values(stationHits), x => x.species.length);

		var g = d3.select( timelineSVG[0] )
			.append('g')
			.attr('class','hits');

		g.selectAll('rect')
			.data(Object.values(stationHits))
			.enter()
				.append('rect')
					//.attr('width', 3 ) // Three days
					.attr('width', dayWidth ) // one day
					.attr('height', dataHeight )
					.attr('x', (x) => timelineScale(x.date) )
					.attr('fill', (x) => colourScale(x.species.length) )
					.attr('transform', translate);
	//							.attr('class', 'hover-data')
	//							.on('mouseover', (e,d) => dataHover(e, d, 'in'))
	//							.on('mouseout', (e,d) => dataHover(e, d, 'out'));

		var tooltip_data_bar = d3.select( timelineSVG[0] )
															.append('g')
																.style('display', 'none');
		tooltip_data_bar.append('rect')
										.attr('width', dayWidth)
										.attr('height', height)
										.attr('fill', '#000')
										.attr('x', 0)
										.attr('y', 0);


		if (typeof resize !== 'undefined') {
			window.addEventListener("resize", resizeWidth);
		}

		function bisect(mx) {
			const bisect = d3.bisector( d => d.date ).left;

			const date = x_scale.invert(mx);
			const index = bisect(Object.values(stationHits), date, 1);
			const a = Object.values(stationHits)[index - 1];
			const b = Object.values(stationHits)[index];
			return b && (date - a.date > b.date - date) ? b : a;
		}

		function dataHover(e, dir = 'in') {
			//							from: https://observablehq.com/@d3/line-chart-with-tooltip
			if (dir == 'in') {
				const x_pos = d3.pointer(e, this)[0];
				const date =  x_scale.invert( x_pos ).toISOString().substr(0, 10);
				const d = stationHits[ date ];

				$('.tooltip').html(
					"<center><h3>"+
						( date )+
					"</h3></center>"+
					(d ?
						`<table style="width:100%;text-align:center;font-size:14pt;"><tbody>`+
							`<tr><td>${d.count} ${icons.animals}</td><td style="padding-left: 10px;">${d.species.length} ${icons.species}</td></tr>`+
							`<tr><td><b>Animal${d.count==1?"":"s"}</b></td><td style="padding-left: 10px;"><b>Species</b></td></tr>`+
						`</tbody></table>`
					: "") +
					"</div>"
				);

				if (e.pageX + 15 + $('.tooltip').outerWidth() > $(window).width()) {
					$('.tooltip').css({top:e.pageY - 10, left:e.pageX - $('.tooltip').outerWidth() - 15});
				} else {
					$('.tooltip').css({top:e.pageY - 10, left:e.pageX + 15});
				}
				tooltip_data_bar.attr('transform', `translate(${x_pos},0)`).style('display', null)
				$('.tooltip:hidden').show();
			} else {
				$('.tooltip').hide();
				tooltip_data_bar.style('display', 'none');
			}
		}
		function dataHeight(x) {
			return 2 + ( ( height - 25 ) * x.count / maxCount);
		}

		function translate(x) {
			return "translate(0, " + (((height - 25) - dataHeight(x))/2) + ")";
		}
		function resizeWidth() {

			if (resize.length > 0 && width != resize.width()) {


				var width_el = resize;
				var tmp_width = 0;

				while(tmp_width == 0 && width_el.get(0).tagName != "BODY") {
					tmp_width = width_el.width();
					width_el = width_el.parent();
				}

				if (tmp_width != width) {
					width = tmp_width;
					resize.find("svg").remove();
					resize.append( stationTimeline(d3.selectAll('.explore-map-track:not(.hidden)').data(), {
						width:width,
						timelineSVG: $("<svg height='"+height+"' style='width:100%;margin:-8px 0;cursor:pointer;'></svg>"),
						dataSource: dataSource
					}) );
				}
			}
		}

		if (!hasData) {

			d3.select( timelineSVG[0] )
				.append('text')
				.attr('dy', '.3em')
				.attr('text-anchor', 'middle')
				.attr('x', (width / 2) )
				.attr('y', (height / 2) )
				.attr('class','no-data-text')
				.style('font-weight', '600')
				.text("NO DETECTIONS");

		}


		d3.select( timelineSVG[0] )
			.append( 'g' )
			.attr('class','axis-x')
			.attr('transform', 'translate(0 60)')
			.call(axis_x);

	}


	return timelineSVG[0];

}
