

function viewTrack(animalID, opts = {noScroll: false}) {
  if ($("#exploreTracks").length == 0)
    makeExploreTracksContainer();
  else
    $("#exploreTracks .map-panel-track.highlighted").removeClass("highlighted");

  if (animalID) {

    motusMap.trackView = true;

    var selectedTrackEl = d3.select("#exploreTracks")
                        .selectAll(".map-panel-track")
                        .filter( d => d.id == animalID)
                        .classed("highlighted", true)
                        .node();
    if (!opts.noScroll) {
      $(".map-panel").scrollTop(
        (
          $( selectedTrackEl ).offset().top
           -
          $(".map-panel").offset().top
        ) +
        $(".map-panel").scrollTop()
      );
    }
    if (!motusFilter.animalsOLD)
		  motusFilter.animalsOLD = motusFilter.animals;

    motusFilter.animals = [animalID];

    getModifiedTrackLayer();
    // Re-render the map without reloading the layers first
    deckGL_renderMap();

  //  $("#filter_animals").select2().val(opts.selected).trigger('change');


  } else {
    // Error
    console.warn("No animal ID provided!");
  }

}
function modifyTrack({station, animal, undo}) {
  if (station) {
    animal = motusFilter.animals[0];
    var removedTracks = motusData.removed_tracksLongByAnimal.filter( x=>x.id == animal )[0];

    if (undo || (removedTracks && removedTracks.stations.includes(station)) ) {


      if (!removedTracks) {
        console.warn("Cannot find the track!");
        return false;
      }

      motusData.tracksLongByAnimal.filter( x => x.id == animal).forEach( x => {
          [x.ts,x.tracks,x.dist,x.stations] = sortArrays([
              x.ts.concat(removedTracks.ts.filter( (_, i) => removedTracks.stations[i] == station )),
              x.tracks.concat(removedTracks.tracks.filter( (_, i) => removedTracks.stations[i] == station )),
              x.dist.concat(removedTracks.dist.filter( (_, i) => removedTracks.stations[i] == station )),
              x.stations.concat(removedTracks.stations.filter( (_, i) => removedTracks.stations[i] == station ))
            ]);
        removedTracks.inds = removedTracks.inds.filter( (_, i) => removedTracks.stations[i] != station );
        removedTracks.tracks = removedTracks.tracks.filter( (_, i) => removedTracks.stations[i] != station );
        removedTracks.dist = removedTracks.dist.filter( (_, i) => removedTracks.stations[i] != station );
        removedTracks.ts = removedTracks.ts.filter( (_, i) => removedTracks.stations[i] != station );
        removedTracks.stations = removedTracks.stations.filter( (_, i) => removedTracks.stations[i] != station );
      });

    //  console.log(station);
      if (motusData.stations.filter( x=> x.id == station)[0]) {
        motusData.stations.filter( x=> x.id == station)[0].stationDeps.forEach( x => {
          motusData.modifiedTracks = motusData.modifiedTracks.filter( d => d.tagDep != animal && d.stationDep != x);
        });
      }
      motusData.removed_tracksLongByAnimal = motusData.removed_tracksLongByAnimal.filter( x => x.id != animal );
      motusData.removed_tracksLongByAnimal.push(removedTracks);

      getModifiedTrackLayer();
      // Re-render the map without reloading the layers first
      deckGL_renderMap( false );
    } else {
      animal = motusFilter.animals[0];
      let species = motusData.species.filter( x => x.animals.includes(animal.toString()))[0];
      species = species?species[currLang]:"Unknown";


      if (!removedTracks) {
        removedTracks = {
          id: animal, inds: [], tracks: [], stations: [], dist: [], ts: []
        };
      }

      motusData.tracksLongByAnimal.filter( x => x.id == animal).forEach( x => {
        removedTracks.inds = removedTracks.inds.concat( x.stations.filter( (stn) => stn == station ).map((_,i)=> i) );
        removedTracks.tracks = removedTracks.tracks.concat( x.tracks.filter( (_, i) => x.stations[i] == station ) );
        removedTracks.dist = removedTracks.dist.concat( x.dist.filter( (_, i) => x.stations[i] == station ) );
        removedTracks.ts = removedTracks.ts.concat( x.ts.filter( (_, i) => x.stations[i] == station ) );
        removedTracks.stations = removedTracks.stations.concat( x.stations.filter( (_, i) => x.stations[i] == station ) );

        x.tracks = x.tracks.filter( (_, i) => x.stations[i] != station );
        x.dist = x.dist.filter( (_, i) => x.stations[i] != station );
        x.ts = x.ts.filter( (_, i) => x.stations[i] != station );
        x.stations = x.stations.filter( (_, i) => x.stations[i] != station );
      });

    //  console.log(station);
      if (motusData.stations.filter( x=> x.id == station)[0]) {
        motusData.stations.filter( x=> x.id == station)[0].stationDeps.forEach( x => {
          let stationDep = motusData.stationDeps2.filter(d => d.id == x)[0];
          if (stationDep && stationDep.animals.includes(animal)) {
            motusData.modifiedTracks.push({tagDep: animal, stationDep: x, species: species, stationName: stationDep.name});
          }
        });
      }
      motusData.removed_tracksLongByAnimal = motusData.removed_tracksLongByAnimal.filter( x => x.id != animal );
      motusData.removed_tracksLongByAnimal.push(removedTracks);

      getModifiedTrackLayer();
      // Re-render the map without reloading the layers first
      deckGL_renderMap( false );
    }
  }


  if (motusData.modifiedTracks.length > 0) {
    $("#explore_card_map .map-panel-controls .submit_btn").attr("disabled", false);
  } else {
    $("#explore_card_map .map-panel-controls .submit_btn").attr("disabled", "disabled");
  }
}

