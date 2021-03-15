/*


Current order:

// When document loads

	$(document).ready(function(){});
	 |
	 ---readData()
		 |
		 ---populateSelectOptions() --> setFilter()
		 |
		 ---loadDataTable()
			 |	
			 ---loadExploreCards()
		
// When select input is changed

	setFilter()

*/

//
//	Global variables
//
var icons = {
	lastData: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-clock-history" viewBox="0 0 16 16"><path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z"/><path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/><path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/></svg>',
/*	species: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-clock-history" viewBox="-50 0 900 400"><path d="m 593.63776,191.06651 -159.1803,45.46998 3.019,6.13 46.529,68.677 -2.439,5.834 -81.503,31.964 -82.23705,-31.992 -2.434,-5.803 46.52405,-68.701 2.95,-5.975 L 208.32143,191.0665 -44.302404,223.18575 61.054237,124.39961 208.32143,79.074162 l 140.55903,6.86332 15.3948,-13.13068 11.5769,-34.43522 18.8475,-13.58332 3.30134,-24.82593528 2.17411,-2.36971272 2.07904,2.47033816 3.38371,24.70155984 18.5618,13.77773 10.0921,32.89878 17.2207,14.50546 142.1253,-6.87232 150.64264,45.325448 106.87955,99.12663 z"/></svg>',*/
	species: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-clock-history" viewBox="70 160 70 50"><path d="m 107.67084,195.05271 2.93997,-5.47902 5.47902,2.20496 10.95805,-1.87087 10.02261,-7.55037 2.73951,-7.61718 -2.87315,-7.34991 -16.50389,4.54358 -8.61944,0.40091 -1.33635,-0.60136 -2.40542,-7.48355 -1.73725,-1.36975 -1.06908,-2.27179 -1.03031,2.17155 -1.73725,1.36975 -2.40542,7.48355 -1.33635,0.60136 -8.61944,-0.40091 -16.50389,-4.54358 -2.87315,7.34991 2.73951,7.61718 10.02261,7.55037 10.95805,1.87088 5.47902,-2.20497 2.93997,5.47903 -0.40089,7.08264 -0.63476,4.57699 1.97111,2.37202 1.43117,-2.07132 1.46998,2.17157 1.97111,-2.37202 -0.63476,-4.57699 z" style="stroke-width:3px;"></path></svg>',
	tags: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-clock-history" viewBox="125 -10 250 500"><path d="m 307.38806,152.71231 v 163.57 c 0,8.284 -6.716,15 -15,15 -41.28149,-0.71533 -47.28327,1.62781 -80,0 -8.284,0 -15,-6.716 -15,-15 v -164.459 c -16.587,-15.09 -27,-36.85 -27,-61.041001 0,-45.563 36.937,-82.5 82.5,-82.5 45.563,0 82.5,36.937 82.5,82.5 0,24.672001 -10.834,46.811001 -28,61.930001 z" /><path d="M 251.05287,334.93644 V 488.58051"/></svg>'
}

var motusData = {};

var filters = {
	options: {
		projects: {},
		stations: {},
		species: {},
		animals: {},
		frequencies: ["166.380","434", "151.5", "150.1"],
		regions: ["North America", "Latin America", "Europe", "Asia", "Australia", "Africa"],
		models: ["NTQB2-1", "NTQB2-1-2", "NTQB2-2", "NTQB2-3-2", "NTQB2-4-2"],
		status: ['Active','Inactive']
	},
	selected: {
		species: [4690]
	},
	data: {}
}

var default_startDate = new Date('2014-02-05'),
	default_endDate = new Date('2021-04-20');

var motusFilter = {
	dtStart: default_startDate,
	dtEnd: default_endDate,
	species: ["all"],
	regions: ["all"],
	projects: ["all"],
	stations: ["all"],
	status: ["all"],
	frequencies: ["all"],
	colour: ''
};
var URLdataType = null,
	URLmapType = null;
	
var isMobile = false;

var exploreType,
	mapType,
	dataType; // 'stations' or 'species'


