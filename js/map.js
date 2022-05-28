
var motusMap = {};

var rawData = {};

var showTracks = true; //
var projectColours = {};
var milliseconds_annually = 3.154 * (10^10);

var tmpvar = 0;

function exploreMap({
	containerID,
	map_el = containerID,
	mapButtons = {
		'Points':'toggleButton selected mapBy dataType_stations',
		'Deployments':'toggleButton mapBy dataType_species',
		'Regions':'toggleButton mapBy dataType_stations',
		'Tracks':'toggleButton mapBy dataType_species',
		'Table':'toggleButton mapBy'
	},
	tileLayer = "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
	mapCenter = [24.1, 10],
	mapZoom = 2,
	callback
} = {}) {
	$(`#${motusMap.el}`).show();
	//$('#' + containerID).append('<div id="' + map_el + '" class="explore_map"></div>');
	//$('#' + containerID).append('<div id="' + map_el + '_legend"></div>');

	motusMap = {
		el: map_el,
		animation: {},
		layers: ["stations"],
		containerID: containerID,
		mapButtons: mapButtons,
		dims: {
			width: $("#" + containerID).innerWidth(),
			height: $("#" + containerID).innerHeight() - 30
		},
		center: mapCenter,
		visible: {
			projs: [],
			spp: [],
			animals: []
		},
		zoom: mapZoom,
		tileLayer: tileLayer,
		groups: {},
		map:  {},
		pointPath: d3.geoPath().pointRadius(1),// A path generator
		svg: undefined,
		legend: {
			el: d3.select("#" + motusMap.el + "_legend"),
			svg: undefined
		},
		colourScale: d3.scaleThreshold()
			.domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
			.range(d3.schemeReds[7]),
		colourScales: {
			frequency:	d3.scaleOrdinal().domain(["166.38", "150.1", "151.5", "434", "dual", "none"]).range(["#1b9e77","#d95f02","#7570b3","#e7298a","#E5C494","#999999"]),
			frequencies:	d3.scaleOrdinal().domain(["166.38", "150.1", "151.5", "434", "dual", "none"]).range(["#1b9e77","#d95f02","#7570b3","#e7298a","#E5C494","#999999"]),
			stations: d3.scaleOrdinal().range(customColourScale.jnnnnn),
			animals: d3.scaleOrdinal().range(customColourScale.jnnnnn),
			tracks: {

			},
			projects: d3.scaleOrdinal().range(customColourScale.jnnnnn),
			regions: d3.scaleOrdinal().range(customColourScale.jnnnnn),
			species: d3.scaleOrdinal().range(customColourScale.jnnnnn)
		},
		regionColours: {},
		loadingPane: function(text){
			console.log(text);
			if (text) {
				if ($(`#${motusMap.el} .leaflet-overlay-pane .leaflet-loading-pane`).length == 0) {
					$(`#${motusMap.el} .leaflet-overlay-pane`).append(`<div class='leaflet-loading-pane'><div class='loading-text'></div></div>`);
				}
				$(`#${motusMap.el} .leaflet-overlay-pane .leaflet-loading-pane .loading-text`).text(text).parent().fadeIn(250);
			} else {
				$(`#${motusMap.el} .leaflet-overlay-pane .leaflet-loading-pane`).fadeOut(250);
			}
		},
		dataHover: function(e, d, dir, t){
			if (typeof e.touches !== 'undefined') {
				e.preventDefault();
			}
			if (t == 'station' && typeof d !== 'undefined') {
				$('#explore_map_station_'+d.id).toggleClass('hover')
			}
			if (dir == 'in') {

				if (t == 'track') {

					var species = "Loading...";
					// Make a request to the database to find the species name
					 motusData.db.animals.get( d.id.toString() ).then( animal => {
						// var animal = exploreType == 'main' ? motusData.animals.filter( x => x.id == d.id )[0] : motusData.selectedAnimals.filter( x => x.id == d.id )[0];
						 let species = typeof animal.species === 'undefined' || animal.species == "NA" ? "Unknown species" : motusData.species.filter(x => x.id == animal.species)[0];
						 species = typeof species === 'undefined' ? "Unknown species" : species[currLang];

					 	 let project = motusData.projects.filter(x => x.id == animal.project);
						 // When request received, add the text
	 						$('.tooltip').html("<center><h3>"+
	 													icons.species + "&nbsp;&nbsp;&nbsp;" + (species) +
														 "&nbsp;&nbsp;&nbsp;" +
														`<a class='station-status station-status-${animal.status}'>`+
															`${firstToUpper(animal.status)}`+
														"</a>"+

	 												"</h3></center>"+

													`<div class='tooltip-grid'>`+

														`<div><b>Tag deployment: </b>${icons.animals}	#${d.id}</div>`+

														`<div><b>Stations visited: </b>${icons.station}	${d.stations.length} </div>`+

		 											  `<div><b>First deployed: </b>${animal.dtStart.toISOString().substr(0,10)}</div>`+

													  `<div><b>Last data: </b>${new Date(d3.max(d.ts)*1000).toISOString().substr(0,10)}</div>`+

		 											  `<div><b>Distance travelled: </b>${Math.round(d3.sum(d.dist)/1000)} km</div>`+

													  `<div><b>Average speed: </b>${Math.round(36 * d3.sum(d.dist)/(d.ts[d.ts.length-1]-d.ts[0]))/10} km/h</div>`+

														`<div><b>Frequency: </b>${d.frequency} MHz</div>`+

														`<div><b>Tag model: </b> ${d.model} </div>`+

														`<div class='tooltip-grid-colspan2'><b>Project: </b>${project.length > 0?project[0].name:""} (#${animal.project})</div>`+
														(
															isMobile ?
															`<div class='tooltip-grid-colspan2'><button class='submit_btn' onclick='motusMap.dataClick(false,{id: ${d.id}},"track")'>View station profile</button></div>`
		 													: `<div class='tooltip-grid-colspan2'>Click to view profile</div>`
														)+

													`</div>`+

	 												"<center>"+
	 												"</center>");
					 });

					$('.tooltip').html(
						"<big>"+species+"</big>"+
						"</br>(Click to view profile)"
					);

				} else if (t == 'antenna') {
						$('.tooltip').html(
							`<center><h3>${firstToUpper(d.properties.type)}</h3></center>`+
							( (d.geometry.coordinates.length > 2) ? `<b>Bearing: </b>${d.properties.bearing}<br/>` : '' )+
							`<b>Port: </b>${d.properties.port}<br/>`+
							`<b>Height: </b>${d.properties.height} (m)`
						);
				} else if (t == 'prospective-stations') {
						$('.tooltip').html(
							"<center><h3>"+
								d.properties.name+
							"</h3></center>"+
								`<a class='question tips' alt=''>`+
									`Status: ${(d.properties.status?d.properties["contact.name"]:"Prospective</a>")}`+
								"</a>"
						);
				} else if (t == 'coordination-region') {
						$('.tooltip').html(
							"<center><h3 style='margin:0 10px;'>"+
								d.properties.name+
							"</h3>"+
								d.properties["contact.name"]+
							"</br>(Click to view)</center>"
						);
				} else if (t == 'region') {

					var region = motusData.regionByCode.get(d.properties.adm0_a3)[0];

					$('.tooltip').html("<center><h3>"+
												d.properties.name+
											"</h3></center>"+
											`<table style="width:100%;text-align:center;font-size:14pt;"><tbody>`+
												`<tr><td>${region.animals} ${icons.animals}</td><td style="padding-left: 10px;">${region.stations} ${icons.station}</td></tr>`+
												`<tr><td><b>Animal${region.animals==1?"":"s"}</b></td><td style="padding-left: 10px;"><b>Station${region.stations==1?"":"s"}</b></td></tr>`+
											`</tbody></table>`+
											"<br/>"+
											"<center>Click to view profile</center>");

				} else if (t == 'station') {
					if (d.group > 1) {
						$('.tooltip').html(
							"<big>"+
								d.group + " Stations"+
							"</big>"+
							"<br/>"+
							`<em><b>${d.nAnimals} animal${d.nAnimals==1?"":"s"}</b></em> of <em><b>${d.nSpecies} species</b></em> detected`+
							"<br/>Frequency: "+(d.frequency.join(", "))+
							"</br>Click to zoom"
						);
					} else {
						var project = motusData.projects.filter(x => x.id == d.project);
						$('.tooltip').html("<center><h3>"+
													icons.station + "&nbsp;&nbsp;&nbsp;" + d.name +
													"&nbsp;&nbsp;&nbsp;" +
													`<a class='station-status station-status-${d.status}'>`+
														`${firstToUpper(d.status)}`+
													"</a>"+
												"</h3></center>"+

												`<div class='tooltip-grid'>`+

													`<div><b>Animals: </b>${icons.animals} ${d.nAnimals} </div>`+

													`<div><b>Species: </b>${icons.species} ${d.nSpecies}</div>`+

												  `<div><b>First installed: </b>${(typeof d.dtStart === 'number' ? new Date(d.dtStart*1000) : d.dtStart).toISOString().substr(0,10)}</div>`+

												  `<div><b>Last data: </b>${d.lastData} days ago</div>`+

													"<div><b>Frequency: </b>"+(d.frequency.join(", "))+"</div>"+

													`<div><b>Station model: </b> --- </div>`+

													`<div class='tooltip-grid-colspan2'><b>Project: </b>${project.length > 0?project[0].name:""} (#${d.project})</div>`+

													"<div class='tooltip-grid-colspan2'>"+
													( isMobile ? `<button class='submit_btn' onclick='motusMap.dataClick(false,{id: ${d.id}},"station")'>View station profile</button>`
														: "Click to view profile" )+
													"</div>"+

												`</div>`
											);
					}
				} else { // t == "animal"
/*					console.log("Data hover: %o", d);
					var filterName = motusFilter.colour;
					filterName = (dataType == 'species' && mapType != 'tracks') ? 'nSpecies' : filterName;

					var title = (dataType == 'species' && mapType != 'tracks') ?
									(d.nSpecies == 1 ? $("#filter_species option[value=" + d.species + "]").text() : "Species: " + d.name) + "</br>Animals: " + d.id.length
								: d.name;


					$('.tooltip').html(
						"<big>"+
							title+
						"</big></br>"+
						$(".colourType_selector option[value='" + motusFilter.colour + "']").text() + ": " + d[filterName]+
						"</br>Start: " + moment( d.dtStart ).toISOString().substr(0,10)+
						(d.status == 'active' ? ("</br><div class='green'>Active</div>") : ("</br>End: " + moment( d.dtEnd ).toISOString().substr(0,10) + "</br><div class='red'>Terminated</div>"))
					);
					*/
						var species = "Loading...";
						// Make a request to the database to find the species name
						 motusData.db.animals.get( d.id.toString() ).then( animal => {
							// var animal = exploreType == 'main' ? motusData.animals.filter( x => x.id == d.id )[0] : motusData.selectedAnimals.filter( x => x.id == d.id )[0];
							 let species = typeof animal.species === 'undefined' || animal.species == "NA" ? "Unknown species" : motusData.species.filter(x => x.id == animal.species)[0];
							 species = typeof species === 'undefined' ? "Unknown species" : species[currLang];

							 // When request received, add the text
		 						$('.tooltip').html("<center><h3>"+
		 													icons.species + "&nbsp;&nbsp;&nbsp;" + (species) +
															 "&nbsp;&nbsp;&nbsp;" +
															`<a class='station-status station-status-${animal.status}'>`+
																`${firstToUpper(animal.status)}`+
															"</a>"+

		 												"</h3></center>"+

														`<div class='tooltip-grid'>`+

															`<div><b>Tag deployment: </b>${icons.animals}	#${d.id}</div>`+

															`<div><b>Tagging site: </b><a href="https://www.google.ca/maps/search/${d.lat},${d.lon}" target="_blank">(${d.lat}, ${d.lon})</a></div>`+

			 											  `<div><b>First deployed: </b>${d.dtStart.toISOString().substr(0,10)}</div>`+

		 											  	`<div><b>Calculated end date: </b>${d.dtEnd.toISOString().substr(0,10)}</div>`+

															`<div><b>Frequency: </b>${d.frequency} MHz</div>`+

															`<div><b>Tag model: </b> ${d.manufacturer} ${d.model} </div>`+

															`<div class='tooltip-grid-colspan2'><b>Project: </b>${motusData.projects.filter(x => x.id == d.project)[0].name} (#${d.project})</div>`+

															(
																isMobile ?
																`<div class='tooltip-grid-colspan2'><button class='submit_btn' onclick='motusMap.dataClick(false,{id: ${d.id}},"track")'>View station profile</button></div>`
			 													: `<div class='tooltip-grid-colspan2'>Click to view profile</div>`
															)+

														`</div>`+

		 												"<center>"+
		 												"</center>");
						 });

						$('.tooltip').html(
							"<big>"+species+"</big>"+
							"</br>(Click to view profile)"
						);
				}
				if (typeof e.touches !== 'undefined') {
					if ($(document).width() < 600) {
						$('.tooltip').css({top:$(document).scrollTop() + 10, left: ($(document).width() - $('.tooltip').outerWidth()) / 2 });
					} else {
						if (e.touches[0].pageX + 15 + $('.tooltip').outerWidth() > $(window).width()) {
							$('.tooltip').css({top:e.touches[0].pageY - 10, left:e.touches[0].pageX - $('.tooltip').outerWidth() - 15});
						} else {
							$('.tooltip').css({top:e.touches[0].pageY - 10, left:e.touches[0].pageX + 15});
						}
					}
				} else {
					if (e.pageX + 15 + $('.tooltip').outerWidth() > $(window).width()) {
						$('.tooltip').css({top:e.pageY - 10, left:e.pageX - $('.tooltip').outerWidth() - 15});
					} else {
						$('.tooltip').css({top:e.pageY - 10, left:e.pageX + 15});
					}
				}
				$('.tooltip:hidden').show();
				if (isMobile) {
					$('.tooltip_bg:hidden').show();
				}

			} else if (dir == 'out') {
				$('.tooltip').hide();
			}
		},
		popup: function(location, content, remove) {

		//	if (remove) {
				$(".popup").remove();
		//	}

			$("body").append("<div class='popup'><div class='popup-topbar'><div class='popup-topbar-close'>X</div></div><div class='popup-content'></div></div>");
			$(".popup").draggable({handle: ".popup-topbar"});
			$(".popup .popup-topbar .popup-topbar-close").click(function(){$(".popup").remove();});

			$('.popup .popup-content').html(content);

			initiateTooltip($('.popup .popup-content .tips'));

			if (location.left + $('.popup').outerWidth() > $(window).width()) {
				location.left = location.left - $('.popup').outerWidth() - 30;
			}

			$('.popup').css(location);

			$('.popup:hidden').show();
		},
		dataClick: function(e, d, t) {
			if (t == 'station') {

				if (d.group > 1) {
				//	console.log(d);
			/*		if (motusMap.rect) {motusMap.map.removeLayer(motusMap.rect);}
					var line = [d.bounds[0], [d.bounds[1][0],d.bounds[0][1]], d.bounds[1], [d.bounds[0][0],d.bounds[1][1]], d.bounds[0]]

					motusMap.rect = L.polyline(line, {className: 'no-hover'}).addTo(motusMap.map);
					//motusMap.rect = L.rectangle(d.bounds, {color: 'blue', weight: 1}).addTo(motusMap.map);
				*/
					motusMap.map.fitBounds(d.bounds, {padding:[0,0], maxZoom: 200});
				} else {
	//				viewProfile("stations", d.station)
					motusMap.selectStation(d, {isDeployment: true, button: e.button});
					/*
					console.log(d)
					var content = "<center><h3>"+
													d.name+
												"</h3></center>"+
												`<a class='question tips' alt='Active stations are currently collecting data. Terminated stations are not.'>`+
													`Status: ${d.status}`+
												"</a>"+
												"<br/>"+
											  `Deployed on: ${d.dtStart.toISOString().substr(0,10)}`+
												"<br/>"+
												`<em><b>${d.nAnimals} animal${d.nAnimals==1?"":"s"}</b></em> of <em><b>${d.nSpp} species</b></em> detected`+
												"<br/>"+
												"<br/>"+
												`<center><button class='view_btn submit_btn' onclick='viewProfile(\"stations\", ${d.id})'>View station profile</button>`+
												"<button class='close_btn' onclick='$(this).closest(\".popup\").find(\".popup-topbar-close\").click()'>Close popup</button></center>"

					var location = {top:e.pageY - 10, left:e.pageX + 15};

					motusMap.popup(location, content);*/

				}

			} else if (t == 'prospective-stations') {
				var content =	"<div class='popup-content-main'><center><h3>"+
												d.properties.name+
											"</h3></center>"+
												`<a class='question tips' alt='${(d.properties.status?"":"Prospective stations indicate desired locations for new stations but no plans exist for an installation.")}'>`+
													`Status: ${(d.properties.status?d.properties["contact.name"]:"Prospective</a>")}`+
												"</a>"+
												"<br/>"+
												"<br/>"+
												"<center><button class='edit_btn submit_btn' onclick='editStationMeta($(this).closest(\".popup\").get(0))'>Edit</button>"+
												"<button class='close_btn'>Remove</button></center></div>"+
												`<div class='popup-content-editor'>`+
													`<center><h3>Station properties</h3></center>`+
		                      `Name: <input type='text' value='${d.properties.name}'><br/>`+
		                      `Status: <select><option selected='selected'>Prospective</option><option>Planned</option><option>Retired</option></select><br/>`+
		                      `Contact name: <input type='text' value='${d.properties["contact.name"]}'><br/>`+
		                      `Contact email: <input type='text' value='${d.properties.email}'>`+
													"<center><button class='save_btn submit_btn' onclick='editStationMeta($(this).closest(\".popup\").get(0), true)'>Save</button>"+
													"<button class='cancel_btn close_btn' onclick='editStationMeta($(this).closest(\".popup\").get(0), false)'>Cancel</button></center>"+
		                    `</div>`;

				var location = {top:e.pageY - 10, left:e.pageX + 15};

				motusMap.popup(location, content);

			} else if (t == 'regional-group') {
				$(".popup").remove();
				$("body").append("<div class='popup'><div class='popup-topbar'><div class='popup-topbar-close'>X</div></div><div class='popup-content'></div></div>");
				$(".popup").draggable({handle: ".popup-topbar"});
				$(".popup .popup-topbar .popup-topbar-close").click(function(){$(".popup").remove();});
				$('.popup .popup-content').html(
					"<center><h3>"+
						d.properties.name+
					"</h3></center>"+
						(d.properties["contact.email"]!=""?`Contact: <a href='mailto:${d.properties["contact.email"]}'>${d.properties["contact.name"]}</a>`:"<b><center>No contact</center></b>")+
						(d.properties["contact.email"]!=""&&d.properties["organisation"]!=""?"<br/>":"")+
						(d.properties["organisation"]!=""?`Organisation: <a href='${d.properties["website"]}'>${d.properties["organisation"]}</a>`:"")
					);

				if (e.pageX + 15 + $('.popup').outerWidth() > $(window).width()) {
					$('.popup').css({top:e.pageY - 10, left:e.pageX - $('.popup').outerWidth() - 15});
				} else {
					$('.popup').css({top:e.pageY - 10, left:e.pageX + 15});
				}

				$('.popup:hidden').show();


			} else if (t == 'region') {

				default_startDate = dtLims.min;
				default_endDate = dtLims.max;


				viewProfile('regions', d.properties.adm0_a3);

			} else if (t == 'animal') {
				viewProfile("animals", d.id)
				motusMap.selectAnimal(d, {isDeployment: true, button: e.button});
			} else if (t == 'track') {

//				motusMap.selectTrack(d);
				motusMap.selectAnimal(d, {isDeployment: false, button: e.button});

			}
		},
		legendClick: function(e, d){


			$(this).toggleClass( 'selected', !$(this).is(".selected") );

			let legendData = motusMap.mapLegendContent.selectAll("."+motusMap.colourDataType).data();

			let opt_type = this.classList[0];

			let opts_selected = motusMap.mapLegendContent.selectAll("."+motusMap.colourDataType+".selected").data().map( x => typeof x === 'object' ? x[0] : x );
/*
			let opts = {
				type: ,
				selected: legendData.map( x => typeof x === 'object' ? x[0] : x )
			};
*/
			if (legendData.length == opts_selected)
				opts_selected = [];

			$("#filter_"+motusMap.colourDataType).select2().val(opts_selected).trigger('change');

			if (opt_type == 'track') {
				motusMap.recolourTracks("legend");
			}

		},
		highlightSelections: function() {
			if (motusFilter.selections.length > 0) {
				$(`#exploreMap .explore-map-${toSingular(dataType)}.selected`).removeClass("selected");
				$(`#exploreMap .explore-map-${toSingular(dataType)}`).toggleClass("deselected", true);
				motusFilter.selections.forEach( (x) => {
					$(`#explore-map-${toSingular(dataType)}-${x}`).toggleClass("selected", true).toggleClass("deselected", false);
				});
			} else {
				$(`#exploreMap .explore-map-${toSingular(dataType)}.selected`).removeClass("selected");
				$(`#exploreMap .explore-map-${toSingular(dataType)}.deselected`).removeClass("deselected");
			}
		},
		highlightVal: '',
		trackView: false,
		selections: {},
		selectStation: function(d, {isDeployment, button}) {

			if (motusEditor.editMode) {
				modifyTrack({station: d.stationID });
			} else if (button == 0) {
				viewProfile("stations", isDeployment ? d.stationID : d.id);
			}

		},
		selectAnimal: function(d, {isDeployment, button}) {
			if (!isDeployment && motusEditor.editMode) {
					viewTrack(d.id);
			} else if (button == 0) {
				viewProfile("animals", d.id);
			}
		},
		setVisibility: function() {if (typeof motusMap.deckLayer !== 'undefined') deckGL_renderMap();},
		mapmove: function(e) {

			var mapBounds = motusMap.map.getBounds();
			var scale = motusMap.getZoomScale();

			if (dataType == 'stations') {
				var subset = motusMap.search(motusMap.qtree, mapBounds.getWest(), mapBounds.getSouth(), mapBounds.getEast(), mapBounds.getNorth(), scale);
			}
			else {
				var subset = motusMap.search(motusMap.qtree, mapBounds.getWest(), mapBounds.getSouth(), mapBounds.getEast(), mapBounds.getNorth(), scale);
			}
			console.log("Subset: ", subset);
			console.log("Zoom scale: ", scale);
			console.log("Map bounds: ", mapBounds);

			motusMap.redrawSubset(subset, scale);
		//	redrawSubset(subset);
		},
		regionColours: d3.scaleOrdinal().domain(["166.380 MHz", "151.50 MHz", "150.10 MHz", "none"]).range(["#66c2a5","#fc8d62","#8da0cb","#999999"])

	};

}

