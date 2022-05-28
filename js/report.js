filterTable/*


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

var logos = {

	motus: "images/motus-logo-lg.png",
	birdsCanada: "images/birds-canada-logo.png"

};
var default_tableOpts = {
	dom: "Bipt",
	"language": {
		"info": "Showing _TOTAL_ entries",
		"infoEmpty": "Showing 0 entries",
		"infoFiltered": "",
	},
	buttons: [
		'copy',
		'csv'
	],
};
var timeRange = {};

(function(){
	dtLims2 = function(){

		function dateLimits(){
				dateLimits.min = dateLimits.getMinDate();
				dateLimits.max = dateLimits.getMaxDate();
				return dateLimits;
		};

		dateLimits.getMinDate = function() {

				console.log("Get Min Date");
			if (typeof motusData.selectedStations !== 'undefined' && typeof motusData.selectedAnimals !== 'undefined') {
				return d3.min([d3.min(motusData.selectedStations, x => x.dtStart), d3.min(motusData.selectedAnimals, x => x.dtStart)]);
			} else if (typeof motusData.selectedStations !== 'undefined') {
				return d3.min(motusData.selectedStations, x => x.dtStart);
			} else if (typeof motusData.selectedAnimals !== 'undefined') {
				return d3.min(motusData.selectedAnimals, x => x.dtStart);
			} else if (typeof motusData.stations !== 'undefined' && typeof motusData.animals !== 'undefined') {
				return d3.min([d3.min(motusData.stations, x => x.dtStart), d3.min(motusData.animals, x => x.dtStart)]);
			} else if (typeof motusData.stations !== 'undefined') {
				return d3.min(motusData.stations, x => x.dtStart);
			} else if (typeof motusData.animals !== 'undefined') {
				return d3.min(motusData.animals, x => x.dtStart);
			} else {
				return new Date();
			}

		}

		dateLimits.getMaxDate = function() {
			console.log("Get Max Date");
			if (typeof motusData.selectedStations !== 'undefined' && typeof motusData.selectedAnimals !== 'undefined') {
				return d3.max([d3.max(motusData.selectedStations, x => x.dtEnd), d3.max(motusData.selectedAnimals, x => x.dtEnd)]);
			} else if (typeof motusData.selectedStations !== 'undefined') {
				return d3.max(motusData.selectedStations, x => x.dtEnd);
			} else if (typeof motusData.selectedAnimals !== 'undefined') {
				return d3.max(motusData.selectedAnimals, x => x.dtEnd);
			} else if (typeof motusData.stations !== 'undefined' && typeof motusData.animals !== 'undefined') {
				return d3.max([d3.max(motusData.stations, x => x.dtEnd), d3.max(motusData.animals, x => x.dtEnd)]);
			} else if (typeof motusData.stations !== 'undefined') {
				return d3.max(motusData.stations, x => x.dtEnd);
			} else if (typeof motusData.animals !== 'undefined') {
				return d3.max(motusData.animals, x => x.dtEnd);
			} else {
				return new Date();
			}

		}

		dateLimits.min = typeof dateLimits.min === 'undefined' ? dateLimits.getMinDate() :
			typeof dateLimits.min.getTime === 'undefined' || isNaN(dateLimits.min.getTime()) ? dateLimits.getMinDate() :
			typeof dateLimits.min === 'string' && isNaN(new Date(dateLimits.min).getTime()) ? dateLimits.getMinDate() :
			typeof dateLimits.min === 'string' && !isNaN(new Date(dateLimits.min).getTime()) ? new Date(dateLimits.min) :
			dateLimits.min;

		dateLimits.max = typeof dateLimits.max === 'undefined' ? dateLimits.getMaxDate() :
			typeof dateLimits.max.getTime === 'undefined' || isNaN(dateLimits.max.getTime()) ? dateLimits.getMaxDate() :
			typeof dateLimits.max === 'string' && isNaN(new Date(dateLimits.max).getTime()) ? dateLimits.getMaxDate() :
			typeof dateLimits.max === 'string' && !isNaN(new Date(dateLimits.max).getTime()) ? new Date(dateLimits.max) :
			dateLimits.max;

		return dateLimits;
	}
})();

var URLdataType = null,
	URLmapType = null;

var reportStep = 1;
/*

function updateURL(reload) {

	var stateToPush = 'e=' + (exploreType) + '&d=' + (dataType),
		toEncode;

	for (f in motusFilter) {
		if (typeof motusFilter[f] !== 'undefined' && f != 'default') {
			if (motusFilter[f][0] != 'all' &&
				(!f.includes("selected")) &&
				(f != 'dtStart' || motusFilter.dtStart.toISOString().substr(0,10) != default_startDate.toISOString().substr(0,10)) &&
				(f != 'dtEnd' || motusFilter.dtEnd.toISOString().substr(0,10) != default_endDate.toISOString().substr(0,10))
				) {
				if (['dtStart','dtEnd'].includes(f)) {
					toEncode = motusFilter[f].toISOString().substr(0,10);
				} else  {
					toEncode = motusFilter[f];
				}
				if ( f == 'selections' ||
						( motusFilter.default && motusFilter.default[f] != motusFilter[f] && ['dtStart','dtEnd', 'colour'].includes(f) ) ||
						!( !['dtStart','dtEnd', 'colour', 'group'].includes(f) && motusFilter.default && motusFilter.default[f] && motusFilter.default[f].sort().join(',') == motusFilter[f].sort().join(',') )
						) {
					stateToPush+='&'+f+'='+encodeURIComponent(toEncode.constructor.name == "Array" ? toEncode.filter(onlyUnique) : toEncode);
				}
			}
		}

	}
//	console.log("URL length: ", stateToPush.length);
//	stateToPush = (compressString(stateToPush));
//	console.log("URL length: ", stateToPush.length);
//	stateToPush = encodeURIComponent((stateToPush));
//	console.log("URL length: ", stateToPush.length);

	stateToPush = "#" + stateToPush;

	if (reload === true) {
		window.location.href = stateToPush;
		$('.explore-card-wrapper').animate({'opacity':0}, 500, function(){location.reload();});

	}
	else {
		window.history.pushState("", document.title, stateToPush);
	}


}

function detectNavigation() {

	var url_params = getSearchParameters( window.location.hash.substr(1) );

	if (typeof exploreType === "undefined") {
		// Define the explore view
		//  exploreType defaults to "main" if not present in expected set of values
		exploreType = "report";
	}

	if (typeof dataType === "undefined") {
		// Define the main dataset being explore
		//  dataType defaults to null if not present in expected set of values
		dataType = url_params.d !== undefined && dataTypes.includes(firstToUpper(url_params.d)) ? url_params.d : 'stations';
	}

	if ( 	(typeof url_params.e !== 'undefined' && url_params.e !== exploreType)	||
				(typeof url_params.d !== 'undefined' && url_params.d !== dataType )				) {

		$('.explore-card-wrapper').animate({'opacity':0}, 500, function(){location.reload();});

	} else if (	url_params.d === undefined 																									||
							!dataTypes.includes(firstToUpper(url_params.d))															||
							url_params.e === undefined 																									||
							(!dataTypes.includes(firstToUpper(url_params.e)) && url_params.e != 'main' && url_params.e != 'report')			) {

		window.location.href=`#e=${exploreType}&d=${dataType}`;
		$('.explore-card-wrapper').animate({'opacity':0}, 500, function(){location.reload();});

	} else if (url_params.d != url_params.e && url_params.e != 'main' && url_params.e != 'report') {

		window.location.href=`#e=report&d=${dataType}`;
		$('.explore-card-wrapper').animate({'opacity':0}, 500, function(){location.reload();});

	}

	motusFilter = {
		dtStart: url_params.dtStart === undefined || url_params.dtStart.length == 0 ? motusFilter.dtStart : new Date(url_params.dtStart),
		dtEnd: url_params.dtEnd === undefined || url_params.dtEnd.length == 0 ? motusFilter.dtEnd : new Date(url_params.dtEnd),
		species: url_params.species === undefined || url_params.species.length == 0 ? ["all"] : url_params.species.split(','),
		animals: url_params.animals === undefined || url_params.animals.length == 0 ? ["all"] : url_params.animals.split(','),
		regions: url_params.regions === undefined || url_params.regions.length == 0 ? ["all"] : url_params.regions.split(','),
		projects: url_params.projects === undefined || url_params.projects.length == 0 ? ["all"] : url_params.projects.split(','),
		stations: url_params.stations === undefined || url_params.stations.length == 0 ? ["all"] : url_params.stations.split(','),
		status: url_params.status === undefined || url_params.status.length == 0 ? ["all"] : url_params.status.split(','),
		selections: url_params.selections === undefined || url_params.selections.length == 0 ? url_params[dataType] === undefined ? [] : url_params[dataType].split(',') : url_params.selections.split(','),
		frequencies: url_params.frequencies === undefined || url_params.frequencies.length == 0 ? ["all"] : url_params.frequencies.split(','),
		group: url_params.group === undefined || url_params.group.length == 0 ? [] : url_params.group,
		colour: url_params.frequencies === undefined || url_params.frequencies.length == 0 ? [] : url_params.colour
	};
	if (motusFilter[dataType].includes('all') && motusFilter.selections.length > 0) {
//		motusFilter[dataType] = motusFilter.selections;
	//} else if ( !motusFilter.selections.every( x => motusFilter[dataType].includes(x))) {
//		motusFilter[dataType].concat( motusFilter.selections.filter( x => !motusFilter[dataType].includes(x) ) );
	}


	if (motusMap.setVisibility) {
		motusMap.setVisibility();
	}
}*/

var filePrefix;

$(document).ready(function(){

//	$('.explore-card-wrapper').css({'opacity':0});

	testTimer.push([new Date(), "Startup"]);

	// Are we on a mobile device?
	isMobile = window.mobileCheck();

	$('body').toggleClass("touch", isMobile)

	//	Get URL parameters
	detectNavigation();

	// For Development:
	// get file prefix
	filePrefix =  window.location.hostname.includes('motus.org') ? "https://" + window.location.hostname + "/dashboard/data/" : "data/";
	imagePrefix =  window.location.hostname.includes('motus.org') ?
										window.location.pathname.includes("dashboard-beta") ?
											"https://" + window.location.hostname + "/wp-content/themes/dashboard_template/images/" :
												"https://" + window.location.hostname + "/dashboard/images/" : "images/";
	mapFilePrefix = window.location.hostname == 'localhost' || window.location.hostname == 'leberrigan.github.io' ? 'data/' : "https://" + window.location.hostname + "/dashboard/maps/";
	// Change the document title based on the view and data type
	document.title = "Motus Report - " + (exploreType == 'main' ? ( "Explore " + firstToUpper(dataType) ) : ( firstToUpper(exploreType) + " summary" ) );

	// Capture any changes in URL
	window.onhashchange = detectNavigation;
	// For Development:
	// Fix Wordpress URL
	if (exploreType == 'main' && window.location.hostname != 'localhost' && window.location.hostname != 'leberrigan.github.io') {window.location.href="#e=main&d="+dataType;}

	// Set the default start and end dates
	default_startDate = dtLims.min;
	default_endDate = dtLims.max;


//	getMotusData( ["stations"] );
	getMotusData(  );

});

