// icons from https://mapmarker.io/
// fontawesome: https://fontawesome.com/icons?d=gallery&q=check&s=regular
/*

** Anders Kitson
** https://stackoverflow.com/questions/25267146/google-maps-javascript-api-v3-data-layer-markerclusterer

map.data.setStyle(function(feature) {
    var marker = feature.getProperty('Status');
    var markerCheck = marker === 'Active' ? 'https://cdn.mapmarker.io/api/v1/font-awesome/v5/pin?text=P&size=40&background=D94B43&color=FFF&hoffset=-1' : 'https://cdn.mapmarker.io/api/v1/font-awesome/v5/icon?icon=fa-star-solid&size=50&color=DC4C3F';
    var colorCheck = marker === 'Active' ? "#0000FF" : "#000000";
    return {
      icon: markerCheck,
      strokeColor: colorCheck
    };
  });

*/


var googleMaps_apiKey = "AIzaSyBUWjOcaQ4B5zMEFzGudOUuhQ0PaUAhNbw";
var dashboard_editTables = {};
var allMaps = {};
var allMarkers = {};
var dashboard_menuItems = ["Project", "Users", "Data Issues", "Receivers", "Tags", "Upload", "Download"];
var mainMenu_selectedItem = "home";
var allDataSources = {"All Projects":{
							"Receivers":[
								"Models",
								"Status",
								"Frequency"
							],
							"Tags":[
								"Species",
								"Status",
								"Model",
								"Frequency",
								"Data issues"
							]
						},
						"Single project":{
							"Receivers":[
								"Model",
								"Status",
								"Frequency",
								"Tags or species detected",
								"Total # Hits",
								"Detection timeline",
								"Data issues",
								"Severity",
								"Length of time running",
								"One receiver or site:"
							],
							"Tags":[
								"Detection timeline",
								"Antenna/GPS activity",
								"All tags or species:",
								"Total # receivers or sites",
								"Total # detections",
								"Detections timeline",
								"Models",
								"Frequencies",
								"Status",
								"% or # days remaining",
								"Data issues severity",
								"Map of deployments",
								"Map of detections",
								"One tag or species",
								"Receivers or sites detected on",
								"Detection timeline",
								"Map of detections"
							]
						}
					};
/*var map_icons = {
							active: {
								icon:
							},
							terminated: {
								icon: https://cdn.mapmarker.io/api/v1/fa?size=50&icon=fa-times&color=%23373737&
							},
							data_now: {
								icon:
							},
							data_recent: {
								icon:
							},
							data_old: {
								icon:
							}
						}*/
var selectOptions = {
									"proj-primaryContact": 
									[
										"Instition of the Principal Investigator", 
										"Department of Interior (USFWS, USGS, BOEM) - CRADA", 
										"Environment and Climate Change Canada"
									],
									"proj-feeContacts": 
									[
										"Instition of the Principal Investigator", 
										"Department of Interior (USFWS, USGS, BOEM) - CRADA", 
										"Environment and Climate Change Canada"
									]
								};
var all_dataTables = {};
var selectedProject = 2;

var delimiter = "_";

var infowindow;

var _default_marker_color = '000000';
var _default_marker_shape = 'https://cdn.mapmarker.io/api/v1/pin?size=50&background=%23%s';
var _default_marker_zIndex = '100';

var testtest = 0;
$(document).ready(function() {
//	initialise_projectTables();
	infowindow = new google.maps.InfoWindow();
	requestProjectData("projs", undefined, "#projectList");
	if (window.location.href.indexOf("?") != -1) {
		//console.log("getUrlParameter: " + getUrlParameter(window.location.href, 'proj'))
		selectedProject = getUrlParameter(window.location.href, 'proj');
		mainMenu_selectedItem = getUrlParameter(window.location.href, 'page').toLowerCase();
	} else {
		window.history.pushState("test", "test", setUrlParameter(window.location.href, 'proj', selectedProject));
		window.history.pushState("test2", "test2", setUrlParameter(window.location.href, 'page', mainMenu_selectedItem));
	}
	
	loadCanvas();
	
/*	var project_select_html = "";

	for (project in dashboard_data) {
		project_select_html += "<option value='" + project.replace('Project','') + "'" + (selectedProject == project.replace('Project','') ? " selected='selected' " : "") + ">" + dashboard_data[project]['name'] + "</option>";
	}

	$("#projectList").html(project_select_html).select2({placeholder:"Select Project", width:"200px"}).change(function(){loadData();});
*/
	loadMenu();
});

