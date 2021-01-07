
$('#explore_map_container').append('<div id="explore_map" class="explore_map mapType_points mapType_regions mapType_tracks mapType_deployments"></div>');
$('#explore_map_container').append('<div id="explore_map_legend" class="mapType_points mapType_regions mapType_tracks mapType_deployments"></div>');

var mapType = null; // "point" or "region"
var showTracks = true; // 
var dataType = null; // 'stations' or 'species'

var projectColours = {};

var timeline = {
	el: "station_activityTimeline .slider",
	timer: undefined,
	timer_length: 3000,
	min: new Date('2014-02-05').getTime() / 1000,
	max: new Date('2021-04-20').getTime() / 1000,
	range: 0,
	step: 86400,
	startVal: new Date('2014-02-05').getTime(),
	distance: 0,
	svg: {},
	position: [0,0],
	status: 'off',
	timerStartTime: 0,
	timerElapsed: 0,
	animate: function(e) {
		// So we can pause and restart the animation
		e += timeline.timerElapsed;
		// Sometimes it jumps past the max value
		e = (e > timeline.timer_length ? timeline.timer_length : e);
		// Val to select on the dragslider input (right slider)
		var selectedVal = timeline.min + ((timeline.range - timeline.distance) / (timeline.timer_length/e));
		// Set slider position
		timeline.setSlider([selectedVal, selectedVal + timeline.distance]);
		
		// Set visiblity of data in maps
		map.setVisibility();
		
		// If timeline is paused, record elapsed time in case it is resumed.
		if (timeline.status == 'pause') {
			timeline.timerElapsed = e;
			timeline.timer.stop();
		}
		
		// If timeline ends or is stopped, go through the process of resetting the handles
		if (e == timeline.timer_length) {
			timeline.animationEnd();
		}
	},
	animationEnd: function() {
		timeline.timerElapsed = 0;
		timeline.timer.stop();
		timeline.setSlider(timeline.position);
		
		if (!$(".filterButton").hasClass('selected')) {$('#explore_filters > #station_activityTimeline').hide();}
	//	$('#explore_filters').css({marginBottom:"-" + $('#explore_filters').innerHeight() + "px"});
		$(".animate_timeline").removeClass('selected');
		timeline.status = 'stop';
		map.setVisibility();
	},
	setSlider: function(position) {
		$("#" + timeline.el).dragslider( 'values', position);
		// Set the Motus data filters
		motusFilter.dtStart = new Date( position[0] * 1000 );
		motusFilter.dtEnd = new Date( position[1] * 1000 );
		// Set the text in the slider handles
		/*
		$("#custom-handle-1 .ui-slider-handle-text").text( new Date( motusFilter.dtStart ).toISOString().substr(0,10) );
		$("#custom-handle-2 .ui-slider-handle-text").text( new Date( motusFilter.dtEnd ).toISOString().substr(0,10) );
		*/
		$('#filter_summary .explore_dates > span').text((new Date( motusFilter.dtStart ).toISOString().substr(0,10)) + " - " + (new Date( motusFilter.dtEnd ).toISOString().substr(0,10)))
	}

};