function loadDashboardContent() {


	addReportControls();

	motusData.stationDepsByRegions = d3.group(motusData.stationDeps, d => d.country);
	motusData.stationDepsByProjects = d3.group(motusData.stationDeps, d => d.project);
	motusData.animalsByRegions = d3.group(motusData.animals, d => d.country, d => d.id);
	motusData.animalsByProjects = d3.group(motusData.animals, d => d.project, d => d.id);
	motusData.regionByCode = d3.group(motusData.regions,  d => d.ADM0_A3);

	motusTable.el = "exploreTable";


	testTimer.push([new Date(), "Get selections"]);
	if (motusFilter.selections.length > 0) {
		toggleLoadingOverlay(true);
		getSelections().then(()=>{updateSelectionStatus();displayReportPreview();loadReportStep(4)});

		reportStepVisibility();
	} else {
		console.log("TEST")
		loadReportStep(1);

		reportStepVisibility();
	}

	$(".loader").addClass("hidden");
/*
	populateExploreControls();

	initiateTooltip();

	initiatePopup();

	initiateLightbox();


	populateSelectOptions();

	exploreMap({containerID: 'explore_map'});

	motusMap.regionColours = d3.scaleOrdinal().domain(["166.380 MHz", "151.50 MHz", "150.10 MHz", "none"]).range(["#66c2a5","#fc8d62","#8da0cb","#999999"]);

	if (exploreType != 'main') {

		addExploreProfilesWrapper();

		testTimer.push([new Date(), "Get selections"]);

		// References indexeddb
		getSelections().then( () => {
			// Set the default timeline date limits
			timeRange.min = dtLims.min;
			timeRange.max = dtLims.max;
			// Load map objects (will be replaced?)
			loadMapObjects();
			// Add the tab menu item for the map
			addExploreTab('explore-card-map', 'Map', {selected: true, icon: icons.map});
			// Add the explore profiles
			exploreSummary();

		} );

	} else {
		loadMapObjects();
	}

	if (["stations","animals","regions", "species", "projects"].includes(dataType)) {
//		setTimeout(function(){},1)
	} else {
		exploreTable({containerID: 'explore_table', name: dataType, data: motusData[dataType]});
	}
*/

}


function updateSelectionStatus() {

	if (!testTimer.some( x=>x[1] == "Done")) {
		testTimer.push([new Date(), "Done"]);

		testTimer.forEach( (x,i) => {
			var text = i == 0 ? "Begin" : testTimer[i-1][1];
			x[2] = i == 0 ? 0 : x[0] - testTimer[i-1][0];
			console.log(`${text}: ${x[2]}`);
			if (i == testTimer.length - 1) {
				console.log(`Total: ${d3.sum(testTimer, t => t[2])}`);
			}
		});
	}

	if (motusMap.highlightSelections) motusMap.highlightSelections();
	if (motusFilter.selections.length > 0) {

		$(".explore-report-selectionStatus .status-value").each(function(){

			var dataVar = this.parentElement.attributes["--data-var"].value;

			if (dataVar == dataType) {
				$(this).parent().toggleClass("selected",true);
			} else {$(this).parent().removeClass("selected");}

			if (['selectedDtStart', 'selectedDtEnd'].includes(dataVar)) {
				$(this).text( motusFilter[dataVar] ? motusFilter[dataVar].toISOString().substr(0,10) : "" );
			} else {
				$(this).text( motusData[dataVar] ? motusData[dataVar].length : "" );
			}
		});

		$(".explore-report-selectionStatus.no-data").removeClass("no-data");

	} else {

			$(".explore-report-selectionStatus:not(.no-data)").addClass("no-data");
	}

	toggleLoadingOverlay(false);

}

function exploreMapTableToggleView(showMap) {
	$(".explore-report-control-wrapper .report-control-buttons small span").text(showMap?"map":"table");
	console.log("LOADED: %s", showMap?"map":"table")
	$(".explore-report-control-wrapper .report-control-timeline").toggleClass("hidden", !showMap);
	if (showMap) {
		$(`#${motusTable.el}, #exploreTable`).toggleClass("hidden", true);

			if (typeof deckGlLayers !== 'undefined' && Object.keys(motusMap).length > 0 ) {
				console.log('show map');
			  $(`#${motusMap.el}`).toggleClass("hidden", false).show();

			} else {
				console.log('create map');
				exploreMap({containerID: 'exploreMap'});

			}
		loadMapObjects();
		$(".explore-report-control-wrapper .report-control-buttons .toggle_view").text("View a table instead");
	} else {	// Show Table!

		$(`#${motusMap.el}, #exploreMap`).toggleClass("hidden", true);
		exploreTable("exploreTable", undefined, true);
		$(".explore-report-control-wrapper .report-control-buttons .toggle_view").text("View a map instead");
	}
}

function reportAddSelection(profileType, dataID, toggle) {

	if ( ( toggle!="add" && $(".report-control-selections select").val().includes(dataID) ) || toggle == "remove") {
		$(".report-control-selections select").val($(".report-control-selections select").val().filter( x => x!=dataID )).trigger("change");
	} else if (toggle != "remove") {
		$(".report-control-selections select").val($(".report-control-selections select").val().concat(dataID)).trigger("change");
	}
}

function updateTableSelections( selections ) {

	var rowsSelected = motusTable.dt.rows({selected: true}).data().pluck("id").toArray();
	var rowsToSelect = selections.filter( x => !rowsSelected.includes(x) );
	var rowsToDeselect = rowsSelected.filter( x => !selections.includes(x) );
	//console.log("rowsToSelect: %o, rowsToDeselect: %o", rowsToSelect,rowsToDeselect)
	console.log("selections: %o, rowsSelected: %o", selections,rowsSelected)
	if (rowsToSelect.length > 0)
		motusTable.dt.rows( (i,d) => rowsToSelect.includes(d.id) ).select();
	if (rowsToDeselect.length > 0)
		motusTable.dt.rows( (i,d) => rowsToDeselect.includes(d.id) ).deselect();
}

function updateMapSelections( selections ) {


}

