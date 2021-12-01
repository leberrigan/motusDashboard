
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
			frequency:	d3.scaleOrdinal().domain(["166.38", "151.5", "150.1", "434", "dual", "none"]).range(["#1b9e77","#d95f02","#7570b3","#e7298a","#E5C494","#999999"]),
			stations: {
				points: {
					status: d3.scaleOrdinal(d3.schemeDark2),
					frequency: d3.scaleOrdinal(d3.schemeDark2),
					projID: d3.scaleSequential(d3.interpolateCubehelixDefault).domain([0,350]),
					id: d3.scaleOrdinal(d3.schemeDark2),
					name: d3.scaleOrdinal(d3.schemeDark2)
				},
				regions: {
					frequency: d3.scaleOrdinal(d3.schemeDark2),
					projID: d3.scaleSequential(d3.interpolateCubehelixDefault).domain([0,350])
				}
			},
			animals: {

			},
			tracks: {

			},
			projects: {

			},
			regions: {

			},
			species: {
				points: {
					status: d3.scaleOrdinal(d3.schemeDark2),
					frequency: d3.scaleOrdinal(d3.schemeDark2),
					projID: d3.scaleSequential(d3.interpolateCubehelixDefault).domain([0,350]),
					species: d3.scaleOrdinal(d3.schemeDark2),
					id: d3.scaleOrdinal(d3.schemeDark2)
				},
				tracks: {
					status: d3.scaleOrdinal(d3.schemeDark2),
					frequency: d3.scaleOrdinal(d3.schemeDark2),
					species: d3.scaleOrdinal(d3.schemeCategory10),
					projID: d3.scaleSequential(d3.interpolateCubehelixDefault).domain([0,350]),
					id: d3.scaleOrdinal(d3.schemeDark2)
				},
				regions: {
					frequency: d3.scaleOrdinal(d3.schemeDark2),
					projID: d3.scaleSequential(d3.interpolateCubehelixDefault).domain([0,350])
				}
			}
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
					if (d.species.length == 1) {
						var species = "Loading...";
					// Make a request to the database to find the species name
					 motusData.db.species.get( d.species.toString() ).then( sp => {
						 // When request received, add the text
						 $('.tooltip big').text(
							 // If there are more than one animals, display the number of animals, but not the ID
		 							(d.animal.length > 1 ? (d.animal.length + " " + (typeof sp === 'undefined' ? "Unknown species" : sp.english + "s") ):
		 							(typeof sp === 'undefined' ? "Unknown species" : sp.english) + " #"+d.animal)
							 );
					 });
				 } else {
						// If there are more than one species, list the number of species as well as the number of animals.
						var species = `${d.animal.length} animals of ${d.species.filter(onlyUnique).length} species`;
				 }
					$('.tooltip').html(
						"<big>"+species+"</big>"+
						"</br>(Click to view)"
					);

				} else if (t == 'path') {

					var species = "Loading...";
					// Make a request to the database to find the species name
					 motusData.db.species.get( d.species.toString() ).then( sp => {
						 // When request received, add the text
						 $('.tooltip').html(
							 // If there are more than one animals, display the number of animals, but not the ID
							 );
	 						$('.tooltip').html("<center><h3>"+
	 													icons.species + "&nbsp;&nbsp;&nbsp;" + (typeof sp === 'undefined' ? "Unknown species" : sp.english) +
		 												"<br/>"+
														icons.animals + "&nbsp;&nbsp;&nbsp;#" + d.id +
	 												"</h3></center>"+

													`<b>Stations visited: </b>${icons.station}	${d.stations.length} `+
	 												"<br/>"+
	 											  `<b>First deployed: </b>${new Date(d3.min(d.ts)*1000).toISOString().substr(0,10)}`+
	 												"<br/>"+
	 											  `<b>Last data: </b>${new Date(d3.max(d.ts)*1000).toISOString().substr(0,10)}`+
	 												"<br/>"+
	 											  `<b>Distance travelled: </b>${Math.round(d3.sum(d.dist)/1000)} km`+
	 												"<br/>"+
	 											  `<b>Average speed: </b>${Math.round(36 * d3.sum(d.dist)/(d.ts[d.ts.length-1]-d.ts[0]))/10} km/h`+
	 												"<br/>"+/*
	 												`<a class='station-status station-status-${d.status}'>`+
	 													`${firstToUpper(d.status)}`+
	 												"</a>"+*/
	 												"<br/>Frequency: "+d.frequency+
	 												"<center>"+
	 												( isMobile ? `<button class='submit_btn' onclick='motusMap.dataClick(false,{id: ${d.id}},"station")'>View station profile</button>`
	 													: "Click to view profile" )+
	 												"</center>");
					 });

					$('.tooltip').html(
						"<big>"+species+"</big>"+
						"</br>(Click to view)"
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
				} else if (t == 'regional-group') {
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
						$('.tooltip').html("<center><h3>"+
													icons.station + "&nbsp;&nbsp;&nbsp;" + d.name +
												"</h3></center>"+


												`<table style="width:100%;text-align:center;font-size:14pt;"><tbody>`+
													`<tr><td>${d.nAnimals} ${icons.animals}</td><td style="padding-left: 10px;">${d.nSpecies} ${icons.species}</td></tr>`+
													`<tr><td><b>Animal${d.nAnimals==1?"":"s"}</b></td><td style="padding-left: 10px;"><b>Species</b></td></tr>`+
												`</tbody></table>`+
												"<br/>"+
											  `<b>First installed: </b>${(typeof d.dtStart === 'number' ? new Date(d.dtStart*1000) : d.dtStart).toISOString().substr(0,10)}`+
												"<br/>"+
											  `<b>Last data: </b>${d.lastData} days ago	`+
												"<br/>"+
												`<a class='station-status station-status-${d.status}'>`+
													`${firstToUpper(d.status)}`+
												"</a>"+
												"<br/>Frequency: "+(d.frequency.join(", "))+
												"<center>"+
												( isMobile ? `<button class='submit_btn' onclick='motusMap.dataClick(false,{id: ${d.id}},"station")'>View station profile</button>`
													: "Click to view profile" )+
												"</center>");
					}
				} else { // t == "tag deployment"
					console.log("Data hover: %o", d);
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
					viewProfile("stations", d.id)
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
			} else if (t == 'track') {

				// Highlight all the tracks that shares these animals
				$(".popup").remove();
				$("body").append("<div class='popup'><div class='popup-topbar'><div class='popup-topbar-close'>X</div></div><div class='popup-content'></div></div>");
				$(".popup").draggable({handle: ".popup-topbar"});
				$(".popup .popup-topbar .popup-topbar-close").click(function(){
					$(".popup").remove();
					$(".explore-map-track").css({'opacity':1,'pointer-events':'auto'});
					motusMap.group_f = 20;
					motusFilter.animals = motusFilter.animalsOld;
				});
				var allTracks = [];
				motusFilter.animalsOld = motusFilter.animals;
				motusFilter.animals = d.animal && d.animal.every(x=>x!="NA") ? d.animal : motusFilter.animals;
				motusMap.group_f = false;

				var animals = motusFilter.animals.forEach(function(a){

					allTracks = allTracks.concat(motusData.tracksByAnimal[a]);

				});


				$(".explore-map-track").css({'opacity':0,'pointer-events':'none'});


				allTracks.filter(onlyUnique).forEach(function(route){

					if (exploreType == 'main') {
						var recvs = route.split('.');
						var recv1 = motusData.stationDepsBySubset[recvs[0]],
							recv2 = motusData.stationDepsBySubset[recvs[1]];
						recv1 = recv1 ? recv1 : recvs[0];
						recv2 = recv2 ? recv2 : recvs[1];

						recvs = ( recvs[0] < recvs[1] ? recvs[0] + "-" + recvs[1] : recvs[1] + "-" + recvs[0] );
						if ($("#explore-map-track-" + recvs ).length == 0) {
							recvs = ( recv1 < recvs[1] ? recv1 + "-" + recvs[1] : recvs[1] + "-" + recv1 );
							if ($("#explore-map-track-" + recvs ).length == 0) {
								recvs = ( recvs[0] < recv2 ? recvs[0] + "-" + recv2 : recv2 + "-" + recvs[0] );
								if ($("#explore-map-track-" + recvs ).length == 0) {
									recvs = ( recv1 < recv2 ? recv1 + "-" + recv2 : recv2 + "-" + recv1 );
								}
							}
						}
					} else {
						var recvs = route.replace('.','-');
					}
					//$("#explore-map-track-" + ( recv1 < recv2 ? recv1 + "-" + recv2 : recv2 + "-" + recv1 ) ).removeClass('hidden');

					$("#explore-map-track-" + recvs ).css({'opacity':1,'pointer-events':'auto'});

				});
			//	console.log(motusData.stationDepsBySubset);
				// Make a table of species and their count and display a popup
				var spp = d.species;
				var animals = d.animal;

				var species = d3.rollup( spp.map(function(x, i){
						return {
							species: x,
							animal: animals[i]
						}
					}), (v) => v.map(x => x.animal), x => x.species);
				//spp.forEach(sp => speciesCounts[sp] = speciesCounts[sp] ? speciesCounts[sp] + 1 : 1);
				var rows = (Array.from(species.keys()).map(function(sp, i){

					var speciesName = 'Unknown species';

					 motusData.db.species.get( sp ).then( speciesMeta => {
						 speciesName = typeof speciesMeta === 'undefined' ? "Unknown species" : speciesMeta[currLang];
							 $(`.popup .popup-content tbody tr:eq(${i}) td.species`).text(
								 speciesName
							 );
					 });
	 				console.log(species.get(sp))

					return "<tr>" +
									"<td class='species'>"+
										speciesName+
									"</td>"+
									"<td>"+
										(species.get(sp).length)+
									"</td>"+
									"<td>"+
										(//(species.get(sp).length) > 3 ?
										//	"<a href='#e=species&d=species&species="+sp+"&animals="+(species.get(sp))+"'>Animal profile</a>" :
											"<a href='#e=animals&d=animals&animals="+encodeURIComponent(species.get(sp))+"'>Animal profile</a>")+

									"</td>"+
									"<td>"+
										"<a href='#e=species&d=species&species="+encodeURIComponent(sp)+"'>Species profile</a>"+
									"</td>"+
								"</tr>";

				}));

				$('.popup .popup-content').html(
					"<table><thead><tr><th>Species</th><th>Count</th><th></th><th></th></tr></thead><tbody>"+
					(rows.join(''))+//(await rows[0]).join("")+
					"</tbody></table>"
				)

				if (e.pageX + 15 + $('.popup').outerWidth() > $(window).width()) {
					$('.popup').css({top:e.pageY - 10, left:e.pageX - $('.popup').outerWidth() - 15});
				} else {
					$('.popup').css({top:e.pageY - 10, left:e.pageX + 15});
				}

				$('.popup:hidden').show();
				$('.popup .popup-content table').DataTable({dom:"t", paging: false,
					"columnDefs": [ {
						"targets": 2,
						"orderable": false
					},
					{
			 			"targets": 3,
			 			"orderable": false
			 			}
					]
				});
			}
		},
		legendClick: function(e, d){
			console.log(d);
			console.log(motusMap.mapLegendContent.selectAll(".frequencies").data());

			$(this).toggleClass( 'selected', !$(this).is(".selected") );

			let opts = {
				type: this.classList[0],
				selected: motusMap.mapLegendContent.selectAll(`.${this.classList[0]}.selected`).data().map( x => x[0] )
			};

			console.log(opts);

			$("#filter_frequencies").select2().val(opts.selected).trigger('change')


			if (opts.type == 'track') {
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

L.control.selectionButtons = function(opts) {
    return new L.Control.SelectionButtons(opts);
}

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

	motusMap.selections = {};

	function removeSelection(e) {

		e.layers.getLayers().forEach(function(layer) {

			console.log(layer);
			// Remove selections from edited shapes
			removeFromSelection( layer._leaflet_id );
		});

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

			console.log("Polygon is %o", layerProps);

			motusMap.g.selectAll('.explore-map-station:not(.hidden)').nodes().forEach(function(station){
				var stationInPolygon = d3.polygonContains( layerProps.latlng, station.__data__.geometry.coordinates );
				if (stationInPolygon) {
				// console.log( "Polygon contains \"%s\"", station.__data__.name );
				// Add it to the list of selected stations
				if (typeof motusMap.selections[station.__data__.id] === 'undefined')
					motusMap.selections[station.__data__.id] = [layerProps.id];
				else
					motusMap.selections[station.__data__.id].push(layerProps.id);
				// Highlight it on the map
						$(station).toggleClass("selected", true);
				}

			});

    } else if (type == 'circle') {

			var layerProps = {
				latlng: L.latLng(layer._latlng.lat, layer._latlng.lng),
				radius: layer._mRadius,	// Radius in meters
				id: L.stamp(layer)
			};

		//	console.log("Circle is %o", layerProps);
		//	console.log("Circle layer is %o", layer);

			motusMap.g.selectAll('.explore-map-station:not(.hidden)').nodes().forEach(function(station){
//					console.log( "Distance: %s vs. Radius: %s", layerProps.latlng.distanceTo(station.__data__.geometry.coordinates), layerProps.radius)
				var stationLatLng = L.latLng(station.__data__.geometry.coordinates[1],station.__data__.geometry.coordinates[0]);
				var stationInPolygon = layerProps.latlng.distanceTo( stationLatLng ) < layerProps.radius;
				if (stationInPolygon) {
				 //console.log( "Circle %o #%s contains \"%s\"", layer, layerProps.id, station.__data__.name );
					// Add it to the list of selected stations
					if (typeof motusMap.selections[station.__data__.id] === 'undefined')
						motusMap.selections[station.__data__.id] = [layerProps.id];
					else
						motusMap.selections[station.__data__.id].push(layerProps.id);
					// Highlight it on the map
						$(station).toggleClass("selected", true);
				}

			});


		}

		layer.bindPopup(`<button onclick="summariseMapSelection('${layerProps.id}')">Summarise these stations</button>`);

    editableLayers.addLayer(layer);
  }

	function removeFromSelection(leafletLayerID) {

		Object.entries(motusMap.selections).forEach(function(e) {

			let [k, v]= e;

			if ( v.includes(leafletLayerID) ) {

				if (v.length > 1)
					motusMap.selections[ k ].splice( v.indexOf(leafletLayerID), 1 );
				else
					delete motusMap.selections[ k ];

				$(`#explore_map_station_${k}`).toggleClass("selected", false);
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


	if (typeof motusMap.svg === 'undefined') {

		motusMap.map = new L.Map(motusMap.el, {
			center: motusMap.center,
			zoom: motusMap.zoom,
			maxZoom: 16,
			maxNativeZoom: 16,
			fullscreenControl: true,
			zoomControl: true,
			zoomSnap: dataType == 'regions' ? 0 : 1,
			zoomDelta: dataType == 'regions' ? 0.25 : 0.5
		});

		if (exploreType != 'main' || dataType == 'stations')
		addDrawControls();

		if (dataType == 'stations' || dataType == 'animals' || exploreType != 'main') {motusMap.map.addLayer(new L.TileLayer(motusMap.tileLayer));}

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

			timeline.min = d3.min(dateLimits.map(d => new Date(d.start).getTime())) / 1000;
			timeline.max = d3.max(dateLimits.map(d => new Date(d.start).getTime())) / 1000;
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


	console.log(motusData);

	if (dataType == 'regions') {
		motusMap.regionPaths = motusMap.g.selectAll("regions")
			.data(motusData.selectedRegions)
			.enter().append("path")
			.attr("d", motusMap.path)
			.attr('class', 'explore-map-regions leaflet-zoom-hide')
			.style('stroke', '#000')
			.style('fill', d => motusFilter.regions.includes(d.properties.adm0_a3) ? "#FFF" : "#CCC" )
			.style('stroke-width', '1px');
	}

	var yesterday = new Date().addDays( -365 );
// Other stations
	motusMap.g.selectAll('stations')
		.data( motusData.stations
						.filter( d => !motusFilter.selectedStationDeps.includes( d.id ) )
						.sort((a, b) => d3.ascending(a.id, b.id))
					 	.map( d => {
							return {
								...d,
								...{
									animals: undefined,
									species: undefined,
									projects: undefined,
								}
							}	;
						}))
		.enter().append("path")
		.attr("d", motusMap.path.pointRadius(4))
		.style('stroke', '#000')
		.style('fill', d => (d.dtEnd > yesterday ? '#BDB' : '#FCC'))
		.attr('id', d => "explore_map_station_" + d.id)
		.attr('class', d => 'explore-map-station explore-map-r4 leaflet-zoom-hide explore-map-station-' + (d.dtEnd > yesterday ? 'otheractive' : 'otherinactive') )
		.style('stroke-width', '1px')
		.style('pointer-events', 'auto')
		.on('mouseover touchstart', (e,d) => motusMap.dataHover(e, d, 'in', 'station'))
		.on('mouseout touchmove', (e,d) => motusMap.dataHover(e, d, 'out', 'station'))
		.on('touchend', (e) => e.preventDefault())
		.on('click', (e,d) => motusMap.dataClick(e, d, 'station'));


	testTimer.push([new Date(), "Set map bounds"]);

// Selected stations
	motusMap.g.selectAll('stations')
		.data( motusData.selectedStations.sort((a, b) => d3.ascending(a.id, b.id)) )
		.enter().append("path")
		.attr("d", motusMap.path.pointRadius(6))
		.style('stroke', '#000')
		.style('fill', d => (d.dtEnd > yesterday ? '#0F0' : '#FA0'))
		.attr('id', d => "explore_map_station_" + d.id)
		.attr('class', d => 'explore-map-station leaflet-zoom-hide explore-map-station-' + (d.dtEnd > yesterday ? 'active' : 'inactive') )
		.style('stroke-width', '1px')
		.style('pointer-events', 'auto')
		.on('mouseover touchstart', (e,d) => motusMap.dataHover(e, d, 'in', 'station'))
		.on('mouseout touchmove', (e,d) => motusMap.dataHover(e, d, 'out', 'station'))
		.on('touchend', (e) => e.preventDefault())
		.on('click', (e,d) => motusMap.dataClick(e, d, 'station'));


	testTimer.push([new Date(), "Set map bounds"]);
	motusMap.stationPaths = motusMap.g.selectAll('.explore-map-station')

	if (motusData.selectedRegions && false) {

		motusMap.regionBounds = d3.geoPath().bounds({features:motusData.selectedRegions, type: "FeatureCollection"});

		motusMap.map.fitBounds( [ [motusMap.regionBounds[0][1], motusMap.regionBounds[0][0]], [motusMap.regionBounds[1][1], motusMap.regionBounds[1][0]]]);
	} else if (dataType == 'stations' ){

		if (motusData.selectedStations.length == 1) {

			motusData.selectionBounds = motusData.selectedStations[0].geometry.coordinates;

			motusMap.map.setView(  [motusData.selectionBounds[1], motusData.selectionBounds[0]], 9);

		} else { // If there are more than one points, get the extent of the bounds and fit them.

			var lats = motusData.selectedStations.map( x => x.geometry.coordinates[1]);
			var lons = motusData.selectedStations.map( x => x.geometry.coordinates[0]);
			motusData.selectionBounds = [ d3.extent(lons), d3.extent(lats)];

			motusMap.map.fitBounds( [ [motusData.selectionBounds[1][0], motusData.selectionBounds[0][0]], [motusData.selectionBounds[1][1], motusData.selectionBounds[0][1]]]);

		}

	}

	testTimer.push([new Date(), "Add track paths"]);

	var colourBy = dataType == 'stations' ? 'recv1' : dataType == 'species' ? 'species' : "origin"

	var colourVar = motusMap.colourVar == 'projects' ? "project" : "colourVal";
//	var colourVar = "project";

	var colourVarSelections = colourVar == 'project' ? motusData.selectedAnimalProjects.map( x => x.id ) : motusFilter.selections;


	motusMap.trackPaths = motusMap.g.selectAll("tracks")
		.data(Object.values(motusData.selectedTracks))
		.enter().append("path")
		.attr('class', (d) => {
			// Remove values which are not part of the selection
			if (typeof d[colourVar] === 'string' && d[colourVar].includes('-')) {
				d[colourVar] = d[colourVar].split("-");
				console.log(d[colourVar])
			}
			if (typeof d[colourVar] === 'object') {
				var v = d[colourVar].filter( x => colourVarSelections.includes(x) )
														.map( x => `explore-map-track-${x.toLowerCase()}` );
				// If values exist which are not part of the selection, add the 'visiting' class
				if (d[colourVar].filter( x => !colourVarSelections.includes(x) ).length > 0) {
					v.push("explore-map-track-visiting");
				}
			} else {
				var v = [];
				v[0] = `explore-map-track-${d[colourVar].toLowerCase()}`;
			}

			return "explore-map-track explore-map-species leaflet-zoom-hide " + v.join(" ");
		})
		.attr("id", (d) => "explore-map-track-" + d.route.replace('.','-'))
		.style('stroke', (d) => motusMap.colourScale(typeof d[colourVar] == 'object' ? d[colourVar].filter( x => colourVarSelections.includes(x) )[0] : d[colourVar]))
		.style('pointer-events', 'auto')
		.style('stroke-width', Object.keys(motusData.selectedTracks).length < 100 ? '4px' : '2px')
		.attr("d", motusMap.path)
		.on('mouseover touchstart', (e,d) => motusMap.dataHover(e, d, 'in', 'track'))
		.on('mouseout touchend', (e,d) => motusMap.dataHover(e, d, 'out', 'track'))
		.on('click', (e,d) => motusMap.dataClick(e, d, 'track'));

/*
	tracks_legend.attr('viewBox', `0 0 ${50 + max_length} ${motusMap.colourScale.domain().length * h}`)
		.attr('width', 50 + max_length)
		.attr('height', motusMap.colourScale.domain().length * h);
*/

	addMapLegend();

	motusMap.map.on("zoomend", motusMap.reset);

	// Reposition the SVG to cover the features.
	motusMap.reset();
}

function addMapLegend() {

	motusMap.mapLegend = d3.create('div').attr("class", "explore-map-legend hidden")
																.attr("id", "explore_map_legend");
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
				.attr('class', d => `frequencies${motusFilter.frequencies.includes(d[0])?' selected':''}`)
				.on('click', motusMap.legendClick);

		freq_legend_els.append("div")
					.style('border', 'solid 1px #000')
					.style('background-color', d => motusMap.colourScales.frequency( d[0] ))
					.style('width', "15px")
					.style('height', "15px");

		freq_legend_els.append("div")
			.text( d => d[1] );


	} else {

			var colourBy = dataType == 'stations' ? 'recv1' : dataType == 'species' ? 'species' : "origin"

			var colourVar = motusMap.colourVar == 'projects' ? "project" : "colourVal";
		//	var colourVar = "project";

			var colourVarSelections = colourVar == 'project' ? motusData.selectedAnimalProjects.map( x => x.id ) : motusFilter.selections;


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
					.html(colourVar == 'colourVal' && dataType == 'stations' ? 'Coloured by station nearest to tagging location.<br> Visiting tags were deployed more than 10 KM away from any selected station.' : 'Coloured by tagging ' + motusMap.colourVar)

			var tracks_legend = motusMap.mapLegendContent.append("div")
				.attr('class','map-legend-section map-legend-tracks');

			var max_length = 0;
			motusMap.colourScale.domain().forEach(function(x, i) {

				var selectionColour = motusMap.colourScale.range()[i];
				var selectionName;

				if ( ['remote', 'other', 'visiting'].includes( x ) ) {
					selectionName = firstToUpper( x );
				} else if (motusMap.colourVar == dataType) {
					selectionName = motusData.selectionNames[ x ];
				} else if (motusMap.colourVar == 'projects') {
					try {
						selectionName = motusData.selectedAnimalProjects.filter( proj => proj.id == x )[0].name;
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

					div.attr("class","map-legend-track-" + x + " selected")
						.style('pointer-events', 'auto')
						.on('click', motusMap.legendClick);

				}

			});

	}

}












var ANIMATION_LENGTH = 10; // Seconds
var ANIMATION_SPEED = 50*24*60*60;
var LOOP_LENGTH = 1;
var INTERVAL_LENGTH = 50; // milliseconds

var deckGlLayers = {};


function deckGL_map() {

	// Set the colour scale
	motusMap.colourScale = d3.scaleOrdinal().domain(["166.38", "151.5", "150.1", "434", "dual", "none"]).range(["#1b9e77","#d95f02","#7570b3","#e7298a","#E5C494","#999999"]);

	motusData.stationDeps2 = motusData.stationDeps.map(x =>
		{
			let station = motusData.stations.filter( d => d.stationDeps.includes(x.id) );
			return {
				...x,
				...{
					dtStart: +x.dtStart/1000,
					dtEnd: +x.dtEnd/1000,
					animals: x.animals.split(";"),
					nAnimals: x.animals.split(";").length,
					species: x.species.split(";"),
					nSpecies: x.species.split(";").length,
					stationID: station.length > 0 ? station[0].id : x.id,
					frequency: x.frequency.split(",")
				}
			};
		}
	);

	var [minTime,maxTime] = timeline.position;

	deckGlLayers.stations = new deck.GeoJsonLayer({
		id: 'deckGL_stations',
		data: {type:"FeatureCollection",features:motusData.stationDeps2},
		filled: true,
		getPointRadius: 15000,
		getLineWidth: 1,
		lineWidthUnits: 'pixels',
		pointRadiusMinPixels: 3,
		pointRadiusMaxPixels: 25,
		getFillColor: d => hexToRgb(motusMap.colourScale( d.frequency.length > 1 ? "dual" : d.frequency[0] )),
  	getFilterValue: d => {
			return [
				+d.dtStart <= timeline.position[1] &&
				+d.dtEnd >= timeline.position[0] &&
				+(motusFilter.species[0] == 'all' || motusFilter.species.some( x => d.species.includes(x) )) &&
				+(motusFilter.stations[0] == 'all' || motusFilter.stations.includes(d.stationID)) &&
				+(motusFilter.regions[0] == 'all' || motusFilter.regions.includes(d[regionType])) &&
				+(motusFilter.frequencies[0] == 'all' || motusFilter.frequencies.some( x => d.frequency.includes( x ) )) &&
				+(motusFilter.projects[0] == 'all' || motusFilter.projects.includes(d.projID))
			]},
		filterRange: [1,1],
		extensions: [new deck.DataFilterExtension({filterSize: 1})],
		pickable: true,
		onClick: ({object}, e) => motusMap.dataClick(e.srcEvent, object, 'station'),
		onHover: ({object, picked}, e) => motusMap.dataHover(e.srcEvent, object, picked?'in':'out', 'station'),
		opacity: dataType == "stations" ? 0.7 : 0.3,
		autoHighlight: true,
		highlightColor: [255,0,0],
    updateTriggers: {
      // This tells deck.gl to recalculate radius when `currentYear` changes
      getFilterValue: [timeline.position, motusFilter.frequencies, motusFilter.species, motusFilter.projects, motusFilter.stations, motusFilter.regions]
    }
	});

	deckGlLayers.tracks =	new deck.GeoJsonLayer({
		id: 'deckGL_tracks',
		data: motusData.tracksLongByAnimal,
		dataTransform: d => {
			return {
				type: "FeatureCollection",
				features: d.map( x => {
					return {
						...x,
						...{
							type: "Feature",
							geometry: {
								type: "LineString",
								coordinates: x.tracks
							}
						}
					}
				})
			}
		},
		// Styles
		getLineColor: d => hexToRgb(motusMap.colourScale( d.frequency )),
		getFilterValue: d => {
			return [
				+d3.max(d.ts) >= timeline.position[0] &&
				+d3.min(d.ts) <= timeline.position[1] &&
				+(motusFilter.species[0] == 'all' || motusFilter.species.includes(d.species)) &&
				+(motusFilter.stations[0] == 'all' || motusFilter.stations.some( x => d.stations.includes(x) )) &&
		//		+(motusFilter.regions[0] == 'all' || motusFilter.regions.includes(d.region1) || motusFilter.regions.includes(d.region2)) &&
				+(motusFilter.frequencies[0] == 'all' || motusFilter.frequencies.includes(d.frequency)) &&
				+(motusFilter.projects[0] == 'all' || motusFilter.projects.includes(d.project))
			]},
		filterRange: [1,1],
		extensions: [new deck.DataFilterExtension({filterSize: 1})],
		pickable: true,
		opacity: 1,
		autoHighlight:true,
		onClick: ({object}, e) => motusMap.dataClick(e.srcEvent, object, 'path'),
		onHover: ({object, picked}, e) => motusMap.dataHover(e.srcEvent, object, picked?'in':'out', 'path'),
		getLineWidth: 1000,
		highlightColor: [255,0,0],
		lineWidthMinPixels: 1,
		lineWidthMaxPixels: 10,
		updateTriggers: {
			// This tells deck.gl to recalculate radius when `currentYear` changes
			getFilterValue: [timeline.position, motusFilter.frequencies, motusFilter.species, motusFilter.projects, motusFilter.stations, motusFilter.regions]
		}
	});

	motusMap.deckLayer = new DeckGlLeaflet.LeafletLayer({
	  views: [
	    new deck.MapView({
	      repeat: false
	    })
	  ],
	  layers: dataType == "animals" ? [
	    deckGlLayers.stations
			,deckGlLayers.tracks
	  ] : [
			deckGlLayers.stations
		],
		getCursor: ({isHovering}) => isHovering ? "pointer" : "grab"
	});
	motusMap.map.addLayer(motusMap.deckLayer);
	$(".leaflet-overlay-pane .leaflet-zoom-animated").css('pointer-events', 'auto');




}

function animateTracks(duration) {
	var time;
	if (!motusMap.animation.pause) {
		if (typeof duration === 'undefined') {
			motusMap.animation.duration = ANIMATION_LENGTH;
		} else {
			motusMap.animation.duration = duration;
		}
		timeline.duration = motusMap.animation.duration;
		motusMap.animation.isAnimating = true;

		var [minTime,maxTime] = timeline.position;
	  time = minTime;

		ANIMATION_SPEED = (maxTime - minTime) / (motusMap.animation.duration / INTERVAL_LENGTH);

		console.log("Running animation from %s to %s for 10 seconds at a speed of %s", minTime, maxTime, ANIMATION_SPEED);

		timeline.position_OLD = timeline.position;
		animateTrackStep(time, true);
		motusMap.animation.timer = setInterval(() => {
				animateTrackStep(time);
		  }, INTERVAL_LENGTH);

	} else {

		time = motusMap.animation.time;
		motusMap.animation.pause = false;

		motusMap.animation.isAnimating = true;
		motusMap.animation.timer = setInterval(() => {
				animateTrackStep(time);
		  }, INTERVAL_LENGTH);

	}

  window.requestAnimationFrame(animate);

  function animate() {
		console.log("Current time is: %s/%s", time, maxTime);
    time = Math.round(time + ANIMATION_SPEED);
		if (time < maxTime && !motusMap.animation.stop)
    	window.requestAnimationFrame(animate);
		else
			stopDeckAnimation();
  }

}

function stopDeckAnimation() {
	clearInterval(motusMap.animation.timer);
	timeline.position = timeline.position_OLD;
	timeline.setSlider(timeline.position, false, false);
	motusMap.animation.isAnimating = false;
	deckGL_renderMap();
}

// The resolution is 1 day
function animateTrackStep(currentTime, start) {


	if (start) {

		console.log("Start");
		motusMap.animation.startTime = moment();

		motusMap.animation.dtStart = motusFilter.dtStart;
		motusMap.animation.dtEnd = motusFilter.dtEnd;

		motusMap.animation.pause = false;
		motusMap.animation.stop = false;

	} else if (motusMap.animation.pause) {

			motusMap.animation.time = currentTime;
			motusMap.animation.isAnimating = false;
			clearInterval(motusMap.animation.timer);

	}

	timeline.position = [currentTime, currentTime];
	motusMap.deckLayer.setProps({
		layers: [
			deckGlLayers.stations = new deck.GeoJsonLayer({
				id: 'deckGL_stations',
				data: {type:"FeatureCollection",features:motusData.stationDeps2},
				// Styles
				filled: true,
				getPointRadius: 15000,
				pointRadiusMinPixels: 3,
				getLineWidth: 1,
				lineWidthUnits: 'pixels',
				getFillColor: d => [hexToRgb(motusMap.colourScale( d.frequency )), 100].flat(),
				getFilterValue: d => {
					return [
						+d.dtStart <= timeline.position[1] &&
						+d.dtEnd >= timeline.position[0] &&
						+(motusFilter.species[0] == 'all' || motusFilter.species.some( x => d.species.includes(x) )) &&
						+(motusFilter.stations[0] == 'all' || motusFilter.stations.includes(d.stationID)) &&
						+(motusFilter.regions[0] == 'all' || motusFilter.regions.includes(d[regionType])) &&
						+(motusFilter.frequencies[0] == 'all' || motusFilter.frequencies.includes(d.frequency)) &&
						+(motusFilter.projects[0] == 'all' || motusFilter.projects.includes(d.projID))
					]},
				filterRange: [1,1],
				extensions: [new deck.DataFilterExtension({filterSize: 1})],
				pickable: true,
				onClick: ({object}, e) => dataClick(e, object, 'station'),
				autoHighlight: true,
				updateTriggers: {
					// This tells deck.gl to recalculate radius when `currentYear` changes
					getFilterValue: [timeline.position, motusFilter.frequencies, motusFilter.species, motusFilter.projects, motusFilter.stations, motusFilter.regions]
				}
			}),
			new deck.TripsLayer({
				id: 'deckGL_tracks_anim',
				data: motusData.tracksLongByAnimal,
				// Styles
				getFilterValue: d => {
					return [
						+(motusFilter.species[0] == 'all' || motusFilter.species.includes(d.species)) &&
						+(motusFilter.stations[0] == 'all' || motusFilter.stations.some( x => d.stations.includes(x) )) &&
				//		+(motusFilter.regions[0] == 'all' || motusFilter.regions.includes(d.region1) || motusFilter.regions.includes(d.region2)) &&
						+(motusFilter.frequencies[0] == 'all' || motusFilter.frequencies.includes(d.frequency)) &&
						+(motusFilter.projects[0] == 'all' || motusFilter.projects.includes(d.project))
					]},
				filterRange: [1,1],
				extensions: [new deck.DataFilterExtension({filterSize: 1})],
				getPath: d => d.tracks,
				getTimestamps: d => d.ts,
				getColor: d => hexToRgb(motusMap.colourScale( d.frequency )),
				pickable: true,
				onClick: info => console.log(info),
				autoHighlight:true,
				highlightColor: [255,0,0],
				widthMinPixels: 2,
				opacity: 1,
				rounded: true,
				trailLength: ANIMATION_SPEED * (500/INTERVAL_LENGTH),
				currentTime: currentTime,
			})
		]
	});

	timeline.setSlider([currentTime, currentTime], false, false);


}

// DataFilterExtension is built for continuous variables
// To filter categorical variables, turn them into booleans and select only true values
// See: https://github.com/visgl/deck.gl/issues/4943#issuecomment-694129024

function deckGL_renderMap() {

	deckGlLayers.stations =	new deck.GeoJsonLayer({
				id: 'deckGL_stations',
				data: {type:"FeatureCollection",features:motusData.stationDeps2},
				// Styles
				filled: true,
				getPointRadius: 15000,
				getLineWidth: 1,
				lineWidthUnits: 'pixels',
				pointRadiusMinPixels: 3,
				pointRadiusMaxPixels: 25,
				getFillColor: d => hexToRgb(motusMap.colourScale( d.frequency.length > 1 ? "dual" : d.frequency[0] )),
				getFilterValue: d => {
					return [
						+d.dtStart <= timeline.position[1] &&
						+d.dtEnd >= timeline.position[0] &&
						+(motusFilter.species[0] == 'all' || motusFilter.species.some( x => d.species.includes(x) )) &&
						+(motusFilter.stations[0] == 'all' || motusFilter.stations.includes(d.stationID)) &&
						+(motusFilter.regions[0] == 'all' || motusFilter.regions.includes(d[regionType])) &&
						+(motusFilter.frequencies[0] == 'all' || motusFilter.frequencies.some( x => d.frequency.includes( x ) )) &&
						+(motusFilter.projects[0] == 'all' || motusFilter.projects.includes(d.projID))
					]},
				filterRange: [1,1],
				extensions: [new deck.DataFilterExtension({filterSize: 1})],
				pickable: true,
				opacity: dataType == "stations" ? 0.7 : 0.3,
				onClick: ({object}, e) => motusMap.dataClick(e.srcEvent, object, 'station'),
				onHover: ({object, picked}, e) => motusMap.dataHover(e.srcEvent, object, picked?'in':'out', 'station'),
				autoHighlight: true,
				updateTriggers: {
					// This tells deck.gl to recalculate radius when `currentYear` changes
					getFilterValue: [timeline.position, motusFilter.frequencies, motusFilter.species, motusFilter.projects, motusFilter.stations, motusFilter.regions]
				}
			});
	deckGlLayers.tracks =	new deck.GeoJsonLayer({
				id: 'deckGL_tracks',
				data: motusData.tracksLongByAnimal,
				dataTransform: d => {
					return {
						type: "FeatureCollection",
						features: d.map( x => {
							return {
								...x,
								...{
									type: "Feature",
									geometry: {
										type: "LineString",
										coordinates: x.tracks
									}
								}
							}
						})
					}
				},
				// Styles
				getLineColor: d => hexToRgb(motusMap.colourScale( d.frequency )),
				getFilterValue: d => {
					return [
						+d3.max(d.ts) >= timeline.position[0] &&
						+d3.min(d.ts) <= timeline.position[1] &&
						+(motusFilter.species[0] == 'all' || motusFilter.species.includes(d.species)) &&
						+(motusFilter.stations[0] == 'all' || motusFilter.stations.some( x => d.stations.includes(x) )) &&
				//		+(motusFilter.regions[0] == 'all' || motusFilter.regions.includes(d.region1) || motusFilter.regions.includes(d.region2)) &&
						+(motusFilter.frequencies[0] == 'all' || motusFilter.frequencies.includes(d.frequency)) &&
						+(motusFilter.projects[0] == 'all' || motusFilter.projects.includes(d.project))
					]},
				filterRange: [1,1],
				extensions: [new deck.DataFilterExtension({filterSize: 1})],
				pickable: true,
				opacity: 1,
				onClick: ({object}, e) => motusMap.dataClick(e.srcEvent, object, 'path'),
				onHover: ({object, picked}, e) => motusMap.dataHover(e.srcEvent, object, picked?'in':'out', 'path'),
				autoHighlight:true,
				getLineWidth: 1000,
				highlightColor: [255,0,0],
				lineWidthMinPixels: 1,
				lineWidthMaxPixels: 10,
				updateTriggers: {
					// This tells deck.gl to recalculate radius when `currentYear` changes
					getFilterValue: [timeline.position, motusFilter.frequencies, motusFilter.species, motusFilter.projects, motusFilter.stations, motusFilter.regions]
				}
			});

	var regionType = 'continent';
    motusMap.deckLayer.setProps({
		  layers: dataType == "animals" ? [
		    deckGlLayers.stations
				,deckGlLayers.tracks
		  ] : [
				deckGlLayers.stations
			],
    });

}



/*

new deck.LineLayer({
	id: 'deckGL_tracks',
	data: motusData.tracksLong,
	// Styles
	getSourcePosition: d => [+d.lon1, +d.lat1], // London
	getTargetPosition: d => [+d.lon2, +d.lat2],
	getColor: d => hexToRgb(motusMap.colourScale( d.frequency )),
	getFilterValue: d => {
		return [
			+d.ts2 >= timeline.position[0] &&
			+d.ts1 <= timeline.position[1] &&
			+(motusFilter.species[0] == 'all' || motusFilter.species.includes(d.species)) &&
			+(motusFilter.stations[0] == 'all' || motusFilter.stations.includes(d.station1) || motusFilter.stations.includes(d.station2)) &&
	//		+(motusFilter.regions[0] == 'all' || motusFilter.regions.includes(d.region1) || motusFilter.regions.includes(d.region2)) &&
			+(motusFilter.frequencies[0] == 'all' || motusFilter.frequencies.includes(d.frequency)) &&
			+(motusFilter.projects[0] == 'all' || motusFilter.projects.includes(d.project))
		]},
	filterRange: [1,1],
	extensions: [new deck.DataFilterExtension({filterSize: 1})],
	pickable: true,
	opacity: 0.1,
	autoHighlight:true,
	highlightColor: [255,0,0],
	widthMinPixels: 1,
	widthMaxPixels: 10,
	widthScale: 0.1,
	greatCircle: true,
	updateTriggers: {
		// This tells deck.gl to recalculate radius when `currentYear` changes
		getFilterValue: [timeline.position, motusFilter.frequencies, motusFilter.species, motusFilter.projects, motusFilter.stations, motusFilter.regions]
	}
})

*/


/*


deckGlLayers.tracks =	new deck.GeoJsonLayer({
	id: 'deckGL_tracks',
	data: motusData.tracksLongByAnimal,
	dataTransform: d => {
		return {
			type: "FeatureCollection",
			features: d.map( x => {
				return {
					...x,
					...{
						type: "Feature",
						geometry: {
							type: "LineString",
							coordinates: x.tracks
						}
					}
				}
			})
		}
	},
	// Styles
	getLineColor: [0, 0, 0],
	pickable: true,
	opacity: 1,
	autoHighlight:true,
	getLineWidth: 1000,
	highlightColor: [255,0,0],
	lineWidthMinPixels: 1,
	lineWidthMaxPixels: 10
});

*/

/*


deckGlLayers.tracks =	new deck.PathLayer({
	id: 'deckGL_tracks',
	data: motusData.tracksLongByAnimals,
	// Styles
	getPath: d => d.tracks,
	getColor: [0, 0, 0],
	pickable: true,
	opacity: 1,
	autoHighlight:true,
	getWidth: 1000,
	highlightColor: [255,0,0],
	widthMinPixels: 1,
	widthMaxPixels: 10
});

*/