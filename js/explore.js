

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
	// Change the document title based on the view and data type
	document.title = "Motus - " + (exploreType == 'main' ? ( "Explore " + firstToUpper(dataType) ) : ( firstToUpper(exploreType) + " summary" ) );

	// Capture any changes in URL
	window.onhashchange = detectNavigation;
	// For Development:
	// Fix Wordpress URL
	if (exploreType == 'main' && window.location.hostname != 'localhost' && window.location.hostname != 'leberrigan.github.io') {window.location.href="#e=main&d="+dataType;}

	// Set the default start and end dates
	default_startDate = dtLims.min;
	default_endDate = dtLims.max;

	// Set the HTML structure of the page based on exploreType
	var HTML_dom = "<div class='explore-card-wrapper' style='opacity:0;'>"+
						"<div class='title-wrapper'>"+
							//(exploreType == 'main' ? "<div class='title-header'>Explore "+firstToUpper(dataType)+"</div>" : "<div class='title-header'>Explore [NAME]</div>")+
							"<div class='explore-menu-header'>Summarise data by:</div>"+
							"<div id='explore_menu'>"+
								"<div class='explore-menu-overlay'></div>"+
								`<div class='explore-menu-item expand_btn'>${icons.menu}</div>`+
								(dataTypes.map(x=>`<div class='explore-menu-item${(x==firstToUpper((exploreType == 'main' ? dataType : exploreType))?" selected":"")}' __data='${(x.toLowerCase())}'>${x=='Animals'&&exploreType=='main'?'Tracks':x}</div>`).join(""))+
					//			(dataTypes.map(x=>"<div class='explore-menu-item"+(x==firstToUpper((exploreType == 'main' ? dataType : exploreType))?" selected":"")+"' __data='"+(x.toLowerCase())+"'>"+(x=='Animals'?'Tracks':x)+"</div>").join(""))+
							"</div>"+
						"</div>"+
						"<div class='explore-controls' id='explore_controls'>"+
							"<div class='explore-control-wrapper'></div>"+
						"</div>"+
						"<div id='dateHighlighter'></div> "+
						(
							["animals","stations","regions","projects","species"].includes(dataType) ? (

								(exploreType != 'main' || dataType == 'regions' ? "<div id='explore_card_map' class='explore-card explore-card-map'>" : "") +
									"<div id='explore_map'></div>" +
								(exploreType != 'main' || dataType == 'regions' ? "</div>" : "")
//									(exploreType != 'main'? `<div class='page-name'>${firstToUpper(dataType=='species'?dataType:dataType.substring(0, dataType.length - 1))} summary</div>` : "")

							) :	""
						)+
						(
						/*	["projects","species","regions"].includes(dataType) ?*/ "<div class='explore-table-wrapper'><table class='hover' id='explore_table' style='width:100%;'></table></div>" //: ""
						)
					"</div>";

	// Append the above HTML and then set the view class
	$("#exploreContent").append(HTML_dom).toggleClass('profiles', exploreType != 'main');//.toggleClass('data-summary', exploreType == 'main' && dataType == 'regions');

	// Set the click events for main menu
	$("#explore_menu .explore-menu-item").on('touchstart',function(){
		$("#explore_menu").toggleClass("touch");
	});
	$("#explore_menu .explore-menu-item").click(function(){

		if (($("#explore_menu").hasClass("expanded") && !$(this).hasClass('expand_btn')) || exploreType == 'main') {
			// This should probably be done differently. #change

			// Record the current datatype
			var dataType_old = dataType;

			// Get the new datatype
			// This should be stored differently
			dataType = $(this).attr('__data');

			// Store the current explore view
			var exploreType_old = exploreType;

			// Set the explore view to 'main' (it defaults to this view when you click on the main menu)
			exploreType = 'main';

			// Refresh the page if the data type has changed (unless it was and is a table) or if the explore view has changed
			var refresh = exploreType_old != exploreType || (dataType_old != dataType && !( ['regions','projects','species'].includes(dataType_old) && ['regions','projects','species'].includes(dataType) ) );

			// Empty the motus filters
			// We should probably have an option here to maintain filters. #change
			motusFilter = {};

			// Update the url
			updateURL( refresh );

			// If we're not refreshing, we'll make the selected menu item change and then transition to the new data
			if (!refresh) {

				// Set selected menu option
				$("#explore_menu .explore-menu-item.selected").removeClass("selected");
				$(this).addClass("selected");

				// Load the new data
				// This function needs to change. #change
				exploreSummaryTabSelect(dataType);

			}
		} else if ($(this).hasClass('expand_btn')) {
			$("#explore_menu").toggleClass('expanded');//.unbind('mouseout');
		} else {
			$("#explore_menu").addClass('expanded');//.on('mouseout',function(){$("#explore_menu.expanded .expand_btn").trigger('click');});
		}

	});

	$("#explore_menu .explore-menu-overlay").click(function(){
		$("#explore_menu").removeClass('expanded');
	});

	// Load the data
	//	Now that we know what content to load and we have the dom to put it in, read in the required datasets
	getMotusData( requiredTables[exploreType == "main"?exploreType:"summary"][dataType] );

});

var dashboard_loaded = false;
function loadDashboardContent( reload = false ) {

	if (!dashboard_loaded || reload) {

		testTimer.push([new Date(), "Load dashboard content"]);

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
				// Load map objects (will be replaced?)
				loadMapObjects();
				// Add the tab menu item for the map
				addExploreTab('explore-card-map', 'Map', {selected: true, icon: icons.map});
				// Add the explore profiles
				exploreSummary();

			} );

		} else {
			loadMapObjects();
			$(".loader").addClass("hidden");

		}

		if (["stations","animals","regions", "species", "projects"].includes(dataType)) {
		} else {
			exploreTable({containerID: 'explore_table', name: dataType, data: motusData[dataType]});
		}
		dashboard_loaded = true;
	} else {
		logMessage("Load content: Dashboard already initialized!", "error");
	}
	// Hide the loading animation

}

