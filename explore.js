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
	tags: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-clock-history" viewBox="125 -10 250 500"><path d="m 307.38806,152.71231 v 163.57 c 0,8.284 -6.716,15 -15,15 -41.28149,-0.71533 -47.28327,1.62781 -80,0 -8.284,0 -15,-6.716 -15,-15 v -164.459 c -16.587,-15.09 -27,-36.85 -27,-61.041001 0,-45.563 36.937,-82.5 82.5,-82.5 45.563,0 82.5,36.937 82.5,82.5 0,24.672001 -10.834,46.811001 -28,61.930001 z" /><path d="M 251.05287,334.93644 V 488.58051"/></svg>',
	pdf: '<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 41.659309 29.902843"><g inkscape:label="Layer 1" inkscape:groupmode="layer" id="layer1" transform="translate(-70.25338,-154.21364)"> <text xml:space="preserve"  x="73.117455" y="170.28175" id="text4530" transform="scale(0.92485882,1.0812461)"><tspan sodipodi:role="line" id="tspan4528" x="73.117455" y="170.28175" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:44.45785141px;font-family:\'Tw Cen MT Condensed\';-inkscape-font-specification:\'Tw Cen MT Condensed, Normal\';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-feature-settings:normal;text-align:start;writing-mode:lr-tb;text-anchor:start;stroke-width:1.11144626">PDF</tspan></text>  </g></svg>',
	search: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="explore-search-btn tips" alt="Search" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>',
	filters: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" class="explore-filter-btn tips" alt="Show filters" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2h-11z" /></svg>',
	timeline: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="explore-timeline-btn tips" alt="Timeline" viewBox="0 0 16 16"><path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z"/><path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/><path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/></svg>',
	animate: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="explore-animate-btn tips" alt="Animate tracks" viewBox="0 0 16 16"><path d="M 13.206 7.5 L 4.5 2.4495 v 10.101 L 13.206 7.5 z m 1.188 -1.044 a 1.203 1.203 90 0 1 0 2.088 l -9.5445 5.538 C 4.0695 14.535 3 14.0175 3 13.038 V 1.962 c 0 -0.9795 1.0695 -1.497 1.8495 -1.044 l 9.5445 5.538 z"/></svg>',
	station: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid" width="18" height="23" viewBox="0 0 389.923 481.915">  <defs> <style>.cls-1 {        stroke: #000;        stroke-linecap: round;        stroke-linejoin: round;        stroke-width: 20px;        fill: none;        fill-rule: evenodd;      }    </style>  </defs>  <path d="M358.000,145.000 L358.000,88.000 L280.000,88.000 L280.000,127.000 L270.000,127.000 L270.000,88.000 L197.000,88.000 L197.000,210.720 L280.003,455.303 L275.586,459.008 L232.000,330.572 L232.000,338.000 L197.000,338.000 L197.000,404.988 L187.000,404.988 L187.000,338.000 L150.007,338.000 L108.464,460.008 L103.997,456.274 L187.000,212.504 L187.000,88.000 L114.000,88.000 L114.000,127.000 L104.000,127.000 L104.000,88.000 L30.000,88.000 L30.000,152.000 L20.000,152.000 L20.000,20.000 L30.000,20.000 L30.000,78.000 L104.000,78.000 L104.000,40.000 L114.000,40.000 L114.000,78.000 L187.000,78.000 L187.000,57.012 L197.000,57.012 L197.000,78.000 L270.000,78.000 L270.000,40.000 L280.000,40.000 L280.000,78.000 L358.000,78.000 L358.000,20.000 L368.000,20.000 L368.000,78.000 L368.000,88.000 L368.000,145.000 L358.000,145.000 ZM197.000,328.000 L231.127,328.000 L197.000,227.438 L197.000,328.000 ZM187.000,229.355 L153.412,328.000 L187.000,328.000 L187.000,229.355 Z" transform="translate(10.96 10.96)" class="cls-1"/></svg>'
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
		species: ['all']
	},
	data: {}
}
var dataTypes = ['Stations', 'Animals', 'Regions', 'Projects', 'Species']

var default_startDate = moment('2014-02-05'),
	default_endDate = moment('2021-04-20');

var dtLims = {min: default_startDate, max: default_endDate};

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


function updateURL(reload) {

	var stateToPush = '#'+
		'exploreType=' + encodeURIComponent(exploreType) +
		'&dataType=' + encodeURIComponent(dataType),
		toEncode;

	for (f in motusFilter) {
		if (motusFilter[f][0] != 'all' &&
			(f != 'dtStart' || motusFilter.dtStart.toISOString().substr(0,10) != default_startDate.toISOString().substr(0,10)) &&
			(f != 'dtEnd' || motusFilter.dtEnd.toISOString().substr(0,10) != default_endDate.toISOString().substr(0,10))
			) {
				if (['dtStart','dtEnd'].includes(f)) {
					toEncode = moment( motusFilter[f] ).toISOString().substr(0,10);
				} else  {
					toEncode = (!['dtStart','dtEnd','colour'].includes(f)) ? motusFilter[f].filter(onlyUnique) : motusFilter[f];
				}
			stateToPush+='&'+f+'='+encodeURIComponent(toEncode);
		}

	}

	if (reload === true) {
		window.location.href = stateToPush;
		$('.explore-card-wrapper').animate({'opacity':0}, 500, function(){location.reload();});

	}
	else {
		window.history.pushState("", document.title, stateToPush);
	}


}

	window.onhashchange = detectNavigation;
function detectNavigation() {
	console.log(window.location.hash);
	var url_params = getSearchParameters();

	if ( (typeof url_params.exploreType !== 'undefined' && url_params.exploreType !== exploreType) || (typeof url_params.dataType !== 'undefined' && url_params.dataType !== dataType ) ) {window.location.reload();}

	motusFilter = {
		dtStart: url_params.dtStart === undefined ? motusFilter.dtStart : moment(url_params.dtStart),
		dtEnd: url_params.dtEnd === undefined ? motusFilter.dtEnd : moment(url_params.dtEnd),
		species: url_params.species === undefined || url_params.species.length == 0 ? filters.selected.species : url_params.species.split(','),
		regions: url_params.regions === undefined ? ["all"] : url_params.regions.split(','),
		projects: url_params.projects === undefined ? ["all"] : url_params.projects.split(','),
		stations: url_params.stations === undefined ? ["all"] : url_params.stations.split(','),
		status: url_params.status === undefined ? ["all"] : url_params.status.split(','),
		frequencies: url_params.frequencies === undefined ? ["all"] : url_params.frequencies.split(','),
		colour: url_params.frequencies === undefined ? [] : url_params.colour
	};
	if (motusMap.setVisibility) {
		motusMap.setVisibility();
	}
}