L.Control.SelectionButtons = L.Control.extend({
    onAdd: function(map) {
        var div = L.DomUtil.create('div');

        div.innerHTML = "<button class='explore-map-summarise-selections'>Summarise selections</button>"

				div.onclick = ()=>{summariseMapSelection()};

        return div;
    },

    onRemove: function(map) {
        // Nothing to do here
    }
});

function addDrawControls() {

	L.control.selectionButtons({ position: 'topright' }).addTo(motusMap.map);

	// Hide the summarise button at first since there won't be any selections to begin with
	$(".explore-map-summarise-selections").hide();

  var editableLayers = new L.FeatureGroup();
  motusMap.map.addLayer(editableLayers);

	var options = {
		position: 'topright',
		draw: {
				polyline: false, // Turns off this drawing tool
				polygon: {
						allowIntersection: false, // Restricts shapes to simple polygons
						drawError: {
								color: '#8f2525', // Color the shape will turn when intersects
								message: 'Lines are intersecting!' // Message that will show when intersect
						},
						shapeOptions: {
								color: '#85AF02'
						}
				},
				circle:  {
						shapeOptions: {
								color: '#85AF02'
						}
				},
				rectangle: {
						shapeOptions: {
								color: '#85AF02'
						}
				},
				marker: false, // Turns off this drawing tool,
				circlemarker: false // Turns off this drawing tool
		},
		edit: {
				featureGroup: editableLayers //REQUIRED!!
		}
	};



  var drawControl = new L.Control.Draw(options);
  motusMap.map.addControl(drawControl);

  motusMap.map.on("draw:created",addToSelection);
  motusMap.map.on("draw:deleted", removeSelection);
  motusMap.map.on("draw:edited",editSelection);

//	alert(1)

	motusMap.selections = {};

	function removeSelection(e) {

		e.layers.getLayers().forEach(function(layer) {

			console.log(layer);
			// Remove selections from edited shapes
			removeFromSelection( layer._leaflet_id );
		});

		deckGL_renderMap();

	}
	function editSelection(e) {
		console.log(e);

		if (e.type == "draw:editmove") {
			console.log(e.layer);
			// Remove selections from edited shapes
			removeFromSelection( e.layer._leaflet_id );

			// Add selections for edited shapes
			addToSelection({
				layerType: e.layer._mRadius ? "circle" : "polygon",
				layer: e.layer
			});
		}
		if (e.type == "draw:edited" || e.type == "draw:deletestop") {
			// Loop through each layer that has been edited
			e.layers.getLayers().forEach(function(layer) {

				console.log(layer);
				// Remove selections from edited shapes
				removeFromSelection( layer._leaflet_id );

				// Add selections for edited shapes
				addToSelection({
					layerType: layer._mRadius ? "circle" : "polygon",
					layer: layer
				});

			});

		}

	}

	function addToSelection(e) {

		$(".explore-map-summarise-selections:hidden").show();

    var type = e.layerType,
        layer = e.layer;

		if (type === 'polygon' || type == 'rectangle') {

			// Restructure lat/lon for d3 function 'polygonContains'
			var layerProps = {
				latlng: layer._latlngs[0].map( x => [x.lng, x.lat] ),
				id: L.stamp(layer)
			};


			motusData.stationDeps.forEach(function({station, geometry}){

				var stationInPolygon = d3.polygonContains( layerProps.latlng,  geometry.coordinates );
				if (stationInPolygon) {
				// console.log( "Polygon contains \"%s\"", station.__data__.name );
				// Add it to the list of selected stations
				if (typeof motusMap.selections[station] === 'undefined')
					motusMap.selections[station] = [layerProps.id];
				else if (!motusMap.selections[station].includes(layerProps.id))
					motusMap.selections[station].push(layerProps.id);
				// Highlight it on the map
				//		$(station).toggleClass("selected", true);
				}

			});

    } else if (type == 'circle') {

			var layerProps = {
				latlng: L.latLng(layer._latlng.lat, layer._latlng.lng),
				radius: layer._mRadius,	// Radius in meters
				id: L.stamp(layer)
			};


		// This should be a filtered dataset with only visible stations.
			motusData.stationDeps.forEach(function({station, geometry}){

				var stationLatLng = L.latLng(geometry.coordinates[1], geometry.coordinates[0]);
				var stationInPolygon = layerProps.latlng.distanceTo( stationLatLng ) < layerProps.radius;
				if (stationInPolygon) {
				 //console.log( "Circle %o #%s contains \"%s\"", layer, layerProps.id, station.__data__.name );
					// Add it to the list of selected stations
					if (typeof motusMap.selections[station] === 'undefined')
						motusMap.selections[station] = [layerProps.id];
					else if (!motusMap.selections[station].includes(layerProps.id))
						motusMap.selections[station].push(layerProps.id);
					// Highlight it on the map
					//	$(station).toggleClass("selected", true);
				}

			});


		}

		layer.bindPopup(`<button onclick="summariseMapSelection('${layerProps.id}')">Summarise these stations</button>`);

    editableLayers.addLayer(layer);

		deckGL_renderMap();
  }

	function removeFromSelection(leafletLayerID) {

		Object.entries(motusMap.selections).forEach(function(e) {

			let [k, v] = e;

			if ( v.includes(leafletLayerID) ) {

				if (v.length > 1)
					motusMap.selections[ k ].splice( v.indexOf(leafletLayerID), 1 );
				else
					delete motusMap.selections[ k ];

		//		$(`#explore_map_station_${k}`).toggleClass("selected", false);
			}
		});
		// Hide the summarise button if no selections exist
		if (Object.keys(motusMap.selections).length == 0)
			$(".explore-map-summarise-selections").hide();
	}
}

