
var motusMap = {};

var rawData = {};

var showTracks = true; //
var projectColours = {};
var milliseconds_annually = 3.154 * (10^10);

var tmpvar = 0;

function exploreMap({
	containerID,
	map_el = "explore_map",
	mapButtons = {
		'Points':'toggleButton selected mapBy dataType_stations',
		'Deployments':'toggleButton mapBy dataType_species',
		'Regions':'toggleButton mapBy dataType_stations',
		'Tracks':'toggleButton mapBy dataType_species',
		'Table':'toggleButton mapBy'
	},
	tileLayer = "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
	mapCenter = [24.1, 10],
	mapZoom = 2,
	callback
} = {}) {

	//$('#' + containerID).append('<div id="' + map_el + '" class="explore_map"></div>');
	//$('#' + containerID).append('<div id="' + map_el + '_legend"></div>');

	motusMap = {
		el: map_el,
		containerID: containerID,
		mapButtons: mapButtons,
		dims: {
			width: $("#" + containerID).innerWidth(),
			height: $("#" + containerID).innerHeight() - 30
		},
		center: mapCenter,
		visible: {
			projs: [],
			spp: [],
			animals: []
		},
		zoom: mapZoom,
		tileLayer: tileLayer,
		map:  {},
		pointPath: d3.geoPath().pointRadius(1),// A path generator
		isVisible: function(d) {
		//	if (tmpvar < 1) {tmpvar++;console.log(d);}

			const visibility = (
						!(
							motusFilter.dtEnd < d.dtStart || motusFilter.dtStart > d.dtEnd
						) && (
							typeof d.projID == "undefined" ||
							motusFilter.projects.includes('all') ||
							d.projID.split(',').some(r => motusFilter.projects.includes(r))
						) && (
							typeof d.status == "undefined" ||
							motusFilter.status.includes('all') ||
							d.status.split(',').some(r => motusFilter.status.includes(r))
						) && (
							typeof d.frequency == "undefined" ||
							motusFilter.frequencies.includes('all') ||
							motusFilter.frequencies.every(r => d.frequency.split(',').includes(r)) ||
							d.frequency === motusFilter.frequencies[0]
						) && (
							typeof d.species == "undefined" ||
							exploreType == 'stations' ||
							motusFilter.species.includes('all') ||
							d.species.split(',').some(r => motusFilter.species.includes(r))
						) && (
							typeof d.name == "undefined" ||
							exploreType == 'species' ||
							exploreType == 'regions' ||
							motusFilter.stations.includes('all') ||
							d.id.split(',').some(r => motusFilter.stations.includes(r))
						) && (
							typeof d.animals == "undefined" ||
							typeof motusFilter.animals == "undefined" ||
							motusFilter.animals.includes('all') ||
							d.animals.split(',').some(r => motusFilter.animals.includes(r))
						)
					);

			return !visibility;

		},
		setVisibility: function(switchType, toggleEls) {

			if (typeof toggleEls !== 'undefined') {

				motusMap.svg.selectAll(".explore-map-" + toggleEls[1]).classed('hidden', toggleEls[0] == 'hide');

			} else {

				if (switchType === true && motusMap.svg !== 'undefined') {


					motusMap.svg.selectAll(".explore-map-" + ( mapType == 'regions' && dataType == 'stations' ? 'points' :
															 ( dataType == 'stations' ? 'regions' :
															 ( mapType == 'tracks' ?  'points' : 'tracks' ))) + ":not(.hidden)")
						.classed('hidden', true);

					motusMap.svg.selectAll(".explore-map-" + ( dataType == 'stations' ? 'species' : 'stations' ) + ":not(.hidden)")
						.classed('hidden', true);

				}

				if (motusMap.svg !== 'undefined') {
				//	tmpvar = 0;
				//	console.log("Total: " + $("#explore_map svg path").length + " - Hidden: " + $("#explore_map svg path.hidden").length);
				//	motusMap.svg.selectAll(".explore-map-" + mapType + ".explore-map-" + dataType)

					motusMap.g.selectAll("path").classed('hidden', d => motusMap.isVisible(d));

					if (exploreType == 'main') {
						if (dataType == 'animals') {

							motusMap.visible.animals = "";

							motusMap.svg.selectAll(".explore-map-track:not(.hidden)").each((d)=>motusMap.visible.animals+=","+d.animals);

							var nTracks = motusMap.visible.animals.split(',').length;

							$("#explore_filters").siblings('.filter_status').find('span:eq(0)').text(nTracks);

							//motusMap.visible.animals = motusMap.visible.animals.filter(onlyUnique);
						} else if (dataType == 'stations') {
							$("#explore_filters").siblings('.filter_status').find('span:eq(0)').text($('.explore-map-station:not(.hidden)').length);

						}
					}
					//motusMap.svg.selectAll(".explore-map-" + mapType + ".explore-map-" + dataType + ":not(.hidden)").each(function(d){
						/*
					motusMap.svg.selectAll("path:not(.hidden)").each(function(d){

						var projs = d.projID.split(',');

						projs.forEach(function(proj){

							if (motusMap.visible.projs.indexOf(proj) === -1) {	motusMap.visible.projs.push(proj)	}

						});
						if ($(this).hasClass('explore-map-track')) {

							var spp = d.species.split(',');

							spp.forEach(function(sp){
								if (motusMap.visible.spp.indexOf(sp) === -1) {	motusMap.visible.spp.push(sp)	}
							});

							motusMap.visible.animals = motusMap.visible.animals.concat(d.animals.split(','));

						}
					});

						*/

					if (dataType == 'species') {
						$("#" + containerID + " .species_count").text(motusMap.visible.spp.length);
						$("#" + containerID + " .animal_count").text(motusMap.visible.animals.length);
					}

					$("#" + containerID + " .project_count").text(motusMap.visible.projs.length);
				}
			}
		},
		svg: 'undefined',
		legend: {
			el: d3.select("#" + motusMap.el + "_legend"),
			svg: 'undefined'
		},
		colourScale: d3.scaleThreshold()
			.domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
			.range(d3.schemeReds[7]),
		colourScales: {
			stations: {
				points: {
					status: d3.scaleOrdinal(d3.schemeDark2),
					frequency: d3.scaleOrdinal(d3.schemeDark2),
					projID: d3.scaleSequential(d3.interpolateCubehelixDefault).domain([0,350]),
					id: d3.scaleOrdinal(d3.schemeDark2),
					name: d3.scaleOrdinal(d3.schemeDark2)
				},
				regions: {
					frequency: d3.scaleOrdinal(d3.schemeDark2),
					projID: d3.scaleSequential(d3.interpolateCubehelixDefault).domain([0,350])
				}
			},
			animals: {

			},
			tracks: {

			},
			projects: {

			},
			regions: {

			},
			species: {
				points: {
					status: d3.scaleOrdinal(d3.schemeDark2),
					frequency: d3.scaleOrdinal(d3.schemeDark2),
					projID: d3.scaleSequential(d3.interpolateCubehelixDefault).domain([0,350]),
					species: d3.scaleOrdinal(d3.schemeDark2),
					id: d3.scaleOrdinal(d3.schemeDark2)
				},
				tracks: {
					status: d3.scaleOrdinal(d3.schemeDark2),
					frequency: d3.scaleOrdinal(d3.schemeDark2),
					species: d3.scaleOrdinal(d3.schemeCategory10),
					projID: d3.scaleSequential(d3.interpolateCubehelixDefault).domain([0,350]),
					id: d3.scaleOrdinal(d3.schemeDark2)
				},
				regions: {
					frequency: d3.scaleOrdinal(d3.schemeDark2),
					projID: d3.scaleSequential(d3.interpolateCubehelixDefault).domain([0,350])
				}
			}
		},
		regionColours: {},
	/*	dataHover: function(e, d, dir, t){
			if (dir == 'in') {

				var filterName = motusFilter.colour;
				filterName = (filterName == 'species' && mapType != 'tracks') ? 'nSpp' : filterName;

				$('.tooltip').html("<big>" + d.name + "</big></br>" + $(".colourType_selector option[value='" + motusFilter.colour + "']").text() + ": " + d[filterName]);

				if (e.pageX + 15 + $('.tooltip').outerWidth() > $(window).width()) {
					$('.tooltip').css({top:e.pageY - 10, left:e.pageX - $('.tooltip').outerWidth() - 15});
				} else {
					$('.tooltip').css({top:e.pageY - 10, left:e.pageX + 15});
				}

				$('.tooltip:hidden').show();

				d3.selectAll(".explore-map-" + t + "s:not(." + t + "" + d.id + ")").style('opacity', '0.1');
			} else if (dir == 'out') {
				$('.tooltip').hide();
				d3.selectAll(".explore-map-" + t + "s").style('opacity', '1');
			}
		},
		*/
		dataHover: function(e, d, dir, t){
			if (t == 'station') {
				$('#explore-map-point-'+d.id).toggleClass('hover')
			}
			if (dir == 'in') {

				if (t == 'track') {
					/*
					var filterName = motusFilter.colour;

					var title = d[filterName];


					$('.tooltip').html(
						"<big>"+
							motusData.speciesByID.get(d.species)[0].english+
							" - #" + d.id +
						"</big>"+
						//(filterName != 'projID' ? ("<br/>Project " + d.projID) : "") +
					//	"<br/>Animal ID: " + d.id +
					//	"<br/>Frequency: " + d.frequency + " MHz" +
						"</br>Segment timespan: " + new Date( d.dtStart ).toISOString().substr(0,10)+ " - " + new Date( d.dtEnd ).toISOString().substr(0,10) +
						"</br>Segment length: " + Math.round(d.dist/1000) + " km" +
						"</br>(Click to view)"
					);
					d3.selectAll(".explore-map-" + t + "s:not(." + t + "" + ( (filterName == 'species' || mapType == 'tracks') ? d.id : d.id[0] ) + ")");
					*/
					$('.tooltip').html(
						"<big>"+
							(d.animals.split(',').length > 1 ? (d.animals.split(',').length + (d.species.split(',').length == 1 ? " " + (d.species == "NA" ? "Unknown species" : (motusData.speciesByID.get(d.species)[0].english + "s")) : " Animals") ):
							(d.species == "NA" ? "Unknown species" : motusData.speciesByID.get(d.species)[0].english) + " #"+d.animals)+
						"</big>"+
						"</br>(Click to view)"
					);

				} else if (t == 'region') {

					$('.tooltip').html(
						"<big>"+
							d.properties.name+
						"</big>"+
							(motusData.regionByCode.get(d.properties.adm0_a3)[0].stations>0?("</br>" + icons.station + motusData.regionByCode.get(d.properties.adm0_a3)[0].stations + " Stations"):"")+
							(motusData.regionByCode.get(d.properties.adm0_a3)[0].animals>0?("</br>" + icons.species + motusData.regionByCode.get(d.properties.adm0_a3)[0].animals + " Animals"):"")+
						"</br>(Click to view)"
					);

				} else if (t == 'station') {
					$('.tooltip').html(
						"<big>"+
							(d.group > 1 ? d.group + " Stations" : d.name)+
						"</big>"+
						"</br>(Click to view)"
					);

				} else {

					var filterName = motusFilter.colour;
					filterName = (dataType == 'species' && mapType != 'tracks') ? 'nSpp' : filterName;

					var title = (dataType == 'species' && mapType != 'tracks') ?
									(d.nSpp == 1 ? $("#filter_species option[value=" + d.species.split(',')[0] + "]").text() : "Species: " + d.nSpp) + "</br>Animals: " + d.id.length
								: d.name;


					$('.tooltip').html(
						"<big>"+
							title+
						"</big></br>"+
						$(".colourType_selector option[value='" + motusFilter.colour + "']").text() + ": " + d[filterName]+
						"</br>Start: " + moment( d.dtStart ).toISOString().substr(0,10)+
						(d.status == 'active' ? ("</br><div class='green'>Active</div>") : ("</br>End: " + moment( d.dtEnd ).toISOString().substr(0,10) + "</br><div class='red'>Terminated</div>"))
					);

				}
				if (e.pageX + 15 + $('.tooltip').outerWidth() > $(window).width()) {
					$('.tooltip').css({top:e.pageY - 10, left:e.pageX - $('.tooltip').outerWidth() - 15});
				} else {
					$('.tooltip').css({top:e.pageY - 10, left:e.pageX + 15});
				}

				$('.tooltip:hidden').show();

			} else if (dir == 'out') {
				$('.tooltip').hide();
			}
		},
		dataClick: function(e, d, t) {
			if (t == 'station') {

				if (d.group > 1) {
				//	console.log(d);
			/*		if (motusMap.rect) {motusMap.map.removeLayer(motusMap.rect);}
					var line = [d.bounds[0], [d.bounds[1][0],d.bounds[0][1]], d.bounds[1], [d.bounds[0][0],d.bounds[1][1]], d.bounds[0]]

					motusMap.rect = L.polyline(line, {className: 'no-hover'}).addTo(motusMap.map);
					//motusMap.rect = L.rectangle(d.bounds, {color: 'blue', weight: 1}).addTo(motusMap.map);
				*/	motusMap.map.fitBounds(d.bounds, {padding:[0,0], maxZoom: 200});
				} else {

					viewProfile('stations', d.id);
				}

			} else if (t == 'region') {

				default_startDate = dtLims.min;
				default_endDate = dtLims.max;


				viewProfile('regions', d.properties.adm0_a3);

			} else if (t == 'track') {

				// Highlight all the tracks that shares these animals
				$(".popup").remove();
				$("body").append("<div class='popup'><div class='popup-topbar'><div class='popup-topbar-close'>X</div></div><div class='popup-content'></div></div>");
				$(".popup").draggable({handle: ".popup-topbar"});
				$(".popup .popup-topbar .popup-topbar-close").click(function(){$(".popup").remove();$(".leaflet-track-route").removeClass('hidden');motusMap.group_f = 20;motusFilter.animals=[];});
				var allTracks = [];

				motusFilter.animals = d.animals.split(',');
				motusMap.group_f = false;

				var animals = motusFilter.animals.forEach(function(a){

					allTracks = allTracks.concat(motusData.tracksByAnimal[a]);

				});


				$(".leaflet-track-route").addClass('hidden');

				allTracks.filter(onlyUnique).forEach(function(route){

					if (exploreType == 'main') {
						var recvs = route.split('.');
						var recv1 = motusData.stationsBySubset[recvs[0]],
							recv2 = motusData.stationsBySubset[recvs[1]];
						recv1 = recv1 ? recv1 : recvs[0];
						recv2 = recv2 ? recv2 : recvs[1];

						recvs = ( recvs[0] < recvs[1] ? recvs[0] + "-" + recvs[1] : recvs[1] + "-" + recvs[0] );
						if ($("#leaflet-track-route-" + recvs ).length == 0) {
							recvs = ( recv1 < recvs[1] ? recv1 + "-" + recvs[1] : recvs[1] + "-" + recv1 );
							if ($("#leaflet-track-route-" + recvs ).length == 0) {
								recvs = ( recvs[0] < recv2 ? recvs[0] + "-" + recv2 : recv2 + "-" + recvs[0] );
								if ($("#leaflet-track-route-" + recvs ).length == 0) {
									recvs = ( recv1 < recv2 ? recv1 + "-" + recv2 : recv2 + "-" + recv1 );
								}
							}
						}
					} else {
						var recvs = route;
					}
					//$("#leaflet-track-route-" + ( recv1 < recv2 ? recv1 + "-" + recv2 : recv2 + "-" + recv1 ) ).removeClass('hidden');
					$("#leaflet-track-route-" + recvs ).removeClass('hidden');

				});
			//	console.log(motusData.stationsBySubset);
				// Make a table of species and their count and display a popup

				var spp = d.species.split(',');

				var speciesCounts = {};
				spp.forEach(sp => speciesCounts[sp] = speciesCounts[sp] ? speciesCounts[sp] + 1 : 1);

				$('.popup .popup-content').html(
					"<table><thead><tr><th>Species</th><th>Count</th></tr></thead><tbody>"+
					(spp.filter(onlyUnique).map(function(sp){
						//console.log(((sp=='NA'||motusData.speciesByID.get(sp)===undefined)?'Unknown species':motusData.speciesByID.get(sp)[0].english)+" - " +speciesCounts[sp]);
						return "<tr>" +
									"<td>"+
										((sp=='NA'||motusData.speciesByID.get(sp)===undefined)?'Unknown species':motusData.speciesByID.get(sp)[0].english) +
									"</td>"+
									"<td>"+
										speciesCounts[sp]+
									"</td>"+
								"</tr>";
					}).join(''))+
					"</tbody></table>"
				)

				if (e.pageX + 15 + $('.popup').outerWidth() > $(window).width()) {
					$('.popup').css({top:e.pageY - 10, left:e.pageX - $('.popup').outerWidth() - 15});
				} else {
					$('.popup').css({top:e.pageY - 10, left:e.pageX + 15});
				}

				$('.popup:hidden').show();
				$('.popup .popup-content table').DataTable({dom:"t", paging: false});
			}
		},
		highlightVal: '',
		setColour: function(val) {

			if (val != 'undefined') {

				var hasLegend = $("#explore_map_legend svg").length > 0;

				motusFilter.colour = val;

				if (val == 'species' && mapType == 'stations') {val = 'nSpp';}

				console.log('dataType: ' + dataType + ' - mapType: ' + mapType + ' - value: ' + val);

				if (typeof setCardColours !== 'undefined') {setCardColours(motusMap.colourScales[dataType][mapType][val])}

				console.log(motusMap.colourScales[dataType][mapType][val]("Conestogo"));

				motusMap.svg
					.selectAll('.explore-map-' + dataType + '.explore-map-' + mapType)
					.style(mapType == 'tracks' ? 'stroke' : 'fill', d => motusMap.colourScales[dataType][mapType][val](d[val]));

				if (hasLegend) {

					motusMap.legend.svg.html("");

					if (val == 'nSpp' || val == 'nAnimals' || val == 'lastData') {

						$("#explore_map_legend svg").show();

						var colourScale = motusMap.colourScales[dataType][mapType][val];

						if (val == 'projID' && mapType != 'regions') {
							colourScale = motusMap.colourScales[dataType][mapType][val].domain(motusMap.visible.projs).range(motusMap.visible.projs.map(function(key){ return projectColours[key]; }))
						} else if (val == 'nAnimals') {
							var d = colourScale.domain();
							colourScale.domain([d[1], d[0]]);
						}

						var legendWidth = $(motusMap.legend.el._groups[0][0]).parent().outerWidth();

						legend({
							el: motusMap.legend.svg,
							colour: colourScale,
							title: $(this).select2('data')[0].text,
						//	ticks: ((val == 'projID' && mapType != 'regions') ?  : undefined),
							tickFormat: ( (val == 'nSpp' || val == 'species' || val == 'nAnimals') ? ".0f" : 's' ),
							invert: (val == 'nSpp' || val == 'species' || val == 'nAnimals'),
							height: legendWidth > 600 ? 600 : legendWidth
						});

						if (val == 'nAnimals') {
							d = colourScale.domain();
							colourScale.domain([d[1], d[0]]);
						}
					} else {
						$("#explore_map_legend svg").hide();

					}
				}
			} else {
				console.warn('motusMap.setColour(val = undefined): You must specify a colour!');
			}
		},
		reset: function(dataset) {
			var bounds = motusMap.path.bounds(motusData.polygons),
			//var bounds = path.bounds(),
				topLeft = bounds[0],
				bottomRight = bounds[1];


			motusMap.svg.attr("width", bottomRight[0] - topLeft[0])
				.attr("height", bottomRight[1] - topLeft[1])
				.style("left", topLeft[0] + "px")
				.style("top", topLeft[1] + "px");

			motusMap.g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");


			//if (typeof tagDeps_el !== 'undefined') { tagDeps_el.attr("d", path); }
			if (typeof motusMap.stationPaths !== 'undefined') {
				motusMap.stationPaths.attr("d", motusMap.path.pointRadius(6));
				motusMap.g.selectAll('.explore-map-r2').attr("d", motusMap.path.pointRadius(2));
			}
			if (typeof motusMap.trackPaths !== 'undefined') { motusMap.trackPaths.attr("d", motusMap.path); }
			if (typeof motusMap.regionPaths !== 'undefined') { motusMap.regionPaths.attr("d", motusMap.path); }
		},
		setQuadtree: function(dataset) {
			motusMap.qtree = d3.quadtree()
				.x(d => d.geometry.coordinates[0])
				.y(d => d.geometry.coordinates[1])
				.addAll(dataset);

			if (dataType == 'stations') {
				motusMap.updateNodes(motusMap.qtree);
				motusMap.mapmove();
				motusMap.map.on("moveend", motusMap.mapmove);
			}

		},
		qtree: {},
		projectPoint: function(x, y) {
			if (x!==undefined) {
				var point = motusMap.map.latLngToLayerPoint(new L.LatLng(y, x));
				this.stream.point(point.x, point.y);
			}
		},
		search: function(quadtree, xmin, ymin, xmax, ymax, scale) {

			xmin = xmin < -180 ? -180 : xmin;
			xmax = xmax > 180 ? 180 : xmax;
			ymin = ymin < -90 ? -90 : ymin;
			ymax = ymax > 90 ? 90 : ymax;
			var pts = [];
			var subPixel = false;
			var subPts = [];
			scale = scale ? scale : motusMap.getZoomScale();
		//	console.log(" scale: " + scale);
			var counter = 0;
			var tmp = 0;
			var grid_f = 1; // grid size multiplication factor
			motusData.stationsBySubset = {};

			quadtree.visit(function (node, x1, y1, x2, y2) {
				var p = node.data;

				var pwidth = node.width * scale;
				var pheight = node.height * scale;

			//	if (tmp < 1 && !isNaN(pheight)) {tmp++;console.log(motusMap.groupData);}


				if (motusMap.groupData === 'rect' || motusMap.groupData === 'circles') {
					grid_f = motusMap.group_f ? motusMap.group_f : (motusMap.groupData === 'rect' ? 1 : (dataType == 'animals' ? 1 : 2));

					// -- if this is too small rectangle only count the branch and set opacity
					if ((pwidth * pheight) <= (grid_f*grid_f)*100) {
						// start collecting sub Pixel points
						//if (p && p.oldCoords) {p.geometry.coordinates=p.oldCoords;delete(p.oldCoords);p.geometry.type = 'Point';}
						subPixel = true;
					}
						// -- jumped to super node large than 1 pixel
					else {
						// end collecting sub Pixel points
						if (subPixel && subPts && subPts.length > 0) {

							subPts[0].group = subPts.length;
							subPts[0].bounds = [[d3.min(subPts[0].lats),d3.min(subPts[0].lons)],[d3.max(subPts[0].lats),d3.max(subPts[0].lons)]];
						//	if (p && p.oldCoords) {p.geometry.coordinates=p.oldCoords;delete(p.oldCoords);}

							if (motusMap.groupData == 'rect') {
								subPts[0].oldCoords = subPts[0].geometry.coordinates;
								subPts[0].geometry.coordinates = [[[x1,y1], [x1,y1+((grid_f*0.0001)/scale)], [x1+((grid_f*0.0001)/scale),y1+((grid_f*0.0001)/scale)], [x1+((grid_f*0.0001)/scale),y1], [x1,y1]]];
								subPts[0].geometry.type = 'Polygon';
							}

							pts.push(subPts[0]); // add only one todo calculate intensity
							counter += subPts.length - 1;
							subPts = [];
						}
						subPixel = false;
					}
				}
				if ((p)) {

					if (p.oldCoords) {p.geometry.coordinates=p.oldCoords;delete(p.oldCoords);p.geometry.type = 'Point';}
					if ((p) && (p.geometry.coordinates[0] >= xmin) &&
							   (p.geometry.coordinates[0] < xmax) &&
							   (p.geometry.coordinates[1] >= ymin) &&
							   (p.geometry.coordinates[1] < ymax)) {

						if (subPixel) {

							subPts.push(p);

							if (subPts.length == 1) {subPts[0].lats = [];subPts[0].lons = [];subPts[0].projID = [];}

							motusData.stationsBySubset[p.id] = subPts[0].id;

							subPts[0].lats.push(p.geometry.coordinates[1])
							subPts[0].lons.push(p.geometry.coordinates[0])
							if (!subPts[0].projID.includes(p.projID)) {subPts[0].projID.push(p.projID);}
							if (!subPts[0].dtStart || subPts[0].dtStart > p.dtStart) {subPts[0].dtStart = p.dtStart;}
							if (!subPts[0].dtEnd || subPts[0].dtEnd < p.dtEnd) {subPts[0].dtEnd = p.dtEnd;}
						//	if (tmp < 1) {tmp++;console.log(subPts);}
						}
						else {
							p.group = 1;
							if (p.bounds) {delete(p.bounds);}
							pts.push(p);
						}

					}
				}
				// if quad rect is outside of the search rect do not search in sub nodes (returns true)
				return x1 >= xmax || y1 >= ymax || x2 < xmin || y2 < ymin;
			});
		//	console.log(" Number of removed  points: " + counter);
			return pts;

		},
		updateNodes: function(quadtree) {
			var nodes = [];
			quadtree.depth = 0; // root

			quadtree.visit(function (node, x1, y1, x2, y2) {

				var nodeRect = {
					left: motusMap.MercatorXofLongitude(x1),
					right: motusMap.MercatorXofLongitude(x2),
					bottom: motusMap.MercatorYofLatitude(y1),
					top: motusMap.MercatorYofLatitude(y2),
				}
				node.width = (nodeRect.right - nodeRect.left);
				node.height = (nodeRect.top - nodeRect.bottom);

				nodes.push(node);
				for (var i = 0; i < 4; i++) {
					if (node[i]) node[i].depth = node.depth + 1;
				}
			});
			return nodes;
		},
		MercatorXofLongitude: function(lon) {
			return lon * 20037508.34 / 180;
		},
		MercatorYofLatitude: function(lat) {
			return (Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180)) * 20037508.34 / 180;
		},
		getZoomScale: function() {// Use Leaflet to implement a D3 geometric transformation.
			var mapWidth = motusMap.map.getSize().x;
		//	var mapHeight = motusMap.map.getSize().y;
			var bounds = motusMap.map.getBounds();
			var planarWidth = motusMap.MercatorXofLongitude(bounds.getEast()) - motusMap.MercatorXofLongitude(bounds.getWest());
		//	var planarHeight = MercatorYofLatitude(bounds.getNorth()) - MercatorYofLatitude(bounds.getSouth());
			var zoomScale = mapWidth / planarWidth;
		//	var zoomScale = mapHeight / planarHeight;
			return zoomScale;

		},
		redrawSubset: function(subset, scale) {
			scale = scale ? scale : motusMap.getZoomScale();
			//scale = scale < (5/2000) ? (5/2000) : (scale > (50/2000) ? (50/2000) : scale);
			var bounds = motusMap.path.bounds({ type: "FeatureCollection", features: subset });
			var topLeft = bounds[0];
			var bottomRight = bounds[1];

			//console.log({ type: "FeatureCollection", features: subset });
			//console.log(motusData.stationsBySubset);
			//console.log(d3.extent(subset, x => x.geometry.coordinates[1]));

			motusMap.svg.attr("width", bottomRight[0] - topLeft[0] + 100)
				.attr("height", bottomRight[1] - topLeft[1] + 100)
				.style("left", (topLeft[0]-50) + "px")
				.style("top", (topLeft[1]-50) + "px");

			motusMap.g.attr("transform", "translate(" + (-topLeft[0]+50) + "," + (-topLeft[1]+50) + ")");
			//motusMap.svg//.attr("width", bottomRight[0] - topLeft[0])
			//  .attr("height", bottomRight[1] - topLeft[1])
			  //.attr('class', "leaflet-zoom-hide")
			//  .style("left", topLeft[0] + "px")
			//  .style("top", topLeft[1] + "px");


			if (dataType == 'stations') {

				if (motusMap.groupData != 'rect') {
					motusMap.path.pointRadius((d)=>(d.group > 1  ? 10 : 5));
					//motusMap.path.pointRadius((d)=>(5+(Math.log(d.group))));
				}

				var stationsPaths = motusMap.g.selectAll(".explore-map-station.explore-map-point")
							  .data(subset, function (d) {
								  return d.id;
							  });
				stationsPaths.exit().remove();

/*
				points = motusMap.g.selectAll("path")
							  .data(subset, function (d) {
								  return d.id;
							  });
					points.enter().append("path");
					points.exit().remove();*/

				stationsPaths.enter().append("path").attr('class', 'leaflet-interactive explore-map-station explore-map-point');

				motusMap.g.selectAll(".explore-map-station.explore-map-point")
					.attr("d", motusMap.path)
					.attr('id', (d) => 'explore-map-point-'+d.id)
				//	.attr('class', 'leaflet-interactive explore-map-station explore-map-point')
					.on('mouseover', (e,d) => motusMap.dataHover(e, d, 'in', 'station'))
					.on('mouseout', (e,d) => motusMap.dataHover(e, d, 'out', 'station'))
					.on('click', (e,d) => motusMap.dataClick(e, d, 'station'))
					.style("fill", d => motusMap.colourScale(d[motusMap.colourVar]));

				if (motusMap.groupData == 'rect') {
					stationsPaths.style("fill-opacity", d => d.geometry.type != 'Point' ? (d.group/(0.001/scale)) : 1);
				} else {
					stationsPaths.style("fill-opacity", 1);
				}

				if (motusMap.groupData == 'circles') {

					text = motusMap.g.selectAll(".explore-map-text.explore-map-station")
							  .data(subset, function (d) {
								  return d.id;
							  })
					text.enter().append('text').attr('class', 'leaflet-interactive explore-map-text explore-map-station');
					text.exit().remove();

					motusMap.g.selectAll(".explore-map-station.explore-map-text")
						.attr("x", (d) => motusMap.path.centroid(d)[0])
						.attr("y", (d) => motusMap.path.centroid(d)[1] + 5)
						.attr("text-anchor","middle")
						.classed('hidden', (d) => d.group == 1)
						.text(d=>d.group)
						.on('mouseover', (e,d) => motusMap.dataHover(e, d, 'in', 'station'))
						.on('mouseout', (e,d) => motusMap.dataHover(e, d, 'out', 'station'))
						.on('click', (e,d) => motusMap.dataClick(e, d, 'station'));

				} else if ($(".explore-map-station.explore-map-text").length > 0) {
					$(".explore-map-station.explore-map-text").remove();
				}
			} else if (dataType == 'animals') {
				var nVisible = 0;
				var mapBounds = motusMap.map.getBounds();
				mapBB = [mapBounds._southWest, mapBounds._northEast]
		//		console.log(motusData.trackDataByRoute);
				var trackDataByRouteBundled = Array.from(d3.rollup(motusData.trackDataByRoute,
				function(v) {
					//		if (v[0][1].recv1 == '4555' || v[0][1].recv2 == '4555') {console.log(v);}
					nVisible += v.map(x=>x[1].animals).join(',').split(',').length;
					return {
						animals: v.map(x=>x[1].animals).join(','),
						species: v.map(x=>x[1].species).join(',').split(',').join(','),
						frequency: v.map(x=>x[1].frequency).join(',').split(',').filter(onlyUnique).join(','),
						projID: v.map(x=>x[1].projID).join(',').split(',').filter(onlyUnique).join(','),
						type: v[0][1].type,
						dist: v[0][1].dist,
						recv1: v[0][1].recv1,
						recv2: v[0][1].recv2,
						dtStart: d3.min(v.map(x=>x[1].dtStart)),
						dtEnd: d3.max(v.map(x=>x[1].dtEnd)),
						coordinates: v[0][1].coordinates
					}
				}, function(x){
					var recv1 = motusData.stationsBySubset[x[1].recv1],
						recv2 = motusData.stationsBySubset[x[1].recv2];
					recv1 = recv1 ? recv1 : x[1].recv1;
					recv2 = recv2 ? recv2 : x[1].recv2;
					return recv1 < recv2 ? recv1+"."+recv2 : recv2+"."+recv1;
				}).values())
					.filter( function(x) {
						return	( // If at least one end of the track falls within the bounding box.
									inbb(x.coordinates[0], mapBB) ||
									inbb(x.coordinates[1], mapBB)
								) &&
								( //	If the animal filter is not set or if the animal filter contains one of the animals in the track.
									!motusFilter.animals ||
									motusFilter.animals.length == 0 ||
									motusFilter.animals.some(
										(a) => x.animals.split(',').includes(a)
									)
								)
					});

				function inbb(p, bb) {
					return (bb[0].lng <= p[0] && bb[1].lng >= p[0] && bb[0].lat <= p[1] && bb[1].lat >= p[1] );
				}

			//	console.log(trackDataByRouteBundled);
			//	console.log(Array.from(trackDataByRouteBundled.values()).filter(x=>(!motusFilter.animals||motusFilter.animals.length == 0||motusFilter.animals.some((a) => x.animals.split(',').includes(a)))).length);

				motusMap.g.selectAll("path").remove();
				//console.log("Scale: "+scale + " - (2/(1-Math.log(scale))): "+(2/(1-Math.log(scale))));
				console.log("Showing " + (trackDataByRouteBundled.length) + " tracks");

				$("#explore_filters").siblings('.filter_status').find('span:eq(0)').text(nVisible);
			//			console.log(trackDataByRouteBundled);

				var tracks_el = motusMap.g.selectAll("tracks")
					//.data(Array.from(trackDataByRouteBundled.values()).filter(x=>(!motusFilter.animals||motusFilter.animals.length == 0||motusFilter.animals.some((a) => x.animals.split(',').includes(a)))))
					.data(trackDataByRouteBundled);
				tracks_el.exit().remove();
				tracks_el.enter().append("path")
					.attr('class', "leaflet-zoom-hide leaflet-track-route explore-map-track")
					.attr('id', (d) => ("leaflet-track-route-"+(d.recv1 < d.recv2 ? d.recv1 + '-' + d.recv2 : d.recv2 + '-' + d.recv1)))
					.style('stroke', (d) => motusMap.colourScale(d.frequency.split(',')[0]))
					.style('stroke-width', (d) => 2+(Math.log(d.animals.split(',').length,3)))
					.style('opacity', (d) => (2/(1-Math.log(scale)))*(1 + Math.log(d.animals.split(',').length)))
					.style('pointer-events', 'auto')
					.attr("d", motusMap.path)
					.on('mouseover', (e,d) => motusMap.dataHover(e, d, 'in', 'track'))
					.on('mouseout', (e,d) => motusMap.dataHover(e, d, 'out', 'track'))
					.on('click', (e,d) => motusMap.dataClick(e, d, 'track'));

			}
		//	console.log("updated in " + new Date().setTime(new Date().getTime() - start.getTime()) + " ms ");
			motusMap.setVisibility();
		},
		mapmove: function(e) {

			var mapBounds = motusMap.map.getBounds();
			var scale = motusMap.getZoomScale();
			if (dataType == 'stations') {
				var subset = motusMap.search(motusMap.qtree, mapBounds.getWest(), mapBounds.getSouth(), mapBounds.getEast(), mapBounds.getNorth(), scale);
			}
			else {
				var subset = motusMap.search(motusMap.qtree, -180, -90, 180, 90);
			}
			console.log("Subset: ", subset)

			motusMap.redrawSubset(subset, scale);
		//	redrawSubset(subset);
		}

	};

}