function loadMenu() {
	for (item in pageContent) {
		$("#main-menu ul").append("<li id='" + item + "'>" + pageContent[item].header + "<img src='" + pageContent[item].icon + "' width='20'></li>");
	}
	
	$("#main-menu li").each(loadContentHTML).click(showContent);
	console.log("$(\"#"+mainMenu_selectedItem+"\").length = " + $("#" + mainMenu_selectedItem).length);
	if ($("#" + mainMenu_selectedItem).length > 0) {
		$("#" + mainMenu_selectedItem).click();
	} else {$("#main-menu li").eq(0).click();}
}

function loadContentHTML() {
	
	$("#main-content").append("<div id='" + this.id + "-content' class='item-content'>"+
											"<input type='hidden' value='0' id='" + this.id + "-data_isLoaded'>"+
											"<table class='main-table'><tbody></tbody></table>"+
											"</div>");
	//		console.log(this.id);
											
	for (el_id in pageContent[this.id].elements) {
		//	console.log(el_id);
		el = pageContent[this.id].elements[el_id];
		if (el.type == 'tabs') {
			$("#" + this.id + "-content").append("<div id='" + this.id + delimiter + el_id + "'><ul></ul></div>");
			for (tab_id in el.tabs) {
				tab = el.tabs[tab_id];
				$("#"  + this.id + delimiter + el_id + " ul").append("<li><a href='#" + this.id + delimiter + el_id + delimiter + tab_id + "'>" + tab.name + "</a></li>");
				$("#" + this.id + delimiter + el_id).append("<div id='" + this.id + delimiter + el_id + delimiter + tab_id + "'></div>");
				for (e_id in tab.elements) {
					e = tab.elements[e_id];
					if (e.type == 'input') {
		//				addInputElement($("#"  + this.id + "-" + el_id + "-" + tab_id + "-content"));
						addInputElement($("#"  + this.id + delimiter + el_id + delimiter + tab_id), this.id + delimiter + el_id + delimiter + tab_id + delimiter + e_id, e.input, e.label);
					} else if (e.type == 'table') {
						addTable($("#"  + this.id + delimiter + el_id + delimiter + tab_id), this.id + delimiter + el_id + delimiter + tab_id + delimiter + e_id, e.cols);
					} else if (e.type == 'map') {
						addMap($("#"  + this.id + delimiter + el_id + delimiter + tab_id),  this.id + delimiter + el_id + delimiter + tab_id + delimiter + e_id, e);
					}
				}
			}
			$("#" + this.id + delimiter + el_id).tabs();
		} else if (el.type == 'table') {
			addTable($("#" + this.id + "-content"), this.id + delimiter + el_id, el.cols);
		} else if (el.type == 'input') {
			addInputElement($("#" + this.id + "-content .main-table tbody"), this.id + delimiter + el_id, el.input, el.label);
		} else if (el.type == 'map') {
			addMap($("#" + this.id + "-content .main-table"), this.id + delimiter + el_id, el);
		}
	}
	
	$(".item-content:visible").hide();
}

function showContent() {
	if (!$(this).hasClass('selected')) {
		mainMenu_selectedItem = this.id;
		window.history.pushState("test", "test", setUrlParameter(window.location.href, 'page', mainMenu_selectedItem));
		$("#main-menu li.selected").removeClass('selected');
		$(this).addClass('selected');
		
		if ($("#" + this.id + "-content:hidden").length > 0) {
			
			$(".item-content:visible").hide();
			
			if ($("#" + this.id + "-data_isLoaded").val() == 0) {
				loadData(this.id);
			}
			
			$("#" + this.id + "-content").show();
			
		}
	}
//	$("#main-content").
}