function summariseMapSelection(layerID) {

	// Don't do anything if there are no selections
	if ( Object.keys(motusMap.selections).length == 0 )
		return false;
	// If no layer ID is provided, just summarise all selections
	else if ( typeof layerID === "undefined" )
		viewProfile("stations", Object.keys(motusMap.selections));
	// If a layer ID is provided, only summarise selections from that layer
	else
		viewProfile("stations", Object.keys(motusMap.selections).filter( k => motusMap.selections[k].includes(parseInt(layerID)) ));

}

function loadMapObjects(callback) {


	if (typeof motusMap.baseLayers === 'undefined') {

		motusMap.baseLayers = {};

		motusMap.baseLayers.OpenStreetMaps_default = new L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			maxZoom: 20
		});


		motusMap.baseLayers.mapTiler_satelliteHybrid = L.tileLayer('https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=X3ebwkW7C581goLJPKpC',{
        tileSize: 512,
        zoomOffset: -1,
        minZoom: 1,
				maxZoom: 20,
        attribution: "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e",
        crossOrigin: true
		});

		var baseMaps = {
			"Light": motusMap.baseLayers.OpenStreetMaps_default,
			"Satellite": motusMap.baseLayers.mapTiler_satelliteHybrid
		}

		motusMap.map = new L.Map(motusMap.el, {
			center: motusMap.center,
			zoom: motusMap.zoom,
			maxZoom: 16,
			maxNativeZoom: 16,
			fullscreenControl: true,
			zoomControl: true,
			layers: [motusMap.baseLayers.OpenStreetMaps_default]
		//	zoomSnap: dataType == 'regions' ? 0 : 1,
		//	zoomDelta: dataType == 'regions' ? 0.25 : 0.5
		});

		L.control.layers(baseMaps).addTo(motusMap.map);
		L.control.scale().addTo(motusMap.map);
		L.control.selectionButtons = function(opts) {
		    return new L.Control.SelectionButtons(opts);
		}

		if (exploreType != 'main' || dataType == 'stations')
			addDrawControls();

		//motusMap.map.addLayer(new L.TileLayer(motusMap.tileLayer));

		//L.control.mapView({ position: 'topleft' }).addTo(motusMap.map);
		motusMap.map.zoomControl.setPosition('topleft');
		motusMap.map.fullscreenControl.setPosition('topleft');
	//	motusMap.map.setMaxBounds([[-90,-240],[90,240]]);

		var transform = d3.geoTransform({point: motusMap.projectPoint});
		motusMap.path = d3.geoPath().projection(transform);


		motusMap.legend.svg = motusMap.legend.el.append('svg').attr('class','leaflet-zoom-hide');
	}

		// TIMELINE

		if (timeline != undefined && timeline.el != undefined) {

			var dateLimits = motusData.stationDeps.map(function(d){
				return {
					start: d.dtStart,
					end: d.dtEnd
				}
			});

			timeline.setLimits(d3.min(dateLimits.map(d => new Date(d.start))), d3.max(dateLimits.map(d => new Date(d.start))));
			timeline.position = [timeline.min, timeline.max];

			dtLims.min = new Date( timeline.min );
			dtLims.max = new Date( timeline.max );

			$(timeline.el).dragslider("option", { "min": timeline.min, "max": timeline.max});
		//	console.log($('#explore_filters input.filter_dates').data('daterangepicker'));

		//	($('#explore_filters input.filter_dates').data('daterangepicker')).minDate = moment(new Date(timeline.min * 1000));
	//		$("#explore_filters input.filter_dates").daterangepicker("option", { "minDate": new Date(timeline.min * 1000), "maxDate": new Date(timeline.max * 1000)});
			if (motusData.selections) {
				timeline.createLegend();
			}
		}


	$(".toggleButton.explore_type:visible.selected").click();

	afterMapLoads();

}

