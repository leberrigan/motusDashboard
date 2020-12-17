
$('.explore_map_container').append('<div id="explore_map" class="explore_map explore-choropleth visible"></div>')

var mapType = 'points'; // "point" or "region"
var showTracks = true; // 
var dataType = 'stations'; // 'stations' or 'species'
var timeline_timer;
var timeline_timer_length = 3000;

var map = {
	el: $("#explore_map").get(0),
	dims: {
		width: $("#explore_map").parent().innerWidth(),
		height: $("#explore_map").parent().innerHeight() - 30
	},
	center: [24.1, 10],
	zoom: 2,
	tileLayer: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
	map:  {},
	pointPath: d3.geoPath().pointRadius(1),// A path generator 
	isVisible: function(d, vis, ch) {
		
		const visibility = vis && (
				(	typeof d.geometry !== 'undefined' ) ||
				(
					!(motusFilter.dtEnd <= d.dtStart || motusFilter.dtStart >= d.dtEnd) &&
					(motusFilter.project == d.projID || 
						d.projID.split(',').includes(motusFilter.project) ||
						motusFilter.project == 'all') &&
					(typeof d.species == "undefined" || 
						d.species.split(',').includes(motusFilter.species) ||
						motusFilter.species == 'all')
				)
			);
			
		return (ch ? (visibility ? 'visible' : 'hidden') : !visibility);
				
	},
	setVisibility: function(switchType) {
	//	console.log("switchType: " + switchType + " - mapType: " + mapType + " - dataType: " + dataType);
		if (switchType === true && map.svg !== 'undefined') {
			
			console.log(".explore-map-" + ( mapType == 'points' ? 'regions' : 'points' ));
			map.svg.selectAll(".explore-map-" + ( mapType == 'points' ? 'regions' : 'points' ))
				.attr('visibility', 'hidden')
				.classed('hidden', true);
				
			console.log(".explore-map-" + ( dataType == 'stations' ? 'species' : 'stations' ));
			map.svg.selectAll(".explore-map-" + ( dataType == 'stations' ? 'species' : 'stations' ))
				.attr('visibility', 'hidden')
				.classed('hidden', true);
			
			map.svg.selectAll(".explore-map-" + mapType + ".explore-map-" + dataType)
				.attr('visibility', d => map.isVisible(d, true, true))
				.classed('hidden', d => map.isVisible(d, true, false))
			
				
		} else if (map.svg !== 'undefined') {
			
			map.svg.selectAll(".explore-map-" + mapType + ".explore-map-" + dataType)
				.attr('visibility', d => map.isVisible(d, true, true))
				.classed('hidden', d => map.isVisible(d, true, false))
			
			var numProjs = {};
			
			map.svg.selectAll(".explore-map-points.explore-map-" + dataType + ":not(.hidden)").each(function(d){
				
				var projs = d.projID.split(',');
				
				projs.forEach(function(proj){
				
					if (typeof numProjs[proj] === 'undefined') {numProjs[proj] = proj}
				
				});
				
			});
				
			$("#explore_filter_metrics .projects").first().text(Object.keys(numProjs).length);
			$("#explore_filter_metrics .stations").first().text($(".explore-map-points.explore-map-stations:not(.hidden)").length);
				
		}  
	},
	svg: 'undefined',
	//fillData: d3.map(),
	colorScale: d3.scaleThreshold()
		.domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
		.range(d3.schemeReds[7]),
	regionColours: {}
};
/*
d3.queue()
	.await(function*/