$(document).ready(function(){

	$('.explore-card-wrapper').css({'opacity':0});

	isMobile = window.mobileCheck();

	var url_params = getSearchParameters();

	//console.log(url_params);
	//  exploreType defaults to "main" if not present in expected set of values
	exploreType = url_params.exploreType === undefined ? "main" : ["regions", "animals", "species", "stations", "projects"].includes(url_params.exploreType) ? url_params.exploreType : "main";

	//  dataType defaults to null if not present in expected set of values
	dataType = url_params.dataType !== undefined && dataTypes.includes(firstToUpper(url_params.dataType)) ? url_params.dataType : 'stations';

	if (exploreType == 'projects') {dataType = 'regions';}

	document.title = "Motus - Explore " + (exploreType == 'main' ? "Data" : firstToUpper(exploreType));

//	window.onhashchange = detectNavigation();

	//exploreType = 'stations'; // TESTING

	if (exploreType == 'main' && window.location.hostname != 'localhost') {window.location.href="dashboard/#exploreType=main&dataType="+dataType;}

/*	if (exploreType == 'main' && dataType != 'animals') {
		default_startDate = moment();
		default_endDate = moment();
	} else {
*/		default_startDate = dtLims.min;
		default_endDate = dtLims.max;
//	}

	motusFilter = {
		dtStart: url_params.dtStart === undefined ? motusFilter.dtStart : moment(url_params.dtStart),
		dtEnd: url_params.dtEnd === undefined ? motusFilter.dtEnd : moment(url_params.dtEnd),
		species: url_params.species === undefined || url_params.species.length == 0 ? filters.selected.species : url_params.species.split(','),
		regions: url_params.regions === undefined ? ["all"] : url_params.regions.split(','),
		projects: url_params.projects === undefined ? ["all"] : url_params.projects.split(','),
		stations: url_params.stations === undefined ? ["all"] : url_params.stations.split(','),
		status: url_params.status === undefined ? ["all"] : url_params.status.split(','),
		frequencies: url_params.frequencies === undefined ? ["all"] : url_params.frequencies.split(','),
		colour: url_params.frequencies === undefined ? [] : url_params.colour
	};

	// Set the HTML content of the page based on exploreType
	var HTML_dom = "<div class='title-wrapper'>"+
						//(exploreType == 'main' ? "<div class='title-header'>Explore "+firstToUpper(dataType)+"</div>" : "<div class='title-header'>Explore [NAME]</div>")+
						"<div id='explore_menu'>"+
							(dataTypes.map(x=>"<div class='explore-menu-item"+(x==firstToUpper((exploreType == 'main' ? dataType : exploreType))?" selected":"")+"' __data='"+(x.toLowerCase())+"'>"+(x=='Regions'?'Data Summaries':(x=='Animals'?'Tracks':x))+"</div>").join(""))+
						"</div>"+
					"</div>"+
					"<div class='explore-card-wrapper' style='opacity:0;'>"+
						"<div class='explore-controls' id='explore_controls'>"+
							"<div class='explore-control-wrapper'>"+
							//	(dataTypes.map(x=>"<div class='explore-control-tab"+(x==firstToUpper(dataType)?" selected":"")+"'>"+x+"</div>").join(""))+
							"</div>"+
						"</div>"+
						(
							["animals","stations","regions","projects"].includes(dataType) ? (

								(exploreType != 'main' || dataType == 'regions' ? "<div class='explore-card explore-card-map'>" : "") +
								"<div id='explore_map'></div>" +
								(exploreType != 'main' || dataType == 'regions' ? "</div>" : "")
								) :	""
						)+
						(
							["projects","species","regions","projects"].includes(dataType) ? "<div class='explore-table-wrapper'><table class='hover' id='explore_table' style='width:100%;'></table></div>" : ""
						)
					"</div>";

	$("#exploreContent").after('<svg class="progress-ring" width="150" height="150"><circle class="progress-ring__circle" stroke="red" stroke-width="20" fill="transparent" r="50" cx="60" cy="60"/><text class="progress-ring__text" x="60" y="75" text-anchor="middle" font-size="36pt">0%</text></svg>');


	var circumference = $(".progress-ring__circle").attr('r') * 2 * Math.PI;

	$(".progress-ring__circle").css({strokeDasharray:`${circumference} ${circumference}`});
	$(".progress-ring__circle").css({strokeDashoffset: `${circumference}`});

	setProgress(0);


	$("#exploreContent").append(HTML_dom).toggleClass('profiles', exploreType != 'main').toggleClass('data-summary', exploreType == 'main' && dataType == 'regions');

	$("#explore_menu .explore-menu-item").click(function(){

		dataType = $(this).attr('__data');

		dataType = dataType == 'data summaries' ? 'regions' : dataType;

		exploreType = 'main';

		motusFilter={};

		updateURL(true);

	});
	// This is probably unecessary
	for (f in filters.selected) {
		filters.selected[f] = motusFilter[f];
	}

//	loadMotusData('all', afterMapLoads);
	loadMotusData(dataType, afterMapLoads);
});


function setProgress(percent) {
	//alert(percent);
	var circumference = $(".progress-ring__circle").attr('r') * 2 * Math.PI;
	const offset = circumference - percent / 100 * circumference;
	$(".progress-ring__circle").css({strokeDashoffset: `${offset}`});
	$(".progress-ring__text").text(percent + "%");
	//alert(1);
	if(true||percent==100){$(".progress-ring").hide();}
}

function loadMotusData(fileList, callback) {

	var filePrefix = window.location.hostname == 'localhost' ? 'data/' : window.location.hostname == 'www.motus.org' ? "https://" + window.location.hostname + "/wp-content/uploads/2021/01/" : "https://" + window.location.hostname + "/wp-content/uploads/";

	var mapFiles = {
		stations: filePrefix + "recv-deps.csv",
		animals: filePrefix + "tag-deps.csv",
		tracks: filePrefix + "siteTrans_real2" + (window.location.hostname.indexOf('beta') != -1 ? '-2' : '') + ".csv",
		regions: filePrefix + "country-stats.csv",
		polygons: filePrefix + "ne_50m_admin_0_countries.geojson",
	//	polygons: filePrefix + "BCR_Terrestrial_master.json",
		species: filePrefix + "spp.csv",
		projects: filePrefix + "projs.csv"
	};

	if (typeof fileList === 'string') {fileList = fileList == 'all' ? Object.keys(mapFiles) : [fileList];}

	if (!fileList.includes("tracks") && fileList.includes('animals')) {fileList=["tracks"];}
	if (!fileList.includes("polygons") && fileList.includes('tracks')) {fileList = ["polygons", "tracks"];}
	if (!fileList.includes("stations") && fileList.includes('tracks')) {fileList=["stations", "tracks"];}
	if (!fileList.includes("polygons") && fileList.includes('regions')) {fileList = ["stations", "regions", "polygons"];}

	if (exploreType == 'regions' || exploreType == 'projects' || exploreType == 'stations') {
		dataType = 'animals';
		fileList = ["stations", "regions", "polygons", "tracks", "animals", "species", "projects"];
	}


	if (!fileList.includes("animals") && fileList.includes("regions")) {fileList.push("animals");}
	if (!fileList.includes("species")) {fileList.push("species");}
	if (!fileList.includes("projects")) {fileList.push("projects");}


	var promises = [];

	fileList.forEach(function(f){

		if (typeof mapFiles[f] !== 'undefined') {
			var url = mapFiles[f];
			url.substr(url.lastIndexOf('.') + 1, url.length) == 'csv' ? promises.push(d3.csv(url)) : promises.push(d3.json(url));
		}

	});

	Promise.all(promises).then(function(response){

		setProgress(10);
		fileList.forEach(function(f, i){

			motusData[f] = response[i];

		});

		if (typeof motusData.projects !== 'undefined') {
			motusData.projects.forEach((x,i) => motusData.projects[i].fee_id = getProjectType(x.fee_id))
			function getProjectType(fee_id) {
				return (fee_id > 1 ? fee_id > 2 ? fee_id > 3 ? fee_id > 8 ? 'Birds Canada' : 'Wind development' : 'Environment Canada' : 'US Dept. of the Interior' : '')
			}
		}


		if (typeof motusData.stations !== 'undefined') {
			motusData.stations = motusData.stations.filter(d => (!isNaN(+d.lat) && !isNaN(+d.lon) && d.frequency != 'NA'));
			motusData.stationsByName = d3.group(motusData.stations, d => d.name);
		}

		if (typeof motusData.species !== 'undefined') {
			motusData.speciesByID = d3.group(motusData.species, d => d.id);
		}
		if (typeof motusData.regions !== 'undefined') {
			filters.options.regions = {};
			motusData.regions.forEach(function(x) {
				if (x.both > 0) {filters.options.regions[x.ADM0_A3] = x.country;}
			});
			console.log(filters.options.regions);
		}
		console.log("Loaded " + Object.keys(motusData).length + " data set" + (Object.keys(motusData).length == 1 ? "" : "s"));

		readData(callback);

	});
}