function updateURL() {
	
	var stateToPush = '#'+
		'exploreType=' + encodeURIComponent(exploreType) + 
		'&dataType=' + encodeURIComponent(dataType) + 
		'&mapType=' + encodeURIComponent(mapType)
		
	for (f in motusFilter) {
		
			
		if (motusFilter[f][0] != 'all' && 
			(f != 'dtStart' || +motusFilter[f] != +default_startDate) && 
			(f != 'dtEnd' || +motusFilter[f] != +default_endDate)
			) {
				
			stateToPush+='&'+f+'='+encodeURIComponent((!['dtStart','dtEnd','colour'].includes(f)) ? motusFilter[f].filter(onlyUnique) : motusFilter[f]);
		}
		
	}
	
	
	/*
	var stateToPush = '?'+
		'dataType=' + encodeURIComponent(dataType) + 
		'&mapType=' + encodeURIComponent(mapType) + 
		'&dtStart=' + encodeURIComponent(new Date( motusFilter.dtStart ).toISOString().substr(0,10)) + 
		'&dtEnd=' + encodeURIComponent(new Date( motusFilter.dtEnd ).toISOString().substr(0,10)) + 
		'&species=' + encodeURIComponent(motusFilter.species.filter(onlyUnique)) + 
		'&regions=' + encodeURIComponent(motusFilter.regions.filter(onlyUnique)) + 
		'&projects=' + encodeURIComponent(motusFilter.projects.filter(onlyUnique)) + 
		'&stations=' + encodeURIComponent(motusFilter.stations.filter(onlyUnique)) + 
		'&status=' + encodeURIComponent(motusFilter.status.filter(onlyUnique)) + 
		'&frequencies=' + encodeURIComponent(motusFilter.frequencies.filter(onlyUnique)) + 
		'&colour=' + encodeURIComponent(motusFilter.colour);*/
	
	window.history.pushState(motusFilter, "Explore Data", stateToPush);
}



$(document).ready(function(){
	
	isMobile = window.mobileCheck();
	
	var url_params = getSearchParameters();
	
	motusFilter = {
		dtStart: url_params.dtStart === undefined ? new Date(motusFilter.dtStart) : new Date(url_params.dtStart),
		dtEnd: url_params.dtEnd === undefined ? new Date(motusFilter.dtEnd) : new Date(url_params.dtEnd),
		species: url_params.species === undefined || url_params.species.length == 0 ? filters.selected.species : url_params.species.split(','),
		regions: url_params.regions === undefined ? ["all"] : url_params.regions.split(','),
		projects: url_params.projects === undefined ? ["all"] : url_params.projects.split(','),
		stations: url_params.stations === undefined ? ["all"] : url_params.stations.split(','),
		status: url_params.status === undefined ? ["all"] : url_params.status.split(','),
		frequencies: url_params.frequencies === undefined ? ["all"] : url_params.frequencies.split(','),
		colour: url_params.frequencies === undefined ? [] : url_params.colour
	};
	
	//  exploreType defaults to "main" if not present in expected set of values
	exploreType = url_params.exploreType === undefined ? "main" : ["species","stations","animals","regions"].includes(url_params.exploreType) ? url_params.exploreType : "main";
	//  dataType defaults to null if not present in expected set of values
	dataType = url_params.dataType !== undefined ? ["species","stations"].includes(url_params.dataType) ? url_params.dataType : null : null;
	//  mapType defaults to null if not present in expected set of values
	mapType = url_params.mapType !== undefined ? ["points","table","tracks","regions"].includes(url_params.mapType) ? url_params.mapType : null : null;
	
	dataType = (exploreType == 'main' ? dataType : (['species','animals'].includes(exploreType) ? 'species' : 'stations'));
	mapType = mapType != null ? mapType : (exploreType == 'main' ? mapType : (['species','animals'].includes(exploreType) ? 'tracks' : 'points'));
	
	document.title = "Motus - Explore " + (exploreType == 'main' ? "Data" : firstToUpper(exploreType));
	
	//exploreType = 'stations'; // TESTING
	
	if (exploreType == 'main' && window.location.hostname != 'localhost') {window.location.href="dashboard/#exploreType=main&dataType="+dataType+"&mapType="+mapType;}
	
	// Set the HTML content of the page based on exploreType
	var HTML_dom = exploreType == 'main' ? "<div class='title-wrapper'>"+
												"<div class='title-header'> Explore data</div>"+
											"</div>" +
											"<div class='explore-main-wrapper'>"+
												"<div id='explore_main'>"+
													"<div id='filter_summary'></div>"+
													"<div id='dateSlider'></div>"+
													"<div class='explore-main-header'></div>"+
													"<div id='explore_main_map_legend'></div>"+
													"<div id='explore_main_map'></div>"+
												"</div>" +
											"</div>" : 
											"<div class='title-wrapper'>"+
												"<div class='title-header'>Explore "+exploreType+"</div>"+
												"<div class='explore-home-link' onclick='navigate(\"main\")'>Back to main</div>"+
											"</div>"+
											"<div class='explore-card-wrapper'>"+
												"<div class='explore-card explore-card-map' id='explore_profiles_map'></div>"+
											"</div>";

	$("#exploreContent").append(HTML_dom);
	
	// This is probably unecessary
	for (f in filters.selected) {
		filters.selected[f] = motusFilter[f];
	}
	
	loadMotusData('all', afterMapLoads);
});

