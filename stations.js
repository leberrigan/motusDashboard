function exploreStations(station) {
	
	var stationNames = motusData.stations.filter( d => motusFilter.stations.includes( d.deployID ) ).map( d => d.name );

	
	motusFilter.stations = Array.from( motusData.stations.filter( d => stationNames.includes( d.name ) ).map( d => d.deployID ).values() );
	
	
	// Set colour scale based on number of colour combos
	var stationColourScale = d3.scaleOrdinal().domain(motusFilter.stations).range(customColourScale.jnnnnn.slice(0, motusFilter.stations.length));
	
	
//	var stationColourScale = colourScale;
	
	
	// Create some empty data objects to be populated
	motusData.tracksByAnimal = {};
	motusData.tracksByStation = {};
	motusData.stationHits = {};
	motusData.animalsByDayOfYear = {};
	motusData.animalsByHourOfDay = {};
	
	motusData.animalsByStation = {};
	
	motusFilter.stations.forEach(x => motusData.animalsByStation[x] = []);
	
	var stationAnimals = [];
	
	console.log("motusData.trackDataByRoute: "+ 0);
	
	// For measuring processing time
	var ts = [moment()];
	
	// Create an empty object to hold max and min timestamps for any working dataset.
	var timeRange = {};
	
	motusData.trackDataByRoute = d3.rollup(
		motusData.tracks.filter( d => [d.recv1, d.recv2].some( x => motusFilter.stations ) ), 
		function(v) {
			var dtStart = moment(d3.min(v[0].dtStart.split(',')));
			var dtEnd = moment(d3.min(v[0].dtEnd.split(',')));
			var origin = "Foreign";
			if (dtLims.min > dtStart) {dtLims.min = dtStart;}
			if (dtLims.max < dtEnd) {dtLims.max = dtEnd;}
			
			var selectedRecv1 = motusFilter.stations.includes(v[0].recv1);
			var selectedRecv2 = motusFilter.stations.includes(v[0].recv2);
			
			if (selectedRecv1 || selectedRecv2) {
				
				stationAnimals = stationAnimals.concat(v[0].animal.split(','));
				
		//		stationAnimals +="," + v[0].animal
				
				if (selectedRecv1) {
					var tsStart = moment(d3.min(v[0].tsStart.split(','))*1000);
					
					motusData.animalsByStation[ v[0].recv1 ] = motusData.animalsByStation[ v[0].recv1 ] ? motusData.animalsByStation[ v[0].recv1 ].concat(v[0].animal.split(',')) : v[0].animal.split(',');
					
					if (!timeRange.min || timeRange.min > dtStart)
						timeRange.min = dtStart;
					if (!timeRange.max || timeRange.max < dtStart)
						timeRange.max = dtStart;
				
					motusData.animalsByHourOfDay[tsStart.format("H")] = motusData.animalsByHourOfDay[tsStart.format("H")] ? motusData.animalsByHourOfDay[tsStart.format("H")] + "," + v[0].animal : v[0].animal;
					
					motusData.animalsByDayOfYear[dtStart.dayOfYear()] = motusData.animalsByDayOfYear[dtStart.dayOfYear()] ? motusData.animalsByDayOfYear[dtStart.dayOfYear()] + "," + v[0].animal : v[0].animal;
				}
				
				if (selectedRecv2) {
					var tsEnd = moment(d3.min(v[0].tsEnd.split(','))*1000);
					
					motusData.animalsByStation[ v[0].recv2 ] = motusData.animalsByStation[ v[0].recv2 ] ? motusData.animalsByStation[ v[0].recv2 ].concat(v[0].animal.split(',')) : v[0].animal.split(',');
					
					if (!timeRange.min || timeRange.min > dtEnd)
						timeRange.min = dtEnd;
					if (!timeRange.max || timeRange.max < dtEnd)
						timeRange.max = dtEnd;
					
					
					motusData.animalsByHourOfDay[tsEnd.format("H")] = motusData.animalsByHourOfDay[tsEnd.format("H")] ? motusData.animalsByHourOfDay[tsEnd.format("H")] + "," + v[0].animal : v[0].animal;
					
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
				frequency: v[0].frequency,
				coordinates: [ [v[0].lon1, v[0].lat1], [v[0].lon2, v[0].lat2]]
			}
	}, x => +x.route );
	console.log(motusData.animalsByStation);
	
	for (x in motusData.animalsByStation) {
		motusData.animalsByStation[x] = motusData.animalsByStation[x].filter(onlyUnique);
	}
	
	stationAnimals = stationAnimals.filter(onlyUnique);
	
	setProgress(50);
//	console.log(motusData.stationHits);
	/*Array.from(motusData.trackDataByRoute.values()).filter(d => (motusFilter.stations.includes(d.recv1) || motusFilter.stations.includes(d.recv2))).forEach(function(d){
		stationAnimals += ","+d.animals;
	});*/
	console.log("stationAnimals: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());
	//stationAnimals = stationAnimals.substring(1).split(',').filter(onlyUnique);
	
	console.log("selectedTracks: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());
	
	var selectedTracks = Array.from(stationAnimals.map(x => motusData.tracksByAnimal[x]).values()).flat();//.filter(onlyUnique);
	
	console.log("motusMap.setVisibility(): " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());
	//console.log(stationAnimals);
	//console.log(motusData.tracksByAnimal);
	//console.log(selectedTracks);
	
	motusMap.setVisibility();
	
	//console.log(motusData.recvDepsLink.filter(d => motusFilter.stations.includes(d.id)));
//	console.log("Stations: " + motusFilter.stations.length + " - Animals: " +stationAnimals.length);
	
				//  g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
	
	console.log("motusMap.regionPaths: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());

	motusMap.g.selectAll('stations')
		.data(motusData.recvDepsLink.filter(d => !motusFilter.stations.includes(d.id)))
		//.data(motusData.recvDepsLink)
		.enter().append("path")
		.attr("d", motusMap.path.pointRadius(3))
		.style('stroke', '#000')
		.style('fill', '#FF0')
		.attr('class', 'explore-map-stations explore-map-r2 leaflet-zoom-hide')
		//.style('fill', d => motusFilter.stations.includes(d.id) ? "#F00" : "#000")
		.style('stroke-width', '1px')
		.style('pointer-events', 'auto')
		.on('mouseover', (e,d) => motusMap.dataHover(e, d, 'in', 'station'))
		.on('mouseout', (e,d) => motusMap.dataHover(e, d, 'out', 'station'))
		.on('click', (e,d) => motusMap.dataClick(e, d, 'station'));
	
	motusMap.g.selectAll('stations')
		.data(motusData.recvDepsLink.filter(d => motusFilter.stations.includes(d.id)).sort((a, b) => d3.ascending(a.id, b.id)))
		//.data(motusData.recvDepsLink)
		.enter().append("path")
		.attr("d", motusMap.path.pointRadius(5))
		.style('stroke', '#000')
		.style('fill', (d) => d.dtEnd > moment().subtract(1, 'days') ? '#0F0' : '#F00')
		.attr('class', 'explore-map-stations leaflet-zoom-hide')
		//.style('fill', d => motusFilter.stations.includes(d.id) ? "#F00" : "#000")
		.style('stroke-width', '1px')
		.style('pointer-events', 'auto')
		.on('mouseover', (e,d) => motusMap.dataHover(e, d, 'in', 'station'))
		.on('mouseout', (e,d) => motusMap.dataHover(e, d, 'out', 'station'))
		.on('click', (e,d) => motusMap.dataClick(e, d, 'station'));
	
	motusMap.stationPaths = motusMap.g.selectAll('.explore-map-stations')
	
//	motusMap.regionBounds = d3.geoPath().bounds({features:selectedPolygons, type: "FeatureCollection"});
	
//	motusMap.map.fitBounds( [ [motusMap.regionBounds[0][1], motusMap.regionBounds[0][0]], [motusMap.regionBounds[1][1], motusMap.regionBounds[1][0]]]);
//	alert(1);
	//console.log(regionCombos);
	console.log(Array.from(motusData.trackDataByRoute.values()).filter(d => selectedTracks.includes(d.route)));
	
	setProgress(75);
	console.log("motusMap.trackPaths: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());
	motusMap.trackPaths = motusMap.g.selectAll("tracks")
	//	.data(trackDataLink)
		.data(Array.from(motusData.trackDataByRoute.values()).filter(d => selectedTracks.includes(d.route)))
	//	.data(Array.from(motusData.trackDataByRoute.values()).filter(d => (motusFilter.stations.includes(d.recv1) || motusFilter.stations.includes(d.recv2))))
		.enter().append("path")
		.attr('class', (d) => "explore-map-tracks explore-map-species leaflet-zoom-hide explore-map-tracks-" + d.origin)
		.attr("id", (d) => "track" + d.id)
		.style('stroke', (d) => stationColourScale(d.origin))
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
	
	var countryByTrack = {};
	
	setProgress(90);
	
	console.log("regionNames.forEach[0]: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());
	console.log(motusData.stationsByName);
	
	Array.from(motusData.stationsByName._intern.values()).filter(x => motusData.stationsByName.get( x ).some( v => motusFilter.stations.includes(v.deployID) )).forEach(function(d, k) {
		console.log(k);
		console.log(d);
		
		var routes = [];
		var animals = [];
		var species = [];
		var projID = 0;
		var deployID = 0;
		
		motusData.stationsByName.get( d ).forEach(function(v){
			
			var temp_routes = motusData.tracksByStation[v.deployID];
				
			if (typeof motusData.tracksByStation[v.deployID] !== 'undefined') {
				
				projID = v.projID;
				deployID = v.deployID;
	
				animals = animals.concat(motusData.animalsByStation[ v.deployID ]);
				species = species.concat(Array.from( motusData.animals.filter( v => animals.includes(v.deployID) ).map( v => v.species ).values() ).filter( onlyUnique ));
				
			//	console.log(Array.from( animals.map( (x) => motusData.animalsByCountry.get(k).get(x)[0].).values() ));
				temp_routes.forEach(function(x) {
					if (((typeof countryByTrack[x] === 'undefined') || (countryByTrack[x] === k))) {
						countryByTrack[x] = k;
					} else {
						countryByTrack[x] = (countryByTrack[x] + ',' + k).split(',').sort(d3.ascending).join(',')
					}
				});
			
				
				routes = routes.concat(temp_routes);
				
			} 
			
		});
		if (routes.length > 0) {
			var status = {
				tags: [ animals.length ],
				species: [ species.length ],
				project: projID
			//	lastData: [Math.round( subset[subset.length-1].lastData )],
			}
			console.log(status);
			//console.log(status);
			addExploreCard({
				data: {},
				id: deployID,
				name: d,
				status: status,
				photo: ''
			});
			
		}
			
	});
	console.log("Map controls: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());
	
	addExploreCard({data:"add"});
	
	$('#explore_map').parent().before($('#explore_card_profiles'));
	
	$('#explore_map').parent().append("<div class='explore-map-controls'>Map controls <input type='button' value='Hide tracks-local'><input type='button' value='Hide tracks-foreign'><input type='button' value='Hide stations'><input type='button' value='Hide regions'></div>")
	
	$(".explore-map-controls input[type=button]").click(function(){var toggleEls = this.value.toLowerCase().split(' ');motusMap.setVisibility(false, toggleEls);this.value = (toggleEls[0] == 'hide' ? 'Show' : 'Hide') + " " + toggleEls[1];});
	

	/*
	
	
		Stations
	
	
	*/
	
	console.log("Stations: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());
	
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
				"Monthly detections": function(){animalTimeline(motusData.animalsByDayOfYear, 'month')},
				"Hourly detections": function(){animalTimeline(motusData.animalsByHourOfDay, 'hour')}
			},
			defaultTab: "Monthly detections",
			attachEl: ".explore-card-map",
			attachMethod: "before"
		});
		
	//	Add the card dom element to contain the chart
	addExploreCard({
			data:'tabs', 
			type:'animalTables', 
			header: '',
			tabs: {
				"Animals detected here": animalTable, 
				"Species detected here": speciesTable, 
			},
			defaultTab: "Animals detected here",
			attachEl:".explore-card-map",
			attachMethod:"after",
			colSpan: 'all'
		});
	
	
	/*
	
		Finish up
	
	*/
	
	console.log("Finish up: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());
	var toAppend = "<input type='button' value='Table of animals detected' />"+
					"<input type='button' value='Table of species detected' />"+
					"<input type='button' value='Table of stations' />"+
					"<input type='button' value='Table of projects' />";
	
	//addExploreCard({data:'custom',type:'options',html:toAppend,attachEl:".explore-card-map",attachMethod:"after"});
	
	console.log(stationColourScale("COL"));
	console.log(stationColourScale("BHS"));
	
	setCardColours( stationColourScale )
	
	motusFilter.animals = ['all'];
	//motusFilter.stations = ['all'];
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
													x => motusFilter.stations.includes( x.id )
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
						.append("<div class='explore-card-table-legend-icon' style='border-color:" + stationColourScale(d[0].country)+"'></div>")
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
													x => motusFilter.stations.includes( x.id )
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
													x => motusFilter.stations.includes( x.id )
												));
			
			var totalAnimals = d3.max(motusData.selectedStations, v => v.nAnimals);
			
			
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
								.append("<div class='explore-card-table-legend-icon' style='border-color:" + stationColourScale(d.country)+"'></div>")	
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
	

	function animalTimeline(data, group_by) {
		
		$("#explore_card_tagHits > div:not(.explore-card-header)").hide();
		
		if ($('.explore-card-tagHits-timeline-' + group_by).length == 0) {
				
			$("#explore_card_tagHits")
				.append( $("<div class='explore-card-chart-wrapper'><div class='explore-card-tagHits-timeline explore-card-tagHits-timeline-"+group_by+"'><svg></svg></div></div>") )
				
			timelineAxisVals = [];

			motusData.tagHits = {};

			timeRange = {};
			
			var timeline_data = [];
			
			const gSize = group_by == 'month' ? 12 : (group_by == 'hour' ? 23 : 365);	// size of date groups
			
			var timeStep = 1;
				
			for (var i=group_by == 'hour'?0:1; i<=gSize; i++) {
			
				if (group_by == 'month') {
					timeStep = moment().month(i).dayOfYear();
				} else if (group_by == 'hour') {
					timeStep = +moment().hour(i);
				} else {
					timeStep = i;
				}
				timeline_data[ i ] = { "Julian date": timeStep, local: 0, Foreign: 0, total: [] };
				motusData.stations.filter(x => motusFilter.stations.includes( x.deployID )).forEach(x => timeline_data[ i ][ x.name ] = 0);
				
			}
			console.log(data);
			for (d in data) {
				
				const animalsToday = data[d].split(',');//.filter(onlyUnique);
				
				if (group_by == 'month') {
					timeStep = moment()[ group_by ]( moment().dayOfYear(d)[ group_by ]() ).dayOfYear();
					d = moment().dayOfYear(d).format("M");
				} else if (group_by == 'hour') {
					timeStep = d * 3600 * 1000;
				} else {
					timeStep = Math.floor( Math.floor( d / gSize ) * gSize );
					d = timeStep;
				}
				
				timeline_data[ d ].total = timeline_data[ d ].total.concat(animalsToday);
						
			}
			
	//		console.log(timeline_data);
			//console.log(motusData.stations.filter(x => motusFilter.stations.includes( x.deployID )));
			
			timeline_data = timeline_data.map(function(d){
				
				if (d.total.length > 0) {
					
					var localAnimals = {all: []};
					motusData.stations.filter(x => motusFilter.stations.includes( x.deployID )).forEach(function(x) {
					//	console.log(x.name + ": " + d.total.filter(a => motusData.animalsByStation[ x.deployID ].includes(a)).length);
						if (typeof d[ x.name ] === 'undefined') {
							d[ x.name ] = d.total.filter(a => motusData.animalsByStation[ x.deployID ].includes(a)).length;
						} else {
							
							d[ x.name ] += d.total.filter(a => motusData.animalsByStation[ x.deployID ].includes(a)).length;
						}
					});
				
					
					d.total = d.total/*.filter(onlyUnique)*/.length;
				
			//		console.log(d);	
				} else {d.total = 0;}
				
				return d;
			});
			
			timeline_data = timeline_data.flat();
			timeline_data.columns = Object.keys(timeline_data[0])
			
			var radialChartConstruct = d3.radialBarChart()
				.colourScale( stationColourScale )
				.dateFormat( group_by == 'month' ? 'MMM' : ( group_by == 'hour' ? 'H' : 'b D' ) );
			
			console.log(timeline_data);
		
			timeline_data.columns.splice( timeline_data.columns.indexOf('Foreign'), 1 );
			timeline_data.columns.splice( timeline_data.columns.indexOf('local'), 1 );
			timeline_data.columns.splice( timeline_data.columns.indexOf('total'), 1 );

			var radialChart = d3.select(".explore-card-tagHits-timeline-" + group_by + " svg")
				.datum(timeline_data).call(radialChartConstruct);
			
		}
		
		$("#explore_card_tagHits .explore-card-tagHits-timeline-" + group_by).parent().show();
	}
	
	
	function animalTable(cardID) {
		$("#explore_card_"+cardID+" > div:not(.explore-card-header)").hide();
		
		if ($('.explore-card-'+cardID+'-table').length == 0) {
			
			//$("#explore_card_stationHits .explore-card-header").text("Stations in th" + ( motusFilter.regions.length > 1 ? "ese" : "is") + " region" + ( motusFilter.regions.length > 1 ? "s" : ""));
			
			var headers = ["Animal ID", "Species", "Release Date", "Status", "Stations Visited", "Days detected"];
			
			$("#explore_card_"+cardID)
				.append( $("<table></table>")
					.attr('class', 'explore-card-'+cardID+'-table')
					.append( $('<thead></thead>')
						.append( $('<tr></tr>')	)
					)
					.append( $('<tbody></tbody>') )
				)
				
			headers.forEach( x => $("#explore_card_"+cardID+" .explore-card-"+cardID+"-table thead tr").append( $('<th></th>').text(x) ) );
			
			
			console.log(motusData.animals);
			motusData.selectedAnimals = Array.from(motusData.animals.filter(
												x => stationAnimals.includes( x.deployID )
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
								.append("<div class='explore-card-table-legend-icon' style='border-color:" + stationColourScale(d.country)+"'></div>")	
								.append( $("<a href='javascript:void(0);' onclick='viewProfile(\"animals\", "+d.id+");'></a>").text( d.id ) )							
						);
				
				tr.append( 
							$('<td></td>')
								.append( $("<a href='javascript:void(0);' onclick='viewProfile(\"species\", "+d.species+");'></a>").text( d.name ) )							
						);
				
				tr.append( $('<td></td>').text( d.dtStart.toISOString().substr(0,10) ) );
				
				var dtEnd = d.dtEnd.toISOString().substr(0,10);
				
				tr.append( $('<td></td>').html( moment().diff(d.dtEnd, 'day') < 1 ? "Active" : "Ended on:<br/>" + dtEnd ) );
				
				tr.append( $('<td></td>').text( d.nStations.length ) );
				
				tr.append( $('<td></td>').text( d.nDays ) );
				
				$("#explore_card_"+cardID+" .explore-card-"+cardID+"-table tbody").append( tr );
				
				
			});
			
			var tableDom = $("#explore_card_"+cardID+" .explore-card-"+cardID+"-table tbody tr").length > 10 ? "itp" : "t";
			
			$("#explore_card_"+cardID+" .explore-card-"+cardID+"-table").DataTable({dom: tableDom });
			
		} 
		
		$("#explore_card_"+cardID+" .explore-card-"+cardID+"-table").parent().show();
			
	}
	

	function speciesTable(cardID) {
		
		$("#explore_card_"+cardID+" > div:not(.explore-card-header)").hide();
		
		if ($('.explore-card-'+cardID+'-speciesTable').length == 0) {
			
			//$("#explore_card_stationHits .explore-card-header").text("Stations in th" + ( motusFilter.regions.length > 1 ? "ese" : "is") + " region" + ( motusFilter.regions.length > 1 ? "s" : ""));
			
			var headers = ["Species", "Release Date", "Status", "Number of animals", "Stations Visited"];
			
			$("#explore_card_"+cardID+"")
				.append( $("<table></table>")
					.attr('class', 'explore-card-'+cardID+'-speciesTable')
					.append( $('<thead></thead>')
						.append( $('<tr></tr>')	)
					)
					.append( $('<tbody></tbody>') )
				)
			
			headers.forEach( x => $("#explore_card_"+cardID+" .explore-card-"+cardID+"-speciesTable thead tr").append( $('<th></th>').text(x) ) );
			
			
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
								.append("<div class='explore-card-table-legend-icon' style='border-color:" + stationColourScale(d.country)+"'></div>")	
								.append( $("<a href='javascript:void(0);' onclick='viewProfile(\"animals\", "+d.id+");'></a>").text( d.name ) )							
						);
				
				tr.append( $('<td></td>').text( d.dtStart.toISOString().substr(0,10) ) );
				
				var dtEnd = d.dtEnd.toISOString().substr(0,10);
				
				tr.append( $('<td></td>').html( moment().diff(d.dtEnd, 'day') < 1 ? "Active" : "Ended on:<br/>" + dtEnd ) );
				
				tr.append( $('<td></td>').text( d.nAnimals ) );
				
				tr.append( $('<td></td>').text( d.nStations ) );
				
				$("#explore_card_"+cardID+" .explore-card-"+cardID+"-speciesTable tbody").append( tr );
				
				
			});
			
			var tableDom = $("#explore_card_"+cardID+" .explore-card-"+cardID+"-speciesTable tbody tr").length > 10 ? "itp" : "t";
			
			$("#explore_card_"+cardID+" .explore-card-"+cardID+"-speciesTable").DataTable({dom: tableDom });
		
		} else {
			
			$("#explore_card_"+cardID+" .explore-card-"+cardID+"-speciesTable").parent().show();
			
		}
	}
	

}