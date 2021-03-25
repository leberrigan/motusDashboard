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

	var mapLegend = d3.create('div').attr("class", "explore-map-legend")
																	.attr("id", "explore_map_legend");
	mapLegend.append('div')
						.text('Map legend')
						.attr("class", "explore-map-legend-header")
							.append('span')
							.attr('class', 'showHide')
							.on('click', function(){	$(this).closest('.explore-map-legend').toggleClass('hidden');	});

	if (typeof selectedRegions === "undefined") {
		motusData.selectedRegions = motusData.polygons.features.filter(x => motusFilter.regions.includes(x.properties[regionBin])).map(x => ({geometry:x.geometry, properties: x.properties, id: x.properties.adm0_a3, name: x.properties.name}));
		motusData.selectedRegions = motusData.selectedRegions.length > 0 ? motusData.selectedRegions : false;
	} else {
		motusData.selectedRegions = selectedRegions;
	}

	if (typeof selectedStations === "undefined") {
		motusFilter.stations = motusFilter[dataType].map(x => (motusData[ "stationsBy" + firstToUpper(dataType) ].get(x).map(v => v.deployID))).flat();
		motusData.selectedStations = motusData.stations.filter(x => motusFilter.stations.includes(x.deployID) );
	} else {
		motusFilter.stations = selectedStations;
		motusData.selectedStations = motusData.stations.filter(x => motusFilter.stations.includes(x.deployID) );
	}

	if (typeof selectedAnimals === "undefined") {
		if (typeof motusFilter.animals === 'undefined' || motusFilter.animals.length == 0) {
			motusFilter.animals = motusFilter[dataType]
				.filter(x => (typeof motusData[ "animalsBy" + firstToUpper(dataType) ].get(x) !== 'undefined'))
				.map(x => Array.from(motusData[ "animalsBy" + firstToUpper(dataType) ].get(x).keys())).flat().filter(onlyUnique);
		}
		motusData.selectedAnimals = motusData.animals.filter(x => motusFilter.animals.includes(x.deployID) );
	} else {
		motusFilter.animals = selectedAnimals;
		motusData.selectedAnimals = motusData.animals.filter(x => motusFilter.animals.includes(x.deployID) );
	}

	if (typeof selectedProjects === "undefined") {
		motusFilter.projects = motusData.selectedStations.map( x => x.projID ).flat().concat( motusData.selectedAnimals.map( x => x.projID ).flat() ).filter(onlyUnique);
		motusData.selectedProjects = motusData.projects.filter(x => motusFilter.projects.includes(x.id) );
	} else {
		motusFilter.projects = selectedStations;
		motusData.selectedProjects = motusData.projects.filter(x => motusFilter.projects.includes(x.id) );
	}