function addReportControls() {

	////////////////////////////////////
	// dataType
	$(".explore-report-control-wrapper .report-control-datatype").html("<select></select>");

	$(".explore-report-control-wrapper .report-control-datatype select").select2({
		data: dataTypes.map( x => ({id: x.toLowerCase(), text:x }) ),
		matcher: select2Matcher,
		templateResult: select2TemplateResult,
		width: "100%",
		placeholder: select2Placeholder,
		templateSelection: (state) => {return "Search by: "+state.text;}
	}).change(function(){
		if( dataType != this.value ) {
			$(".report-status-text").text("");
			toggleLoadingOverlay(true);
			dataType = this.value;
			setTimeout(()=>{
				updateURL();
				addReportControls();
				loadReportStep(1);
				timeRange.min = dtLims.min;
				timeRange.max = dtLims.max;
				if (["stations", "animals", "regions"].includes(dataType)) {
					exploreMapTableToggleView(true);
					loadMapObjects();
				} else if (["species", "projects"].includes(dataType)) {
					exploreMapTableToggleView(false);
				}
			}, 250);
		} else {
			if (["stations", "animals", "regions"].includes(dataType) && Object.keys(motusMap).length == 0) {
				exploreMapTableToggleView(true);
			} else if (["species", "projects"].includes(dataType) && !motusTable.dt ) {
				exploreMapTableToggleView(false);
			}
		}
	}).val(dataType);

	////////////////////////////////////
	// selections

	$(".explore-report-control-wrapper .report-control-selections").html(`<select multiple data-placeholder='Select ${dataType}'></select>`);


	if (dataType == 'animals') {
		motusData.animals.forEach( x=> {
		    let species = motusData.species.filter( sp => sp.id == x.species);
		    x.name = typeof species === 'object' && species.length > 0 ? species[0][currLang] : "Unknown species";
		} );
		var selectionsData = motusData.animals.map( x => ({id: x.id, text: `${x.name} #${x.id}` }) );
	} else {
		var textVar = dataType == 'species' ? currLang : dataType == 'regions' ? "country" : "name";
		var selectionsData = motusData[dataType].map( x => ({id: x.id, text:x[textVar] }) );
	}

	$(".explore-report-control-wrapper .report-control-selections select").select2({
		data: selectionsData,
		templateResult: select2TemplateResult,
		width: "100%",
		placeholder: select2Placeholder,
		minimumInputLength: selectionsData.length > 10e3 ? 3 : 0
	}).change(function(e){

		motusFilter.selections = $(e.target).val();

		$(".report-status-text").text("");

		toggleLoadingOverlay(true);

		getSelections().then(updateSelectionStatus);
		if (typeof motusTable.dt !== 'undefined') {
			updateTableSelections($(".report-control-selections select").val());
		}
		updateMapSelections($(".report-control-selections select").val());

		updateData();

	});

	////////////////////////////////////
	// Section header

	$(".section-header").click(function(){
		if (!$(this).hasClass("selected")) {
			loadReportStep( parseInt(this.classList[this.classList.length - 1].replace("report-step","")) );
		}
	})

	////////////////////////////////////
	// Control buttons


	$(".explore-report-control-wrapper .report-control-buttons").html(
		"<div class='report-step report-step1'>"+
			" <button class='reset_btn' style='margin-left:10px;'>Deselect all</button>"+
			" <button class='next_btn dark_btn'>Step 2: Refine selections &gt;&gt;</button>"+
			"<small class='report-status-text' style='margin-left:20px;'></small>"+
		"</div>"+
		"<div class='report-step report-step1'>"+
			"<button class='toggle_view'>View a table instead</button>"+
			"<small style='color:#777;margin-left:20px;'><i>You may also make selections using the <span>map</span> below</i></small>"+
		"</div>"+
		"<div class='report-step report-step2'>"+
			" <button class='reset_btn' style='margin-left:10px;'>Reset filters</button>"+
			" <button class='prev_btn'>&lt;&lt; Back</button>"+
			" <button class='next_btn dark_btn'>Step 3: Format report &gt;&gt;</button>"+
			"<small class='report-status-text' style='margin-left:20px;'></small>"+
		"</div>"+
		"<div class='report-step report-step3'>"+
			" <button class='annual_reports toggleButton'>Report years separately</button>"+
			" <button class='quarterly_reports toggleButton' disabled='disabled'>Split years into quarters</button>"+
			" <button class='latest_period_only toggleButton' disabled='disabled'>Only report the latest period</button>"+
			" <br/>"+
			(
				["animals", "species"].includes(dataType) ? " " :
				" <button class='show_species_table toggleButton selected'>Include a table of species for each "+toSingular(dataType)+"</button>"
			)+
			(
				dataType == "stations" ? " " :
				" <button class='show_stations_table toggleButton selected'>Include a table of stations for each "+toSingular(dataType)+"</button>"
			)+
			" <br/>"+
			(
				["animals", "species"].includes(dataType) ? " " :
				" <button class='omit_zeros_species_table toggleButton selected'>Omit animals without any detections</button>"
			)+
			(
				dataType == "stations" ? " " :
				" <button class='omit_zeros_stations_table toggleButton selected'>Omit stations without any detections</button>"
			)+
		"</div>"+
		"<div class='report-step report-step3'>"+
			" <button class='prev_btn'>&lt;&lt; Back</button>"+
			" <button class='next_btn dark_btn'>Step 4: Create report &gt;&gt;</button>"+
			"<small class='report-status-text' style='margin-left:20px;'></small>"+
		"</div>"+
		"<div class='report-step report-step4'>"+
			" <button class='prev_btn'>&lt;&lt; Back</button>"+
			" <button class='restart_btn dark_btn'>Restart to select new data</button>"+
			"<small class='report-status-text' style='margin-left:20px;'></small>"+
		//	" <button class='submit_btn'></button>"+
		"</div>"
	);

	$(".explore-report-control-wrapper .report-control-buttons .toggle_view").click(function(){
		exploreMapTableToggleView($(`#${motusTable.el}`).is(":visible") );
	});

	$(".explore-report-control-wrapper .report-control-buttons .toggleButton").click(function(){
		$(this).toggleClass("selected");

		// Defer these actions until user clicks 'create report' button
		if ( $(this).hasClass("annual_reports") ) {
			// Make an annual report
			if ( !$(this).is(".selected") ) {
				$(this).siblings(".quarterly_reports,.latest_period_only").attr('disabled', true).removeClass('selected');
			} else {
				$(this)
					.siblings(".quarterly_reports")
						.attr('disabled', false)
						.toggleClass('selected',  $(this).siblings(".quarterly_reports").data("selected") === true );
				$(this)
					.siblings(".latest_period_only")
						.attr('disabled', false)
						.toggleClass('selected',  $(this).siblings(".latest_period_only").data("selected") === true );
			}
		} else if ( $(this).hasClass("quarterly_reports") || $(this).hasClass("latest_period_only") ) {
			// Make an quarterly report
			 $(this).data("selected", $(this).is(".selected"));
		}
	});


	$(".explore-report-control-wrapper .report-control-buttons .report-step .next_btn").click(nextReportStep);
	$(".explore-report-control-wrapper .report-control-buttons .report-step .prev_btn").click(prevReportStep);

	$(".explore-report-control-wrapper .report-control-buttons .report-step1 .next_btn").click(function(){

		// See if there's enough data to make a reports
		var err = false;
		var warn = false;
		var msg = false;
		if (!motusFilter.selections) {

			err = "You must make a selection first";

		} else if (motusData.selectedStations.length == 0) {

			err = "There are no stations or detections associated with your selection";

		} else if (motusData.selectedAnimals.length == 0) {

			err = "There are no animals or detections associated with your selection";

		} else if (motusData.tracksLongByAnimal.length == 0) {

			warn = "There are no detections associated with your selection. Are you sure you want to make a report?";

		}

		if (warn) {
			console.warn("Warning: %s", warn);
			$(".report-status-text").text(warn).css("color", "#FA0");
		}
		if (err) {
			console.error("Error: %s", err);
			$(".report-status-text").text(err).css("color", "#A00");
			prevReportStep();
		}

	});
	$(".explore-report-control-wrapper .report-control-buttons .report-step4 .restart_btn").click(function(){loadReportStep(1);});
	$(".explore-report-control-wrapper .report-control-buttons .report-step3 .next_btn").click(function(){
		if (!displayReportPreview()) {
			prevReportStep();
		}
	});

	$(".explore-report-control-wrapper .report-control-buttons .report-step1 button.reset_btn").click(function(){
		if (motusFilter.selections.length > 0) {
			resetMotusFilter();
		}
	});
	$(".explore-report-control-wrapper .report-control-buttons .report-step2 button.reset_btn").click(function(){
		resetMotusFilter("not selected");
	});



	////////////////////////////////////
	// Selection status

		$(".explore-report-selectionStatus").html( getSelectionStatusDOM() );

		$(".explore-report-selectionStatus .status-selection").click( selectionStatusPopup );

	// Timeline

	$(".explore-report-control-wrapper .report-control-timeline").html("<div id='dateSlider'>"+
																																					"<div class='slider visible'><div id='custom-handle-1' class='ui-slider-handle'></div><div id='custom-handle-2' class='ui-slider-handle'></div></div>"+
																																				"</div>");


	exploreTimeline({ min: dtLims.min.valueOf() / 1000,
										max: dtLims.max.valueOf() / 1000,
										defaultValues: [ motusFilter.dtStart.valueOf() / 1000, motusFilter.dtEnd.valueOf() / 1000 ],
									 	height: 150
									});


	timeRange.min = dtLims.min;
	timeRange.max = dtLims.max;

	$(timeline.el).dragslider("option", { "min": timeline.min, "max": timeline.max});





	// Select the datatype
	$(".explore-report-control-wrapper .report-control-datatype select").trigger("change")

	// Make the selections if there are any
	if (motusFilter.selections) {
		$(".explore-report-control-wrapper .report-control-selections select").val(motusFilter.selections).trigger("change");
			timeline.createLegend();
	}


}


function nextReportStep() {
	// Deselect previous step header when going forwards
	reportStep++;
	reportStepVisibility();
}

function prevReportStep() {
	// Hide the next step header when going backwards
	reportStep--;
	reportStepVisibility();
}

function reportStepVisibility() {

	for (var step = 1; $(`.report-step${step}`).length > 0; step++) {
		$(`.report-step${step}`).css("display", "none");
		$(`.section-header.report-step${step}`).toggleClass("selected", false);
	}
	$(`.report-step${reportStep}`).css("display", "");
	$(`.section-header.report-step${reportStep}`).toggleClass("selected", true);

}

function loadReportStep( step ) {
	// Hide subsequent step headers when going backwards
	reportStep = step;
	reportStepVisibility();
}

function resetMotusFilter( options ) {

	Object.keys(motusFilter).forEach( x => {
		if (['dtStart','dtEnd'].includes(x)) {motusFilter[x] = new Date(timeline.position[['dtStart','dtEnd'].indexOf(x)] * 1000);}
		else if (
			(
				x.includes('select') ||
				['localAnimals', 'visitingAnimals', 'animalsDetected'].includes(x)
			) &&
			options != 'not selected'
		) {
			motusFilter[x] = [];
		} else if (
			!(
				x.includes('select') ||
				['localAnimals', 'visitingAnimals', 'animalsDetected'].includes(x)
			) &&
			x != 'colour'
		) {
			motusFilter[x] = ['all']
		}
	});

	$(".explore-report-control.report-control-selections select").val(motusFilter.selections).trigger("change")

	updateData();

}

function initializeDateRangePicker(el) {

		$(el).daterangepicker({
			opens: 'left',
			minDate: new Date(timeline.min * 1000),
			maxDate: new Date(),
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

			timeline.setSlider( [ start.unix(), end.subtract(12, 'hours').unix()], true, false );
			//timeline.setSlider( [ start.unix(), end.diff(start, 'days') > 0 ? end.unix() : start.unix() ] );

		});
}


function selectionStatusPopup( e ) {

	var dataVar = this.attributes["--data-var"].value;

	var popupText = "";
	var popupData = [];
	if (!['selectedDtStart', 'selectedDtEnd'].includes(dataVar) && motusData[dataVar].length == 0)
		return false;

	filterTable("Loading...", e)

	setTimeout( function(e, dataVar) {

			if (['selectedDtStart', 'selectedDtEnd'].includes(dataVar)) {
				popupText = motusFilter[dataVar] ? motusFilter[dataVar].toISOString().substr(0,10) : "";
				popupText = "<input type='test' class='filter_dates' />";
			} else {
				popupData = motusData[dataVar] ? getSelectionQuickList( dataVar ) : [{}];
				popupText = "<div class='report-refine'>"+
											"<table>"+
												"<thead><tr>" +
													"<th>Select</th>"+
													"<th>" + Object.keys(  popupData[0] ).map( x => camelToRegularText( x ).replace("I D", "ID") ).join("</th><th>") + "</th>"+
												"</tr></thead>"+
												"<tbody><tr class='selected'>" +
													"<td></td>"+
													popupData.map( d => "<td>" + Object.values( d ).join("</td><td>") + "</td>").join("</tr><tr class='selected'><td class='select-checkbox'></td>") +
												"</tr></tbody>"+
											"</table>"+
										"</div>";
			}

			filterTable(popupText, e);

			$("#filterTable table").DataTable({
				columnDefs: [ {
					orderable: false,
					className: 'select-checkbox',
					targets:   0
				} ],
				paging:false,
				select: {
					style: "multi"
				},
				dom: "fiB<'scroll-box't>",
		    "language": {
		      "info": "Showing _TOTAL_ entries",
					"infoEmpty": "Showing 0 entries",
					"infoFiltered": "",
		    },
				buttons: [
					'selectAll',
					'selectNone',
					{
						extend:'copy',
						title: camelToRegularText( dataVar )
					},
					{
						extend:'csv',
						title: camelToRegularText( dataVar )
					}
				],
				scrollY: "40vh",
				scrollCollapse: true,
		    order: [[ 1, 'asc' ]]
			}).rows({ page: 'all'}).select();

			setTimeout( function() {
				$("#filterTable table").DataTable()
				 .rows().invalidate('data')
				 .draw(false);
			}, 100)
		/*
			$("#filterPopup tbody tr").click( function(e) {
				e.stopPropagation();
				$(this).find("input[type=checkbox]").prop("checked", !$(this).find("input[type=checkbox]").prop("checked") );

				$(this).toggleClass("selected", $(this).find("input[type=checkbox]").prop("checked") )
			});
		*/
		if (['selectedDtStart', 'selectedDtEnd'].includes(dataVar)) {
			initializeDateRangePicker("#filterTable .filter_dates");
			$('.filter_dates').data('daterangepicker').show();
		}
	}, 10, e, dataVar)


}