function drawMapObjects(group) {

	motusMap.groups[group] = motusMap.svg.append("g").attr('class', `motusMap-${group}-container`);

	if (group == 'tagDeps') {

		var bounds = motusMap.path.bounds({ type: "FeatureCollection", features: motusData.animals.filter( d => !isNaN(d.geometry.coordinates[0])) });
		var topLeft = bounds[0];
		var bottomRight = bounds[1];

		//console.log({ type: "FeatureCollection", features: subset });
		//console.log(motusData.stationDepsBySubset);
		//console.log(d3.extent(subset, x => x.geometry.coordinates[1]));

		motusMap.svg.attr("width", bottomRight[0] - topLeft[0] + 100)
			.attr("height", bottomRight[1] - topLeft[1] + 100)
			.style("left", (topLeft[0]-50) + "px")
			.style("top", (topLeft[1]-50) + "px");

		motusMap.g.attr("transform", "translate(" + (-topLeft[0]+50) + "," + (-topLeft[1]+50) + ")");
		//motusMap.svg//.attr("width", bottomRight[0] - topLeft[0])
		//  .attr("height", bottomRight[1] - topLeft[1])
		  //.attr('class', "leaflet-zoom-hide")
		//  .style("left", topLeft[0] + "px")
		//  .style("top", topLeft[1] + "px");


		var stationsPaths = motusMap.groups[group].selectAll("tagDeps")
					  .data( motusData.animals.filter( d => !isNaN(d.geometry.coordinates[0]) ) )
						.enter().append("path")
						.attr("d", motusMap.path.pointRadius(4))
						.style('stroke', '#000')
						.style("fill", d => motusMap.colourScale(d[motusMap.colourVar]))
						.attr('class', 'leaflet-interactive explore-map-tagdep explore-map-point')
						.attr('id', (d) => 'explore-map-tagdep-'+d.id)
						.style('stroke-width', '1px')
						.style('pointer-events', 'auto')
						.on('mouseover', (e,d) => motusMap.dataHover(e, d, 'in', 'tagdep'))
						.on('mouseout', (e,d) => motusMap.dataHover(e, d, 'out', 'tagdep'))
						.on('click', (e,d) => motusMap.dataClick(e, d, 'tagdep'));

	}

}
// Start at deployment locations
// Tween to first station
// Tween to subsequent stations