function loadMotusData(fileList, callback) {
	
	var filePrefix = window.location.hostname == 'localhost' ? 'data/' : window.location.hostname == 'www.motus.org' ? "https://" + window.location.hostname + "/wp-content/uploads/2021/01/" : "https://" + window.location.hostname + "/wp-content/uploads/";
	
	var mapFiles = {
		polygons: "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson",
		stations: filePrefix + "recv-deps.csv",
		tagDeps: filePrefix + "tag-deps.csv",
		tracks: filePrefix + "siteTrans" + (window.location.hostname.indexOf('beta') != -1 ? '-2' : '') + ".csv",
		regions: filePrefix + "world_population.csv",
		species: filePrefix + "spp.csv",
		projects: filePrefix + "projs.csv"
	};
	
	if (typeof fileList === 'string') {fileList = fileList == 'all' ? Object.keys(mapFiles) : [fileList];}
	
	if (!fileList.includes("polygons")) {fileList.push("polygons");}
	
	var promises = [];
	
	fileList.forEach(function(f){
		
		if (typeof mapFiles[f] !== 'undefined') {
			var url = mapFiles[f];
			url.substr(url.lastIndexOf('.') + 1, url.length) == 'csv' ? promises.push(d3.csv(url)) : promises.push(d3.json(url));
		}
		
	});
		
	Promise.all(promises).then(function(response){
		
		fileList.forEach(function(f, i){
			
			motusData[f] = response[i];
			
		});
		
		if (typeof motusData.stations !== 'undefined') {
			motusData.stations = motusData.stations.filter(d => (!isNaN(d.lat) && !isNaN(d.lon) && d.frequency != 'NA'));
			motusData.stationsByName = d3.group(motusData.stations, d => d.name);
		}
		
		console.log("Loaded " + Object.keys(motusData).length + " data set" + (Object.keys(motusData).length == 1 ? "" : "s"));
		
		readData(callback);
		
	});
}


function readData(callback) {
	
	populateSelectOptions();
	
	initiateTooltip();
	
	initiateLightbox();
	
//	dataType = 'species';
//	mapType = 'tracks';
	
	exploreMap({
		containerID: exploreType == 'main' ? 'explore_main_map' : 'explore_profiles_map', 
		mapButtons: {
			'Deployments':'toggleButton mapBy dataType_species dataType_stations selected',
			//'Points':'toggleButton mapBy dataType_stations',
			'Regions':'toggleButton mapBy dataType_stations dataType_species',
			'Tracks':'toggleButton mapBy dataType_species'
		}
	});
	
	
	//loadMapObjects({"tagDeps": subset});
	
	//loadMapData(['regions', 'stations', 'tagDeps', 'tracks'] , afterMapLoads);
	

	setTimeout(function(){loadMapObjects(callback);},1000)

}
function afterMapLoads() {
	
	if (exploreType == 'main') {
		
		
		
	} else {
	
		addExploreCard({data:'chart', type:'barChart'});
		addExploreCard({data:'chart', type:'detectionTimeline'});
		
		loadDataTable(['animals','species'].includes(exploreType) ? 'tagDeps' : exploreType);
		
		addExploreCard({data:'add'});
		
		updateURL();
		
		updateData();
	
	}
}