function filterTable( content, event, location ) {

	if ($("#filterTable").length == 0) {
		$(".explore-report-control-wrapper").after("<div id='filterTable'><div class='table-content report-step2'></div></div>");
	}

	if (content && reportStep == 2) {

		$('#filterTable .table-content').html(content);
		initiateTooltip($('#filterTable .table-content .tips'));

		$('#filterTable:hidden').show();

	} else {
		$('#filterTable').hide();
	}


}
function getSelectionQuickList( dataVar, data ) {

	data = typeof data === "undefined" ? motusData[dataVar] : data;
	var toReturn = [];


	if (dataVar.toLowerCase().includes("stations")) {
		toReturn = data.map( d => ({id: d.id, name: d.name, firstDeployed: d.dtStart.toISOString().substr(0,10), project: d.project, currentStatus: d.status}) );
	} else if (dataVar.toLowerCase().includes("animals")) {
		toReturn = data.filter( d => d.dtStart && !isNaN(d.dtStart.valueOf()) ).map( d => ({deploymentID: d.id, tagID: d.tagID, name: d.name, firstDeployed: d.dtStart.toISOString().substr(0,10), project: d.project, frequency: d.frequency}) );
	} else if (dataVar.toLowerCase().includes("species")) {
		toReturn = data.map( d => ({name: d[currLang], latin: d.scientific, group: d.group}) )
	} else if (dataVar.toLowerCase().includes("projects")) {
		toReturn = data.map( d => ({ID: d.id, name: d.name, created: d.dtCreated, group: d.fee_id}) );
	}

	return toReturn;

}


function getSelectionStatusDOM() {

	if (dataType == "stations") {
		return "<div class='status-section'>"+
							`<div class="status-selection" --data-var="selectedStations">${icons.station}<div class='status-value'></div> stations</div>`+
							`<span class="inter-text">from</span>`+
							`<div class="status-selection" --data-var="selectedStationProjects">${icons.projects}<div class='status-value'></div> projects</div>`+
						"</div>"+
							`<span class="inter-text">have detected</span>`+
						"<div class='status-section'>"+
							`<div class="status-selection" --data-var="selectedAnimals">${icons.animals}<div class='status-value'></div> animals</div>`+
							`<span class="inter-text">of</span>`+
							`<div class="status-selection" --data-var="selectedSpecies">${icons.species}<div class='status-value'></div> species</div>`+
							`<span class="inter-text">from</span>`+
							`<div class="status-selection" --data-var="selectedAnimalProjects">${icons.projects}<div class='status-value'></div> projects</div>`+
						"</div>"+
						`<span class="inter-text">between</span>`+
						"<div class='status-section'>"+
							`<div class="status-selection" --data-var="selectedDtStart"><div class='status-value'></div></div>`+
							`<span class="inter-text">and</span>`+
							`<div class="status-selection" --data-var="selectedDtEnd"><div class='status-value'></div></div>`+
						"</div>";
	} else if (dataType == "animals") {
			return "<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedAnimals">${icons.animals}<div class='status-value'></div> animals</div>`+
								`<span class="inter-text">of</span>`+
								`<div class="status-selection" --data-var="selectedSpecies">${icons.species}<div class='status-value'></div> species</div>`+
								`<span class="inter-text">from</span>`+
								`<div class="status-selection" --data-var="selectedAnimalProjects">${icons.projects}<div class='status-value'></div> projects</div>`+
							"</div>"+
							`<span class="inter-text">have been detected by</span>`+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedStations">${icons.station}<div class='status-value'></div> stations</div>`+
								`<span class="inter-text">from</span>`+
								`<div class="status-selection" --data-var="selectedStationProjects">${icons.projects}<div class='status-value'></div> projects</div>`+
							"</div>"+
							`<span class="inter-text">between</span>`+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedDtStart"><div class='status-value'></div></div>`+
								`<span class="inter-text">and</span>`+
								`<div class="status-selection" --data-var="selectedDtEnd"><div class='status-value'></div></div>`+
							"</div>";
	} else if (dataType == "species") {
			return "<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedAnimals">${icons.animals}<div class='status-value'></div> animals</div>`+
								`<span class="inter-text">of</span>`+
								`<div class="status-selection" --data-var="selectedSpecies">${icons.species}<div class='status-value'></div> species</div>`+
								`<span class="inter-text">from</span>`+
								`<div class="status-selection" --data-var="selectedAnimalProjects">${icons.projects}<div class='status-value'></div> projects</div>`+
							"</div>"+
							`<span class="inter-text">have been detected by</span>`+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedStations">${icons.station}<div class='status-value'></div> stations</div>`+
								`<span class="inter-text">from</span>`+
								`<div class="status-selection" --data-var="selectedStationProjects">${icons.projects}<div class='status-value'></div> projects</div>`+
							"</div>"+
							`<span class="inter-text">between</span>`+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedDtStart"><div class='status-value'></div></div>`+
								`<span class="inter-text">and</span>`+
								`<div class="status-selection" --data-var="selectedDtEnd"><div class='status-value'></div></div>`+
							"</div>";
	} else if (dataType == "projects") {
			return "<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedProjects">${icons.projects}<div class='status-value'></div> projects</div>`+
								`<span class="inter-text"> including </span>`+
								`<div class="status-selection" --data-var="selectedStationProjects"><div class='status-value'></div> projects</div>`+
								`<span class="inter-text">with stations</span>`+
								`<div class="status-selection" --data-var="selectedAnimalProjects"><div class='status-value'></div> projects</div>`+
								`<span class="inter-text">with tagged animals</span>`+
							"</div>"+
							`<span class="inter-text">have detections between</span>`+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedDtStart"><div class='status-value'></div></div>`+
								`<span class="inter-text">and</span>`+
								`<div class="status-selection" --data-var="selectedDtEnd"><div class='status-value'></div></div>`+
							"</div>"+
							"<div class='flex-break'></div>"+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedLocalStations">${icons.station}<div class='status-value'></div> stations</div>`+
							"</div>"+
								`<span class="inter-text">in these projects have detected</span>`+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="visitingAnimals">${icons.animals}<div class='status-value'></div> animals</div>`+
								`<span class="inter-text">of</span>`+
								`<div class="status-selection" --data-var="visitingSpecies">${icons.species}<div class='status-value'></div> species</div>`+
							"</div>"+
							"<div class='flex-break'></div>"+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="localAnimals">${icons.animals}<div class='status-value'></div> animals</div>`+
								`<span class="inter-text">of</span>`+
								`<div class="status-selection" --data-var="localSpecies">${icons.species}<div class='status-value'></div> species</div>`+
							"</div>"+
							`<span class="inter-text">in these projects have been detected by</span>`+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedVisitingStations">${icons.station}<div class='status-value'></div> stations</div>`+
							"</div>";
	} else if (dataType == "regions") {
			return "<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedRegions">${icons.projects}<div class='status-value'></div> regions</div>`+
								`<span class="inter-text"> including </span>`+
								`<div class="status-selection" --data-var="selectedStationRegions"><div class='status-value'></div> regions</div>`+
								`<span class="inter-text">with stations</span>`+
								`<div class="status-selection" --data-var="selectedAnimalRegions"><div class='status-value'></div> regions</div>`+
								`<span class="inter-text">with tagged animals</span>`+
							"</div>"+
							`<span class="inter-text">have detections between</span>`+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedDtStart"><div class='status-value'></div></div>`+
								`<span class="inter-text">and</span>`+
								`<div class="status-selection" --data-var="selectedDtEnd"><div class='status-value'></div></div>`+
							"</div>"+
							"<div class='flex-break'></div>"+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedLocalStations">${icons.station}<div class='status-value'></div> stations</div>`+
							"</div>"+
								`<span class="inter-text">in these regions have detected</span>`+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="visitingAnimals">${icons.animals}<div class='status-value'></div> animals</div>`+
								`<span class="inter-text">of</span>`+
								`<div class="status-selection" --data-var="visitingSpecies">${icons.species}<div class='status-value'></div> species</div>`+
							"</div>"+
							"<div class='flex-break'></div>"+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="localAnimals">${icons.animals}<div class='status-value'></div> animals</div>`+
								`<span class="inter-text">of</span>`+
								`<div class="status-selection" --data-var="localSpecies">${icons.species}<div class='status-value'></div> species</div>`+
							"</div>"+
							`<span class="inter-text">in these regions have been detected by</span>`+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedVisitingStations">${icons.station}<div class='status-value'></div> stations</div>`+
							"</div>";
		}

}

