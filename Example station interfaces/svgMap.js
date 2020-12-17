
						// 
						// D3 Globe projections: https://github.com/d3/d3-geo
						//		Orthographic: 
						// 
						// Tween between projections: https://bl.ocks.org/git-ashish/35d6480d477d22a21961e641955ba03c
						//
						// Transition between any two projections: https://bl.ocks.org/alexmacy/082cb12c8f4d5c0d5c4445c16a3db383
						//
						// Great circle paths: https://www.d3-graph-gallery.com/graph/connectionmap_csv.html
						//
						// Flight path edge bundling: https://bl.ocks.org/sjengle/2e58e83685f6d854aa40c7bc546aeb24
						//
						// Voronoi Arc Map: https://bl.ocks.org/mbostock/7608400
						//
						// Zoomable choropleth: https://observablehq.com/@bjnsn/zoomable-choropleth

						// The svg
						
						$('.explore_map_container').append('<svg id="explore_map_regions" class="explore_map explore_type_stations explore_type_species mapStations_type_points mapSpecies_type_tracks mapSpecies_type_deployments explore-choropleth visible"></svg>')

						var mapType='track';
						var animation_length = 1;
						var svg = {
							el: d3.select("#explore_map_regions"),
							t: d3.timer(function() {}),
							width: $("#explore_map_regions").parent().innerWidth(),
							height: $("#explore_map_regions").parent().innerHeight() - 30,
							timer: d3.timer(function() {}),
							resetTimer: d3.timer(function() {}),
							selectedProjection: 1,
							posX: 0,
							posY: 0,
							tweenProjections: function(projectionID) {
								svg.selectedProjection = projectionID == "sphere" ? 1 : 0;
								svg.centerX = svg.selectedProjection === 0 ? 0 : 36;
								svg.centerY = svg.selectedProjection === 0 ? 0 : -15;
								svg.proj_pos = svg.selectedProjection;
								svg.projectionMorph();
								svg.t.restart(function(elapsed) {
									svg.proj_pos = (elapsed/animation_length)
									svg.proj_pos = svg.proj_pos > 1 ? 1 : svg.proj_pos
									svg.proj_pos = svg.selectedProjection == 0 ? 1 - svg.proj_pos : svg.proj_pos;
									svg.projectionMorph();
									if (elapsed > animation_length) svg.t.stop();
								}, 0)
							},	// Map and projection
							projection: d3.geoOrthographic().scale(100).clipAngle(90),
							path: d3.geoPath(),// A path generator 
							pointPath: d3.geoPath().pointRadius(1),// A path generator 
							proj_pos: 0,
							grid: {},
							centerX: 36,
							centerY: -15,
							zoom: {},
							zoomLevel: 1,
							colorScale: {},
							projectionTypes: [d3.geoEquirectangular(), d3.geoOrthographic()],
							isVisible: function(d, vis, ch) {
								
								const visibility = vis && 
									!(motusFilter.dtEnd <= d.dtStart || motusFilter.dtStart >= d.dtEnd) &&
									(motusFilter.project == d.projID || motusFilter.project == 'all') &&
									(typeof d.species == "undefined" || motusFilter.species == d.species || motusFilter.species == 'all');
								
							//	console.log(visibility);
								
								return (ch ? (visibility ? 'visible' : 'hidden') : !visibility);
										
							},
							setVisibility: function(elType) {
								if (elType === undefined) {
									if (tracksStations == 'both') 
										elType = $(".explore_type:visible.toggleButton.selected").html().toLowerCase() == 'tracks' ? 'track' : $(".explore_type:visible.toggleButton.selected").html().toLowerCase() == 'points' ?'station' : $(".explore_type:visible.toggleButton.selected").html().toLowerCase() == 'regions' ?'region' : 'tagDeps';
									else if (tracksStations == 'stations') elType = 'track'
									else if (tracksStations == 'species') elType = 'station'
									else if (tracksStations == 'tagDeps') elType = 'tagDeps'
									
								//	console.log(elType);
									svg.el.selectAll(".explore-choropleth-" + elType)
										.attr('visibility', d => svg.isVisible(d, true, true))
										.classed('hidden', d => svg.isVisible(d, true, false))
										//.attr('class', d => svg.isVisible(d, true));
									svg.projectionMorph();
								} else {
									if (tracksStations == 'both') {
										elType = $(".explore_type:visible.toggleButton.selected").html().toLowerCase() == 'tracks' ? 'track' : $(".explore_type:visible.toggleButton.selected").html().toLowerCase() == 'points' ?'station' : $(".explore_type:visible.toggleButton.selected").html().toLowerCase() == 'regions' ?'region' : 'tagDeps';
									}
								//	console.log("2: " + elType);
								/*	else if (tracksStations == 'stations') elType = 'track'
									else if (tracksStations == 'species') elType = 'station'
									else if (tracksStations == 'tagDeps') elType = 'tagDeps'*/
								//	if (tracksStations != 'stations') 
										svg.el.selectAll(".explore-choropleth-station")
											.attr('visibility', elType != 'station' ? 'hidden' : 'visible')
											.classed('hidden', elType != 'station')
											//.attr('class', d => svg.isVisible(d, elType == 'tracks'))
								//	if (tracksStations != 'species') 
										svg.el.selectAll(".explore-choropleth-track")
											.attr('visibility', elType != 'track' ? 'hidden' : 'visible')
											.classed('hidden', elType != 'track')
								//	if (tracksStations != 'tagDeps') 
										svg.el.selectAll(".explore-choropleth-tagDeps")
											.attr('visibility', elType != 'tagDeps' ? 'hidden' : 'visible')
											.classed('hidden', elType != 'tagDeps')
											//.attr('class', d => svg.isVisible(d, elType == 'tagDeps'))
									
									
								/*	svg.el.selectAll(".explore-choropleth-" + elType)
										.attr('visibility', d => svg.isVisible(d, true, true))
										.classed('hidden', d => svg.isVisible(d, true, false));
									*/
									svg.projectionMorph();
								}
							},
							resetCenter: function() {
								svg.el.transition().duration(750).call(svg.zoom.transform, d3.zoomIdentity);
								svg.resetTimer.restart(function(elapsed) {
									//elapsed = Math.max(0, (1000 - elapsed));
									svg.posX = ((Math.min(1000, elapsed) / 1000) * svg.centerX) + (svg.posX * (Math.max(0, (1000 - elapsed)) / 1000));
									svg.posY = ((Math.min(1000, elapsed) / 1000) * svg.centerY) + (svg.posY * (Math.max(0, (1000 - elapsed)) / 1000));
									//posY = () posY * (Math.max(0, (1000 - elapsed)) / 1000);
									svg.projectionMorph();
									if (svg.posX == svg.centerX && svg.posY == svg.centerY) svg.resetTimer.stop();
								});
							},
							ready: function(error, dataGeo, trackData, recvDeps, tagDeps) {
								
								tracksStations = $('title').html().indexOf('Stations') == -1 ? $('title').html().indexOf('Species') == -1 ? 'both' : 'species' : 'stations';
								
										  
								var defs = svg.el.append("defs")

								defs.append("path")
									.datum({type: "Sphere"})
									.attr("id", "sphere")
									
								svg.el.append("use")
									.attr("class", "explore-choropleth-stroke")
									.attr("xlink:href", "#sphere");

								svg.el.append("use")
									.attr("class", "explore-choropleth-fill")
									.attr("xlink:href", "#sphere");
									
								if ($('.explore-choropleth-mapType.selected').length > 0) {
									svg.proj_pos = $('.explore-choropleth-mapType.selected').hasClass('explore-choropleth-sphere') ? 1 : 0;
								} else {
									svg.proj_pos = 1;
								}

								
								
								// Draw the map
								const land = svg.el.append("g");
								
								land.selectAll("path")
									.data(dataGeo.features)
									.enter().append("path")
										.attr("class", "explore-choropleth-land")
										.attr("d", d3.geoPath()
											.projection(svg.projection)
										)
										.style("stroke", "#FFF")
										.style("stroke-width", 0);
								
								if (/*tracksStations == 'species' || */tracksStations == 'both') {
								
									var recvDepsLink = [];
									
									recvDeps.forEach(function(row){
										topush = {
											type: "Point", 
											coordinates: [+row.lon, +row.lat], 
											id: row.deployID, 
											name: row.name, 
											status: row.status, 
											dtStart: new Date(row.dtStart), 
											dtEnd: new Date(row.dtEnd), 
											projID: row.projID, 
											serno: row.serno
										}
										
										if (!isNaN(topush.coordinates[0]) && !isNaN(topush.coordinates[1]))	recvDepsLink.push(topush)
									});
									
									const stations = svg.el.selectAll("stations")
									
								//	console.log(recvDepsLink)
								
									var circle = d3.geoCircle();
									
									svg.colorScale = d3.scaleOrdinal(d3.schemeCategory10);
									
									stations.data(recvDepsLink)
										.enter()
										.append("path")
									/*	.datum(function(d){
											return circle
													.center(d.coordinates)
													.radius(5);
										})*/
										//.attr("d", (d) => svg.path(d))
										.attr('class', (d) => "explore-choropleth-station station" + d.id)
										.style("stroke", "#FFF")
										.style('fill', (d) => svg.colorScale(d.status))
									//	.attr('visibility', svg.isVisible.recvs)
										//.attr("transform", d => "translate(" + svg.projection(d.coordinates) + ")")
										.attr("d", (d) => svg.pointPath(d))
										.on('mouseover', function(d){
											d3.selectAll(".station" + d.id).style('opacity', '1');
											d3.selectAll(".explore-choropleth-station:not(.station" + d.id + ")").style('opacity', '0.1');
										})
										.on('mouseout', function(d){d3.selectAll(".explore-choropleth-station").style('opacity', '0.5');})
										.on('click', d => mapInfoPanel(d, 'show', 'station'));
										
								}
								if (tracksStations == 'species' || tracksStations == 'both') {
									
									var tagDepsLink = [];
									
									svg.colorScale = d3.scaleOrdinal(d3.schemePaired);
									
									tagDeps.forEach(function(row){
										topush = {
											type: "Point", 
											coordinates: [+row.lon, +row.lat], 
											id: row.deployID, 
											tagID: row.tagID, 
											status: row.status, 
											dtStart: new Date(row.dtStart), 
											dtEnd: new Date(row.dtEnd), 
											projID: row.projID, 
											species: row.species
										}
										
										if (!isNaN(topush.coordinates[0]) && !isNaN(topush.coordinates[1]))	tagDepsLink.push(topush)
									});
									
									const tags = svg.el.selectAll("tags")
									
								//	console.log(tagDepsLink)
									
									tags.data(tagDepsLink)
										.enter()
										.append("path")
										//.attr("d", (d) => svg.path(d))
										.attr('class', (d) => "explore-choropleth-tagDeps tagDeps" + d.id)
										.style("stroke", "#FFF")
										.style('fill', (d) => svg.colorScale(d.species))
									//	.attr('visibility', svg.isVisible.recvs)
										//.attr("transform", d => "translate(" + svg.projection(d.coordinates) + ")")
										.attr("d", (d) => svg.pointPath(d))
										.on('mouseover', function(d){
											d3.selectAll(".tagDeps" + d.id).style('opacity', '1');
											d3.selectAll(".explore-choropleth-tagDeps:not(.tagDeps" + d.id + ")").style('opacity', '0.1');
										})	
										.on('mouseout', function(d){d3.selectAll(".explore-choropleth-tagDeps").style('opacity', '0.5');})
										.on('click', d => mapInfoPanel(d, 'show', 'tagDeps'));
										
								}
								if (true/*tracksStations == 'stations' || tracksStations == 'both'*/) {
									// Reformat the list of link. Note that columns in csv file are called long1, long2, lat1, lat2
									var trackDataLink = [];
									
									trackData.forEach(function(row){
										source = [+row.lon1, +row.lat1];
										target = [+row.lon2, +row.lat2];
										topush = {
												type: "LineString", 
												coordinates: [source, target], 
												id: row.deployID, 
												dtStart: new Date(row.dtStart), 
												dtEnd: new Date(row.dtEnd),
												species: row.species, 
												projID: row.projID
											};
										trackDataLink.push(topush)
									});
									
									svg.colorScale = d3.scaleOrdinal(d3.schemePaired);
								
									// Add the path
									const tracks = svg.el.selectAll("myPath");
									
									tracks.data(trackDataLink)
										.enter()
										.append("path")
										.attr("class", "explore-choropleth-track")
										.attr("d", (d) => svg.path(d))
										.attr('class', (d) => "explore-choropleth-track track" + d.id)
										.style("fill", "none")
										.style('stroke', (d) => svg.colorScale(d.id))
										.on('mouseover', function(d){
											d3.selectAll(".track" + d.id).style('opacity', '1');
											d3.selectAll(".explore-choropleth-track:not(.track" + d.id + ")").style('opacity', '0.1');
										})
										.on('mouseout', function(d){d3.selectAll(".explore-choropleth-track").style('opacity', '0.5');})
										.on('click', d => mapInfoPanel(d, 'show', 'track'));
									
								}
								
								svg.zoom = d3.zoom()
									.scaleExtent([1, 20])
									.translateExtent([[0, 0], [svg.width, svg.height]])
									.extent([[0, 0], [svg.width, svg.height]])
									.on("zoom", function() {
										//svg.el.selectAll('path:not(.explore-choropleth-station)')
										svg.el.selectAll('path')
											.attr("transform", d3.event.transform);
											
										/*svg.el.selectAll('circle')
											.attr("transform", d3.event.transform)
											.attr('r', 2 / (d3.event.transform.k^0.5));*/
									})
									.on('end', function() {
										svg.zoomLevel = d3.event.transform.k;
									});
								
								svg.el.call(svg.zoom);
								
								svg.projectionMorph();
								svg.resetCenter();
								console.log(tracksStations);
								if (tracksStations != "both") {
									//svg.setVisibility(elType = tracksStations == 'species' ? 'track' : 'station');
								}
								$(".explore_type:visible.toggleButton.selected").click();
							},
							dragged: function() {
								svg.posX = ( svg.posX + d3.event.dx / (4 * (svg.zoomLevel ^ 0.5) ) ) % 360;
								svg.posY = ( svg.posY - d3.event.dy / (4 * (svg.zoomLevel ^ 0.5) ) ) % 360;
								svg.projectionMorph();
							},
							projectionMorph: function() {
								var t = svg.proj_pos;
					//			var projections = [d3.geoNaturalEarth(), d3.geoOrthographic()];
								var projections = [d3.geoEquirectangular(), d3.geoOrthographic()];
								
								  
								svg.centerX = svg.selectedProjection == 0 ? 0 : 36;
								svg.centerY = svg.selectedProjection == 0 ? 0 : -15;
							  
								svg.el.selectAll("path:not(.hidden)")
								  .attr("d", getProjection)
								//	.attr("transform", function(d) {console.log(d);return getProjection(d);})
								  
							/*	
								svg.el.selectAll("circle")
								//  .attr("transform", d => "translate(" + getProjection(d) + ")")
								  .attr("transform", function(d) {console.log(getProjection(d));return "translate(" + getProjection(d) + ")";})
							*/	  
								function getProjection(d) {
									var projection = svg.projectionTypes[svg.selectedProjection]
										.rotate([svg.posX, svg.posY])
									   // .rotate([posX + 36, posY - 15])
										.fitExtent([[10, 10], [svg.width - 10, svg.height - 10]], {
										  type: "Sphere"
										})
										.clipAngle( t == 0 ? null : 90 );

									var path = d3.geoPath(projection);	

									return path(d)
								}

							}
						};
						var tracksStations = 'undefined';
						var m0,
							o0;

						svg.path = svg.path.projection(svg.projection);

						svg.grid = svg.el.append("path");
						
						var drag = d3.drag()
							.on("start", function() {
							// Adapted from http://mbostock.github.io/d3/talk/20111018/azimuthal.html and updated for d3 v3
							  var proj = svg.projection.rotate();
							  m0 = [d3.event.sourceEvent.pageX, d3.event.sourceEvent.pageY];
							  o0 = [-proj[0],-proj[1]];
							})
							.on("drag", function() {
								
								function project() {
									if (m0) {
										var m1 = [d3.event.sourceEvent.pageX, d3.event.sourceEvent.pageY],
										o1 = [o0[0] + (m0[0] - m1[0]) / 4, o0[1] + (m1[1] - m0[1]) / 4];
										
										svg.projection = d3.geoProjection(svg.projectionTypes[svg.selectedProjection])
											.rotate([-o1[0], -o1[1]])
										   // .rotate([posX + 36, posY - 15])
											.fitExtent([[10, 10], [svg.width - 10, svg.height - 10]], {
												type: "Sphere"
											})
											.clipAngle(svg.selectedProjection == 1 ? 90 : null);
									}
								}
							// Update the map
							  svg.path = d3.geoPath().projection(svg.projection);
							  
							  svg.el.selectAll("path:not(.hidden)").attr("d", svg.path);
							});
							
						svg.el
							//.call(drag)
							.call(d3.drag().on("drag", svg.dragged))
							.attr("width", svg.width)
							.attr("height", svg.height);



						svg.grid.datum(d3.geoGraticule().step([10, 10]))
							.attr("class", "explore-choropleth-graticule")
							.attr("d", svg.path)
							.style("stroke", "#CCC");
								
						// Load world shape AND list of connection
						d3.queue()
						  .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")  // World shape
						 // .defer(d3.json, "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson")  // World shape
						//  .defer(d3.csv, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_connectionmap.csv") // Position of circles
						//  .defer(d3.csv, "./data/siteTrans.csv") // Position of circles
						  .defer(d3.csv, "data/siteTrans.csv") // Tracks
						  .defer(d3.csv, "data/recv-deps.csv") // Stations
						  .defer(d3.csv, "data/tag-deps.csv") // Tag deployments
						  .await(svg.ready);
						  
						d3.select('#explore-choropleth-resetMap').on('click', svg.resetCenter);
						
						d3.queue()
							.defer(d3.csv, "data/projs.csv")
							.defer(d3.csv, "data/spp.csv")
							.await(populateSelectOptions);
							