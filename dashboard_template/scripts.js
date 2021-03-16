//https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
// usage example:
// var a = ['a', 1, 'a', 2, '1'];
// var unique = a.filter(onlyUnique);

var motusFilter = {
	dtStart: new Date(),
	dtEnd: new Date(),
	species: "all",
	regions: "all",
	projects: "all",
	stations: "all",
	frequencies: "all",
	status: "all",
	colour: ''
};
var isMobile = false;
var URLdataType = null,
	URLmapType = null;
	
function loadContent() {
	
	isMobile = window.mobileCheck();
	$("body *").cleanWhitespace();
	
	if (window.location.hostname != 'localhost') {
		$(".header-logos .motus-logo").attr('src', "https://" + window.location.hostname + '/images/motus-logo.png');
		$(".header-logos .birds-canada-logo").attr('src', "https://" + window.location.hostname + '/images/BirdsCan_SQ_ENG.png');
	}
		
	var urlFilter = {
		dtStart: getUrlParameter('dtStart'),
		dtEnd: getUrlParameter('dtEnd'),
		species: getUrlParameter('species'),
		regions: getUrlParameter('regions'),
		projects: getUrlParameter('projects'),
		stations: getUrlParameter('stations'),
		status: getUrlParameter('status'),
		frequencies: getUrlParameter('frequencies'),
		colour: getUrlParameter('colour')
	};
	motusFilter = {
		dtStart: urlFilter.dtStart === undefined ? new Date(timeline.min * 1000) : new Date(urlFilter.dtStart),
		dtEnd: urlFilter.dtEnd === undefined ? new Date(timeline.max * 1000) : new Date(urlFilter.dtEnd),
		species: urlFilter.species === undefined ? "all" : urlFilter.species.split(','),
		regions: urlFilter.regions === undefined ? "all" : urlFilter.regions.split(','),
		projects: urlFilter.projects === undefined ? "all" : urlFilter.projects.split(','),
		stations: urlFilter.stations === undefined ? "all" : urlFilter.stations.split(','),
		status: urlFilter.status === undefined ? "all" : urlFilter.status.split(','),
		frequencies: urlFilter.frequencies === undefined ? "all" : urlFilter.frequencies.split(','),
		colour: $("#explore_filters .colourType_selector option[value='" + urlFilter.colour + "']").length == 0 ? $(".colour_picker .colourType_selector").select2('val') : urlFilter.colour
	};
	
	
	URLdataType = getUrlParameter('dataType');
	URLdataType = $(".exploreBy:has(.mainstat span:contains('" + (URLdataType == 'species' ? 'animals' : URLdataType) + "'))").length > 0 ? URLdataType : dataType;
		
	//dataType = URLdataType;
	
	URLmapType = getUrlParameter('mapType');
	
	
	URLmapType = $(".toggleButton.mapBy:contains('" + firstToUpper(URLdataType == 'species' && URLmapType == 'points' ? 'deployments' : URLmapType) + "')").length > 0 ? URLmapType : mapType;
	
	//mapType = URLmapType;
	
	//$(".toggleButton.exploreBy").removeClass('selected');
	if (URLdataType !== undefined && URLdataType != null) {$(".toggleButton.exploreBy").removeClass('selected');}
	if (URLmapType !== undefined && URLmapType != null) {$(".toggleButton.mapBy").removeClass('selected');}
	$(".exploreBy:has(.mainstat span:contains('" + (URLdataType == 'species' ? 'animals' : URLdataType) + "'))").addClass('selected');
	$(".toggleButton.mapBy.dataType_" + URLdataType + ":contains('" + firstToUpper(URLdataType == 'species' && URLmapType == 'points' ? 'deployments' : URLmapType) + "')").addClass('selected');
	
//		console.log(".exploreBy:has(.mainstat span:contains('" + (URLdataType == 'species' ? 'animals' : URLdataType) + "')) = " + $(".exploreBy:has(.mainstat span:contains('" + (URLdataType == 'species' ? 'animals' : URLdataType) + "'))").length);
//		console.log(".toggleButton.mapBy:contains('" + firstToUpper(URLdataType == 'species' && URLmapType == 'points' ? 'deployments' : URLmapType) + "') = " + $(".toggleButton.mapBy:contains('" + firstToUpper(URLdataType == 'species' && URLmapType == 'points' ? 'deployments' : URLmapType) + "')").length);
					
//	$("#exploreBy_" + URLdataType).addClass('selected');
	
	if (!isMobile) {
		$('.tips').mousemove(function(e){
			$('.tooltip').text($(this).attr('alt'));
			
			//	console.log("tooltip.left: " + parseInt($('.tooltip').css('left')) + " + tooltip.width: " + $('.tooltip').outerWidth() + " = " + (parseInt($('.tooltip').css('left')) + $('.tooltip').outerWidth()) + "  >  " + $(window).width());
			
			if (e.pageX + 15 + $('.tooltip').outerWidth() > $(window).width()) {
				$('.tooltip').css({top:e.pageY - 10, left:e.pageX - $('.tooltip').outerWidth() - 15});
			} else {
				$('.tooltip').css({top:e.pageY - 10, left:e.pageX + 15});
			}
			
			$('.tooltip:hidden').show();
		//	console.log("Top: " + $(this).offset().top + " - Left: " + $(this).offset().left)
		}).mouseleave(function(){$('.tooltip').hide()});
	
	}
	
	$("#lightbox").click(function(){$(this).fadeOut(250);$("#lightbox_bg").fadeOut(250);});
	
	$('img.enlarge').click(function(){
		
		$("#lightbox_bg").fadeIn(250);
		$("#lightbox img").attr('src', $(this).attr('src')).parent().fadeIn(250);
	
	});
	
	var allValues = [];
	$('.explore_species .table td.chart-data').each(function(){
		allValues.push(parseInt($(this).text())); 
	});
		
	var maxValue = Math.max.apply(null, allValues);
	
	$('.explore_species .table td.chart-horiz').each(function(){
		var val = parseInt($(this).closest('tr').find('td:nth-child(3)').text());
		//console.log("$('.explore_species').innerWidth():" + $('.explore_species').innerWidth() + " - $('.explore_species .table tr').outerWidth():" + $('.explore_species .table tr').outerWidth() + " - $('.explore_species .table td:last-child').outerWidth():" + $('.explore_species .table td:last-child').outerWidth() + " = " + maxWidth);
		//console.log("maxWidth:" + maxWidth + " * val:" + val + " / maxValue:" + maxValue + " = " + (maxWidth * val / maxValue));
		$(this).css({width:"100%"}).append('<div></div>')
		var maxWidth = $(this).innerWidth();
		$(this).find('div').css({backgroundColor:$(this).closest('tr').find('.legend_color').css('background-color'), width: Math.floor(100 * (maxWidth * val / maxValue) / $(this).outerWidth()) + "%", height:'100%', display:'none', border:"solid 1px black"});
	});
	
	$('.explore_species table.table').css("width", "100%");
	$('.explore_species .table td:last-child div').show(250);
	
	$('#leftMenu .icon').click(function(){
		if ($('#leftMenu').hasClass('visible')) {
			$('#leftMenu').removeClass('visible')
			$('#leftMenu .icon.close').hide();
			$('#leftMenu .icon.open').show();hhh
		} else {
			$('#leftMenu').addClass('visible');
			$('#leftMenu .icon.close').show();
			$('#leftMenu .icon.open').hide();
		}
	});
	
	$(".explore_metrics > .header, .explore_card > .header").click(function(){
		if (!$(this).parent().hasClass("expanded_metrics")) {
			if ($(this).parent().hasClass('visible')) {
				$(this).children('.metric_controls, .metric_legend').fadeOut(100);
				$(this).siblings().slideUp(100);
				$(this).parent().removeClass('visible');
			} else if (!$(this).parent().hasClass('visible')) {
				$(this).children('.metric_controls, .metric_legend').fadeIn(100);
				$(this).siblings('.visible').slideDown(100);
				if ($(this).siblings('.visible').length == 0) {$(this).siblings().slideDown(100);}
				$(this).parent().addClass('visible');
			}
		}
	});
	
	
	$(".explore_metrics:not(.visible) > .header, .explore_card:not(.visible) > .header").each(function(){
		$(this).children('.metric_controls, .metric_legend').fadeOut(100);
		$(this).siblings('.visible').slideUp(100);
	});
	
	$(".explore_metrics > .header > .metric_controls, .explore_metrics > .header > .metric_legend").click(function(e){e.stopPropagation();});
	
	$(".metric_controls img, #dateSlider .timeline").click(function(){
	
		if ($(this).hasClass('graph') & !$(this).closest(".explore_metrics").children(".visible").hasClass('graph')) {
			$(this).closest(".explore_metrics").children(".visible").removeClass('visible').siblings('.graph').addClass('visible');	
		} 
		
		if ($(this).hasClass('table') & !$(this).closest(".explore_metrics").children(".visible").hasClass('table')) {
			$(this).closest(".explore_metrics").children(".visible").removeClass('visible').siblings('.table').addClass('visible');
		} 
		
		
		if ($(this).hasClass('expand')) {
			if (! $(this).closest('.explore_metrics').children(".visible").hasClass('graph')) {
				$("#lightbox_bg").css({opacity:1,background:"white"}).fadeIn(250);
				
				$(this)
					.closest('.explore_metrics')
					.addClass('expanded_metrics')
					.css({
						top: $(this).closest('.explore_metrics').children('.visible').is('#explore_main_map') ? "0": "calc(50% - " + ($(this).closest('.explore_metrics').outerHeight()/2) + "px)"
					})
					.find('.metric_controls')
					.fadeOut(250);
					
				$("body").css({overflow:"hidden"});
				
				if ($(this).closest('.explore_metrics').children('.visible').is('#explore_main_map')) {
					var mapContainerID = $(this).closest('.explore_metrics').children('#explore_main_map.visible').attr('id');
					var dims = {w: $("#" + mapContainerID).outerWidth() - $(window).width(), h: $("#" + mapContainerID).outerHeight() - $(window).height()};
				}
				
				$("#lightbox_bg").unbind().click(function(){
					if ($(".expanded_metrics").children('.visible').is('#explore_main_map')) {
						var mapContainerID = $(".expanded_metrics").children('#explore_main_map.visible').attr('id');
					}
					$(".expanded_metrics")
						.removeClass('expanded_metrics')
						.css({
							top: "auto"
						})
						.find('.metric_controls')
						.fadeIn(250);
					$("body").css({overflowY:"scroll"});
					$("#lightbox_bg").css({opacity:0.5,background:"#555555"}).fadeOut(250);
					
				});
			} else {
				$(this).closest('.explore_metrics').children(".visible").click();
			}
		}
	
	});
	
	//$('#explore_filters:hidden').css({marginBottom:"-" + $('#explore_filters:hidden').innerHeight() + "px"});
	$("#dateSlider .slider").dragslider({
		range: true,
		rangeDrag: true,
		min: timeline.min,
		max: timeline.max,
		step: timeline.step,
		values: [ motusFilter.dtStart.getTime() / 1000, motusFilter.dtEnd.getTime() / 1000 ],
		create: function(e, ui) {
			timeline.position = $(this).dragslider("values")
			timeline.setSlider(timeline.position);
		//	updateURL();
			$(".ui-slider .ui-slider-handle").focus(function(){$(this).blur();});
			map.setVisibility();
		},
		slide: function( event, ui ) {
			timeline.position = $(this).dragslider("values");
			timeline.setSlider(timeline.position);
			map.setVisibility();
		},
		stop: updateURL
	});
	timeline.range = $("#" + timeline.el).dragslider('option', 'max') - $("#" + timeline.el).dragslider('option', 'min');
	
	$(".toggleButton:not(.mapBy):not(.exploreTables):not(.animate_timeline) > div:first-child, .toggleButton.animate_timeline > div, .toggleButton.mapBy, .toggleButton.exploreTables").click(function(e){

		var btn_el = $(this).hasClass('toggleButton') ? this : this.parentElement;
		
		var toggleName = btn_el.className.split(" ");
		
		while(toggleName[0] == "toggleButton" || toggleName[0] == "selected" || toggleName[0] == "disabled") {
			toggleName.shift();
		}
		
		toggleName = toggleName[0];
		
		if (toggleName == 'exploreTables') {
			viewMetadata($(btn_el).clone().children().remove().end().text().replace(/\s/g,'').toLowerCase(), dataType)
		} else if ( ( toggleName == 'exploreBy' || toggleName == 'mapBy' ) && !$(btn_el).hasClass('selected')) {
			
			$(".toggleButton." + toggleName + ".selected").removeClass('selected');
			$(btn_el).addClass('selected');
			$(".toggleButton." + toggleName + ":contains('" + btn_el.innerHTML + "')").addClass('selected');
			
			var typeToShow = toggleName == 'exploreBy' ? $(btn_el).find('span').text().toLowerCase().replace(' ','') : btn_el.innerHTML.toLowerCase();

			typeToShow = typeToShow == 'animals' ? 'species' : typeToShow == 'deployments' ? 'points' : typeToShow;
		
			$(".toggleButton." + toggleName + ":not(.selected)").each(function(){
				
				var typeToHide = $(this).hasClass('exploreBy') ? $(this).find('span').text().toLowerCase().replace(' ','') : this.innerHTML.toLowerCase();

				typeToHide = typeToHide == 'animals' ? 'species' : typeToHide == 'deployments' ? 'points' : typeToHide;

				$("." + toggleName.replace('By', '') + "_type_" + typeToHide).hide();
				
			});
		
			
			if (toggleName == 'exploreBy' && (dataType != typeToShow || dataType == null)) {
				
				$(".dataType_" + (dataType == null ? typeToShow == 'stations' ? 'species' : 'stations' : dataType)).addClass("hidden");
				
			//	console.log("Datatype: " + typeToShow + " - " + (dataType == null ? typeToShow == 'stations' ? 'species' : 'stations' : dataType));
				
				dataType = typeToShow;
				
				console.log('dataType: ' + dataType + ' - mapType: ' + mapType);
				
				mapType = (mapType == null || mapType == 'table') ? mapType : dataType == 'species' ? 'tracks' : 'points';
				
				console.log('dataType: ' + dataType + ' - mapType: ' + mapType);
				
				
				$(".dataType_" + dataType).removeClass("hidden");
				// Check if map type has been set
				if (mapType != null) {
					// Only load the DataTable if it's visible
					if (mapType == 'table') {
						loadDataTable();
					} else { // Only set map visibility if table isn't visible
						
						$("#explore_filters .colourType_selector").trigger("change");
						
						map.setVisibility(true);
												
						$(".toggleButton.mapBy:contains('" + firstToUpper(mapType) + "')").click();
						
						/*if ($(".mapBy.toggleButton.selected:not(.hidden)").length == 0) {
							$(".mapBy.toggleButton:contains('Points'):not(.hidden)").click();
						} else {
							$(".mapBy.toggleButton.selected:not(.hidden)").removeClass('selected').click();
						}*/
					}
					updateURL();
				} else { // If map type hasn't been set, trigger click on selected option
					$(".mapBy:visible.toggleButton.selected:not(.hidden)").removeClass('selected').click();
				}
			} else if (toggleName == 'mapBy' && (mapType == null || mapType != typeToShow)) {
				
				$(".mapType_" + mapType + ":not(.mapType_" + typeToShow + ")").addClass("hidden");
				mapType = typeToShow;
		//		console.log("Map by: " + mapType);
				$(".mapType_" + mapType).removeClass("hidden");
				// Only load the DataTable if it wasn't visible before
				if (mapType == 'table') {
					loadDataTable();
				} else { // Only set map visibility if table isn't visible
					$("#explore_filters .colourType_selector").trigger("change");
					map.setVisibility(true);
				}
				$(".colour_picker select").trigger('change');
				updateURL();
			} else {
				$(".colour_picker select").trigger('change');
				console.log('ALERT');
			}
			
		} else if (toggleName == 'filterButton') {
			
			
			if ($(btn_el).hasClass('clear_filters')) {
				
				$('.clear_filters').click();
				
				$(btn_el).removeClass('visible');
				
			} else {
			
				$(btn_el).toggleClass('selected');
			
			}
			if ($(btn_el).hasClass('selected')) { // Show filter options 
				$('#dateSlider:not(.visible)').addClass('visible');
			} else { // Hide filter options
				if (!$('.animate_timeline').hasClass('selected')) {
					$('#dateSlider.visible').removeClass('visible');
				}
				
			}
	//		$('#explore_filters').css({marginBottom:"-" + $('#explore_filters').innerHeight() + "px"});
		} else if (toggleName == 'animate_timeline') {
			
			
			var opt = e.target.tagName != 'DIV' ? $(e.target).closest('div').get(0) : e.target;
			
			console.log(opt);
			
			timeline.status = opt.className.split(' ')[ opt.className.split(' ').length - 1 ];
			
			if (timeline.status == 'play' || timeline.status == 'replay') {
				
				if ($(opt).hasClass('pause')) {
					//timeline.status = 'replay'
					$(btn_el).removeClass('pausedAnimation');
					$(opt).removeClass('replay');
				}
				
				if (!$(btn_el).hasClass('selected') || timeline.status == 'replay') {
					
					animateTimeline();
				}
				
				
				if (!$(btn_el).hasClass('selected')) {
					$('#dateSlider:not(.visible)').addClass('visible');
					$(btn_el).addClass('selected');
					$(btn_el).attr('alt', 'Close');
				} else if (timeline.status == 'replay') {
					
					$(btn_el).find("> div.pause").attr('alt', 'Pause animation')
					
					$(btn_el).removeClass('finishedAnimation');
				} else {
					//$('#dateSlider:not(.visible)').removeClass('visible');
					$(btn_el).removeClass('finishedAnimation pausedAnimation');
					$(btn_el).find("> div.pause").attr('alt', 'Pause animation').removeClass('replay');
					$(btn_el).attr('alt', 'Play animation')
					timeline.animationEnd(true);
				} 
				
			} else if (timeline.status == 'pause') {
				
				$(btn_el).find("> div.pause").addClass('replay');
				$(btn_el).addClass('pausedAnimation');
				
			} else if (timeline.status == 'stop') {
				
				$(btn_el).find("> div.pause").removeClass('replay');
				$(btn_el).removeClass('pausedAnimation');
				timeline.animationEnd(true);
				
			}
			
		} else if (toggleName == 'search_filter' || toggleName == 'colour_picker' || toggleName == 'download_button') {
			
			
			$(btn_el).toggleClass('selected');
			
			if ( toggleName == 'colour_picker' && $(btn_el).hasClass('selected') ) {
			
				$(".colour_picker select").select2( "open" );
				
				$("#explore_main_map_legend:not(.visible) .showHide").trigger('click');
				
			
			} else if ( toggleName == 'search_filter' && $(btn_el).hasClass('selected') ) {
				
				$(btn_el).find('.search_filter_input').focus();
				
			}
		
		}
		
	});
	
	$('.search_filter_input').blur(function(e){
		e.stopPropagation();
		$(this).closest('.toggleButton').trigger('click');
	}).on('keydown', function(e){
		if (e.originalEvent.keyCode == 13 || e.originalEvent.keyCode == 27 ) {$(this).closest('.toggleButton').trigger('click');}
	});
	
	$(".toggleButton.exploreBy.selected").removeClass('selected').find('> div:first-child').click();
	
	$(".search_filter_input").click(function(e){e.stopPropagation();});
			
	
//	map.setVisibility();
	
//	loadDataTable();
	
	console.log('dataType: ' + dataType + ' - mapType: ' + mapType);
	
	for (f in motusFilter) {
		if (motusFilter[f] != 'all' && f != 'colour') {$("#explore_filters .explore_" + f).val(motusFilter[f]).trigger("change");}
		else if (f == 'colour') {$(".colour_picker .colourType_selector").val(motusFilter[f] == 'id' ? 'animals' : motusFilter[f]).trigger("change");}
	}
	
	
	
	$(".explore_species table.table").DataTable( {
	//$("#explore_species_table").DataTable( {
		"dom": '<"top">rt<"bottom"ilp><"clear">',
		"columnDefs": [ {
			"targets": 0,
			"orderable": false
			}, {
			"targets": 7,
			"orderable": false
			} ]
	} );
	
	$(".explore_species .dataTables_wrapper").addClass('visible table');
	
	

}