function addMap(appendTo, id, el) {
	appendTo.before("<h2>" + el.name + "</h2><div class='map-dash'><div id='" + id + "' class='map-wrapper'></div><div class='map-legend'><input  id='_" + id + "_check' type='checkbox'><label class='show-hide_toggle' for='_" + id + "_check'><span> legend</span></label></div></div>");
	if (el.height) {
		$("#" + id).css({height:el.height});
	}
}
function centerMap(locations, map) {
	var bounds = new google.maps.LatLngBounds();
	var infowindow = new google.maps.InfoWindow();    

	for (i = 0; i < locations.length; i++) {  
	  var marker = new google.maps.Marker({
		position: new google.maps.LatLng(locations[i][1], locations[i][2]),
		map: map
	  });

	  //extend the bounds to include each marker's position
	  bounds.extend(marker.position);

	  google.maps.event.addListener(marker, 'click', (function(marker, i) {
		return function() {
		  infowindow.setContent(locations[i][0]);
		  infowindow.open(map, marker);
		}
	  })(marker, i));
	}

	//now fit the map to the newly inclusive bounds
	map.fitBounds(bounds);

	//(optional) restore the zoom level after the map is done scaling
	var listener = google.maps.event.addListener(map, "idle", function () {
		map.setZoom(3);
		google.maps.event.removeListener(listener);
	});
}
function addInputElement(appendTo, id, type, label) {
	//alert(appendTo + "\n" + id + "\n" + type + "\n" + label);
	appendTo.append('<tr></tr>');
	if (label != undefined && label.length > 0 && type != 'button' && type != 'submit') {
		appendTo.find('tr:last').append("<td><label for='" + id+ "'>" + label + "</label></td>");
	} else {appendTo.find('tr:last').append("<td></td>");}
	if (type == 'text') {
		appendTo.find('tr:last').append("<td><input type='text' id='" + id + "'></td>");
	} else if (type == 'button') {
		appendTo.find('tr:last').append("<td><input type='button' id='" + id + "' value='" + label + "'></td>");
	} else if (type == 'submit') {
		appendTo.find('tr:last').append("<td><input type='text' id='" + id + "'><input type='button' value='" + label + "'></td>");
	} else if (type == 'textarea') {
		appendTo.find('tr:last').append("<td><textarea id='" + id + "'></textarea></td>");
	} else if (type == 'select') {
		appendTo.find('tr:last').append("<td><select id='" + id + "'></select></td>");
		for (o in selectOptions[id]) {
			$("#" +  id).append("<option>" + selectOptions[id][o] + "</option>");
		}
		$("#" + id).select2();
	} else if (type == 'upload') {
		appendTo.find('tr:last').append("<td><form id='" + id + "'>"+
														"<label for='" + id + "_btn'>Upload File</label>"+
														"<input type='file' id='" + id + "_btn'>"+
													"</form></td>");
		$("#" + id).fileupload({url: 'server/php/'});
	}
}

function addTable(appendTo, id, cols)  {
	
	appendTo.append("<table id='"+id+"'><thead><tr></tr></thead><tbody><tr></tr></tbody></table>");
	
}

function loadData(catID = $("#main-menu li.selected").attr("id")) {
	
	var projID = selectedProject;
	
	var obj = pageContent[catID].obj;
	
	for (el_id in pageContent[catID].elements) {
		
		el = pageContent[catID].elements[el_id];
		
		if (el.type == "tabs") {
			for (tab_id in el.tabs) {
				tab = el.tabs[tab_id];
				for (e_id in tab.elements) {
					e = tab.elements[e_id];
					e.id = e_id;
					insertElementData(e, obj, projID, catID, el_id + delimiter + tab_id);
				}
			}
		} else {
			el.id = el_id;
			insertElementData(el, obj, projID, catID);
		}
	}
	
	$("#" + catID + "-data_isLoaded").val(1)
	
}

