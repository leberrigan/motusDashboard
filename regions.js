var detailedView = false;
var exploreProfile_hasLoaded = false;

var selectedPolygons;
var regionStations;
function exploreRegions(region) {

	selectedPolygons = motusData.polygons.features.filter(x => motusFilter.regions.includes(x.properties.adm0_a3));

	motusFilter.regions = motusFilter.regions.filter(d => Array.from(motusData.stationsByCountry.keys()).includes(d));

	regionStations = motusFilter.regions.map(x => (motusData.stationsByCountry.get(x).map(s => s.deployID))).flat();


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
	var timeRange = {};


	// Make a array of animal IDs for all local using 'animalsByCountry'
	var allLocalAnimals = [];

	for (i=0; i<regionCodes.length; i++) {
		if (motusData.animalsByCountry.get(regionCodes[i])) {
			 allLocalAnimals = allLocalAnimals.concat(Array.from(motusData.animalsByCountry.get(regionCodes[i]).keys()));
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
	regionCodes.forEach(function(x){ if ( motusData.animalsByCountry.get( x ) ) { regionsWithAnimals.push(x) }; });

	// Empty animals filter
	var regionAnimals = allAnimals;

	console.log("motusFilter.trackDataByRoute[0]: " + moment().diff(ts[0]));ts.push(moment());


	motusData.trackDataByRoute = d3.rollup(motusData.tracks.filter(d=>d.animal.split(',').some(x=>allAnimals.includes(x))), function(v) {
		var dtStart = moment(d3.min(v[0].dtStart.split(',')));
		var dtEnd = moment(d3.min(v[0].dtEnd.split(',')));
		var origin = "Foreign";
		if (dtLims.min > dtStart) {dtLims.min = dtStart;}
		if (dtLims.max < dtEnd) {dtLims.max = dtEnd;}

		var selectedRecv1 = regionStations.includes(v[0].recv1);
		var selectedRecv2 = regionStations.includes(v[0].recv2);

		if (selectedRecv1 || selectedRecv2) {

	//		regionAnimals +="," + v[0].animal

			if (selectedRecv1) {

				if (!timeRange.min || timeRange.min > dtStart)
					timeRange.min = dtStart;
				if (!timeRange.max || timeRange.max < dtStart)
					timeRange.max = dtStart;

				motusData.animalsByDayOfYear[dtStart.dayOfYear()] = motusData.animalsByDayOfYear[dtStart.dayOfYear()] ? motusData.animalsByDayOfYear[dtStart.dayOfYear()] + "," + v[0].animal : v[0].animal;
			}

			if (selectedRecv2) {

				if (!timeRange.min || timeRange.min > dtEnd)
					timeRange.min = dtEnd;
				if (!timeRange.max || timeRange.max < dtEnd)
					timeRange.max = dtEnd;

				motusData.animalsByDayOfYear[dtStart.dayOfYear()] = motusData.animalsByDayOfYear[dtStart.dayOfYear()] ? motusData.animalsByDayOfYear[dtStart.dayOfYear()] + "," + v[0].animal : v[0].animal;
			}


			if (!motusData.tracksByStation[v[0].recv1]) {
				motusData.tracksByStation[v[0].recv1] = [v[0].route];
			} else {
				motusData.tracksByStation[v[0].recv1].push(v[0].route);
			}
			if (!motusData.tracksByStation[v[0].recv2]) {
				motusData.tracksByStation[v[0].recv2] = [v[0].route];
			} else {
				motusData.tracksByStation[v[0].recv2].push(v[0].route);
			}

		}

		regionCodes.forEach(function(c) {
			if (
				Array.from( motusData.animalsByCountry.get( c ).keys() )
					.some(x => v[0].animal.split(',').includes(x))
				) {
				origin = c;
			}
		});

		motusData.nTracks += v[0].animal.split(',').length;
		v[0].animal.split(',').forEach(function(x){
			if (motusData.tracksByAnimal[x]) {
				motusData.tracksByAnimal[x].push(v[0].route);
			} else {
				motusData.tracksByAnimal[x] = [v[0].route];
			}
		});
		return {
			animals: v[0].animal,
			species: v[0].species,
			type: v[0].type,
			recv1: v[0].recv1,
			recv2: v[0].recv2,
			projID: v[0].project,
			route: v[0].route,
			dtStart: dtStart,
			dtEnd: dtEnd,
			dtStartList: v[0].dtStart,
			dtEndList: v[0].dtEnd,
			origin: origin,
			frequency: v[0].frequency,
			coordinates: [ [v[0].lon1, v[0].lat1], [v[0].lon2, v[0].lat2]]
		}
	}, x => +x.route );

	setProgress(50);
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

	//console.log(motusData.recvDepsLink.filter(d => regionStations.includes(d.id)));
//	console.log("Stations: " + regionStations.length + " - Animals: " +regionAnimals.length);

				//  g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

	console.log("motusMap.regionPaths: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());

	if (!exploreProfile_hasLoaded) {
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
			.data(motusData.recvDepsLink.filter(d => !regionStations.includes(d.id)))
			//.data(motusData.recvDepsLink)
			.enter().append("path")
			.attr("d", motusMap.path.pointRadius(3))
			.style('stroke', '#000')
			.style('fill', '#FF0')
			.attr('class', 'explore-map-stations explore-map-r2 leaflet-zoom-hide')
			//.style('fill', d => regionStations.includes(d.id) ? "#F00" : "#000")
			.style('stroke-width', '1px')
			.style('pointer-events', 'auto')
			.on('mouseover', (e,d) => motusMap.dataHover(e, d, 'in', 'station'))
			.on('mouseout', (e,d) => motusMap.dataHover(e, d, 'out', 'station'))
			.on('click', (e,d) => motusMap.dataClick(e, d, 'station'));

		motusMap.g.selectAll('stations')
			.data(motusData.recvDepsLink.filter(d => regionStations.includes(d.id)).sort((a, b) => d3.ascending(a.id, b.id)))
			//.data(motusData.recvDepsLink)
			.enter().append("path")
			.attr("d", motusMap.path.pointRadius(5))
			.style('stroke', '#000')
			.style('fill', (d) => d.dtEnd > moment().subtract(1, 'days') ? '#0F0' : '#F00')
			.attr('class', 'explore-map-stations leaflet-zoom-hide')
			//.style('fill', d => regionStations.includes(d.id) ? "#F00" : "#000")
			.style('stroke-width', '1px')
			.style('pointer-events', 'auto')
			.on('mouseover', (e,d) => motusMap.dataHover(e, d, 'in', 'station'))
			.on('mouseout', (e,d) => motusMap.dataHover(e, d, 'out', 'station'))
			.on('click', (e,d) => motusMap.dataClick(e, d, 'station'));

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
			.attr('class', (d) => "explore-map-tracks explore-map-species leaflet-zoom-hide explore-map-tracks-" + d.origin)
			.attr("id", (d) => "track" + d.id)
			.style('stroke', (d) => regionColourScale(d.origin))
	//		.style('stroke', (d) => (d.origin == 'local' ? colourScale.range()[1] :  colourScale.range()[0] ))
			.style('pointer-events', 'auto')
			.style('stroke-width', '3px')
			.attr("d", motusMap.path)
			.on('mouseover', (e,d) => motusMap.dataHover(e, d, 'in', 'track'))
			.on('mouseout', (e,d) => motusMap.dataHover(e, d, 'out', 'track'))
			.on('click', (e,d) => motusMap.dataClick(e, d, 'track'));

		motusMap.map.on("zoomend", motusMap.reset);

		// Reposition the SVG to cover the features.
		motusMap.reset();
}
	var countryByTrack = {};

	setProgress(90);

	console.log("regionNames.forEach[0]: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());

	regionNames.forEach(function(v, k) {

		var stations = motusData.stationsByCountry.get(k);

		var routes = Array.from(stations.map(x => x.deployID).values()).map(x => motusData.tracksByStation[x]).flat().filter(x=>typeof x !== 'undefined');

		if (motusData.animalsByCountry.get(k)) {

			var animals = allAnimals.filter((x) => motusData.animalsByCountry.get(k).get(x));

			var species = Array.from( animals.map( (x) => motusData.animalsByCountry.get(k).get(x)[0].species).values() ).filter( onlyUnique );

		} else {

			var animals = [],
				species = [];

		}

	//	console.log(Array.from( animals.map( (x) => motusData.animalsByCountry.get(k).get(x)[0].).values() ));
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


	if (!exploreProfile_hasLoaded) {
		addExploreCard({data:"add"});

		$('#explore_map').parent().before($('#explore_card_profiles'));

		$('#explore_map').parent().append("<div class='explore-map-controls'>Map controls <input type='button' value='Hide tracks-local'><input type='button' value='Hide tracks-foreign'><input type='button' value='Hide stations'><input type='button' value='Hide regions'></div>")

		$(".explore-map-controls input[type=button]").click(function(){var toggleEls = this.value.toLowerCase().split(' ');motusMap.setVisibility(false, toggleEls);this.value = (toggleEls[0] == 'hide' ? 'Show' : 'Hide') + " " + toggleEls[1];});
	}

	$("#explore_card_profiles").toggleClass('simple-card', !detailedView);

	exploreProfile_hasLoaded = true;

	if (detailedView) {


			/*


				Stations


			*/

			console.log("Stations: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());

			//	Add the card dom element to contain the chart
			addExploreCard({
					data:'tabs',
					type:'stationHits',
					header: '',
					tabs: {
						"Stations in this region": stationTable,
						"Station detection timelines": stationTimeline
					},
					defaultTab: "Stations in this region",
					attachEl:".explore-card-map",
					attachMethod:"before"
				});

			setProgress(70);




			/*


				Animals


			*/


			console.log("Animals: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());

			//	Add the card dom element to contain the chart
		//	addExploreCard({data:'chart', type:'tagHits'});
		addExploreCard({
				data:'tabs',
				type:'tagHits',
				header: '',
				tabs: {
					"Animals in this region": animalTable,
					"Species in this region": speciesTable,
					"Animal detection timeline": animalTimeline
				},
				defaultTab: "Animal detection timeline",
				attachEl: ".explore-card-map",
				attachMethod: "after"
			});


		if (allAnimals.length > 0) {

			//	Add the timeline
		//	animalTimeline()

		}
	}
	/*

		Finish up

	*/

	console.log("Finish up: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());
	var toAppend = "<input type='button' value='Table of animals detected' />"+
					"<input type='button' value='Table of species detected' />"+
					"<input type='button' value='Table of stations' />"+
					"<input type='button' value='Table of projects' />";

	//addExploreCard({data:'custom',type:'options',html:toAppend,attachEl:".explore-card-map",attachMethod:"after"});

	console.log(regionColourScale("COL"));
	console.log(regionColourScale("BHS"));

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


	function stationTimeline() {

		/*

			The OLD timeline is no good. It is ugly. It is not very useful. It is hard to control. It is hard to interpret.

			My solution is to have a toggle on the table which displays the timeline. This timeline will be displayed
				in place of the rows of the pre-existing data-table. Similarly, the header will be replaced with a date
				legend. The timeline will have greyed backgrouned for deployment periods. Circles (or area) will
				represent detections of animals. Circle radius reflects number of animals detected in a day. Circle
				colour reflects number of species detected in the day. If space allows, dates of the start and end of
				deployments will be printed to the left and right of the deployment rectangle, respectively.

			Maybe I could make a datatable where the first row is the name and the second row is the timeline.
				Header is the timeline axis legend.

		*/

		$("#explore_card_stationHits .explore-card-stationHits-table").parent().hide();

		if ($('.explore-card-stationHits-timeline').length == 0) {

			timeRange = {min: timeRange.min.valueOf(), max: timeRange.max.valueOf()}
			timeRange.range = timeRange.max - timeRange.min;



			var width = 300,
				height = 36;

			var headers = ["Station Name", "<svg width='"+width+"' height='40'></svg>"];

			var axis_vals = [];

			for (var i=0; i <= width / 75; i++) {

				var t = timeRange.min + ( ( timeRange.range / Math.round( width / 75 ) ) * i );

				axis_vals.push( new Date(t) );

			}

			var timeFormat = ( timeRange.range / (1000 * 60 * 60 * 24 * 365) ) > 2 ? "%Y" :
								( ( timeRange.range / (1000 * 60 * 60 * 24 * 365) ) > 1 ? "%b %Y" : "%Y-%m-%d" )

			//console.log(axis_vals);

			$("#explore_card_stationHits")
				.append( $("<table></table>")
					.attr('class', 'explore-card-stationHits-timeline')
					.append( $('<thead></thead>')
						.append( $('<tr></tr>')	)
					)
					.append( $('<tbody></tbody>') )
				)

			headers.forEach( x => $("#explore_card_stationHits .explore-card-stationHits-timeline thead tr").append( $('<th></th>').html(x) ) );

			var axis_x = d3.axisTop(
					d3.scaleTime()
						.domain( [ new Date(timeRange.min), new Date(timeRange.max) ] )
						.range( [0, width] )
				)
				.tickFormat( d3.timeFormat( timeFormat ) )
				.ticks( Math.round( width / 75 ) )
				//.tickValues(axis_vals)


			d3.select( $("#explore_card_stationHits .explore-card-stationHits-timeline thead th:nth-child(2) svg")[0] )
				.append( 'g' )
					.attr('transform', 'translate(0 30)')
					.call(axis_x);


			motusData.selectedStations = Array.from(
											d3.group(
												motusData.stations.filter(
													x => regionStations.includes( x.id )
												),
												d => d.name
											).values()
										);


			var timelineScale = d3.scaleLinear().domain([ timeRange.min, timeRange.max ]).range([ 0, width ]);

			var dayWidth = timelineScale( timeRange.min + (1 * 24 * 60 * 60 * 1000) );
			dayWidth = dayWidth < 1 ? 1 : dayWidth;

			var colourScale = d3.scaleSequential(d3.interpolateTurbo).domain([ 1, 10 ]);

			motusData.selectedStations.forEach(function(d){

				var tr = $('<tr></tr>');

				tr.append(
					$('<td></td>')
						.append("<div class='explore-card-table-legend-icon' style='border-color:" + regionColourScale(d[0].country)+"'></div>")
						.append(
							$("<a href='javascript:void(0);' onclick='viewProfile(\"stations\", "+d[0].id+");'></a>").text( d[0].name  )
						)
					);

				var timelineSVG = $("<svg width='"+width+"' height='"+height+"' style='margin:-8px 0;'></svg>");

				var hasData = false;

				d.forEach(function(v) {

					var w = width * (v.dtEnd - v.dtStart) / timeRange.range;
					var x = width * (v.dtStart - timeRange.min) / timeRange.range;

					d3.select( timelineSVG[0] )
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

						var stationHits = {};

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

								for (var i = 0; i < data[0].length; i++) {
									if ( typeof stationHits[data[0][i]] !== 'undefined' ) {
										stationHits[data[0][i]].count += data[1][i];
										stationHits[data[0][i]].species = stationHits[data[0][i]].species.concat(data[2][i]).filter(onlyUnique);
									} else {
										stationHits[data[0][i]] = {date: data[0][i], count: data[1][i], species: data[2][i].filter(onlyUnique)};
									}
								}
							}

						});

						var maxCount = d3.max(Object.values(stationHits), x => x.count);

						var maxSpp = d3.max(Object.values(stationHits), x => x.species.length);

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

						function dataHeight(x) {
							return 2 + (height * x.count / maxCount);
						}

						function translate(x) {
							return "translate(0, " + ((height - dataHeight(x))/2) + ")";
						}

					} else {
						// no data
					}

				});

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

				tr.append( $('<td></td>').append(timelineSVG) );

				$("#explore_card_stationHits .explore-card-stationHits-timeline tbody").append( tr );


			});

			var tableDom = $("#explore_card_stationHits .explore-card-stationHits-timeline tbody tr").length > 10 ? "ipt" : "t";

			$("#explore_card_stationHits .explore-card-stationHits-timeline").DataTable({dom: tableDom });

		} else {

			$("#explore_card_stationHits .explore-card-stationHits-timeline").parent().show();

		}
		console.log($("#explore_card_stationHits table:visible").DataTable().rows().data())
	}

	function stationTable() {

		$("#explore_card_stationHits .explore-card-stationHits-timeline").parent().hide();

		if ($('.explore-card-stationHits-table').length == 0) {

			//$("#explore_card_stationHits .explore-card-header").text("Stations in th" + ( motusFilter.regions.length > 1 ? "ese" : "is") + " region" + ( motusFilter.regions.length > 1 ? "s" : ""));

			var headers = ["Station Name", "Start Date", "Status", "Animals", "Species"];

			$("#explore_card_stationHits")
				.append( $("<table></table>")
					.attr('class', 'explore-card-stationHits-table')
					.append( $('<thead></thead>')
						.append( $('<tr></tr>')	)
					)
					.append( $('<tbody></tbody>') )
				)

			headers.forEach( x => $("#explore_card_stationHits .explore-card-stationHits-table thead tr").append( $('<th></th>').text(x) ) );


			motusData.selectedStations = Array.from(
											d3.rollup(
												motusData.stations.filter(
													x => regionStations.includes( x.id )
												),
												v => ({
													id: ( Array.from( v.map( d => d.id ).values() ) ).join(','),
													name: v[0].name,
													dtStart: d3.min(v, d => d.dtStart),
													dtEnd: d3.max(v, d => d.dtEnd),
													nAnimals: d3.sum(v, d => d.nAnimals),
													nSpp: d3.max(v, d => d.nSpp),
													country: v[0].country
												}),
												d => d.name
											).values()
										);

			console.log(motusData.stations.filter(
													x => regionStations.includes( x.id )
												));

			var totalAnimals = d3.max(motusData.selectedStations, v => v.nAnimals);

			console.log(totalAnimals);

			motusData.selectedStations.forEach(function(d){

				var tr = $('<tr></tr>');


				var nAnimals = Math.round(Math.random() * totalAnimals);

				var animalsBar = $('<div></div>')
									.css({
										width: (100 * d.nAnimals / totalAnimals) + "%",
										background: "#000",
										height: "20px",
										color: "#FFF"
									})
									.text( nAnimals ) ;

				tr.append(
							$('<td></td>')
								.append("<div class='explore-card-table-legend-icon' style='border-color:" + regionColourScale(d.country)+"'></div>")
								.append( $("<a href='javascript:void(0);' onclick='viewProfile(\"stations\", "+d.id+");'></a>").text( d.name ) )
						);

				tr.append( $('<td></td>').text( d.dtStart.toISOString().substr(0,10) ) );

				var dtEnd = d.dtEnd.toISOString().substr(0,10);

				tr.append( $('<td></td>').html( moment().diff(d.dtEnd, 'day') < 1 ? "Active" : "Ended on:<br/>" + dtEnd ) );

				tr.append( $('<td></td>').text( d.nAnimals ) );

				tr.append( $('<td></td>').text( d.nSpp ) );

			//	tr.append( $('<td></td>').append( animalsBar ).css({ width: 300 + "px" } ));

				$("#explore_card_stationHits .explore-card-stationHits-table tbody").append( tr );


			});

			var tableDom = $("#explore_card_stationHits .explore-card-stationHits-table tbody tr").length > 10 ? "ipt" : "t";

			$("#explore_card_stationHits .explore-card-stationHits-table").DataTable({dom: tableDom });

		} else {

			$("#explore_card_stationHits .explore-card-stationHits-table").parent().show();

		}

	}


	function animalTimeline() {

		$("#explore_card_tagHits > div:not(.explore-card-header)").hide();

		if ($('.explore-card-tagHits-timeline').length == 0) {

			$("#explore_card_tagHits")
				.append( $("<div class='explore-card-chart-wrapper'><div class='explore-card-tagHits-timeline'><svg></svg></div></div>") )

			timelineAxisVals = [];

			motusData.tagHits = {};

			timeRange = {};

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

							d[ motusData.regionByCode.get( regionCodes[i] )[0].country ] = d.total.filter(x => Array.from(motusData.animalsByCountry.get( regionCodes[i] ).keys()).includes(x) ).length;

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

			var radialChart = d3.select(".explore-card-tagHits-timeline svg")
				.datum(animalsByDayOfYear).call(radialChartConstruct);

		}

		$("#explore_card_tagHits .explore-card-tagHits-timeline").parent().show();
	}


	function animalTable() {

		$("#explore_card_tagHits > div:not(.explore-card-header)").hide();

		if ($('.explore-card-tagHits-table').length == 0) {

			//$("#explore_card_stationHits .explore-card-header").text("Stations in th" + ( motusFilter.regions.length > 1 ? "ese" : "is") + " region" + ( motusFilter.regions.length > 1 ? "s" : ""));

			var headers = ["Species", "Release Date", "Status", "Stations Visited", "Days detected"];

			$("#explore_card_tagHits")
				.append( $("<table></table>")
					.attr('class', 'explore-card-tagHits-table')
					.append( $('<thead></thead>')
						.append( $('<tr></tr>')	)
					)
					.append( $('<tbody></tbody>') )
				)

			headers.forEach( x => $("#explore_card_tagHits .explore-card-tagHits-table thead tr").append( $('<th></th>').text(x) ) );


			console.log(motusData.animals);
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

			var totalStations = 20;

			motusData.selectedAnimals.forEach(function(d){

				var tr = $('<tr></tr>');

				tr.append(
							$('<td></td>')
								.append("<div class='explore-card-table-legend-icon' style='border-color:" + regionColourScale(d.country)+"'></div>")
								.append( $("<a href='javascript:void(0);' onclick='viewProfile(\"animals\", "+d.id+");'></a>").text( d.name ) )
						);

				tr.append( $('<td></td>').text( d.dtStart.toISOString().substr(0,10) ) );

				var dtEnd = d.dtEnd.toISOString().substr(0,10);

				tr.append( $('<td></td>').html( moment().diff(d.dtEnd, 'day') < 1 ? "Active" : "Ended on:<br/>" + dtEnd ) );

				tr.append( $('<td></td>').text( d.nStations.length ) );

				tr.append( $('<td></td>').text( d.nDays ) );

				$("#explore_card_tagHits .explore-card-tagHits-table tbody").append( tr );


			});

			var tableDom = $("#explore_card_tagHits .explore-card-tagHits-table tbody tr").length > 10 ? "itp" : "t";

			$("#explore_card_tagHits .explore-card-tagHits-table").DataTable({dom: tableDom });

		} else {

			$("#explore_card_tagHits .explore-card-tagHits-table").parent().show();

		}
	}


	function speciesTable() {

		$("#explore_card_tagHits > div:not(.explore-card-header)").hide();

		if ($('.explore-card-tagHits-speciesTable').length == 0) {

			//$("#explore_card_stationHits .explore-card-header").text("Stations in th" + ( motusFilter.regions.length > 1 ? "ese" : "is") + " region" + ( motusFilter.regions.length > 1 ? "s" : ""));

			var headers = ["Species", "Release Date", "Status", "Number of animals", "Stations Visited"];

			$("#explore_card_tagHits")
				.append( $("<table></table>")
					.attr('class', 'explore-card-tagHits-speciesTable')
					.append( $('<thead></thead>')
						.append( $('<tr></tr>')	)
					)
					.append( $('<tbody></tbody>') )
				)

			headers.forEach( x => $("#explore_card_tagHits .explore-card-tagHits-speciesTable thead tr").append( $('<th></th>').text(x) ) );


			console.log(motusData.animals);
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
													country: v[0].country
												}),
												d => d.name
											).values()
										);


			var totalStations = 20;

			motusData.selectedSpecies.forEach(function(d){

				var tr = $('<tr></tr>');

				tr.append(
							$('<td></td>')
								.append("<div class='explore-card-table-legend-icon' style='border-color:" + regionColourScale(d.country)+"'></div>")
								.append( $("<a href='javascript:void(0);' onclick='viewProfile(\"animals\", "+d.id+");'></a>").text( d.name ) )
						);

				tr.append( $('<td></td>').text( d.dtStart.toISOString().substr(0,10) ) );

				var dtEnd = d.dtEnd.toISOString().substr(0,10);

				tr.append( $('<td></td>').html( moment().diff(d.dtEnd, 'day') < 1 ? "Active" : "Ended on:<br/>" + dtEnd ) );

				tr.append( $('<td></td>').text( d.nAnimals ) );

				tr.append( $('<td></td>').text( d.nStations ) );

				$("#explore_card_tagHits .explore-card-tagHits-speciesTable tbody").append( tr );


			});

			var tableDom = $("#explore_card_tagHits .explore-card-tagHits-speciesTable tbody tr").length > 10 ? "itp" : "t";

			$("#explore_card_tagHits .explore-card-tagHits-speciesTable").DataTable({dom: tableDom });

		} else {

			$("#explore_card_tagHits .explore-card-tagHits-speciesTable").parent().show();

		}
	}


}
