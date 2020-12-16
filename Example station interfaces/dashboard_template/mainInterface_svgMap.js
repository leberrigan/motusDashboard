
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
						
						$('.explore_map_container').append('<svg id="explore_map_regions" class="explore_map explore_type_stations explore_type_species mapStations_type_points mapSpecies_type_tracks explore-choropleth visible"></svg>')

						var mapType='track';
						var svg = {
							el: d3.select("#explore_map_regions"),
							t: d3.timer(function() {}),
							width: 1200,
							height: 400,
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
									svg.proj_pos = (elapsed/500)
									svg.proj_pos = svg.proj_pos > 1 ? 1 : svg.proj_pos
									svg.proj_pos = svg.selectedProjection == 0 ? 1 - svg.proj_pos : svg.proj_pos;
									svg.projectionMorph();
									if (elapsed > 500) svg.t.stop();
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
							isVisible: function(d, vis) {
								//	console.log(!(motusFilter.dtEnd <= d.dtStart || motusFilter.dtStart >= d.dtEnd));
								//	console.log(motusFilter.dtEnd + " <= " + d.dtStart + " = " + (motusFilter.dtEnd <= d.dtStart));
									return vis && !(motusFilter.dtEnd <= d.dtStart || motusFilter.dtStart >= d.dtEnd) ? 'visible' : 'hidden';
								//}
							},
							setVisibility: function(elType) {
								if (elType === undefined) {
									elType = $(".explore_type:visible.toggleButton.selected").html().toLowerCase() == 'tracks' ? 'track' : 'station';
									svg.el.selectAll(".explore-choropleth-" + elType)
										.attr('visibility', d => svg.isVisible(d, true));
								} else {
									svg.el.selectAll(".explore-choropleth-track")
										.attr('visibility', d => svg.isVisible(d, elType == 'tracks'))
									svg.el.selectAll(".explore-choropleth-station")
										.attr('visibility', d => svg.isVisible(d, elType == 'stations'))
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
							ready: function(error, dataGeo, trackData, pointData) {
								
								svg.colorScale = d3.scaleOrdinal(d3.schemePaired);
										  
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

								svg.proj_pos = 1//d3.select('.explore-choropleth-mapType.selected').html().toLowerCase() == 'sphere' ? 1 : 0;
								
								
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
									
								
									var pointDataLink = [];
									
									pointData.forEach(function(row){
										topush = {type: "Point", coordinates: [+row.lon, +row.lat], id: row.deployID, name: row.name, status: row.status, dtStart: new Date(row.dtStart), dtEnd: new Date(row.dtEnd)}
										
										if (!isNaN(topush.coordinates[0]) && !isNaN(topush.coordinates[1]))	pointDataLink.push(topush)
									});
									
									const points = svg.el.selectAll("stations")
									
								//	console.log(pointDataLink)
									
									points.data(pointDataLink)
										.enter()
										.append("path")
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
										.on('mouseout', function(d){d3.selectAll(".explore-choropleth-station").style('opacity', '0.5');});
										
								
									// Reformat the list of link. Note that columns in csv file are called long1, long2, lat1, lat2
									var trackDataLink = [];
									
									trackData.forEach(function(row){
										source = [+row.lon1, +row.lat1];
										target = [+row.lon2, +row.lat2];
										topush = {
												type: "LineString", 
												coordinates: [source, target], 
												id: row.tagDeployID, 
												dtStart: new Date(row.dtStart), 
												dtEnd: new Date(row.dtEnd)
											};
										trackDataLink.push(topush)
									});
									
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
										.on('mouseout', function(d){d3.selectAll(".explore-choropleth-track").style('opacity', '0.5');});
										
								svg.zoom = d3.zoom()
									.scaleExtent([1, 10])
									.translateExtent([[0, 0], [svg.width, svg.height]])
									.extent([[0, 0], [svg.width, svg.height]])
									.on("zoom", function() {
										//svg.el.selectAll('path:not(.explore-choropleth-station)')
										svg.el.selectAll('path')
											.attr("transform", d3.event.transform);
									})
									.on('end', function() {
										svg.zoomLevel = d3.event.transform.k;
									});
								
								svg.el.call(svg.zoom);
								
								svg.projectionMorph();
								svg.resetCenter();
								$(".explore_type:visible.toggleButton.selected").click();
							},
							dragged: function() {
								svg.posX = ( svg.posX + d3.event.dx / (4 * svg.zoomLevel) ) % 360;
								svg.posY = ( svg.posY - d3.event.dy / (4 * svg.zoomLevel) ) % 360;
								svg.projectionMorph();
							},
							projectionMorph: function() {
								var t = svg.proj_pos;
							//	var projections = [d3.geoNaturalEarth(), d3.geoOrthographic()];
								var projections = [d3.geoMiller(), d3.geoOrthographic()];
								
								  
								svg.centerX = svg.selectedProjection == 0 ? 0 : 36;
								svg.centerY = svg.selectedProjection == 0 ? 0 : -15;
							  
								svg.el.selectAll("path")
								  .attr("d", getProjection)
								//	.attr("transform", function(d) {console.log(d);return getProjection(d);})
								  
							/*	
								svg.el.selectAll("circle")
								//  .attr("transform", d => "translate(" + getProjection(d) + ")")
								  .attr("transform", function(d) {console.log(getProjection(d));return "translate(" + getProjection(d) + ")";})
							*/	  
								function getProjection(d) {
									var projection = d3.geoProjection(project)
										.rotate([svg.posX, svg.posY])
									   // .rotate([posX + 36, posY - 15])
										.fitExtent([[10, 10], [svg.width - 10, svg.height - 10]], {
										  type: "Sphere"
										});

									var path = d3.geoPath(projection);

									var clip = projection.clipAngle;

									clip( t == 0 ? null : (180 - (t * 90)) );

									function project(λ, φ) {
									  λ *= 180 / Math.PI, 
									  φ *= 180 / Math.PI;

									  var p0 = projections[0]([λ, φ]), 
										  p1 = projections[1]([λ, φ]);

									  return [
										(1 - t) * p0[0] + t * p1[0], 
										(1 - t) * -p0[1] + t * -p1[1]
										];
									}
									projection.alpha = function(_) {
										if (!arguments.length) return α;
										α = +_;
										var ca = a.center(), cb = b.center(),
										ta = a.translate(), tb = b.translate();
										center([(1 - α) * ca[0] + α * cb[0], (1 - α) * ca[1] + α * cb[1]]);
										translate([(1 - α) * ta[0] + α * tb[0], (1 - α) * ta[1] + α * tb[1]]);
										if (ortho === true) {clip(180 - α * 90);}
										return projection;
									};

									return path(d)
								}

							}
						};

						svg.path = svg.path.projection(svg.projection);

						svg.grid = svg.el.append("path");

						svg.el
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
						  .defer(d3.csv, "https://raw.githubusercontent.com/leberrigan/motusDashboard/master/Example%20station%20interfaces/data/siteTrans.csv") // Position of circles
						  .defer(d3.csv, "https://raw.githubusercontent.com/leberrigan/motusDashboard/master/Example%20station%20interfaces/data/recv-deps.csv") // Position of circles
						  .await(svg.ready);
						  
						d3.select('#explore-choropleth-resetMap').on('click', svg.resetCenter);