var dataColNames = {
	projID: 'Project ID',
	deployID: 'Deployment ID',
	status: 'Status',
	name: 'Name',
	serno: 'Serial number',
	dtStart: 'Start date',
	dtEnd: 'End date',
	lat: 'Latitude',
	lon: 'Longitude',
	nAnt: 'Number of antennas',
	frequency: 'Frequency',
	species: 'Species',
	model: 'Model',
	tagID: 'Tag ID',
	manufacturer: 'Brand',
	lat1: 'Initial latitude',
	lon1: 'Initial longitude',
	lat2: 'Final Latitude',
	lon2: 'Final longitude'
	
}

function loadDataTable() {
	
	var tbl = $(".toggleButton.exploreBy.selected .mainstat span").text() == 'animals' ? $(".toggleButton.mapBy.selected").text().toLowerCase() == 'deployments' ? "tracks" : "tagDeps" : "stations";
	
	console.log("Table: " + tbl);
	if ($("#exploreTable.dataType_" + tbl).length == 0) {
		
		// Remove all classes
		$("#exploreTable").removeClass();
		$("#exploreTable").addClass("dataType_" + tbl);
		
		var columnNames = Object.keys(rawData[tbl][0]);
		
		console.log(columnNames);
		
		var columns = [];
		
		for (var i in columnNames) {
			columns.push({
				data: columnNames[i], 
				title: dataColNames[columnNames[i]]
			});
		}
		//console.log($.fn.DataTable.isDataTable("#exploreTable"));
		if ($.fn.DataTable.isDataTable("#exploreTable")) {
			$("#exploreTable").DataTable().clear().destroy();
		}
		
		//console.log(rawData[tbl][0]);
		$("#exploreTable").html("");
	//	console.log(columns);

		$("#exploreTable").DataTable({
			data: rawData[tbl],
			columns: columns
		});
	}
	
}


