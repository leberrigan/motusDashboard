var editorStationRange;
var motusEditor = {
  editMode: false
};

function exploreMapEditor( show ) {
  if (show) {
    motusEditor.editMode = true;
    $("body").removeClass("dark");
    $(".explore-control-content.explore-control-edit").hide();
  } else {
    closeTrackViewer();
  }

  if (  $(".explore-map-editor-wrapper .add-station-range").children().length == 0) {

/*    $("body").append(`<div class="explore-map-editor-wrapper">`+
                        `<div id="explore_map_editor" class="explore-map-edit"><button class='close_btn'>Close</button></div>`+
                        `<div class='add-station-info'><span class='note'>Click on the map to place a prospective station.</span><div class='add-station-range'></div><button class='close_btn' >Cancel</button></div>`+
                      `</div>`);*/

    //$(`.explore-map-${dataType}-edit .explore-control-hidden`).prependTo("#explore_map_editor");
    $("#explore_map_editor .close_btn").click(exploreMapEditor);
    $(".explore-map-editor-wrapper .add-station-info .close_btn").click(exploreMapAddStation);
    $(".explore-map-editor-wrapper .add-station-range").slider({
      min: 0,
      max: 20,
      value: 15,
      slide: function(e, el){
        $(this).siblings('.add-station-range-value').val(el.value);
      },
      change: function(e, el){
        resizeStationRanges();
      },
      create: function(e, el) {
        $(e.target).after('<label for="explore_map_editor_station_range">Antenna range (km): </label>'+
                          '<input style="width:50px;" type="number" id="explore_map_editor_station_range" min="0" max="20" class="add-station-range-value" value="'+15+'">');
      }
    });

  }



}

function exploreMapAddStation(e) {

  $(".explore-map-editor-wrapper").toggle();
  if ($(".explore-map-editor-wrapper").hasClass("add-station-view")) {

    // Hide station antenna ranges
    if (!$("#explore_controls_plan_layer_select").val().includes("Antenna ranges")) {
//    	motusMap.g.selectAll('.explore-map-antenna-range').classed('hidden', true);
    }


    // Add the station to the map
    if (e.latlng) {
      var newStation = {geometry: {
                          type: 'Point',
                          coordinates: [e.latlng.lng, e.latlng.lat]
                        },
                        properties: {
                          status: 'new',
                          name: '',
                          "contact.name": '',
                          notes: ''
                        },
                        type: "Feature"
                      };
      if (typeof motusData.addedStations == 'undefined') {
        motusData.addedStations = [newStation];
      } else {
        motusData.addedStations.push(newStation);
      }
/*
      motusMap.addedStations = motusMap.g.selectAll('.explore-map-station-added')
  			.data(motusData.addedStations)
  			.enter().append("path")
  			.attr("d", motusMap.path.pointRadius(6))
        .attr('class', d => 'explore-map-station leaflet-zoom-hide explore-map-station-added disable-filter')
  			.style('stroke', '#000')
  			.style('fill', '#FF0')
  			.style('pointer-events', 'auto')
        .style('stroke-width', d => d.geometry.type == 'Point' ? '1px' : '10px')
        .on('mouseover', (e,d) => motusMap.dataHover(e, d, 'in', 'prospective-stations'))
        .on('mouseout', (e,d) => motusMap.dataHover(e, d, 'out', 'prospective-stations'))
        .on('click', (e,d) => motusMap.dataClick(e, d, 'prospective-stations'));
*/
      motusMap.dataClick(e.originalEvent, newStation, 'prospective-stations');

      $('.popup .edit_btn').last().click();

    }

    // Reset the editor view


    $(".explore-map-editor-wrapper").removeClass("add-station-view");
    $('#cursor_icon').remove();
    motusMap.map.off('click', exploreMapAddStation);
    motusMap.map.off('zoom', resizeStationRanges);


  } else {

    // Show the station antenna ranges
    if (!$("#explore_controls_plan_layer_select").val().includes("Antenna ranges")) {
      viewAntennaRanges();
    }

    // Change the editor view

    $(".explore-map-editor-wrapper").addClass("add-station-view");
    motusMap.map.on('click', exploreMapAddStation);
    motusMap.map.on('zoom', resizeStationRanges);

    editorStationRange = getPixelMetersByZoomLevel( $(".explore-map-editor-wrapper .add-station-range").slider("value") * 1000 );

    $('body').append(`<div id='cursor_icon'></div>`);

    resizeStationRanges();

  	$(`#${motusMap.el}`).mousemove(moveCursorIcon);

  }

  function moveCursorIcon(e) {
    $('#cursor_icon').css({top:e.pageY - (editorStationRange*2), left:e.pageX - (editorStationRange*2)});
  }


}
function editStationMeta(popup, save) {

  $(popup).toggleClass('edit-mode');

  if (save) {



  }

}