var map = {
	el: $("#explore_map").get(0),
	dims: {
		width: $("#explore_map").parent().innerWidth(),
		height: $("#explore_map").parent().innerHeight() - 30
	},
	center: [24.1, 10],
	visible: {
		Projs: [],
		Spp: [],
		Animals: []
	},
	zoom: 2,
	tileLayer: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
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
		//console.log("switchType: " + switchType + " - mapType: " + mapType + " - dataType: " + dataType + " - " + (map.svg !== 'undefined'));
		if (switchType === true && map.svg !== 'undefined') {
			
		//	console.log(".explore-map-" + ( mapType == 'points' ? 'regions' : 'points' ));
		
			map.svg.selectAll(".explore-map-" + ( mapType == 'regions' ? 'points' : 'regions' ))
				.attr('visibility', 'hidden')
				.classed('hidden', true);
				
			map.svg.selectAll(".explore-map-" + ( mapType != 'tracks' ? 'tracks' : 'points' ))
				.attr('visibility', 'hidden')
				.classed('hidden', true);
				
		//	console.log(".explore-map-" + ( dataType == 'stations' ? 'species' : 'stations' ));
			map.svg.selectAll(".explore-map-" + ( dataType == 'stations' ? 'species' : 'stations' ))
				.attr('visibility', 'hidden')
				.classed('hidden', true);
			
			/*map.svg.selectAll(".explore-map-" + mapType + ".explore-map-" + dataType)
				.attr('visibility', d => map.isVisible(d, true, true))
				.classed('hidden', d => map.isVisible(d, true, false))
			*/
				
		} 
		
		if (map.svg !== 'undefined') {
			
			map.svg.selectAll(".explore-map-" + mapType + ".explore-map-" + dataType)
				.attr('visibility', d => map.isVisible(d, true, true))
				.classed('hidden', d => map.isVisible(d, true, false))
			
			map.visible.Projs = [];
			
			if (dataType == 'stations') {
				$("#explore_map_container .station_count").text($(".explore-map-points.explore-map-stations:not(.hidden)").length);
			} else {

				map.visible.Animals = [];
				map.visible.Spp = [];
				
			}
			
			map.svg.selectAll(".explore-map-points.explore-map-" + dataType + ":not(.hidden)").each(function(d){
				
				var projs = d.projID.split(',');
				
				projs.forEach(function(proj){
					
					if (map.visible.Projs.indexOf(proj) === -1) {map.visible.Projs.push(proj)}
				
				});
				
				if ($(this).hasClass('explore-map-species')) {
					
					var spp = d.species.split(',');
					
					spp.forEach(function(sp){
						if (map.visible.Spp.indexOf(sp) === -1) {map.visible.Spp.push(sp)}
					});
					
					map.visible.Animals = map.visible.Animals.concat(d.id.split(','));
					
				}
				
			});
			
			
			if (dataType == 'species') {
				$("#explore_map_container .species_count").text(map.visible.Spp.length);
				$("#explore_map_container .animal_count").text(map.visible.Animals.length);
			}
			
			$("#explore_map_container .project_count").text(map.visible.Projs.length);
		}
	},
	svg: 'undefined',
	legend: {
		el: d3.select("#explore_map_legend"),
		svg: 'undefined'
	},
	//fillData: d3.map(),
	colorScale: d3.scaleThreshold()
		.domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
		.range(d3.schemeReds[7]),
	colorScales: {
		stations: {
			points: {
				status: d3.scaleOrdinal(d3.schemeDark2),
				frequency: d3.scaleOrdinal(d3.schemeDark2),
				projID: d3.scaleSequential(d3.interpolateCubehelixDefault).domain([0,350])
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
				projID: d3.scaleSequential(d3.interpolateCubehelixDefault).domain([0,350])
			},
			tracks: {
				status: d3.scaleOrdinal(d3.schemeDark2),
				frequency: d3.scaleOrdinal(d3.schemeDark2),
				species: d3.scaleOrdinal(d3.schemeCategory10),
				projID: d3.scaleSequential(d3.interpolateCubehelixDefault).domain([0,350])
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
	highlightVal: ''
};

/*
d3.queue()
	.await(function*/
	

// Add new controls to map
L.Control.mapViewConstruct = L.Control.extend({
	onAdd: function(map){
		
		var buttonContainer = L.DomUtil.create('div');
        var button1 = L.DomUtil.create('div', 'toggleButton selected mapBy dataType_stations', buttonContainer);
        var button2 = L.DomUtil.create('div', 'toggleButton mapBy dataType_species', buttonContainer);
        var button3 = L.DomUtil.create('div', 'toggleButton mapBy dataType_stations', buttonContainer);
        var button4 = L.DomUtil.create('div', 'toggleButton mapBy dataType_species', buttonContainer);
        var button5 = L.DomUtil.create('div', 'toggleButton mapBy', buttonContainer);
        
		button1.innerHTML = 'Points';
		button2.innerHTML = 'Deployments';
		button3.innerHTML = 'Regions';
		button4.innerHTML = 'Tracks';
		button5.innerHTML = 'Table';
		
		return buttonContainer;
	},
	onRemove: function(map){
		
	}
});

L.control.mapView = function(opts){
	return new L.Control.mapViewConstruct(opts);
}
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

var rawData = {}
	
function loadMapObjects(response) {
	rawData = { 
			polygons: response[0], 
			stations: response[1], 
			tracks: response[2], 
			tagDeps: response[3]
		}

	
	map.regionColours = response[4];
	
	map.regionColours = d3.group(map.regionColours, d => d.code);
	
	map.map = new L.Map("explore_map", {center: map.center, zoom: map.zoom, zoomControl: true, fullscreenControl: true})
		.addLayer(new L.TileLayer(map.tileLayer));
	
	L.control.mapView({ position: 'topleft' }).addTo(map.map);
	map.map.zoomControl.setPosition('topleft');
	map.map.fullscreenControl.setPosition('topleft');
	
	map.svg = d3.select(map.map.getPanes().overlayPane).append("svg");
	
	var g = map.svg.append("g");//.attr("class", "leaflet-zoom-hide");
	var transform = d3.geoTransform({point: projectPoint});
	var path = d3.geoPath().projection(transform);
	
	console.log(path.bounds());
	map.legend.svg = map.legend.el.append('svg');
	
	var regions_el = g.selectAll("regions")
		.data(rawData.polygons.features)
		.enter().append("path")
		.attr('class', 'explore-map-regions explore-map-stations leaflet-zoom-hide')
		.style('fill', function (d) {
			
			d.total = map.regionColours.get(d.properties.adm0_a3_is) ? +map.regionColours.get(d.properties.adm0_a3_is)[0].pop : 0;
			
			return map.colorScale(d.total);
		});
	
	var recvDepsLink = [];
	
	var milliseconds_annually = 3.154 * (10^10);
	
	
	
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
	
	
	
		//console.log(recvDepsLink.map(v => v.nAnimals));
	//	console.log(recvDepsLink.map(v => v.nAnimals));
	var circle = d3.geoCircle();
	
//	map.colorScale = d3.scaleOrdinal(["#AA0000","#00AA00"]).domain("terminated","active");

	
	// See: https://stackoverflow.com/questions/1669190/find-the-min-max-element-of-an-array-in-javascript?page=1&tab=votes#tab-top
	
	var all_nAnimals = recvDepsLink.map( x => +x.nAnimals );
	map.colorScales.stations.points.nAnimals = d3.scaleSequential(d3.interpolateSpectral).domain([Math.max.apply(Math, all_nAnimals), Math.min.apply(Math, all_nAnimals)]);
	
	var all_lastData = recvDepsLink.map( x => +x.lastData );
	map.colorScales.stations.points.lastData = d3.scaleSequential(d3.interpolateSpectral).domain([Math.max.apply(Math, all_lastData), Math.min.apply(Math, all_lastData)]);
	
	var all_nSpp = recvDepsLink.map( x => +x.nSpp );
	map.colorScales.stations.points.nSpp = d3.scaleSequentialLog(d3.interpolateSpectral).domain([Math.min.apply(Math, all_nSpp), Math.max.apply(Math, all_nSpp)]);
	//console.log([Math.min.apply(Math, all_nAnimals), Math.max.apply(Math, all_nAnimals)]);

	var all_frequencies = recvDepsLink.map( x => x.frequency ).filter(onlyUnique);//.filter(function(x){return x.split(',').length == 1;});
	
	
	all_frequencies.forEach(function(x){
		
		$("#explore_filters .explore_frequencies").append("<option value='" + x + "'>" + x + " (MHz)</option>");
		
	});

	//console.log(all_frequencies);
	
//	map.colorScales.stations.points.frequency = d3.scaleOrdinal(d3.schemeDark2).domain(all_frequencies);

	var nProjs = $("#explore_filters .explore_projects option").length - 1; // Subtract the first 'select all' option to get true total.

	var selectedColours = customColourScale.jnnnnn.slice(0, nProjs);
	projectColours = Object.assign(...$("#explore_filters .explore_projects option:not(:first-child)").map(function(){return this.value;}).get().map((k, i) => ({[k]: selectedColours[i]})))
	
	
//	console.log(projectColours);
//	console.log(customColourScale.jnnnnn.slice(0, nProjs));
//	console.log($("#explore_filters .explore_projects option:not(:first-child)").map(function(){return this.value;}).get());
	
	// Select only enough colours to fill each category
	map.colorScales.stations.points.projID = d3.scaleOrdinal().domain($("#explore_filters .explore_projects option:not(:first-child)").map(function(){return this.value;}).get()).range(customColourScale.jnnnnn.slice(0, nProjs));
	map.colorScales.species.points.projID = d3.scaleOrdinal().domain($("#explore_filters .explore_projects option:not(:first-child)").map(function(){return this.value;}).get()).range(customColourScale.jnnnnn.slice(0, nProjs));
	map.colorScales.species.tracks.projID = d3.scaleOrdinal().domain($("#explore_filters .explore_projects option:not(:first-child)").map(function(){return this.value;}).get()).range(customColourScale.jnnnnn.slice(0, nProjs));
		
	map.colorScale = map.colorScales.stations.points.nAnimals;
	
	$("#explore_map_container .station_count").text(recvDepsLink.length);
	
	var station_el = g.selectAll("stations")
		.data(recvDepsLink.sort(function(x, y){return d3.descending(x.status, y.status);}))
		.enter().append("path")
		.attr('class', (d) => "explore-map-points explore-map-stations station" + d.id + " leaflet-zoom-hide")
		.style("stroke", "#000")
		.style('fill', (d) => map.colorScale(+d.nAnimals))
		.style('pointer-events', 'auto')
		.on('mouseover', (e,d) => map.dataHover(e, d, 'in', 'station'))
		.on('mouseout', (e,d) => map.dataHover(e, d, 'out', 'station'))
		.on('click', (e,d) => mapInfoPanel(d, 'show', 'station'));
	

	/*
			TAG DEPLOYMENT DATA
	*/

	var tagDepsLink = [];
	
	var timeline_timer;
	
	rawData.tagDeps.forEach(function(row){
		topush = {
			type: "Point", 
			locale: Math.round((+row.lon)*100)/100 + "," + Math.round((+row.lat)*100)/100,
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
			nSpp: +vals.species.length,
			species: vals.species.join(','),
			frequency: vals.frequency.join(','),
			model: vals.model.join(','),
			manufacturer: vals.manufacturer.join(',')
		};
		
	}, d => d.locale);
	
	var tagDepsSpecies = d3.rollup(rawData.tagDeps, v => v.length, d => d.species);
	
	
	map.colorScales.species.points.projID = d3.scaleOrdinal(d3.schemePaired);
	
	all_nAnimals = Array.from(tagDepsSummary.values()).map( x => +x.nAnimals );
	map.colorScales.species.points.nAnimals = d3.scaleSequentialLog(d3.interpolateSpectral).domain([Math.max.apply(Math, all_nAnimals), Math.min.apply(Math, all_nAnimals)]);
	
	all_lastData = Array.from(tagDepsSummary.values()).map( x => +x.lastData );
	map.colorScales.species.points.lastData = d3.scaleSequential(d3.interpolateSpectral).domain([Math.max.apply(Math, all_lastData), Math.min.apply(Math, all_lastData)]);
	
	all_nSpp = Array.from(tagDepsSummary.values()).map( x => +x.nSpp );
	map.colorScales.species.points.nSpp = d3.scaleSequentialLog(d3.interpolateSpectral).domain([Math.min.apply(Math, all_nSpp), Math.max.apply(Math, all_nSpp)]);
	
	//console.log(all_nSpp);
	
	map.colorScale = map.colorScales.species.points.projID;
	
	
	
	$("#explore_map_container .animal_count").text(rawData.tagDeps.length);
	$("#explore_map_container .species_count").text(Array.from(tagDepsSpecies.values()).length);
	
	var tagDeps_el = g.selectAll("tags")
		.data(Array.from(tagDepsSummary.values()))
		.enter().append("path")
		.attr('class', "explore-map-points explore-map-species leaflet-zoom-hide")
		.style("stroke", "#000")
		.attr('id', d => "tagDeps" + d.id.split(',')[0])
		.style('fill', (d) => map.colorScale(d.projID))
		.style('pointer-events', 'auto')
		.on('mouseover', function(){
			$("#" + this.id).css('opacity', '1');
			$(".explore-map-points.explore-map-species:not(#" + this.id + ")").css('opacity', '0.1');
		})	
		.on('mouseout', function(){$(".explore-map-points.explore-map-species").css('opacity', '0.5');})
		.on('click', (e,d) => mapInfoPanel(d, 'show', 'tagDeps'));
		
		
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
	
	map.colorScale = map.colorScales.species.tracks.species;

	all_lastData = trackDataLink.map( x => +x.lastData );
	
	map.colorScales.species.tracks.lastData = d3.scaleSequential(d3.interpolateSpectral).domain([Math.max.apply(Math, all_lastData), Math.min.apply(Math, all_lastData)]);
	
	// Add the path
	const tracks_el = g.selectAll("tracks")
		.data(trackDataLink)
		.enter().append("path")
		//.attr("d", (d) => svg.path(d))
		.attr('class', (d) => "explore-map-tracks explore-map-species leaflet-zoom-hide track" + d.id)
		.style("fill", "none")
		.style('stroke', (d) => map.colorScale(d.species))
		.on('mouseover', function(d){
			d3.selectAll(".track" + d.id).style('opacity', '1');
			d3.selectAll(".explore-map-tracks.explore-map-species:not(.track" + d.id + ")").style('opacity', '0.1');
		})
		.on('mouseout', function(d){d3.selectAll(".explore-map-tracks.explore-map-species").style('opacity', '0.5');})
		.on('click', d => mapInfoPanel(d, 'show', 'track'));
	
	
	// TIMELINE
	
	
	
	$("#station_activityTimeline").append("<svg id='activityTimeline' width='" + $("#explore_map_container").innerWidth() + "'></svg>");
	
	var dateLimits = recvDepsLink.map(function(d){
		return {
			start: d.dtStart,
			end: d.dtEnd
		}
	});
	timeline.min = d3.min(dateLimits.map(d=>+d.start)) / 1000
	timeline.max = d3.max(dateLimits.map(d=>+d.end)) / 1000
	var timeLineRange = [
			{
				label: "", 
				times: [
					{
						"starting_time": timeline.min * 1000, 
						"ending_time": timeline.max * 1000
					}
				]
			}
		]
		
	var timeLineConstruct = d3.timeline()
		.tickFormat({
			format: d3.timeFormat("%Y-%m-%d"), 
			tickTime: d3.timeDays, 
			numTicks: 10, 
			tickSize: 6})
		.margin({left: 0, right: 0, top: 0, bottom: 0});
	
	timeline.svg = d3.select("#activityTimeline")
		.datum(timeLineRange).call(timeLineConstruct);
		
	/*
	var timelineDates = [{type: 'point', date: d3.min(dateLimits.map(d=>+d.start))}, {type: 'point', date: d3.max(dateLimits.map(d=>+d.end))}];
	var timeScale = d3.scaleTime().domain(timelineDates)
	console.log(timelineDates);
	console.log(timeScale);
	var timelineSVG = d3.select("#activityTimeline")
		.attr('width', 800)
	var timelineG = timelineSVG.append('g')
	
	var timeline_el = timelineG.selectAll('timeTicks')
		.data(timelineDates)
		.enter().append('path')
		.attr('class', "timeline_tick")
		.style('stroke', '#F00')
		*/
	
		
	// Reposition the SVG to cover the features.
	map.map.on("zoomend", reset);
	reset();
	
	$(".toggleButton.explore_type:visible.selected").click();
	
	
	function reset() {
		var bounds = path.bounds(rawData.polygons),
			topLeft = bounds[0],
			bottomRight = bounds[1];

		map.svg.attr("width", bottomRight[0] - topLeft[0])
			.attr("height", bottomRight[1] - topLeft[1])
			.style("left", topLeft[0] + "px")
			.style("top", topLeft[1] + "px");

		g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

		tagDeps_el.attr("d", path);
		tracks_el.attr("d", path);
		regions_el.attr("d", path);
		station_el.attr('d', path);
	}
	// Use Leaflet to implement a D3 geometric transformation.
	function projectPoint(x, y) {
		var point = map.map.latLngToLayerPoint(new L.LatLng(y, x));
		this.stream.point(point.x, point.y);
	}
	
	loadContent();
}

function addClusterMarkers(data) {
	
}
/*
	.defer(d3.json, )
	.defer(d3.csv, "data/recv-deps.csv") // Stations
	.defer(d3.csv, "data/siteTrans.csv") // Tracks
	.defer(d3.csv, "data/tag-deps.csv") // Tag deployments
	.defer(d3.csv, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function(d) { d3.map(set(d.code, +d.pop)); })
*/


Promise.all([d3.csv("data/projs.csv"), d3.csv("data/spp.csv")]).then(populateSelectOptions);

function loadMapData() { // Only runs after select menus have populated
	
	var mapFiles = [
		"https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson",
		"data/recv-deps.csv",
		"data/siteTrans.csv",
		"data/tag-deps.csv",
		"https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv"
	];

	var promises = [];

	mapFiles.forEach(function(url) {
		url.substr(url.lastIndexOf('.') + 1, url.length) == 'csv' ? promises.push(d3.csv(url)) : promises.push(d3.json(url));
	});
		
	Promise.all(promises).then(loadMapObjects);
	
}


/*
d3.queue()
	.defer(d3.csv, "data/projs.csv")
	.defer(d3.csv, "data/spp.csv")
	.await(populateSelectOptions);
	*/
	