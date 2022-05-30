/*

DeckGL Layers

*/





function getProfileMapLayers(load, layer) {

		var yesterday = +(new Date().addDays( -30 ))/1000;

		if (typeof layer === "object" && layer.length > 0) {
			var layers = layer;
			layer = layers.shift();
		}

		//	STATIONS
		if (load) {
			motusData.stationDeps2 = motusData.stationDeps
				.sort((a, b) => d3.ascending(a.id, b.id))
				.map(x => {
					let station = motusData.stations.filter( d => d.stationDeps.includes(x.id) );
					let animals = x.animals.filter( d => d != "NA" );
					return {
						...x,
						...{
							dtStart: +x.dtStart/1000,
							dtEnd: +x.dtEnd/1000,
							animals: animals,
							nAnimals: animals.length,
							species: x.species,
							nSpecies: x.species.length,
							stationStatus: station.length > 0 ? station[0].status : x.status,
							stationID: station.length > 0 ? station[0].id : x.id,
							frequency: x.frequency.split(",")
						}
					};
				});
      motusData.selectedStationDeps2 = motusData.stationDeps2.filter( d => motusFilter.selectedStationDeps.includes( d.id ) );
		}
		if (!layer || layer == 'stations') {
			// Other stations
      deckGlLayers.stations = getOtherStationsLayer();
      deckGlLayers.selectedStations = getSelectedStationsLayer();
		}

		if (!layer || layer == 'animals') {

				// Selected animals should appear ABOVE the tracks
				// Selected animals
				deckGlLayers.selectedAnimals = new deck.GeoJsonLayer({
					id: 'deckGL_selectedAnimals',
					data: {type: "FeatureCollection",features: motusData.animals},//.filter( d => motusFilter.selectedStationDeps.includes( d.id ) ) }
					pointType: 'icon',
					iconAtlas: imagePrefix + "animal_icon_atlas.png",
					iconMapping: ANIMAL_ICON_MAPPING,
					getIconSize: d => 1000,
					getIcon: d => "selectedAnimal",
					iconSizeScale: 1,
					iconSizeUnits: "meters",
					iconSizeMinPixels: 25,
					iconSizeMaxPixels: 75,
					getFillColor: d => "#000000",
					getFilterValue: d => {
						return [
							+(
								(
									motusFilter.selectedAnimals.includes( d.id ) &&
									!motusMap.trackView &&
									(+d.dtStart/1000) <= timeline.position[1] &&
									(+d.dtEnd/1000) >= timeline.position[0] &&
									(motusFilter.species[0] == 'all' || motusFilter.species.includes( d.species )) &&
									(dataType == 'regions' || motusFilter.regions[0] == 'all' || motusFilter.regions.includes(d[motusFilter.regionType])) &&
									(motusFilter.frequencies[0] == 'all' || motusFilter.frequencies.some( x => d.frequency.includes( x ) )) &&
									(motusFilter.projects[0] == 'all' || motusFilter.projects.includes(d.project))
								) ||
								( motusMap.trackView &&	motusFilter.animals.includes( d.id ) )
							)
						]},
					filterRange: [1,1],
					extensions: [new deck.DataFilterExtension({filterSize: 1})],
					pickable: true,
					onClick: ({object}, e) => motusMap.dataClick(e.srcEvent, object, 'animal'),
					onHover: ({object, picked}, e) => motusMap.dataHover(e.srcEvent, object, picked?'in':'out', 'animal'),
					opacity: 1,
					autoHighlight: true,
					highlightColor: [255,0,0],
					updateTriggers: {
						// This tells deck.gl to recalculate radius when `currentYear` changes
						getFilterValue: [motusMap.trackView, timeline.position, motusFilter.frequencies, motusFilter.species, motusFilter.projects, motusMap.selections]
					}
				});
		}

		if (!layer || layer == 'tracks') {

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
				getLineColor: d => {
					return hexToRgb(
						(!motusMap.trackView) ?
							motusMap.colourScale(
									typeof d[motusMap.colourVar] == 'object' ?
									d[motusMap.colourVar].filter( x => motusMap.colourVarSelections.includes(x) )[0] :
									d[motusMap.colourVar]
							) : "#FF0000"
					);
				},
				getFilterValue: d => {
					return [
						+(d3.max(d.ts) >= timeline.position[0]) &&
						+(d3.min(d.ts) <= timeline.position[1]) &&
						+(motusFilter.species[0] == 'all' || motusFilter.species.includes(d.species)) &&
						+(motusFilter.animals[0] == 'all' || motusFilter.animals.includes(d.id)) &&
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
				onClick: ({object}, e) => motusMap.dataClick(e.srcEvent, object, 'track'),
				onHover: ({object, picked}, e) => motusMap.dataHover(e.srcEvent, object, picked?'in':'out', 'track'),
				getLineWidth: Object.keys(motusData.tracksLongByAnimal.map(x => x.tracks).flat()).length < 100 ? 3000 : 2000,
				highlightColor: [255,0,0],
				lineWidthMinPixels: 2,
				lineWidthMaxPixels: 10,
				updateTriggers: {
					// This tells deck.gl to recalculate radius when `currentYear` changes
					getLineColor: motusMap.trackView,
					getFilterValue: [timeline.position, motusFilter.frequencies, motusFilter.animals, motusFilter.species, motusFilter.projects, motusFilter.stations, motusFilter.regions]
				}
			});

		}

		if (typeof layers === "object" && layers.length > 0) {
			getProfileMapLayers(false, layers);
		}

}
// Placeholder
function getReportMapLayers(load, layer) {
	if (dataType == 'animals') {
		getProfileMapLayers(load, layer);
	}	else {
		getExploreMapLayers(load, layer);
	}
}

