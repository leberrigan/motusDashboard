
var motusMap = {};

var rawData = {};

var mapType = null; // "point" or "region"
var showTracks = true; // 
var dataType = null; // 'stations' or 'species'

var projectColours = {};
var milliseconds_annually = 3.154 * (10^10);
			

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

	$('#' + containerID).append('<div id="' + map_el + '" class="explore_map mapType_points mapType_regions mapType_tracks mapType_deployments"></div>');
	$('#' + containerID).append('<div id="' + map_el + '_legend" class="mapType_points mapType_regions mapType_tracks mapType_deployments"></div>');
	
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
			Projs: [],
			Spp: [],
			Animals: []
		},
		zoom: mapZoom,
		tileLayer: tileLayer,
		map:  {},
		pointPath: d3.geoPath().pointRadius(1),// A path generator 
		isVisible: function(d, vis, ch) {
			
		//	console.log(motusFilter.project + " == " + d.projID)
			
			const visibility = vis && (
					(
						typeof d.geometry !== 'undefined'	
					) || (
						!(
							motusFilter.dtEnd <= d.dtStart || motusFilter.dtStart >= d.dtEnd
						) && (
							//motusFilter.project == d.projID || 
							motusFilter.projects == 'all' ||
							d.projID.split(',').some(r => motusFilter.projects.includes(r))
						)&& (
							//motusFilter.project == d.projID || 
							motusFilter.frequencies == 'all' ||
							//d.frequency.split(',').includes(motusFilter.frequencies) 
							d.frequency.split(',').some(r => motusFilter.frequencies.includes(r))
						) && (
							typeof d.species == "undefined" ||
							motusFilter.species == 'all' || 
						//	d.species.split(',').includes(motusFilter.species) 
							d.species.split(',').some(r => motusFilter.species.includes(r))
						)
					)
				);
				
			return (ch ? (visibility ? 'visible' : 'hidden') : !visibility);
					
		},
		setVisibility: function(switchType) {
			if (switchType === true && motusMap.svg !== 'undefined') {
				
			
				motusMap.svg.selectAll(".explore-map-" + ( mapType == 'regions' ? 'points' : 'regions' ))
					.attr('visibility', 'hidden')
					.classed('hidden', true);
					
				motusMap.svg.selectAll(".explore-map-" + ( mapType != 'tracks' ? 'tracks' : 'points' ))
					.attr('visibility', 'hidden')
					.classed('hidden', true);
					
				motusMap.svg.selectAll(".explore-map-" + ( dataType == 'stations' ? 'species' : 'stations' ))
					.attr('visibility', 'hidden')
					.classed('hidden', true);
					
			} 
			
			if (motusMap.svg !== 'undefined') {
				
				motusMap.svg.selectAll(".explore-map-" + mapType + ".explore-map-" + dataType)
					.attr('visibility', d => motusMap.isVisible(d, true, true))
					.classed('hidden', d => motusMap.isVisible(d, true, false))
				
				motusMap.visible.Projs = [];
				
				if (dataType == 'stations') {
					$("#" + containerID + " .station_count").text($(".explore-map-points.explore-map-stations:not(.hidden)").length);
				} else {

					motusMap.visible.Animals = [];
					motusMap.visible.Spp = [];
					
				}
				
				motusMap.svg.selectAll(".explore-map-points.explore-map-" + dataType + ":not(.hidden)").each(function(d){
					
					var projs = d.projID.split(',');
					
					projs.forEach(function(proj){
						
						if (motusMap.visible.Projs.indexOf(proj) === -1) {motusMap.visible.Projs.push(proj)}
					
					});
					
					if ($(this).hasClass('explore-map-species')) {
						
						var spp = d.species.split(',');
						
						spp.forEach(function(sp){
							if (motusMap.visible.Spp.indexOf(sp) === -1) {motusMap.visible.Spp.push(sp)}
						});
						
						motusMap.visible.Animals = motusMap.visible.Animals.concat(d.id.split(','));
						
					}
					
				});
				
				
				if (dataType == 'species') {
					$("#" + containerID + " .species_count").text(motusMap.visible.Spp.length);
					$("#" + containerID + " .animal_count").text(motusMap.visible.Animals.length);
				}
				
				$("#" + containerID + " .project_count").text(motusMap.visible.Projs.length);
			}
		},
		svg: 'undefined',
		legend: {
			el: d3.select("#" + motusMap.el + "_legend"),
			svg: 'undefined'
		},
		colorScale: d3.scaleThreshold()
			.domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
			.range(d3.schemeReds[7]),
		colorScales: {
			stations: {
				points: {
					status: d3.scaleOrdinal(d3.schemeDark2),
					frequency: d3.scaleOrdinal(d3.schemeDark2),
					projID: d3.scaleSequential(d3.interpolateCubehelixDefault).domain([0,350]),
					id: d3.scaleOrdinal(d3.schemeDark2)
				},
				regions: {
					frequency: d3.scaleOrdinal(d3.schemeDark2),
					projID: d3.scaleSequential(d3.interpolateCubehelixDefault).domain([0,350])
				}
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
		dataHover: function(e, d, dir, t){
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
		highlightVal: '',
		setColour: function(val) {
			
			if (val != 'undefined') {
				
				var hasLegend = $("#explore_map_legend svg").length > 0;

				motusFilter.colour = val;
			
				if (val == 'species' && mapType == 'stations') {val = 'nSpp';}
				
				console.log('dataType: ' + dataType + ' - mapType: ' + mapType + ' - value: ' + val);
				
				if (typeof setCardColours !== 'undefined') {setCardColours(motusMap.colorScales[dataType][mapType][val])}
				
				motusMap.svg
					.selectAll('.explore-map-' + dataType + '.explore-map-' + mapType)
					.style(mapType == 'tracks' ? 'stroke' : 'fill', d => motusMap.colorScales[dataType][mapType][val](d[val]));
				
				if (hasLegend) {
					
					motusMap.legend.svg.html("");
					
					if (val == 'nSpp' || val == 'nAnimals' || val == 'lastData') {
						
						$("#explore_map_legend svg").show();
						
						var colourScale = motusMap.colorScales[dataType][mapType][val];

						if (val == 'projID' && mapType != 'regions') {
							colourScale = motusMap.colorScales[dataType][mapType][val].domain(motusMap.visible.Projs).range(motusMap.visible.Projs.map(function(key){ return projectColours[key]; }))
						} else if (val == 'nAnimals') {
							var d = colourScale.domain();
							colourScale.domain([d[1], d[0]]);
						}
						
						var legendWidth = $(motusMap.legend.el._groups[0][0]).parent().outerWidth();
					
						legend({
							el: motusMap.legend.svg,
							color: colourScale,
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
		}
	};

				
	// Add new controls to map
	L.Control.mapViewConstruct = L.Control.extend({
		onAdd: function(map){
			
			var buttonContainer = L.DomUtil.create('div');
			
			var button = {};
			
			for (b in motusMap.mapButtons) {
			//	console.log(b + ": " + map.mapButtons[b])
				button = L.DomUtil.create('div', motusMap.mapButtons[b], buttonContainer);
				button.innerHTML = b;
				button.onclick = function(){
									if (!$(this).hasClass('selected')) {
										$("#explore_map_container .toggleButton.selected").removeClass('selected');
										$(this).addClass('selected');
									}
									
									mapType = this.innerHTML.toLowerCase();
									
									mapType = mapType == 'deployments' ? 'points' : mapType;
									
									motusMap.setVisibility(true);
								};
					
				if (motusMap.mapButtons[b].split(' ').includes('selected')) {
					mapType = b.toLowerCase();
					mapType = mapType == 'deployments' ? 'points' : mapType;
				}
				
			}
			
			
			return buttonContainer;
		},
		onRemove: function(map){
			
		}
	});

	L.control.mapView = function(opts){
		return new L.Control.mapViewConstruct(opts);
	}
	
}


function loadMapData(fileList, callback) { // Only runs after select menus have populated
	
	if (typeof fileList === 'string') {fileList = [fileList];}
	
	if (/*fileList.includes("regions") && */!fileList.includes("polygons")) {
		fileList.push("polygons");
	}
	
	var mapFiles = {
		polygons: "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson",
		stations: "data/recv-deps.csv",
		tracks: "data/siteTrans.csv",
		tagDeps: "data/tag-deps.csv",
		regions: "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv"
	};
	
	var promises = [];
	
	fileList.forEach(function(f){
		
		if (typeof mapFiles[f] !== 'undefined') {
			var url = mapFiles[f];
			url.substr(url.lastIndexOf('.') + 1, url.length) == 'csv' ? promises.push(d3.csv(url)) : promises.push(d3.json(url));
		}
		
	});
		
	Promise.all(promises).then(function(response){
		
		var rawData = { };
		
		fileList.forEach(function(f, i){
			
			rawData[f] = response[i];
			
		});
		
		console.log("Loaded " + Object.keys(rawData).length + " data set" + (Object.keys(rawData).length == 1 ? "" : "s"));
		
		loadMapObjects(rawData, callback);
		
	});
	
}

	
function loadMapObjects(rawData, callback) {
			
	motusMap.map = new L.Map(motusMap.el, {
			center: motusMap.center, 
			zoom: motusMap.zoom, 
			fullscreenControl: true,
			zoomControl: true
		})
		.addLayer(new L.TileLayer(motusMap.tileLayer));
	
	L.control.mapView({ position: 'topleft' }).addTo(motusMap.map);
	motusMap.map.zoomControl.setPosition('topleft');
	motusMap.map.fullscreenControl.setPosition('topleft');
	
	
	motusMap.svg = d3.select(motusMap.map.getPanes().overlayPane).append("svg");
	
	var g = motusMap.svg.append("g");//.attr("class", "leaflet-zoom-hide");
	var transform = d3.geoTransform({point: projectPoint});
	var path = d3.geoPath().projection(transform);
	
	motusMap.legend.svg = motusMap.legend.el.append('svg');
			
	for (dataset in rawData) {
		
		if (dataset == 'regions') {
		
			
			motusMap.regionColours = d3.group(rawData.regions, d => d.code);
			
			var regions_el = g.selectAll("regions")
				.data(rawData.polygons.features)
				.enter().append("path")
				.attr('class', 'explore-map-regions explore-map-stations leaflet-zoom-hide')
				.style('fill', function (d) {
					
					d.total = motusMap.regionColours.get(d.properties.adm0_a3_is) ? +motusMap.regionColours.get(d.properties.adm0_a3_is)[0].pop : 0;
					
					return motusMap.colorScale(d.total);
				});
		
		} else if (dataset == 'stations') {
			
			var recvDepsLink = [];
			
			
			rawData.stations.forEach(function(row){
				
				var startDate = new Date(row.dtStart);
				var endDate = row.dtEnd == "NA" ? new Date() : new Date(row.dtEnd);
				
				
				topush = {
					type: "Point",
					coordinates: [+row.lon, +row.lat], 
					id: row.deployID, 
					name: row.name, 
					status: row.status, 
					dtStart: startDate, 
					dtEnd: endDate, 
					lastData: (new Date().getTime() - endDate) / (1000 * 60 * 60 * 24), 
				//	nAnimals: Math.ceil(Math.random() * (1000)), //* ((new Date(row.dtStart).getTime())-(endDate.getTime())) / milliseconds_annually,
					nAnimals: Math.ceil(Math.random() * ((endDate - startDate) / ((1000 * 60 * 60 * 24) * (10)))), // Chance of detecting a bird every 10 days. This is equal to: ceiling( [random value 0 to 1] * [number of milliseconds] / ( [milliseconds per day] * [10 days]) )
					projID: row.projID, 
					serno: row.serno,
					nAnt: row.nAnt,
					nSpp: Math.ceil(Math.random() * (10)),
					frequency: row.frequency
				}
				if (!isNaN(topush.coordinates[0]) && !isNaN(topush.coordinates[1]) && topush.frequency != 'NA')	recvDepsLink.push(topush)
			});
			
			var circle = d3.geoCircle();
			
			
			// See: https://stackoverflow.com/questions/1669190/find-the-min-max-element-of-an-array-in-javascript?page=1&tab=votes#tab-top
			
			var all_nAnimals = recvDepsLink.map( x => +x.nAnimals );
			motusMap.colorScales.stations.points.nAnimals = d3.scaleSequential(d3.interpolateSpectral).domain([Math.max.apply(Math, all_nAnimals), Math.min.apply(Math, all_nAnimals)]);
			
			var all_lastData = recvDepsLink.map( x => +x.lastData );
			motusMap.colorScales.stations.points.lastData = d3.scaleSequential(d3.interpolateSpectral).domain([Math.max.apply(Math, all_lastData), Math.min.apply(Math, all_lastData)]);
			
			var all_nSpp = recvDepsLink.map( x => +x.nSpp );
			motusMap.colorScales.stations.points.nSpp = d3.scaleSequentialLog(d3.interpolateSpectral).domain([Math.min.apply(Math, all_nSpp), Math.max.apply(Math, all_nSpp)]);
		
			var all_frequencies = recvDepsLink.map( x => x.frequency ).filter(onlyUnique);//.filter(function(x){return x.split(',').length == 1;});

			var nProjs = recvDepsLink.map( x => +x.projID ).filter(onlyUnique).length; // Get unique list of IDs in station table

			
			// For ordinal data, get a nice mix
			var selectedColours = customColourScale.jnnnnn.slice(0, nProjs);
			
			projectColours = Object.assign(...$("#explore_filters .explore_projects option:not(:first-child)").map(function(){return this.value;}).get().map((k, i) => ({[k]: selectedColours[i]})))
			
			
			// Select only enough colours to fill each category
			motusMap.colorScales.stations.points.projID = d3.scaleOrdinal().domain($("#explore_filters .explore_projects option:not(:first-child)").map(function(){return this.value;}).get()).range(customColourScale.jnnnnn.slice(0, nProjs));
			motusMap.colorScales.species.points.projID = d3.scaleOrdinal().domain($("#explore_filters .explore_projects option:not(:first-child)").map(function(){return this.value;}).get()).range(customColourScale.jnnnnn.slice(0, nProjs));
			motusMap.colorScales.species.tracks.projID = d3.scaleOrdinal().domain($("#explore_filters .explore_projects option:not(:first-child)").map(function(){return this.value;}).get()).range(customColourScale.jnnnnn.slice(0, nProjs));
				
			motusMap.colorScale = motusMap.colorScales.stations.points.nAnimals;
			
			$("#" + containerID + " .station_count").text(recvDepsLink.length);
			
			var station_el = g.selectAll("stations")
				.data(recvDepsLink.sort(function(x, y){return d3.descending(x.status, y.status);}))
				.enter().append("path")
				.attr('class', (d) => "explore-map-points explore-map-stations station" + d.id + " leaflet-zoom-hide")
				.style("stroke", "#000")
				.style('fill', (d) => motusMap.colorScale(+d.nAnimals))
				.style('pointer-events', 'auto')
				.on('mouseover', (e,d) => motusMap.dataHover(e, d, 'in', 'station'))
				.on('mouseout', (e,d) => motusMap.dataHover(e, d, 'out', 'station'))
				.on('click', (e,d) => mapInfoPanel(d, 'show', 'station'));
		
		} else if (dataset == 'tagDeps') {

		/*
				TAG DEPLOYMENT DATA
		*/

			var tagDepsLink = [];
			
			var timeline_timer;
			
			rawData.tagDeps.forEach(function(row){
				topush = {
					type: "Point", 
					sppLocale: Math.round((+row.lon)*100)/100 + "," + Math.round((+row.lat)*100)/100,
					coordinates: [+row.lon, +row.lat], 
					id: row.deployID, 
					tagID: row.tagID, 
					status: row.status, 
					dtStart: new Date(row.dtStart), 
					dtEnd: row.dtEnd == 'NA' ? new Date() : new Date(row.dtEnd), 
					projID: row.projID, 
					species: row.species,
					frequency: row.frequency,
					model: row.model,
					manufacturer: row.manufacturer
				}
				
				if (!isNaN(topush.coordinates[0]) && !isNaN(topush.coordinates[1]))	tagDepsLink.push(topush)
			});

			var tagDepsSummary = d3.rollup(tagDepsLink, function(v){
				
				var vals = {id: [], tagID: [], dtStart: [], dtEnd: [], projID: [], species: [], frequency: [], model: [], manufacturer: []};
				
				v.forEach(function(r){
					vals.id.push(r.id); 
					vals.tagID.push(r.tagID); 
					vals.dtStart.push(r.dtStart); 
					vals.dtEnd.push(r.dtEnd); 
					if (!vals.projID.includes(r.projID)) vals.projID.push(r.projID); 
					if (!vals.species.includes(r.species)) vals.species.push(r.species); 
					if (!vals.frequency.includes(r.frequency)) vals.frequency.push(r.frequency); 
					if (!vals.model.includes(r.model)) vals.model.push(r.model); 
					if (!vals.manufacturer.includes(r.manufacturer)) vals.manufacturer.push(r.manufacturer); 
				});
				
				return {
					type: "Point", 
					coordinates: v[0].coordinates, 
					id: vals.id.join(','), 
					nAnimals: +vals.tagID.length,
					tagID: vals.tagID.join(','), 
					dtStart: d3.min(vals.dtStart), 
					dtEnd: d3.max(vals.dtEnd), 
					lastData: (new Date().getTime() - d3.max(vals.dtEnd)) / (1000 * 60 * 60 * 24), 
					projID: vals.projID.join(','), 
				//	nSpp: +vals.species.length,
					species: vals.species[0],//.join(','),
					frequency: vals.frequency.join(','),
					model: vals.model.join(','),
					manufacturer: vals.manufacturer.join(',')
				};
				
			}, d => d.sppLocale);
			
			var tagDepsSpecies = d3.rollup(rawData.tagDeps, v => v.length, d => d.species);
			
		//	tagDepsSummary = tagDepsLink;
			
			motusMap.colorScales.species.points.projID = d3.scaleOrdinal(d3.schemePaired);
			
			all_nAnimals = Array.from(tagDepsSummary.values()).map( x => +x.nAnimals );
			motusMap.colorScales.species.points.nAnimals = d3.scaleSequentialLog(d3.interpolateSpectral).domain([Math.max.apply(Math, all_nAnimals), Math.min.apply(Math, all_nAnimals)]);
			
			all_lastData = Array.from(tagDepsSummary.values()).map( x => +x.lastData );
			motusMap.colorScales.species.points.lastData = d3.scaleSequential(d3.interpolateSpectral).domain([Math.max.apply(Math, all_lastData), Math.min.apply(Math, all_lastData)]);
			
			all_nSpp = Array.from(tagDepsSummary.values()).map( x => +x.nSpp );
			motusMap.colorScales.species.points.nSpp = d3.scaleSequentialLog(d3.interpolateSpectral).domain([Math.min.apply(Math, all_nSpp), Math.max.apply(Math, all_nSpp)]);
			
			motusMap.colorScale = motusMap.colorScales.species.points.projID;
			
			
		//	$("#explore_map_container .animal_count").text(rawData.tagDeps.length);
		//	$("#explore_map_container .species_count").text(Array.from(tagDepsSpecies.values()).length);
			
			var tagDeps_el = g.selectAll("tags")
				.data(Array.from(tagDepsSummary.values()))
				.enter().append("path")
				.attr('class', "explore-map-points explore-map-species leaflet-zoom-hide")
				.style("stroke", "#000")
				.attr('id', d => "tagDeps" + d.id.split(',')[0])
				.style('fill', (d) => motusMap.colorScale(d.projID))
				.style('pointer-events', 'auto')
				.on('mouseover', function(){
					$("#" + this.id).css('opacity', '1');
					$(".explore-map-points.explore-map-species:not(#" + this.id + ")").css('opacity', '0.1');
				})	
				.on('mouseout', function(){$(".explore-map-points.explore-map-species").css('opacity', '0.5');})
				.on('click', (e,d) => mapInfoPanel(d, 'show', 'tagDeps'));
			
//			console.log(Array.from(tagDepsSummary.values()))
		} else if (dataset == 'tracks') {
				
			// TRACKS
			
			var trackDataLink = [];
											
			rawData.tracks.forEach(function(row){
				if (row.deployID.length > 0) {
					source = [+row.lon1, +row.lat1];
					target = [+row.lon2, +row.lat2];
					topush = {
							type: "LineString", 
							coordinates: [source, target], 
							id: row.deployID, 
							dtStart: new Date(row.dtStart), 
							dtEnd: new Date(row.dtEnd),
							species: row.species, 
							projID: row.projID,
							frequency: "166.380",
							lastData: (new Date().getTime() - new Date(row.dtEnd).getTime()) / (1000 * 60 * 60 * 24),
							status: 'terminated'
						};
					trackDataLink.push(topush)
				}
			});
			
			motusMap.colorScale = motusMap.colorScales.species.tracks.species;

			all_lastData = trackDataLink.map( x => +x.lastData );
			
			motusMap.colorScales.species.tracks.lastData = d3.scaleSequential(d3.interpolateSpectral).domain([Math.max.apply(Math, all_lastData), Math.min.apply(Math, all_lastData)]);
			
			
			// Add the path
			const tracks_el = g.selectAll("tracks")
				.data(trackDataLink)
				.enter().append("path")
				//.attr("d", (d) => svg.path(d))
				.attr('class', (d) => "explore-map-tracks explore-map-species leaflet-zoom-hide track" + d.id)
				.style("fill", "none")
				.style('stroke', (d) => motusMap.colorScale(d.species))
				.on('mouseover', function(d){
					d3.selectAll(".track" + d.id).style('opacity', '1');
					d3.selectAll(".explore-map-tracks.explore-map-species:not(.track" + d.id + ")").style('opacity', '0.1');
				})
				.on('mouseout', function(d){d3.selectAll(".explore-map-tracks.explore-map-species").style('opacity', '0.5');})
				.on('click', d => mapInfoPanel(d, 'show', 'track'));
		
		}
		
		
		console.log("Loaded " + dataset+ " to the map.");
		
	//	loadContent();
	}
	// TIMELINE
	
	if (timeline != undefined && timeline.el != undefined) {
	
		var dateLimits = recvDepsLink.map(function(d){
			return {
				start: d.dtStart,
				end: d.dtEnd
			}
		});
		timeline.min = d3.min(dateLimits.map(d=>+d.start)) / 1000
		timeline.max = d3.max(dateLimits.map(d=>+d.end)) / 1000
		
		timeline.createLegend();
		
	}	
	
	// Reposition the SVG to cover the features.
	motusMap.map.on("zoomend", reset);
	reset();
	
	$(".toggleButton.explore_type:visible.selected").click();
	
	
	function reset() {
		var bounds = path.bounds(rawData.polygons),
			topLeft = bounds[0],
			bottomRight = bounds[1];
			
//		console.log(rawData);

		motusMap.svg.attr("width", bottomRight[0] - topLeft[0])
			.attr("height", bottomRight[1] - topLeft[1])
			.style("left", topLeft[0] + "px")
			.style("top", topLeft[1] + "px");

		g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
		
		if (typeof tagDeps_el !== 'undefined') { tagDeps_el.attr("d", path); }
		if (typeof station_el !== 'undefined') { station_el.attr("d", path); }
		if (typeof tracks_el !== 'undefined') { tracks_el.attr("d", path); }
		if (typeof regions_el !== 'undefined') { regions_el.attr("d", path); }
	}
	// Use Leaflet to implement a D3 geometric transformation.
	function projectPoint(x, y) {
		var point = motusMap.map.latLngToLayerPoint(new L.LatLng(y, x));
		this.stream.point(point.x, point.y);
	}
	
	motusMap.setVisibility(true);
	

	if (typeof callback === 'function') {callback();}
	
}

	