
$('#explore_main_wrapper').append('<div id="explore_main_map_legend" class="mapType_points mapType_regions mapType_tracks mapType_deployments"><div class="showHide tips" alt="Legend"></div></div>');

$('#explore_main_wrapper').append('<div id="explore_main_map" class="explore_main_map mapType_points mapType_regions mapType_tracks mapType_deployments"></div>');

$(document).ready(function(){
	
	loadMapData();
	
});


var mapType = null; // "point" or "region"
var showTracks = true; // 
var dataType = null; // 'stations' or 'species'

var projectColours = {};

var timeline = {
	el: "dateSlider .slider",
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
	animationEnd: function(close = false) {
		timeline.timerElapsed = 0;
		timeline.timer.stop();
		timeline.setSlider(timeline.position);
		if (close === true) {
			if (!$(".filterButton").hasClass('selected')) {$('#dateSlider.visible').removeClass('visible');}
			$(".animate_timeline").removeClass('selected');
		} else {
			$(".animate_timeline").addClass('finishedAnimation');
			$(".animate_timeline .pause").attr('alt', 'Restart animation').addClass('replay');
		}
		timeline.status = 'stop';
		map.setVisibility();
	},
	setSlider: function(position) {
		$("#" + timeline.el).dragslider( 'values', position);
		// Set the Motus data filters
		motusFilter.dtStart = new Date( position[0] * 1000 );
		motusFilter.dtEnd = new Date( position[1] * 1000 );
		
		//$('#explore_filters input.explore_dates').data('daterangepicker').setStartDate('2014/12/01');
		
		
		
		if (motusFilter.dtStart != $('#explore_filters input.explore_dates').data('daterangepicker').startDate._d) {
			$('#explore_filters input.explore_dates').data('daterangepicker').setStartDate(motusFilter.dtStart)
		}
		if (motusFilter.dtEnd != $('#explore_filters input.explore_dates').data('daterangepicker').endDate._d) {
			$('#explore_filters input.explore_dates').data('daterangepicker').setEndDate(motusFilter.dtEnd)
		}
		
		// Set the text in the slider handles
		/*
		$("#custom-handle-1 .ui-slider-handle-text").text( new Date( motusFilter.dtStart ).toISOString().substr(0,10) );
		$("#custom-handle-2 .ui-slider-handle-text").text( new Date( motusFilter.dtEnd ).toISOString().substr(0,10) );
		*/
		$('#filter_summary .explore_dates > span').text((new Date( motusFilter.dtStart ).toISOString().substr(0,10)) + " - " + (new Date( motusFilter.dtEnd ).toISOString().substr(0,10)))
	}

};