function insertElementData(el, obj, projID, catID, tabID) {
	if (el.type == 'table') {
		requestTableData("#" + catID + delimiter + (tabID != undefined ? tabID + delimiter : "") + el.id, projID, el.id)
	} else if (el.type == 'input') {
		if (dashboard_data["Project" + projID] != undefined) {
			var data = dashboard_data["Project" + projID][el.id];
			if (data != undefined) {
				$("#" + catID + delimiter + el.id).val(data);
			}
		} else {
			console.log("No data exists for this project!");
		}
	} else if (el.type == 'map') {
		
		var mapID = "#" + catID + delimiter + el.id;
		
		
		allMaps[mapID] = {
										map: new google.maps.Map($(mapID).get(0), {zoom: 4}),
										bounds:  new google.maps.LatLngBounds()
								};
		
		
		if ($(mapID).siblings(".map-legend").find(".map-legend-tbl").length == 0) {
			createLegend(mapID);
		}
		
		allMarkers[mapID] = {};
		
		google.maps.event.addListener(allMaps[mapID].map.data, 'addfeature', function (e) {
			if (e.feature.getGeometry().getType() === "Point") {
				allMaps[mapID].bounds.extend(e.feature.getGeometry().get());
				allMaps[mapID].map.fitBounds(allMaps[mapID].bounds);
				
				
				
				var mapStyle = pageContent[mapID.split(delimiter)[0].replace("#", "")].elements[mapID.split(delimiter)[1]]
				
				var shape_val = e.feature.getProperty(mapStyle.shapes.col);
				var color_val = e.feature.getProperty(mapStyle.colors.col);
				
			//	console.log("shape_val: " + shape_val + " - color_val: " + color_val);
			
				if (!isNaN(parseInt(color_val)) && mapStyle.shapes.color[i] != false) {
						var i = 1; 
						while (mapStyle.colors.values[i] <= parseInt(color_val) && mapStyle.colors.values[i] != undefined) {
							i++;
						}
						i--;
						color_val = mapStyle.colors.values[i];
				} else if (color_val == undefined) {
					color_val = "NA";
				} 
				
				if (!isNaN(parseInt(shape_val))) {
						var i = 1; 
						while (mapStyle.shapes.values[i] <= parseInt(shape_val) && mapStyle.shapes.values[i] != undefined) {
							i++;
						}
						i--;
						shape_val = mapStyle.shapes.values[i];
						if (mapStyle.shapes.color[i] === false) {
							color_val = "NA";
						}
				} else if (shape_val == undefined) {
					shape_val = "NA";
				}
			//	console.log("onAdd: " + shape_val + '-' + color_val);
				
				if (allMarkers[mapID][shape_val + "-" + color_val]	== undefined) {
					allMarkers[mapID][shape_val + "-" + color_val]	= [];
				}
				allMarkers[mapID][shape_val + "-" + color_val].push(e.feature.getId())
				
			//	console.log('$("' + mapID + "_option-" + shape_val + "-" + color_val + '").length: ' + $(mapID + "_option-" + shape_val + "-" + color_val).length);
				var count = parseInt($(mapID + "_option-" + shape_val + "-" + color_val).siblings(".nSites").text());
				count = isNaN(count) ? 1 : count + 1;
				
				
				console.log($(mapID + "_option-" + shape_val + "-" + color_val).siblings(".nSites").text() + " - " + count);
				$(mapID + "_option-" + shape_val + "-" + color_val).siblings(".nSites").text(count);
			//	$(mapID + "_option-" + shape_val + "-" + color_val).siblings(".").text();  
				
			}
		});
		allMaps[mapID].map.data.addListener('click', function(event) {
			var feat = event.feature;
			if (feat.getProperty('description')) {
				var html = "" + feat.getProperty('name') + " - <b>" + (feat.getProperty('status') == 2 ? "Active" : feat.getProperty('status') == 1 ? "Terminated" : "Pending")+ "</b><br>"+feat.getProperty('description');
				//html += "<br><a class='normal_link' target='_blank' href='"+feat.getProperty('link')+"'>link</a>";
				infowindow.setContent(html);
				infowindow.setPosition(event.latLng);
				infowindow.setOptions({pixelOffset: new google.maps.Size(0,-34)});
				infowindow.open(allMaps[mapID].map);
			}
		});
		//						console.log("data/proj" + projID + "-" + el.id.replace('-map', '') + ".geojson");
		allMaps[mapID].map.data.loadGeoJson("data/proj" + projID + "-" + el.id.replace('-map', '') + ".geojson", {
			idPropertyName: "ID"
		});
		console.log(allMaps[mapID].map.data);
		allMaps[mapID].map.data.setStyle(function(feature){
		//	if (el.id.replace('-map','') == 'recv-deps') {
				var mapStyle = pageContent[mapID.split(delimiter)[0].replace("#", "")].elements[mapID.split(delimiter)[1]]
				
				var marker_color_shape = 0;
					
				if (mapStyle.colors != undefined && mapStyle.colors.col != "NA" && feature.getProperty(mapStyle.colors.col) != undefined) {
					
					var marker_color_var = mapStyle.colors.col;
					
					try {
						var marker_color_val = parseInt(feature.getProperty(marker_color_var));
					} catch {
						alert(err.message);
					}
					
					marker_color_val = isNaN(marker_color_val) ? "NA" : marker_color_val;
					
					if (!isNaN(marker_color_val)) {
						var i = 1; 
						while (mapStyle.colors.values[i] <= marker_color_val && i < 10) {
							i++;
						}
						i--;
						var marker_color = mapStyle.colors.color[i];
					} else {
						
						var i = 0; 
						while (mapStyle.colors.values[i] !== marker_color_val && i < 10) {
							i++;
						}
						var marker_color = mapStyle.colors.color[i];
					}
					marker_color_shape = mapStyle.colors.shape[i];
					marker_color_val = mapStyle.colors.values[i];
				} else if (mapStyle.colors != undefined && feature.getProperty(mapStyle.colors.col) != undefined) {
					var marker_color = mapStyle.colors.color;
					var marker_color_shape = 0;
					marker_color = marker_color == undefined ? "000000" : marker_color;
					marker_color_val = "NA";
				} else {
					var marker_color = _default_marker_color;
					var marker_color_shape = 0;
					marker_color_val = "NA";
					console.log("mapStyle.colors: " + mapStyle.colors + " - mapStyle.colors.col: " + mapStyle.colors.col + " - feature.getProperty(mapStyle.colors.col): " + feature.getProperty(mapStyle.colors.col));
				}
				if (mapStyle.shapes !== undefined && mapStyle.shapes.col !== "NA" && feature.getProperty(mapStyle.shapes.col) !== undefined) {
					// console.log("marker_color_val: " + marker_color_val +" - marker_color_shape[" + i + "]: " + marker_color_shape);
					var marker_shape_var = mapStyle.shapes.col;
					
					try {
						var marker_shape_val = parseInt(feature.getProperty(marker_shape_var));
					} catch {
						alert(err.message);
					}
					marker_shape_val = marker_shape_val == undefined ? "NA" : marker_shape_val;
					var j = 0; 
					
					while (mapStyle.shapes.values[j] != marker_shape_val && mapStyle.shapes.values[j] != undefined) {
						j++;
					}
					
					var marker_shape = (marker_color_shape != 0 ? marker_color_shape : mapStyle.shapes.shape[j])
					
					if (marker_shape == undefined) {
//						console.log("marker_shape_val = " + marker_shape_val + "; feature.getProperty(marker_shape_var) = " + feature.getProperty(marker_shape_var) + "; marker_shape_var = " + marker_shape_var);
					//	console.log("(" + marker_color_shape + " != 0 ?  " + marker_color_shape + " : " + mapStyle.shapes.shape[j] + "), j = " + j);
					//	console.log(marker_shape);
					} else {
						marker_shape = marker_shape.indexOf("%s") != -1 ? marker_shape.replace("%s", marker_color) : marker_shape;
					}
					if (j == 0) {
					//	console.log("j = " + j + " - i = " + i + " - mapStyle.shapes.shape[j] = " + mapStyle.shapes.shape[j] + " - marker_color_shape = " + marker_color_shape);
					//	console.log("pageContent['"+mapID.split(delimiter)[0].replace("#", "")+"'].elements['" + mapID.split(delimiter)[1] + "']");
					};
					var marker_zIndex = mapStyle.shapes.zIndex[j];
					marker_shape_val = mapStyle.shapes.values[j];
					if (!mapStyle.shapes.color[j]) {
						marker_color_val = "NA";
					}
					if (marker_shape_val == 0) {
						console.log("Shape = 0; marker_color_shape: " + marker_color_shape +" - marker_shape: " + marker_shape + " - mapStyle.shapes.col: " + mapStyle.shapes.col + " - j: " +j + " - mapStyle.shapes.shape[j]: " + mapStyle.shapes.shape[j]);
					}
				} else if (mapStyle.shapes !== undefined && feature.getProperty(mapStyle.shapes.col) != undefined) {
					var marker_shape = (mapStyle.colors.col !== "NA" && marker_color_shape != 0 ? marker_color_shape : mapStyle.shapes.shape);
					marker_shape = (marker_shape == undefined ? "https://cdn.mapmarker.io/api/v1/pin?size=50&background=%23%s" : marker_shape).replace("%s", marker_color);
					var marker_zIndex = mapStyle.shapes.zIndex;
					marker_zIndex = marker_zIndex == undefined ? 100 : marker_zIndex;
					marker_shape_val = "NA";
				} else {
					console.log(marker_color);
					var marker_shape = _default_marker_shape.replace("%s", marker_color);
					var marker_zIndex = _default_marker_zIndex;
					marker_shape_val = "NA";
				}
				
				
			//	console.log("Test: " + marker_shape_val + "-" + marker_color_val);
				
				/*
				if (allMarkers[mapID][marker_shape_val + "-" + marker_color_val]	== undefined) {
					allMarkers[mapID][marker_shape_val + "-" + marker_color_val]	= [];
				}
				allMarkers[mapID][marker_shape_val + "-" + marker_color_val].push(feature.getId())
				*/
				return {
					icon: marker_shape,
					zIndex: marker_zIndex,// marker_status == 2 ? 100 : marker_color == "000000" ? 99 : 98
					visible: !feature.getProperty("isHidden")
				}
		});
		
		/*
		if ($(mapID).siblings(".map-legend").find(".map-legend-tbl").length == 0) {
			createLegend(mapID)
		}*/
	}
}