function populateSelectOptions() {
	/*
	var filterNames = ['projects','stations', 'species', 'animals', 'regions', 'frequencies', 'models', 'status'];
	
	var filters_toInclude = exploreType == 'main' ? filterNames : (
							exploreType == 'stations' ? filterNames : (
							exploreType == 'species' ? filterNames : (
							exploreType == 'animals' ? filterNames : filterNames)));
	*/
	
	motusData.projects.forEach(function(d){
		
		filters.options.projects[d.id] = d.name;
		
	});
	
	for (const [name, d] of motusData.stationsByName.entries()){
		
		filters.options.stations[d[0].deployID] = [name, d[d.length-1].status != 'active' ? 'inactive' : 'active'];
		
	};;
	motusData.species.forEach(function(d){
		
		filters.options.species[d.id] = d.english;
		
	});
	
	filters.options.models = motusData.tagDeps.map(d => d.model).filter(onlyUnique).filter(d => d.length > 0);
	filters.options.frequencies = {};
	motusData.tagDeps.map(d => d.frequency).filter(onlyUnique).filter(d => d.length > 0 && d!="NA").forEach(d => filters.options.frequencies[d] = d + " MHz");
	
	
	var toAppend = "<div class='flex-container filter-options-wrapper'>"+
						"<div class='flex-container'>"+
						(["projects","stations","species","regions","frequencies","dates"].map(function(x){
								
							const classes = ['stations','species'].includes(x) ? ' class="dataType_' + x +'"': "";
								
							return "<div"+classes+">"+(x == 'dates' ? "<input " : "<select ")+" id='filter_"+x+"' class='filter_"+x+"'"+(x == 'dates' ? '>' : "' multiple='multiple' "+(x == 'status' ? " style='width:150px' " : x == 'frequencies' ? " style='width:170px' " : "")+"data-placeholder='All "+x+"'><option value='all'></option></select>") + "</div>";
							
						}).join(""))+
						"</div>"+
						"<div class='filterButton clear_filters tips' alt='Clear filters'>"+
							'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>'+
						"</div>"+
					"</div>";
	
	$(exploreType == 'main' ? "#explore_filters" : "#exploreContent").append(toAppend);
	
	/*
	$("#exploreContent").append("<div class='filter-options-wrapper'>"+
									"<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' class='bi bi-funnel tips' viewBox='0 0 16 16' alt='Filter data'>"+
										"<path fill-rule='evenodd' d='M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2h-11z'/>"+
									"</svg>"+
								"</div>");
	*/
	for(d in filters.options) {
		
		if (d == 'stations') {
			for (stationID in filters.options.stations) {
				
				$("#filter_stations").append('<option value="' + stationID + '" class="filter-option-' + filters.options.stations[stationID][1] + '">' + filters.options.stations[stationID][0] + '</option>');
				
			};
		} else {
			for (v in filters.options[d]) {
				
				$("#filter_" + d).append('<option value="' + v + '">' + filters.options[d][v] + '</option>');
				
			};
		}
	}
	
	$((exploreType == 'main' ? "#explore_filters" : "#exploreContent") + " select").select2({
		matcher: function(params, data) {
			// If there are no search terms, return all of the data
			if ($.trim(params.term) === '') {
				return data;
			}

			// Do not display the item if there is no 'text' property
			if (typeof data.text === 'undefined') {
				return null;
			}

			// `params.term` should be the term that is used for searching
			// `data.text` is the text that is displayed for the data object
			if (data.text.toUpperCase().indexOf(params.term.toUpperCase()) > -1) {
				return data;
			}
			
			
			if (data.id.indexOf(params.term) > -1) {
				return data;
			}

			// Return `null` if the term should not be displayed
			return null;
		},
		templateResult: function (data, container) {
			if (data.element) {
				$(container).addClass($(data.element).attr("class"));
			}
			return data.text;
		},
		placeholder: function(){return $(this).data('placeholder');},
	}).change(setFilter);
	
}


function loadDataTable(tbl) {
	
	/*
	
		This function loads a data table into a single element. It will reload data in this element each time it is run.
		tbl = name of the table you want to display
		filterVar = name of the variable you want to filter by
	
	*/
	
	
	if ($("#exploreTable").length == 0) {
		$("#exploreContent").append('<div class="exploreTable-wrapper"><table id="exploreTable" style="width:100%"></table></div>');
	}

	
	var columnNames = Object.keys(motusData[tbl][0]);
	
	var columns = [];
	
	/*
	var subset = motusData[tbl].filter(function(d){
		
		return filters.selected[dataType].includes(d[filterVar]);
		
	})
	
	if (tbl == 'tagdeps' && filterVar == 'species') {
		subset.forEach(function(d){
						
			d[filterVar] = filters.options[filterVar][d[filterVar]];
			
		});
	}*/
	for (var i in columnNames) {
		columns.push({
			data: columnNames[i], 
			title: dataColNames[columnNames[i]]
		});
	}
	
	if ($.fn.DataTable.isDataTable("#exploreTable")) {
		$("#exploreTable").DataTable().clear().destroy();
	}
	
	$("#exploreTable").html("");

	$("#exploreTable").DataTable({
		data: motusData[tbl],
		columns: columns
	});
	
	motusFilter[exploreType].forEach(function(f) {addProfile(f, tbl)});
	
}