function getExploreMapLayers(load, layer) {
		//	STATIONS
		if (load) {
			motusData.stationDeps2 = motusData.stationDeps
				.sort((a, b) => d3.ascending(a.id, b.id))
				.map(x => {
					let station = motusData.stations.filter( d => d.stationDeps.includes(x.id) );
					return {
						...x,
						...{
							dtStart: +x.dtStart/1000,
							dtEnd: +x.dtEnd/1000,
							animals: x.animals,
							nAnimals: x.animals.length,
							species: x.species,
							nSpecies: x.species.length,
							stationID: station.length > 0 ? station[0].id : x.id,
							frequency: x.frequency.split(",")
						}
					};
				});
		}
		if (!layer || layer == 'stations') {

			deckGlLayers.stations = new deck.GeoJsonLayer({
			id: 'deckGL_stations',
			data: {type:"FeatureCollection",features:motusData.stationDeps2},

			pointType: 'icon',
			iconAtlas: imagePrefix + "station_icon_atlas4.png",
			iconMapping: STATION_ICON_MAPPING,
			getIconSize: d => 20000,
  			getIcon: d =>  Object.keys(motusMap.selections).includes(d.stationID) ? "selectedInactiveStation" :
                      (
	                      ( d.frequency.length > 1 ? "dual_" : ( d.frequency[0] == "434.00" ? "CTT_Global" : "Lotek_" )  ) +
												(
													d.frequency.includes("166.38") ? "Americas" :
													d.frequency.includes("150.10") ? "Europe_Africa" :
													d.frequency.includes("151.50") ? "Australia_Asia" : ""
												)
											),
			iconSizeScale: 1,
			iconSizeUnits: "meters",
			iconSizeMinPixels: 12,
			iconSizeMaxPixels: 64,
			/*
			getPointRadius: 15000,
			getLineWidth: 1,
			lineWidthUnits: 'pixels',
			pointRadiusMinPixels: 3,
			pointRadiusMaxPixels: 25,*/
	  	getFilterValue: d => {
				return [
					+d.dtStart <= timeline.position[1] &&
					+(d.dtEnd >= timeline.position[0] || d.dtEnd === 0) &&
					+(motusFilter.species[0] == 'all' || motusFilter.species.some( x => d.species.includes(x) )) &&
					+(motusFilter.stations[0] == 'all' || motusFilter.stations.includes(d.stationID)) &&
					+(motusFilter.regions[0] == 'all' || motusFilter.regions.includes(d[motusFilter.regionType])) &&
					+(motusFilter.frequencies[0] == 'all' || motusFilter.frequencies.some( x => d.frequency.includes( x ) )) &&
					+(motusFilter.projects[0] == 'all' || motusFilter.projects.includes(d.project))
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

		}

		if (!layer || layer == 'tracks' || layer == 'animals') {
		//	TRACKS
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
					+(d3.max(d.ts) >= timeline.position[0]) &&
					+(d3.min(d.ts) <= timeline.position[1]) &&
					+(motusFilter.species[0] == 'all' || motusFilter.species.includes(d.species)) &&
					+(motusFilter.animals[0] == 'all' || motusFilter.animals.includes(d.id)) &&
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
			onClick: ({object}, e) => motusMap.dataClick(e.srcEvent, object, 'track'),
			onHover: ({object, picked}, e) => motusMap.dataHover(e.srcEvent, object, picked?'in':'out', 'track'),
			getLineWidth: 1000,
			highlightColor: [255,0,0],
			lineWidthMinPixels: 2,
			lineWidthMaxPixels: 10,
			updateTriggers: {
				// This tells deck.gl to recalculate radius when `currentYear` changes
				getFilterValue: [timeline.position, motusFilter.frequencies, motusFilter.animals, motusFilter.species, motusFilter.projects, motusFilter.stations, motusFilter.regions]
			}
		});

		}

		if (!layer || layer == 'regions') {

			deckGlLayers.regions = new deck.GeoJsonLayer({
				id: 'deckGL_regions',
				data: {type:"FeatureCollection",features:motusData.polygons},
				filled: true,
				getLineWidth: 1,
				lineWidthUnits: 'pixels',
				getFillColor: d => hexToRgb(motusMap.colourScale( regionFreqs[d.properties.region_un] && motusData.regions.filter( x => x.id == d.id).length > 0 && motusData.regions.filter( x => x.id == d.id)[0].both > 0?regionFreqs[d.properties.region_un].replace("0 MHz", ""):"none" )),
			/*	getFilterValue: d => {
					return [
						+d.dtStart <= +motusFilter.dtEnd/1000 &&
						+d.dtEnd >= +motusFilter.dtStart/1000 &&
						+(motusFilter.species[0] == 'all' || motusFilter.species.some( x => d.species.includes(x) )) &&
						+(motusFilter.stations[0] == 'all' || motusFilter.stations.includes(d.stationID)) &&
						+(motusFilter.regions[0] == 'all' || motusFilter.regions.includes(d[motusFilter.regionType])) &&
						+(motusFilter.frequencies[0] == 'all' || motusFilter.frequencies.some( x => d.frequency.includes( x ) )) &&
						+(motusFilter.projects[0] == 'all' || motusFilter.projects.includes(d.project))
					]},
				filterRange: [1,1],
				extensions: [new deck.DataFilterExtension({filterSize: 1})],*/
				pickable: true,
				onClick: ({object}, e) => motusMap.dataClick(e.srcEvent, object, 'region'),
				onHover: ({object, picked}, e) => motusMap.dataHover(e.srcEvent, object, picked?'in':'out', 'region'),
				opacity: dataType == "regions" ? 0.7 : 0.3,
				autoHighlight: true,
				highlightColor: [255,0,0]
			 /* updateTriggers: {
			    // This tells deck.gl to recalculate radius when `currentYear` changes
			    getFilterValue: [timeline.position, motusFilter.frequencies, motusFilter.species, motusFilter.projects, motusFilter.stations, motusFilter.regions]
			  }*/
			});

		}

    if ( layer == "antennaRanges" ) {
  		deckGlLayers.antennaRanges = new deck.GeoJsonLayer({
  			id: 'deckGL_antennaRanges',
  			data: {type:"FeatureCollection",features: motusData.antennas.features},
  			filled: true,
  			getLineWidth: 1,
  			lineWidthUnits: 'pixels',
  			getFillColor: d => hexToRgb( motusMap.antennaColourScale( d.properties.type ) ),
  			getFilterValue: d => {
  				return [
  					+d.properties.dtStart <= +motusFilter.dtEnd &&
  					+d.properties.dtEnd >= +motusFilter.dtStart &&
  					+(motusFilter.species[0] == 'all' || motusFilter.species.some( x => d.properties.species.includes(x) )) &&
  					+(motusFilter.stations[0] == 'all' || motusFilter.stations.includes(d.properties.stationID)) &&
  					+(motusFilter.regions[0] == 'all' || motusFilter.regions.includes(d.properties[motusFilter.regionType])) &&
  					+(motusFilter.frequencies[0] == 'all' || motusFilter.frequencies.some( x => d.properties.frequency.includes( x ) )) &&
  					+(motusFilter.projects[0] == 'all' || motusFilter.projects.includes(d.properties.project))
  				]},
  			filterRange: [1,1],
  			extensions: [new deck.DataFilterExtension({filterSize: 1})],
  			pickable: true,
  			onClick: ({object}, e) => motusMap.dataClick(e.srcEvent, object, 'antenna'),
  			onHover: ({object, picked}, e) => motusMap.dataHover(e.srcEvent, object, picked?'in':'out', 'antenna'),
  			opacity: dataType == "antennas" ? 0.7 : 0.3,
  			autoHighlight: true,
  			highlightColor: [255,0,0],
  		  updateTriggers: {
  		    // This tells deck.gl to recalculate radius when `currentYear` changes
  		    getFilterValue: [timeline.position, motusFilter.frequencies, motusFilter.species, motusFilter.projects, motusFilter.stations, motusFilter.regions]
  		  }
  		});
    }

    if ( layer == "coordinationRegions" ) {
  		deckGlLayers.coordinationRegions = new deck.GeoJsonLayer({
  			id: 'deckGL_coordinationRegions',
  			data: {type:"FeatureCollection",features: motusData.coordinationRegions.features},
  			filled: true,
  			getLineWidth: 1,
  			lineWidthUnits: 'pixels',
  			getFillColor: d => hexToRgb( motusMap.regionalColourScale( d.id ) ),
  			pickable: true,
  			onClick: ({object}, e) => motusMap.dataClick(e.srcEvent, object, 'coordination-region'),
  			onHover: ({object, picked}, e) => motusMap.dataHover(e.srcEvent, object, picked?'in':'out', 'coordination-region'),
  			opacity: 0.7,
  			autoHighlight: true,
  			highlightColor: [255,0,0]
  		});
    }

    if ( layer == "prospectiveStations" ) {
  		deckGlLayers.prospectiveStations = new deck.GeoJsonLayer({
  			id: 'deckGL_prospectiveStations',
  			data: {type:"FeatureCollection",features: motusData.prospectiveStations.features},
  			filled: true,
  			getLineWidth: d => d.geometry.type == 'Point' ? 10 : 1,
  			lineWidthUnits: 'pixels',
//  			getFillColor: d => hexToRgb( motusMap.regionalColourScale	( d.id ) ),
  			pickable: true,
  			onClick: ({object}, e) => motusMap.dataClick(e.srcEvent, object, 'prospective-station'),
  			onHover: ({object, picked}, e) => motusMap.dataHover(e.srcEvent, object, picked?'in':'out', 'prospective-station'),
  			autoHighlight: true,
  			highlightColor: [255,0,0]
  		});
    }
}

function getEditorMapLayers( layer ) {
	if (!layer) {
		if (typeof motusData.prospectiveStations !== 'undefined')
    	getExploreMapLayers(false, "prospectiveStations")
		if (typeof motusData.coordinationRegions !== 'undefined')
    	getExploreMapLayers(false, "coordinationRegions")
		if (typeof motusData.antennas !== 'undefined')
    	getExploreMapLayers(false, "antennaRanges")

  	getExploreMapLayers(false, "stations")
	}
}

var ANIMATION_LENGTH = 10; // Seconds
var ANIMATION_SPEED = 50*24*60*60;
var LOOP_LENGTH = 1;
var INTERVAL_LENGTH = 50; // milliseconds

var deckGlLayers = {};


function deckGL_map() {
//alert("A")
	motusFilter.regionType = "continent";
	//	TRACKS
	setMapColourScale();

	if (exploreType == 'main')
		getExploreMapLayers(true);
	else if (exploreType == 'report')
		getReportMapLayers(true);
	else
		getProfileMapLayers(true);


	motusMap.deckLayer = new DeckGlLeaflet.LeafletLayer({
	  views: [
	    new deck.MapView({
	      repeat: false
	    })
	  ],
	  layers: exploreType == 'main' || exploreType == 'report' ? (dataType == "animals" ? [
      deckGlLayers.stations,
			 deckGlLayers.tracks
	  ] : dataType == "stations" ? [
			deckGlLayers.stations
		] : dataType == "regions" ? [
			deckGlLayers.regions
		] : [
			deckGlLayers.stations
		]) : [
      deckGlLayers.selectedAnimals
			, deckGlLayers.selectedStations
			,deckGlLayers.stations
			,deckGlLayers.tracks
	  ],
		getCursor: ({isHovering}) => isHovering ? "pointer" : "grab"
	});
	motusMap.map.addLayer(motusMap.deckLayer);
	$(".leaflet-overlay-pane .leaflet-zoom-animated").css('pointer-events', 'auto');

	if ( exploreType != 'main' || !["projects", "species"].includes(dataType) ) {
		setTimeout(addMapLegend, 1);
	}

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
		//console.log("Current time is: %s/%s", time, maxTime);
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
	timeline.animating = false;
//	timeline.setSlider(timeline.position, false, false);
	motusMap.animation.isAnimating = false;
	timeline.highlightDate(false);
	deckGL_renderMap();
}

// The resolution is 1 day
function animateTrackStep(currentTime, start) {


	if (start) {

		timeline.animating = true;
		console.log("Start");
		motusMap.animation.startTime = moment();

		motusMap.animation.dtStart = motusFilter.dtStart;
		motusMap.animation.dtEnd = motusFilter.dtEnd;

		motusMap.animation.pause = false;
		motusMap.animation.stop = false;

	}

	if (motusMap.animation.pause) {

			motusMap.animation.time = currentTime;
			motusMap.animation.isAnimating = false;
			clearInterval(motusMap.animation.timer);

	} else {

		if (exploreType == 'main') {
			getExploreMapLayers(false, 'stations');
	} else if (exploreType == 'report') {
			getReportMapLayers(false, 'stations');
		} else {
			getProfileMapLayers(false, 'stations');
//			getProfileMapLayers(false, 'animals');
//			getProfileMapLayers(false, ['stations', 'animals']);
		}

		timeline.position = [currentTime, currentTime];

		deckGlLayers.tracksAnim = new deck.TripsLayer({
			id: 'deckGL_tracks_anim',
			data: motusData.tracksLongByAnimal,
			// Styles
			getFilterValue: d => {
				return [
					+(motusFilter.species[0] == 'all' || motusFilter.species.includes(d.species)) &&
					+(motusFilter.stations[0] == 'all' || motusFilter.stations.some( x => d.stations.includes(x) )) &&
					+(motusFilter.animals[0] == 'all' || motusFilter.animals.includes(d.id)) &&
			//		+(motusFilter.regions[0] == 'all' || motusFilter.regions.includes(d.region1) || motusFilter.regions.includes(d.region2)) &&
					+(motusFilter.frequencies[0] == 'all' || motusFilter.frequencies.includes(d.frequency)) &&
					+(motusFilter.projects[0] == 'all' || motusFilter.projects.includes(d.project))
				]},
			filterRange: [1,1],
			extensions: [new deck.DataFilterExtension({filterSize: 1})],
			getPath: d => d.tracks,
			getTimestamps: d => d.ts,
			getColor: d => hexToRgb(
				motusMap.colourScale(
					exploreType == "main" ?	d.frequency :
					(typeof d[motusMap.colourVar] == 'object' ? d[motusMap.colourVar].filter( x => motusMap.colourVarSelections.includes(x) )[0] : d[motusMap.colourVar])
				)
			),
			pickable: true,
			onClick: ({object}, e) => motusMap.dataClick(e.srcEvent, object, 'track'),
			onHover: ({object, picked}, e) => motusMap.dataHover(e.srcEvent, object, picked?'in':'out', 'track'),
			autoHighlight:true,
			highlightColor: [255,0,0],
			widthMinPixels: 2,
			opacity: 1,
			rounded: true,
			trailLength: ANIMATION_SPEED * (500/INTERVAL_LENGTH),
			currentTime: currentTime,
		})

		motusMap.deckLayer.setProps({
			layers:
				exploreType == 'main' || exploreType == 'report' ?(dataType == "animals" ? [
    	    deckGlLayers.stations,
    			 deckGlLayers.tracksAnim
    	  ] : dataType == "stations" ? [
    			deckGlLayers.stations
    		] : dataType == "regions" ? [
    			deckGlLayers.regions
    		] : [
    			deckGlLayers.stations
    		]) : [
			   deckGlLayers.selectedAnimals
    			, deckGlLayers.selectedStations
 				,deckGlLayers.stations
				,deckGlLayers.tracksAnim
			]
		});

		timeline.highlightDate( currentTime );

	}


}

// DataFilterExtension is built for continuous variables
// To filter categorical variables, turn them into booleans and select only true values
// See: https://github.com/visgl/deck.gl/issues/4943#issuecomment-694129024

function deckGL_renderMap(reloadData = true) {

	if ($("#explore_card_map,#explore_map").is(":visible")) {

		logMessage("Rendering map...");

		if (reloadData) {
			if (exploreType == 'main' && motusEditor.editMode)
				getEditorMapLayers(false);
			if (exploreType == 'main')
				getExploreMapLayers(false);
			else if (exploreType == 'report')
				getReportMapLayers(false);
			else
				getProfileMapLayers();
		}
	  motusMap.deckLayer.setProps({
		  layers: exploreType == 'main' || exploreType == 'report' ? (dataType == "animals" ? [
	      deckGlLayers.stations,
				 deckGlLayers.tracks
		  ] : dataType == "stations" ? (
				motusEditor.editMode ? getEditorDeckglLayers() : [
					deckGlLayers.stations
				]
			) : dataType == "regions" ? [
				deckGlLayers.regions
			] : [
				deckGlLayers.stations
			]) : [
				deckGlLayers.selectedAnimals
				, deckGlLayers.stations
				, deckGlLayers.selectedStations
				, deckGlLayers.tracks
		  ]
	  });

	}

}

function getStationsLayer() {

	var yesterday = +(new Date().addDays( -30 ))/1000;
  // Selected stations should appear ABOVE the tracks
  // Selected stations
  return new deck.GeoJsonLayer({
    id: 'deckGL_stations',
    data: {type: "FeatureCollection",features: motusData.stationDeps2},//.filter( d => !motusFilter.selectedStationDeps.includes( d.id ) ) }
    pointType: 'icon',
    iconAtlas: imagePrefix + "station_icon_atlas4.png",
    iconMapping: STATION_ICON_MAPPING,
    getIconSize: d => 20000,
    getIcon: d => "otherStation",
  //  getIcon: d => motusMap.trackView ? ( Object.keys(motusMap.selections).includes(d.station) ? "otherActiveStation" : "otherStation" ) : (+d.dtEnd > yesterday ? 'otherInactiveStation' : 'otherActiveStation'),
    iconSizeScale: 1,
    iconSizeUnits: "meters",
    iconSizeMinPixels: 32,
    iconSizeMaxPixels: 128,
    getFillColor: [50,50,50],
    getFilterValue: d => {
      return [
        +(
        //	!motusMap.trackView &&
          d.dtStart <= timeline.position[1] &&
					(d.dtEnd >= timeline.position[0] || d.dtEnd === 0) &&
          (motusFilter.species[0] == 'all' || motusFilter.species.some( x => d.species.includes(x) )) &&
          (motusFilter.stations[0] == 'all' || motusFilter.stations.includes(d.stationID) || dataType == 'stations') &&
          (dataType == 'regions' || motusFilter.regions[0] == 'all' || motusFilter.regions.includes(d[motusFilter.regionType])) &&
          (motusFilter.frequencies[0] == 'all' || motusFilter.frequencies.some( x => d.frequency.includes( x ) )) &&
          (motusFilter.projects[0] == 'all' || motusFilter.projects.includes(d.project))
        )
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
  //					getFillColor: [motusFilter.animals,  motusMap.trackView, motusMap.selections],
      getFilterValue: [timeline.position, motusFilter.frequencies, motusFilter.species, motusFilter.projects, motusFilter.stations, motusFilter.regions, motusMap.selections]
    }
  });

}
function getOtherStationsLayer() {

  // Selected stations should appear ABOVE the tracks
  // Selected stations
  return new deck.GeoJsonLayer({
    id: 'deckGL_otherStations',
    data: {type: "FeatureCollection",features: motusData.stationDeps2},//.filter( d => motusFilter.selectedStationDeps.includes( d.id ) ) },

    /*
    pointType: 'icon',
    iconAtlas: "images/station_icon_atlas4.png",
    iconMapping: STATION_ICON_MAPPING,
    getIconSize: d => 20000,
  //					getIcon: d => Object.keys(motusMap.selections).includes(d.station) ? "selectedStation" : (+d.dtEnd > yesterday ? 'selectedActiveStation' : 'selectedInactiveStation'),
    getIcon: d => motusMap.trackView ? ( Object.keys(motusMap.selections).includes(d.station) ? "selectedActiveStation" : "selectedInactiveStation" ) : (+d.dtEnd > yesterday ? 'selectedInactiveStation' : 'selectedActiveStation'),
    iconSizeScale: 1,
    iconSizeUnits: "meters",
    iconSizeMinPixels: 25,
    iconSizeMaxPixels: 125,
    getFillColor: d => "#000000",
    */
    pointType: 'circle',
    filled: true,
    getPointRadius: 15000,
    pointType: 'circle',
    getLineWidth: 1,
    lineWidthUnits: 'pixels',
    pointRadiusMinPixels: 3,
    pointRadiusMaxPixels: 15,
    getFillColor: d => d.stationStatus == 'inactive' ? [240, 189, 173] : d.stationStatus == 'pending' ? [239, 242, 145] : [187, 221, 187],
    getFilterValue: d => {
      return [
        +(
          (
            !motusMap.trackView &&
            d.dtStart <= timeline.position[1] &&
						(d.dtEnd >= timeline.position[0] || d.dtEnd === 0) &&
            (motusFilter.species[0] == 'all' || motusFilter.species.some( x => d.species.includes(x) )) &&
            (motusFilter.stations[0] == 'all' || motusFilter.stations.includes(d.stationID) || dataType == 'stations') &&
            (dataType == 'regions' || motusFilter.regions[0] == 'all' || motusFilter.regions.includes(d[motusFilter.regionType])) &&
            (motusFilter.frequencies[0] == 'all' || motusFilter.frequencies.some( x => d.frequency.includes( x ) )) &&
            (motusFilter.projects[0] == 'all' || motusFilter.projects.includes(d.project))
          ) ||
          ( motusMap.trackView &&	d.animals.includes(motusFilter.animals[0]) )
        )
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
      getFilterValue: [motusMap.trackView, timeline.position, motusFilter.frequencies, motusFilter.species, motusFilter.projects, motusFilter.stations, motusFilter.regions, motusMap.selections]
    }
  });
}
function getSelectedStationsLayer() {

  return new deck.GeoJsonLayer({
    id: 'deckGL_selectedStations',
    data: {type: "FeatureCollection",features: motusData.selectedStationDeps2},//
  /*
    pointType: 'icon',
    iconAtlas: "images/station_icon_atlas4.png",
    iconMapping: STATION_ICON_MAPPING,
    getIconSize: d => 20000,
  //					getIcon: d => Object.keys(motusMap.selections).includes(d.station) ? "selectedStation" : (+d.dtEnd > yesterday ? 'selectedActiveStation' : 'selectedInactiveStation'),
    getIcon: d => motusFilter.selectedStationDeps.includes( d.id ) ?
                    motusMap.trackView ?
                      ( Object.keys(motusMap.selections).includes(d.station) ?
                        "selectedActiveStation" : "selectedInactiveStation" ) : (+d.dtEnd > yesterday ?
                            'selectedInactiveStation' : 'selectedActiveStation') :
                    "otherStation",
    iconSizeScale: 1,
    iconSizeUnits: "meters",
    iconSizeMinPixels: 25,
    iconSizeMaxPixels: 125,
    */
    pointType: 'circle',
    filled: true,
    getPointRadius: 15000,
    pointType: 'circle',
    getLineWidth: 1,
    lineWidthUnits: 'pixels',
    pointRadiusMinPixels: 5,
    pointRadiusMaxPixels: 25,
  //  getFillColor: [0, 255, 0],
    getFillColor: d => d.stationStatus == 'inactive' ? [255, 170, 0] : d.stationStatus == 'pending' ? [255, 255, 0] : [0, 255, 0],
    getFilterValue: d => {
      return [
        +(
          (
          //  motusFilter.selectedStationDeps.includes( d.id ) &&
            d.dtStart <= timeline.position[1] &&
						(d.dtEnd >= timeline.position[0] || d.dtEnd === 0) &&
            (motusFilter.species[0] == 'all' || motusFilter.species.some( x => d.species.includes(x) )) &&
            (motusFilter.stations[0] == 'all' || motusFilter.stations.includes(d.stationID) || dataType == 'stations') &&
            (dataType == 'regions' || motusFilter.regions[0] == 'all' || motusFilter.regions.includes(d[motusFilter.regionType])) &&
            (motusFilter.frequencies[0] == 'all' || motusFilter.frequencies.some( x => d.frequency.includes( x ) )) &&
            (motusFilter.projects[0] == 'all' || motusFilter.projects.includes(d.project))
          ) ||
          ( motusMap.trackView &&	d.animals.includes(motusFilter.animals[0]) )
        )
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
      getFilterValue: [motusMap.trackView, timeline.position, motusFilter.frequencies, motusFilter.species, motusFilter.projects, motusFilter.stations, motusFilter.regions, motusMap.selections]
    }
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