function createLegend(mapID) {
	
	var shape_levels = {"NA": {
										name: 'Terminated', 
										img: 'https://cdn.mapmarker.io/api/v1/fa?size=50&icon=fa-times&color=%23000000&'
									},
									2: {
										name: 'Active', 
										img: 'https://cdn.mapmarker.io/api/v1/pin?size=50&background=%23%s&icon=fa-check&color=%23FFFFFF&voffset=0&hoffset=1&',
										noData: 'https://cdn.mapmarker.io/api/v1/pin?size=50&background=%23%s&icon=fa-question&color=%23FFFFFF&voffset=0&hoffset=0&'
									}
								}
	var legend_label = 'Number of days since last data received';
	var color_levels = {"NA": {
										name: 'No data',
										color: '000000'
									},
								365: {
										name: '>365',
										color: 'F44E3B',
									},
								180: {
										name: '>180',
										color: 'FE9200',
									},
								90: {
										name: '>90',
										color: 'FCDC00',
									},
								30: {
										name: '>30',
										color: 'DBDF00',
									},
								1: {
										name: '>1',
										color: 'A4DD00'
									},
								0: {
										name: '<1',
										color: '68CCCA'
									}
								};
								
	
	var mapStyle = pageContent[mapID.split(delimiter)[0].replace("#", "")].elements[mapID.split(delimiter)[1]];
	var shapes = mapStyle.shapes;
	var colors = mapStyle.colors;
	var legend_toAppend = "";
	var number_icons = 0;
	for (s in shapes.color) {
		if (shapes.color[s] === true) {
			for (c in colors.values) {
				number_icons++; 
				color_label = colors.names[c] == '' ? color : colors.names[c];
				var checkbox_id = mapID.replace('#', '') + "_option-" + shapes.values[s] + "-" + colors.values[c];
				shape = colors.shape[c] == 0 ? shapes.shape[s].replace("%s", colors.color[c]) : colors.shape[c].replace("%s", colors.color[c]);
				legend_toAppend += "<td><div class='nSites'>0</div><input type='checkbox' id='" + checkbox_id + "' checked='checked'><label for='" + checkbox_id + "'><img src='" + shape + "' alt='" + color_label + "'><br>" + color_label + "</label></td>";
			} 
		} else {
			number_icons++;
			var checkbox_id = mapID.replace('#', '') + "_option-" + shapes.values[s] + "-NA";
		//	var test2 = shapes.values[s] + "-NA";
		//	console.log(test2);
		//	console.log(allMarkers[mapID]);
			legend_toAppend += "<td><div class='nSites'>0</div><br><input type='checkbox' id='" + checkbox_id + "' checked='checked'><label for='" + checkbox_id + "'><img src='" + shapes.shape[s].replace("%s", _default_marker_color) + "' alt='" + shapes.names[s] + "'><br>" + shapes.names[s] + "</label></td>";
		}
	}
	legend_toAppend = "<table class='map-legend-tbl'><tbody><tr>" + legend_toAppend + "<tr><td colspan='" + number_icons + "'><b>" + legend_label + "</b></td></tr>";
	legend_toAppend += "</tr></tbody></table>";
	$(mapID).siblings('.map-legend').append(legend_toAppend);
	
	console.log($(mapID).siblings('.map-legend-tbl').find('label').length)
	$(mapID).siblings('.map-legend').find('.map-legend-tbl label').click(function(){
		var markers = allMarkers[mapID][$(this).attr('for').split("_option-")[1]];
		if (markers != undefined) {
			console.log($(this).attr('for').split("_option-")[1] + " - " + markers.length + " - " + $("#" + $(this).attr('for')).is(":checked"));
	//		console.log(markers[0])
			for (i in markers) {
				allMaps[mapID].map.data.getFeatureById(markers[i]).setProperty('isHidden', $("#" + $(this).attr('for')).is(":checked"));
			}
		}
	});
//	allMaps[mapID].map.data.setStyle(function(feature){
	
}