function addProfile(profile_id, dataset) {
	
	
		dataset = typeof dataset === 'undefined' ? (exploreType == 'species' ? 'tagDeps' : exploreType) : dataset;
		
		var filterName = exploreType != 'species' ? exploreType != 'species' ? 'deployID' : 'id' : exploreType;
	
		
		if (dataset == 'stations') {
			
			if (typeof filters.options.stations[profile_id] === 'undefined') {
				profile_id = motusData.stationsByName.get(motusData.stations.filter(x=>x.id==profile_id)[0].name)[0].id;
				//console.log(profile_id);
			}
			
			var stationName = filters.options.stations[profile_id][0];
			var subset = motusData.stationsByName.get(stationName);
			
		} else {
			var stationName = filters.options[exploreType][profile_id];
			var subset = motusData[dataset].filter(function(d){
				
				return profile_id == d[filterName];
			
			});
		}
		
		if (subset.length > 0) {
			
			var status = ( exploreType == 'species' ? {
														tags: [subset.length],
														projects: [subset.map(x => x.projID).filter(onlyUnique).length],
														stations: [96],
														conservation: ['NT',"Near-threatened"]
													}
					   : ( exploreType == 'animals' ? {
														species: [subset.length],
														projects: [subset.map(x => x.projID).filter(onlyUnique).length],
														stations: [96],
														conservation: ['NT',"Near-threatened"]
													}
					   : ( exploreType == 'stations' ? {
														tags: [d3.sum(subset, d => d.nAnimals)],
											//			projectID: [subset[0].projID],
														species: [d3.sum(subset, d => d.nSpp)],
														lastData: [Math.round( subset[subset.length-1].lastData )],
														status: [subset[subset.length-1].status]
													}
					   : 							{
														tags: [subset[0].nAnimals],
														projectID: [subset[0].projID],
														species: [subset[0].nSpp],
														lastData: [Math.round( subset[0].lastData )]
													}
						)	)	)
			
			// Photos: my thought here is that eventually we'd have default photo for each species.
			// 		- Perhaps some day we users could upload an image for a deployment and it would replace this default.
			
			
			addExploreCard({
				data: subset,
				id: profile_id,
				name: stationName,
				status: status,
				photo: exploreType == 'species' ? 'https://i.postimg.cc/jdFJcfF1/Screenshot-2020-11-10-110730.png' : 'https://i.postimg.cc/2yLppgyn/20190717-130907-1.jpg'
			});
			
			updateData();
												
		} else {
			console.warn(firstToUpper(exploreType) + ' ' + filterName + ' ' + profile_id + ' could not be found!');
			console.log(motusData[dataset]);
		}
		
		$("body").trigger('click');
}