function resizeStationRanges(){

  editorStationRange = getPixelMetersByZoomLevel( $(".explore-map-editor-wrapper .add-station-range").slider("value") * 1000 );


  var svgSize = editorStationRange < 5 ? 5 : editorStationRange;

  if (svgSize < 10) {
    $(".explore-map-editor-wrapper .note").text("Zoom in to place a prospective station.");
  } else {
    $(".explore-map-editor-wrapper .note").text("Click on the map to place a prospective station.");
  }

  $('#cursor_icon').html(`<svg width='${svgSize*4}' height='${svgSize*4}' viewbox='0 0 ${svgSize*4} ${svgSize*4}'>`+
                            `<circle r='5' cx='${svgSize*2}' cy='${svgSize*2}' stroke='#000000' stroke-width='1px' fill='#FF0' />`+
                            `<circle r='${editorStationRange}' cx='${svgSize*2}' cy='${svgSize*2}' stroke='#000000' stroke-width='1px' fill='#999' fill-opacity='0.25' />`+
                         `</svg>`);

	$(`#${motusMap.el}`).trigger("mousemove");

}
function getPixelMetersByZoomLevel( meters, pixels ) {
  var metersPerPixel = 40075016.686 * Math.abs(Math.cos(motusMap.map.getCenter().lat * Math.PI/180)) / Math.pow(2, motusMap.map.getZoom()+8);

  if (meters) {return meters / metersPerPixel;}
  else if (pixels) {return pixels * metersPerPixel;}
  else  {return metersPerPixel;}
}

async function viewProspectiveStations() {

	if (typeof motusData.prospectiveStations === "undefined") {
    motusMap.loadingPane("Loading prospective Stations...");

		motusData.prospectiveStations = await downloadMotusData("prospectiveStations");

    getExploreMapLayers(false, "prospectiveStations");

	}

}


async function viewCoordinationRegions() {

	if (typeof motusData.coordinationRegions === "undefined") {

    motusMap.loadingPane("Loading coordination regions...");

		motusData.coordinationRegions = await downloadMotusData("coordinationRegions");

		motusMap.regionalColourScale = d3.scaleOrdinal().domain(motusData.coordinationRegions.features.map(x => x.id)).range(customColourScale.jnnnnn.slice(0, motusData.coordinationRegions.features.length));

    getExploreMapLayers(false, "coordinationRegions");

	}


}

async function viewAntennaRanges() {

	if (typeof motusData.antennas === "undefined") {

    motusMap.loadingPane("Loading antenna ranges...");

		motusData.antennas = await downloadMotusData("antennas");

    motusMap.antennaColourScale = d3.scaleOrdinal().domain(motusData.antennas.features.map(x => x.properties.type)).range(customColourScale.jnnnnn.slice(0, motusData.antennas.features.length));

    getExploreMapLayers(false, "antennaRanges");
	}

}

async function editorMapLayers( ) {

  motusEditor.editMode = true;

  if (motusMap.layers.includes("antennaRanges")) {await viewAntennaRanges();}
  if (motusMap.layers.includes("coordinationRegions")) {await viewCoordinationRegions();}
  if (motusMap.layers.includes("prospectiveStations")) {await viewProspectiveStations();}

  deckGL_renderMap( true );
  // Hide the loading pane
  motusMap.loadingPane();

}

function getEditorDeckglLayers() {
  return Object.entries(deckGlLayers).filter(x => motusMap.layers.includes(x[0])).map( x => x[1] );
}