function populateProfilesMap() {


// Set map bounds
	if (motusData.selectedRegions && false) {

		motusMap.regionBounds = d3.geoPath().bounds({features:motusData.selectedRegions, type: "FeatureCollection"});

		motusMap.map.fitBounds( [ [motusMap.regionBounds[0][1], motusMap.regionBounds[0][0]], [motusMap.regionBounds[1][1], motusMap.regionBounds[1][0]]]);
	} else if (dataType == 'stations' ){

			motusData.selectionBounds = motusData.selectedStations[0].geometry.coordinates;
			var stationBounds = {
					lons: Object.values(motusData.selectedStations).map( x => x.geometry.coordinates[0] ).flat(),
					lats: Object.values(motusData.selectedStations).map( x => x.geometry.coordinates[1] ).flat()
				}
				
			var trackBounds = {
					lons: Object.values(motusData.tracksLongByAnimal).map( x => x.tracks.map( y => +y[0]) ).flat(),
					lats: Object.values(motusData.tracksLongByAnimal).map( x => x.tracks.map( y => +y[1]) ).flat()
				}

			motusData.selectionBounds = [
				d3.extent( stationBounds.lons.concat(trackBounds.lons) ),
				d3.extent( stationBounds.lats.concat(trackBounds.lats) )
			];

			var bounds = [
				[ motusData.selectionBounds[1][0], motusData.selectionBounds[0][0] ],
				[ motusData.selectionBounds[1][1], motusData.selectionBounds[0][1] ]
			];

			motusMap.map.fitBounds( bounds );

	}

	$('.explore-card-wrapper').css({'opacity':1});

	deckGL_map();

}

