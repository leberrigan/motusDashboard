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

var motusData = {};

var filters = {
	options: {
		projects: {},
		stations: {},
		species: {},
		frequencies: ["166.380","434", "151.5", "150.1"],
		regions: ["North America", "Latin America", "Europe", "Asia", "Australia", "Africa"],
		models: ["NTQB2-1", "NTQB2-1-2", "NTQB2-2", "NTQB2-3-2", "NTQB2-4-2"]
	},
	selected: {
		species: [4690]
	},
	data: {}
}


var motusFilter = {
	dtStart: new Date('2014-02-05'),
	dtEnd: new Date('2021-04-20'),
	species: "all",
	regions: "all",
	projects: "all",
	stations: "all",
	frequencies: "all",
	colour: ''
};
var URLdataType = null,
	URLmapType = null;
	
function updateURL() {
	
	var stateToPush = '?'+
		'dataType=' + encodeURIComponent(dataType) + 
		'&mapType=' + encodeURIComponent(mapType) + 
		'&dtStart=' + encodeURIComponent(new Date( motusFilter.dtStart ).toISOString().substr(0,10)) + 
		'&dtEnd=' + encodeURIComponent(new Date( motusFilter.dtEnd ).toISOString().substr(0,10)) + 
		'&species=' + encodeURIComponent(motusFilter.species.filter(onlyUnique)) + 
		'&regions=' + encodeURIComponent(motusFilter.regions.filter(onlyUnique)) + 
		'&projects=' + encodeURIComponent(motusFilter.projects.filter(onlyUnique)) + 
		'&stations=' + encodeURIComponent(motusFilter.stations.filter(onlyUnique)) + 
		'&frequencies=' + encodeURIComponent(motusFilter.frequencies.filter(onlyUnique)) + 
		'&colour=' + encodeURIComponent(motusFilter.colour);
	
	window.history.pushState(motusFilter, "Explore Data", stateToPush);
}



$(document).ready(function(){
	
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
		dtStart: urlFilter.dtStart === undefined ? new Date(motusFilter.dtStart) : new Date(urlFilter.dtStart),
		dtEnd: urlFilter.dtEnd === undefined ? new Date(motusFilter.dtEnd) : new Date(urlFilter.dtEnd),
		species: urlFilter.species === undefined ? filters.selected.species : urlFilter.species.split(','),
		regions: urlFilter.regions === undefined ? "all" : urlFilter.regions.split(','),
		projects: urlFilter.projects === undefined ? "all" : urlFilter.projects.split(','),
		stations: urlFilter.stations === undefined ? "all" : urlFilter.stations.split(','),
		frequencies: urlFilter.frequencies === undefined ? "all" : urlFilter.frequencies.split(','),
		colour: $("#explore_filters .colourType_selector option[value='" + urlFilter.colour + "']").length == 0 ? $("#explore_filters .colourType_selector").select2('val') : urlFilter.colour
	};
	
	// Set selected here eventually
	/*
	var urlFilter = {
		species: getUrlParameter('species')
	}

	for (f in urlFilter) {
		if (urlFilter[f] !== undefined) {filters.selected[f] = urlFilter[f];}
	}
	
	console.log(filters.selected);*/
	
	for (f in filters.selected) {
		filters.selected[f] = motusFilter[f];
	}
	
	
	Promise.all([d3.csv("data/projs.csv"), d3.csv("data/recv-deps.csv"), d3.csv("data/spp.csv"), d3.csv("data/tag-deps.csv")]).then(readData);


});

function readData(response) {
		
	motusData.projects = response[0];
	motusData.recvDeps = response[1];
	motusData.species = response[2];
	motusData.tagDeps = response[3];
	
	
	populateSelectOptions();
	
	
	initiateTooltip();
	
	initiateLightbox();
	
	dataType = 'species';
	mapType = 'tracks';
	
	
	exploreMap({
		containerID: 'explore_map_container', 
		mapButtons: {
			'Deployments':'toggleButton mapBy dataType_species selected',
			'Regions':'toggleButton mapBy dataType_stations',
			'Tracks':'toggleButton mapBy dataType_species'
		}
	});
	
	
	//loadMapObjects({"tagDeps": subset});
	
	loadMapData(["tracks", "tagDeps"], afterMapLoads);
}