function displayReportPreview() {

	// See if there's enough data to make a reports
	var err = false;
	var warn = false;
	var msg = false;
	if (!motusFilter.selections) {

		err = "You must make a selection first";

	}/* else if (motusData.selectedStations.length == 0) {

		err = "There are no stations or detections associated with your selection";

	}*/ else if (motusData.selectedAnimals.length == 0) {

		err = "There are no animals or detections associated with your selection";

	} else if (motusData.tracksLongByAnimal.length == 0) {

		warn = "There are no detections associated with your selection. Are you sure you want to make a report?";

	}

	if (warn) {
		console.warn("Warning: %s", warn);
		$(".report-status-text").text(warn).css("color", "#FA0");
	}
	if (err) {
		console.error("Error: %s", err);
		$(".report-status-text").text(err).css("color", "#A00");
		return false;
	} else {
		msg = `Making a report for ${motusFilter.selections.length} ${motusFilter.selections.length > 1 ? dataType : toSingular(dataType)}...`;
		console.log(msg);
		$(".report-step4 .report-status-text").text(msg).css("color", "#0A0");
	}

	// Hide the map and table
	$(`#${motusMap.el}:visible, #${motusTable.el}:visible`).hide();


	// If we are to split up data by time, how are we to do it?
	var splitTime =  $(".report-control-buttons .quarterly_reports").is(".selected") ? "quarterly" :
									$(".report-control-buttons .annual_reports").is(".selected") ? "annual" : false;


	if ( $("#exploreReport .report-controls").length == 0) {
		$("#exploreReport").html(
			"<div class='report-controls'>"+
				"<div class='section-header'>Report preview</div>"+
				" <button class='toggleButton shrink_btn'>Shrink pages</button>"+
				" <button class='toggleButton select_btn selected'>Select all</button>"+
				" <button class='submit_btn print_btn'>Print or save as PDF</button>"+
				"<div class='zoom-controls'>"+
					" <button class='close_btn closeZoom_btn'>Close zoom</button>"+
				"</div>"+
		"</div>");
		$("#exploreReport .closeZoom_btn").click(function(){$("#exploreReport, #exploreReport .report-page-wrapper").removeClass("zoomed");});
		$("#exploreReport .print_btn").click(function(){window.print();});
		$("#exploreReport .select_btn").click(function(){
			$(this).toggleClass("selected").removeClass('partial');
			if ($(this).is(".selected")) {
				$("#exploreReport .report-page-wrapper").toggleClass("selected", true);
			} else {
				$("#exploreReport .report-page-wrapper").toggleClass("selected", false);
			}
		})
		$("#exploreReport .shrink_btn").click(function(){
			$("#exploreReport").toggleClass("small", !$(this).hasClass("selected"));
			$(this).toggleClass("selected");
		})
	} else {
		$("#exploreReport .report-page-wrapper").remove();
	}

	var report = {
		header: `Motus ${firstToUpper(toSingular(dataType))} Report`,
		motusLogo: `<img src="${logos.motus}" alt="Motus Wildlife Tracking System" style="float:left;">`,
		birdsLogo: `<img src="${logos.birdsCanada}" alt="Birds Canada" style="float:right;">`,
		publicationDate: new Date().toISOString().substr(0, 10),
		pageIndex: 1
	}


	// Select the date intervals to loop through
	var dates = [motusFilter.selectedDtStart, motusFilter.selectedDtEnd];
	dates = splitTime == 'annual' ? [dates[0], d3.timeYears(dates[0], dates[1]), dates[1]].flat() :
					splitTime == 'quarterly' ? [dates[0], d3.timeMonths(dates[0], dates[1], 3), dates[1]].flat() :
					dates;

	console.log("Dates: ", dates)

	dates = $(".report-control-buttons .latest_period_only").is(".selected") ? [dates[dates.length - 3], dates[dates.length - 2]] : dates;

	console.log("Dates: ", dates)

	report.datePos = 0;
	report.intervalName = splitTime ? firstToUpper(splitTime) : "Full"; // How many months between the two dates?

	// Download the tracks for all the animals in the selection
	getSelectedTracksLongByAnimal( motusFilter.selectedAnimals ).then(function(response){

		motusData.tracksLongByAnimal = response;

		// Start an interval for creating the pages.
		// This provides the necesssary time to display the pages as they are loaded.
		// Otherwise the browser will freeze up.
		report.interval = setInterval(function(){


			// If there is more than one selection, start with a master summary
			if (motusFilter.selections.length > 1) {
				report = addReportSummaryPage(motusData[`selected${firstToUpper(dataType)}`], report, [dates[report.datePos], dates[report.datePos+1]]);
			}


			// Loop through each selection individually
			motusData[`selected${firstToUpper(dataType)}`].forEach((d) => {

				// Only make a report page if the station was deployed during the selected interval
				if (!(+d.dtEnd < dates[report.datePos] || +d.dtStart > dates[report.datePos+1])) {
					if ($(".report-control-buttons .show_species_table").is(".selected")) {
						report = addReportSelectionPage(d, report, [dates[report.datePos], dates[report.datePos+1]], 'species');
					}

					if ($(".report-control-buttons .show_stations_table").is(".selected")) {
						report = addReportSelectionPage(d, report, [dates[report.datePos], dates[report.datePos+1]], 'stations');
					}
				}

			});

			report.datePos++;

			console.log("Page: %s, Date interval: %s", report.pageIndex, report.datePos)

			if (report.pageIndex > 3) {
				$("#exploreReport:not(.small) .shrink_btn").trigger("click");
			}

			if (report.datePos == dates.length-1) {
				// End point
				clearInterval(report.interval);
				finishReport(report);
				// Clear status
				$(".report-step4 .report-status-text").text("Finished report");
			}
		} , 10)

	});

	return true;
}

function finishReport(report) {

	if (report.pageIndex > 3) {
		$("#exploreReport:not(.small) .shrink_btn").trigger("click");
	}
	// Page selection function
	$("#exploreReport .report-page-wrapper .report-checkbox, #exploreReport .report-page-wrapper").click(function(e) {

		e.stopPropagation();

		if ($("#exploreReport").is(".small:not(.zoomed)") || $(this).is(".report-checkbox")) {
			( $(this).is(".report-checkbox") ? $(this).closest(".report-page-wrapper") : $(this) ).toggleClass("selected");
			if ($("#exploreReport .report-page-wrapper.selected").length == 0) {
				$("#exploreReport .select_btn").removeClass('selected').removeClass('partial');
			} else if ($("#exploreReport .report-page-wrapper.selected").length == $("#exploreReport .report-page-wrapper").length) {
				$("#exploreReport .select_btn").addClass('selected').removeClass('partial');
			} else {
				$("#exploreReport .select_btn").removeClass('selected').addClass('partial')
			}
		} else if ($("#exploreReport").is(".small.zoomed")) {
//			$(this).find('.report-zoom').trigger('click');
			$("#exploreReport .report-page-wrapper").removeClass('zoomed');
			$(this).toggleClass("zoomed");
		}

	});

	// Zoom function
	$("#exploreReport .report-page-wrapper .report-zoom").click(function(e) {

		e.stopPropagation();

		if ( !$(this).closest(".report-page-wrapper").is(".zoomed") )
			$("#exploreReport .report-page-wrapper").removeClass('zoomed');

		$(this).closest(".report-page-wrapper").toggleClass("zoomed");

		$("#exploreReport").toggleClass("zoomed", $("#exploreReport .report-page-wrapper.zoomed").length > 0);

	});
}

function getSeasonName(dt) {
	if (typeof dt !== 'object') {
		console.error("That was not a date!");
		return false;
	} else {
		return (dt.getMonth() <= 3 ? "Winter" :
						dt.getMonth() <= 6 ? "Spring" :
						dt.getMonth() <= 9 ? "Summer" :
																		"Fall")+
					 " " + dt.getFullYear() ;
	}
}

function addReportSummaryPage(d, report, interval) {

	if (interval) {
			report.season = report.intervalName == "Quarterly" ? getSeasonName( interval[0] ) :
											report.intervalName == "Annual" ? interval[0].getFullYear() :
											(interval[0].toISOString().substring(0,10) + " - " + interval[1].toISOString().substring(0,10));
	}

	$("#exploreReport").append(
		`<div class='report-page-wrapper first-page selected'>
			<!--  Source: https://stackoverflow.com/questions/5445491/height-equal-to-dynamic-width-css-fluid-layout -->
			<div class='report-page-wrapper-dummy'></div>
			<div class="report-zoom">${icons.zoom}</div>
			<div class='report-page report-summary-page'>
				<div class="report-checkbox"></div>
				<div class="report-header">${report.header}</div>
				<div class="report-season">${interval?report.season:""}</div>
				<div class="report-pageIndex">${report.pageIndex}</div>
				<div class="report-title"></div>
				<div class="report-subtitle"></div>
				<div class="report-table"><table></table></div>
				<div class="report-stats"></div>
				<div class="report-timeline"><h2>Station activity (all stations)</h2></div>
				<div class="report-footer">${report.motusLogo} Report created on: ${report.publicationDate} ${report.birdsLogo}</div>
			</div>

		</div>`
	);

	let selected_tracks = subsetTracks(d, interval);


	report = {
			...report,
			...{
				title: "Multi-"+toSingular(dataType)+" summary",
				subtitle: "<i>Summarising data collected from <b>" +
										d.length +
										 " Motus Stations</b> between <b>" +
										TEXT_FRAGMENTS["month_" + (interval[0].getMonth()+1) ][currLang] +
										" " + interval[0].getDate() +
										( interval[0].getFullYear() != interval[1].getFullYear() ? ", " + interval[0].getFullYear() : "") +
										" and " +
										TEXT_FRAGMENTS["month_" + (interval[1].getMonth()+1) ][currLang] +
										" " + interval[1].getDate() +
										", " + interval[1].getFullYear()  +
										"</b></i>",
				stats: /*d.reduce( (a,c) => {

					c = getReportStats(c, 'multiple');

					if (a.length == 0)
						a = c;
					else {
						Object.keys(c).forEach( k => {
							if(a[k])
								a[k].push(c[k])
							else
								a[k] = [c[k]];
						});
					}

					return a;
				}, {})*/getReportStats( selected_tracks.filter(x => x.ts.length > 0) ),
				timeline: detectionTimeline(selected_tracks,{//getSelectionTracks( d, interval ),{
						width: 800,
//							resize: $(`#exploreReportPage${report.page} .report-timeline`),
						timelineSVG: $("<svg style='width:100%;margin:-8px 0;cursor:pointer;' viewbox='0 0 800 75'></svg>"),
						dataSource: "animals",
						margin:{left:0,right:0},
						setTimeline: true
					})
		}
	};

	console.log(selected_tracks);
	console.log(report.stats);

	$(`.report-page:eq(${report.pageIndex-1}) .report-title`).prepend(report.title);
	$(`.report-page:eq(${report.pageIndex-1}) .report-subtitle`).html(report.subtitle);
	/*
	$(`.report-page:eq(${report.pageIndex-1}) .report-stats`).html(Object.keys(report.stats).map( k => {

		let statVal = report.stats[k].val;

		statVal = k == 'dates' ? `${d3.min(statVal,  x => x[0])} - ${d3.max(statVal,  x => x[1])}` :
							typeof statVal[0] === 'object' ? [...new Set(statVal.flat())].length :
																								[...new Set(statVal)].join(", ");

		return `<div class="report-stat${report.stats[k].icon?"":" no-icon"}">
							<div class='report-stat-value'>${statVal}</div>
							${report.stats[k].icon?"<div class='report-stat-icon'>"+report.stats[k].icon+"</div>":""}
							<div class='report-stat-label'>${report.stats[k].name}</div>
						</div>`;
		}));*/
	$(`.report-page:eq(${report.pageIndex-1}) .report-stats`).html(Object.keys(report.stats).map( k => {
		return `<div class="report-stat${report.stats[k].icon?"":" no-icon"}">
							<div class='report-stat-value'>${k == 'dates' ? report.stats[k].val.join(" - ") : typeof report.stats[k].val === 'object' ? report.stats[k].val.length : report.stats[k].val}</div>
							${report.stats[k].icon?"<div class='report-stat-icon'>"+report.stats[k].icon+"</div>":""}
							<div class='report-stat-label'>${report.stats[k].name}</div>
						</div>`;
		}));

	$(`.report-page:eq(${report.pageIndex-1}) .report-timeline`).append(report.timeline);

	// subset the data for the table
	let tableData = getReportTableData( selected_tracks, dataType );

//	reportTable(`.report-page:eq(${report.pageIndex-1}) .report-table table`, tableData);
	reportTable(`.report-page:eq(${report.pageIndex-1}) .report-table table`, tableData, dataType);

	report.pageIndex++;

	return report;
}