function loadMapObjects(response) {

	var polygons = response[0], 
		stations = response[1], 
		tracks = response[2], 
		tagDeps = response[3];
	
	map.regionColours = response[4];
	
	map.regionColours = d3.group(map.regionColours, d => d.code);
	
	map.map = new L.Map("explore_map", {center: map.center, zoom: map.zoom})
		.addLayer(new L.TileLayer(map.tileLayer));
		
	map.svg = d3.select(map.map.getPanes().overlayPane).append("svg");
	
	var g = map.svg.append("g");//.attr("class", "leaflet-zoom-hide");
	var transform = d3.geoTransform({point: projectPoint});
	var path = d3.geoPath().projection(transform);
	
	
	
	var regions_el = g.selectAll("regions")
		.data(polygons.features)
		.enter().append("path")
		.attr('class', 'explore-map-regions explore-map-stations leaflet-zoom-hide')
		.style('fill', function (d) {
			
			d.total = map.regionColours.get(d.properties.adm0_a3_is) ? +map.regionColours.get(d.properties.adm0_a3_is)[0].pop : 0;
			
			return map.colorScale(d.total);
		});
	
	stations.forEach(function(row){
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
	
	var circle = d3.geoCircle();
	
	map.colorScale = d3.scaleOrdinal(["#AA0000","#00AA00"]).domain("terminated","active");
	
	$("#explore_filter_metrics .stations").last().text(recvDepsLink.length);
	
	var station_el = g.selectAll("stations")
		.data(recvDepsLink.sort(function(x, y){return d3.descending(x.status, y.status);}))
		.enter().append("path")
		.attr('class', (d) => "explore-map-points explore-map-stations station" + d.id + " leaflet-zoom-hide")
		.style("stroke", "#FFF")
		.style('fill', (d) => map.colorScale(d.status))
		.style('pointer-events', 'auto')
		.on('mouseover', function(e,d){
			console.log('over');
			d3.selectAll(".explore-map-stations:not(.station" + d.id + ")").style('opacity', '0.1');
		})
		.on('mouseout', function(e,d){d3.selectAll(".explore-map-stations").style('opacity', '1');})
		.on('click', (e,d) => mapInfoPanel(d, 'show', 'station'));
	
	

	/*
			TAG DEPLOYMENT DATA
	*/

	var tagDepsLink = [];

	map.colorScale = d3.scaleOrdinal(d3.schemePaired);
	
	var timeline_timer;
	
	tagDeps.forEach(function(row){
		topush = {
			type: "Point", 
			locale: Math.round((+row.lon)*1000)/1000 + "," + Math.round((+row.lat)*1000)/1000,
			coordinates: [+row.lon, +row.lat], 
			id: row.deployID, 
			tagID: row.tagID, 
			status: row.status, 
			dtStart: new Date(row.dtStart), 
			dtEnd: new Date(row.dtEnd == 'NA' ? '2021-02-20' : row.dtEnd), 
			projID: row.projID, 
			species: row.species
		}
		
		if (!isNaN(topush.coordinates[0]) && !isNaN(topush.coordinates[1]))	tagDepsLink.push(topush)
	});

	var tagDepsSummary = d3.rollup(tagDepsLink, function(v){
		
		var vals = {id: [], tagID: [], dtStart: [], dtEnd: [], projID: [], species: []};
		
		v.forEach(function(r){
			vals.id.push(r.id); 
			vals.tagID.push(r.tagID); 
			vals.dtStart.push(r.dtStart); 
			vals.dtEnd.push(r.dtEnd); 
			vals.projID.push(r.projID); 
			vals.species.push(r.species);
		});
		
		return {
			type: "Point", 
			coordinates: v[0].coordinates, 
			id: vals.id.join(','), 
			tagID: vals.tagID.join(','), 
			dtStart: d3.min(vals.dtStart), 
			dtEnd: d3.max(vals.dtEnd), 
			projID: vals.projID.join(','), 
			species: vals.species.join(',')
		};
		
	}, d => d.locale);
	
	var tagDepsSpecies = d3.rollup(tagDeps, v => v.length, d => d.species);
	
	$("#explore_filter_metrics .animals span:last-child").text(tagDeps.length);
	$("#explore_filter_metrics .species span:last-child").text(Array.from(tagDepsSpecies.values()).length);
	
	console.log("Original: " + tagDeps.length + " - Clustered: " + Array.from(tagDepsSummary.values()).length);

	var tagDeps_el = g.selectAll("tags")
		.data(Array.from(tagDepsSummary.values()))
		.enter().append("path")
		.attr('class', (d) => "explore-map-points explore-map-species leaflet-zoom-hide")
		.style("stroke", "#FFF")
		.attr('id', d => "tagDeps" + d.id.split(',')[0])
		.style('fill', (d) => map.colorScale(d.species))
		.style('pointer-events', 'auto')
		.on('mouseover', function(){
			$("#" + this.id).css('opacity', '1');
			$(".explore-map-points.explore-map-species:not(#" + this.id + ")").css('opacity', '0.1');
		})	
		.on('mouseout', function(){$(".explore-map-points.explore-map-species").css('opacity', '0.5');})
		.on('click', (e,d) => mapInfoPanel(d, 'show', 'tagDeps'));
		
	// Reposition the SVG to cover the features.
	map.map.on("zoomend", reset);
	reset();
	
	$(".toggleButton.explore_type:visible.selected").click();
	
	
	function reset() {
		var bounds = path.bounds(polygons),
			topLeft = bounds[0],
			bottomRight = bounds[1];

		map.svg.attr("width", bottomRight[0] - topLeft[0])
			.attr("height", bottomRight[1] - topLeft[1])
			.style("left", topLeft[0] + "px")
			.style("top", topLeft[1] + "px");

		g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

		tagDeps_el.attr("d", path);
		regions_el.attr("d", path);
		station_el.attr('d', path);
	}
	// Use Leaflet to implement a D3 geometric transformation.
	function projectPoint(x, y) {
		var point = map.map.latLngToLayerPoint(new L.LatLng(y, x));
		this.stream.point(point.x, point.y);
	}
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


Promise.all([d3.csv("data/projs.csv"), d3.csv("data/spp.csv")]).then(populateSelectOptions);
/*
d3.queue()
	.defer(d3.csv, "data/projs.csv")
	.defer(d3.csv, "data/spp.csv")
	.await(populateSelectOptions);
	*/
	
var recvDepsLink = [];