function afterMapLoads() {
	
	loadDataTable('tagDeps', 'species');		
	
	
	addExploreCard({data:'add',type:'species'});
	
	updateURL();
	
}

function populateSelectOptions() {
	
	motusData.projects.forEach(function(d){
		
		filters.options.projects[d.id] = d.name;
		
	});
	
	motusData.recvDeps.forEach(function(d){
		
		filters.options.stations[d.deployID] = d.name;
		
	});
	
	motusData.species.forEach(function(d){
		
		filters.options.species[d.id] = d.english;
		
	});
	
	filters.options.models = motusData.tagDeps.map(d => d.model).filter(onlyUnique).filter(d => d.length > 0);
	filters.options.frequencies = {};
	motusData.tagDeps.map(d => d.frequency).filter(onlyUnique).filter(d => d.length > 0 && d!="NA").forEach(d => filters.options.frequencies[d] = d + " MHz");
	
	
	// Add wrapper with a funnel image
	
	$("#exploreContent").append("<div class='filter-options-wrapper'>"+
									"<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' class='bi bi-funnel tips' viewBox='0 0 16 16' alt='Filter data'>"+
										"<path fill-rule='evenodd' d='M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2h-11z'/>"+
									"</svg>"+
								"</div>");
	
	for(d in filters.options) {
		
		$("#exploreContent .filter-options-wrapper").append('<select id="filter_' + d + '" class="filter-option" multiple="multiple" data-placeholder="All ' + d + '"></select>');
	
		for (v in filters.options[d]) {
			
			$("#filter_" + d).append('<option value="' + v + '">' + filters.options[d][v] + '</option>');
			
		};
		
	}
	
	$("#exploreContent select.filter-option").select2({
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
	})//.change(setFilter);
	
}


function loadDataTable(tbl, filterVar) {
	
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
	
	
	var subset = motusData[tbl].filter(function(d){
		
		return filters.selected[filterVar].includes(d[filterVar]);
		
	})
	
	if (tbl == 'tagdeps' && filterVar == 'species') {
		subset.forEach(function(d){
						
			d[filterVar] = filters.options[filterVar][d[filterVar]];
			
		});
	}
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
		data: subset,
		columns: columns
	});
	
	motusFilter[filterVar].forEach(function(f) {
		
		var subsubset = subset.filter(function(d){
			
			return f == d[filterVar];
			
		});
		
		
		addExploreCard({
			data: subsubset,
			type: filterVar, 
			id: f,
			name: filters.options[filterVar][f],
			status: {
				tags: [subsubset.length],
				projects: [subsubset.map(x => x.projID).filter(onlyUnique).length],
				stations: [96],
				conservation: ['NT',"Near-threatened"]
			},
			photo: 'https://i.postimg.cc/jdFJcfF1/Screenshot-2020-11-10-110730.png'
		});
	});
	
}