function addReportSelectionPage(d, report, interval, tableDataType) {

	let selected_tracks = subsetTracks(d, interval, tableDataType).filter(x => x.ts.length > 0);
//getSelectionTracks(d, interval)
	console.log(selected_tracks);

	if (selected_tracks.length > 0) {
		if (interval) {
			report.season = report.intervalName == "Quarterly" ? getSeasonName( interval[0] ) :
											report.intervalName == "Annual" ? interval[0].getFullYear() :
											(interval[0].toISOString().substring(0,10) + " - " + interval[1].toISOString().substring(0,10));
		}

		$("#exploreReport").append(
			`<div class='report-page-wrapper selected'>
				<div class='report-page-wrapper-dummy'></div>
				<div class="report-zoom">${icons.zoom}</div>
				<div class='report-page'>
					<div class="report-checkbox"></div>
					<div class="report-header"><small>${report.header}</small></div>
					<div class="report-season">${interval?report.season:""}</div>
					<div class="report-pageIndex">${report.pageIndex}</div>
					<div class="report-title"></div>
					<div class="report-subtitle"></div>
					<div class="report-stats"></div>
					<div class="report-timeline"><h2>Detection timeline</h2></div>
					${(
						tableDataType == "species" ?
						'<div class="report-table report-table-species"><h2>Animals Detected</h2><table></table></div>' :
						'<div class="report-table report-table-stations"><h2>Stations with Detections</h2><table></table></div>'
					)}
					<div class="report-footer">${report.motusLogo} Report created on: ${report.publicationDate} ${report.birdsLogo}</div>
				</div>
			</div>`
		);
		console.log(tableDataType);

		report = {
				...report,
				...{
					title: d.name,
		/*			subtitle: ["stations","animals"].includes(dataType) ? `Lat: ${d.geometry.coordinates[1]}, lon: ${d.geometry.coordinates[0]}` :
											dataType == "projects" ? (d.fee_id == projectGroupNames[1] ? "" : d.fee_id) :
											dataType == "species" ? d.scientific :
											dataType == "regions" ? "",
	*/
					subtitle: "<i>Summarising data collected from <b>" +
											d.name + "</b> between <b>" +
											 TEXT_FRAGMENTS["month_" + (interval[0].getMonth()+1) ][currLang] +
											 " " + interval[0].getDate() +
											 ( interval[0].getFullYear() != interval[1].getFullYear() ? ", " + interval[0].getFullYear() : "") +
											 " and " +
											 TEXT_FRAGMENTS["month_" + (interval[1].getMonth()+1) ][currLang] +
											 " " + interval[1].getDate() +
											 ", " + interval[1].getFullYear()  +
											"</b></i>",
					stats: getReportStats( selected_tracks.filter(x => x.ts.length > 0), tableDataType ),
					timeline: detectionTimeline( selected_tracks,{//getSelectionTracks( d, interval ),{
							width: 800,
	//							resize: $(`#exploreReportPage${report.page} .report-timeline`),
							timelineSVG: $("<svg style='width:100%;margin:-8px 0;cursor:pointer;' viewbox='0 0 800 75'></svg>"),
							dataSource: "animals",
							margin:{left:0,right:0},
							setTimeline: true
						}),
					table: {
						//species: getReportSpeciesTableData(d)
					}
			}
		};

		$(`.report-page:eq(${report.pageIndex-1}) .report-title`).prepend(report.title);
		$(`.report-page:eq(${report.pageIndex-1}) .report-subtitle`).html(report.subtitle);
		$(`.report-page:eq(${report.pageIndex-1}) .report-stats`).html(Object.keys(report.stats).map( k => {
			return `<div class="report-stat${report.stats[k].icon?"":" no-icon"}">
								<div class='report-stat-value'>${k == 'dates' ? report.stats[k].val.join(" - ") : typeof report.stats[k].val === 'object' ? report.stats[k].val.length : report.stats[k].val}</div>
								${report.stats[k].icon?"<div class='report-stat-icon'>"+report.stats[k].icon+"</div>":""}
								<div class='report-stat-label'>${report.stats[k].name}</div>
							</div>`;
			}));
		$(`.report-page:eq(${report.pageIndex-1}) .report-timeline`).append(report.timeline);
		/*$(`.report-page:eq(${report.pageIndex-1}) .report-table-species table`).DataTable({
			...default_tableOpts,
			...{
				data: report.table.species
			}
		});*/
//		console.log(tableDataType);


//		console.log(selected_tracks.filter(x => x.stations.length > 0));
		var dataset = getReportTableData(selected_tracks.filter(x => x.stations.length > 0), tableDataType);

		reportTable(`.report-page:eq(${report.pageIndex-1}) .report-table-${tableDataType} table`,	dataset, tableDataType);

		report.pageIndex++;
	} else {
		console.warn("No data to report for %s from %s to %s", d.name, interval[0].toISOString().substring(0,10), interval[1].toISOString().substring(0,10));
	}
	return report;

}