function makeTimelineSVG() {

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

}

function readData(callback) {

	populateExploreControls();


	if (dataType == 'regions' && exploreType == 'main') {
		$("#explore_controls .explore-summary-control-tab").click(function(){

			$("#explore_controls .explore-summary-selections input").hide();

			$("#explore_controls .explore-summary-control-tab").removeClass('selected');
			$(this).addClass('selected');

			var tabText = $(this).text().toLowerCase();
			var selectedTab = ["region", "project", "species"].filter(x=>tabText.indexOf(x) != -1)[0];

			exploreSummaryTabSelect(selectedTab);

		});
	}
	if (dataType == 'animals' || dataType == 'stations') {

	//	console.log( [ motusFilter.dtStart.getTime() / 1000, motusFilter.dtEnd.getTime() / 1000 ])
		exploreTimeline(min = dtLims.min.unix(), max = dtLims.max.unix(), defaultValues = [ motusFilter.dtStart.unix(), motusFilter.dtEnd.unix() ]);
	}

	initiateTooltip();
	initiatePopup();

	initiateLightbox();


	populateSelectOptions();

//	dataType = 'species';
//	mapType = 'tracks';

	if (["stations","animals","regions"].includes(dataType)) {
		exploreMap({containerID: 'explore_map'});
		setTimeout(function(){loadMapObjects(callback);},1)
	} else {
		exploreTable({containerID: 'explore_table', name: dataType, data: motusData[dataType]});
	}

	//loadMapObjects({"tagDeps": subset});

	//loadMapData(['regions', 'stations', 'tagDeps', 'tracks'] , afterMapLoads);



}
function exploreSummaryTabSelect(selectedTab) {
	var selectedTabText = selectedTab == 'regionTable' ? 'region' : selectedTab;

	$("#explore_controls .explore-summary-selections span").text("Select one or more "+(selectedTab=='species'?selectedTabText:(selectedTabText+"s"))+" below");

		if (selectedTab == 'region') {
			$("#explore_controls .explore-summary-selections input.multiSelect_btn:visible").hide();
			$("#explore_table:visible").hide();
			if ($.fn.DataTable.isDataTable("#explore_table")) {
				$("#explore_table").DataTable().clear().destroy();
			}

			$(".explore-card-map:hidden").show();
			$("#explore_map:hidden").show();
		} else {
			$(".explore-card-map:visible").hide();
			$("#explore_map:visible").hide();
			var tbl = selectedTab == 'project' ? 'projects' : (selectedTab == 'regionTable' ? 'regions' : selectedTab);

			if (tbl == 'regions') {

				tbl = [tbl,motusData.regions.filter(x=>x.both != 0)];

			} else if (tbl == 'projects') {
	console.log(motusData);

				tbl = [tbl,Array.from(motusData.projects.map(function(d) {
						var stations = motusData.stationsByProject.get(`${d.id}`);
						var animals = motusData.animalsByProject.get(`${d.id}`);

						return { id: d.id,
						project_name: d.project_name,
						fee_id: d.fee_id,
						stations: typeof stations !== 'undefined' ? stations.length : 0,
						animals: typeof animals !== 'undefined' ? animals.size : 0 }
					}).values())];

			}
			console.log(tbl);

			function loadTable(multi) {

				var opts = {
						select: {
							style: multi?"multi+shift":"single"
						},
						order: [[ multi?1:0, 'asc' ]],
						dom: '<"explore-table-header-controls"fi>lpti'

					};
				var cols = selectedTab == 'project' ? ['id', 'project_name', 'fee_id', 'stations', 'animals'] : (selectedTab == 'regionTable' ? ['country', 'stations', 'animals'] : ['english', 'scientific', 'group', 'code', 'sort']);

				if (multi) {

					opts.columnDefs = [{
							targets: 0,
							data: null,
							defaultContent: '',
							orderable: false,
							className: 'select-checkbox' }];

				//	opts.select.selector = 'td:first-child';

					cols = [''].concat(cols);

					$("#explore_controls .explore-summary-selections input.multiSelect_btn:visible").hide();

				}

				loadDataTable(
					tbl,
					cols,
					opts,
					[{event: 'select', fun: onSelect},
					{event: 'deselect', fun: onSelect}]
				);
			}
			loadTable(false);
			$("#explore_controls .explore-summary-selections input.multiSelect_btn").show();
			$("#explore_controls .explore-summary-selections input.multiSelect_btn").click(function(){
				loadTable(true);
				$("#explore_table th.select-checkbox").on('click', selectAll);
				$(".explore-summary-control-options .explore-table-header-controls").remove();
				$(".explore-summary-" + selectedTab + "-control-options").append($(".explore-table-header-controls"));
			});
			$("#explore_table:hidden").show();

			$("#explore_table th.select-checkbox").on('click', selectAll);
			function selectAll() {
				$(this).closest("tr").toggleClass("selected");
				var table = $("#explore_table").DataTable();
				if( $(this).closest("tr").hasClass("selected")){
					table.rows({page: 'current'}).select();
				}
				else {
					table.rows({page: 'current'}).deselect();
				}
			}

			$(".explore-summary-selections .submit_btn").click(function(){
				var data = $("#explore_table").DataTable().rows( {selected: true} ).data();

				default_startDate = dtLims.min;
				default_endDate = dtLims.max;

				var profileName = $("#explore_controls .explore-summary-control-tab.selected").text().toLowerCase();
				profileName = profileName == 'species' ? profileName : (profileName + "s");
				var dataVar = profileName != 'species' ? profileName != 'projects' ? 'ADM0_A3' : 'id' : 'id';

				var selection = [];

				for (var i=0; i<data.length; i++) {
					selection.push(data[i][dataVar]);
				}

				viewProfile(profileName, selection);
			});
			$(".explore-summary-selections .reset_btn").click(function(){
				$("#explore_table").DataTable().rows().deselect();
			});
			$(".explore-summary-control-options .explore-table-header-controls").remove();
			$(".explore-summary-" + selectedTab + "-control-options").append($(".explore-table-header-controls"));

			function onSelect(e, dt, t, i) {
				var nSelected = $("#explore_table").DataTable().rows( {selected: true} ).count();
				if (nSelected > 0 && $("#explore_table td.select-checkbox").length == 0) {

			        var data = dt.rows( {selected: true} ).data();

					var profileName = $("#explore_controls .explore-summary-control-tab.selected").text().toLowerCase();
					profileName = profileName == 'species' ? profileName : (profileName + "s");
					var dataVar = profileName != 'species' ? profileName != 'projects' ? 'ADM0_A3' : 'id' : 'id';

					var selection = data[0][dataVar];

					default_startDate = dtLims.min;
					default_endDate = dtLims.max;

				//	viewProfile(profileName, selection);

					loadOverlayPane( profileName, dataVar, selection );


				} else if (nSelected > 0) {
					$("#explore_controls .explore-summary-selections span").text(nSelected + " "+(selectedTab=='species'?selectedTabText:(selectedTabText+(nSelected == 1 ? "":"s")))+" selected");
					$("#explore_controls .explore-summary-selections input:not(.multiSelect_btn)").show();
				//	$("#explore_controls .explore-summary-selections input.multiSelect_btn:visible").hide();
				} else {
					$("#explore_controls .explore-summary-selections input:not(.multiSelect_btn)").hide();
				//	if (!$("#explore_table td.select-checkbox").length > 0) {
				//		$("#explore_controls .explore-summary-selections input.multiSelect_btn").show();
				//	}
					$("#explore_controls .explore-summary-selections span").text("Select one or more "+(selectedTab == 'project' ? 'projects' : selectedTabText)+" in the table below");
				}
			}
		}
		$("#explore_controls .explore-summary-control-options").hide();
		$("#explore_controls .explore-summary-" + selectedTab + "-control-options").show();

}
function loadOverlayPane( profileName, dataVar, selection ) {

	$('#explore_overlay').remove();

	$('body').append('<div id="explore_overlay"><div class="explore-overlay-content"></div></div>');

	if ($("#explore_overlay_bg").length == 0) {
		$('body').append('<div id="explore_overlay_bg"></div>');
		$("#explore_overlay_bg").click(closeExploreOverlay);
		console.log("#explore_overlay");
	}
	$("#explore_overlay_bg").fadeIn(100);

	var selected_row = motusData[profileName].filter( d => d[dataVar] == selection)[0];

	if (profileName == 'regions') {
		var cols = {'country':"header", 'code':'subheader', 'stations':"stat", 'animals':"stat"};

		selected_row.code = `CODE: "${selected_row.ADM0_A3}"`;

	} else if (profileName == 'species') {

		var cols = {'english':"header", 'scientific':"subheader", "group":"group"};

	} else if (profileName == 'projects') {
		var cols = {'project_name':"header", 'code':"subheader", 'created_dt':"data", 'fee_id':"group", 'description':"text"};

		selected_row.code = `CODE: "${selected_row.project_code}"`;

	}

	var vals = {};
		console.log(cols);
	Object.entries(cols).forEach(function(d){

		if (d[1] == 'stat') {selected_row[d[0]] = `${firstToUpper(d[0])}: ${selected_row[d[0]]}`;}

		if (selected_row[d[0]].length > 0) {
			$('#explore_overlay .explore-overlay-content').append(`<div class='explore-overlay-${d[1]}'>${selected_row[d[0]]}</div>`);
		}
	});

	$('#explore_overlay .explore-overlay-content').append("<div class='button_wrapper'><input type='button'  class='submit_btn' value='View summary' /><input type='button' class='close_btn' value='Close' /></div>");

	$("#explore_overlay .explore-overlay-content .submit_btn").click(viewExploreProfile);
	function viewExploreProfile() {	viewProfile(profileName, selection); }


	$("#explore_overlay .explore-overlay-content .close_btn").click(closeExploreOverlay);
	function closeExploreOverlay() { $("#explore_overlay_bg").fadeOut(100);$("#explore_overlay").remove(); }


}
function populateExploreControls() {

	var toAppend = [];

	if (dataType == 'regions') {
		toAppend = ["type"];
		if (exploreType == 'main') {
			$('#explore_controls').addClass('data-summary');
		}
	} else if (dataType == 'stations') {
		toAppend = ["filters", "timeline", "search", "view", 'pdf'];
	} else if (dataType == 'animals') {
		toAppend = ["filters", "timeline", "animate", "search", "view", 'pdf'];
	}


	if (toAppend.length > 0) {

		toAppend.forEach(function(x){

			var hasIcon = dataType != 'regions' & x != 'view';

			$("#explore_controls > div").append(
				"<div class='explore-map-" + dataType + "-" + x + (hasIcon ? " toggleDisplay" : "") + "'>"+

					(hasIcon?icons[x]:"")+

					(hasIcon?'<div class="explore-control-hidden"'+(x=='filters'?' id="explore_filters"':'')+'>':"")+


					(
						x == 'view' ? (

							dataType == 'stations' ? ("<select style='width:150px'><option>Not grouped</option><option>Rectangles</option><option>Circles</option></select>") :

							("<a href='javascript:void(0);' onclick='exploreControls(this);'>View " + (dataType == 'regions' ? "as table" : "deployments")  + "</a>")

						) : (
						x == 'pdf' ? "<input type='button' onclick='exploreControls(this.parentElement.parentElement);' value='Agree and Download' />" :
						(
							x == 'timeline' ?  "<div id='dateSlider'><div class='slider visible'><div id='custom-handle-1' class='ui-slider-handle'></div><div id='custom-handle-2' class='ui-slider-handle'></div></div></div>"  : (
									x == 'search' ? "<input type='text' /><input type='button' value='Search' />" :
									(
										x == 'type' ?
										(
											dataType == 'regions' ?
												"<div class='explore-summary-control-tab-header'>Summarise by: </div>"+
												"<div class='explore-summary-control-tab'>Region</div>"+
												"<div class='explore-summary-control-tab'>Project</div>"+
												"<div class='explore-summary-control-tab'>Species</div>"+
												"<div class='explore-summary-selections'>"+
													"<span></span> "+
													"<input type='button' value='Select multiple' class='multiSelect_btn'> "+
													"<input type='button' value='Summarise these data' class='submit_btn'> "+
													"<input type='button' value='Clear selections' class='reset_btn'>"+
												"</div>"+
												"<div class='explore-summary-region-control-options explore-summary-control-options'>"+
													"<label for='explore_control_regions_type'>Mapping regions by: </label><select id='explore_control_regions_type' style='width:150px'>"+
													(["state/province", "country", "continent", "ecoregion", "BCR", "KBA", "Custom..."].map((x)=>"<option value='"+x+"'>"+firstToUpper(x)+"</option>"))+
													"</select>"+
													"<input type='button' onclick='exploreControls(this);' value='View as table' />"+
												//	"<input type='text' /><input type='button' value='Search' />"+
												"</div>"+
												"<div class='explore-summary-regionTable-control-options explore-summary-control-options'>"+
													"<label for='explore_control_regions_type'>List regions by: </label><select id='explore_control_regions_type' style='width:150px'>"+
													(["state/province", "country", "continent", "ecoregion", "BCR", "KBA", "Custom..."].map((x)=>"<option value='"+x+"'>"+firstToUpper(x)+"</option>"))+
													"</select>"+
													"<input type='button' onclick='exploreControls(this);' value='View as map' />"+
												//	"<input type='text' /><input type='button' value='Search' />"+
												"</div>"+
												"<div class='explore-summary-project-control-options explore-summary-control-options'></div>"+
												"<div class='explore-summary-species-control-options explore-summary-control-options'></div>" :
											//	"<label for='explore_control_regions_type'>Mapping regions by: </label><select id='explore_control_regions_type' style='width:150px'>"+
											//		(["state/province", "country", "continent", "ecoregion", "BCR", "KBA", "Custom..."].map((x)=>"<option value='"+x+"'>"+firstToUpper(x)+"</option>"))+
											//	"</select>" :
												""
										) : ""
									)
								)
							)
						)
					)+

					(hasIcon?'</div>':"")+


				"</div>"
			);

		});
		//console.log($("#explore_controls > div").html());
	}


	$("#explore_controls select").select2({
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
	}).change(function(){exploreControls(this);});

	$("#explore_controls .toggleDisplay svg").click(function(){

		$(this).parent().toggleClass('selected').siblings('.toggleDisplay.selected').toggleClass('selected');

	});

}
function exploreControls(el) {
	var opt = $(el).closest('div').attr('class').split(' ')[0].split('-').pop()


	if (opt == 'view') {
	//	console.log(el.value);
		if (dataType == 'stations') {
			motusMap.groupData = el.value.toLowerCase() == 'rectangles' ? 'rect' : (
				el.value.toLowerCase() == 'circles' ? 'circles' : false
			);
			motusMap.map.fire('moveend');
		}
	} else if (opt == 'options') {
		var isTable = $(el).val().indexOf('table')!=-1;
		exploreSummaryTabSelect('region'+(isTable?'Table':''));
	} else if (opt == 'pdf') {
		var zoom = motusMap.map.getZoom();
		motusMap.map.setZoom(1.5);
		setTimeout(function(){
			var vars = [];
			var vals = [];
			console.log($("#explore_card_profiles table td .status-icon").length)
			$("#explore_card_profiles table td .status-icon").each(function(i){
				console.log(this);
				vals.push( $(this).children("div").text() );
				vars.push( firstToUpper( this.classList[1].replace("status-icon-", "") ) );
			});

			var opts = {};

			if (exploreType == 'regions') {
				var region_svg = d3.create('svg');
				console.log(selectedPolygons);
				var path = d3.geoPath().projection(d3.geoMercator().fitSize([500,100],selectedPolygons[0]))

				var g = region_svg.attr('width',500)
						.attr('height',100)
						.append('g');

				g.selectAll("regions")
						.data(selectedPolygons)
						.enter().append("path")
						.attr("d", path)
						.attr('class', 'explore-map-regions leaflet-zoom-hide')
						.style('stroke', '#000')
					//	.style('fill', '#FFF')
						.style('fill', d => motusFilter.regions.includes(d.properties.adm0_a3) ? "#FFF" : "#CCC" )
						.style('stroke-width', '1px');


			  g.selectAll('stations')
						.data(motusData.recvDepsLink.filter(d => regionStations.includes(d.id)).sort((a, b) => d3.ascending(a.id, b.id)))
						//.data(motusData.recvDepsLink)
						.enter().append("path")
						.attr("d", path.pointRadius(5))
						.style('stroke', '#000')
						.style('fill', (d) => d.dtEnd > moment().subtract(1, 'days') ? '#0F0' : '#F00')
						.attr('class', 'explore-map-stations leaflet-zoom-hide')
						//.style('fill', d => regionStations.includes(d.id) ? "#F00" : "#000")
						.style('stroke-width', '1px')

				d3.geoPath().bounds({features:selectedPolygons, type: "FeatureCollection"});

				opts = {
					type: exploreType,
					selection: firstToUpper($("#explore_card_profiles .explore-card-header").text()),
					summaryTable: {vars: vars, vals: vals},
					titleIcon: {svg: region_svg}
				};

				if ($("#explore_card_stationHits table:visible").length > 0) {
					opts.stations = {
						// Remove the HTML from the first row!
						data: $("#explore_card_stationHits table:visible").DataTable().rows().data().toArray().map(x => x.map((k,i) => i==0||i==2?$("<a>"+k+"</a>").text():k)),
						cols: $("#explore_card_stationHits table:visible th").map(function(){return $.trim($(this).text());}).get(),
						colWidths: [4,2,3,1,1]
					}
				}
				if ($("#explore_card_tagHits table.explore-card-tagHits-table").length > 0) {
					opts.animals = {
						// Remove the HTML from the first row!
						data: $("#explore_card_tagHits table.explore-card-tagHits-table").DataTable().rows().data().toArray().map(x => x.map((k,i) => i==0||i==2?$("<a>"+k+"</a>").text():k)),
						cols: $("#explore_card_tagHits table.explore-card-tagHits-table th").map(function(){return $.trim($(this).text());}).get(),
						colWidths: [4,2,3,1,1]
					}
				}
				if ($("#explore_card_tagHits table.explore-card-tagHits-speciesTable").length > 0) {
					opts.species = {
						// Remove the HTML from the first row!
						data: $("#explore_card_tagHits table.explore-card-tagHits-speciesTable").DataTable().rows().data().toArray().map(x => x.map((k,i) => i==0||i==2?$("<a>"+k+"</a>").text():k)),
						cols: $("#explore_card_tagHits table.explore-card-tagHits-speciesTable th").map(function(){return $.trim($(this).text());}).get(),
						colWidths: [4,2,3,1,1]
					}
				}

			} else {
				opts = {
					type: exploreType,
					selection: firstToUpper($("#explore_card_profiles .explore-card-header").text()),
					summaryTable: {vars: vars, vals: vals}
				};
			}

			makePDF(opts);

			setTimeout(function(){
				motusMap.map.setZoom(zoom);
			}, 250);
		}, 250);
	}
}
function afterMapLoads() {
	console.log(exploreType + ' - ' + dataType);
	if (exploreType == 'main') {

		$("#explore_controls .explore-control-tab").click(function(){

			$("#explore_controls .explore-control-tab").removeClass('selected');
			$(this).addClass('selected');

		});

		if (dataType == 'regions') {

			$("#explore_map").hide();
			$("#explore_controls .explore-summary-control-options").hide();
		}

	} else {

		if (exploreType == 'regions') {



			exploreRegions(motusFilter.regions);


		}
		else if (exploreType == 'projects') {
			exploreProjects(motusFilter.projects);
		}
		else if (exploreType == 'stations') {
			exploreStations(motusFilter.stations);
		}
		else {
			addExploreCard({data:'chart', type:'barChart'});
			addExploreCard({data:'chart', type:'detectionTimeline'});

			loadDataTable(['animals','species'].includes(exploreType) ? 'tagDeps' : exploreType);

			addExploreCard({data:'add'});

			updateURL();

			updateData();
		}
	}


	$('.explore-card-wrapper').animate({'opacity':1}, 500);

}
function exploreTable(opts) {

	$("#" + opts.containerID).append("<div class='" + opts.containerID.replace('_','-') + "-wrapper'><table id='" + opts.containerID + "_" + dataType + "'><thead><tr>"+
									 (Object.keys(opts.data[0]).map(x=>"<th>"+dataColNames[opts.name][x]+"</th>").join(""))+
									 "</tr></thead><tbody></tbody></table></div>")

	opts.data.forEach(function(d){

		var toAppend = "<tr>";

		Object.values(d).forEach(x=>(toAppend+="<td>"+x+"</td>"));

		$("#" + opts.containerID + "_" + dataType + " tbody").append(toAppend + "</tr>");

	});
	$("#" + opts.containerID + "_" + dataType).DataTable({
		dom: '<"#explore_table_controls"lf><ip><rt>'
	});

	$("#explore_controls > div").append($("#explore_table_controls > div"))

	/*
	$("#" + opts.containerID).append("<div class='" + opts.containerID + "-wrapper'><table id='" + opts.containerID + "_" + dataType + "'></table></div>");
	$("#" + opts.containerID + "_" + dataType).DataTable({
		data: opts.data,
		columns: Object.keys(opts.data[0])
	})
	*/

	$('.explore-card-wrapper').animate({'opacity':1}, 500);
}