function exploreSummaryTabSelect(selectedTab) {

	$(".explore-control-content .explore-summary-selections span").text(`Select one or more ${selectedTab} below`);

		if (selectedTab == 'regions') {
			$(".explore-control-content .explore-summary-selections button.multiSelect_btn:visible").hide();
			$("#explore_table:visible").hide();
			if ($.fn.DataTable.isDataTable("#explore_table")) {
				$("#explore_table").DataTable().clear().destroy();
			}

			$(".explore-card-map:hidden").show();
			$("#explore_map:hidden").show();
		} else {
			$(".explore-control-content .explore-summary-selections button:not(.multiSelect_btn):visible").hide();
			$(".explore-card-map:visible").hide();
			$("#explore_map:visible").hide();

			if (selectedTab == 'regionTable') {

				var tbl = [ dataType, motusData.regions.filter( x => x.both != 0 ) ];

			} else if (selectedTab == 'projects') {

				var tbl = [selectedTab,Array.from(motusData.projects.map(function(d) {

					return {
						id: d.id,
						name: d.name,
						dtCreated: moment(d.dtCreated).toISOString().substring(0,10),
						fee_id: d.fee_id,
						stations: {display:	d.stations.length > 0 ? `<a href='javascript:void(0);' onclick="viewTableStats('stations',["${d.stations.join('","')}"])">${d.stations.length}</a>` : 0, order: d.stations.length},
						animals: {display:	d.animals.length > 0 ? `<a href='javascript:void(0);' onclick="'"viewTableStats('animals',["${d.animals.join('","')}"])">${d.animals.length}</a>` : 0, order: d.animals.length},
						species: {display:	d.species.length > 0 ? `<a href='javascript:void(0);' onclick="'"viewTableStats('species',["${d.species.filter(onlyUnique).join('","')}"])">${d.species.filter(onlyUnique).length}</a>` : 0, order: d.species.filter(onlyUnique).length}
					};

				}).values())];

			} else if (selectedTab == 'species') {

				var tbl = [selectedTab,Array.from(motusData.species.map(function(d) {

					var animals = d.animals.filter(onlyUnique);
					var projects = d.projects.filter(onlyUnique);

					return {
						id: d.id,
						english: d.english,
						scientific: d.scientific,
						group: d.group,
						animals: {display:	animals.length > 0 ? `<a href='javascript:void(0);' onclick='viewTableStats('animals',["${animals.join('","')}"])'>${animals.length}</a>` : 0, order: animals.length},
						projects: {display:	projects.length > 0 ? `<a href='javascript:void(0);' onclick='viewTableStats('projects',["${projects.join('","')}"])'>${projects.length}</a>` : 0, order: projects.length},
						group: {display:	d.group != "" ? `<a href='javascript:void(0);' onclick='viewTableStats('speciesGroup',"${d.group}")'>${d.group}</a>` : "", order: d.group},
						code: d.code,
						sort: d.sort,
					};

				}).values())];

			}


			function loadTable(multi) {

				var opts = {
						/*select: {
							style: multi?"multi+shift":"single"
						},*/
						order: [[ multi ? 1 : 0, 'asc' ]],
						dom: '<"explore-table-header-controls"f><"explore-table-header-center"Blip>t',
		        buttons: [
							'copyHtml5',
							'excelHtml5',
							'csvHtml5',
							'pdfHtml5'
		        ]

					};
				var cols = selectedTab == 'projects' ? ['id', 'name', 'fee_id', 'stations', 'animals'] :
									(selectedTab == 'regionTable' ? ['country', 'stations', 'animals'] :
																									['english', 'scientific', 'animals', 'projects', 'group', 'code', 'sort']);

				opts.columnDefs = [];

				if (selectedTab == 'species') {


					opts.order = [[6, 'asc']];
					opts.columns = [];

					for (var i in cols) {
						opts.columns = [
							{data: "english", title: dataColNames[selectedTab]["english"]},
							{data: "scientific", title: dataColNames[selectedTab]["scientific"], orderData: [6, 1]},
							{className: "dt-center", data: "animals", title: dataColNames[selectedTab]["animals"], "render": {_: "display", sort: "order"}},
							{className: "dt-center", data: "projects", title: dataColNames[selectedTab]["projects"], "render": {_: "display", sort: "order"}},
					//		{className: "dt-center", data: "stations", title: dataColNames[selectedTab]["english"], "render": {_: "display", sort: "order"}},
							{className: "dt-center", data: "group", title: dataColNames[selectedTab]["group"], "render": {_: "display", sort: "order"}},
							{data: "code", visible: false, orderable: false},
							{data: "sort", visible: false, searchable: false},
						];
					}

				}

				if (multi) {

					opts.columnDefs.push({
							targets: 0,
							data: null,
							defaultContent: '',
							orderable: false,
							className: 'select-checkbox' });

				//	opts.select.selector = 'td:first-child';

					cols = [''].concat(cols);

					$(".explore-control-content .explore-summary-selections button.multiSelect_btn:visible").hide();

				}

				loadDataTable(
					tbl,
					cols,
					opts,
					//[{event: 'click', fun: exploreTableRowClick}]
					/*[{event: 'select', fun: onSelect},
					{event: 'deselect', fun: onSelect}]*/
				);
			}
			loadTable(false);

			$(".explore-control-content .explore-summary-selections button.multiSelect_btn").show();

			$(".explore-control-content .explore-summary-selections button.multiSelect_btn").click(function(){

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

				var dataVar = dataType == 'regions' ? 'iso_a2' : 'id';

				var selection = [];

				for (var i=0; i<data.length; i++) {
					selection.push(data[i][dataVar]);
				}

				viewProfile(dataType, selection);
			});
			$(".explore-summary-selections .reset_btn").click(function(){
				$("#explore_table").DataTable().rows().deselect();
			});
			$(".explore-summary-control-options .explore-table-header-controls").remove();
			$(".explore-summary-" + selectedTab + "-control-options").append($(".explore-table-header-controls"));
			$(".explore-table-header-controls .dataTables_filter").hide();
			$(".explore-table-header-controls").append(`<button class='search_btn'>Search ${dataType}</button>`);
			$(".explore-table-header-controls").append(`<button class='browse_btn'>Browse ${toSingular(dataType)} groups</button>`);

			$(".explore-table-header-controls button").click(function(){

				if ($(this).hasClass('search_btn')) {
					$(".explore-table-header-controls .dataTables_filter").show();
					$(this).hide();
					if ($(".explore-table-header-controls .browse_btn").is(":hidden")) {
						loadTable();
						$(".explore-summary-" + selectedTab + "-control-options .explore-table-header-controls .dataTables_filter").remove();
						$(".explore-summary-" + selectedTab + "-control-options .explore-table-header-controls").prepend($("#explore_table_wrapper .dataTables_filter"));
						$("#explore_table_wrapper .explore-table-header-controls").remove();
						$(".explore-table-header-controls .browse_btn").show();
					}
					$(".explore-table-header-controls .dataTables_filter input").focus();
				} else {	// Browse project groups
					$(".explore-table-header-controls .browse_btn").hide();
					$(".explore-table-header-controls .dataTables_filter").hide();
					$(".explore-table-header-controls .search_btn").show()
					var [data,opts] = loadDataTypeGroupingTable();
					loadDataTable(
						[dataType, data],
						Object.keys(data[0]),
						opts
					);
				}

			});
			function onSelect(e, dt, t, i) {
				var nSelected = $("#explore_table").DataTable().rows( {selected: true} ).count();
				if (nSelected > 0 && $("#explore_table td.select-checkbox").length == 0) {

			        var data = dt.rows( {selected: true} ).data();

					var dataVar = dataType != 'species' ? dataType != 'projects' ? 'iso_a2' : 'id' : 'id';

					var selection = data[0][dataVar];

					default_startDate = dtLims.min;
					default_endDate = dtLims.max;

				//	viewProfile(profileName, selection);

					loadOverlayPane( dataType, dataVar, selection );


				} else if (nSelected > 0) {
					$(".explore-control-content .explore-summary-selections span").text(`${nSelected} ${(selectedTab=='species'?selectedTab:(nSelected == 1 ? selectedTab.slice(0,-1):selectedTab))} selected`);
					$(".explore-control-content .explore-summary-selections button:not(.multiSelect_btn)").show();
				//	$(".explore-control-content .explore-summary-selections button.multiSelect_btn:visible").hide();
				} else {
					$(".explore-control-content .explore-summary-selections button:not(.multiSelect_btn)").hide();
				//	if (!$("#explore_table td.select-checkbox").length > 0) {
				//		$(".explore-control-content .explore-summary-selections button.multiSelect_btn").show();
				//	}
					$(".explore-control-content .explore-summary-selections span").text(`Select one or more ${selectedTab} in the table below`);
				}
			}
		}
		$(".explore-control-content .explore-summary-control-options").hide();
		$(".explore-control-content .explore-summary-" + selectedTab + "-control-options").show();

}