function getReportTableData( tracks, tableDataType ) {

	if (typeof tableDataType === "undefined") {
		tableDataType = dataType;
		console.warn("No tableDataType set. Defaulting to main dataType: ", dataType);
	}

	var toReturn = [];

	if (tableDataType == "stations") {
// {id, name, dtStart, dtEnd, nAnimals, nSpecies, projectID, projectName}
		[...new Set(tracks.map( x => x.stations ).flat())]
			.map( x => motusData.selectedStations.filter( d => d.id == x)[0] )
			.filter( x => typeof x !== 'undefined' )
			.forEach( x => {
				let animals = tracks.filter( d => d.stations.includes(x.id) ).map( d => d.id );
				let species = [...new Set(tracks.filter( d => d.stations.includes(x.id) ).map( d => d.species ).flat())];
				toReturn.push({
					id: x.id,
					name: x.name,
					dtStart: x.dtStart,
					dtEnd: x.dtEnd,
					animals: animals,
					nAnimals: animals.length,
					species: species,
					nSpecies: species.length,
					projectID: x.project,
					projectName: "PLACEHOLDER"
				});
		});
		console.log(toReturn);
	} else if (tableDataType == "species") {
// {id, name, code, animals, english, scientific, french, projects, sort, stationProjects, group}
		[...new Set(tracks.map( x => x.species ))]
			.map( x => motusData.selectedSpecies.filter( d => d.id == x)[0] )
			.filter( x => typeof x !== 'undefined' )
			.forEach( x => {
				let t = tracks.filter( d => d.species.includes(x.id) );
				let animals = t.map( d => d.id ).filter( d => d != "" );
				let stations = [...new Set( t.map( d => d.stations ).flat() )].filter( d => d != "" );
				let projects = [...new Set( t.map( d => d.project ) )].filter( d => d != "" );
				toReturn.push({
					id: x.id,
					name: x.name,
					english: x.english,
					french: x.french,
					scientific: x.scientific,
					sort: x.sort,
					group: x.group,
					code: x.code,
					animals: animals,
					stations: stations,
					projects: projects,
					projectName: "PLACEHOLDER"
				});
		});
		toReturn = toReturn.filter( x => x.stations.length > 0 );
	} else if (tableDataType == "projects") {
// {id, name, dtCreated, nStations, nAnimals, nSpecies, fee_id}
//		var projectAnimals = typeof d.animals === 'undefined' ? [...new Set(d.map(x => x.animals).flat())] : d.animals;
		var projectStations = typeof motusFilter.selectedStations === 'undefined' ? motusData.stations.filter( x => motusFilter.selectedProjects.incldues(x.project) ) : motusFilter.selectedStations;
		var trackStations = [...new Set(tracks.map( x => x.stations ).flat())];//.filter( x => projectStations.includes(x) );
		console.log(projectStations);

		var selectedProjects = motusData.selectedProjects.map( x => x.id );

		var animalProjects = [...new Set(tracks.map( x => x.project ))].filter( x => selectedProjects.includes(x));
		var stationProjects = motusData.stations.filter( x => selectedProjects.includes(x.project) && trackStations.includes(x.id) ).map( x => x.project ).filter(onlyUnique);

//		[...new Set(tracks.map( x => x.project ))].filter( x => motusFilter.selectedProjects.includes(x));

		motusData.selectedProjects
			.filter( x => animalProjects.includes(x.id) || stationProjects.includes(x.id) )
			.forEach( x => {
				let t = tracks.filter( d => d.project == x.id || projectStations.some( v => x.stations.includes(v) ) );
				let animals = t.map( d => d.id ).filter( d => d != "" );
				let stations = [...new Set( t.map( d => d.stations ).flat() )].filter( d => d != "" );
				let species = [...new Set(tracks.filter( d => d.stations.includes(x.id) ).map( d => d.species ).flat())].filter( d => d != "" );
				toReturn.push({
					id: x.id,
					name: x.name,
					dtCreated: x.dtCreated,
					nStations: stations.length,
					nAnimals: animals.length,
					nSpecies: species.length,
					animals: animals,
					species: species,
					stations: stations,
					fee_id: x.fee_id
				});
		});
		toReturn = toReturn.filter( x => x.stations.length > 0 );
	}
	return toReturn;

}
function subsetTracks(d, interval, subsetBy) {
	var subset = [];
	if (dataType == 'stations') {
		var stations = typeof d.id === 'undefined' ? [...new Set(d.map(x => x.id).flat())] : [d.id];
		var animals = typeof d.animals === 'undefined' ? [...new Set(d.map(x => x.animals).flat())] : d.animals;
	} else if (dataType == 'animals') {
		var animals = typeof d.id === 'undefined' ? [...new Set(d.map(x => x.id).flat())] : [d.id];
		var stations = typeof d.stations === 'undefined' ? [...new Set(d.map(x => x.stations).flat())] : d.stations;
	} else if (dataType == 'species') {
		var animals = typeof d.animals === 'undefined' ? [...new Set(d.map(x => x.animals).flat())] : d.animals;
		var stations = typeof d.stations === 'undefined' ? [...new Set(d.map(x => x.stations).flat())] : d.stations;
	} else if (dataType == 'projects') {
		var animals = typeof d.animals === 'undefined' ? [...new Set(d.map(x => x.animals).flat())] : d.animals;
		var stations = typeof d.stations === 'undefined' ? [...new Set(d.map(x => x.stations).flat())] : d.stations;
		console.log("animals: %o, stations: %o", animals, stations);
	} else if (dataType == 'regions') {
		var animals = typeof d.animals === 'undefined' ? [...new Set(d.map(x => x.animals).flat())] : d.animals;
		var stations = typeof d.stations === 'undefined' ? [...new Set(d.map(x => x.stations).flat())] : d.stations;
	} else {
		console.warn("Unknown dataType: ", dataType)
	}
	subset = motusData.tracksLongByAnimal
							.filter(x =>
								( animals.includes(x.id) && (
									typeof subsetBy === 'undefined' ||
									subsetBy == "species"
								) ) ||
								( stations.some( v => x.stations.includes(v) ) && (
									typeof subsetBy === 'undefined' ||
									subsetBy == "stations"
								) )
							)
							.map(x => {
								var toReturn = {
									id: x.id,
									frequency: x.frequency,
									project: x.project,
									species: x.species,
									stations: [],
									tracks: [],
									ts: [],
									dist: []
								};
								x.stations.forEach( (s, i) => {
									if (stations.includes(s) && (interval[0]/1e3) <= x.ts[i] && (interval[1]/1e3) >= x.ts[i]) {
										toReturn.stations.push(s);
										toReturn.tracks.push(x.tracks[i]);
										toReturn.ts.push(x.ts[i]);
										toReturn.dist.push(x.dist[i]);
									}
								})
								return toReturn;
							});
	return subset;
}
function getReportStats( data, statDataType ) {

	if (typeof statDataType === "undefined") {statDataType = dataType;}

	var toReturn = {};

	if (statDataType == 'stations') {
		["animals", "species", "projects", "dates","frequency"].forEach( d => {

			let val = "";
			let name = firstToUpper(d);
			let icon = icons[d];

			if (d == 'dates') {
				if (isNaN(d3.min( data.map( x => x.ts ).flat() ) * 1e3)) {
					console.log("Error with dates: ", d3.extent( data.map( x => x.ts ).flat() ) )
					val = [new Date().toISOString().substr(0,10),new Date().toISOString().substr(0,10)];
				} else {
					val = [
						new Date( d3.min( data.map( x => x.ts ).flat() ) * 1e3).toISOString().substr(0,10) ,
						new Date( d3.max( data.map( x => x.ts ).flat() ) * 1e3).toISOString().substr(0,10)
					];
				}
				name = "Detection range";
			} else if (d == 'animals') {
				val = data.map( x => x.id );
				name = "Animals detected";
			} else if (d == 'species') {
				val = [...new Set(data.map( x => x.species ))];
				name = "Species detected";
			} else if (d == 'projects') {
				val = [...new Set(data.map( x => x.project ))];
				name = "Projects with tags detected";
			} else if (d == 'frequency') {
				val = [...new Set(data.filter( x => x.frequency != 'NA').map( x => x.frequency + " MHz" ))].join("<br/>");
				name = `${firstToUpper(toSingular(statDataType))} ${d}`;
			} else {
				console.warn("Unknown statistic: ", d);
			}

			toReturn[d] = {name: name, val: val, icon: icon};

		});
	} else if (statDataType == 'animals') {
		if (!data.stations) {data.stations = [];}
		["stations", "projects", "dates", "frequency"].forEach( d => {

			let val = "";
			let name = firstToUpper(d);
			let icon = icons[d];

			if (d == 'dates') {
				val = [ data.dtStart.toISOString().substr(0,10) , data.dtEnd.toISOString().substr(0,10) ];
				name = "Deployment dates";
			} else if (d == 'projects') {
				val = data.stations.reduce( (a,c) => {
					let station = motusData.stations.filter( x => x.id == c );
					if (station.length > 0)
						a.push(station[0].project);
					return a;
				}, []);
				val = [...new Set(val)];
				name = "Projects with tags detected";
			} else {
				val = data[d];
				val = d == 'frequency' ? val + " MHz" : val;
				name = d == 'frequency' ? (`${firstToUpper(toSingular(statDataType))} ${d}`) : (`${name} detected`)
			}

			toReturn[d] = {name: name, val: val, icon: icon};

		});
	} else if (statDataType == 'species') {
		if (!data.stations) {data.stations = [];}
		["animals", "species", "stations", "projects", "dates", "frequency"].forEach( d => {

			let val = "";
			let name = firstToUpper(d);
			let icon = icons[d];

			if (d == 'dates') {
				val = [ motusFilter.dtStart.toISOString().substr(0,10) , motusFilter.dtEnd.toISOString().substr(0,10) ];
			//	val = [ data.dtStart.toISOString().substr(0,10) , data.dtEnd.toISOString().substr(0,10) ];
				name = "Deployment dates";
			} else if (d == 'projects') {
				val = data.stations.reduce( (a,c) => {
					let station = motusData.stations.filter( x => x.id == c );
					if (station.length > 0)
						a.push(station[0].project);
					return a;
				}, []);
				val = [...new Set(val)];
				name = "Projects with stations";
			} else if (d == 'animals') {
				val = data.map( x => x.id );
				name = "Animals tagged";
			} else if (d == 'species') {
				val = [...new Set(data.map( x => x.species ))];
				name = "Species tagged";
			} else if (d == 'stations') {
				val = [...new Set(data.map( x => x.stations ).flat())];
				name = "Stations with detections";
			} else if (d == 'frequency') {
				val = [...new Set(data.filter( x => x.frequency != 'NA').map( x => x.frequency + " MHz" ))].join("<br/>");
				name = `${firstToUpper(toSingular(statDataType))} ${d}`;
			} else {
				console.warn("Unknown statistic: ", d);
			}

			toReturn[d] = {name: name, val: val, icon: icon};

		});
	} else if (statDataType == 'projects') {
			["animals", "species", "stations", "dates","frequency"].forEach( d => {

				let val = "";
				let name = firstToUpper(d);
				let icon = icons[d];

				if (d == 'dates') {
					if (isNaN(d3.min( data.map( x => x.ts ).flat() ) * 1e3)) {
						console.log("Error with dates: ", d3.extent( data.map( x => x.ts ).flat() ) )
						val = [new Date().toISOString().substr(0,10),new Date().toISOString().substr(0,10)];
					} else {
						val = [
							new Date( d3.min( data.map( x => x.ts ).flat() ) * 1e3).toISOString().substr(0,10) ,
							new Date( d3.max( data.map( x => x.ts ).flat() ) * 1e3).toISOString().substr(0,10)
						];
					}
					name = "Detection range";
				} else if (d == 'animals') {
					val = data.map( x => x.id );
					name = "Animals tagged";
				} else if (d == 'species') {
					val = [...new Set(data.map( x => x.species ))];
					name = "Species tagged";
				} else if (d == 'stations') {
					val = [...new Set(data.map( x => x.stations ).flat())];
					name = "Stations deployed";
				} else if (d == 'frequency') {
					val = [...new Set(data.filter( x => x.frequency != 'NA').map( x => x.frequency + " MHz" ))].join("<br/>");
					name = `${firstToUpper(toSingular(statDataType))} ${d}`;
				} else {
					console.warn("Unknown statistic: ", d);
				}

				toReturn[d] = {name: name, val: val, icon: icon};

			});
		}

	return toReturn;

}

function toggleLoadingOverlay(show) {

	if (show) {
		$("#exploreMap,#exploreTable,#exploreSelectionStatus").addClass("blur");
		$("#loadingOverlay").css("top", ( $(".explore-report-control-wrapper").outerHeight() + $(".explore-report-control-wrapper").outerHeight() ) + "px" ).fadeIn(250);
	} else {
		$("#exploreMap,#exploreTable,#exploreSelectionStatus").removeClass("blur");
		$("#loadingOverlay").fadeOut(250);
	}
}
// Stuff to do once the map has finished loading
function afterMapLoads() {

	if (typeof deck !== 'undefined') {

			deckGL_map();

	}

}