function addExploreCard(card) {
	

	if (typeof card.data === 'object') {
		if ($("#explore_card_profile_" + card.id).length == 0) {
			
			
			var profiles_header = "";
			
			(exploreType == 'species' ? ['Map colour', 'Name', 'Animals', 'Projects', 'Stations', 'Conservation Status'] : ['Map colour', 'Name', 'Animals', 'Species', 'Last data', 'Status']).forEach(function(x){profiles_header += "<div class='"+(x.toLowerCase().replace(' ','-'))+"'>"+x+"</div>";});
			
			
			if ($("#explore_card_profiles").length == 0) {$("#exploreContent .explore-card-wrapper").prepend("<div class='explore-card' id='explore_card_profiles'><div class='explore-card-profiles-header'>"+profiles_header+"</div><div class='explore-card-profiles-wrapper'></div><div class='explore-card-add explore-card-"+exploreType+"' alt='Add a "+exploreType+"'><select class='explore-card-add-"+exploreType+"' data-placeholder='Select a "+exploreType+"' style='width:300px;'><option></option></select></div></div>");}
			
			var toAppend = "<div class='explore-card-profile' id='explore_card_profile_" + card.id + "'>"+
			
								"<div class='explore-card-header'>" + card.name + "</div>"+
							
								"<br/>"+
								
								"<div class='explore-card-image tips enlarge' alt='Click to expand'>"+
								
								'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/></svg>'+
								
								"</div>"+
								
								"<div class='explore-card-status'>";
								
			for (s in card.status) {
				var title = s == 'conservation' ? 'Conservation<br>status' : 
						   (s == 'lastData' ? 'Last Data' : 
						   (s.indexOf('ID') != -1 ? s.replace('ID', ' ID') : firstToUpper(s)));
						   
				var icon = (s == 'lastData' ? icons[s] : 
						   (s == 'species' ? icons[s] :  
						   (s == 'tags' ? icons[s] : '')));
						   
				var statusText = card.status[s][0];
				statusText = s == 'status' ? (statusText != 'active' ? 'Inactive' : 'Active') : statusText;
				
				toAppend += "<div><div class='status-icon status-icon-" + s + (s == 'conservation' ? ' tips' : (s == 'status' ? ' status-icon-'+(statusText.toLowerCase()) : '')) + "'>"+ icon +"<div>"+ statusText + (s == 'lastData' ? '<div>days</div>' : '') + "</div></div><span>" + title + "</span></div>";
			}
			
			toAppend += "</div><div class='explore-card-options'>"+
							"<div class='explore-card-remove explore-card-subtext' alt='Remove "+exploreType+"'>"+'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/></svg>'+"</div></div>"+
						"</div>";
			
			$("#explore_card_profiles .explore-card-profiles-wrapper").append(toAppend)
		//	if ($(".explore-card-add").length > 0) {$(".explore-card-add").before(toAppend);}
	
		//	else {$(".explore-card-map").before(toAppend);}
			
			card.el = $("#explore_card_profile_" + card.id).get(0);
			
			$("#explore_card_profile_" + card.id + " .explore-card-image")
				.css("background-image", "url(" + card.photo + ")")
				.click(function(){
					if ($("#explore_card_profiles").hasClass('solo-card')) {
						initiateLightbox(this);
					}	else {
						viewSolo(card.id);
					}
				});
			$("#explore_card_profile_" + card.id + " .explore-card-remove").click(function(){removeExploreCard(this, exploreType)});
			
	//		console.log(card.status);
			
			for (i in card.status) {
				
				var text = String(card.status[i][0]);
						
						
				var adjustedFontSize = 15 - text.length;
				var adjustedPadding = [(8 + text.length), (16 - (text.length * 3))];
				var adjustedWidth = 40 - (adjustedPadding[1] * 2);
				var adjustedHeight = 40 - (adjustedPadding[0] * 2);
					
				//$("#explore_card_profile_"+card.id+" .status-icon-" + i).text(text);
				if (i == 'conservation') {
				//	$("#explore_card_profile_"+card.id+" .status-icon-" + i).css({fontSize: adjustedFontSize + 'pt', padding: adjustedPadding[0]+"px "+adjustedPadding[1] + "px", width: adjustedWidth+'px', height: adjustedHeight+'px'});
					$("#explore_card_profile_"+card.id+" .status-icon-" + i).css({fontSize: adjustedFontSize + 'pt', padding: adjustedPadding[0]+"px "+adjustedPadding[1] + "px", width: adjustedWidth+'px', height: adjustedHeight+'px'});
				}
				if (card.status[i][1] != undefined) {
					
					$("#explore_card_profile_"+card.id+" .status-icon-" + i).addClass('status-icon-' + (card.status[i][1].replace(' ', '-').toLowerCase())).attr('alt', card.status[i][1]);
					
				}
			}
			
			
			if (motusFilter[exploreType][0] === 'all') {motusFilter[exploreType] = [];}
			
			motusFilter[exploreType].push(String(card.id));
			motusFilter[exploreType] = motusFilter[exploreType].filter(onlyUnique);
			
			//if (typeof motusMap.setVisibility !== 'undefined') {motusMap.setVisibility();}
		/*
			if ($("#exploreContent .explore-card-profile").length == 1) {
				$("#explore_card_profiles").addClass('solo-card');
				try { motusMap.setColour('id'); }
				catch(err) { console.log("motusMap not yet created"); }
			} else {
				$("#explore_card_profiles").removeClass('solo-card');
				try { motusMap.setColour('species'); }
				catch(err) { console.log("motusMap not yet created"); }
			}*/
		} else {
			$("#explore_card_profile_" + card.id).addClass('flash')
			setTimeout('$("#explore_card_profile_' + card.id + '").removeClass("flash");',250);
		}
	}
	else if (card.data == 'chart') {
		
		var toAppend = "<div class='explore-card explore-card-"+card.data+"' id='explore_card_"+card.type+"'><div class='explore-card-chart-wrapper'><svg></svg></div><div class='explore-card-header'></div></div>";
		
		$(".explore-card-wrapper").append(toAppend);
		
		/*
		
		var selections = [];
		
		var selectedVar = 'tags';
		
		motusFilter[exploreType].forEach(function(id){
			selections.push({
				name: $("#explore_card_profile_" + id + " .explore-card-header").text(),
				value: $("#explore_card_profile_" + id + " .status-icon-" + selectedVar + " > div").text(),
				colour: $("#explore_card_profile_" + id + " .explore-card-image").css("border-left-color")
			});
		});
		console.log(selections);
		
		drawExploreChart({type:'barChart',data: selections});*/

	}
	else if (card.data === 'add') {
		
		//$("#exploreContent .explore-card-map").append("<div class='explore-card explore-card-add tips' alt='Add a "+exploreType+"'><select class='explore-card-add-species' data-placeholder='Select a "+exploreType+"' style='width:200px;'><option></option></select></div>")
		

		card.el = $("#exploreContent .explore-card-add").get(0);
		
		//console.log(filters.options[exploreType]);
		if (exploreType == 'stations') {
			for (d in filters.options[exploreType]) {
				$("#exploreContent .explore-card-add-" + exploreType).append('<option value="' + d + '" class="filter-option-' + filters.options.stations[d][1] + '">' + filters.options.stations[d][0] + '</option>');
			}
		} else {
			for (d in filters.options[exploreType]) {
				$("#exploreContent .explore-card-add-" + exploreType).append('<option value="' + d + '">' + filters.options[exploreType][d] + '</option>')
			}
		}
		$("#exploreContent .explore-card-add").click(function(e){
			e.stopPropagation();
			if (!$(this).hasClass('visible') && !$('#explore_card_profiles').hasClass('view-solo')) {
				$(this).addClass('visible');
				$('body').click(function(){$("#exploreContent .explore-card-add").removeClass('visible');$(this).unbind('click');});
				$("#exploreContent .explore-card-add > select").select2("open");
			} else if ($('#explore_card_profiles').hasClass('view-solo')) {
				$('#explore_card_profiles').removeClass('solo-card view-solo');
				$('.explore-card-profile').show();
			}
		});
		
		$("#exploreContent .explore-card-add-" + exploreType).select2({
			matcher: function(params, data) {
				// If there are no search terms, return all of the data
				if ($.trim(params.term) === '') {
					return data;
				}

				// Do not display the item if there is no 'text' property
				if (typeof data.text === 'undefined') {
					return null;
				}

				// `params.term` should be the term that is used for searching
				// `data.text` is the text that is displayed for the data object
				if (data.text.toUpperCase().indexOf(params.term.toUpperCase()) > -1) {
					return data;
				}
				
				
				if (data.id.indexOf(params.term) > -1) {
					return data;
				}

				// Return `null` if the term should not be displayed
				return null;
			},
			templateResult: function (data, container) {
				if (data.element) {
					$(container).addClass($(data.element).attr("class"));
				}
				return data.text;
			},
			placeholder: function(){return $(this).data('placeholder');},
		}).change(function(f) {addProfile(this.options[this.selectedIndex].value);});
		
	}
	
	initiateTooltip(card.el);
	
	updateURL();
	
}