function loadOverlayPane( profileName, dataVar, selection ) {

	$('#explore_overlay').remove();

	$('body').append('<div id="explore_overlay"><div class="explore-overlay-content"></div></div>');

	if ($("#explore_overlay_bg").length == 0) {
		$('body').append('<div id="explore_overlay_bg"></div>');
		$("#explore_overlay_bg").click(closeExploreOverlay);
		logMessage( "Loading profile: "+ profileName );
	}
	$("#explore_overlay_bg").fadeIn(100);

	var selected_row = motusData[profileName].filter( d => d[dataVar] == selection)[0];

	if (profileName == 'regions') {
		var cols = {'country':"header", 'code':'subheader', 'stations':"stat", 'animals':"stat"};

		selected_row.code = `CODE: "${selected_row.iso_a2}"`;

	} else if (profileName == 'species') {

		var cols = {'english':"header", 'scientific':"subheader", "group":"group"};

	} else if (profileName == 'projects') {
		var cols = {'name':"header", 'code':"subheader", 'dtCreated':"data", 'fee_id':"group", 'description':"text"};

		selected_row.code = `CODE: "${selected_row.project_code}"`;

	}

	var vals = {};

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

	if (exploreType != 'main') {
		toAppend = ["filters", "timeline", "animate", "search", 'pdf', 'share', 'add', 'edit'];
	} else if ( ['regions', 'projects','species'].includes(dataType) ) {
		toAppend = ["type"];
		if (exploreType == 'main') {
//			$('#explore_controls').addClass('data-summary');
		}
	} else if (dataType == 'stations') {
		toAppend = ["filters", "timeline", "search", "edit", 'pdf', 'share'];
	} else if (dataType == 'animals') {
		toAppend = ["filters", "animate", "timeline", "search", "view", 'pdf', 'share'];
	}
	toAppend.push('help');

	if (toAppend.length > 0) {

		toAppend.forEach(function(x){

			var hasIcon = ( ! ( ['regions', 'projects','species'].includes(dataType) && exploreType == 'main' ) ) && x != 'view';

			var controlIcon = `<div class='explore-map-${dataType}-${x}${(hasIcon ? " toggleDisplay" : "")}'>${(hasIcon?icons[x]:"")}</div>`;

//			var controlContent = hasIcon ? `<div class="explore-control-content explore-control-${x}"${ (x == 'filters' ? ' id="explore_filters"' : '') }>` : "";
			var controlContent = `<div class="explore-control-content explore-control-${x}"${ (x == 'filters' ? ' id="explore_filters"' : '') }>`;

			if (x == 'view') {
				controlContent += dataType == 'stations' ?
																	("<select style='width:200px' multiple='multiple'>"+
																			"<option selected='selected'>Active stations</option><option>Prospective stations</option><option>Regional coordination\n groups</option>"+
																	"</select>") :
																	("<button class='submit_btn' onclick='exploreControls(this);'>View deployments</button>")
			} else if (x == 'pdf') {
				controlContent += "<input type='button' onclick='exploreControls(this.parentElement);' value='Generate PDF' />";
			} else if (x == 'timeline') {
				controlContent += "<div id='dateSlider'>"+
															"<div class='slider visible'><div id='custom-handle-1' class='ui-slider-handle'></div><div id='custom-handle-2' class='ui-slider-handle'></div></div>"+
														"</div>";
			} else if (x == 'search') {
				controlContent += "<input type='text' /><input type='button' value='Search' />";
			} else if (x == 'animate') {
				controlContent += `<button class='animate-play tips' alt='Play'>${icons.play}</button>`+
														`<button class='animate-pause tips' alt='Pause'>${icons.pause}</button>`+
														`<button class='animate-stop tips' alt='Stop'>${icons.stop}</button>`+
														`<div class='animate-duration-wrapper'>Duration: <input class='animate-duration' type="number" min="1" step="1" value="10"/> seconds</div>`
			} else if (x == 'share') {
				controlContent += `<div class="fb-share-button" data-href="${window.location.href}" data-layout="button"></div>`;
			} else if (x == 'type') {
				controlContent += ['regions', 'projects','species'].includes(dataType) ?
						"<div class='explore-summary-selections'>"+
							"<span></span> "+
							"<button class='multiSelect_btn'>Select multiple</button> "+
							"<button class='submit_btn'>Summarise these data</button>"+
							"<button class='reset_btn'>Clear selections</button>"+
						"</div>"+
						"<div class='explore-summary-regions-control-options explore-summary-control-options'>"+
							"<label for='explore_control_regions_type'>Mapping regions by: </label><select id='explore_control_regions_type' style='width:150px'>"+
							(["state/province", "country", "continent", "ecoregion", "BCR", "KBA", "Custom..."].map((x)=>`<option value='${x}'>${firstToUpper(x)}</option>`))+
							"</select>"+
							"<input type='button' onclick='exploreControls(this);' value='View as table' />"+
						"</div>"+
						"<div class='explore-summary-regionTable-control-options explore-summary-control-options'>"+
							"<label for='explore_control_regions_type'>List regions by: </label><select id='explore_control_regions_type' style='width:150px'>"+
							(["state/province", "country", "continent", "ecoregion", "BCR", "KBA", "Custom..."].map((x)=>`<option value='${x}'>${firstToUpper(x)}</option>`))+
							"</select>"+
							"<input type='button' onclick='exploreControls(this);' value='View as map' />"+
						"</div>"+
						"<div class='explore-summary-projects-control-options explore-summary-control-options'></div>"+
						"<div class='explore-summary-species-control-options explore-summary-control-options'></div>" : "";
			} else if (x == 'edit') {
				controlContent += '<div class="explore-map-editor-wrapper">'+
														'<div id="explore_map_editor" class="explore-map-edit"><button class="close_btn">Close</button></div>'+
	                        	'<div class="add-station-info">'+
															'<span class="note">Click on the map to place a prospective station.</span><div class="add-station-range"></div><button class="close_btn">Cancel</button>'+
														'</div>'+
													'</div>'+
													"<select id='explore_controls_plan_layer_select' style='width:200px' multiple='multiple'>"+
															"<option selected='selected'>Active stations</option><option>Prospective stations</option><option>Coordination regions</option><option>Antenna ranges</option>"+
													"</select>"+
													"<button onclick='$(this).siblings(\"select\").select2(\"open\");'>Add layer</button>";
//													"<button onclick='exploreMapAddStation()' class='submit_btn'>Add a prospective station</button>";
			}

			controlContent += "</div>";

			if (!hasIcon) {
				$("#explore_controls > div").append(controlContent);
			} else {
				$("#explore_controls > div").append(controlIcon);
				$("#explore_controls").after(controlContent);
			}

		});
		//console.log($("#explore_controls > div").html());
	}

//	$("#explore_controls .animate-play").click(function(){animateTimeline($("#dateSlider").get(0));});
	$(".explore-control-content .animate-play").click(function(){
		//if (exploreType != 'main') {
			if (!motusMap.animation.isAnimating) {animateTracks($(".explore-control-content .animate-duration").val() * 1000);}
		/*} else {
			animateTimeline( $("#dateSlider").get(0) );
		}*/
	});
	$(".explore-control-content .animate-pause").click(function(){
		motusMap.animation.pause = true;
	});
	//$(".explore-control-content .animate-duration").change(function(){motusMap.animation.duration = this.value * 1000;});
	$(".explore-control-content .animate-stop").click(function(){
		motusMap.animation.stop = true;
		if (motusMap.animation.pause) {
			motusMap.animation.pause = false;
			animateTrackStep();
		}
	});
	$(".explore-control-content select").select2({
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
		width: "100%",
		placeholder: () => {return $(this).data('placeholder');},
	}).change(function(){exploreControls(this);});

	$("#explore_controls .toggleDisplay svg").click(function(){

		var controlName = $(this).closest(".toggleDisplay").get(0).classList[0].split('-').pop();

		$(this).parent().toggleClass('selected').siblings('.toggleDisplay.selected').toggleClass('selected');

		if (controlName == 'timeline') {
			$('.explore-control-content.visible:not(.explore-control-' + controlName + ')').removeClass('visible');
			$(".explore-control-timeline").toggleClass('visible', $(this).parent().is('.selected')).removeClass('animate');
			window.dispatchEvent(new Event('resize'))
		} else {
			$('.explore-control-content.visible:not(.explore-control-' + controlName + ')').removeClass('visible');
			$('.explore-control-content.explore-control-' + controlName).toggleClass('visible');
		}
		if (controlName == 'animate') {
			$(".explore-control-timeline").toggleClass('visible', $(this).parent().is('.selected')).addClass('animate');
			window.dispatchEvent(new Event('resize'))
		}

		if (controlName == 'add' && $(".explore-control-add").is(':visible')) {
			$(".explore-control-add select").select2('open');
		}
		if (exploreType != 'main' && $(this).parent().hasClass(`explore-map-${dataType}-edit`)) {
			exploreMapEditor( $(this).parent().hasClass('selected') );
		}
		if (controlName == 'edit') {

			if ($(".explore-control-edit").is(":hidden")) {

	 			motusEditor.editMode = false;
				deckGL_renderMap( true );

			} else {
				motusEditor.editMode = true;
				if (motusMap.layers.length > 1 | !motusMap.layers.includes('stations') )  {
					deckGL_renderMap( true );
				} else {
//					deckGL_renderMap( true );
				}
			}
		}

	});

}
function exploreControls(el, opt) {
	opt = typeof opt === 'undefined' ? $(el).closest('div').attr('class').replace('explore-control-content ','').split(' ')[0].split('-').pop() : opt;
	if (opt == 'help') {

			exploreHelp();

	} else	if (opt == 'edit') {

		if (dataType == 'stations') {
			/*  Change point type
			motusMap.groupData = el.value.toLowerCase() == 'rectangles' ? 'rect' : (
				el.value.toLowerCase() == 'circles' ? 'circles' : false
			);
			motusMap.map.fire('moveend');
			*/
			var editorLayers = [];
			if ( $(el).val().includes("Prospective stations") ) {
				editorLayers.push("prospectiveStations");
			}

			if ( $(el).val().includes("Antenna ranges") ) {
				editorLayers.push("antennaRanges");
			}
			if ( $(el).val().includes("Coordination regions") ) {
				editorLayers.push("coordinationRegions");
			}
			if ( $(el).val().includes("Active stations") ) {
				editorLayers.push("stations");
			}

			motusMap.layers = editorLayers; // Keep only unique values
			editorMapLayers();

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
			$(".explore-card-profiles-tabs .explore-card-tab:not(.expand-menu-btn):not(.explore-card-map-tab):not(.explore-card-profiles-download-pdf-tab)").click();
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
							.style('fill', d => motusFilter.regions.includes(d.properties.iso_a2) ? "#FFF" : "#CCC" )
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
												.filter((d,i) => [0,8,9,13,14,17].includes(i)) // Select which columns to use
												// name, dtStart, dtEnd, nAnimals, nSpecies, project
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
function afterMapLoads() {

	if (exploreType == 'main') {

		$(".explore-control-content .explore-control-tab").click(function(){

			$(".explore-control-content .explore-control-tab").removeClass('selected');
			$(this).addClass('selected');

		});

		if ( ["regions", "projects", "species"].includes(dataType) ) {
			console.log(dataType);
			exploreSummaryTabSelect(dataType);
		} else {
			addMapLegend();
		}

/*
		if (dataType == 'regions') {

			$("#explore_map").hide();
			$("#explore_controls .explore-summary-control-options").hide();
		}*/

	} else if (false) {

		if (exploreType == 'regions') {


			exploreSummary({summaryType: "regions"});
	//		exploreRegions(motusFilter.regions);


		}
		else if (exploreType == 'projects') {

			exploreSummary({summaryType: "projects"});
//			exploreProjects(motusFilter.projects);
		}
		else if (exploreType == 'stations') {
				console.log(motusFilter[dataType]);
					exploreSummary({summaryType: "stations", selectedStations: motusFilter.stations});
//			exploreStations(motusFilter.stations);
		}
		else if (exploreType == 'species') {

					exploreSummary({summaryType: "species"});
//			exploreStations(motusFilter.stations);
		}
		else if (exploreType == 'animals') {

					console.log(motusData);
					console.log(motusFilter);
					exploreSummary({summaryType: "animals"});
//			exploreStations(motusFilter.stations);
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

		if (dataType == 'animals' || dataType == 'stations' || exploreType != 'main') {
			console.log($(".explore-control-timeline").innerWidth());
		//	alert(1);
		// TIMELINE
			if (exploreType == 'main') {
				dtLims = {
					min: d3.min(motusData.stations.map( d => new Date( d.dtStart ))),
					max: d3.max(motusData.stations.map( d => new Date( d.dtEnd )))
				}
			} else if (['species', 'animals'].includes(dataType)) {
				dtLims = {
					min: d3.min(motusData.selectedAnimals.map( d => new Date( d.dtStart ) )),
					max: d3.max(motusData.selectedAnimals.map( d => new Date( d.dtEnd ) ))
				}
	 		} else if ('stations' == dataType) {
				dtLims = {
					min: d3.min(motusData.selectedStations.map( d => new Date( d.dtStart ) )),
					max: d3.max(motusData.selectedStations.map( d => new Date( d.dtEnd ) ))
				}
	 		} else if (motusData.selectedStations.length > 0 || motusData.selectedAnimals.length > 0) {
				dtLims = {
					min: d3.min(
												motusData.selectedStations.map( d => new Date( d.dtStart ) )
													.concat(
														motusData.selectedAnimals.map( d => new Date( d.dtStart ) )
													)
												),
					max: d3.max(
												motusData.selectedStations.map( d => new Date( d.dtEnd ) )
													.concat(
														motusData.selectedAnimals.map( d => new Date( d.dtEnd ) )
													)
												)
				};
	 		} else {
				dtLims = {min: motusFilter.dtStart, max: motusFilter.dtEnd}
			}

			dtLims.min = typeof dtLims.min === 'undefined' ? motusFilter.dtStart : dtLims.min;
			dtLims.max = typeof dtLims.max === 'undefined' || dtLims.max > new Date() ? new Date() : dtLims.max;


			exploreTimeline({ min: dtLims.min.valueOf() / 1000,
												max: dtLims.max.valueOf() / 1000,
												defaultValues: [ motusFilter.dtStart.valueOf() / 1000, motusFilter.dtEnd.valueOf() / 1000 ],
											 	height: 150
											});

/*
			timeline.min = dtLims.min.valueOf() / 1000;
			timeline.max = dtLims.min.valueOf() / 1000;*/

			$("#explore_filters input.filter_dates").daterangepicker({
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
				motusMap.setVisibility();

			});

			$(timeline.el).dragslider("option", { "min": timeline.min, "max": timeline.max});

			timeline.createLegend();
		}


	$('.explore-card-wrapper').animate({'opacity':1}, 500);

	if (typeof deck !== 'undefined' && exploreType == 'main') {

			deckGL_map();

	}

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
		dom: '<"#explore_table_controls"lf><Bip><rBt>'
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

			filters.options.projects[d.id] = d.name;

		});
	}
	if (typeof motusData.stations !== 'undefined') {

		filters.options.stations = Object.fromEntries( motusData.stations.map( d => [ d.id, [ d.name, ( d.status != 'active' ? 'inactive' : 'active' ) ] ] ) );

	//	filters.options.frequencies = {};

	//	(Array.from(motusData.stations.map(d => d.frequency).values())).filter(onlyUnique).filter(d => d.length > 0 && d!="NA" && d.split(',').length == 1).forEach(d => filters.options.frequencies[`${d}`] = d + " MHz");
	}
	if (typeof motusData.species !== 'undefined') {
		motusData.species.forEach(function(d){

			filters.options.species[d.id] = d.english;

		});
	}

	if (typeof motusData.tagDeps !== 'undefined') {
		filters.options.models = motusData.tagDeps.map(d => d.model).filter(onlyUnique).filter(d => d.length > 0);
	//	filters.options.frequencies = {};
	//	(Array.from(motusData.tagDeps.map(d => d.frequency).values())).filter(onlyUnique).filter(d => d.length > 0 && d!="NA" && d.split(',').length == 1).forEach(d => filters.options.frequencies[`${d}`] = d + " MHz");
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

		timeline.setSlider([dtLims.min.valueOf()/1000, dtLims.max.valueOf()/1000], true);
		//$("#filter_summary > div:not(.explore_dates)").removeClass('visible');

//		if (exploreType != 'main') var summaryFilter = motusFilter[dataType];
	//	motusFilter = {};
//		if (exploreType != 'main') motusFilter[dataType] = summaryFilter;

		$("#filter_summary").removeClass('visible');

		$("#explore_filters").parent(".active").removeClass('active');

		updateData();

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


function loadDataTable(tbl, columns, options, onEvent) {

	/*

		This function loads a data table into a single element. It will reload data in this element each time it is run.
		tbl = name of the table you want to display
		filterVar = name of the variable you want to filter by

	*/

	if (typeof tbl === 'undefined') {
		tbl = dataType;
	}

	if (typeof tbl !== 'string') {
		var dataset = tbl[1];
		tbl = tbl[0];
	} else {
		var dataset = motusData[tbl];
	}

	if ($("#explore_table").length == 0) {
		$("#exploreContent").append('<div class="explore-table-wrapper"><table id="explore_table" style="width:100%"></table></div>');
	}
	if (dataType == 'projects' && typeof options.columns === 'undefined') {
		options.order = [[1, 'asc']]
		options.columns = [
			{className: "explore-table-expandRow", data: null, orderable: false, defaultContent: ""},
			{className: 'dt-center', data: "id", title: "Project ID"},
			{data: "name", title: "Project", "createdCell": function(td, cdata, rdata){
				$(td).html(
						`<a href='javascript:void(0);' onclick='viewProfile("projects", ${rdata.id});'>${cdata}</a>`
				);
			}},
			{className: 'dt-center', data: "dtCreated", title: "Start date"},
			{className: "dt-center", data: "stations", title: "Stations deployed", "render": {_: "display", sort: "order"}},
			{className: "dt-center", data: "animals", title: "Animals tagged", "render": {_: "display", sort: "order"}},
			{className: "dt-center", data: "species", title: "Species tagged", "render": {_: "display", sort: "order"}},
			{data: "fee_id", title: "Project group", "createdCell": function(td, cdata, rdata){
				$(td).html(
					`<a href='javascript:void(0);' onclick='viewProfile("projectsGroup", ["${cdata}"]);'>${cdata}</a>`
				);
			}}
		];

	}

	console.log(dataset);
	console.log(options.columns);
	if (typeof options.columns === "undefined") {
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
	}
	if ($.fn.DataTable.isDataTable("#explore_table")) {
		$("#explore_table").DataTable().clear().destroy();
	}

$("#explore_table").html("");
//	console.log(options);
	if (typeof options.columns !== 'undefined') {
		options = {
			...{
				data: dataset
			},
			...options
		};
	}
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

	var table = $("#explore_table").DataTable(options);

	if (typeof onEvent !== 'undefined') {
		if (typeof onEvent.length !== 'undefined') {
			onEvent.forEach(x => table.on(x.event, x.fun));
		} else {
			table.on(onEvent.event, onEvent.fun);
		}
	}
	$('#explore_table tbody').on('click', 'tr', function () {
    var data = table.row( this ).data();
		viewProfile(dataType + (typeof data.group !== 'undefined' && data.id == data.group ? "Group" : ""), [data.id])
  });

	if (exploreType != 'main') {
		motusFilter[exploreType].forEach(function(f) {addProfile(f, tbl)});
	} else {
		return false;
	}
}

function addProfile(profile_id, dataset) {

			motusFilter[exploreType].push(profile_id);
			motusFilter.selections.push(profile_id);

					updateURL(true);

}


function addExploreCardProfile(profile) {

	// Profile = {id, label, data: [ {type, label, value}, ... ] }

	// define the profile DOM structure
	var struct = "grid";
  var data = profile.data.filter(d => d.value > 0 || isNaN(d.value) || profile.data.length <= 4)
										.map((d, i) => `<div class='explore-card-profile-data explore-card-data${i + 1}' onclick='showProfileData("${profile.id}", "${d.type}")'>`+
																			`${d.icon || ""}`+
																			`<div class='explore-card-data-label'>${d.label}</div>`+
																			`<div class='explore-card-data-value'>${d.value}</div>`+
																		`</div>`);


	var toAppend = `<div class='explore-card-profile ${struct}-container' id='explore_card_profile_${profile.id}'>`+
										`<div class='explore-card-image tips enlarge' alt='Click to expand'><div class='explore-card-image-icon'>${icons.camera}</div></div>`+
								//	 	`<div class='explore-card-name'><div style='font-size:${24 - (Math.floor(profile.label.length/15)*2)}pt;'>${profile.label}</div></div>`+
									 	`<div class='explore-card-name'>`+
											`<div class='explore-card-name-text'>${profile.label}</div>`+
											`<div class='btn add_btn explore-card-add tips' alt='Compare with another ${dataType=="species"?dataType:dataType.substring(0, dataType.length - 1)}'>${icons.remove}</div>`+
											`<div class='btn explore-card-remove remove_btn tips' alt='Remove this ${dataType=="species"?dataType:dataType.substring(0, dataType.length - 1)}'>${icons.remove}</div>`+
										`</div>`+
										`<div class='explore-profile-summary-wrapper'>`+
										 	data.join('')+/*
  										`<div class='explore-profile-info'>`+
												'<div class="expand_btn"></div>'+
  										 	infoText+
  										 `</div>`+
										 `</div>`+*/
										// "<div class='explore-card-remove explore-card-subtext' alt='Remove "+exploreType+"'>"+'<div class="explore-card-remove-label">Remove</div>' + icons.remove +"</div>"+
									"</div>";

	$("#explore_card_profiles").prepend(toAppend);

}

function showProfileData(profileID, varName) {

	console.log("ProfileID: %s, varName: %s", profileID, varName);


	varName = dataTypes.filter(x=>varName.toLowerCase().includes(x.toLowerCase()))[0].toLowerCase();


	var tabName = (varName == 'animals' || varName == 'species') ? 'speciesHits' : varName == 'stations' ? 'stationHits' : varName == 'countries' ? 'map' : varName == 'detections' ? 'tagHits' : varName == 'projects' ? 'projectsTable' : varName;

	var subSelectionName = ['detected', 'tagged'].filter(x=>varName.toLowerCase().includes(x.toLowerCase()))[0];

	subSelectionName = subSelectionName ? subSelectionName : (dataType=='species'&&varName=='projects') ? 'with tag deployments' : false;

	console.log("tabName: %s, varName: %s, subSelectionName: %s", tabName, varName, subSelectionName);
	$(`.explore-card-profiles-tabs .explore-card-${tabName}-tab`).click();

	if (subSelectionName) {
		$(`#explore_card_${tabName} .explore-card-header select`).val(`${firstToUpper(varName)} ${subSelectionName}`).trigger('change');
	}
}

function addExploreCard(card) {


	if (card.data == 'custom') 	{
		var toAppend = "<div class='explore-card explore-card-"+card.type+"' id='explore_card_"+card.type+"'>"+card.html+"</div>";
		if (card.attachEl) {
			$(card.attachEl)[card.attachMethod](toAppend);
		} else {
			$(".explore-card-wrapper").append(toAppend);
		}
	}
	else if ( card.data == 'tabs' ) {

		// If a default is set use that one, otherwise use the first
		var selectedTab = ( typeof card.defaultTab !== 'undefined' ) ?  Object.keys(card.tabs)[card.defaultTab] : Object.keys(card.tabs)[0];

		// Make the header with a select input instead of plain text
		var exploreCardHeader = $("<div class='explore-card-header'><select style='width:100%;'></select></div>");

		if (Object.keys(card.tabs).length > 1) {
			// Add an option for each tab
			for (t in card.tabs) {
				exploreCardHeader.find('select').append( $("<option></option>").val(t).text(t).attr('selected', (selectedTab == t ? 'selected' : false) ) );
			}
		} else {
			exploreCardHeader.find('select').after(`${Object.keys(card.tabs)[0]}`);
			exploreCardHeader.find('select').remove();
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
		$('#explore_card_' + card.type + ' .explore-card-header select').select2({
			    minimumResultsForSearch: -1
			}).change(switchTabs);

		function switchTabs() {card.tabs[this.options[this.selectedIndex].value](card.type);}

		console.log("card");
		console.log(card);

		card.icon = typeof card.icon === 'undefined' ? icons[card.header.toLowerCase().split(' ')[0]] : card.icon;

		addExploreTab('explore-card-' + card.type, card.header, {icon: card.icon, insertAfter: 'explore-card-map-tab', card: card, selectedTab: selectedTab});

//		card.tabs[ selectedTab ]( card.type );

		exploreCard.hide();

	}
	else if (card.data == 'chart') {

		var toAppend = "<div class='explore-card explore-card-"+card.data+"' id='explore_card_"+card.type+"'><div class='explore-card-header'></div><div class='explore-card-chart-wrapper'><div><svg></svg></div></div></div>";

		$(".explore-card-wrapper").append(toAppend);

	}
	else if (card.data === 'add') {
		//$("#exploreContent .explore-card-map").append("<div class='explore-card explore-card-add tips' alt='Add a "+exploreType+"'><select class='explore-card-add-species' data-placeholder='Select a "+exploreType+"' style='width:200px;'><option></option></select></div>")


		card.el = $("#exploreContent .explore-card-add").get(0);
		//console.log(filters.options[exploreType]);
/*
		if (exploreType == 'stations') {
			for (d in filters.options[exploreType]) {
				$(`#exploreContent .explore-card-add-${exploreType}`).append(`<option value="${d}" class="filter-option-${filters.options[exploreType][d][1]}">${filters.options[exploreType][d][0]}</option>`);
			}
		} else {
			for (d in filters.options[exploreType]) {
				$(`#exploreContent .explore-card-add-${exploreType}`).append(`<option value="${d}">${filters.options[exploreType][d]}</option>`)
			}
		}*/
						testTimer.push([new Date(), "Setup option data"]);
		if (exploreType == 'stations') {
			var data = Object.entries(filters.options[exploreType]).map( x => ({id: x[0], text: x[1][0]}) );
		} else {
			var data = Object.entries(filters.options[exploreType]).map( x => ({id: x[0], text: x[1]}) );
		}

		testTimer.push([new Date(), "Setup click events"]);
		$("#exploreContent .explore-card-add").click(function(e){
			e.stopPropagation();
			if (!$(this).hasClass('visible') && !$('#explore_card_profiles').hasClass('view-solo')) {
				$(this).addClass('visible');
				$('body').click(function(){$("#exploreContent .explore-card-add").removeClass('visible');$(this).unbind('click');});
				$("#exploreContent .explore-card-add > select").select2("open");
			} else if ($('#explore_card_profiles').hasClass('view-solo')) {
				$('#explore_card_profiles').removeClass('solo-card view-solo');
				$('.explore-card-wrapper').removeClass('solo-card');
				$('.explore-card-profile').show();
			}
		});
				testTimer.push([new Date(), "Select2"]);

		$("#exploreContent .explore-card-add-" + exploreType).select2({
			data: data,
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
			width: "100%",
			placeholder: function(){return $(this).data('placeholder');},
		}).change(function(e) {

			if ($(this).hasClass("switch-profile")) {

				$(this).removeClass("switch-profile");

			 	const oldID = $(".explore-card-profile.switching").attr("data-profile-id");
			 	const newID = this.options[this.selectedIndex].value;

				motusFilter[dataType] = motusFilter[dataType].map( x => x==oldID?newID:x);
				motusFilter.selections = motusFilter.selections.map( x => x==oldID?newID:x);

				updateURL(true);

			} else {
				addProfile(this.options[this.selectedIndex].value);
			}


		}).on("select2:close",function(){
			$(this).closest('.explore-control-add').removeClass("visible");
		});

	}

	initiateTooltip(card.el);

	//updateURL();

}


function addExploreTab(el, header, opts = {}) {

	var tab = $(`<div class='${el}-tab explore-card-tab'>${header}</div>`);

	if (!opts.click) {

		if (typeof opts.card !== 'undefined') {
			var data = {fnc: opts.card.tabs[ opts.selectedTab ], arg: opts.card.type};
		}

		tab.click(data, function(e) {

			var elID = this.className.split(' ')[0].replace(/-/g,'_').replace(new RegExp("_tab$"),'');

			if ($(`#${elID}`).is(":hidden")) {
				console.log(`#${elID}`);
				$(".explore-card:not(#explore_card_profiles):visible").hide();

				$(`#${elID}`).show();

				// Create content on first click
				if ($(`#${elID} div:not(.explore-card-header)`).length == 0 && $(`#${elID} table`).length == 0) {
					e.data.fnc( e.data.arg );
				}

				// Redraw tables on subsequent clicks
				if ($(`#${elID} table`).length > 0) {
					console.log('Redrawing table')
					$(`#${elID} table`).DataTable().columns.adjust().draw();
				}
				// Redraw tables on subsequent clicks
				if ($(`#${elID} #explore_map`).length > 0) {
					deckGL_renderMap();
				}
			}
		});
	} else {
		tab.click(opts.click);
	}


	if (opts.icon) {
		tab.prepend(opts.icon);
	}
	if (!opts.noToggle) {
		tab.click(function(){$(this).toggleClass('selected',true);$(this).siblings().removeClass('selected');if ($(this).siblings('.expand-menu-btn').is(":visible") && $(this).parent().is(".expanded")) {$(this).siblings('.expand-menu-btn').trigger('click')}})
	}
	if (opts.insertAfter) {
		$(".explore-card-profiles-tabs  > ." + opts.insertAfter).after(tab);
	} else {
		$(".explore-card-profiles-tabs").append(tab);
	}
	if (opts.selected) {tab.trigger('click');}
}
/*

function setCardColours(colourFun) {

	$("#explore_card_profiles .explore-card-profile").each(function(){
	//	if ($("#explore_card_profiles .explore-card-profile").length == 1) {
	//		$(this).find('.explore-card-image').css('border-color', "#000000");
	//	} else {
			 var colour = exploreType == 'stations' ? colourFun($(this).find(".explore-card-name").text()) : exploreType == 'regions' ? colourFun( this.id.replace("explore_card_profile_", "") ) : colourFun(parseInt(this.id.replace("explore_card_profile_", "")));

			 $(this).find('.explore-card-image').css({'border-color':colour})
		//}

	});

}
*/
function setFilter(e) {

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

		var filterName = e.target.id.replace("filter_", "");

		var newFilter = $(e.target).val();
		console.log(filterName + ": " + newFilter);
		newFilter = newFilter.length == 0 ? ['all'] : (filterName == 'status' && newFilter == 'inactive' ? ['terminated','not active','pending'] : newFilter);

		motusFilter[filterName] = newFilter;

	//	var displayText = motusFilter[filterName].map(v => $("#filter_" + filterName + " option[value='" + v + "']").text());

		if (filterName == dataType) {
			if (motusFilter[dataType].includes('all') && motusFilter.selections.length > 0) {
		//		motusFilter[dataType] = motusFilter.selections;
			} else if ( !motusFilter.selections.every( x => motusFilter[dataType].includes(x))) {
		//		motusFilter[dataType].concat( motusFilter.selections.filter( x => !motusFilter[dataType].includes(x) ) );
			}
		}

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
	if (typeof deck !== 'undefined') deckGL_renderMap();
	return false;
}


function loadDataTypeGroupingTable() {
	var groupedData = [];
	var opts = {
					order: [[0, 'asc']],
					dom: '<"explore-table-header-controls"f><"explore-table-header-center"Blip>t',
					buttons: [
						'copyHtml5',
						'excelHtml5',
						'csvHtml5',
						'pdfHtml5'
					]
				};

	if (dataType == 'species') {
		groupedData = d3.rollup(
			motusData[dataType],
			v => {
				return {
					sort: d3.min(v, d => d.sort ),
					group: v[0].group,
					id: v[0].group,
					species: v.map( d => d.id ),
					animals: v.map( d => d.animals ).flat(),
					projects: v.map( d => d.projects ).flat().filter(onlyUnique),
					stations: v.map( d => d.stations ).flat().filter(onlyUnique),
					stationProjects: v.map( d => d.stationProjects ).flat().filter(onlyUnique)
				};
			},
			x => x.group
		);

		opts.columns = [
			{data: "sort", visible: false},
			{data: "group", title: "Species group"},
			{className: "dt-center", data: "projects", title: "Projects", "createdCell": function(td, cdata, rdata){
				$(td).html(
						`<a href='javascript:void(0);' onclick='viewProfile("projects", ["${cdata.join('","')}"]);'>${cdata.length}</a>`
				);
			}},
			{className: "dt-center", data: "animals", title: "Animals tagged", "createdCell": function(td, cdata, rdata){
				$(td).html(
						`<a href='javascript:void(0);' onclick='viewProfile("projects", ["${cdata.join('","')}"]);'>${cdata.length}</a>`
				);
			}},
			{className: "dt-center", data: "species", title: "Species tagged", "createdCell": function(td, cdata, rdata){
				$(td).html(
						`<a href='javascript:void(0);' onclick='viewProfile("projects", ["${cdata.join('","')}"]);'>${cdata.length}</a>`
				);
			}},
			{className: "dt-center", data: "stations", title: "Stations Visited", "createdCell": function(td, cdata, rdata){
				$(td).html(
						`<a href='javascript:void(0);' onclick='viewProfile("projects", ["${cdata.join('","')}"]);'>${cdata.length}</a>`
				);
			}},
			{className: "dt-center", data: "stationProjects", title: "Visited Station Projects", "createdCell": function(td, cdata, rdata){
				$(td).html(
						`<a href='javascript:void(0);' onclick='viewProfile("projects", ["${cdata.join('","')}"]);'>${cdata.length}</a>`
				);
			}}
		];

	} else if (dataType == 'projects') {

	 groupedData = d3.rollup(
			motusData[dataType],
			v => {
				var projects = v.map( d => d.id );
				var stations = motusData.stations.filter( x => projects.includes(x.project) ).map(x => x.id);
				var animals = motusData.animals.filter(x => projects.includes(x.project) );
				var species = animals.length == 0 ? [] : animals.map( x => x.species ).filter(onlyUnique);
				animals = animals.map(x => x.id);
				return {
					id: v[0].fee_id,
					group: v[0].fee_id,
					projects: projects,
					animals: animals,
					species: species,
					stations: stations
				};
			},
			x => x.fee_id
		);

		opts.columns = [
			{data: "group", title: "Project group"},
			{className: "dt-center", data: "projects", title: "Number of Projects", "createdCell": function(td, cdata, rdata){
				$(td).html(
						`<a href='javascript:void(0);' onclick='viewProfile("projects", ["${cdata.join('","')}"]);'>${cdata.length}</a>`
				);
			}},
			{className: "dt-center", data: "animals", title: "Animals tagged", "createdCell": function(td, cdata, rdata){
				$(td).html(
						`<a href='javascript:void(0);' onclick='viewProfile("projects", ["${cdata.join('","')}"]);'>${cdata.length}</a>`
				);
			}},
			{className: "dt-center", data: "species", title: "Species tagged", "createdCell": function(td, cdata, rdata){
				$(td).html(
						`<a href='javascript:void(0);' onclick='viewProfile("projects", ["${cdata.join('","')}"]);'>${cdata.length}</a>`
				);
			}},
			{className: "dt-center", data: "stations", title: "Stations deployed", "createdCell": function(td, cdata, rdata){
				$(td).html(
						`<a href='javascript:void(0);' onclick='viewProfile("projects", ["${cdata.join('","')}"]);'>${cdata.length}</a>`
				);
			}}
		];
	}

	return [Array.from(groupedData.values()), opts];
}
function updateData() {

	if (exploreType != 'main') {
		if ($("#exploreContent .explore-card-profile").length == 1) {
		//	$(".explore-card-wrapper").addClass('solo-card');
		//	$("#explore_card_profiles").addClass('solo-card');
			$(".explore-card-wrapper #explore_card_profiles .explore-card-profile").addClass('expanded');
			try { motusMap.setColour('id'); }
			catch(err) { console.log("motusMap not yet created"); }
		} else {
			$(".explore-card-wrapper").removeClass('solo-card');
			$("#explore_card_profiles").removeClass('solo-card');
			$(".explore-card-wrapper #explore_card_profiles .explore-card-profile").removeClass('expanded');
			try { motusMap.setColour(exploreType=='stations' ? 'name' :'species'); }
			catch(err) { console.log("motusMap not yet created"); }
		}

	}
	window.dispatchEvent(new Event('resize'));

	motusMap.setVisibility();

	updateURL();

}