//	motusFilter.stations = motusFilter.regions.map(x => (motusData[ "stationsBy" + firstToUpper(dataType) ].get(x).map(s => s.deployID))).flat();

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

				motusFilter[dataType]
					.forEach(function(x){
						if (motusData[ "animalsBy" + firstToUpper(dataType) ].get( x )) {
							 motusFilter.localAnimals = motusFilter.localAnimals.concat(Array.from(motusData["animalsBy" + firstToUpper(dataType)].get( x ).keys()));
						}
					})

			} else {

				motusFilter.localAnimals = localAnimals;

			}

			if (typeof foreignAnimals === "undefined") {

				// Search for non-local animals in tracks to or from a local station
				motusFilter.foreignAnimals = [];
/*
				motusData.tracks
					.filter( d => motusFilter.stations.includes(d.recv1) || motusFilter.stations.includes(d.recv2) )
					.forEach(function(d) {
						motusFilter.foreignAnimals += ","+d.animal;
					});

				motusFilter.foreignAnimals = motusFilter.foreignAnimals.split(',').filter(onlyUnique).filter( x => !motusFilter.localAnimals.includes(x) );*/

			} else {
				motusFilter.foreignAnimals = foreignAnimals;
			}

			// List which regions have local animals. This is to avoid error when trying to display detection data.
			motusFilter.selectionsWithAnimals = [];
			motusFilter[dataType].forEach(function(x){ if ( motusData["animalsBy" + firstToUpper(dataType)].get( x ) ) { motusFilter.selectionsWithAnimals.push(x) }; });

			//motusFilter.animals = motusFilter.localAnimals;

		} else if (dataType == 'species') {
			motusFilter[dataType]
				.forEach(function(x){
					if (motusData[ "animalsBy" + firstToUpper(dataType) ].get( x )) {
						 motusFilter.animals = motusFilter.animals.concat(Array.from(motusData["animalsBy" + firstToUpper(dataType)].get( x ).keys()));
					}
				})
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
	var colourScale = d3.scaleOrdinal().domain(['Foreign'].concat(motusFilter[dataType])).range(["#000000"].concat(customColourScale.jnnnnn.slice(0, motusFilter[dataType].length)));


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
	motusData.animalsByDayOfYear = [...Array(366).fill(0).map(x => ({local: [], foreign: [], visitor: []}))];
	motusData.animalsByHourOfDay = [...Array(24).fill(0).map(x => ({local: [], foreign: [], visitor: []}))];

	motusData.allTimes = [];

	motusData.selectedTracks = {}

	if (typeof selectedTracks === "undefined") {

		motusData.tracks.filter( d => motusFilter.stations.includes(d.recv1) || motusFilter.stations.includes(d.recv2) || d.animal.split(',').some( x => motusFilter.animals.includes(x) ) ).forEach(function(v) {

			var dtStart = v.dtStart.split(',');
			var dtEnd = v.dtEnd.split(',');
			var allTimes = [];
			var animals = [];
			var species = v.species.split(',');

			var origin = "Foreign";

			var selectedRecv1 = motusFilter.stations.includes(v.recv1);
			var selectedRecv2 = motusFilter.stations.includes(v.recv2);

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

				motusData.nTracks += v.animal.split(',').length;

			}

			if ( !['animals', 'species'].includes(dataType) ) {
				motusFilter[dataType].forEach(function(c) {
					if ( typeof motusData["animalsBy" + firstToUpper(dataType)].get( c ) !== 'undefined' &&
					 		 Array.from( motusData["animalsBy" + firstToUpper(dataType)].get( c ).keys() ).some(x => v.animal.split(',').includes(x))	) {
						origin = c;
					}
				});

			}

			v.animal.split(',').forEach(function(x, i){

				if (motusFilter.localAnimals.includes( x )) {
				  allTimes.push(dtStart[i]);
					allTimes.push(dtEnd[i]);
					if (selectedRecv1 || selectedRecv2) {
						motusData.animalsByDayOfYear[moment(dtStart[i]).dayOfYear()].local.push(x);
						motusData.animalsByDayOfYear[moment(dtEnd[i]).dayOfYear()].local.push(x);
					} else {
						motusData.animalsByDayOfYear[moment(dtStart[i]).dayOfYear()].foreign.push(x);
						motusData.animalsByDayOfYear[moment(dtEnd[i]).dayOfYear()].foreign.push(x);
					}
				} else {
					motusFilter.foreignAnimals.push(x);
					if (selectedRecv1) {
						allTimes.push(dtStart[i]);
						motusData.animalsByDayOfYear[moment(dtStart[i]).dayOfYear()].visitor.push(x);
					}
					if (selectedRecv2) {
						allTimes.push(dtEnd[i]);
						motusData.animalsByDayOfYear[moment(dtEnd[i]).dayOfYear()].visitor.push(x);
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

			motusData.selectedTracks[v.route] = {
				animals: v.animal,
				species: v.species,
				type: v.type,
				recv1: v.recv1,
				recv2: v.recv2,
				projID: v.project,
				route: v.route,
				dtStart: d3.min(allTimes),
				dtEnd: d3.max(allTimes),
				dtStartList: v.dtStart,
				dtEndList: v.dtEnd,
				origin: origin,
				frequency: v.frequency,
				coordinates: [ [v.lon1, v.lat1], [v.lon2, v.lat2]]
			};
		});
	} else {
		motusData.selectedTracks = selectedTracks;
	}


	motusFilter.foreignAnimals = 	motusFilter.foreignAnimals.filter(onlyUnique);
	motusFilter.animals = motusFilter.animals.concat(motusFilter.foreignAnimals);

	console.log("motusData: ", motusData);
	console.log("motusFilter: ", motusFilter);

	timeRange.min = moment(d3.min(motusData.allTimes));
	timeRange.max = moment(d3.max(motusData.allTimes));

	if (dtLims.min > moment(d3.min(motusData.allTimes))) {dtLims.min = moment(d3.min(motusData.allTimes));}
	if (dtLims.max < moment(d3.max(motusData.allTimes))) {dtLims.max = moment(d3.max(motusData.allTimes));}


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

	//console.log(motusData.recvDepsLink.filter(d => motusFilter.stations.includes(d.id)));
//	console.log("Stations: " + motusFilter.stations.length + " - Animals: " +regionAnimals.length);

				//  g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

	console.log("motusMap.regionPaths: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());

	if (!exploreProfile_hasLoaded) {



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
			.attr("transform", "rotate(90,15,20)");

		motusMap.regionPaths = motusMap.g.selectAll("regions")
		//	.data(motusData.selectedRegions)
			.data(motusData.polygons.features)
			.enter().append("path")
			.attr("d", motusMap.path)
			.attr('class', 'explore-map-regions leaflet-zoom-hide')
			.style('stroke', '#000')
		//	.style('fill', '#FFF')
			.style('fill', d => motusFilter.regions.includes(d.properties.adm0_a3) ? "#FFF" : "#CCC" )
			.style('stroke-width', '1px');

		motusMap.g.selectAll('stations')
			.data(motusData.recvDepsLink.filter(d => !motusFilter.stations.includes(d.id)))
			//.data(motusData.recvDepsLink)
			.enter().append("path")
			.attr("d", motusMap.path.pointRadius(3))
			.style('stroke', '#000')
			.style('fill', '#FF0')
			.attr('class', 'explore-map-stations explore-map-r2 leaflet-zoom-hide explore-map-stations-other')
			//.style('fill', d => motusFilter.stations.includes(d.id) ? "#F00" : "#000")
			.style('stroke-width', '1px')
			.style('pointer-events', 'auto')
			.on('mouseover', (e,d) => motusMap.dataHover(e, d, 'in', 'station'))
			.on('mouseout', (e,d) => motusMap.dataHover(e, d, 'out', 'station'))
			.on('click', (e,d) => motusMap.dataClick(e, d, 'station'));

		var yesterday = moment().subtract(1, 'days');

		motusMap.g.selectAll('stations')
			.data(motusData.recvDepsLink.filter(d => motusFilter.stations.includes(d.id)).sort((a, b) => d3.ascending(a.id, b.id)))
			//.data(motusData.recvDepsLink)
			.enter().append("path")
			.attr('marker-end','url(#station_path)')
			.attr("d", motusMap.path.pointRadius(6))
		//	.attr("d", "")
			.style('stroke', '#000')
			.style('fill', (d) => d.dtEnd > yesterday ? '#0F0' : '#F00')
			.attr('class', d => 'explore-map-stations leaflet-zoom-hide explore-map-stations-' + (d.dtEnd > yesterday ? 'active' : 'inactive') )
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
				.text("Active station");


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


		var g = stations_legend.append("g")
												   .attr('class', 'map-legend-stations-other selected')
													 .on('click', motusMap_legendClick);

		g.append("circle")
				.attr("cx", "10")
				.attr("cy", "55")
				.attr("r", 3)
				.style('stroke', '#000')
				.style('fill', '#FF0')
				.style('stroke-width', '1px')
				.style('pointer-events', 'auto');

		g.append("text")
				.attr("x", "20")
				.attr("y", "60")
				.text("Other station");


		motusMap.stationPaths = motusMap.g.selectAll('.explore-map-stations')

		if (motusData.selectedRegions) {

			motusMap.regionBounds = d3.geoPath().bounds({features:motusData.selectedRegions, type: "FeatureCollection"});

			motusMap.map.fitBounds( [ [motusMap.regionBounds[0][1], motusMap.regionBounds[0][0]], [motusMap.regionBounds[1][1], motusMap.regionBounds[1][0]]]);
		}
		//	alert(1);
		//console.log(regionCombos);

		setProgress(75);
		console.log("motusMap.trackPaths: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());
		motusMap.trackPaths = motusMap.g.selectAll("tracks")
		//	.data(trackDataLink)
			.data(Object.values(motusData.selectedTracks))
		//	.data(Array.from(motusData.selectedTracks.values()).filter(d => (motusFilter.stations.includes(d.recv1) || motusFilter.stations.includes(d.recv2))))
			.enter().append("path")
			.attr('class', (d) => "explore-map-tracks explore-map-species leaflet-zoom-hide explore-map-tracks-" + ( d.origin.toLowerCase() ))
			.attr("id", (d) => "track" + d.id)
			.style('stroke', (d) => colourScale(d.origin))
	//		.style('stroke', (d) => (d.origin == 'local' ? colourScale.range()[1] :  colourScale.range()[0] ))
			.style('pointer-events', 'auto')
			.style('stroke-width', '3px')
			.attr("d", motusMap.path)
			.on('mouseover', (e,d) => motusMap.dataHover(e, d, 'in', 'track'))
			.on('mouseout', (e,d) => motusMap.dataHover(e, d, 'out', 'track'))
			.on('click', (e,d) => motusMap.dataClick(e, d, 'track'));

		var h = 20;

		var tracks_svg = mapLegend.append("svg")
			.attr('class','map-legend-tracks');

		var max_length = 0;

		colourScale.range().forEach(function(x, i) {

			var g = tracks_svg.append("g");

			g.append("path")
				.attr("d", `M0,${10 + (i * h)} L30,${10 + (i * h)}`)
				.style('stroke', x )
				.style('stroke-width', '3px')
				.style('pointer-events', 'auto');

			var regionCode = colourScale.domain()[i];
			var regionName = regionCode == "Foreign" ? regionCode : motusData.selectionNames[ colourScale.domain()[i] ];

			g.append("text")
				.attr("x", 40)
				.attr("y", h * ( i + 0.75 ) )
				.text( regionName + " deployments" )
				.style('pointer-events', 'auto');

			var len = $("<div class='get-text-size'></div>").appendTo("body").css('font-size', '14pt').text(regionName).width();

			max_length = max_length < len ? len : max_length;

			g.attr("class","map-legend-tracks-" + regionCode + " selected")
				.style('pointer-events', 'auto')
				.on('click', motusMap_legendClick);

		});

		tracks_svg.attr('viewBox', `0 0 ${50 + max_length} ${colourScale.range().length * h}`)
			.attr('width', 50 + max_length)
			.attr('height', colourScale.range().length * h);


		motusMap.map.on("zoomend", motusMap.reset);


		// Reposition the SVG to cover the features.
		motusMap.reset();
}
	var countryByTrack = {};

	setProgress(90);

	console.log("regionNames.forEach[0]: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());

	Object.entries(motusData.selectionNames).forEach(function(a) {

		var k = a[0];
		var v = a[1];

		var stations = motusData[ "stationsBy" + firstToUpper(dataType) ].get(k);

		var routes = Array.from(stations.map(x => x.deployID).values()).map(x => motusData.tracksByStation[x]).flat().filter(x=>typeof x !== 'undefined');

		if (motusData[ "animalsBy" + firstToUpper(dataType) ].get(k)) {

			var animals = motusFilter.animals.filter((x) => motusData[ "animalsBy" + firstToUpper(dataType) ].get(k).get(x));

			var species = Array.from( animals.map( (x) => motusData[ "animalsBy" + firstToUpper(dataType) ].get(k).get(x)[0].species).values() ).filter( onlyUnique );

		} else {

			var animals = [],
				species = [];

		}

	//	console.log(Array.from( animals.map( (x) => motusData[ "animalsBy" + firstToUpper(dataType) ].get(k).get(x)[0].).values() ));
		routes.forEach(function(x) {
			if (((typeof countryByTrack[x] === 'undefined') || (countryByTrack[x] === k))) {
				countryByTrack[x] = k;
			} else {
				countryByTrack[x] = (countryByTrack[x] + ',' + k).split(',').sort(d3.ascending).join(',')
			}
		});

		var status = {
			tags: [ animals.length ],
			species: [species.length],
			projects: [Array.from(stations.map(x => x.projID).values()).filter(onlyUnique).length],
			stations: [stations.length]
		//	lastData: [Math.round( subset[subset.length-1].lastData )],
		}
		if (!exploreProfile_hasLoaded) {
			//console.log(status);
			addExploreCard({
				data: {},
				id: k,
				name: v,
				status: status,
				photo: ''
			});
		}
	});
	console.log("Map controls: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());

	var explore_legend = $("<div class='explore-legend' id='explore_legend'></div>");

	colourScale.domain().forEach(function(x){

		var div = explore_legend.append( "<div></div>" );
		div.append( `<div class='explore-legend-icon' style='border-color:${colourScale(x)}'></div>` );
		div.append( `${x=='Foreign'?x:motusData.selectionNames[x]}` );

	});



	if (!exploreProfile_hasLoaded) {
		addExploreCard({data:"add"});
		//$(".explore-card-profiles-tabs").before(explore_legend);
		$('#explore_map').parent().before($('#explore_card_profiles'));

		$('#explore_map').before("<div class='explore-map-controls'></div>")
		//$('#explore_map').before("<div class='explore-map-controls'>Map legend <input type='button' value='Hide tracks-local'><input type='button' value='Hide tracks-foreign'><input type='button' value='Hide stations'><input type='button' value='Hide regions'></div>")
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

			console.log("Stations: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());

			//	Add the card dom element to contain the chart
			addExploreCard({
					data:'tabs',
					type:'stationHits',
					header: 'Stations',
					tabs: {
						"Stations in this region": stationTable
						//"Station detection timelines": stationTimeline
					},
					defaultTab: "Stations in this region",
					attachEl:".explore-card-map",
					attachMethod:"after"
				});

			setProgress(70);

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
					//	"Animals in this region": animalTable,
						"Animal detection timeline": animalTimeline
					},
					defaultTab: "Animal detection timeline",
					attachEl: ".explore-card-map",
					attachMethod: "after"
				});

			addExploreCard({
					data:'tabs',
					type:'speciesHits',
					header: 'Species',
					tabs: {
						"Species in this region": speciesTable
					},
					defaultTab: "Species in this region",
					attachEl: ".explore-card-map",
					attachMethod: "after"
				});
			//	Add the timeline
		//	animalTimeline()

		}
	/*

		Finish up

	*/

	console.log("Finish up: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());

	//addExploreCard({data:'custom',type:'options',html:toAppend,attachEl:".explore-card-map",attachMethod:"after"});

	setCardColours( colourScale )

	motusFilter.animals = ['all'];
	motusFilter.stations = ['all'];
	updateURL();

	motusMap.setVisibility();
	console.log("End: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());

	setProgress(100);

	/*

		Functions

	*/

	function stationTimeline( d, {
			 													width = 300,
															  height = 60,
																timelineScale = d3.scaleLinear().domain([ timeRange.min, timeRange.max ]).range([ 0, width ]),
																dayWidth = timelineScale( timeRange.min + (1 * 24 * 60 * 60 * 1000) ),
																colourScale = d3.scaleSequential(d3.interpolateTurbo).domain([ 1, 10 ]),
																timelineSVG = $("<svg width='"+width+"' height='"+height+"' style='margin:-8px 0;cursor:pointer;'></svg>")
															} = {} ) {

		dayWidth = dayWidth < 1 ? 1 : dayWidth;

		var timeFormat = ( timeRange.range / (1000 * 60 * 60 * 24 * 365) ) * ( 300 / width ) > 2 ? "%Y" :
							( ( timeRange.range / (1000 * 60 * 60 * 24 * 365) ) * ( 300 / width ) > 1 ? "%b %Y" : "%Y-%m-%d" );

		var x_scale = d3.scaleTime()
									.domain( [ new Date(timeRange.min), new Date(timeRange.max) ] )
									.range( [0, width] );

		var axis_x = d3.axisTop( x_scale )
										.tickFormat( d3.timeFormat( timeFormat ) )
										.ticks( Math.round( width / 75 ) );

		var hasData = false;

		var svg = d3.select( timelineSVG[0] )
								.on("touchmove mousemove", dataHover)
								.on("toucheleave mouseleave", function(e) {dataHover(e, "out");});

		var stationHits = {};


		d.forEach(function(v) {

			var w = width * ((moment(v.dtEnd).valueOf()) - (moment(v.dtStart).valueOf())) / timeRange.range;
			var x = width * ((moment(v.dtStart).valueOf()) - timeRange.min) / timeRange.range;

			svg
				.append('rect')
				.attr('width', w)
				.attr('height', height)
				.attr('x', x)
				.style('fill', '#CCCCCC');


			var g = d3.select( timelineSVG[0] )
				.append('g');

			w = width * ( 24 * 60 * 60 * 3000 ) / timeRange.range;



			if (typeof motusData.tracksByStation[v.deployID] !== 'undefined') {

				hasData = true;

				motusData.tracksByStation[v.deployID].forEach(function(x){

					var datePos = ( x.split('.')[0] == v.deployID ? 'dtStart' : 'dtEnd' ) + 'List';

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

		var maxCount = d3.max(Object.values(stationHits), x => x.count);

		var maxSpp = d3.max(Object.values(stationHits), x => x.species.length);

		var g = d3.select( timelineSVG[0] )
			.append('g');

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
					"<big>"+
						( date )+
					"</big>"+
					(d ? 	`</br>${d.count} animals</br> ${d.species.length} species`: "") +
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

			/*

			if (dir == 'in') {

			$('.tooltip').html(
				"<big>"+
					(moment(d.date).toISOString().substr(0,10))+
				"</big></br>"+
					d.count+
				" animals</br>"+
					d.species.length+
				" species"+

				"</div>"
			);

			if (e.pageX + 15 + $('.tooltip').outerWidth() > $(window).width()) {
				$('.tooltip').css({top:e.pageY - 10, left:e.pageX - $('.tooltip').outerWidth() - 15});
			} else {
				$('.tooltip').css({top:e.pageY - 10, left:e.pageX + 15});
			}

			$('.tooltip:hidden').show();

			} else if (dir == 'out') {
				$('.tooltip').hide();
			}

		*/}
		function dataHeight(x) {
			return 2 + ( ( height - 25 ) * x.count / maxCount);
		}

		function translate(x) {
			return "translate(0, " + (((height - 25) - dataHeight(x))/2) + ")";
		}

		if (!hasData) {

			d3.select( timelineSVG[0] )
				.append('text')
				.attr('dy', '.3em')
				.attr('text-anchor', 'middle')
				.attr('x', (width / 2) )
				.attr('y', (height / 2) )
				.style('font-weight', '600')
				.text("NO DETECTIONS");

		}


		d3.select( timelineSVG[0] )
			.append( 'g' )
			.attr('transform', 'translate(0 60)')
			.call(axis_x);


		return timelineSVG[0];

	}


	function stationTable( cardID ) {

		$("#explore_card_stationHits .explore-card-stationHits-timeline").parent().hide();

		if ($(`#explore_card_${cardID} .explore-card-${cardID}-table`).length == 0) {

			//$("#explore_card_stationHits .explore-card-header").text("Stations in th" + ( motusFilter.regions.length > 1 ? "ese" : "is") + " region" + ( motusFilter.regions.length > 1 ? "s" : ""));

			var headers = ["Station Name", "Start Date", "Status", "Animals", "Species"];

			$(`#explore_card_${cardID}`)
				.append( $("<table></table>")
					.attr('class', `explore-card-${cardID}-table`)
					.append( $('<thead></thead>')
						.append( $('<tr></tr>')	)
					)
					.append( $('<tbody></tbody>') )
				)

			//headers.forEach( x => $(`#explore_card_${cardID} .explore-card-${cardID}-table thead tr`).append( $('<th></th>').text(x) ) );

			timeRange = {min: timeRange.min.valueOf(), max: timeRange.max.valueOf()}
			timeRange.range = timeRange.max - timeRange.min;

			var stationTableData = Array.from(
											d3.rollup(
												motusData.selectedStations,
												v => ({
													id: ( Array.from( v.map( d => d.deployID ).values() ) ).join(','),
													name: v[0].name,
													dtStart: moment(d3.min(v, d => d.dtStart)),
													dtEnd: moment(d3.max(v, d => d.dtEnd)),
													nAnimals: v.map(x => x.animals.split(';')).flat().filter(onlyUnique).length,
													nSpp: v.map(x => x.species.split(';')).flat().filter(onlyUnique).length,
													country: v[0].country
												}),
												d => d.name
											).values()
										);


			motusData.selectedStationDeployments = d3.group(
				motusData.selectedStations,
				d => d.name
			);

			console.log(stationTableData);

			var totalAnimals = d3.max(stationTableData, v => v.nAnimals);

			console.log(totalAnimals);

			var tableDom = stationTableData.length > 10 ? "ipt" : "t";

			$(`#explore_card_${cardID} .explore-card-${cardID}-table`).DataTable({
				data: stationTableData,
				columns: [
					{className: "explore-table-expandRow", data: null, orderable: false, defaultContent: ""},
					{data: "name", title: "Station", "createdCell": function(td, cdata, rdata){
						$(td).html(
								`<div class='explore-card-table-legend-icon' style='border-color:${colourScale(rdata.country)}'></div>`+
								`<a href='javascript:void(0);' onclick='viewProfile("stations", ${rdata.id});'>${rdata.name}</a>`
						);
					}},
					{data: "dtStart", title: "Start date", "createdCell": function(td, cdata, rdata){
						$(td).html( cdata );
					}},
					{data: "dtEnd", title: "Status", "createdCell": function(td, cdata, rdata){
						$(td).html( `${(moment().diff(cdata, 'day') < 1 ? "Active" : "Ended on:<br/>" + cdata.toISOString().substr(0,10) )}` );
					}},
					{data: "nAnimals", title: "Number of Animals"},
					{data: "nSpp", title: "Number of Species"}
				],
				dom: tableDom,
				autoWidth: false
			}).on('draw.dt', function(){
				$(`#explore_card_${cardID} .explore-card-${cardID}-table`).DataTable().rows().every(function(){

					this.child( stationTimeline( motusData.selectedStationDeployments.get( this.data().name ), { width: $(this.node() ).width() - 20 }  ) ).show();
					this.nodes().to$().addClass('shown');
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

		*/

		$("#explore_card_" + cardID + " > div:not(.explore-card-header)").hide();

		if ($(".explore-card-" + cardID + "-timeline").length == 0) {

			$("#explore_card_" + cardID + "")
				.append( $("<div class='explore-card-chart-wrapper'><div class='explore-card-" + cardID + "-timeline'><svg></svg></div></div>") )

			timelineAxisVals = [];

			motusData.tagHits = {};

			//timeRange = {};

			var animalsByDayOfYear = [];

			const group_by = 'month';
			const gSize = 12;	// size of date groups

			var day = 1;


			for (var i=1; i<=gSize; i++) {
				day = moment().month(i).dayOfYear();
				animalsByDayOfYear[ day ] = { "Julian date": day, visitor: [], local: [], foreign: [], total: [] };

				Object.values(motusData.selectionNames).forEach(function(d) {animalsByDayOfYear[ day ][ d ] = [];});
			}

			console.log(animalsByDayOfYear);
			motusData.animalsByDayOfYear.forEach( function(d, i) {

				if (d.local.length > 0 || d.foreign.length > 0 || d.visitor.length > 0) {

					const animalsToday = d.local.concat(d.foreign).concat(d.visitor);

					if (group_by != 'day') {
						day = moment()[group_by](moment().dayOfYear(i)[group_by]()).dayOfYear();
					} else {
						day = Math.floor( Math.floor( i / gSize ) * gSize );
					}


					motusFilter[ dataType ].forEach(function(k) {
						if (typeof motusData["animalsBy"+firstToUpper(dataType)].get( k ) !== 'undefined') {
							animalsByDayOfYear[ day ][ motusData.selectionNames[ k ] ] = animalsByDayOfYear[ day ][ motusData.selectionNames[ k ] ].concat(d.local.filter( x => motusData["animalsBy"+firstToUpper(dataType)].get( k ).get( x ).length > 0 ));
						}
					});
					animalsByDayOfYear[day].local = animalsByDayOfYear[day].local.concat(d.local);

					animalsByDayOfYear[day].foreign = animalsByDayOfYear[day].foreign.concat(d.foreign);
					animalsByDayOfYear[day].visitor = animalsByDayOfYear[day].visitor.concat(d.visitor);
					animalsByDayOfYear[day].total = animalsByDayOfYear[day].total.concat(animalsToday);

				}
			});

			animalsByDayOfYear = animalsByDayOfYear.map(function(d){

				var toReturn;

				for (k in d) {

					if (k != "Julian date") d[k] = d[k].filter(onlyUnique).length;

				}

				return d;
			});

			animalsByDayOfYear = animalsByDayOfYear.flat();

			animalsByDayOfYear.columns = Object.keys(animalsByDayOfYear[0])
			animalsByDayOfYear.columns.splice( animalsByDayOfYear.columns.indexOf('total'), 1 );
			animalsByDayOfYear.columns.splice( animalsByDayOfYear.columns.indexOf('local'), 1 );


			var radialColourScale = d3.scaleOrdinal().domain( ['visitor', 'foreign'].concat( motusFilter[dataType].map(x => motusData.selectionNames[ x ] ) ) ).range( ["#000000"].concat( customColourScale.jnnnnn.slice(0, motusFilter[dataType].length + 1) ) );

			console.log(animalsByDayOfYear);

			var radialChartConstruct = d3.radialBarChart().colourScale( radialColourScale );

			var radialChart = d3.select(".explore-card-" + cardID + "-timeline svg")
				.datum(animalsByDayOfYear).call(radialChartConstruct);

		}

		$("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline").parent().show();
	}

	if (motusData.animals.length > 0) {
		motusData.selectedAnimals = Array.from(motusData.animals.filter(
											x => motusFilter.animals.includes( x.deployID )
										).map(d => ({
											id: d.deployID,
											species: d.species,
											name: motusData.speciesByID.get(d.species)?motusData.speciesByID.get(d.species)[0].english:"Undefined",
											dtStart: moment(d.dtStart),
											dtEnd: moment(d.dtEnd),
											frequency: d.frequency,
											country: d.country,
											nStations: motusData.tracksByAnimal[d.deployID]?Array.from(motusData.tracksByAnimal[d.deployID].map(v=>v.split('.')).values()).flat().filter(onlyUnique):[],
											nDays: motusData.tracksByAnimal[d.deployID]?motusData.tracksByAnimal[d.deployID].length * 2:0
										})).values());
	}

	function animalTable( speciesID ) {

			var headers = ["Species", "Release Date", "Status", "Stations Visited", "Days detected"];

			var toReturn = "<table><thead><tr>";

			headers.forEach( x => toReturn+=`<th>${x}</th>` );

			toReturn += "</tr></thead><tbody>";

			motusData.animalsTableData.filter( d => d.species == speciesID ).forEach(function(d){

				toReturn += "<tr>"+
											"<td>"+
												`<div class='explore-card-table-legend-icon' style='border-color:${colourScale(d.country)}'></div>`+
												`<a href='javascript:void(0);' onclick='viewProfile(\"animals\", ${d.id});'>${d.name}</a>`+
											"</td>"+
											`<td>${d.dtStart.toISOString().substr(0,10)}</td>`+
											`<td>${(moment().diff(d.dtEnd, 'day') < 1 ? "Active" : "Ended on:<br/>" + d.dtEnd.toISOString().substr(0,10))}</td>`+
											`<td>${d.nStations.length}</td>`+
											`<td>${d.nDays}</td>`+
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

			motusData.animalsTableData = Array.from(motusData.selectedAnimals.map(d => ({
													id: d.deployID,
													species: d.species,
													name: motusData.speciesByID.get(d.species)?motusData.speciesByID.get(d.species)[0].english:"Undefined",
													dtStart: moment(d.dtStart),
													dtEnd: moment(d.dtEnd),
													frequency: d.frequency,
													country: d.country,
													nStations: (motusData.tracksByAnimal[d.deployID]?Array.from(motusData.tracksByAnimal[d.deployID].map(v=>v.split('.')).values()).flat().filter(onlyUnique):[]),
													nDays: motusData.tracksByAnimal[d.deployID]?motusData.tracksByAnimal[d.deployID].length * 2:0
												})).values());

			motusData.selectedSpecies = Array.from(
											d3.rollup(
												motusData.animalsTableData,
												v => ({
													id: ( Array.from( v.map( d => d.id ).values() ) ).join(','),
													species: v[0].species,
													name: v[0].name,
													dtStart: d3.min(v, d => d.dtStart),
													dtEnd: d3.max(v, d => d.dtEnd),
													nAnimals: v.length,
													nStations: (motusData.tracksBySpecies[v[0].species]?Array.from(motusData.tracksBySpecies[v[0].species].map(x=>x.split('.')).values()).flat().filter(onlyUnique):[]).length,
													country: v.reduce( function(a, c) { a.push( c.country ); return a; }, [ ]).filter(onlyUnique),
													colourCode: v.reduce( function(a, c) { a.push( colourScale( c.country ) ); return a; }, [ ]).filter(onlyUnique)
												}),
												d => d.name
											).values()
										);


/*

			motusData.selectedSpecies.forEach(function(d){

				var tr = $('<tr></tr>');

				tr.append( $('<td></td>').addClass(`explore-table-expandRow`) );

				tr.append(
							$('<td></td>')
								.append("<div class='explore-card-table-legend-icon' style='border-color:" + colourScale(d.country)+"'></div>")
								.append( $("<a href='javascript:void(0);' onclick='viewProfile(\"animals\", "+d.id+");'></a>").text( d.name ) )
						);
//				tr.append( $('<td></td>').text( d.dtStart.toISOString().substr(0,10) ) );

//				var dtEnd = d.dtEnd.toISOString().substr(0,10);

			//	tr.append( $('<td></td>').html( moment().diff(d.dtEnd, 'day') < 1 ? "Active" : "Ended on:<br/>" + dtEnd ) );

				tr.append( $('<td></td>').text( d.nAnimals ) );

				tr.append( $('<td></td>').text( d.nStations ) );

				$(`#explore_card_${cardID} .explore-card-${cardID}-speciesTable > tbody`).append( tr );

			});
			*/

			console.log(motusData.selectedSpecies);


			var tableDom = motusData.selectedSpecies.length > 10 ? "itp" : "t";

			$("#explore_card_" + cardID + " .explore-card-" + cardID + "-speciesTable").DataTable({
				data: motusData.selectedSpecies,
				columns: [
					{className: "explore-table-expandRow", data: null, orderable: false, defaultContent: ""},
					{data: "name", title: "Species", "createdCell": function(td, cdata, rdata){
						$(td).html(
							rdata.colourCode.reduce(function(a, c) {
								return c!="NA"?a+`<div class='explore-card-table-legend-icon' style='border-color:${c}'></div>`:a;
							}, (
									""//rdata.country[0] != "NA" ? `<div class='explore-card-table-legend-icon' style='border-color:${colourScale( rdata.country[0] )}'></div>` : ""
								)
							)+
							`<a href='javascript:void(0);' onclick='viewProfile("animals", ${rdata.id});'>${rdata.name}</a>`
						);
					}},
					{data: "nAnimals", title: "Number of Animals"},
					{data: "nStations", title: "Number of Stations"}
				],
				dom: tableDom,
				autoWidth: false
			});


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
						row.child( `<div class='explore-species-table-animals'>${animalTable( row.data().species )}</div>` ).show();
						tr.addClass('shown');
					}

				});


		} else {

			$("#explore_card_" + cardID + " .explore-card-" + cardID + "-speciesTable").parent().show();

		}
	}


}