function removeExploreCard(el, filterType) {
	
	var cardID = $(el).closest('.explore-card-profile').attr('id').replace('explore_card_profile_', '');
	
	$(el).closest('.explore-card-profile').remove();
	
	motusFilter[exploreType] = motusFilter[exploreType].filter(function(x){return x != cardID;});
	
	console.log(motusFilter[exploreType]);
	
	if ($("#exploreContent .explore-card-profile").length == 1) {
				$("#explore_card_profiles").addClass('solo-card');
		motusMap.setColour('id');
	} 
	
	
	updateData();
}
function setCardColours(colourFun) {
	
	$("#explore_card_profiles  .explore-card-profile").each(function(){
		if ($("#explore_card_profiles .explore-card-profile").length == 1) {	
			$(this).find('.explore-card-image').css('border-color', "#000000");
		} else {
			 var colour = exploreType == 'stations' ? colourFun($(this).find(".explore-card-header").text()) : colourFun(parseInt(this.id.replace("explore_card_profile_", "")));
			 console.log(colour);
			 $(this).find('.explore-card-image').css({'border-color':colour,'background-color':colour})
		}
		
	});
	
}

function setFilter(e) {
	
	if ($(this).hasClass('colourType_selector')) {
		var val = this.value;
		
		motusFilter.colour = val;
	
		if (val == 'species' && mapType != 'tracks') {val = 'nSpp';}
		
		motusMap.svg
			.selectAll('.explore-map-' + dataType + '.explore-map-' + mapType)
			.style(mapType == 'tracks' ? 'stroke' : 'fill', d => motusMap.colorScales[dataType][mapType][val](d[val]));
		
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
		
	} else {
	
		var filterName = e.target.id.replace("filter_", "");
		
		var newFilter = $(e.target).val();
		
		newFilter = newFilter.length == 0 ? ['all'] : (filterName == 'status' && newFilter == 'inactive' ? ['terminated','expired','pending'] : newFilter);
		
		motusFilter[filterName] = newFilter;
		
		var displayText = motusFilter[filterName].map(v => $("#filter_" + filterName + " option[value='" + v + "']").text());
		
		updateData();
	//	$("#filter_summary > div.explore_" + filterName + ":not(.visible)").addClass('visible');
	//	$("#filter_summary > div.clear_filters:not(.visible)").addClass('visible');
	//	$("#filter_summary > div.explore_" + filterName + " > span").text(displayText.join(', '));

	}
	
		
	
	return false;
}