function makeExploreTracksContainer() {

  if (!motusData.modifiedTracks) {
    motusData.modifiedTracks = [];
    motusData.removed_tracksLongByAnimal = [];
  }

  $("#explore_card_map").prepend("<div class='map-panel-wrapper'><div class='map-panel-controls'><button class='listTracks_btn'>List track segments</button><button class='submit_btn' disabled='disabled'>Download track filters</button></div><div id='exploreTracks' class='map-panel'></div></div>");

  $("#explore_card_map .map-panel-controls .listTracks_btn").click(listTrackSegments);
  $("#explore_card_map .map-panel-controls .submit_btn").click(showModifiedTrackTable);

  var track_els = d3.select("#exploreTracks")
    .selectAll(".map-panel-track")
    .data(motusData.tracksLongByAnimal)
    .enter().append("div")
      .attr("class", "map-panel-track")
      .on("mouseover touchstart", (_,d) => viewTrack(d.id, {noScroll:true}));

  track_els
    .append("div")
      .attr("class", "map-panel-track-species")
      .html(d => {
        let species = typeof d.species === 'undefined' || d.species == "NA" ? "Unknown species" : motusData.species.filter(x => x.id == d.species)[0];
            species = typeof species === 'undefined' ? "Unknown species" : species[currLang];
        return `${icons.species}&nbsp;&nbsp;&nbsp;${species}`;
      });

  track_els
    .append("div")
      .attr("class", "map-panel-track-id")
      .html(d => `${icons.animals}	#${d.id}`);

  track_els
    .append("div")
      .attr("class", "map-panel-track-stations")
      .html(d => `${icons.station}	${d.stations.length}`);

  track_els
    .append("div")
      .attr("class", "map-panel-track-dates")
      .html(d => `${new Date(d.ts[0]*1000).toISOString().substr(0,10)} -	${new Date(d3.max(d.ts)*1000).toISOString().substr(0,10)}`);

  track_els
    .append("div")
      .attr("class", "map-panel-track-rate")
      .html(d => `${Math.round(d3.sum(d.dist)/1000)} km @	${Math.round(36 * d3.sum(d.dist)/(d.ts[d.ts.length-1]-d.ts[0]))/10} km/h`);



}

