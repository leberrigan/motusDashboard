function exploreStations(station) {
	
	var selectedPolygons = motusData.polygons.features.filter(x => motusFilter.regions.includes(x.properties.adm0_a3));
	
	motusFilter.regions = motusFilter.regions.filter(d => Array.from(motusData.stationsByCountry.keys()).includes(d));
	
	motusFilter.stations = motusFilter.regions.map(x => (motusData.stationsByCountry.get(x).map(s => s.deployID))).flat();
	
	/*
	addExploreCard({data:'chart', type:'regionProfile'});
			
	
	$("#explore_card_regionProfile .explore-card-header").text(selectedPolygons.map(x => x.properties.name).join(', '));
	
	$("#explore_card_regionProfile").css({width:"calc(50% - 42px)", height: "400px"});
	
	var svg = d3.select("#explore_card_regionProfile svg");
	
	
	var g = svg.append("g");//.attr("class", "leaflet-zoom-hide");
	
	var dims = [+$("#explore_card_regionProfile").width(), +$("#explore_card_regionProfile").height()];
	
	var path = d3.geoPath().projection(d3.geoMercator().fitSize(dims, {features:selectedPolygons, type: "FeatureCollection"}));
	
	
	
	*/
	
	
	setProgress(25);
	
	var regionNames = d3.rollup(selectedPolygons, v => v[0].properties.name, k => k.properties.adm0_a3);		
	//console.log(motusData.tracksByStation);
	var regionCombos = [];
	var regionCodes = Array.from(regionNames.keys());
//	console.log(regionCodes);
	for (var i = 0; i < regionCodes.length - 1; i++) {
	  // This is where you'll capture that last value
	  for (var j = i + 1; j < regionCodes.length; j++) {
		regionCombos.push(regionCodes[i]+","+regionCodes[j]);
	  }
	}
	regionCombos = regionCombos.concat(regionCodes);
	var colourScale = d3.scaleOrdinal().domain(regionCombos.concat(['foreign'])).range(customColourScale.jnnnnn.slice(0, regionCombos.length + 1));
	
	console.log(colourScale.domain());
	
	motusFilter.animals = '';
//	motusFilter.animals = ['all'];
	/*
	motusData.tracks.forEach(function(d) {
		if (motusFilter.stations.includes(d.recv1) || motusFilter.stations.includes(d.recv2)) {
			motusFilter.animals +="," + d.animal
		}
	});
	*/
	motusData.tracksByAnimal = {};
	motusData.tracksByStation = {};
	motusData.stationHits = {};
	console.log("motusData.trackDataByRoute: "+ 0);
	var ts = [moment()];
	var timeRange = {};
	motusData.animalsByDayOfYear = {};
	
	var allLocalAnimals = [];
	
	for (i=0; i<regionCodes.length; i++) {
		if (motusData.animalsByCountry.get(regionCodes[i])) {
			 allLocalAnimals = allLocalAnimals.concat(Array.from(motusData.animalsByCountry.get(regionCodes[i]).keys()));
		}
	}
	
	motusData.trackDataByRoute = d3.rollup(motusData.tracks, function(v) {
					var dtStart = moment(v[0].dtStart);
					var dtEnd = moment(v[0].dtEnd);
					var origin = "foreign";
					if (dtLims.min > dtStart) {dtLims.min = dtStart;}
					if (dtLims.max < dtEnd) {dtLims.max = dtEnd;}
					
					if (motusFilter.stations.includes(v[0].recv1) || motusFilter.stations.includes(v[0].recv2)) {
						
						motusFilter.animals +="," + v[0].animal
						
						if (motusFilter.stations.includes(v[0].recv1)) {
						//	motusData.stationHits.push({recv: v[0].recv1, dt: dtStart, animal: v[0].animal, species: v[0].species});
							if (motusData.stationHits[v[0].recv1]) {
								motusData.stationHits[v[0].recv1].times.push({"starting_time": dtStart.valueOf(), "display": "circle"});
							} else {
								motusData.stationHits[v[0].recv1] = {
									label: v[0].recv1,
									times: [{"starting_time": dtStart.valueOf(), "display": "circle"}]
								};
							}
							if (!timeRange.min || timeRange.min > dtStart)
								timeRange.min = dtStart;
							if (!timeRange.max || timeRange.max < dtStart)
								timeRange.max = dtStart;
						
							motusData.animalsByDayOfYear[dtStart.dayOfYear()] = motusData.animalsByDayOfYear[dtStart.dayOfYear()] ? motusData.animalsByDayOfYear[dtStart.dayOfYear()] + "," + v[0].animal : v[0].animal;
						}
						
						if (motusFilter.stations.includes(v[0].recv2)) {
						//	motusData.stationHits.push({recv: v[0].recv2, dt: dtStart, animal: v[0].animal, species: v[0].species});
							if (motusData.stationHits[v[0].recv2]) {
								motusData.stationHits[v[0].recv2].times.push({"starting_time": dtEnd.valueOf(), "display": "circle"});
							} else {
								motusData.stationHits[v[0].recv2] = {
									label: v[0].recv2,
									times: [{"starting_time": dtEnd.valueOf(), "display": "circle"}]
								};
							}
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
						if (allLocalAnimals.some(x => v[0].animal.split(',').includes(x))) {
							origin = 'local'/*
							if (origin != 'foreign') {
								(origin + "," + regionCodes[i]).split(',').sort(d3.ascending)
								
							} else {
								origin = regionCodes[i];
							}*/
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
						origin: origin,
						frequency: v[0].frequency,
						coordinates: [ [v[0].lon1, v[0].lat1], [v[0].lon2, v[0].lat2]]
					}
				}, x => +x.route );
	setProgress(50);
//	console.log(motusData.stationHits);
	console.log("motusFilter.animals: " + moment().diff(ts[0]));ts.push(moment());
	/*Array.from(motusData.trackDataByRoute.values()).filter(d => (motusFilter.stations.includes(d.recv1) || motusFilter.stations.includes(d.recv2))).forEach(function(d){
		motusFilter.animals += ","+d.animals;
	});*/
	console.log("motusFilter.animals: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());
	motusFilter.animals = motusFilter.animals.substring(1).split(',').filter(onlyUnique);
	
	console.log("selectedTracks: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());
	
	var selectedTracks = Array.from(motusFilter.animals.map(x => motusData.tracksByAnimal[x]).values()).flat();//.filter(onlyUnique);
	
	console.log("motusMap.setVisibility(): " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());
	//console.log(motusFilter.animals);
	//console.log(motusData.tracksByAnimal);
	//console.log(selectedTracks);
	
	motusMap.setVisibility();
	
	//console.log(motusData.recvDepsLink.filter(d => motusFilter.stations.includes(d.id)));
//	console.log("Stations: " + motusFilter.stations.length + " - Animals: " +motusFilter.animals.length);
	
				//  g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
	
	console.log("motusMap.regionPaths: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());
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
	//	.data(Array.from(motusData.trackDataByRoute.values()).filter(d => (motusFilter.stations.includes(d.recv1) || motusFilter.stations.includes(d.recv2))))
		.enter().append("path")
		.attr('class', (d) => "explore-map-tracks explore-map-species leaflet-zoom-hide explore-map-tracks-" + d.origin)
		.attr("id", (d) => "track" + d.id)
		.style('stroke', (d) => (d.origin == 'local' ? colourScale.range()[1] :  colourScale.range()[0] ))
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
	console.log("regionNames.forEach: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());
	
	regionNames.forEach(function(v, k) {
		
		var stations = motusData.stationsByCountry.get(k);
		
		var routes = Array.from(stations.map(x => x.deployID).values()).map(x => motusData.tracksByStation[x]).flat().filter(x=>typeof x !== 'undefined');
		
		var species = Array.from(routes.map( (x) => motusData.trackDataByRoute.get(+x).species.split(',')).values() ).flat().filter(onlyUnique);
		
		var animals = Array.from(routes.map( (x) => motusData.trackDataByRoute.get(+x).animals.split(',')).values() ).flat().filter(onlyUnique);
		
		
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
		//console.log(status);
		addExploreCard({
			data: {},
			id: k,
			name: v,
			status: status,
			photo: ''
		});
			
	});
	console.log("End: " + moment().diff(ts[0]) + "@" + moment().diff(ts[ts.length-1]));ts.push(moment());
	
	$('#explore_map').parent().before($('#explore_card_profiles'));
	
	$('#explore_map').parent().append("<div class='explore-map-controls'>Map controls <input type='button' value='Hide tracks-local'><input type='button' value='Hide tracks-foreign'><input type='button' value='Hide stations'><input type='button' value='Hide regions'></div>")
	
	$(".explore-map-controls input[type=button]").click(function(){var toggleEls = this.value.toLowerCase().split(' ');motusMap.setVisibility(false, toggleEls);this.value = (toggleEls[0] == 'hide' ? 'Show' : 'Hide') + " " + toggleEls[1];});
	
//	console.log(colourScale.range());
//	console.log(countryByTrack);
	
	//motusMap.g.selectAll(".explore-map-tracks.explore-map-species").style('stroke', function(d){ console.log(d.origin);return colourScale(d.origin); });
	//motusMap.g.selectAll(".explore-map-tracks.explore-map-species").style('stroke', (d) => colourScale(d.origin));
	
	//motusMap.g.selectAll(".explore-map-tracks.explore-map-species").style('stroke', (d) => (d.origin == 'local' ? colourScale.range()[1] :  colourScale.range()[0] ));
	
	
	addExploreCard({data:'chart', type:'tagHits'});
	
	addExploreCard({data:"add"});
	
	/*
	var svg = d3.select("#explore_card_stationHits svg");
	
	
	var g = svg.append("g");//.attr("class", "leaflet-zoom-hide");
	
	
	var path = d3.path();
	
	g.selectAll('.explore-chart-stationHit')
		.data(motusData.stationHits)
		.enter().append("path")
		.attr("dx", (d) => d.dt)
		.attr("dy", (d) => d.recv)
		.style('stroke', '#000')
		.style('fill', "#FFF")
		.attr('class', 'explore-chart-stationHit')
		//.style('fill', d => motusFilter.stations.includes(d.id) ? "#F00" : "#000")
		.style('stroke-width', '1px')
		.style('pointer-events', 'auto')
	
		console.log(motusData.stationHits);

	*/
	
	for (s in motusData.stationHits) {
		
		var data = motusData.stations.filter(x=>x.id==motusData.stationHits[s].label);
		motusData.stationHits[s].label = data[0].name;
		motusData.stationHits[s].class = "explore-chart-stationHit-data";
		motusData.stationHits[s].times = [{
				"starting_time": data[0].dtStart.valueOf(),
				"ending_time": data[0].dtEnd.valueOf(),
				"color": "#DDD"
			}].concat(motusData.stationHits[s].times);
		
	}
	
	addExploreCard({data:'chart', type:'stationHits'});
	
	$("#explore_card_stationHits .explore-card-header").text("Station detection timeline");
//	$("#explore_card_stationHits svg").attr("width", "400px");
//	$("#explore_card_stationHits svg").attr("height", "400px");
	
	
	
	var numTicks = 8;
	var timelineAxisVals = [];
	
	timeRange = {min: timeRange.min.valueOf(), max: timeRange.max.valueOf()}
	timeRange.range = timeRange.max - timeRange.min;
	
	for (var i = 0; i < numTicks; i++) {
		timelineAxisVals.push(timeRange.min + ((timeRange.range/(numTicks-1))*i));
	}
	
	var timeLineConstruct = d3.timeline()
		.tickFormat({
			format: d3.timeFormat("%Y-%m-%d"),
			tickTime: d3.timeDays, 
			tickValues: timelineAxisVals,
			tickSize: 6})
		.allowZoom(false)
		.stack()
		.margin({left: 150, right: 30, top: 0, bottom: 0});
		
	var svgHeight = (19 * Object.keys(motusData.stationHits).length) + 50;
	$("#explore_card_stationHits svg").attr("height", `${svgHeight}px`);
	
	d3.select("#explore_card_stationHits svg")
		.datum(Object.values(motusData.stationHits)).call(timeLineConstruct);
	//	.datum(timeLineRange).call(timeLineConstruct);
				
	
				
	
	
	
	timelineAxisVals = [];
	motusData.tagHits = {};
	timeRange = {};
	motusFilter.animals.forEach(function(x){
		
		motusData.tracksByAnimal[x].forEach(function(d){
			
			var dtStart = motusData.trackDataByRoute.get(+d).dtStart;
			var dtEnd = motusData.trackDataByRoute.get(+d).dtEnd;
			
			if (motusData.tagHits[x]) {
				motusData.tagHits[x].times.push({"starting_time": moment().dayOfYear(dtStart.dayOfYear()).valueOf(), "display": "circle", color: (motusFilter.stations.includes(d.split('.')[0]) ? "#0F0" : "#A00")});
				motusData.tagHits[x].times.push({"starting_time": moment().dayOfYear(dtEnd.dayOfYear()).valueOf(), "display": "circle", color: (motusFilter.stations.includes(d.split('.')[1]) ? "#0F0" : "#A00")});
			} else {
				motusData.tagHits[x] = {
					label: x,
					times: [{"starting_time": moment().dayOfYear(dtStart.dayOfYear()).valueOf(), "display": "circle", color: (motusFilter.stations.includes(d.split('.')[0]) ? "#0F0" : "#A00")}]
				};
				motusData.tagHits[x].times.push({"starting_time": moment().dayOfYear(dtEnd.dayOfYear()).valueOf(), "display": "circle", color: (motusFilter.stations.includes(d.split('.')[1]) ? "#0F0" : "#A00")});
			}
			if (!timeRange.min || timeRange.min > dtStart.dayOfYear())
				timeRange.min = dtStart.dayOfYear();
			if (!timeRange.min || timeRange.min > dtEnd.dayOfYear())
				timeRange.min = dtEnd.dayOfYear();
			if (!timeRange.max || timeRange.max < dtStart.dayOfYear())
				timeRange.max = dtStart.dayOfYear();
			if (!timeRange.max || timeRange.max < dtEnd.dayOfYear())
				timeRange.max = dtEnd.dayOfYear();
				
		});
		
	});
	
	
	var animalsByDayOfYear = [];
	
	const group_by = 'month';
	const gSize = 12;	// size of date groups
	
	var day = 1;
	
		
	for (var i=1; i<=gSize; i++) {
		day = moment().month(i).dayOfYear();
		animalsByDayOfYear[ day ] = { "Julian date": day, local: 0, foreign: 0, total: [] };
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
			
			var localAnimals = [];
			
			d.total = d.total.filter(onlyUnique);
			
			for (var i = 0; i < regionCodes.length; i++ ) {
				localAnimals = localAnimals.concat(d.total.filter(x => allLocalAnimals.includes(x)));
			}
			
			localAnimals = localAnimals.filter(onlyUnique);
			
			d.foreign = d.total.filter(x=>!localAnimals.includes(x)).length;
			
			d.local = localAnimals.length;
			
			d.total = d.total.length;
			
		} else {d.total = 0;}
		
		return d;
	});
	
	animalsByDayOfYear = animalsByDayOfYear.flat();
	
	animalsByDayOfYear.columns = Object.keys(animalsByDayOfYear[0]).slice(0,-1);

	//console.log(animalsByDayOfYear);
	var radialChartConstruct = d3.radialBarChart();

	var radialChart = d3.select("#explore_card_tagHits svg")
		.datum(animalsByDayOfYear).call(radialChartConstruct);
	
	$("#explore_card_tagHits .explore-card-header").text("Animals detected by month");
	
	
	/*
	
	timeRange = {min: moment().dayOfYear(timeRange.min).valueOf(), max: moment().dayOfYear(timeRange.max).valueOf()}
	timeRange.range = timeRange.max - timeRange.min;
	
	console.log(motusData.tagHits);
	
	$("#explore_card_tagHits .explore-card-header").text("Tag detection timeline");
//	$("#explore_card_stationHits svg").attr("width", "400px");
//	$("#explore_card_stationHits svg").attr("height", "400px");
	
	for (var i = 0; i < numTicks; i++) {
		timelineAxisVals.push(timeRange.min + ((timeRange.range/(numTicks-1))*i));
	}
	
	var timeLineConstruct = d3.timeline()
		.tickFormat({
			format: d3.timeFormat("%b-%d"),
			tickTime: d3.timeDays, 
			tickValues: timelineAxisVals,
			tickSize: 6})
		.stack()
		.margin({left: 150, right: 30, top: 0, bottom: 0});
		
	var svgHeight = (15 * Object.keys(motusData.tagHits).length) + 50;
	$("#explore_card_tagHits svg").attr("height", `${svgHeight}px`);
	
	d3.select("#explore_card_tagHits svg")
		.datum(Object.values(motusData.tagHits)).call(timeLineConstruct);
	console.log(motusData.animalsByDayOfYear);
	*/
	setProgress(90);
	
	var toAppend = "<input type='button' value='Table of animals detected' />"+
					"<input type='button' value='Table of species detected' />"+
					"<input type='button' value='Table of stations' />"+
					"<input type='button' value='Table of projects' />";
	
	addExploreCard({data:'custom',type:'options',html:toAppend,attachEl:".explore-card-map",attachMethod:"after"});
	
	
	motusFilter.animals = ['all'];
	motusFilter.stations = ['all'];
	updateURL();
	motusMap.setVisibility();
	
	
	setProgress(100);
}