function addMapLegend() {

	setMapColourScale();

	if (typeof motusMap.mapLegend === 'undefined')
		motusMap.mapLegend = d3.create('div').attr("class", "explore-map-legend hidden")
																.attr("id", "explore_map_legend");
	else // Empty if it already exists
		$("#explore_map_legend").html("");

	// Header button
	motusMap.mapLegend.append('div')
						.attr("class", "explore-map-legend-header")
						.on('click', function(){	$(this).closest('.explore-map-legend').toggleClass('hidden');	})
							.append('span')
							.text('Map legend')
							.attr('class', 'showHide');

// Legend content
	motusMap.mapLegendContent = motusMap.mapLegend.append('div')
																								.attr("class", "map-legend-content");

// Close button
	motusMap.mapLegend.append('div')
						.attr("class", "explore-map-legend-close")
						.on('click', function(){	$(this).closest('.explore-map-legend').toggleClass('hidden');	})
							.append('span')
							.text('Close')
							.attr('class', 'showHide');

	$('#explore_map').before("<div class='explore-map-controls'></div>")

	d3.select(".explore-map-controls").append(()=>motusMap.mapLegend.node());

	if (exploreType == 'main' || exploreType == 'report') {

		// Frequencies

		motusMap.mapLegendContent.append('div')
			.style('font-weight','bold')
			.text('Frequency')

		let freq_legend = motusMap.mapLegendContent.append("div")
				.attr('class','map-legend-section map-legend-freq');

		let freq_legend_els = freq_legend.selectAll('div')
			.data(Object.entries(filters.options.frequencies))
			.enter().append("div")
				.attr('class', d => `frequencies${motusFilter[motusMap.colourDataType].includes( 'all' ) || motusFilter.frequencies.includes(d[0])?' selected':''}`)
				.on('click', motusMap.legendClick);


		freq_legend_els.append("div")
					.style('border', 'solid 1px #000')
					.style('background-color', d => motusMap.colourScales.frequency( d[0] ))
					.style('width', "15px")
					.style('height', "15px");

		freq_legend_els.append("div")
			.text( d => d[1] );


	} else {


		// stations

			motusMap.mapLegendContent.append('div')
				.style('font-weight','bold')
				.text('Stations')

			var stations_legend =motusMap.mapLegendContent.append("div")
				.attr('class','map-legend-section map-legend-stations');

			var stationsLegendItems = [
				{
					classSuffix: "active",
					label: "Selected station (active)",
					r: 6,
					c: "#0F0"
				},
				{
					classSuffix: "inactive",
					label: "Selected station (inactive)",
					r: 6,
					c: "#FA0"
				},
				{
					classSuffix: "otheractive",
					label: "Other station (active)",
					r: 4,
					c: "#BDB"
				},
				{
					classSuffix: "otherinactive",
					label: "Other station (inactive)",
					r: 4,
					c: "#FCC"
				}
			]

			stationsLegendItems.forEach( d => {

			 	div = stations_legend.append("div")
									 .attr('class', `map-legend-station-${d.classSuffix} selected`)
									 .on('click', motusMap.legendClick);

			 	div.append("div")
			 		.style('border', 'solid 1px #000')
			 		.style('border-radius', '50%')
					.style('background-color', d.c)
			 		.style('width', `${d.r * 2}px`)
			 		.style('height', `${d.r * 2}px`);

			 	div.append("div")
			 		.text( d.label );

			});



		// tracks




		motusMap.mapLegendContent.append('div')
			.style('font-weight','bold')
			.text("Tracks");

		motusMap.mapLegendContent.append('div')
				.attr("class", "subtext")
				.html(motusMap.colourVar == 'colourVal' && dataType == 'stations' ?
				'Coloured by station nearest to tagging location.<br> Visiting tags were deployed more than 10 KM away from any selected station.' :
				'Coloured by tagging ' + motusMap.colourVar)

		var tracks_legend = motusMap.mapLegendContent.append("div")
			.attr('class','map-legend-section map-legend-tracks');

		let tracks_legend_els = tracks_legend.selectAll('div')
			.data( motusMap.colourScale.domain() )
			.enter().append("div")
				.attr('class', d => motusMap.colourDataType + (motusFilter[motusMap.colourDataType].includes( 'all' ) || motusFilter[motusMap.colourDataType].includes( d ) ? ' selected' : '') )
				.on('click', motusMap.legendClick);

		tracks_legend_els.append("div")
					.style('border', 'solid 1px #000')
					.style('background-color', d => motusMap.colourScale( d ))
					.style('width', "15px")
					.style('height', "15px");

		tracks_legend_els.append("div")
			.text( d => {
				var selectionName;

				if ( ['remote', 'other', 'visiting'].includes( d ) ) {
					selectionName = firstToUpper( d );
				} else if (motusMap.colourVar == dataType) {
					selectionName = motusData.selectionNames[ d ];
				} else if (motusMap.colourVar == 'project') {
					try {
						selectionName = motusData.projects.filter( proj => proj.id == d )[0].name;
					} catch {
						selectionName = "";
					}
				} else if (motusMap.colourVar == 'species') {
					try {
						selectionName = motusData.species.filter( spp => spp.id == d )[0].english;
					} catch {
						selectionName = "";
					}
				}
				return selectionName;
			});

/*
			motusMap.colourScale.domain().forEach(function(x, i) {

				var selectionColour = motusMap.colourScale.range()[i];
				var selectionName;

				if ( ['remote', 'other', 'visiting'].includes( x ) ) {
					selectionName = firstToUpper( x );
				} else if (motusMap.colourVar == dataType) {
					selectionName = motusData.selectionNames[ x ];
				} else if (motusMap.colourVar == 'project') {
					try {
						selectionName = motusData.selectedAnimalProjects.filter( proj => proj.id == x )[0].name;
					} catch {
						selectionName = false;
					}
				} else if (motusMap.colourVar == 'species') {
					try {
						selectionName = motusData.selectedSpecies.filter( spp => spp.id == x )[0].english;
					} catch {
						selectionName = false;
					}
				}

				// Don't add it to the legend if the selection doesn't exist
				if (selectionName) {
					var div = tracks_legend.append("div");

					div.append("div")
						.style('border-color', selectionColour );

					div.append("div")
						.text( selectionName );

					div
						.style('pointer-events', 'auto')
						.attr('class', d => x + motusFilter.frequencies.includes( d[0] ) ? ' selected' : '' )
						.on('click', motusMap.legendClick);

				}

			});
*/
	}

}