function getModifiedTrackLayer() {

	deckGlLayers.tracks =	new deck.GeoJsonLayer({
		id: 'deckGL_tracks',
		data: motusData.tracksLongByAnimal.filter( d => d.id == motusFilter.animals[0] ),
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
				"#FF0000"
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
		getLineWidth: Object.keys(motusData.selectedTracks).length < 100 ? 3000 : 2000,
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


function showModifiedTrackTable() {

  $(".popup,.popup_bg").remove();
  $("body").append(`<div class='popup_bg'></div><div class='popup'><div class='popup-topbar'><div class='popup-header'></div><div class='popup-topbar-close'>X</div></div><div class='popup-content'></div></div>`);
  $(".popup").draggable({handle: ".popup-topbar"});

  $(".popup .popup-topbar .popup-topbar-close, .popup_bg").click(function(){
    $(".popup").remove();
    $(".popup_bg").remove();
//						$("body > *:not(.popup)").css({filter:"blur(0)"});
  });

  var justification_opts = modifiedTracksTableOptions.justification.map( x => `<option>${x}</option>`);
  var source_opts = modifiedTracksTableOptions.source.map( x => `<option>${x}</option>`);

  var tableDom = motusData.modifiedTracks.length > 10 ? "fiBpt" : "Bt";

  $('.popup .popup-content').html( "Tag deployment (animalID) and station deployment pairs to filter from public output<table></table>" );

  $('.popup .popup-content table').DataTable({
      data: motusData.modifiedTracks,
      dom: tableDom,
      buttons: [
        {
          extend:'copyHtml5',
          exportOptions: {
            format: {
              body: function ( data, row, column, node ) {

                return $(node).has("input").length>0 ?
                  $(node).find("input").val() :
                  $(node).has("select").length>0 ?
                    $(node).find("select").val() :
                    data;
              }
            }
          }
        },
          {
            extend:'csvHtml5',
            exportOptions: {
              format: {
                body: function ( data, row, column, node ) {
                  return $(data).is("input") ?
                    $(data).val() :
                    $(data).is("select") ?
                      $(data).val() :
                      data;
                }
              }
            }
          }
      ],
			columnDefs: [ {
				orderable: false,
        data: null,
        defaultContent: ("<select multiple='multiple'>" + justification_opts.join("") + "</select>"),
				targets:   4
			} ],
			columnDefs: [ {
				orderable: false,
        data: null,
        defaultContent: ("<select>" + source_opts.join("") + "</select>"),
				targets:   5
			} ],
			columnDefs: [ {
				orderable: false,
        data: null,
        defaultContent: '<input type="text" value="" />',
				targets:   6
			} ],
      columns: [
        {data: "tagDep", title: "Tag deployment"},
        {data: "stationDep", title: "Station deployment"},
        {data: "species", title: "Species"},
        {data: "stationName", title: "Station name"},
        {data: null,
          defaultContent: ("<select multiple='multiple'>" + justification_opts.join("") + "</select>"),
				 title: "Justification for removal"},
        {data: null,
          defaultContent: ("<select>" + source_opts.join("") + "</select>"),
				 title: "Cause of error"},
        {data: null, title: "Comments"}
      ]
    });

  $('.popup').css({top:$("html").scrollTop() + ($(window).height() - $('.popup').outerHeight())/2, left:($(window).width() - $('.popup').outerWidth())/2});

  $('.popup:hidden').show();
  $('.popup_bg:hidden').show();
}


function listTrackSegments() {

  $(".popup,.popup_bg").remove();
  $("body").append(`<div class='popup_bg'></div><div class='popup'><div class='popup-topbar'><div class='popup-header'></div><div class='popup-topbar-close'>X</div></div><div class='popup-content'></div></div>`);
  $(".popup").draggable({handle: ".popup-topbar"});

  $(".popup .popup-topbar .popup-topbar-close, .popup_bg").click(function(){
    $(".popup").remove();
    $(".popup_bg").remove();
//						$("body > *:not(.popup)").css({filter:"blur(0)"});
  });
  let tableData = Object.assign({},motusData.tracksLongByAnimal.filter( x => x.id == motusFilter.animals[0] )[0]);

  tableData.selected = tableData.stations.map( x => true );

  var removedTracks = motusData.removed_tracksLongByAnimal.filter( x => x.id == motusFilter.animals[0] )[0];

  if (removedTracks) {
    // Add back in the data that's been removed (deselected)
    [tableData.ts,tableData.tracks,tableData.dist,tableData.stations,tableData.selected] = sortArrays([
        tableData.ts.concat(removedTracks.ts),
        tableData.tracks.concat(removedTracks.tracks),
        tableData.dist.concat(removedTracks.dist),
        tableData.stations.concat(removedTracks.stations),
        tableData.selected.concat(removedTracks.stations.map( x => false ))
      ]);
  }

  if (tableData) {
    tableData = tableData.stations.map( (x,i) => {
      let speed = i==0?"-":(Math.round(tableData.dist[i]/((tableData.ts[i]-tableData.ts[i-1])/(3.6*100)))/100);
      let station = motusData.stations.filter( d => d.id == x )[0];

      return {
        selected: tableData.selected[i],
        tagDep: tableData.id,
        stationDep: x,
        name: station ? station.name : "--",
        lat: tableData.tracks[i][1],
        lon: tableData.tracks[i][0],
        dist: Math.round(tableData.dist[i]/10)/100,
        ts: new Date(tableData.ts[i]*1000).toISOString().substr(0,10),
        speed: speed,
        flag: i==0?"-":(
          (speed>80&&tableData.dist[i]>3e4) ? "Very fast"
          : (speed>50&&tableData.dist[i]>3e4) ? "Fast" : "Normal"
        )
      }

    });
  } else {console.warn("Could not find any track records for the selected animal: %s", motusFilter.animals[0]);return false;}

  var tableDom = tableData.length > 10 ? "iBtp" : "Bt";

  $('.popup .popup-content').html( "Tag deployment (animalID) and station deployment pairs to filter from public output<table></table>" );

  $('.popup .popup-content table').DataTable({
      data: tableData,
      dom: tableDom,
      buttons: [
        'copyHtml5',
        'excelHtml5',
        'csvHtml5',
        'pdfHtml5'
      ],
      select: {
        style: "multi"
      },
			columnDefs: [ {
				orderable: false,
        data: "selected",
        defaultContent: '',
				className: 'select-checkbox',
				targets:   0
			} ],
      columns: [
        {data: null, title: ""},
        {data: "tagDep", title: "Tag deployment"},
        {data: "stationDep", title: "Station deployment"},
        {data: "name", title: "Station"},
        {data: "dist", title: "Distance (km)"},
        {data: "ts", title: "Date"},
        {data: "speed", title: "Speed (km/h)"},
        {data: "flag", title: "Flag"}
      ],
      order: [[ 1, 'asc' ]]
    }).on("deselect", (_,dt, type, inds) => {
    if ( type === 'row' ) {
      var data = dt.rows( inds ).data();
      for (var i=0;i<data.length;i++) {
        modifyTrack({station:data[i].stationDep});
      }
    }
  }).on("select", (_,dt, type, inds) => {
    if ( type === 'row' ) {
      var data = dt.rows( inds ).data();
      for (var i=0;i<data.length;i++) {
        modifyTrack({station:data[i].stationDep, undo:true});
      }
    }
  }).rows( (_,data) => data.selected ).select();


	$(".popup .popup-content table th.select-checkbox").on('click', selectAll);

  $('.popup').css({top:$("html").scrollTop() + ($(window).height() - $('.popup').outerHeight())/2, left:($(window).width() - $('.popup').outerWidth())/2});

  $('.popup:hidden').show();
  $('.popup_bg').hide();

  function selectAll() {

		$(this).closest("tr").toggleClass("selected");
		var table = $(".popup .popup-content table").DataTable();
		if( $(this).closest("tr").hasClass("selected")){
			table.rows({page: 'current'}).select();
		}
		else {
			table.rows({page: 'current'}).deselect();
		}

	}
}

var modifiedTracksTableOptions = {
  justification: [
    "Select one or more",
    "Ambiguous with locally-deployed tag",
    "Location out of range on this date",
    "Location out of range",
    "Obvious type 2 aliasing",
    "Lots of colonial birds nearby with same BI",
    "Obvious noise burst",
    "Unlikely (add comments)"
  ],
  source: [
    "Select one",
    "Ambiguous with locally-deployed tag",
    "Radio noise burst",
    "Suspected aliasing",
    "Suspected noise event",
    "Type 1 tag aliasing",
    "Type 2 tag aliasing",
    "Type 3 tag aliasing"
  ]
}