function populateSelectOptions() {
	/*
	var filterNames = ['projects','stations', 'species', 'animals', 'regions', 'frequencies', 'models', 'status'];

	var filters_toInclude = exploreType == 'main' ? filterNames : (
							exploreType == 'stations' ? filterNames : (
							exploreType == 'species' ? filterNames : (
							exploreType == 'animals' ? filterNames : filterNames)));
	*/

	if (typeof motusData.projects !== 'undefined') {
		motusData.projects.forEach(function(d){

			filters.options.projects[d.id] = d.project_name;

		});
	}
	if (typeof motusData.stations !== 'undefined') {
		for (const [name, d] of motusData.stationsByName.entries()){

			filters.options.stations[d[0].deployID] = [name, d[d.length-1].status != 'active' ? 'inactive' : 'active'];

		};
		filters.options.frequencies = {};

		(Array.from(motusData.stations.map(d => d.frequency).values())).filter(onlyUnique).filter(d => d.length > 0 && d!="NA" && d.split(',').length == 1).forEach(d => filters.options.frequencies[`${d}`] = d + " MHz");
	}
	if (typeof motusData.species !== 'undefined') {
		motusData.species.forEach(function(d){

			filters.options.species[d.id] = d.english;

		});
	}

	if (typeof motusData.tagDeps !== 'undefined') {
		filters.options.models = motusData.tagDeps.map(d => d.model).filter(onlyUnique).filter(d => d.length > 0);
		filters.options.frequencies = {};
		(Array.from(motusData.tagDeps.map(d => d.frequency).values())).filter(onlyUnique).filter(d => d.length > 0 && d!="NA" && d.split(',').length == 1).forEach(d => filters.options.frequencies[`${d}`] = d + " MHz");
	}
	if (typeof motusData.tracks !== 'undefined') {
	//	filters.options.models = motusData.tracks.map(d => d.model).filter(onlyUnique).filter(d => d.length > 0);
		filters.options.frequencies = {};
		(Array.from(motusData.tracks.map(d => d.frequency).values())).filter(onlyUnique).filter(d => d.length > 0 && d!="NA" && d.split(',').length == 1).forEach(d => filters.options.frequencies[`${d}`] = d + " MHz");
	}

	var toAppend = (["projects","stations","species","regions","frequencies","dates"].map(function(x){

						const classes = ['stations','species'].includes(x) ? ' class="dataType_' + x +'"': "";

						return "<div"+classes+">"+(x == 'dates' ? "<input " : "<select ")+" id='filter_"+x+"' class='filter_"+x+"'"+(x == 'dates' ? '>' : "' multiple='multiple' "+(x == 'status' ? " style='width:150px' " : x == 'frequencies' ? " style='width:170px' " : "")+"data-placeholder='All "+x+"'><option value='all'></option></select>") + "</div>";

					}).join(""));

	$(exploreType == 'main' ? "#explore_filters" : "#explore_filters").append(toAppend);

	$(exploreType == 'main' ? "#explore_filters" : "#explore_filters").parent().prepend("<div class='filter_status'>Showing <span></span> of <span></span> " + ( dataType == 'animals' ? 'tracks' : dataType ) + "</div>");

	if (motusData.nTracks) {$("#explore_filters").siblings('.filter_status').find('span:eq(1)').text(motusData.nTracks);}
	else if (dataType == 'stations') {$("#explore_filters").siblings('.filter_status').find('span:eq(1)').text(motusData.stations.length);}

	$("#explore_filters").after("<div class='filterButton clear-filters' alt='Clear filters'>Clear filters"+'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>'+"</div>");

	$(".clear-filters").click(function(){
		for (f in motusFilter) {
			if (f != 'dtStart' && f != 'dtEnd' && f != 'colour' && f != exploreType) {
				if ($("#explore_filters select.filter_" + f).select2("val") != 0) {
					$("#explore_filters select.filter_" + f).select2().val(null).trigger("change");
				}
			}
		}

		timeline.setSlider([default_startDate, default_endDate]);
		//$("#filter_summary > div:not(.explore_dates)").removeClass('visible');

		$("#filter_summary").removeClass('visible');

		updateURL();

		motusMap.setVisibility();

	})
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

	$((exploreType == 'main' || true ? "#explore_filters" : "#exploreContent") + " select").select2({
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
	//console.log(timeline);
	$("#explore_filters input.filter_dates").daterangepicker({
		opens: 'left',
		minDate: moment.unix(timeline.min),
		maxDate: moment(),
		startDate: motusFilter.dtStart,
		endDate: motusFilter.dtEnd,
		locale: {
			format: "YYYY/MM/DD"
		},
        ranges: {
           'Today': [moment(), moment()],
           'Past 7 days': [moment().subtract(6, 'days'), moment()],
           'Past 30 days': [moment().subtract(29, 'days'), moment()],
           'Past 6 months':  [moment().subtract(6, 'months'), moment()],
           'Past year': [moment().subtract(1, 'year'), moment()],
           'Past 3 years': [moment().subtract(3, 'years'), moment()],
           'All time': [moment.unix(timeline.min), moment()],
           //'This Month': [moment().startOf('month'), moment().endOf('month')],
           //'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
	}, function(start, end, label) {

		timeline.setSlider( [ start, end.subtract(12, 'hours')], true );
		//timeline.setSlider( [ start.unix(), end.diff(start, 'days') > 0 ? end.unix() : start.unix() ] );
		motusMap.setVisibility();

	});
}


function loadDataTable(tbl, columns, options, onEvent) {

	/*

		This function loads a data table into a single element. It will reload data in this element each time it is run.
		tbl = name of the table you want to display
		filterVar = name of the variable you want to filter by

	*/


	if (typeof tbl !== 'string') {
		var dataset = tbl[1];
		tbl = tbl[0];
	} else {
		var dataset = motusData[tbl];
	}

	if ($("#explore_table").length == 0) {
		$("#exploreContent").append('<div class="explore-table-wrapper"><table id="explore_table" style="width:100%"></table></div>');
	}

	console.log(columns);
	var columnNames = columns.filter(x=>x==="").concat(Object.keys(dataset[0]).filter(x => typeof columns === 'undefined' || columns.includes(x)));

	var columns = [];
	console.log(tbl);
	console.log(columnNames);

	for (var i in columnNames) {
		columns.push({
			data: columnNames[i],
			title: dataColNames[tbl][columnNames[i]],
			className: ""
		});
	}
	if ($.fn.DataTable.isDataTable("#explore_table")) {
		$("#explore_table").DataTable().clear().destroy();
	}

	$("#explore_table").html("");
	console.log(options);
	if (typeof options !== 'undefined') {
		options = {
			...{
				data: dataset,
				columns: columns
			},
			...options
		};
	} else {
		options = {
			data: dataset,
			columns: columns
		};
	}
	console.log(options);
	var table = $("#explore_table").DataTable(options);

	if (typeof onEvent !== 'undefined') {
		if (typeof onEvent.length !== 'undefined') {
			onEvent.forEach(x => table.on(x.event, x.fun));
		} else {
			table.on(onEvent.event, onEvent.fun);
		}
	}

	if (exploreType != 'main') {
		motusFilter[exploreType].forEach(function(f) {addProfile(f, tbl)});
	} else {
		return false;
	}
}

function addProfile(profile_id, dataset) {

		dataset = typeof dataset === 'undefined' ? (exploreType == 'species' ? 'tagDeps' : exploreType) : dataset;

		var filterName = exploreType != 'species' && exploreType != 'regions' ? (exploreType != 'species' ? 'deployID' : 'id') : exploreType;


		if (dataset == 'stations') {
			/*
			if (typeof filters.options.stations[profile_id] === 'undefined') {
				profile_id = motusData.stationsByName.get(motusData.stations.filter(x=>x.id==profile_id)[0].name)[0].id;
				//console.log(profile_id);
			}

			var stationName = filters.options.stations[profile_id][0];
			var subset = motusData.stationsByName.get(stationName);*/
			motusFilter.stations = motusFilter.stations.concat([profile_id]).filter(onlyUnique);
			updateURL(true);

		} else if (dataset == 'projects') {

			motusFilter.projects = motusFilter.projects.concat([profile_id]).filter(onlyUnique);
			updateURL(true);

		} else if (dataset == 'regions') {
			motusFilter.regions = motusFilter.regions.concat([profile_id]).filter(onlyUnique);
			updateURL(true);
			return;
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

		}

		$("body").trigger('click');
}


function addExploreCard(card) {


	if (typeof card.data === 'object') {

		if ($("#explore_card_profile_" + card.id).length == 0) {

			var profiles_header = "";

			(exploreType == 'species' ? ['Map colour', 'Name', 'Animals', 'Projects', 'Stations', 'Conservation Status'] : (exploreType == 'regions' ? ['Map colour', 'Name', 'Animals', 'Species', 'Projects', 'Stations'] : (exploreType == 'projects' ? ['Map colour', 'Name', 'Animals', 'Species', 'Stations'] : ['Map colour', 'Name', 'Animals', 'Species', 'Last data', 'Status']))).forEach(function(x){profiles_header += "<th class='"+(x.toLowerCase().replace(' ','-'))+"'>"+x+"</th>";});

			if ($("#explore_card_profiles").length == 0) {
				$("#exploreContent .explore-card-wrapper").append("<div class='explore-card' id='explore_card_profiles'><div class='explore-card-profiles-name'>"+card.name+"</div><table><thead><tr class='explore-card-profiles-header'>"+profiles_header+"<th></th></tr></thead><tbody class='explore-card-profiles-wrapper'></tbody></table><div class='explore-card-add explore-card-"+exploreType+"' alt='Add a "+exploreType+"'><select class='explore-card-add-"+exploreType+"' data-placeholder='Select a "+exploreType+"' style='width:300px;'><option></option></select></div><div class='explore-card-profiles-controls'></div></div>");
				$(".explore-card-profiles-controls").append("<button class='explore-card-more-details'>More details</button>"+
																										"<button class='explore-card-profiles-download-pdf'>Download PDF report</button>"+
																										"<button class='explore-card-profiles-download-pdf'>Download summary data</button>");
				$(".explore-card-profiles-download-pdf").click(function(){$(".explore-map-"+dataType+"-pdf input[type=button]").trigger('click');});
				$(".explore-card-more-details").click(function(){detailedView=true;exploreRegions(motusFilter.regions)});
			}

			var toAppend = "<tr class='explore-card-profile' id='explore_card_profile_" + card.id + "'>"+

								//"<br/>"+

								"<td class='explore-card-image tips enlarge' alt='Click to expand'>"+

							//	'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/></svg>'+

								"</td>"+

								"<td class='explore-card-header'>" + card.name + "</td>";

						//		"<td class='explore-card-status'>";

			for (s in card.status) {
				var title = s == 'conservation' ? 'Conservation<br>status' :
						   (s == 'lastData' ? 'Last Data' :
						   (s.indexOf('ID') != -1 ? s.replace('ID', ' ID') : firstToUpper(s)));

				var icon = (s == 'lastData' ? icons[s] :
						   (s == 'species' ? icons[s] :
						   (s == 'tags' ? icons[s] : '')));

				var statusText = card.status[s][0];
				statusText = s == 'status' ? (statusText != 'active' ? 'Inactive' : 'Active') : statusText;

				toAppend += "<td><div class='status-icon status-icon-" + s + (s == 'conservation' ? ' tips' : (s == 'status' ? ' status-icon-'+(statusText.toLowerCase()) : '')) + "'>"+ icon +"<div>"+ statusText + (s == 'lastData' ? '<div>days</div>' : '') + "</div></div></td>";
			}

			toAppend += "<td class='explore-card-options'>"+
			//toAppend += "</td><td class='explore-card-options'>"+
							"<div class='explore-card-remove explore-card-subtext' alt='Remove "+exploreType+"'>"+'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/></svg>'+"</div></td>"+
						"</tr>";

			$("#explore_card_profiles .explore-card-profiles-wrapper").append(toAppend)
		//	if ($(".explore-card-add").length > 0) {$(".explore-card-add").before(toAppend);}

		//	else {$(".explore-card-map").before(toAppend);}

			card.el = $("#explore_card_profile_" + card.id).get(0);
			/*
			if ($.fn.DataTable.isDataTable("#explore_table")) {
				$("#explore_card_profiles table").DataTable().clear().destroy();
			}*/


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

			if ($("#exploreContent .explore-card-profile").length == 1) {
				$("#explore_card_profiles").addClass('solo-card');
				try { motusMap.setColour('id'); }
				catch(err) { console.log("motusMap not yet created"); }
			} else {
				$("#explore_card_profiles").removeClass('solo-card');
				try { motusMap.setColour('species'); }
				catch(err) { console.log("motusMap not yet created"); }
			}
		} else {
			$("#explore_card_profile_" + card.id).addClass('flash')
			setTimeout('$("#explore_card_profile_' + card.id + '").removeClass("flash");',250);
		}
	}
	else if (card.data == 'custom') 	{
		var toAppend = "<div class='explore-card explore-card-"+card.type+"' id='explore_card_"+card.type+"'>"+card.html+"</div>";
		if (card.attachEl) {
			$(card.attachEl)[card.attachMethod](toAppend);
		} else {
			$(".explore-card-wrapper").append(toAppend);
		}
	}
	else if ( card.data == 'tabs' ) {

		// If a default is set use that one, otherwise use the first
		var selectedTab = ( typeof card.defaultTab !== 'undefined' ) ? card.defaultTab : Object.keys(card.tabs)[0];

		// Make the header with a select input instead of plain text
		var exploreCardHeader = $("<div class='explore-card-header'><select style='width:100%;'></select></div>");

		// Add an option for each tab
		for (t in card.tabs) {
			exploreCardHeader.find('select').append( $("<option></option>").val(t).text(card.header + ' ' + t).attr('selected', (selectedTab == t ? 'selected' : false) ) );
		}

		// Make the explore card and append the header to it
		var exploreCard = $("<div></div>")
			.addClass("explore-card explore-card-" + card.data)
			.attr('id', 'explore_card_' + card.type)
			.append( exploreCardHeader );

		if (typeof card.colSpan !== 'undefined') {
			exploreCard.addClass('explore-card-full-width');
		}

		// Append the explore card to the wrapper
		if ( card.attachEl ) {
			$( card.attachEl )[ card.attachMethod ]( exploreCard );
		} else {
			$(".explore-card-wrapper").append( exploreCard );
		}

		// Make select in header a select2 object
		$('#explore_card_' + card.type + ' .explore-card-header select').select2()
			.change(switchTabs);

		function switchTabs() {card.tabs[this.options[this.selectedIndex].value](card.type);}

		card.tabs[ selectedTab ]( card.type );

	}
	else if (card.data == 'chart') {

		var toAppend = "<div class='explore-card explore-card-"+card.data+"' id='explore_card_"+card.type+"'><div class='explore-card-header'></div><div class='explore-card-chart-wrapper'><div><svg></svg></div></div></div>";

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
				$("#exploreContent .explore-card-add-" + exploreType).append('<option value="' + d + '" class="filter-option-' + filters.options[exploreType][d][1] + '">' + filters.options[exploreType][d][0] + '</option>');
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
	if ($("#exploreContent .explore-card-profile").length == 0) {
		$(".explore-card-add").trigger('click');
	} else {
		if (exploreType == 'regions') {updateURL(true);}

		if ($("#exploreContent .explore-card-profile").length == 1) {
			$("#explore_card_profiles").addClass('solo-card');
			//motusMap.setColour('id');
		}
	}
	motusMap.setVisibility();
	updateData();
}
function setCardColours(colourFun) {

	$("#explore_card_profiles  .explore-card-profile").each(function(){
	//	if ($("#explore_card_profiles .explore-card-profile").length == 1) {
	//		$(this).find('.explore-card-image').css('border-color', "#000000");
	//	} else {
			 var colour = exploreType == 'stations' ? colourFun($(this).find(".explore-card-header").text()) : exploreType == 'regions' ? colourFun( this.id.replace("explore_card_profile_", "") ) : colourFun(parseInt(this.id.replace("explore_card_profile_", "")));

			 $(this).find('.explore-card-image').css({'border-color':colour,'background-color':colour})
		//}

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
		console.log(filterName + ": " + newFilter);
		newFilter = newFilter.length == 0 ? ['all'] : (filterName == 'status' && newFilter == 'inactive' ? ['terminated','expired','pending'] : newFilter);

		motusFilter[filterName] = newFilter;

		var displayText = motusFilter[filterName].map(v => $("#filter_" + filterName + " option[value='" + v + "']").text());


		updateData();
	//	$("#filter_summary > div.explore_" + filterName + ":not(.visible)").addClass('visible');
	//	$("#filter_summary > div.clear_filters:not(.visible)").addClass('visible');
	//	$("#filter_summary > div.explore_" + filterName + " > span").text(displayText.join(', '));

	}
	//console.log(motusFilter);
	if (Object.keys(motusFilter).every(function(k) {return ['dtStart', 'dtEnd', 'colour', 'regions'].includes(k) || motusFilter[k].includes('all');}) && motusFilter.dtStart == default_startDate && motusFilter.dtEnd == default_endDate) {
		$("#explore_filters").parent(".active").removeClass('active');
	} else {
		$("#explore_filters").parent(":not(.active)").addClass('active');
	}

	return false;
}



function viewSolo(profile_id) {
	console.log("#explore_card_profile_"+profile_id);
	$("#explore_card_profiles .explore-card-profile:not(#explore_card_profile_"+profile_id+")").hide();
	$("#explore_card_profile_"+profile_id).show();
	$("#explore_card_profiles").addClass('solo-card view-solo');
}

function updateData() {

	if (exploreType != 'main') {
		if ($("#exploreContent .explore-card-profile").length == 1) {
			$("#explore_card_profiles").addClass('solo-card');
			try { motusMap.setColour('id'); }
			catch(err) { console.log("motusMap not yet created"); }
		} else {
			$("#explore_card_profiles").removeClass('solo-card');
			try { motusMap.setColour(exploreType=='stations' ? 'name' :'species'); }
			catch(err) { console.log("motusMap not yet created"); }
		}

	}

	motusMap.setVisibility();

	updateURL();

}