function animateTimeline() {
	
	timeline.distance = timeline.position[1] - timeline.position[0];
	
	timeline.distance = (timeline.distance / timeline.range) > 0.99 ? timeline.range / 100 : timeline.distance;

	$("#dateSlider .slider").dragslider('values', [timeline.min, timeline.min + timeline.distance]);

	timeline.timer_length = 3000 - (3000 * timeline.distance / timeline.range);
				
	if (timeline.timer === undefined) {timeline.timer = d3.timer(timeline.animate);}
	else {timeline.timer.restart(timeline.animate)}
		
	if (timeline.timer !== 'undefined') {timeline.timer.stop();}
	
	timeline.timer = d3.timer(timeline.animate);
}


function populateSelectOptions() { // projs = projects, spp = species
	var toAppend = "<div class='flex-container'>"+
						"<div class='flex-container'>"+
						(["projects","stations","species","regions","frequencies","dates"].map(function(x){
								
							const classes = ['stations','species'].includes(x) ? ' class="dataType_' + x +'"': "";
								
							return "<div"+classes+">"+(x == 'dates' ? "<input " : "<select ")+" class='explore_"+x+"'"+(x == 'dates' ? '>' : "' multiple='multiple' "+(x == 'status' ? " style='width:150px' " : x == 'frequencies' ? " style='width:170px' " : "")+"data-placeholder='All "+x+"'><option value='all'></option></select>") + "</div>";
							
						}).join(""))+
						"</div>"+
						"<div class='filterButton clear_filters tips' alt='Clear filters'>"+
							'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>'+
						"</div>"+
					"</div>";
	
	$("#explore_filters").append(toAppend);
	
	
	
	//rawData.projects = response[0];
	//rawData.species = response[1];
	
	rawData.projects.forEach(function(r){ // r = row
		
		$("#explore_filters .explore_projects").append("<option value='" + r.id + "'>" + r.name + "</option>");
		
	});
			
	$("#explore_main_wrapper .project_count").text(rawData.projects.length);
	
	for (r in rawData.species) { // r = row
		
		$("#explore_filters .explore_species").append("<option value='" + r + "'>" + rawData.species[r] + "</option>");
		
	}
	
	["active", "terminated", "prospective", "expired"].forEach(function(r){ // r = row
		
		$("#explore_filters .explore_status").append("<option value='" + r + "'>" + firstToUpper(r) + "</option>");
		
	});
	
	
	rawData.frequency.forEach(function(x){
		
		$("#explore_filters .explore_frequencies").append("<option value='" + x + "'>" + x + " (MHz)</option>");
		
	});

	
	$("#explore_filters select, .colour_picker select").select2({
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
		placeholder: function(){return $(this).data('placeholder');}
	}).on("change", setFilter);//.trigger('change'); 
	
	$(".colour_picker select").on("select2:close", function(){$(this).closest('.toggleButton').trigger('click');});
	
	$("#explore_filters input.explore_dates").daterangepicker({
		opens: 'left',
		minDate: new Date(timeline.min * 1000),
		startDate: new Date(timeline.min * 1000),
		maxDate: new Date(timeline.max * 1000),
		endDate: new Date(timeline.max * 1000),
		locale: {
			format: "YYYY/MM/DD"
		},
        ranges: {
           'Today': [moment(), moment()],
           'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
           'Last 7 Days': [moment().subtract(6, 'days'), moment()],
           'Last 30 Days': [moment().subtract(29, 'days'), moment()],
           'This Month': [moment().startOf('month'), moment().endOf('month')],
           'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
	}, function(start, end, label) {
		
		timeline.setSlider( [ start.valueOf() / 1000, end.valueOf() / 1000 ] );
		map.setVisibility();
  
	});
	
	
	// If you click one of the filters displayed in the summary
	$('#filter_summary > div:not(.clear_filters) > span').click(function(){
		
		// First class will always be the filter name
		var filterName = this.parentElement.classList[0];
		
		var filterIsOpen = $(".filterButton.toggleButton.selected").length != 0;
		
		// Show filter options 
		if (!filterIsOpen) {
			$(".filterButton.toggleButton > .mainstat").trigger('click');
		}
		// Explore dates is a timeline, so it's already displayed when filter options are open
		if (filterName != 'explore_dates') {
			// If not date, open the select menu			
			if (filterIsOpen) {
				$("#explore_filters ." + filterName).select2("open");
			} else {
				setTimeout('$("#explore_filters .' + filterName + '").select2("open");', 500);
			}
		}
	});
	
	$(".clear_filters").click(function(){
		
			for (f in motusFilter) {
				if (f != 'dtStart' && f != 'dtEnd' && f != 'colour') {
					if ($("#explore_filters select.explore_" + f).select2("val") != 0) {
						$("#explore_filters select.explore_" + f).select2().val(null).trigger("change");
					}
				}
			}
			
			timeline.setSlider([timeline.min, timeline.max]);
			//$("#filter_summary > div:not(.explore_dates)").removeClass('visible');
			
			$("#filter_summary").removeClass('visible');
			
			updateURL();
			
	});
	
	// Hide everything until it's loaded
	$('body').addClass('visible');
	
	
	// If the window is resized, we;ll need a way to resize the activity timeline. 
	// There's definitely a better way to do this that I just haven't yet looked into.
	$(window).on('resize', function(){
		
		var oldWidth = $("#activityTimeline").attr("width");
		var newWidth = $("#explore_main_wrapper").innerWidth();
		
		$("#activityTimeline, #activityTimeline rect").attr("width", newWidth);
		$("#activityTimeline path").attr("d", "M0.5,6V0.5H" + newWidth + "V6");
		$("#activityTimeline g.tick").attr("transform", function(){
			
			return "translate(" + ( this.transform.baseVal.consolidate().matrix.e * (newWidth / oldWidth) ) + ",0)";
			
		});
	})
	
	$(".showHide").click(function(){
		$(this).parent().toggleClass('visible');
	});
	
}

function setFilter(e) {
	
	if ($(this).hasClass('colourType_selector') && mapType != 'table' && mapType != null) {
		
		var val = this.value;
		
		console.log(val);
		
		val = (val == 'animals' && mapType == 'tracks') ? 'id' : val;
		
		motusFilter.colour = val;
	
		val = (val == 'species' && dataType == 'stations') ? val = 'nSpp' :  val;
		
		//console.log('dataType: ' + dataType + ' - mapType: ' + mapType + ' - value: ' + val);
		
		var i = (this.selectedIndex == 0 ? this.selectedIndex+1 : this.selectedIndex - 1);
		var iterations = this.options.length;
		
		while (typeof map.colorScales[dataType][mapType][val] === 'undefined' && iterations != 0) {
			
			iterations--;
			i++;
			i = i == this.options.length ? 0 : i;
			
			val = this.options[i].value;
		
			val = (val == 'animals' && mapType == 'tracks') ? 'id' : val;
		
			motusFilter.colour = val;
	
			val = (val == 'species' && mapType != 'tracks') ? val = 'nSpp' : (val == 'animals' && mapType == 'tracks') ? 'id' : val;
			
			$(this).select2('data',{id: val, text: this.options[i].innerHTML});
//			val = $('select.colourType_selector').hasClass('');
			motusFilter.colour = val;
		}
		
		
		console.log('dataType: ' + dataType + ' - mapType: ' + mapType + ' - value: ' + val);
		
		
		map.svg
			.selectAll('.explore-map-' + dataType + '.explore-map-' + mapType)
			.style(mapType == 'tracks' ? 'stroke' : 'fill', d => map.colorScales[dataType][mapType][val](d[val]));
		
		map.legend.svg.html("");
		
		
		
		var colourScale = map.colorScales[dataType][mapType][val];
		
//		console.log(map.legend.el._groups[0][0]);

		
		if (val == 'nSpp' || val == 'animals' || val == 'lastData') {
			
			$("#explore_main_map_legend svg").show();
			
			$(map.legend.el._groups[0][0]).find('.legend-table-wrapper').hide();
			
			if (val == 'animals') {
				var d = colourScale.domain();
				colourScale.domain([d[1], d[0]]);
			}
			
			var legendWidth = $(map.legend.el._groups[0][0]).parent().outerWidth();
			
			$(map.legend.el._groups[0][0])
				.removeClass('vertical-legend')
				.find('svg')
				.show()
				
			legend({
				el: map.legend.svg,
				color: colourScale,
				title: $(this).select2('data')[0].text,
			//	ticks: ((val == 'projID' && mapType != 'regions') ?  : undefined),
				tickFormat: ( (val == 'nSpp' || val == 'species' || val == 'animals') ? ".0f" : 's' ),
				invert: (val == 'nSpp' || val == 'species' || val == 'animals'),
				width: legendWidth > 600 ? 600 : legendWidth
			});
			
			if (val == 'animals') {
				d = colourScale.domain();
				colourScale.domain([d[1], d[0]]);
			}
			
		} else {
//				$("#explore_main_map_legend svg").hide();
		//	var legendHeight = $(map.legend.el._groups[0][0]).parent().outerHeight();
			
			
			var fullDomain = (val == 'frequency' || val == 'status') ? rawData[val] : 
								val == 'id' ? Object.keys(rawData.animals) : 
								val == 'species' ? Object.keys(rawData.species) : 
								rawData[ (val == 'projID' ? 'projects' : val) ].map(d => d.id);
			
			var visibleDomain = map.visible[val == 'projID' ? "Projs" : val == 'id' ? 'Animals' : val == 'nSpp' ? 'Spp' : val == 'status' ? 'Status' : 'Freqs'];
			
			var domain = fullDomain;
			
			domain = val == 'id' ? colourScale.domain() : domain;
			
			if (val == 'projID' && mapType != 'regions') {
			//	colourScale = map.colorScales[dataType][mapType][val].domain(domain).range(map.visible.Projs.map(function(key){ return projectColours[key]; }))
				colourScale = map.colorScales[dataType][mapType][val].domain(domain).range(Object.values(projectColours))
			}
			
			
			var legendHeight = domain.length * 20;
			
			
			// Format labels
			// This formatter function creates the labels for the colour legend.
			
			
			var tickFormat = (val == 'projID') ? function(x) {
					
					return $('#explore_filters .explore_projects option[value="' + x + '"]').text();
					
				} : 
				(val == 'species') ? function(x) {
					
					return rawData.species[x];
					
				} : 
				(val == 'frequency') ? function(x) {
					
					return x + " MHz";
					
				} :
				(val == 'id') ? function(x) {
					
					return rawData.species[rawData.animals[x]];
					
				} :
				(val == 'status') ? function(x) {
					
					return firstToUpper(x);
					
				} :
				function(x) {
					
					return x;
					
				};
				
			// Set up legend for vertical (ordinal) data.

			$(map.legend.el._groups[0][0])
				.not('.vertical-legend')
				.addClass('vertical-legend');
				
			$(map.legend.el._groups[0][0])
				.find('svg')
				.hide();
				
				
			
			if (false) {
				
				legendVertical({
					el: map.legend.svg,
					color: colourScale,
					title: $(this).select2('data')[0].text,
				//	ticks: ((val == 'projID' && mapType != 'regions') ?  : undefined),
					tickFormat: tickFormat,
					invert: (val == 'nSpp' || val == 'species' || val == 'animals'),
					height: legendHeight,//(legendHeight > 600 ? 600 : legendHeight) - 50,
					width: 100,
					marginTop: 20,
					svg_width: 250
				});	
				
				var svgWidth = Math.round($(map.legend.el._groups[0][0]).find('svg > g:last-child')[0].getBoundingClientRect().width);
				
				var svgViewbox = $(map.legend.el._groups[0][0]).find('svg').attr('viewBox').split(',');
				svgViewbox[2] = svgWidth-30;
				$(map.legend.el._groups[0][0]).css('width', svgWidth).find('svg').width(svgWidth).attr('viewBox', svgViewbox.join(','));
			
			} else {
				
				if ($(map.legend.el._groups[0][0]).find('.legend-table-wrapper').length == 0) {
					$(map.legend.el._groups[0][0]).append('<div class="legend-table-wrapper"></div>');
				}				
				
			//	console.log(tickFormat);
			//	console.log(svgWidth);
		//		console.log(colourScale.range());
		//		console.log(colourScale.domain());
		//		console.log(domain);
				
				if (val == 'status') {
					colourScale = map.colorScales[dataType][mapType][val]
										.domain(['active', 'terminated', 'prospective', 'expired'])
										.range(["#1b9e77", "#d95f02", "#fde945"]);
				}
				
				var legendID = ["legend", dataType, mapType, val].join('_');
				
				$(".legend-table-wrapper .dataTables_wrapper").hide();
				
			//	console.log("Legend: " + legendID);
				
				if ($("#" + legendID).length == 0) {
					
					$("<table>", { id: legendID }).append($("<thead>").append("<tr><th>"+(val == 'projID' || val == 'id' ? "ID" : "")+"</th><th>Name</th><th>#</th></tr>")).append($("<tbody>")).appendTo($(".legend-table-wrapper"));
					
					var idRow = (val == 'projID' || val == 'id' ? function(x){return x;} : function(d){return "";});
					
					
					domain.forEach(function(d, i) {
						
						var colour = colourScale.range()[i];
						
						colour = typeof colour === 'undefined' ? 'white' : colour.toUpperCase();
						
						$("<tr>", { "data-colourID": d })
							.append($("<td>", {text: idRow(d)}),
									$("<td>", {text: tickFormat(d)}),
									$("<td>").append(
										$("<div>", {
											text: 0,
											css: {
												"background-color" : colour,
												"border-color" : colour,
												"color" : (tinycolor(colour).isDark() ? "#FFF" : "#000")
											}
										})
									)
								)
							.appendTo($("#" + legendID + " tbody"));
						
						
					});
				
				
					$("#" + legendID).DataTable({
						/*
						aLengthMenu: [						// https://stackoverflow.com/questions/9443773/how-to-show-all-rows-by-default-in-jquery-datatable
							[25, 50, 100, 200, -1],
							[25, 50, 100, 200, "All"]
						],
						iDisplayLength: -1,*/
						"dom": 't',
						"scrollY": "var(--map-height)",
						"scrollX": false,
						"paging": false
					});
				// Set mouse events
					$("#" + legendID).find('tr')
						.on('mouseover', function(){
							// Highlight all the stations which match this property
							map.svg.selectAll(".explore-map-"+dataType+".explore-map-"+mapType+":not(.hidden)").attr('visibility','hidden');
							
							var id = String($(this).attr('data-colourID'));
							
							map.svg.selectAll(".explore-map-"+dataType+".explore-map-"+mapType+":not(.hidden)").filter(function(d) {
																
								return ( motusFilter.colour !== 'frequency' && d[motusFilter.colour].split(',').includes(id) ) || ( d[motusFilter.colour] === id )
								
							}).attr('visibility','visible');
							
						})
						.on('mouseout', function() {
							// Reset highlights
							map.svg.selectAll(".explore-map-"+dataType+".explore-map-"+mapType+":not(.hidden)").attr('visibility','visible');
						})
						.on('click', function() {
							
							var filterName = motusFilter.colour;
							
							filterName = filterName == "projID" ? "projects" : 
										 filterName == 'frequency' ? 'frequencies' : 
										 filterName;
							
							$("#explore_filters .explore_" + filterName).val($(this).attr('data-colourID')).trigger('change');
							
						});
				
				}
				
				$('#' + legendID + ' tr').hide();
			
					
				(val == 'projID' ? colourScale.domain().map(x=>+x) : colourScale.domain()).sort(d3.ascending).forEach(function(d, i){
										
					$('#' + legendID + ' tr[data-colourID="' + d + '"]').show();
					
				});
					
				$("#" + legendID + "_wrapper").show();
				
				$(map.legend.el._groups[0][0]).find('.legend-table-wrapper').show();
				
			}
		}
		
/*		
		
		if (val == 'numAnimals') {
			
			map.colorScale = map.colorScales[dataType][mapType][val];
			
			map.svg
				.selectAll('.explore-map-' + dataType + '.explore-map-' + mapType)
				.style('fill', d => map.colorScales[dataType][mapType][val](d[val]));
				
		} else if (val == 'lastData') {
			
			map.colorScale = d3.scaleSequential(d3.interpolateSpectral).domain([Math.min.apply(Math, all_numDet), Math.max.apply(Math, all_numDet)]);
			
			map.svg
				.selectAll('.explore-map-' + dataType)
				.style('fill', d => map.colorScale(+numDet));
		} else if (val == 'status') {
			
			map.colorScale = d3.scaleOrdinal(d3.schemeDark2);
			
			map.svg
				.selectAll('.explore-map-stations')
				.style('fill', d => map.colorScale(+numDet));
		} else if (val == 'freq') {
			
			map.colorScale = d3.scaleOrdinal(d3.schemeDark2);
		
			map.svg
				.selectAll('.explore-map-stations')
				.style('fill', d => map.colorScale(+numDet));
		} else if (val == 'species') {
			
			map.colorScale = d3.scaleOrdinal(d3.schemeCategory10);
		
			map.svg
				.selectAll('.explore-map-stations')
				.style('fill', d => map.colorScale(+nu));
		} else if (val == 'proj') {
			
			map.colorScale = d3.scaleOrdinal(d3.schemeCategory10);
		
			map.svg
				.selectAll('.explore-map-stations')
				.style('fill', d => map.colorScale(+projID));
		} else if (val == 'region') {
			
			map.colorScale = d3.scaleThreshold()
				.domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
				.range(d3.schemeReds[7]),
		
			map.svg
				.selectAll('.explore-map-regions')
				.style('fill', d => map.colorScale(+projID));
		}*/
		
	} else if (!$(this).hasClass('colourType_selector')) {
	
		var filterName = e.target.className.split(' ')[0].replace("explore_", "");
		
		
		//filterName = filterName == 'species' ? filterName : filterName.substr(0,filterName.length - 1);
		
		var newFilter = $(e.target).val();
		
		newFilter = newFilter.length == 0 ? ['all'] : newFilter;
		
		console.log("motusFilter." + filterName + ": old = " + motusFilter[filterName] + ", new = " + newFilter);
		
		motusFilter[filterName] = newFilter;
				
		if (!motusFilter[filterName].includes('all')) {
			
			
			var displayText = motusFilter[filterName].map(v => $("#explore_filters .explore_" + filterName + " option[value='" + v + "']").text());
			
			
			displayText = displayText.length > 0 ? displayText.join(', ') : "all";
			
		} else {
			
			var displayText = motusFilter[filterName][0];
			
		}
		$("#filter_summary > div.explore_" + filterName).toggleClass('visible', displayText != 'all');
//		$("#filter_summary > div.clear_filters:not(.visible)").addClass('visible');
		$("#filter_summary > div.explore_" + filterName + " > span").text(displayText);
		
		
		if (Object.keys(motusFilter).every(function(k) {return ['dtStart', 'dtEnd', 'colour'].includes(k) || motusFilter[k].includes('all');})) {
			$(".clear_filters.visible, #filter_summary, #filter_summary > div").removeClass('visible'); 
		} else {
			$(".clear_filters:not(.visible), #filter_summary").addClass('visible')
		}
			
	/*	} else {
			$("#filter_summary > div.explore_" + filterName).removeClass('visible');
			if ($("#filter_summary > div.visible:not(.explore_dates)").length == 1) {
				$("#filter_summary > div.clear_filters.visible").removeClass('visible');
			}
		}*/
	
	}
	
		
	updateURL();
	
	map.setVisibility();
	
	return false;
}
function viewMetadata(metatype, dataset) {
	
	console.log('meta' + metatype + " - " + dataset);
	
	metatype = metatype == 'projects' ? 'projID' : metatype;
	
	$(".colourType_selector").val(metatype).trigger("change");
	$("#explore_main_map_legend:not(.visible) .showHide").trigger("click");
	
}

function updateURL() {
	
	var stateToPush = '#'+
		'dataType=' + encodeURIComponent(dataType) + 
		'&mapType=' + encodeURIComponent(mapType) + 
		'&dtStart=' + encodeURIComponent(new Date( motusFilter.dtStart ).toISOString().substr(0,10)) + 
		'&dtEnd=' + encodeURIComponent(new Date( motusFilter.dtEnd ).toISOString().substr(0,10)) + 
		'&species=' + encodeURIComponent(motusFilter.species) + 
		'&regions=' + encodeURIComponent(motusFilter.regions) + 
		'&projects=' + encodeURIComponent(motusFilter.projects) + 
		'&stations=' + encodeURIComponent(motusFilter.stations) + 
		'&status=' + encodeURIComponent(motusFilter.status) + 
		'&frequencies=' + encodeURIComponent(motusFilter.frequencies) + 
		'&colour=' + encodeURIComponent(motusFilter.colour);
	
	window.history.pushState(motusFilter, "Explore Data", stateToPush);

	return false;
}

function mapInfoPanel(data, showHide, infoType) {
	if (showHide == 'show') {
		$('#explore_main_map').unbind('click');
		if ($('#mapInfoPanel').length == 0) {
			$('body').append('<div id="mapInfoPanel" style="display:none;"></div>');
		}
		
		//var mapPos = $('#explore_main_map').offset();
/*		var mapDim = {width: $('#explore_main_map').innerWidth(), 
		height: $('#explore_main_map').innerHeight()};*/
		
		if (infoType == 'station') {
		
			var dateEnd = !isNaN(data.dtEnd.getTime()) ? new Date(data.dtEnd).toISOString().substr(0,10) : "present";
			
			var projects = data.projID.split(',').filter(onlyUnique).map(function(x){
				
				var n = $("#explore_filters .explore_projects option[value=" + x + "]").text();
				
				var c = customColourScale.jnnnnn[$("#explore_filters .explore_projects option[value=" + x + "]").index()-1];
								
				return "<div class='projects' "+ 
						"style='background-color:" + c +
						(tinycolor(c).isDark() ? ";color:#FFF" : "")+
						";' " +
						//"onclick='$(\"#explore_filters .explore_projects\").select2(\"data\",{id:" + x + ", text: \"" + n + "\"})'>" + 
						"onclick='$(\"#explore_filters .explore_projects\").val(" + x + ").trigger(\"change\");'>" + 
						n +
						"</div>";
				
			});
			// sample length
			var sampleSize = data.animals;
			
			// Number of tag deployments
			
			var deployIDs = Array.from( rawData.tagDeps.keys() );
			
			// Randome sample
			
			var samples = [];
			
			var sample_spp = [];
			
			var sample_ids = [];
			
			var species = [];
			
			console.log(rawData.tagDeps)
			var x,d,sp,status;
			while (samples.length < sampleSize) {
				
				x = deployIDs[Math.round( Math.random() * deployIDs.length )];
				
				
				
				if (!sample_ids.includes(x)) {
					
					sample_ids.push(x);
					
					d = rawData.tagDeps.get(x)[0];
					
					sp = $("#explore_filters .explore_species option[value=" + d.species + "]").text();
					
					status = d.status == 'active' ? (d.dtEnd == 'NA' ? 'active' : 'expired') : d.status;
					
					if (sp.length == 0) {sp = "Unlisted species";}
				
					samples.push(
									"<tr data-id='" + x + "'><td>" + x + "</td><td>" + sp + "</td><td>" + d.dtStart + "</td><td>" + d.dtEnd + "</td><td class='" + status +"'>" + firstToUpper(status) + "</td></tr>"
								)
				} 
				if (!sample_spp.includes(d.species)) {
					
					sample_spp.push(d.species);
					
					var c = customColourScale.jnnnnn[map.colorScales.species.points.species.domain().indexOf(d.species)];
				
					species.push(
									"<div class='species' "+ 
									"style='background-color:" + c + 
									(tinycolor(c).isDark() && typeof c != 'undefined' ? ";color:#FFF" : "")+
									";' " +
									//"onclick='$(\"#explore_filters .explore_species\").val(" + d.species + ").trigger(\"change\");'>" + 
									"onclick='explore_profile(\"species\"," + d.species + ");'>" + 
									sp +
									"</div>"									
								)
					
				}
			}
			
			
		//	Math.random() * nDeps
			
			var htmlContent = 	'<h2>' + data.name + ' <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="close_btn" viewBox="0 0 16 16"><path d="M 1.292 1.292 a 1 1 90 0 1 1.416 0 L 8 6.586 l 5.292 -5.294 a 1 1 90 0 1 1.416 1.416 L 9.414 8 l 5.294 5.292 a 1 1 90 0 1 -1.416 1.416 L 8 9.414 l -5.292 5.294 a 1 1 90 0 1 -1.416 -1.416 L 6.586 8 L 1.292 2.708 a 1 1 90 0 1 0 -1.416 z" /></svg></h2>'+
								"<div>"+
								"<div class='profile'><a href='javascript:explore_profile(\"stations\","+data.id+");'>View station profile</a></div>"+
								"<div class='project'><b>Project: " + projects.join('') + "</b></div>"+ 
								"<div class='coords'><b>Location: </b>" + data.coordinates.join(", ") + "</div>"+
								"<div class='deployDates'><b>Deployment Status: </b>" + data.status + "</div>"+
								"<div class='deployStatus'><b>Deployed: </b>" + (new Date(data.dtStart).toISOString().substr(0,10)) + " - " + dateEnd + "</div>"+
								"<div class='receiver'><b>Receiver: </b>" + data.serno + "</div>"+
								"<div class='receiver'><b>Species detected: </b>" + species.join('') + "</div>"+
								"<div class='detections'><b>Tags detected </b><br><br><table>"+
								"<thead><tr><th>ID</th><th>Species</th><th>Start</th><th>End</th><th>Status</th></tr></thead>"+
								"<tbody>" + samples.join('') + "</tbody></table></div>"+
							"</div>";

		}
		
		if (infoType == 'track') {
			
			var project = $("#explore_filters .explore_projects option[value=" + data.projID + "]").text();
			
			var project_c = customColourScale.jnnnnn[$("#explore_filters .explore_projects option[value=" + data.projID + "]").index()-1];
								
			var project_html = "<div class='projects' "+ 
					"style='background-color:" + project_c +
					(tinycolor(project_c).isDark() ? ";color:#FFF" : "")+
					";' " +
					"onclick='$(\"#explore_filters .explore_projects\").val(" + data.projID + ").trigger(\"change\");'>" + 
					project +
					"</div>";
			
			var species = $("#explore_filters .explore_species option[value=" + data.species + "]").text();
			
			var species_c = customColourScale.jnnnnn[map.colorScales.species.points.species.domain().indexOf(data.species)];
		
			var species_html = "<div class='species' "+ 
							"style='background-color:" + species_c + 
							(tinycolor(c).isDark() && typeof species_c != 'undefined' ? ";color:#FFF" : "")+
							";' " +
					//		"onclick='$(\"#explore_filters .explore_species\").val(" + data.species + ").trigger(\"change\");'>" + 
							"onclick='explore_profile('species'," + data.species + ");'>" + 
							species +
							"</div>";
							
			var dep = rawData.tagDeps.get(data.id)[0];
			var station1 = rawData.stations.get(data.recv1)[0];
			var station2 = rawData.stations.get(data.recv2)[0];
			
			var tracks = rawData.tracks.get(data.id);
			
			var tracks_html = [];
				
			if (tracks.length > 1) {
				
				for (t in tracks) {
					
					var track = tracks[t];
					
					var speed = Math.round(+track.dist/(1000*Math.round((new Date(track.dtEnd) - new Date(track.dtStart))/(1000*60*60))));
					
					tracks_html.push(
						"<tr data-id='" + track.recvDeployID1 + "'><td>" + track.recvDeployID1 + "</td><td>" + rawData.stations.get(track.recvDeployID1)[0].name + "</td><td>" + track.dtStart + "</td><td>" + track.dtEnd + "</td><td>" + Math.round(+track.dist/1000) + " km</td><td>" + (isNaN(speed) ? "-" : speed + " km/h") + "</td><td>" + (t == 0 ? 'START' : t == tracks.length - 1 ? 'END' : t) + "</td></tr>"
					)
				}
			
			}
			var timeTraveled = Math.round((new Date(data.dtEnd) - new Date(data.dtStart))/(1000*60*60));
			
			var htmlContent = 	'<h2>' + species + ' - ID #' + data.id + ' <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="close_btn" viewBox="0 0 16 16"><path d="M 1.292 1.292 a 1 1 90 0 1 1.416 0 L 8 6.586 l 5.292 -5.294 a 1 1 90 0 1 1.416 1.416 L 9.414 8 l 5.294 5.292 a 1 1 90 0 1 -1.416 1.416 L 8 9.414 l -5.292 5.294 a 1 1 90 0 1 -1.416 -1.416 L 6.586 8 L 1.292 2.708 a 1 1 90 0 1 0 -1.416 z" /></svg></h2>'+
								"<div>"+
								"<div class='profile'><a href='javascript:explore_profile(\"animals\","+data.id+");'>View animal profile</a></div>"+
								"<div class='profile'><a href='javascript:explore_profile(\"species\","+data.species+");'>View species profile</a></div>"+
								"<div class='project'><b>Project: " + project_html + "</b></div>" + 
								"<div class='coords'><b>Distance traveled: </b>" + Math.round(data.dist/1000) + " km</div>"+
								"<div class='coords'><b>Speed traveled: </b>" + Math.round(data.dist/(1000*timeTraveled)) + " km/h</div>"+
								"<div class='coords'><b>Start location: </b>" + station1.name + "</div>"+
								"<div class='coords'><b>End location: </b>" + station2.name + "</div>"+
								"<div class='dates'><b>Flight dates: </b>" + (new Date(data.dtStart).toISOString().substr(0,10)) + " - " + (new Date(data.dtEnd).toISOString().substr(0,10)) + "</div>"+
								"<div class='deployStatus'><b>Deployment Status: </b>" + data.status + "</div>"+
								"<div class='deployDates'><b>Deployed: </b>" + (new Date(dep.dtStart).toISOString().substr(0,10)) + " - " + (new Date(dep.dtEnd).toISOString().substr(0,10)) + "</div>"+
								"<div class='detections'><b>Stations visited </b><br><br><table>"+
								"<thead><tr><th>ID</th><th>Name</th><th>Arrival</th><th>Departure</th><th>Distance</th><th>Speed</th><th></th></tr></thead>"+
								"<tbody>" + tracks_html.join('') + "</tbody></table></div>"+
							"</div>";
			/*
			var htmlContent = "<h2><a href='species.html?speciesID="+data.species+"'>" + species + "</a></h2>";
			
			htmlContent += "<div>"+
								"<div class='project'><b>Tag project: </b><a href='javascript:void(0);' onclick='$(\".explore_filters .explore_projects\").val("+data.projID+").select2(\"data\",{id:\""+data.projID+"\", text: \""+project+"\"})'>" + project + "</a></div>"+
								"<div class='coords'><b>Start location: </b>" + data.coordinates[0].join(", ") + "</div>"+
								"<div class='coords'><b>End location: </b>" + data.coordinates[1].join(", ") + "</div>"+
								"<div class='deployStatus'><b>Time of flight: </b>" + (new Date(data.dtStart).toISOString().substr(0,10)) + " - " + new Date(data.dtEnd).toISOString().substr(0,10) + "</div>"+
								"<div class='deployment'><b>Deployment ID: </b>" + data.id + "</div>"+
								"<div></div>"+
								"<div class='tagDetections'><b>Stations visited [Table]: </b></div>"+
							"</div>";
			*/
		}
		
		
		
		if (infoType == 'tagDeps') {
		
		
			var dateEnd = !isNaN(data.dtEnd.getTime()) ? new Date(data.dtEnd).toISOString().substr(0,10) : "present";
			
			
			var projects = data.projID.split(',').filter(onlyUnique).map(function(x){
				
				var n = $("#explore_filters .explore_projects option[value=" + x + "]").text();
				
				var c = customColourScale.jnnnnn[$("#explore_filters .explore_projects option[value=" + x + "]").index()];
								
				return "<div class='projects' "+ 
						"style='background-color:" + c +
						(tinycolor(c).isDark() ? ";color:#FFF" : "")+
						";' " +
						//"onclick='$(\"#explore_filters .explore_projects\").select2(\"data\",{id:" + x + ", text: \"" + n + "\"})'>" + 
						"onclick='$(\"#explore_filters .explore_projects\").val(" + x + ").trigger(\"change\");'>" + 
						n +
						"</div>";
				
			});
			
			
			var species = data.species.split(',').filter(onlyUnique).map(function(x){
				
				var n = $("#explore_filters .explore_species option[value=" + x + "]").text();
				
				var c = customColourScale.jnnnnn[map.colorScales.species.points.species.domain().indexOf(x)];
				
				return "<div class='species' "+ 
						"style='background-color:" + c + 
						(tinycolor(c).isDark() ? ";color:#FFF" : "")+
						";' " +
						//"onclick='$(\"#explore_filters .explore_species\").val(" + x + ").trigger(\"change\");'>" + 
						"onclick='explore_profile(\"species\","+x+"'>" + 
						n +
						"</div>";
				
			});
			
			var d,sp,status;
			
			var deployments = data.id.split(',').filter(onlyUnique).map(function(x){
				
				d = rawData.tagDeps.get(x)[0];
				
				sp = $("#explore_filters .explore_species option[value=" + d.species + "]").text();
				
				status = d.status == 'active' ? (d.dtEnd == 'NA' ? 'active' : 'expired') : d.status;
					
				if (sp.length == 0) {sp = "Unlisted species";}
								
				return "<tr data-id='" + x + "' onclick='explore_profile(\"animals\","+x+"'><td>" + x + "</td><td>" + sp + "</td><td>" + d.dtStart + "</td><td>" + d.dtEnd + "</td><td class='" + status +"'>" + firstToUpper(status) + "</td></tr>";
				
			});
			
			
			var htmlContent = 	'<h2>Tag deployments <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="close_btn" viewBox="0 0 16 16"><path d="M 1.292 1.292 a 1 1 90 0 1 1.416 0 L 8 6.586 l 5.292 -5.294 a 1 1 90 0 1 1.416 1.416 L 9.414 8 l 5.294 5.292 a 1 1 90 0 1 -1.416 1.416 L 8 9.414 l -5.292 5.294 a 1 1 90 0 1 -1.416 -1.416 L 6.586 8 L 1.292 2.708 a 1 1 90 0 1 0 -1.416 z" /></svg></h2>'+
								"<div>"+
								"<div class='profile'><a href='javascript:explore_profile(\"species\","+data.id+");'>View animal profile</a></div>"+
								"<div class='coords'><b>Location: </b><a href='javascript:void(0);' onclick='findLocation([" + data.coordinates.join(", ") + "])'>" + data.coordinates.join(", ") + "</a></div>"+
								"<div class='project'><b>Projects: </b>" + projects.join('') + "</div>"+
								"<div class='tagSpecies'><b>Species: </b>" + species.join('') + "</div>"+
								"<div class='deployStatus'><b>Deployment period: </b><a href='javascript:void(0);' onclick='timeline.setSlider([\"" + (new Date(data.dtStart).toISOString().substr(0,10)) + "\", \"" + dateEnd + "\"])'>" + (new Date(data.dtStart).toISOString().substr(0,10)) + " - " + dateEnd + "</a></div>"+
								"<div class='deployments'><b>Deployments </b><br><br><table>"+
								"<thead><tr><th>ID</th><th>Species</th><th>Start</th><th>End</th><th>Status</th></tr></thead>"+
								"<tbody>" + deployments.join('') + "</tbody></table></div>"+
							"</div>";

		}
		
		$('#mapInfoPanel:visible').hide()
		$('#mapInfoPanel').html(htmlContent).css({
		//	top: mapPos.top,
		//	left: mapPos.left,
		//	height: mapDim.height-42,
			background: "#FFF",
			border: "solid 1px #777",
			position: "absolute"
		}).fadeIn(250);
		setTimeout(function(){
			$('#explore_main_map').click(function(){mapInfoPanel(false, 'hide');});
			$("#mapInfoPanel .close_btn").click(function(){mapInfoPanel(false, 'hide');});
		}, 200);
	} else {
		$('#mapInfoPanel').fadeOut(250);
		$('#explore_main_map').unbind('click');
	}
}

function findMotusData(id, prop) {
	
	if (prop == 'projectID') {
		$("#explore_filters .explore_projects").select2("data",{id:id});
		
	}
	
	return void(0);
}