function loadMapObjects(callback) {
	console.log(motusMap.el);
	motusMap.map = new L.Map(motusMap.el, {
			center: motusMap.center,
			zoom: motusMap.zoom,
			maxZoom: 200,
			maxNativeZoom: 200,
			fullscreenControl: true,
			zoomControl: true,
			zoomSnap: dataType == 'regions' ? 0 : 1,
			zoomDelta: dataType == 'regions' ? 0.25 : 0.5,
		})

	if (dataType == 'stations' || dataType == 'animals' || exploreType != 'main') {motusMap.map.addLayer(new L.TileLayer(motusMap.tileLayer));}



	//L.control.mapView({ position: 'topleft' }).addTo(motusMap.map);
	motusMap.map.zoomControl.setPosition('topleft');
	motusMap.map.fullscreenControl.setPosition('topleft');
//	motusMap.map.setMaxBounds([[-90,-240],[90,240]]);

	motusMap.svg = d3.select(motusMap.map.getPanes().overlayPane).append("svg");

	motusMap.g = motusMap.svg.append("g");//.attr("class", "leaflet-zoom-hide");

	var transform = d3.geoTransform({point: motusMap.projectPoint});
	motusMap.path = d3.geoPath().projection(transform);


	motusMap.legend.svg = motusMap.legend.el.append('svg').attr('class','leaflet-zoom-hide');

	console.log(Object.keys(motusData));

	for (dataset in motusData) {

		if (dataset == 'regions') {


			motusData.regionByCode = d3.group(motusData.regions,  d => d.ADM0_A3);

			var stationsRemaining = motusData.recvDepsLink;

			//motusMap.colourScales.regions.stations = d3.scaleSequential(d3.interpolateYlGnBu).domain([-100,1000])
			motusMap.colourScales.regions.stations = d3.scaleOrdinal().domain(["166.380 MHz", "151.50 MHz", "150.10 MHz", "none"]).range(["#66c2a5","#fc8d62","#8da0cb","#999999"]);

			var continentFreqs = {
				"North America":"166.380 MHz",
				"South America":"166.380 MHz",
				"Europe":"150.10 MHz",
				"Asia":"151.50 MHz",
				"Oceania":"151.50 MHz",
				"Africa":"150.10 MHz",
				"Antarctica":"none"
			}
			var regionFreqs = {
				"Americas":"166.380 MHz",
				"Europe":"150.10 MHz",
				"Asia":"151.50 MHz",
				"Oceania":"151.50 MHz",
				"Africa":"150.10 MHz",
				"Antarctica":"none"
			}
			console.log(motusData.stations)
			motusData.stationsByRegions = d3.group(motusData.stations, d => d.country);
			motusData.stationsByProjects = d3.group(motusData.stations, d => d.projID);



			motusMap.regionColours = motusMap.colourScales.regions.stations;

			if (exploreType == 'main') {
				console.log(motusData.polygons.features[0].properties);

				var propNames = ["adm0_a3", "region_un"]
				//var propNames = ["COUNTRY", "REGION"]

				var regions_el = motusMap.g.selectAll("regions")
					.data(motusData.polygons.features)
					.enter().append("path")
					.attr('class', (d) => (motusData.regionByCode.get(d.properties[propNames[0]].substr(0,3)) === undefined || motusData.regionByCode.get(d.properties[propNames[0]].substr(0,3))[0].both == 0 ? ' leaflet-hide-always' : ' leaflet-interactive'))
					.style('fill', function(d){
						return motusData.regionByCode.get(d.properties[propNames[0]].substr(0,3)) === undefined || motusData.regionByCode.get(d.properties[propNames[0]].substr(0,3))[0].both == 0 ? "#DDDDDD" : motusMap.regionColours(regionFreqs[d.properties[propNames[1]]]);
					})
					.style('stroke-width', function(d){
						return motusData.regionByCode.get(d.properties[propNames[0]].substr(0,3)) === undefined || motusData.regionByCode.get(d.properties[propNames[0]].substr(0,3))[0].both == 0 ? 0 : 1;
					})
					.on('mouseover', (e,d) => motusMap.dataHover(e, d, 'in', 'region'))
					.on('mouseout', (e,d) => motusMap.dataHover(e, d, 'out', 'region'))
					.on('click', (e,d) => motusMap.dataClick(e, d, 'region'));

				motusMap.map.on("zoomend", reset);

				// Reposition the SVG to cover the features.
				reset();
			}

		} else if (dataset == 'stations') {

			var station_freqs = [];
			motusData.recvDepsLink = Array.from(d3.rollup(motusData.stations, function(v){

					var startDate = moment(d3.min(v, d => d.dtStart));
					var endDate = moment(d3.max(v, d => d.dtEnd == "NA" ? moment().valueOf() : d.dtEnd));
					if (dtLims.min > startDate) {dtLims.min = startDate;}
					if (dtLims.max < endDate) {dtLims.max = endDate;}

					if (!station_freqs.includes(v[0].frequency)) {station_freqs.push(v[0].frequency);}
					//recvDepsLink.push([+row.lon, +row.lat, +row.id]);

					return {
						id: v[0].id,
						type: 'Feature',
						geometry: {
							type: "Point",
							coordinates: [+v[0].lon, +v[0].lat]
						},
						status: (Array.from(v.map( d => d.dtEnd ).values()).includes('NA') ? 'active' : 'expired'),
						frequency: v[0].frequency,
						name: v[0].name,
						projID: Array.from(v.map( d => d.projID ).values()).filter(onlyUnique).join(','),
						dtStart: startDate,
						dtEnd: endDate,
						lastData: moment().diff(endDate, 'days'),
						nAnimals: v.map(x => x.animals.split(';')).flat().filter(onlyUnique).length,
						nSpp: v.map(x => x.species.split(';')).flat().filter(onlyUnique).length
					}

			}, x => x.name).values());
			//motusData.stations = motusData.recvDepsLink;
/*
			motusData.stations.forEach(function(row){

				var startDate = moment(row.dtStart);
				var endDate = row.dtEnd == "NA" ? moment() : moment(row.dtEnd);
				if (dtLims.min > startDate) {dtLims.min = startDate;}
				if (dtLims.max < endDate) {dtLims.max = endDate;}
				row.id = row.deployID;

				motusData.recvDepsLink.push({
					id: row.id,
					type: 'Feature',
					geometry: {
						type: "Point",
						coordinates: [+row.lon, +row.lat]
					},
					frequency: row.frequency,
					name: row.name,
					projID: row.projID,
					dtStart: startDate,
					dtEnd: endDate
				});

				if (!station_freqs.includes(row.frequency)) {station_freqs.push(row.frequency);}
				//recvDepsLink.push([+row.lon, +row.lat, +row.id]);
				row.status = row.status == 'active' ? (row.dtEnd == 'NA' ? 'active' : 'expired') : row.status;

				row.dtStart = moment(row.dtStart);
				row.dtEnd = row.dtEnd == "NA" ? moment() : moment(row.dtEnd);

				row.lastData = (moment().valueOf() - row.dtEnd) / (1000 * 60 * 60 * 24);
				row.nAnimals = Math.ceil(Math.random() * ((row.dtEnd - row.dtStart) / ((1000 * 60 * 60 * 24) * (10))));
				row.nSpp = Math.ceil(Math.random() * (10));

			});

*/
			if (motusData.polygons === undefined) {

				motusMap.colourScales.stations.frequency = d3.scaleOrdinal().domain(["166.38", "151.5", "150.1", "434", "none"]).range(["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#999999"]);

				motusMap.colourVar = "frequency";

				motusMap.colourScale = motusMap.colourScales.stations.frequency;

				motusMap.setQuadtree(motusData.recvDepsLink);

			}

		} else if (dataset == 'animals') {

		/*
				TAG DEPLOYMENT DATA
		*/

			motusData.animalsByRegions = d3.group(motusData.animals, d => d.country, d => d.deployID);
			motusData.animalsByProjects = d3.group(motusData.animals, d => d.projID, d => d.deployID);

		} else if (dataset == 'tracks') {

			// TRACKS
		//	if (exploreType != 'main') {
			if (false) {
				var trackDataLink = [];
				var animal_freqs = [];

				motusData.tracks.forEach(function(row, i){
					if (row.deployID.length > 0) {
						source = [+row.lon1, +row.lat1];
						target = [+row.lon2, +row.lat2];
						topush = {
								type: "LineString",
								coordinates: [source, target],
								id: row.deployID,
								recv1: row.recvDeployID1,
								recv2: row.recvDeployID2,
								dist: row.dist,
								dtStart: moment( d3.min(row.dtStart.split(',')) ),
								dtEnd: moment( d3.max(row.dtEnd.split(',')) ),
								species: row.species,
								projID: row.projID,
								frequency: row.freq,
								lastData: (moment().valueOf() - moment(row.dtEnd).valueOf()) / (1000 * 60 * 60 * 24),
								status: 'terminated'
							};

						topush.route = topush.recv1 + '.' + topush.recv2;
						if (!animal_freqs.includes(row.freq)) {animal_freqs.push(row.freq);}
						trackDataLink.push(topush)
					}
				});

				var trackDataByRoute = d3.rollup(trackDataLink, function(v) {
					return {
						animals: v.map(x=>x.id).join(','),
						species: v.map(x=>x.species).filter(onlyUnique).join(','),
						type: v[0].type,
						dist: v[0].dist,
						recv1: v[0].recv1,
						recv2: v[0].recv2,
						dtStart: v[0].dtStart,
						dtEnd: v[0].dtEnd,
						projID: v[0].projID,
						frequency: v[0].frequency,
						coordinates: v[0].coordinates
					}
				}, x => +x.route );

				all_lastData = trackDataLink.map( x => +x.lastData );
			} else if (exploreType == 'main') {

				motusData.tracksByAnimal = {};

				motusData.nTracks = 0;

				motusData.trackDataByRoute = d3.rollup(motusData.tracks, function(v) {
					var dtStart = moment(d3.min(v[0].dtStart.split(',')));
					var dtEnd = moment(d3.min(v[0].dtEnd.split(',')));
					if (dtLims.min > dtStart) {dtLims.min = dtStart;}
					if (dtLims.max < dtEnd) {dtLims.max = dtEnd;}
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
						dtStart: dtStart,
						dtEnd: dtEnd,
						frequency: v[0].frequency,
						coordinates: [ [v[0].lon1, v[0].lat1], [v[0].lon2, v[0].lat2]]
					}
				}, x => +x.route );

				$("#explore_filters").siblings('.filter_status').find('span:eq(1)').text(motusData.nTracks);
				//	console.log(tracksByAnimal);

			}


			motusMap.colourScales.tracks.freq = d3.scaleOrdinal().domain(["166.38", "151.5", "150.1", "434", "none"]).range(["#1b9e77","#d95f02","#7570b3","#e7298a","#999999"]);

			motusMap.colourVar = "freq";

			motusMap.colourScale = motusMap.colourScales.tracks.freq;




			if (exploreType != 'main') {
				// Add the path later on
			} else {

				motusMap.group_f = 20;
				motusMap.groupData = 'circles';

				motusMap.updateNodes(motusMap.qtree);
				motusMap.mapmove();
				motusMap.map.on("moveend", motusMap.mapmove);
			}
		}

		console.log("Loaded " + dataset+ " to the map.");

	//	loadContent();
	}
	// TIMELINE

	if (timeline != undefined && timeline.el != undefined) {

		var dateLimits = motusData.stations.map(function(d){
			return {
				start: d.dtStart,
				end: d.dtEnd
			}
		});
		timeline.min = d3.min(dateLimits.map(d=>+d.start)) / 1000;
		timeline.max = d3.max(dateLimits.map(d=>+d.end)) / 1000;
		dtLims.min = timeline.min;
		dtLims.max = timeline.max;
		$(timeline.el).dragslider("option", { "min": timeline.min, "max": timeline.max});
	//	console.log($('#explore_filters input.filter_dates').data('daterangepicker'));

	//	($('#explore_filters input.filter_dates').data('daterangepicker')).minDate = moment(new Date(timeline.min * 1000));
//		$("#explore_filters input.filter_dates").daterangepicker("option", { "minDate": new Date(timeline.min * 1000), "maxDate": new Date(timeline.max * 1000)});
		timeline.createLegend();

	}

	function reset(dataset) {
		var bounds = motusMap.path.bounds(motusData.polygons),
		//var bounds = path.bounds(),
			topLeft = bounds[0],
			bottomRight = bounds[1];


		motusMap.svg.attr("width", bottomRight[0] - topLeft[0])
			.attr("height", bottomRight[1] - topLeft[1])
			.style("left", topLeft[0] + "px")
			.style("top", topLeft[1] + "px");

		motusMap.g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");


		//if (typeof tagDeps_el !== 'undefined') { tagDeps_el.attr("d", path); }
		if (typeof station_el !== 'undefined') { station_el.attr("d", motusMap.path); }
		if (typeof tracks_el !== 'undefined') { tracks_el.attr("d", motusMap.path); }
		if (typeof regions_el !== 'undefined') { regions_el.attr("d", motusMap.path); }
	}

	$(".toggleButton.explore_type:visible.selected").click();

//	console.log(d3.extent(motusData.stations, d=>d.coordinates[0]));
//	console.log(d3.extent(motusData.stations, d=>d.coordinates[1]));




	//motusMap.setVisibility(true);

	afterMapLoads();

}