function setMapColourScale() {

	motusMap.colourVar = 	exploreType == 'main' ||  exploreType == 'report' ? 'frequency' :
													motusFilter.selections.length > 1 ? (
														dataType == "animals" ? 'id' :
														dataType == "regions" ? motusFilter.regionVar : dataType
													) :
														dataType == 'projects' ? "species" : "projects";

	motusMap.colourDataType = motusMap.colourVar == 'id' ? dataType : motusMap.colourVar == 'frequency' ? 'frequencies' : motusMap.colourVar;

	// Set the colour variable to singlar word (to match variable names in data tables)
	motusMap.colourVar = !["id", "stations", "frequency"].includes(motusMap.colourVar) ? toSingular(motusMap.colourVar) : motusMap.colourVar;

	// Get the domain for the colours scale
	motusMap.colourVarSelections = motusMap.colourVar == 'project' && ['animals', 'species'].includes(dataType) ? motusData.selectedAnimals.map( x => x.project ) :
																	motusMap.colourVar == 'species' && ['animals', 'species'].includes(dataType) ? motusData.selectedAnimals.map( x => x.species ).flat() :
																	motusMap.colourVar == 'project' && dataType == 'stations' ? motusData.selectedStations.map( x => x.project.split(',')[0] ).concat(motusData.selectedAnimalProjects.map( x => x.id )) :
																	motusMap.colourVar == 'species' && dataType == 'stations' ? motusData.selectedStations.map( x => x.species ).flat() :
																	motusMap.colourVar == 'project' && ['projects', 'regions'].includes(dataType) ? motusData.selectedStationProjects.map( x => x.id ).concat(motusData.selectedAnimalProjects.map( x => x.id )) :
																	motusMap.colourVar == 'species' && ['projects', 'regions'].includes(dataType) ? motusData.selectedAnimalProjects.map( x => x.species ).flat() :
																	motusMap.colourVar == "frequency" ? motusFrequencies : motusFilter.selections;


	// Remove duplicates and NAs
 	motusMap.colourVarSelections = [...new Set(motusMap.colourVarSelections)].filter( x => x != "NA" );


	// Set the colour scale
	motusMap.colourScale = motusMap.colourScales[ motusMap.colourDataType ].domain( motusMap.colourVarSelections );

	if (typeof motusMap.deckLayer !== 'undefined')
		deckGL_renderMap();





}
