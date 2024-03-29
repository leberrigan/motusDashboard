var detailedView = false;
var exploreProfile_hasLoaded = false;

var selectedPolygons;
var regionStations;
var timeRange = {};
function exploreRegions(region) {


	var mapLegend = d3.create('div').attr("class", "explore-map-legend")
																	.attr("id", "explore_map_legend");
	mapLegend.append('div')
						.text('Map legend')
						.attr("class", "explore-map-legend-header")
							.append('span')
							.attr('class', 'showHide')
							.on('click', function(){$(this).closest('.explore-map-legend').toggleClass('hidden');});

	selectedPolygons = motusData.polygons.features.filter(x => motusFilter.regions.includes(x.properties.adm0_a3));

	motusFilter.regions = motusFilter.regions.filter(d => Array.from(motusData.stationDepsByRegions.keys()).includes(d));

	regionStations = motusFilter.regions.map(x => (motusData.stationDepsByRegions.get(x).map(s => s.deployID))).flat();


	/*
	addExploreCard({data:'chart', type:'regionProfile'});


	$("#explore_card_regionProfile .explore-card-header").text(selectedPolygons.map(x => x.properties.name).join(', '));

	$("#explore_card_regionProfile").css({width:"calc(50% - 42px)", height: "400px"});

	var svg = d3.select("#explore_card_regionProfile svg");


	var g = svg.append("g");//.attr("class", "leaflet-zoom-hide");

	var dims = [+$("#explore_card_regionProfile").width(), +$("#explore_card_regionProfile").height()];

	var path = d3.geoPath().projection(d3.geoMercator().fitSize(dims, {features:selectedPolygons, type: "FeatureCollection"}));



	*/


	// Get a list of region names from selected polygons
	var regionNames = d3.rollup(selectedPolygons, v => v[0].properties.name, k => k.properties.adm0_a3);

	// Get codes for all regions
	var regionCodes = Array.from(regionNames.keys());

	// ***
	// All possible combinations of region codes (for colouring tracks)** should be removed
	var regionCombos = [];

	for (var i = 0; i < regionCodes.length - 1; i++) {
	  // This is where you'll capture that last value
	  for (var j = i + 1; j < regionCodes.length; j++) {
		regionCombos.push(regionCodes[i]+","+regionCodes[j]);
	  }
	}

	// Add singles to region combos
	regionCombos = regionCodes.concat(regionCombos);

	// *** Above should be removed to '***'

	// Set colour scale based on number of colour combos
	var regionColourScale = d3.scaleOrdinal().domain(['Foreign'].concat(regionCodes)).range(["#000000"].concat(customColourScale.jnnnnn.slice(0, regionCodes.length)));


//	var regionColourScale = colourScale;


	// Create some empty data objects to be populated
	motusData.tracksByAnimal = {};
	motusData.tracksByStation = {};
	motusData.stationHits = {};
	motusData.animalsByDayOfYear = {};

	console.log("motusData.trackDataByRoute: "+ 0);

	// For measuring processing time
	var ts = [moment()];

	// Create an empty object to hold max and min timestamps for any working dataset.


	// Make a array of animal IDs for all local using 'animalsByRegions'
	var allLocalAnimals = [];

	for (i=0; i<regionCodes.length; i++) {
		if (motusData.animalsByRegions.get(regionCodes[i])) {
			 allLocalAnimals = allLocalAnimals.concat(Array.from(motusData.animalsByRegions.get(regionCodes[i]).keys()));
		}
	}

	// Get other animals that have visited the station, but were not released in that region
	var allForeignAnimals = [];

	motusData.tracks
		.filter( d => regionStations.includes(d.recv1) || regionStations.includes(d.recv2) )
		.forEach(function(d) {
			allForeignAnimals = allForeignAnimals.concat(d.animal.split(',').filter(x=>!allLocalAnimals.includes(x)))
		});

	// Remove duplicates
	allForeignAnimals = allForeignAnimals.filter(onlyUnique);

	// Combine foreign and local animal arrays
	var allAnimals = allForeignAnimals.concat(allLocalAnimals);

	// List which regions have local animals. This is to avoid error when trying to display detection data.
	var regionsWithAnimals = [];
	regionCodes.forEach(function(x){ if ( motusData.animalsByRegions.get( x ) ) { regionsWithAnimals.push(x) }; });

	// Empty animals filter
	var regionAnimals = allAnimals;

	console.log("motusFilter.trackDataByRoute[0]: " + moment().diff(ts[0]));ts.push(moment());

	motusData.trackDataByRoute = [];

	motusData.tracks.filter( d => d.animal.split(',').some( x => allAnimals.includes(x) ) ).forEach(function(v) {


		var origin = "Foreign";
		if (dtLims.min > dtStart) {dtLims.min = dtStart;}
		if (dtLims.max < dtEnd) {dtLims.max = dtEnd;}

		var selectedRecv1 = regionStations.includes(v.recv1);
		var selectedRecv2 = regionStations.includes(v.recv2);

		// Are one of the stations in the selection?

		if (selectedRecv1 || selectedRecv2) {

	//		regionAnimals +="," + v.animal

			if (selectedRecv1) {

				var dtStart = moment(d3.min(v.dtStart.split(',')));

				if (!timeRange.min || timeRange.min > dtStart)
					timeRange.min = dtStart;
				if (!timeRange.max || timeRange.max < dtStart)
					timeRange.max = dtStart;

				v.dtStart.split(',').forEach(function(x,i){
					var doy = moment(x).dayOfYear();
					motusData.animalsByDayOfYear[ doy ] = motusData.animalsByDayOfYear[ doy ] ? motusData.animalsByDayOfYear[ doy ] + "," + v.animal.split(',')[i] : v.animal.split(',')[i];
				});
			}

			if (selectedRecv2) {

				var dtEnd = moment(d3.max(v.dtEnd.split(',')));

				if (!timeRange.min || timeRange.min > dtEnd)
					timeRange.min = dtEnd;
				if (!timeRange.max || timeRange.max < dtEnd)
					timeRange.max = dtEnd;

				v.dtEnd.split(',').forEach(function(x,i){
					var doy = moment(x).dayOfYear();
					motusData.animalsByDayOfYear[ doy ] = motusData.animalsByDayOfYear[ doy ] ? motusData.animalsByDayOfYear[ doy ] + "," + v.animal.split(',')[i] : v.animal.split(',')[i];
				});

			}


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

		}

		if (!selectedRecv1) {



		}

		regionCodes.forEach(function(c) {
			if (
				Array.from( motusData.animalsByRegions.get( c ).keys() )
					.some(x => v.animal.split(',').includes(x))
				) {
				origin = c;
			}
		});

		motusData.nTracks += v.animal.split(',').length;
		v.animal.split(',').forEach(function(x){
			if (motusData.tracksByAnimal[x]) {
				motusData.tracksByAnimal[x].push(v.route);
			} else {
				motusData.tracksByAnimal[x] = [v.route];
			}
		});
		motusData.trackDataByRoute.push( {
			animals: v.animal,
			species: v.species,
			type: v.type,
			recv1: v.recv1,
			recv2: v.recv2,
			projID: v.project,
			route: v.route,
			dtStart: dtStart,
			dtEnd: dtEnd,
			dtStartList: v.dtStart,
			dtEndList: v.dtEnd,
			origin: origin,
			frequency: v.frequency,
			coordinates: [ [v.lon1, v.lat1], [v.lon2, v.lat2]]
		});
	});

//	console.log(motusData.stationHits);
	/*Array.from(motusData.trackDataByRoute.values()).filter(d => (regionStations.includes(d.recv1) || regionStations.includes(d.recv2))).forEach(function(d){
		regionAnimals += ","+d.animals;
	});*/
	console.log("regionAnimals: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());
	//regionAnimals = regionAnimals.substring(1).split(',').filter(onlyUnique);

	console.log("selectedTracks: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());

	var selectedTracks = Array.from(regionAnimals.map(x => motusData.tracksByAnimal[x]).values()).flat();//.filter(onlyUnique);

	console.log("motusMap.setVisibility(): " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());
	//console.log(regionAnimals);
	//console.log(motusData.tracksByAnimal);
	//console.log(selectedTracks);

	motusMap.setVisibility();

	//console.log(motusData.stations.filter(d => regionStations.includes(d.id)));
//	console.log("Stations: " + regionStations.length + " - Animals: " +regionAnimals.length);

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
		//	.data(selectedPolygons)
			.data(motusData.polygons.features)
			.enter().append("path")
			.attr("d", motusMap.path)
			.attr('class', 'explore-map-regions leaflet-zoom-hide')
			.style('stroke', '#000')
		//	.style('fill', '#FFF')
			.style('fill', d => motusFilter.regions.includes(d.properties.adm0_a3) ? "#FFF" : "#CCC" )
			.style('stroke-width', '1px');

		motusMap.g.selectAll('stations')
			.data(motusData.stations.filter(d => !regionStations.includes(d.id)))
			//.data(motusData.stations)
			.enter().append("path")
			.attr("d", motusMap.path.pointRadius(3))
			.style('stroke', '#000')
			.style('fill', '#FF0')
			.attr('class', 'explore-map-stations explore-map-r2 leaflet-zoom-hide explore-map-stations-other')
			//.style('fill', d => regionStations.includes(d.id) ? "#F00" : "#000")
			.style('stroke-width', '1px')
			.style('pointer-events', 'auto')
			.on('mouseover', (e,d) => motusMap.dataHover(e, d, 'in', 'station'))
			.on('mouseout', (e,d) => motusMap.dataHover(e, d, 'out', 'station'))
			.on('click', (e,d) => motusMap.dataClick(e, d, 'station'));

		var yesterday = moment().subtract(1, 'days');

		motusMap.g.selectAll('stations')
			.data(motusData.stations.filter(d => regionStations.includes(d.id)).sort((a, b) => d3.ascending(a.id, b.id)))
			//.data(motusData.stations)
			.enter().append("path")
			.attr('marker-end','url(#station_path)')
			.attr("d", motusMap.path.pointRadius(6))
		//	.attr("d", "")
			.style('stroke', '#000')
			.style('fill', (d) => d.dtEnd > yesterday ? '#0F0' : '#F00')
			.attr('class', d => 'explore-map-stations leaflet-zoom-hide explore-map-stations-' + (d.dtEnd > yesterday ? 'active' : 'inactive') )
	//		.style('fill', d => regionStations.includes(d.id) ? "#F00" : "#000")
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

		motusMap.regionBounds = d3.geoPath().bounds({features:selectedPolygons, type: "FeatureCollection"});

		motusMap.map.fitBounds( [ [motusMap.regionBounds[0][1], motusMap.regionBounds[0][0]], [motusMap.regionBounds[1][1], motusMap.regionBounds[1][0]]]);
	//	alert(1);
		//console.log(regionCombos);
		console.log(Array.from(motusData.trackDataByRoute.values()).filter(d => selectedTracks.includes(d.route)));

		setProgress(75);
		console.log("motusMap.trackPaths: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());
		motusMap.trackPaths = motusMap.g.selectAll("tracks")
		//	.data(trackDataLink)
			.data(Array.from(motusData.trackDataByRoute.values()).filter(d => selectedTracks.includes(d.route)))
		//	.data(Array.from(motusData.trackDataByRoute.values()).filter(d => (regionStations.includes(d.recv1) || regionStations.includes(d.recv2))))
			.enter().append("path")
			.attr('class', (d) => "explore-map-tracks explore-map-species leaflet-zoom-hide explore-map-tracks-" + ( d.origin.toLowerCase() ))
			.attr("id", (d) => "track" + d.id)
			.style('stroke', (d) => regionColourScale(d.origin))
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

		regionColourScale.range().forEach(function(x, i) {

			var g = tracks_svg.append("g");

			g.append("path")
				.attr("d", `M0,${10 + (i * h)} L30,${10 + (i * h)}`)
				.style('stroke', x )
				.style('stroke-width', '3px')
				.style('pointer-events', 'auto');

			var regionCode = regionColourScale.domain()[i];
			var regionName = regionCode == "Foreign" ? regionCode : regionNames.get( regionColourScale.domain()[i] );

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

		tracks_svg.attr('viewBox', `0 0 ${50 + max_length} ${regionColourScale.range().length * h}`)
			.attr('width', 50 + max_length)
			.attr('height', regionColourScale.range().length * h);


		motusMap.map.on("zoomend", motusMap.reset);


		// Reposition the SVG to cover the features.
		motusMap.reset();
}
	var countryByTrack = {};

	setProgress(90);

	console.log("regionNames.forEach[0]: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());

	regionNames.forEach(function(v, k) {

		var stations = motusData.stationDepsByRegions.get(k);

		var routes = Array.from(stations.map(x => x.deployID).values()).map(x => motusData.tracksByStation[x]).flat().filter(x=>typeof x !== 'undefined');

		if (motusData.animalsByRegions.get(k)) {

			var animals = allAnimals.filter((x) => motusData.animalsByRegions.get(k).get(x));

			var species = Array.from( animals.map( (x) => motusData.animalsByRegions.get(k).get(x)[0].species).values() ).filter( onlyUnique );

		} else {

			var animals = [],
				species = [];

		}

	//	console.log(Array.from( animals.map( (x) => motusData.animalsByRegions.get(k).get(x)[0].).values() ));
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

	regionColourScale.domain().forEach(function(x){

		var div = explore_legend.append( "<div></div>" );
		div.append( `<div class='explore-legend-icon' style='border-color:${regionColourScale(x)}'></div>` );
		div.append( `${x=='Foreign'?x:regionNames.get(x)}` );

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


		if (allAnimals.length > 0) {

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

	setCardColours( regionColourScale )

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

			var w = width * (v.dtEnd - v.dtStart) / timeRange.range;
			var x = width * (v.dtStart - timeRange.min) / timeRange.range;

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

					var trackData = motusData.trackDataByRoute.get(+x);

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

			motusData.selectedStations = Array.from(
											d3.rollup(
												motusData.stationDeps.filter(
													x => regionStations.includes( x.deployID )
												),
												v => ({
													id: ( Array.from( v.map( d => d.deployID ).values() ) ).join(','),
													name: v[0].name,
													dtStart: d3.min(v, d => d.dtStart),
													dtEnd: d3.max(v, d => d.dtEnd),
													nAnimals: v.map(x => x.animals.split(';')).flat().filter(onlyUnique).length,
													nSpp: v.map(x => x.species.split(';')).flat().filter(onlyUnique).length,
													country: v[0].country
												}),
												d => d.name
											).values()
										);


			motusData.selectedStationDeployments = d3.group(
				motusData.stationDeps.filter(
					x => regionStations.includes( x.deployID )
				),
				d => d.name
			);

			console.log(motusData.stationDeps.filter(
													x => regionStations.includes( x.deployID )
												));

			var totalAnimals = d3.max(motusData.selectedStations, v => v.nAnimals);

			console.log(totalAnimals);

			var tableDom = motusData.selectedStations.length > 10 ? "ipt" : "t";

			$(`#explore_card_${cardID} .explore-card-${cardID}-table`).DataTable({
				data: motusData.selectedStations,
				columns: [
					{className: "explore-table-expandRow", data: null, orderable: false, defaultContent: ""},
					{data: "name", title: "Station", "createdCell": function(td, cdata, rdata){
						$(td).html(
								`<div class='explore-card-table-legend-icon' style='border-color:${regionColourScale(rdata.country)}'></div>`+
								`<a href='javascript:void(0);' onclick='viewProfile("stations", ${rdata.deployID});'>${rdata.name}</a>`
						);
					}},
					{data: "dtStart", title: "Station", "createdCell": function(td, cdata, rdata){
						$(td).html( cdata );
					}},
					{data: "dtEnd", title: "Station", "createdCell": function(td, cdata, rdata){
						$(td).html( `${(moment().diff(moment(cdata), 'day') < 1 ? "Active" : "Ended on:<br/>" + cdata )}` );
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
		console.log('make timeline')
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
				animalsByDayOfYear[ day ] = { "Julian date": day, local: 0, Foreign: 0, total: [] };
			}

			for (d in motusData.animalsByDayOfYear) {

				const animalsToday = motusData.animalsByDayOfYear[d].split(',').filter(onlyUnique);

						if (group_by != 'day') {
							day = moment()[group_by](moment().dayOfYear(d)[group_by]()).dayOfYear();
						} else {
							day = Math.floor(Math.floor(d/gSize)*gSize);
						}

						animalsByDayOfYear[day].total = animalsByDayOfYear[day].total.concat(animalsToday);

			}

			animalsByDayOfYear = animalsByDayOfYear.map(function(d){

				if (d.total.length > 0) {

					var localAnimals = {all: []};

					d.total = d.total.filter(onlyUnique);

					d.local = 0;

						for (var i = 0; i < regionCodes.length; i++ ) {

							d[ motusData.regionByCode.get( regionCodes[i] )[0].country ] = d.total.filter(x => Array.from(motusData.animalsByRegions.get( regionCodes[i] ).keys()).includes(x) ).length;

							d.local += d[ motusData.regionByCode.get( regionCodes[i] )[0].country ];

						}

					d.total = d.total.length;

					d.Foreign = d.total - d.local;

				} else {d.total = 0;}

				return d;
			});

			animalsByDayOfYear = animalsByDayOfYear.flat();

			animalsByDayOfYear.columns = Object.keys(animalsByDayOfYear[0])
			animalsByDayOfYear.columns.splice( animalsByDayOfYear.columns.indexOf('total'), 1 );
			animalsByDayOfYear.columns.splice( animalsByDayOfYear.columns.indexOf('local'), 1 );

			var regionNameColourScale = d3.scaleOrdinal().domain( ['Foreign'].concat( regionCodes.map(x => motusData.regionByCode.get( x )[0].country) ) ).range( ["#000000"].concat( customColourScale.jnnnnn.slice(0, regionCodes.length) ) );

			var radialChartConstruct = d3.radialBarChart().colourScale( regionNameColourScale );

			var radialChart = d3.select(".explore-card-" + cardID + "-timeline svg")
				.datum(animalsByDayOfYear).call(radialChartConstruct);

		}

		$("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline").parent().show();
	}

	if (motusData.animals.length > 0) {
		motusData.selectedAnimals = Array.from(motusData.animals.filter(
											x => allAnimals.includes( x.deployID )
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

			motusData.selectedAnimals.filter( d => d.species == speciesID ).forEach(function(d){

				toReturn += "<tr>"+
											"<td>"+
												`<div class='explore-card-table-legend-icon' style='border-color:${regionColourScale(d.country)}'></div>`+
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

			if (typeof motusData.selectedAnimals === 'undefined') {
				motusData.selectedAnimals = Array.from(motusData.animals.filter(
													x => allAnimals.includes( x.deployID )
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
			motusData.selectedSpecies = Array.from(
											d3.rollup(
												motusData.selectedAnimals,
												v => ({
													id: ( Array.from( v.map( d => d.id ).values() ) ).join(','),
													species: v[0].species,
													name: v[0].name,
													dtStart: d3.min(v, d => d.dtStart),
													dtEnd: d3.max(v, d => d.dtEnd),
													nAnimals: v.length,
													nStations: d3.sum(v, d => d.nStations),
													country: v.reduce( function(a, c) { a.push( c.country ); return a; }, [ ]).filter(onlyUnique),
													colourCode: v.reduce( function(a, c) { a.push( regionColourScale( c.country ) ); return a; }, [ ]).filter(onlyUnique)
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
								.append("<div class='explore-card-table-legend-icon' style='border-color:" + regionColourScale(d.country)+"'></div>")
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
									""//rdata.country[0] != "NA" ? `<div class='explore-card-table-legend-icon' style='border-color:${regionColourScale( rdata.country[0] )}'></div>` : ""
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