function exploreControls(el, opt) {
	opt = typeof opt === 'undefined' ? $(el).closest('div').attr('class').replace('explore-control-content ','').split(' ')[0].split('-').pop() : opt;
	console.log(el);
	console.log(opt);
	if (opt == 'help') {

			exploreHelp();

	} else	if (opt == 'edit') {
	//	console.log(el.value);
		if (dataType == 'stations') {
			/*  Change point type
			motusMap.groupData = el.value.toLowerCase() == 'rectangles' ? 'rect' : (
				el.value.toLowerCase() == 'circles' ? 'circles' : false
			);
			motusMap.map.fire('moveend');
			*/

			if ($(el).val() == "Prospective stations" || ( typeof $(el).val() == 'object' && $(el).val().includes("Prospective stations") ) ) {
				viewProspectiveStations();
			} else {
				motusMap.g.selectAll('.explore-map-prospective-station').classed('hidden', true);
			}

			if ($(el).val() == "Antenna ranges" || ( typeof $(el).val() == 'object' && $(el).val().includes("Antenna ranges") ) ) {
				viewAntennaRanges();
			} else {
				motusMap.g.selectAll('.explore-map-antenna-range').classed('hidden', true);
			}

			if ($(el).val() == "Coordination regions" || ( typeof $(el).val() == 'object' && $(el).val().includes("Coordination regions") ) ) {
				viewRegionalCoordinationGroups();
			} else {
				motusMap.g.selectAll('.explore-map-regional-groups').classed('hidden', true);
			}

			if ($(el).val() == "Active stations" || ( typeof $(el).val() == 'object' && $(el).val().includes("Active stations") ) ) {
				motusMap.setVisibility();
			} else {
				motusMap.g.selectAll('.explore-map-station:not(.disable-filter)').classed('hidden', true);
			}
		}
	} else if (opt == 'animate') {

	} else if (opt == 'view') {
		if (exploreType == 'main' && dataType == 'animals') {

			drawMapObjects('tagDeps');

		}
	} else if (opt == 'options') {
		var isTable = $(el).val().indexOf('table')!=-1;
		exploreSummaryTabSelect('region'+(isTable?'Table':'s'));
	} else if (opt == 'pdf') {




		if ($(el).hasClass('refresh_btn') || $("iframe#pdf_output").length == 0) {

					if ($("iframe#pdf_output").length == 0) {
						$("body").append('<div class="pdf-output-wrapper"><div style="text-align:center;margin-top:10px;"><a class="hidden_link" target="_blank"></a><button class="download_btn">Download</button><button class="close_btn">Close</button><button class="refresh_btn">Refresh</button></div><iframe id="pdf_output"></iframe></div>').find('iframe').get(0);

						$(".pdf-output-wrapper .refresh_btn").click(function(e){exploreControls(this, 'pdf')});

						$(".pdf-output-wrapper,.pdf-output-wrapper .close_btn").click(function(e){
							if (e.target !== this) return;
							$(".pdf-output-wrapper").fadeOut(250);
							$("body").css("overflow-y", "");
						});
					} else if ($(el).hasClass('refresh_btn')) {

								$(".pdf-output-wrapper iframe").attr('src', '');
					}

							$(".pdf-output-wrapper").fadeIn(250);
							$("body").css("overflow-y", "hidden");
			var zoom = motusMap.map.getZoom();
			var tab = $(".explore-card-profiles-tabs > .selected");
			$(".explore-card-profiles-tabs .explore-card-tab:not(.explore-card-map-tab):not(.explore-card-profiles-download-pdf-tab)").click();
			$(".explore-card-profiles-tabs .explore-card-map-tab").click();
			motusMap.map.setZoom(2);
			setTimeout(function(){
				var vars = [];
				var vals = [];

				$("#explore_card_profiles .explore-card-profile-data").each(function(i){

					vals.push( $(this).children(".explore-card-data-value").text() );
					vars.push( $(this).children(".explore-card-data-label").text() );

				});

				var opts = {};

				if (exploreType == 'regions') {
					var region_svg = d3.create('svg');

					var path = d3.geoPath().projection(d3.geoMercator().fitSize([500,100],motusData.selectedRegions[0]));

					region_svg.append("svg:defs").append("svg:marker")
						.attr("id", "station_path")
						.attr("refX", 5)
						.attr("refY", 10)
						.attr("markerWidth", 60)
						.attr("markerHeight", 80)
						.attr("viewBox", "0 0 30 40")
						.attr("markerUnits","userSpaceOnUse")
						.attr("orient", "auto")
						.append("path")
						.attr("d", icon_paths.stations)
						.style('pointer-events', 'auto')
						.style("stroke", "#000");


					var g = region_svg.attr('width',500)
							.attr('height',100)
							.append('g');

					g.selectAll("regions")
							.data(motusData.selectedRegions)
							.enter().append("path")
							.attr("d", path)
							.attr('class', 'explore-map-regions leaflet-zoom-hide')
							.style('stroke', '#000')
						//	.style('fill', '#FFF')
							.style('fill', d => motusFilter.regions.includes(d.properties.adm0_a3) ? "#FFF" : "#CCC" )
							.style('stroke-width', '1px');


				  g.selectAll('stations')
							.data(motusData.stations.filter(d => motusData.selectedStations.includes(d.id)).sort((a, b) => d3.ascending(a.id, b.id)))
							//.data(motusData.stations)
							.enter().append("path")
							.attr('marker-end','url(#station_path)')
							.attr("d", path.pointRadius(6))
		//					.style('stroke', '#000')
							.style('fill', (d) => d.dtEnd > moment().subtract(1, 'days') ? '#0F0' : '#F00')
							.attr('class', 'explore-map-stations leaflet-zoom-hide')
							//.style('fill', d => regionStations.includes(d.id) ? "#F00" : "#000")
					//		.style('stroke-width', '1px')

					d3.geoPath().bounds({features:motusData.selectedRegions, type: "FeatureCollection"});

					opts = {
						type: exploreType,
						selection: firstToUpper($("#explore_card_profiles .explore-card-name").text()),
						summaryTable: {vars: vars, vals: vals},
						titleIcon: {svg: region_svg}
					};

				} else {
					opts = {
						type: exploreType,
						selection: firstToUpper($("#explore_card_profiles .explore-card-name").text()),
						summaryTable: {vars: vars, vals: vals}
					};
				}
				if ($("#explore_card_stationHits table.explore-card-stationHits-table").length > 0) {

					opts.stations = {
						// Remove the HTML from the first row!
						data: $("#explore_card_stationHits table.explore-card-stationHits-table").DataTable().rows().data().toArray()
											.map(x => Object.values(x)
												.filter((d,i) => [1,2,3,4,5,9].includes(i)) // Select which columns to use
												.map( (d, i) => i == 1 ? d.toISOString().substr(0,10) : (i == 2 ? `${(moment().diff(d, 'day') < 1 ? "Active" : "Ended on: " + d.toISOString().substr(0,10) )}` : d)
												)
											),
						cols: $("#explore_card_stationHits table.explore-card-stationHits-table th").map(function(){return $.trim($(this).text());}).get().filter((d,i) => i > 0),
						colWidths: [4,2,3,1,1,3]
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
				if ($("#explore_card_speciesHits table.explore-card-speciesHits-speciesTable").length > 0) {
					opts.species = {
						// Remove the HTML from the first row!
						data: $("#explore_card_speciesHits table.explore-card-speciesHits-speciesTable").DataTable().rows().data().toArray()
											.map(x => Object.values(x)
												.filter((d,i) => [2,5,8].includes(i)) // Select which columns to use
									//			.map( (d, i) => i == 2 ? `${d.replace('<br/>',' ')}` : d )
											),
						cols: $("#explore_card_speciesHits table.explore-card-speciesHits-speciesTable th").map(function(){return $.trim($(this).text());}).get().filter((d,i) => i > 0),
						colWidths: [4,1,1]
					}
				}
				makePDF(opts);

				setTimeout(function(){
					motusMap.map.setZoom(zoom);
					tab.click();
				}, 250);
			}, 500);
		} else {
			$(".pdf-output-wrapper").fadeIn(250);
			$("body").css("overflow-y", "hidden");
		}
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

	if (typeof motusData.projects !== 'undefined') {
		motusData.projects.forEach(function(d){

			filters.options.projects[d.id] = d.project_name;

		});
	}
	if (typeof motusData.stationDeps !== 'undefined') {

		filters.options.stations = Object.fromEntries( motusData.stationDeps.map( d => [ d.id, [ d.name, ( d.status != 'active' ? 'inactive' : 'active' ) ] ] ) );

		filters.options.frequencies = {};

		(Array.from(motusData.stationDeps.map(d => d.frequency).values())).filter(onlyUnique).filter(d => d.length > 0 && d!="NA" && d.split(',').length == 1).forEach(d => filters.options.frequencies[`${d}`] = d + " MHz");
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
	//	filters.options.frequencies = {};
	//	(Array.from(motusData.tracks.map(d => d.frequency).values())).filter(onlyUnique).filter(d => d.length > 0 && d!="NA" && d.split(',').length == 1).forEach(d => filters.options.frequencies[`${d}`] = d + " MHz");
	}
	console.log(motusData);

	var toAppend = (["projects","stations","species","regions","frequencies","dates"].map(function(x){

						const classes = ['stations','species'].includes(x) ? ' class="dataType_' + x +'"': "";

						return "<div"+classes+">"+(x == 'dates' ? "<input " : "<select ")+" id='filter_"+x+"' class='filter_"+x+"'"+(x == 'dates' ? '>' : "' multiple='multiple' data-placeholder='All "+x+"'><option value='all'></option></select>") + "</div>";

					}).join(""));

	$(exploreType == 'main' ? "#explore_filters" : "#explore_filters").append(toAppend);

	$(exploreType == 'main' ? "#explore_filters" : "#explore_filters").append("<div class='filter-status'>Showing <span></span> of <span></span> " + ( dataType == 'animals' ? 'tracks' : dataType ) + "</div>");

	if (motusData.nTracks) {$("#explore_filters .filter-status").find('span:eq(1)').text(motusData.nTracks);}
	else if (dataType == 'stations') {$("#explore_filters .filter-status").find('span:eq(1)').text(motusData.stationDeps.length);}


	$("#explore_filters").append("<div class='filterButton clear-filters' alt='Clear filters'>Clear filters"+'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>'+"</div>");

	$(".clear-filters").click(function(){
		$("#explore_filters select").each(function(){
			if ($(this).select2("val") != 0 && (! $(this).hasClass(`filter_${dataType}`) || exploreType == 'main') ) {
				$(this).select2().val(null).trigger("change");
				console.log(this.classList)
			}
		});

		timeline.setSlider([dtLims.min.valueOf(), dtLims.max.valueOf()], true);
		//$("#filter_summary > div:not(.explore_dates)").removeClass('visible');

//		if (exploreType != 'main') var summaryFilter = motusFilter[dataType];
	//	motusFilter = {};
//		if (exploreType != 'main') motusFilter[dataType] = summaryFilter;

		$("#filter_summary").removeClass('visible');

		$("#explore_filters").parent(".active").removeClass('active');

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
		matcher: (params, data) => {
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
		templateResult: (data, container) => {
			if (data.element) {
				$(container).addClass($(data.element).attr("class"));
			}
			return data.text;
		},
		placeholder: () => $(this).data('placeholder'),
		width: "100%"
	}).change(setFilter);

}


function setFilter(e, filterName) {
	if ( $(this).parent().hasClass('explore-card-profiles-toggles') ) {

		var toggle_type = this.textContent.toLowerCase().includes('stations') ? "stationDeps" : "animals";
		var is_selected = $(this).hasClass('selected');

		if (is_selected) {
			if ( ['regions', 'projects'].includes(dataType) ) {
				if (toggle_type == 'stationDeps') {
					motusFilter.stations = motusFilter[ dataType ].map(x => (motusData[ toggle_type + "By" + firstToUpper(dataType) ].get(x).map(v => v.id))).flat();
				} else {
					motusFilter[ toggle_type ] = motusFilter[ dataType ]
						.filter(x => (typeof motusData[ toggle_type + "By" + firstToUpper(dataType) ].get(x) !== 'undefined'))
						.map(x => Array.from(motusData[ toggle_type + "By" + firstToUpper(dataType) ].get(x).keys())).flat().filter(onlyUnique);
				}
			}
		} else {

			motusFilter[ toggle_type == 'stationDeps' ? "stations" : toggle_type ] = ["all"];

		}
		motusMap.setVisibility();
	} else {

		filterName = filterName ? filterName : e.target.id.replace("filter_", "");

		var newFilter = $(e.target).val();
		console.log(filterName + ": " + newFilter);
		newFilter = newFilter.length == 0 ? ['all'] : (filterName == 'status' && newFilter == 'inactive' ? ['terminated','not active','pending'] : newFilter);

		motusFilter[filterName] = newFilter;

	//	var displayText = motusFilter[filterName].map(v => $("#filter_" + filterName + " option[value='" + v + "']").text());

		if (filterName == dataType) {
			if (motusFilter[dataType].includes('all') && motusFilter.selections.length > 0) {
				motusFilter[dataType] = motusFilter.selections;
			} else if ( !motusFilter.selections.every( x => motusFilter[dataType].includes(x))) {
				motusFilter[dataType].concat( motusFilter.selections.filter( x => !motusFilter[dataType].includes(x) ) );
			}
		}

				testTimer.push([new Date(), "Update data"]);

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


function updateData() {

	window.dispatchEvent(new Event('resize'));

	if (motusMap.setVisibility)	motusMap.setVisibility();

	testTimer.push([new Date(), "Update url"]);


	updateSelectionStatus();

	updateURL();

}

function select2TemplateResult (data, container) {
	if (data.element) {
		$(container).addClass($(data.element).attr("class"));
	}
	return data.text;
}
function select2Placeholder() {return $(this).data('placeholder');}
function select2Matcher(params, data) {
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

}