function drawExploreChart(chart, update) {
	
	if (update || chart.type == 'barChart') {
		
		if (update) {
			
			var selectedVar = 'tags';
			
			chart = {
				type: 'barChart', 
				data: [], 
				title: "Number of "+(selectedVar == "tags" ? "animals" + (exploreType == 'stations' ? ' detected' : '' ) : selectedVar)
			};
			
			var longestName = d3.max($(".explore-card-profile .explore-card-header").map(function(){return this.innerHTML.length;}).get());
			
			motusFilter[exploreType].forEach(function(id){
				if ($("#explore_card_profile_" + id + " .explore-card-header").length > 0) {
					chart.data.push({
						name: $("#explore_card_profile_" + id + " .explore-card-header").text(),
						id: id,
						value: $("#explore_card_profile_" + id + " .status-icon-" + selectedVar + " > div").text(),
						colour: $("#explore_card_profile_" + id + " .explore-card-image").css("border-left-color")
					});
				}
			});
		console.log(chart.data);
			
		}
		$('#explore_card_'+chart.type+' .explore-card-header').text(chart.title);
		$('#explore_card_'+chart.type+' svg').empty();
		
		var margin = {top: 10, right: 20, bottom: 30, left: 15+(longestName* 100/20)},
			width = 535 - margin.left - margin.right,
			height = 215 - margin.top - margin.bottom;
		
		var x_scale = d3.scaleLinear().range([0, width]).domain([0, d3.max(chart.data, d => +d.value)]),
			y_scale = d3.scaleBand().rangeRound([0,height]).padding(0.5).domain(chart.data.map(d => d.name));
		
		var x_axis = d3.axisBottom(x_scale)
						.ticks(10),
			y_axis = d3.axisLeft(y_scale);

		var svg = d3.select('#explore_card_'+chart.type+' svg')
						.attr("width", width + margin.left + margin.right)
						.attr("height", height + margin.top + margin.bottom)
					.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
		svg.append('g')
				.attr("class", "chart-axis chart-axis-x")
				.attr("transform", "translate(0," + height + ")")
				.call(x_axis)
			.append("text")
				.text("Number of species")
				.style("text-anchor", "end")
				.attr("dx", "-.8em")
				.attr("dy", "-.55em")
				.attr("transform", "rotate(-90)" );
	
		svg.append("g")
				.attr("class", "y axis")
				.call(y_axis)
			.selectAll("text")
				//.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", "-.71em")
				.style("text-anchor", "end")
		
		svg.selectAll("rect")
				.data(chart.data)
			.enter().append("rect")
				.style("fill", (d) => d.colour)
				.attr("x", 0)
				.attr("width", (d) => x_scale(d.value))
				.attr("y", (d) => y_scale(d.name))
				.attr("height", y_scale.bandwidth())
				.on('click', (e,d) => viewSolo(d.id))
	}
}

function viewSolo(profile_id) {
	console.log("#explore_card_profile_"+profile_id);
	$("#explore_card_profiles .explore-card-profile:not(#explore_card_profile_"+profile_id+")").hide();
	$("#explore_card_profile_"+profile_id).show();
	$("#explore_card_profiles").addClass('solo-card view-solo');
}

function updateData() {
	
	if ($("#exploreContent .explore-card-profile").length == 1) {
		$("#explore_card_profiles").addClass('solo-card');
		try { motusMap.setColour('id'); }
		catch(err) { console.log("motusMap not yet created"); }
	} else {
		$("#explore_card_profiles").removeClass('solo-card');
		try { motusMap.setColour(exploreType=='stations' ? 'name' :'species'); }
		catch(err) { console.log("motusMap not yet created"); }
	}
	
	drawExploreChart(null, true);
	
	updateURL();
	
	motusMap.setVisibility();
	
	
}