function addExploreCard(card) {
	
	/*
	 card = {
		 data, type, name, id
	 }

	*/


	if (typeof card.data === 'object') {
		
		if (card.type == 'species') {
			
			var info = {
				tags: [card.data.length],
				projects: [card.data.map(x => x.projID).filter(onlyUnique).length],
				stations: [96],
				//conservation: ['LC',"Least concern"]
				conservation: card.conservation
			}
			
		} else if (card.type == 'stations') {
			
			var info = {
				tags: [card.data.length],
				projects: [card.data.map(x => x.projID).filter(onlyUnique).length],
				species: [96],
				lastData: new Date('2020-12-10')
			}
			
		}		
		
		
		var toAppend = "<div class='explore-card' id='explore_card_" + card.id + "'>"+
							"<div class='explore-card-header'>" + card.name + "</div>"+
						
							"<br>"+
						
							"<div class='explore-card-image tips enlarge' alt='Click to expand'>"+
							
							"</div>"+
							
							"<div class='explore-card-status'>";
							
		for (s in card.status) {
			var title = s == 'conservation' ? 'Conservation<br>status' : s == 'lastData' ? 'Last Data' : firstToUpper(s);
			toAppend += "<div><div class='status-icon status-icon-" + s + (s == 'conservation' ? ' tips' : '') + "'>" + card.status[s] + "</div>" + title + "</div>";
		}
		
		toAppend += "</div><br><div class='explore-card-info explore-card-subtext'> More info </div><div class='explore-card-remove explore-card-subtext'>Remove "+card.type+"</div></div>";
		
		
		if ($(".explore-card-add").length > 0) {$(".explore-card-add").before(toAppend);}
		else {$(".explore-card-map").before(toAppend);}
		
		card.el = $("#explore_card_" + card.id).get(0);
		
		$("#explore_card_" + card.id + " .explore-card-image").css("background-image", "url(" + card.photo + ")");
		$("#explore_card_" + card.id + " .explore-card-remove").click(function(){removeExploreCard(this, card.type)});
		
//		console.log(card.status);
		
		for (i in card.status) {
			
			var text = String(card.status[i][0]);
					
					
			var adjustedFontSize = 15 - text.length;
			var adjustedPadding = [(8 + text.length), (16 - (text.length * 3))];
			var adjustedWidth = 40 - (adjustedPadding[1] * 2);
			var adjustedHeight = 40 - (adjustedPadding[0] * 2);
				
			$("#exploreContent #explore_card_"+card.id+" .status-icon-" + i).text(text).css({fontSize: adjustedFontSize + 'pt', padding: adjustedPadding[0]+"px "+adjustedPadding[1] + "px", width: adjustedWidth+'px', height: adjustedHeight+'px'});
			
			if (card.status[i][1] != undefined) {
				
				$("#exploreContent #explore_card_"+card.id+" .status-icon-" + i).addClass('status-icon-' + (card.status[i][1].replace(' ', '-').toLowerCase())).attr('alt', card.status[i][1]);
				
			}
		}
		
		
		if (typeof motusFilter[card.type] === 'string') {motusFilter[card.type] = [];}
		
		motusFilter[card.type].push(String(card.id));
		
		if (typeof motusMap.setVisibility !== 'undefined') {motusMap.setVisibility();}
	
		if ($("#exploreContent .explore-card:not(.explore-card-map):not(.explore-card-add)").length == 1) {
			$("#exploreContent .explore-card:not(.explore-card-map):not(.explore-card-add)").parent().addClass('solo-card');
			try { motusMap.setColour('id'); }
			catch(err) { console.log("motusMap not yet created"); }
		} else {
			$("#exploreContent .explore-card:not(.explore-card-map):not(.explore-card-add)").parent().removeClass('solo-card');
			try { motusMap.setColour('species'); }
			catch(err) { console.log("motusMap not yet created"); }
		}
		
	}
	else if (card.data === 'add') {
		
		$("#exploreContent .explore-card-map").before("<div class='explore-card explore-card-add tips' alt='Add a "+card.type+"'><select class='explore-card-add-species' data-placeholder='Select a "+card.type+"' style='width:200px;'><option></option></select></div>")
		
		card.el = $("#exploreContent .explore-card-add").get(0);
		
		for (d in filters.options[card.type]) {
				
			$("#exploreContent .explore-card-add-species").append('<option value="' + d + '">' + filters.options.species[d] + '</option>')
		
		};
		
		$("#exploreContent .explore-card-add").click(function(e){
			e.stopPropagation();
			if (!$(this).hasClass('visible')) {
				$(this).addClass('visible');
				$('body').click(function(){$("#exploreContent .explore-card-add").removeClass('visible');$(this).unbind('click');});
				$("#exploreContent .explore-card-add > select").select2("open");
			}
		});
		
		$("#exploreContent .explore-card-add-" + card.type).select2({
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
		}).change(selectNewExplore);
		
		function selectNewExplore() {
			
			var dataName = card.type == 'species' ? 'tagDeps' : card.type;
			
			var dataID = this.options[this.selectedIndex].value;
			
			filters.selected[card.type] = dataID;
			
			var subset = motusData[dataName].filter(function(d){
				
				return d[card.type] == filters.selected[card.type];
				
			})
			
			subset.forEach(function(d){
							
				d[card.type] = filters.options[card.type][d[card.type]];
				
			});
			
			
			addExploreCard({
				type: card.type, 
				data: subset,
				name: this.options[this.selectedIndex].innerHTML, 
				id: dataID,
				status: {
					tags: [subset.length],
					projects: [subset.map(x => x.projID).filter(onlyUnique).length],
					stations: [14],
					conservation: ['LC',"Least concern"]
				},
				photo: "https://www.flaticon.com/svg/static/icons/svg/3165/3165217.svg"
			});
			
			$("body").trigger('click');
		}
	}
	
	initiateTooltip(card.el);
	
	updateURL();
	
}

