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
	colour: ''
};
var URLdataType = null,
	URLmapType = null;
	
function loadContent() {
	var urlFilter = {
		dtStart: getUrlParameter('dtStart'),
		dtEnd: getUrlParameter('dtEnd'),
		species: getUrlParameter('species'),
		regions: getUrlParameter('regions'),
		projects: getUrlParameter('projects'),
		stations: getUrlParameter('stations'),
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
		frequencies: urlFilter.frequencies === undefined ? "all" : urlFilter.frequencies.split(','),
		colour: $("#explore_filters .colourType_selector option[value='" + urlFilter.colour + "']").length == 0 ? $("#explore_filters .colourType_selector").select2('val') : urlFilter.colour
	};
	
	
	URLdataType = getUrlParameter('dataType');
	URLdataType = $(".exploreBy:has(.mainstat span:contains('" + (URLdataType == 'species' ? 'animals' : URLdataType) + "'))").length > 0 ? URLdataType : dataType;
		
	//dataType = URLdataType;
	
	URLmapType = getUrlParameter('mapType');
	
	console.log(URLdataType + " - " + URLmapType);
	
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
	
	$(".metric_controls img, #station_activityTimeline .timeline").click(function(){
	
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
						top: $(this).closest('.explore_metrics').children('.visible').is('#explore_map') ? "0": "calc(50% - " + ($(this).closest('.explore_metrics').outerHeight()/2) + "px)"
					})
					.find('.metric_controls')
					.fadeOut(250);
					
				$("body").css({overflow:"hidden"});
				
				if ($(this).closest('.explore_metrics').children('.visible').is('#explore_map')) {
					var mapContainerID = $(this).closest('.explore_metrics').children('#explore_map.visible').attr('id');
					var dims = {w: $("#" + mapContainerID).outerWidth() - $(window).width(), h: $("#" + mapContainerID).outerHeight() - $(window).height()};
				}
				
				$("#lightbox_bg").unbind().click(function(){
					if ($(".expanded_metrics").children('.visible').is('#explore_map')) {
						var mapContainerID = $(".expanded_metrics").children('#explore_map.visible').attr('id');
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
	
	$('#explore_filters:hidden').css({marginBottom:"-" + $('#explore_filters:hidden').innerHeight() + "px"});
	$("#station_activityTimeline .slider").dragslider({
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
	
	$(".toggleButton").click(function(e){
		
		var toggleName = this.className.split(" ");
		
		while(toggleName[0] == "toggleButton" || toggleName[0] == "selected" || toggleName[0] == "disabled") {
			toggleName.shift();
		}
		
		toggleName = toggleName[0];
		
		if (toggleName == 'exploreTables') {
			console.log($(this).text());
		} else if ( ( toggleName == 'exploreBy' || toggleName == 'mapBy' ) && !$(this).hasClass('selected')) {
			
			$(".toggleButton." + toggleName + ".selected").removeClass('selected');
			$(this).addClass('selected');
			$(".toggleButton." + toggleName + ":contains('" + this.innerHTML + "')").addClass('selected');
			
			var typeToShow = toggleName == 'exploreBy' ? $(this).find('span').text().toLowerCase() : this.innerHTML.toLowerCase();

			typeToShow = typeToShow == 'animals' ? 'species' : typeToShow == 'deployments' ? 'points' : typeToShow;
		
			$(".toggleButton." + toggleName + ":not(.selected)").each(function(){
				
				var typeToHide = $(this).hasClass('exploreBy') ? $(this).find('span').text().toLowerCase() : this.innerHTML.toLowerCase();

				typeToHide = typeToHide == 'animals' ? 'species' : typeToHide == 'deployments' ? 'points' : typeToHide;

				$("." + toggleName.replace('By', '') + "_type_" + typeToHide).hide();
				
			});
		
			
			if (toggleName == 'exploreBy' && (dataType != typeToShow || dataType == null)) {
				
				$(".dataType_" + (dataType == null ? typeToShow == 'stations' ? 'species' : 'stations' : dataType)).addClass("hidden");
				
			//	console.log("Datatype: " + typeToShow + " - " + (dataType == null ? typeToShow == 'stations' ? 'species' : 'stations' : dataType));
				
				dataType = typeToShow;
				
				$(".dataType_" + dataType).removeClass("hidden");
				// Check if map type has been set
				if (mapType != null) {
					// Only load the DataTable if it's visible
					if (mapType == 'table') {
						loadDataTable();
					} else if (mapType != 'tracks' || dataType == 'species') { // Only set map visibility if table isn't visible
						$("#explore_filters .colourType_selector").trigger("change");
						map.setVisibility(true);
					} else {
						if ($(".mapBy.toggleButton.selected:not(.hidden)").length == 0) {
							$(".mapBy.toggleButton:contains('Points'):not(.hidden)").click();
						} else {
							$(".mapBy.toggleButton.selected:not(.hidden)").removeClass('selected').click();
						}
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
				updateURL();
			} else {
				console.log('ALERT');
			}
			
		} else if (toggleName == 'filterButton') {
			$(this).toggleClass('selected');
			
			if ($(this).hasClass('selected')) { // Show filter options and add margin
				//if ($('.animate_timeline').hasClass('selected')) {
					$('#explore_filters > div:not(#station_activityTimeline):hidden').show();
					$('#explore_filters > #station_activityTimeline:hidden').show();
					/*$('#explore_filters').css({
						marginBottom:"-" + $('#explore_filters').innerHeight() + "px",
						top: $('#filter_summary').innerHeight() + "px"
					});*/
		//		} else {
					
			//	}
			} else { // Hide filter options and remove margins
					$('#explore_filters > div:not(#station_activityTimeline)').hide();
				if ($('.animate_timeline').hasClass('selected')) {
				} else {
					$('#explore_filters > #station_activityTimeline').hide();
				}
				
			}
	//		$('#explore_filters').css({marginBottom:"-" + $('#explore_filters').innerHeight() + "px"});
		} else if (toggleName == 'animate_timeline') {
			
			timeline.status = e.target.children.length > 0 ? e.target.firstElementChild.classList[1] : e.target.classList[1];
			
			if (timeline.status == 'play') {
	
				if (!$(this).hasClass('selected')) {
					$('#explore_filters > #station_activityTimeline:hidden').show();
					$(this).addClass('selected');
			//		$('#explore_filters').css({marginBottom:"-" + $('#explore_filters').innerHeight() + "px"});
				}
				
				animateTimeline();
				
			} else if (timeline.status == 'stop') {
				
				timeline.animationEnd();
				
			}
			
		}
		
	});
	
	
	$(".toggleButton.exploreBy.selected").removeClass('selected').click();
	
	
//	map.setVisibility();
	
//	loadDataTable();
	
	console.log('dataType: ' + dataType + ' - mapType: ' + mapType);
	
	
	for (f in motusFilter) {
		if (motusFilter[f] != 'all') {$("#explore_filters .explore_" + f).val(motusFilter[f]).trigger("change");}
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

	$("#station_activityTimeline .slider").dragslider('values', [timeline.min, timeline.min + timeline.distance]);

	timeline.timer_length = 3000 - (3000 * timeline.distance / timeline.range);
				
	if (timeline.timer === undefined) {timeline.timer = d3.timer(timeline.animate);}
	else {timeline.timer.restart(timeline.animate)}
		
	if (timeline.timer !== 'undefined') {timeline.timer.stop();}
	
	timeline.timer = d3.timer(timeline.animate);
}


function populateSelectOptions(response) { // projs = projects, spp = species
	
	var projs = response[0],
		spp = response[1];
	
	projs.forEach(function(r){ // r = row
		
		$("#explore_filters .explore_projects").append("<option value='" + r.id + "'>" + r.name + "</option>");
		
	});
			
	$("#explore_map_container .project_count").text(projs.length);
	
	spp.forEach(function(r){ // r = row
		
		$("#explore_filters .explore_species").append("<option value='" + r.id + "'>" + r.english + "</option>");
		
	});
	
	
	$("#explore_filters select").select2({
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
		placeholder: function(){return $(this).data('placeholder');},
	}).change(setFilter);//.trigger('change'); 
	
	
	
	// If you click one of the filters displayed in the summary
	$('#filter_summary > div > span').click(function(){
		
		// First class will always be the filter name
		var filterName = this.parentElement.classList[0];
		
		if (filterName == 'clear_filters') {
			motusFilter = {
				species: "all",
				regions: "all" ,
				projects: "all",
				stations: "all",
				frequencies: "all",
				colour: motusFilter.colour
			};
			timeline.setSlider([timeline.min, timeline.max]);
			$("#filter_summary > div:not(.explore_dates)").removeClass('visible');
			updateURL();
			map.setVisibility();
		} else {
			// Show filter options 
			$('.filterButton:not(.selected)').click(); 
			
			// Explore dates is a timeline, so it's already displayed when filter options are open
			 if (filterName != 'explore_dates') {
				// If not date, open the select menu
				$("#explore_filters ." + filterName).select2('open');
			}
		}
	});
	
	// Hide everything until it's loaded
	$('body').addClass('visible');
	
	
	// If the window is resized, we;ll need a way to resize the activity timeline. 
	// There's definitely a better way to do this that I just haven't yet looked into.
	$(window).on('resize', function(){
		
		var oldWidth = $("#activityTimeline").attr("width");
		var newWidth = $("#explore_map_container").innerWidth();
		
		$("#activityTimeline, #activityTimeline rect").attr("width", newWidth);
		$("#activityTimeline path").attr("d", "M0.5,6V0.5H" + newWidth + "V6");
		$("#activityTimeline g.tick").attr("transform", function(){
			
			return "translate(" + ( this.transform.baseVal.consolidate().matrix.e * (newWidth / oldWidth) ) + ",0)";
			
		});
	})

	loadMapData();
}

function setFilter(e) {
	
	if ($(this).hasClass('colourType_selector')) {
		var val = this.value;
		
		motusFilter.colour = val;
	
		if (val == 'species' && mapType != 'tracks') {val = 'nSpp';}
		
		console.log('dataType: ' + dataType + ' - mapType: ' + mapType + ' - value: ' + val);
		
		var i = (this.selectedIndex == 0 ? this.selectedIndex+1 : this.selectedIndex - 1);
		var iterations = this.options.length;
		
		while (typeof map.colorScales[dataType][mapType][val] === 'undefined' && iterations != 0) {
			
			iterations--;
			i = i == this.options.length ? 0 : i + 1;
			
			console.log(val + " - " + i )
			
			val = this.options[i].value;
			
			if (val == 'species' && mapType != 'tracks') {val = 'nSpp';}
			
			$(this).select2('data',{id: val, text: this.options[i].innerHTML});
//			val = $('select.colourType_selector').hasClass('');
			motusFilter.colour = val;
		}
		
		map.svg
			.selectAll('.explore-map-' + dataType + '.explore-map-' + mapType)
			.style(mapType == 'tracks' ? 'stroke' : 'fill', d => map.colorScales[dataType][mapType][val](d[val]));
		
		map.legend.svg.html("");
		
		
		$("#explore_map_legend svg").show();
		
		var colourScale = map.colorScales[dataType][mapType][val];

		if (val == 'projID' && mapType != 'regions') {
			colourScale = map.colorScales[dataType][mapType][val].domain(map.visible.Projs).range(map.visible.Projs.map(function(key){ return projectColours[key]; }))
		} else if (val == 'nAnimals') {
			var d = colourScale.domain();
			colourScale.domain([d[1], d[0]]);
		}
		
		console.log(colourScale.domain());
		
//		console.log(map.legend.el._groups[0][0]);

		
		if (val == 'nSpp' || val == 'nAnimals' || val == 'lastData') {
			
			var legendWidth = $(map.legend.el._groups[0][0]).parent().outerWidth();
		
			$(map.legend.el._groups[0][0]).filter('.vertical-legend').removeClass('vertical-legend');
			legend({
				el: map.legend.svg,
				color: colourScale,
				title: $(this).select2('data')[0].text,
			//	ticks: ((val == 'projID' && mapType != 'regions') ?  : undefined),
				tickFormat: ( (val == 'nSpp' || val == 'species' || val == 'nAnimals') ? ".0f" : 's' ),
				invert: (val == 'nSpp' || val == 'species' || val == 'nAnimals'),
				width: legendWidth > 600 ? 600 : legendWidth
			});
		} else {
//				$("#explore_map_legend svg").hide();

			var legendHeight = $(map.legend.el._groups[0][0]).parent().outerHeight();
			
			$(map.legend.el._groups[0][0]).not('.vertical-legend').addClass('vertical-legend');
			legendVertical({
				el: map.legend.svg,
				color: colourScale,
				title: $(this).select2('data')[0].text,
			//	ticks: ((val == 'projID' && mapType != 'regions') ?  : undefined),
				tickFormat: ( (val == 'nSpp' || val == 'species' || val == 'nAnimals') ? ".0f" : 's' ),
				invert: (val == 'nSpp' || val == 'species' || val == 'nAnimals'),
				height: (legendHeight > 600 ? 600 : legendHeight) - 50,
				width: 100
			});			
		}
		
		if (val == 'nAnimals') {
			d = colourScale.domain();
			colourScale.domain([d[1], d[0]]);
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
		
	} else {
	
		var filterName = e.target.className.split(' ')[0].replace("explore_", "");
		
		//filterName = filterName == 'species' ? filterName : filterName.substr(0,filterName.length - 1);
		
		var newFilter = $(e.target).val();
		
		console.log(newFilter);
		
		newFilter = newFilter.length == 0 ? 'all' : newFilter;
		
		motusFilter[filterName] = newFilter;
		
		
		//if (motusFilter[filterName] != 'all') {
			
			var displayText = motusFilter[filterName].map(v => $("#explore_filters .explore_" + filterName + " option[value='" + v + "']").text());
			
			console.log(displayText);
			
			displayText = displayText.length > 0 ? displayText.join(', ') : "all";
			
			
			$("#filter_summary > div.explore_" + filterName + ":not(.visible)").addClass('visible');
			$("#filter_summary > div.clear_filters:not(.visible)").addClass('visible');
			$("#filter_summary > div.explore_" + filterName + " > span").text(displayText);
			
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

function updateURL() {
	
	var stateToPush = '?'+
		'dataType=' + encodeURIComponent(dataType) + 
		'&mapType=' + encodeURIComponent(mapType) + 
		'&dtStart=' + encodeURIComponent(new Date( motusFilter.dtStart ).toISOString().substr(0,10)) + 
		'&dtEnd=' + encodeURIComponent(new Date( motusFilter.dtEnd ).toISOString().substr(0,10)) + 
		'&species=' + encodeURIComponent(motusFilter.species) + 
		'&regions=' + encodeURIComponent(motusFilter.regions) + 
		'&projects=' + encodeURIComponent(motusFilter.projects) + 
		'&stations=' + encodeURIComponent(motusFilter.stations) + 
		'&frequencies=' + encodeURIComponent(motusFilter.frequencies) + 
		'&colour=' + encodeURIComponent(motusFilter.colour);
	
	window.history.pushState(motusFilter, "Explore Data", stateToPush);
}

function mapInfoPanel(data, showHide, infoType) {
	if (showHide == 'show') {
		$('#explore_map').unbind('click');
		if ($('#mapInfoPanel').length == 0) {
			$('body').append('<div id="mapInfoPanel" style="display:none;"></div>');
		}
		
		var mapPos = $('#explore_map').offset();
		var mapDim = {width: $('#explore_map').innerWidth(), 
		height: $('#explore_map').innerHeight()};
		
		if (infoType == 'station') {
		
			var dateEnd = !isNaN(data.dtEnd.getTime()) ? new Date(data.dtEnd).toISOString().substr(0,10) : "present";
			
			var project = $("#explore_filters .explore_projects option[value=" + data.projID + "]").text();
			
			var htmlContent = "<h2><a href='station.html?name="+data.id+"'>" + data.name + "</a></h2>";
			htmlContent += "<div>"+
								"<div class='project'><b>Project: </b><a href='javascript:void(0);' onclick='$(\"#explore_filters .explore_projects\").select2(\"data\",{id:\""+data.projID+"\", text: \""+project+"\"})'>" + project + "</a></div>"+
								"<div class='coords'><b>Location: </b>" + data.coordinates.join(", ") + "</div>"+
								"<div class='deployDates'><b>Deployment Status: </b>" + data.status + "</div>"+
								"<div class='deployStatus'><b>Deployed: </b>" + (new Date(data.dtStart).toISOString().substr(0,10)) + " - " + dateEnd + "</div>"+
								"<div class='receiver'><b>Receiver: </b>" + data.serno + "</div>"+
								"<div></div>"+
								"<div class='tagDetections'><b>Tags detected [Table]: </b></div>"+
							"</div>";

		}
		
		if (infoType == 'track') {
			
			var species = $("#explore_filters .explore_species option[value=" + data.species + "]").text();
			
			var project = $("#explore_filters .explore_projects option[value=" + data.projID + "]").text();
			
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

		}
		
		
		
		if (infoType == 'tagDeps') {
		
		
	//		var species = $("#explore_filters_species option[value=" + data.species.split(',')[0] + "]").text();
			
	//		var project = $("#explore_filters_projects option[value=" + data.projID.split(',')[0] + "]").text();
		
			var dateEnd = !isNaN(data.dtEnd.getTime()) ? new Date(data.dtEnd).toISOString().substr(0,10) : "present";
			
	//		var htmlContent = "<h2><a href='species.html?speciesID="+data.species.split(',')[0]+"'>" + species + "</a></h2>";

			var projectInfo = [];
			
			data.projID.split(',').filter(onlyUnique).forEach(function(item, index){
				
				projectInfo.push("<a href='javascript:findMotusData("+item+",\"projectID\")'>" + $("#explore_filters .explore_projects option[value="+item+"]").text() + "</a>");
				
			});
			
			
			var speciesInfo = [];
			
			data.species.split(',').filter(onlyUnique).forEach(function(item, index){
				
				speciesInfo.push("<a href='javascript:findMotusData(\""+item+"\", \"speciesID\")'>" + $("#explore_filters .explore_species option[value="+item+"]").text() + "</a>");
				
			});
			
			
			var tagInfo = [];
			
			data.tagID.split(',').filter(onlyUnique).forEach(function(item, index){
				
				tagInfo.push("<a href='javascript:findMotusData(\""+item+"\", \"tagID\")'>" + item + "</a>");
				
			});
			
			
			var deployInfo = [];
			
			data.id.split(',').filter(onlyUnique).forEach(function(item, index){
				
				deployInfo.push("<a href='javascript:findMotusData(\""+item+"\", \"deployID\")'>" + item + "</a>");
				
			});
			
			
			
			var htmlContent = 	"<h2>" + speciesInfo.join(', ') + "</h2>"+
								"<div>"+
								"<div class='project'><b>Tag project: </b>" + projectInfo.join(', ') + "</div>"+
								"<div class='tagSpecies'><b>Species</b>: " + speciesInfo.join(', ') + "</div>"+
								"<div class='project'><b>Tag ID: </b>" + tagInfo + "</div>"+
								"<div class='coords'><b>Deployment location: </b><a href='javascript:void(0);' onclick='findLocation([" + data.coordinates.join(", ") + "])'>" + data.coordinates.join(", ") + "</a></div>"+
								"<div class='deployStatus'><b>Deployment period: </b><a href='javascript:void(0);' onclick='setTimeline([\"" + (new Date(data.dtStart).toISOString().substr(0,10)) + "\", \"" + dateEnd + "\"])'>" + (new Date(data.dtStart).toISOString().substr(0,10)) + " - " + dateEnd + "</a></div>"+
								"<div class='project'><b>Deployment ID: </b>" + deployInfo + "</div>"+
								"<div></div>"+
								"<div class='tagDetections'><b>Stations visited [Table]: </b></div>"+
							"</div>";

		}
		
		$('#mapInfoPanel:visible').hide()
		$('#mapInfoPanel').html(htmlContent).css({
			top: mapPos.top,
			left: mapPos.left,
			height: mapDim.height-42,
			background: "#FFF",
			border: "solid 1px #777",
			position: "absolute"
		}).fadeIn(250);
		setTimeout(function(){$('#explore_map').click(function(){mapInfoPanel(false, 'hide');})}, 200);
	} else {
		$('#mapInfoPanel').fadeOut(250);
		$('#explore_map').unbind('click');
	}
}

function findMotusData(id, prop) {
	
	if (prop == 'projectID') {
		$("#explore_filters .explore_projects").select2("data",{id:id});
		
	}
	
	return void(0);
}