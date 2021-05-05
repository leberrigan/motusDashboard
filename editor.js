var editorStationRange;

function exploreMapEditor() {

  if ($("#explore_map_editor").length == 0) {

    $("body").append(`<div class="explore-map-editor-wrapper">`+
                        `<div id="explore_map_editor" class="explore-map-edit"><button class='close_btn'>Close</button></div>`+
                        `<div class='add-station-info'><div class='add-station-range'></div>Click on the map to place a prospective station.<br/><button class='close_btn' >Cancel</button></div>`+
                      `</div>`);

    $(`.explore-map-${dataType}-edit .explore-control-hidden`).prependTo("#explore_map_editor");

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
        $(e.target).before('<label for="explore_map_editor_station_range">Antenna range (km): </label><input style="width:50px;" type="number" id="explore_map_editor_station_range" min="0" max="20" class="add-station-range-value" value="'+15+'">');
      }
    });

  }

  $(".explore-map-editor-wrapper").fadeToggle();


}

function exploreMapAddStation(e) {

  if ($(".explore-map-editor-wrapper").hasClass("add-station-view")) {

    // Hide station antenna ranges
    if (!$("#explore_map_editor #explore_controls_plan_layer_select").val().includes("Antenna ranges")) {
    	motusMap.g.selectAll('.explore-map-antenna-range').classed('hidden', true);
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
    if (!$("#explore_map_editor #explore_controls_plan_layer_select").val().includes("Antenna ranges")) {
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

function viewProspectiveStations() {
	console.log('test')
	if (typeof motusData.prospectiveStations !== "undefined") {

		motusMap.g.selectAll('.explore-map-prospective-station.hidden').classed('hidden', false);

	} else {

		var load = Promise.all( [d3.json( filePrefix + "prospective_stations.geojson" )] ).then(function(response){

				console.log('test')
			motusData.prospectiveStations = response[0];

			motusMap.g.selectAll('.explore-map-prospective-station')
				.data(motusData.prospectiveStations.features)
				.enter().append("path")
				.attr("d", (d) => d.geometry.type == 'Point' ? motusMap.path.pointRadius(4)(d) : motusMap.path(d))
				.style('stroke', '#000')
				.style('fill', d => d.geometry.type == 'Point' ? '#FF0' : "none")
				.attr('class', d => 'explore-map-station leaflet-zoom-hide explore-map-prospective-station disable-filter' + (d.geometry.type == 'Point' ? "" : " explore-map-station-line"))
				.style('stroke-width', d => d.geometry.type == 'Point' ? '1px' : '10px')
				.style('pointer-events', 'auto')
				.on('touchstart', (e) => e.preventDefault())
				.on('mouseover', (e,d) => motusMap.dataHover(e, d, 'in', 'prospective-stations'))
				.on('mouseout', (e,d) => motusMap.dataHover(e, d, 'out', 'prospective-stations'))
				.on('click', (e,d) => motusMap.dataClick(e, d, 'prospective-stations'));

			motusMap.map.fire('zoomend');

		});
	}


}


function viewRegionalCoordinationGroups() {

	if (typeof motusData.regionalGroups !== "undefined") {

		motusMap.g.selectAll('.explore-map-regional-groups.hidden').classed('hidden', false);

	} else {


		var load = Promise.all( [d3.json( filePrefix + "motus-regional-collaboratives.geojson" )] ).then(function(response){

			motusData.regionalGroups = response[0];

			var regionalColourScale = d3.scaleOrdinal().domain(motusData.regionalGroups.features.map(x => x.id)).range(customColourScale.jnnnnn.slice(0, motusData.regionalGroups.features.length));

			motusMap.g.selectAll('.explore-map-regional-groups')
				.data(motusData.regionalGroups.features)
				.enter().append("path")
				.attr("d", d => motusMap.path(d))
				.style('stroke', '#000')
				.style('opacity', '0.5')
				.style('fill', d => regionalColourScale(d.id))
				.attr('class', 'leaflet-zoom-hide explore-map-region explore-map-regional-groups disable-filter')
				.style('stroke-width', '1 px')
				.style('pointer-events', 'auto')
				.on('touchstart', (e) => e.preventDefault())
				.on('mouseover', (e,d) => motusMap.dataHover(e, d, 'in', 'regional-group'))
				.on('mouseout', (e,d) => motusMap.dataHover(e, d, 'out', 'regional-group'))
				.on('click', (e,d) => motusMap.dataClick(e, d, 'regional-group'));

			motusMap.map.fire('zoomend');

		});
	}


}

function viewAntennaRanges() {

	if (typeof motusData.antennas !== "undefined") {

		motusMap.g.selectAll('.explore-map-antenna-range.hidden').classed('hidden', false);

	} else {

		var load = Promise.all( [d3.csv( filePrefix + "antenna-deployments.csv" )] ).then(function(response){

			motusData.antennas = {type: "FeatureCollection", features:
        response[0].filter( d => d.deploymentStatus != 'terminated' ).map(function(d){

          var station = motusData.stationDeps.filter( v => v.id == d.recvDeployID );

          if (station.length != 0 && station[0].lat && station[0].lon && +station[0].lat != 0 && +station[0].lon != 0 ) {

            var coordinates = getAntennaShape({lat: +station[0].lat, lon: +station[0].lon, type: d.antennaType, bearing: d.bearing});

            // If it's a polygon, close the path
            if (coordinates.length > 1) {coordinates.push(coordinates[coordinates.length - 1])}

          }  else {

            var coordinates = [];

          }
          return {
            id: d.recvDeployID,
            type: "Feature",
            properties: {
              type: d.antennaType,
              bearing: d.bearing,
              port: d.port,
              height: d.heightMeters,
              dongle: d.dongle_type,
              freq: d.frequency,
              status: d.deploymentStatus
            },
            geometry: {
              type: coordinates.length == 1 ? "Point" : "LineString",
              coordinates: coordinates.length == 1 ? coordinates[0] : coordinates
            }
          };

        }).filter( d => d.geometry.coordinates.length > 0)
      };

			var antennaColourScale = d3.scaleOrdinal().domain(motusData.antennas.features.map(x => x.properties.type)).range(customColourScale.jnnnnn.slice(0, motusData.antennas.features.length));

			motusMap.g.selectAll('.explore-map-antenna-range')
				.data(motusData.antennas.features)
				.enter().append("path")
				.attr("d", d => motusMap.path(d))
				.style('stroke', '#000')
				.style('opacity', '0.5')
				.style('fill', d => antennaColourScale(d.properties.type))
				.attr('class', 'leaflet-zoom-hide explore-map-antenna explore-map-antenna-range disable-filter')
				.style('stroke-width', '1 px')
				.style('pointer-events', 'auto')
				.on('mouseover', (e,d) => motusMap.dataHover(e, d, 'in', 'antenna'))
				.on('mouseout', (e,d) => motusMap.dataHover(e, d, 'out', 'antenna'));

			motusMap.map.fire('zoomend');

		});
	}


}