var map = {
	el: $("#explore_main_map").get(0),
	dims: {
		width: $("#explore_main_map").parent().innerWidth(),
		height: $("#explore_main_map").parent().innerHeight() - 30
	},
	center: [24.1, 10],
	visible: {
		Projs: [],
		Spp: [],
		Animals: [],
		Status: [],
		Freqs: []
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
						motusFilter.projects.includes('all') ||
						d.projID.split(',').some(r => motusFilter.projects.includes(r))
					) && (
						motusFilter.status.includes('all') ||
						d.status.split(',').some(r => motusFilter.status.includes(r))
					) && (
						motusFilter.frequencies.includes('all') ||
						d.frequency.split(',').every(r => motusFilter.frequencies.includes(r)) ||
						d.frequency === motusFilter.frequencies[0]
					) && (
						typeof d.species == "undefined" ||
						motusFilter.species.includes('all') || 
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
				$("#explore_main_wrapper .station_count").text($(".explore-map-points.explore-map-stations:not(.hidden)").length);
			} else {

				map.visible.Animals = [];
				map.visible.Spp = [];
				
			}
			
			map.svg.selectAll(".explore-map-" + mapType + ".explore-map-" + dataType + ":not(.hidden)").each(function(d){
				
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
				
				d.frequency.split(',').forEach(function(x){
					if (!map.visible.Freqs.includes(x)) {map.visible.Freqs.push(x)}
				});
				
				if (!$(this).hasClass('explore-map-species') || !$(this).hasClass('explore-map-points')) {
				
					d.status.split(',').forEach(function(x){
						if (!map.visible.Status.includes(x)) {map.visible.Status.push(x)}
					});

				}
			});
			
			
			if (dataType == 'species') {
				$("#explore_main_wrapper .species_count").text(map.visible.Spp.length);
				$("#explore_main_wrapper .animal_count").text(map.visible.Animals.length);
			}
			
			$("#explore_main_wrapper .project_count").text(map.visible.Projs.length);
			
			if (motusFilter.colour != 'nSpp' && motusFilter.colour != 'animals' && motusFilter.colour != 'lastData') {
				
				$('#' + ['legend', dataType, mapType, motusFilter.colour].join('_') + ' tr > td:last-child > div')
								.text("0")
								.parent().attr("data-order", 0);
				
				map.svg.selectAll(".explore-map-"+dataType+".explore-map-"+mapType+":not(.hidden)").filter(function(data) {
					
					var x = $('#' + ['legend', dataType, mapType, motusFilter.colour].join('_') + ' tr[data-colourID="' + data[motusFilter.colour] + '"] > td:last-child > div')
								.text();
					
					x = x.length == 0 ? data.id.split(',').length : parseInt(x) + data.id.split(',').length;
					
					var fontSize = (17 - (String(x).length * 2)) + "pt";
					
					$('#' + ['legend', dataType, mapType, motusFilter.colour].join('_') + ' tr[data-colourID="' + data[motusFilter.colour] + '"] > td:last-child > div')
						.text(x)
						.css("font-size", fontSize)
						.parent().attr("data-order", x);
				});
				$('#' + ['legend', dataType, mapType, motusFilter.colour].join('_')).DataTable().cells(null, 2).invalidate();
				
			}	
			
		}
		
		return false;
	},
	svg: 'undefined',
	legend: {
		el: d3.select("#explore_main_map_legend"),
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
				status: d3.scaleOrdinal(d3.schemeDark2),
				frequency: d3.scaleOrdinal(d3.schemeDark2),
				projID: d3.scaleSequential(d3.interpolateCubehelixDefault).domain([0,350])
			}
		},
		species: {
			points: {
				status: d3.scaleOrdinal(d3.schemeDark2),
				frequency: d3.scaleOrdinal(d3.schemeDark2),
				species: d3.scaleOrdinal(d3.schemeCategory10),
				projID: d3.scaleSequential(d3.interpolateCubehelixDefault).domain([0,350])
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
			
			if (t == 'track') {
				
				var filterName = motusFilter.colour;
				
				var title = d[filterName];
				
				
				$('.tooltip').html(
					"<big>"+ 
						(filterName != 'projID' ? rawData.species[d.species] : "Project " + d.projID)+ 
					"</big>"+
					(filterName != 'species' ? ("<br/>Species: " + rawData.species[d.species]) : "") +
					(filterName != 'projID' ? ("<br/>Project " + d.projID) : "") +
					"<br/>Animal ID: " + d.id +
					"<br/>Frequency: " + d.frequency + " MHz" +
					"</br>Start: " + new Date( d.dtStart ).toISOString().substr(0,10)+
					(d.status == 'active' ? ("</br><div class='green'>Active</div>") : ("</br>End: " + new Date( d.dtEnd ).toISOString().substr(0,10) + "</br><div class='red'>Terminated</div>"))
				);
				
			} else {
				
				var filterName = motusFilter.colour;
				filterName = (dataType == 'species' && mapType != 'tracks') ? 'nSpp' : filterName;
				
				var title = (dataType == 'species' && mapType != 'tracks') ? 
								(d.nSpp == 1 ? $("#explore_filters .explore_species option[value=" + d.species.split(',')[0] + "]").text() : "Species: " + d.nSpp) + "</br>Animals: " + d.id.length 
							: d.name;
				
				
				$('.tooltip').html(
					"<big>"+ 
						title+ 
					"</big></br>"+
					$(".colourType_selector option[value='" + motusFilter.colour + "']").text() + ": " + d[filterName]+
					"</br>Start: " + new Date( d.dtStart ).toISOString().substr(0,10)+
					(d.status == 'active' ? ("</br><div class='green'>Active</div>") : ("</br>End: " + new Date( d.dtEnd ).toISOString().substr(0,10) + "</br><div class='red'>Terminated</div>"))
				);
				
			}
			if (e.pageX + 15 + $('.tooltip').outerWidth() > $(window).width()) {
				$('.tooltip').css({top:e.pageY - 10, left:e.pageX - $('.tooltip').outerWidth() - 15});
			} else {
				$('.tooltip').css({top:e.pageY - 10, left:e.pageX + 15});
			}
			
			$('.tooltip:hidden').show();
			
			d3.selectAll(".explore-map-" + t + "s:not(." + t + "" + ( (filterName == 'species' || mapType == 'tracks') ? d.id : d.id[0] ) + ")").style('opacity', '0.1');
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
	
	rawData.polygons = response[0]; 
	rawData.stations = response[1]; 
	rawData.tracks = response[2]; 
	rawData.tagDeps = response[3];

	map.regionColours = response[4];
	
	rawData.projects = response[5];
	
	rawData.species = Object.assign(...response[6].map((d, i) => ({[d.id]: d.english})));
	
	rawData.status = ["active", "terminated", "prospective", "expired"];
	
	
	map.regionColours = d3.group(map.regionColours, d => d.code);
	
	map.map = new L.Map("explore_main_map", {center: map.center, zoom: map.zoom, zoomControl: true, fullscreenControl: true})
		.addLayer(new L.TileLayer(map.tileLayer));
	
	L.control.mapView({ position: 'topleft' }).addTo(map.map);
	map.map.zoomControl.setPosition('topleft');
	map.map.fullscreenControl.setPosition('topleft');
	
	map.svg = d3.select(map.map.getPanes().overlayPane).append("svg");
	
	var g = map.svg.append("g");//.attr("class", "leaflet-zoom-hide");
	var transform = d3.geoTransform({point: projectPoint});
	var path = d3.geoPath().projection(transform);
	
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
	
	/*
	
	Randomly generate tracks:
		- Random sample of tag deployments.
	
	var tagTracks = {tagID: [coord1, coord2, coord3, coord4, etc...]}
	
	while (Max out at certain # iterations) {
		
		- Tag lifespan within station lifespan
		- Select random date of detection during overlap
		- If first in tag detection, Distance from deployment location (increases with time since deployment)
		- If subsequent, similar to prev but based on last detected location.
		- Use lat/lng or get real vals in R
		
	}
	
	*/
	
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
		//	animals: Math.ceil(Math.random() * (1000)), //* ((new Date(row.dtStart).getTime())-(endDate.getTime())) / milliseconds_annually,
			animals: Math.ceil(Math.random() * ((endDate - startDate) / ((1000 * 60 * 60 * 24) * (10)))), // Chance of detecting a bird every 10 days. This is equal to: ceiling( [random value 0 to 1] * [number of milliseconds] / ( [milliseconds per day] * [10 days]) )
			projID: row.projID, 
			serno: row.serno,
			nAnt: row.nAnt,
			nSpp: Math.ceil(Math.random() * (10)),
			frequency: row.frequency.split(',').sort(d3.ascending).join(',')
		}
		if (!isNaN(topush.coordinates[0]) && !isNaN(topush.coordinates[1]) && topush.frequency != 'NA')	recvDepsLink.push(topush)
	});
	var recvDepsSummary = d3.rollup(recvDepsLink, function(v){
		
		var vals = {id: [], status, dtStart: "", dtEnd: "", projID: [], lastData: "", frequency: [], serno: [], animals: 0, nAnt: 0, nSpp: 0};
		
		
		v.forEach(function(r){
			vals.id.push(r.id); 
			vals.status = vals.status == "active" ? "active" : r.status; 
			vals.dtStart = r.dtStart < vals.dtStart ? r.dtStart : vals.dtStart; 
			vals.dtEnd = r.dtEnd > vals.dtEnd ? r.dtEnd : vals.dtEnd;
			vals.lastData = r.lastData > vals.lastData ? r.lastData : vals.lastData;
			if (!vals.projID.includes(r.projID)) vals.projID.push(r.projID); 
			if (!vals.serno.includes(r.serno)) vals.serno.push(r.serno); 
			if (!vals.frequency.includes(r.frequency)) vals.frequency.push(r.frequency); 
			vals.animals += r.animals;
			vals.nAnt += r.nAnt;
			vals.nSpp += r.nSpp;
		});
		
		return {
			type: "Point", 
			coordinates: v[0].coordinates, 
			id: vals.id.join(','), 
			status: vals.status, 
			dtStart: vals.dtStart, 
			dtEnd: vals.dtEnd, 
			lastData: vals.lastData, 
			animals: +vals.animals, 
			projID: vals.projID.sort(d3.ascending).join(','), 
			nAnt: +vals.nAnt,
			nSpp: +vals.nSpp,
			serno: vals.serno.sort(d3.ascending).join(','),
			frequency: vals.frequency.sort(d3.ascending).join(',')
		};
		
	}, d => d.name);
	
	// See: https://stackoverflow.com/questions/1669190/find-the-min-max-element-of-an-array-in-javascript?page=1&tab=votes#tab-top
	
	//recvDepsLink = Array.from(recvDepsSummary.values());
	
	var all_animals = recvDepsLink.map( x => +x.animals );
	map.colorScales.stations.points.animals = d3.scaleSequential(d3.interpolateSpectral).domain([Math.max.apply(Math, all_animals), Math.min.apply(Math, all_animals)]);
	
	var all_lastData = recvDepsLink.map( x => +x.lastData );
	map.colorScales.stations.points.lastData = d3.scaleSequential(d3.interpolateSpectral).domain([Math.max.apply(Math, all_lastData), Math.min.apply(Math, all_lastData)]);
	
	var all_nSpp = recvDepsLink.map( x => +x.nSpp );
	map.colorScales.stations.points.nSpp = d3.scaleSequentialLog(d3.interpolateSpectral).domain([Math.min.apply(Math, all_nSpp), Math.max.apply(Math, all_nSpp)]);
	//console.log([Math.min.apply(Math, all_animals), Math.max.apply(Math, all_animals)]);

	rawData.frequency = recvDepsLink.map( x => x.frequency ).filter(onlyUnique);//.filter(function(x){return x.split(',').length == 1;});
	
	
	
	// Select only enough colours to fill each category
	
	var nProjs = rawData.projects.length - 1; // Subtract the first 'select all' option to get true total.
	var projectIDs = rawData.projects.map(r => r.id);
	
	var selectedColours = customColourScale.jnnnnn.slice(0, nProjs);
	projectColours = Object.assign(...projectIDs.map((k, i) => ({[k]: selectedColours[i]})));
	
	
	map.colorScales.stations.points.projID = d3.scaleOrdinal().domain(projectIDs).range(customColourScale.jnnnnn.slice(0, nProjs));
	
	map.colorScales.species.points.projID = d3.scaleOrdinal().domain(projectIDs).range(customColourScale.jnnnnn.slice(0, nProjs));
	
	map.colorScales.species.tracks.projID = d3.scaleOrdinal().domain(projectIDs).range(customColourScale.jnnnnn.slice(0, nProjs));
	
	
	var all_species = Object.keys(rawData.species);

	selectedColours = customColourScale.jnnnnn.slice(0, all_species.length);

	projectColours = Object.assign(...all_species.map((k, i) => ({[k]: selectedColours[i]})));
	
	map.colorScales.species.points.species = d3.scaleOrdinal().domain(all_species).range(customColourScale.jnnnnn.slice(0, all_species.length));
	
	map.colorScales.species.tracks.species = d3.scaleOrdinal().domain(all_species).range(customColourScale.jnnnnn.slice(0, all_species.length));
	
	
	
	
		
	map.colorScale = map.colorScales.stations.points.animals;
	
	$("#explore_main_wrapper .station_count").text(recvDepsLink.length);
	
	var station_el = g.selectAll("stations")
		.data(recvDepsLink.sort(function(x, y){return d3.ascending(x.status,y.status);}))
		.enter().append("path")
		.attr('class', (d) => "explore-map-points explore-map-stations station" + d.id + " leaflet-zoom-hide")
		.style("stroke", "#000")
		.style('fill', (d) => map.colorScale(+d.animals))
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
			locale: Math.round((+row.lon)*50)/50 + "," + Math.round((+row.lat)*50)/50,
			coordinates: [+row.lon, +row.lat], 
			id: row.deployID, 
			tagID: row.tagID, 
			status: row.status == 'active' ? (row.dtEnd == 'NA' ? 'active' : 'expired') : row.status, 
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
			vals.status = vals.status == "active" ? "active" : r.status;
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
			animals: +vals.tagID.length,
			tagID: vals.tagID.join(','), 
			status: vals.status, 
			dtStart: d3.min(vals.dtStart), 
			dtEnd: d3.max(vals.dtEnd), 
			lastData: (new Date().getTime() - d3.max(vals.dtEnd)) / (1000 * 60 * 60 * 24), 
			projID: vals.projID.sort(d3.ascending).join(','), 
			nSpp: +vals.species.length,
			species: vals.species.sort(d3.ascending).join(','),
			frequency: vals.frequency.sort(d3.ascending).join(','),
			model: vals.model.sort(d3.ascending).join(','),
			manufacturer: vals.manufacturer.sort(d3.ascending).join(',')
		};
		
	}, d => d.locale);
	
	var tagDepsSpecies = d3.rollup(rawData.tagDeps, v => v.length, d => d.species);
	
	
	map.colorScales.species.points.projID = d3.scaleOrdinal(d3.schemePaired);
	
	all_animals = Array.from(tagDepsSummary.values()).map( x => +x.animals );
	map.colorScales.species.points.animals = d3.scaleSequentialLog(d3.interpolateSpectral).domain([Math.max.apply(Math, all_animals), Math.min.apply(Math, all_animals)]);
	
	all_lastData = Array.from(tagDepsSummary.values()).map( x => +x.lastData );
	map.colorScales.species.points.lastData = d3.scaleSequential(d3.interpolateSpectral).domain([Math.max.apply(Math, all_lastData), Math.min.apply(Math, all_lastData)]);
	
	all_nSpp = Array.from(tagDepsSummary.values()).map( x => +x.nSpp );
	map.colorScales.species.points.nSpp = d3.scaleSequentialLog(d3.interpolateSpectral).domain([Math.min.apply(Math, all_nSpp), Math.max.apply(Math, all_nSpp)]);
	
	//console.log(all_nSpp);
	
	map.colorScale = map.colorScales.species.points.projID;
	
	rawData.frequency.concat(rawData.tagDeps.map( x => x.frequency ).filter(onlyUnique));
	
	rawData.frequency =	rawData.frequency.filter(onlyUnique);
	rawData.animals = Object.assign(...tagDepsLink.map( x => ({[x.id]: x.species}) ));
	
	
	$("#explore_main_wrapper .animal_count").text(rawData.tagDeps.length);
	$("#explore_main_wrapper .species_count").text(Array.from(tagDepsSpecies.values()).length);
	
	
	var tagDeps_el = g.selectAll("tags")
		.data(Array.from(tagDepsSummary.values()))
		.enter().append("path")
		.attr('class', "explore-map-points explore-map-species leaflet-zoom-hide")
		.style("stroke", "#000")
		.attr('id', d => "tagDeps" + d.id.split(',')[0])
		.style('fill', (d) => map.colorScale(d.projID))
		.style('pointer-events', 'auto')
		/*.on('mouseover', function(){
			$("#" + this.id).css('opacity', '1');
			$(".explore-map-points.explore-map-species:not(#" + this.id + ")").css('opacity', '0.1');
		})	
		.on('mouseout', function(){$(".explore-map-points.explore-map-species").css('opacity', '0.5');})
		.on('click', (e,d) => mapInfoPanel(d, 'show', 'tagDeps'));
		*/
		.on('mouseover', (e,d) => map.dataHover(e, d, 'in', 'tagDeps'))
		.on('mouseout', (e,d) => map.dataHover(e, d, 'out', 'tagDeps'))
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
					recv1: row.recvDeployID1,
					recv2: row.recvDeployID2,
					dist: row.dist,
					dtStart: new Date(row.dtStart), 
					dtEnd: new Date(row.dtEnd),
					species: row.species, 
					projID: row.projID,
					frequency: row.freq,
					lastData: (new Date().getTime() - new Date(row.dtEnd).getTime()) / (1000 * 60 * 60 * 24),
					status: 'terminated'
				};
			trackDataLink.push(topush)
		}
	});
	
	map.colorScale = map.colorScales.species.tracks.species;

	all_lastData = trackDataLink.map( x => +x.lastData );
	
	map.colorScales.species.tracks.id = d3.scaleOrdinal().domain(trackDataLink.map( x => +x.id ).filter(onlyUnique)).range(customColourScale.jnnnnn.slice(0, nProjs));
	
	map.colorScales.species.tracks.lastData = d3.scaleSequential(d3.interpolateSpectral).domain([Math.max.apply(Math, all_lastData), Math.min.apply(Math, all_lastData)]);
	
	// Add the path
	const tracks_el = g.selectAll("tracks")
		.data(trackDataLink)
		.enter().append("path")
		//.attr("d", (d) => svg.path(d))
		.attr('class', (d) => "explore-map-tracks explore-map-species leaflet-zoom-hide track" + d.id)
		.style("fill", "none")
		.style('stroke', (d) => map.colorScale(d.species))
	/*	.on('mouseover', function(d){
			d3.selectAll(".track" + d.id).style('opacity', '1');
			d3.selectAll(".explore-map-tracks.explore-map-species:not(.track" + d.id + ")").style('opacity', '0.1');
		})
		.on('mouseout', function(d){d3.selectAll(".explore-map-tracks.explore-map-species").style('opacity', '0.5');})
		.on('click', d => mapInfoPanel(d, 'show', 'track'))
		*/
		.on('mouseover', (e,d) => map.dataHover(e, d, 'in', 'track'))
		.on('mouseout', (e,d) => map.dataHover(e, d, 'out', 'track'))
		.on('click', (e,d) => mapInfoPanel(d, 'show', 'track'));
	
	
	// TIMELINE
	
	rawData.tagDeps = d3.group(rawData.tagDeps, d => d.deployID);
	rawData.stations = d3.group(rawData.stations, d => d.deployID);
	rawData.tracks = d3.group(rawData.tracks, d => d.deployID);
	
	
	
	$("#dateSlider").append("<svg id='activityTimeline' width='" + $("#explore_main_wrapper").innerWidth() + "'></svg>");
	
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
//	Promise.all([d3.csv("data/projs.csv"), d3.csv("data/spp.csv")]).then(populateSelectOptions);
	
	populateSelectOptions();
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



function loadMapData() { // Only runs after select menus have populated
	
	var filePrefix = window.location.hostname == 'localhost' ? 'data/' : window.location.hostname == 'www.motus.org' ? "https://" + window.location.hostname + "/wp-content/uploads/2021/01/" : "https://" + window.location.hostname + "/wp-content/uploads/";
	
	var mapFiles = ["https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson"]
		.concat(
			["recv-deps.csv",
			"siteTrans" + (window.location.hostname.indexOf('beta') != -1 ? '-2' : '') + ".csv",
			"tag-deps.csv",
			"world_population.csv",
			"projs.csv", 
			"spp.csv"].map(x => filePrefix + x)
		);

	console.log(mapFiles);
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
	