function removeExploreCard(el, filterType) {
	
	var cardID = $(el).closest('.explore-card').attr('id').replace('explore_card_', '');
	
	$(el).closest('.explore-card').remove();
	
	motusFilter[filterType] = motusFilter[filterType].filter(function(x){return x != cardID;});
	
	console.log(motusFilter[filterType]);
	
	if ($("#exploreContent .explore-card:not(.explore-card-map):not(.explore-card-add)").length == 1) {
		$("#exploreContent .explore-card:not(.explore-card-map):not(.explore-card-add)").parent().addClass('solo-card');
		motusMap.setColour('id');
	} 
	
	motusMap.setVisibility();
	
	updateURL();
}
function loadExploreCards(stats) {
	
	
	for (s in stats) {
		
		var text = String(stats[s][0]);
			
		
		var adjustedFontSize = 15 - text.length;
		var adjustedPadding = [(8 + text.length), (16 - (text.length * 3))];
		var adjustedWidth = 40 - (adjustedPadding[1] * 2);
		var adjustedHeight = 40 - (adjustedPadding[0] * 2);
			
		$("#exploreContent .status-icon-" + s).text(text).css({fontSize: adjustedFontSize + 'pt', padding: adjustedPadding[0]+"px "+adjustedPadding[1] + "px", width: adjustedWidth+'px', height: adjustedHeight+'px'});
		
		if (stats[s][1] != undefined) {
			
			$("#exploreContent .status-icon-" + s).addClass('status-icon-' + (stats[s][1].replace(' ', '-').toLowerCase())).attr('alt', stats[s][1]);
			
		}
	}
	
	var adjustedFontSize = '13pt';
	
	
	$("#exploreContent .explore-card-map").before("<div class='explore-card explore-card-add tips' alt='Add a species'><select class='explore-card-add-species' data-placeholder='Select a species' style='width:200px;'><option></option></select></div>")
	
	for (d in filters.options.species) {
			
		$("#exploreContent .explore-card-add-species").append('<option value="' + d + '">' + filters.options.species[d] + '</option>')
	
	};
	
	
	$("#exploreContent .explore-card-add").click(function(e){
		e.stopPropagation();
		if (!$(this).hasClass('visible')) {
			$(this).addClass('visible');
			$('body').click(function(){$("#exploreContent .explore-card-add").removeClass('visible');$(this).unbind('click');});
			$("#exploreContent .explore-card-add > select").select2("open");
		}
	});
	
	$("#exploreContent .explore-card-add-species").select2({
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
	}).change(function(){
		addExploreCard('species', this.options[this.selectedIndex].value);
	});
	
}


function setCardColours(colourFun) {
	
	
	$(".explore-card:not(.explore-card-add):not(.explore-card-map)").each(function(){
		if ($(".explore-card:not(.explore-card-add):not(.explore-card-map)").length == 1) {	
			$(this).find('.explore-card-image').css('border-color', "#000000");
		} else {
			 $(this).find('.explore-card-image').css('border-color', colourFun(this.id.replace("explore_card_", "")))
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
	
		var filterName = e.target.className.split(' ')[0].replace("explore_", "");
		
		var newFilter = $(e.target).val();
		
		newFilter = newFilter.length == 0 ? 'all' : newFilter;
		
		motusFilter[filterName] = newFilter;
		
		var displayText = motusFilter[filterName].map(v => $("#explore_filters .explore_" + filterName + " option[value='" + v + "']").text());
		
		
		$("#filter_summary > div.explore_" + filterName + ":not(.visible)").addClass('visible');
		$("#filter_summary > div.clear_filters:not(.visible)").addClass('visible');
		$("#filter_summary > div.explore_" + filterName + " > span").text(displayText.join(', '));

	}
	
		
	updateURL();
	
	motusMap.setVisibility();
	
	return false;
}