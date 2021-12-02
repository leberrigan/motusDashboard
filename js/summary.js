var detailedView = false;
var exploreProfile_hasLoaded = false;

var timeRange = {};
var isGrouped = false;

function exploreSummary({regionBin = "adm0_a3"} = {}) { // {summaryType: String, summaryID: Integer or String, summaryData: Object}


	// All possible combinations of region codes (for colouring tracks)
	// *** should be removed
	var selectionCombos = [];

	for (var i = 0; i < motusFilter.selections.length - 1; i++) {
	  // This is where you'll capture that last value
	  for (var j = i + 1; j < motusFilter.selections.length; j++) {
			selectionCombos.push( motusFilter.selections[i] + "," + motusFilter.selections[j ]);
	  }
	}

	// Add singles to region combos
	selectionCombos = motusFilter.selections.concat(selectionCombos);

	// *** Above should be removed to '***'

	// Check to see if this is a grouped profile
	isGrouped = (typeof motusFilter.group !== 'undefined' && motusFilter.group.length > 0);

	if (isGrouped) {
		// If it is, we're going to compute the group summary based on each individual one
		// This is done on the client side so eats at the load time somewhat.
		// Likely will be necessary to retain this until we come up with a Dexie
		// solution and/or compute the summaries on the server.
		motusData.profiles = [];
		motusData.groups = [];
	}

	// Set colour scale based on number of colour combos
	motusMap.colourScale = d3.scaleOrdinal()
		.domain(['visiting'].concat(motusFilter.selections))
		.range(["#000000"].concat(customColourScale.jnnnnn.slice(0, motusFilter.selections.length + (dataType == 'regions'))));

if (motusFilter.selections.length > 1) {
	motusData.tableColourScale = motusMap.colourScale;
	motusMap.colourVar = dataType;
} else {
	motusData.tableColourScale = d3.scaleOrdinal()
		.domain(['visiting'].concat( motusData.selectedProjects.map( x => x.id ) ))
		.range(["#000000"].concat(customColourScale.jnnnnn.slice(0, motusData.selectedProjects.length + (dataType == 'regions'))));

	motusMap.colourScale = motusData.tableColourScale;

	motusMap.colourVar = "projects";
}


	/*

		Load the tracks -- this takes a while

		We could potentially speed things up if we push things to the server

	  How it works:

		1) Table with all tracks is filtered for animals selected with the motusFilter
			- The table has tracks grouped by 'route' so that the animal column must first be split into an array


	*/
	// Create some empty data objects to be populated

	if (typeof selectedTracks === "undefined") {
	//	console.log(motusData.selectedAnimals);




	testTimer.push([new Date(), "Get selected track data"]);
	console.log(Object.keys(motusData.tracksByAnimal));
	if (motusData[`selected${firstToUpper(dataType)}`].length > 3 && !isGrouped) {
		$("#explore_card_profiles").addClass("greaterThan3");
	}
	getSelectedTrackData( motusData.selectedTracks, reload = true );

	testTimer.push([new Date(), "Set time limits"]);
	timeRange.min = new Date(d3.min(motusData.allTimes));
	timeRange.max = new Date(d3.max(motusData.allTimes));
	if (dtLims.min > new Date(d3.min(motusData.allTimes))) {dtLims.min = new Date(d3.min(motusData.allTimes));}
	if (dtLims.max < new Date(d3.max(motusData.allTimes))) {dtLims.max = new Date(d3.max(motusData.allTimes));}

	testTimer.push([new Date(), "Populate profiles map"]);
	populateProfilesMap();

	// Get explore profile data
	testTimer.push([new Date(), "Get explore profile data"]);
	motusData[`selected${firstToUpper(dataType)}`].forEach(getExploreProfileData);

	if (isGrouped) {
		getGroupedExploreProfileData({id: Object.entries(projectGroupNames).filter( x => x[1] == motusFilter.group )[0][0], name: motusFilter.group, description: ""});
	}



	testTimer.push([new Date(), "Add explore tabs"]);
	addExploreTabs();

	testTimer.push([new Date(), "Add 'add' tab"]);
	addExploreCard({data:"add"});


	// Finishes here
	testTimer.push([new Date(), "Done"]);

	testTimer.forEach( (x,i) => {
		var text = i == 0 ? "Begin" : testTimer[i-1][1];
		x[2] = i == 0 ? 0 : x[0] - testTimer[i-1][0];
		console.log(`${text}: ${x[2]}`);
		if (i == testTimer.length - 1) {
			console.log(`Total: ${d3.sum(testTimer, t => t[2])}`);
		}
	});



		testTimer.push([new Date(), "Add summary content"]);

	} else {
		motusData.selectedTracks = selectedTracks;
	}

}




function projectsTable( cardID, tableType ) {

	console.log("Loading %s - %s", cardID, tableType)

	$(`#explore_card_${cardID} .explore-card-${cardID}-table`).parent().hide();

	if ($(`#explore_card_${cardID} .explore-card-${cardID}-${tableType}-table`).length > 0) {

		$(`#explore_card_${cardID} .explore-card-${cardID}-${tableType}-table`).parent().show();

	} else {

		//$("#explore_card_stationHits .explore-card-header").text("Stations in th" + ( motusFilter.regions.length > 1 ? "ese" : "is") + " region" + ( motusFilter.regions.length > 1 ? "s" : ""));


		motusData.selectedProjects.forEach(function(v){
					v.animals = Array.from( motusData.selectedAnimals.filter( d => d.projID == v.id ).map( d => d.id ).values() )
					v.allAnimals = Array.from( motusData.animals.filter( d => d.projID == v.id ).map( d => d.id ).values() )
					v.species = Array.from( motusData.selectedAnimals.filter( d => d.projID == v.id ).map( d => d.species ).values() ).filter(onlyUnique);
					v.allSpecies = Array.from( motusData.animals.filter( d => d.projID == v.id ).map( d => d.species ).values() ).filter(onlyUnique);
					v.stations = Array.from( motusData.selectedStations.filter( d => d.projID == v.id ).map( d => d.id ).values() )
					v.allStations = Array.from( motusData.stations.filter( d => d.projID == v.id ).map( d => d.id ).values() )
				});



		var projectsTableData = motusData.selectedProjects.filter( d =>
			(tableType == 'stations' && d.stations.length > 0) ||
			(tableType == 'tags' && d.animals.length > 0)
		);

		console.log(projectsTableData);
		if (projectsTableData.length > -1 ) {


			var headers = ["Project #", "Project Name", "Start Date", "Stations Deployed", "Animals tagged", "Species tagged", "Groups"];

			$(`#explore_card_${cardID}`)
				.append( $("<table></table>")
					.attr('class', `explore-card-${cardID}-table explore-card-${cardID}-${tableType}-table`)
					.append( $('<thead></thead>')
						.append( $('<tr></tr>')	)
					)
					.append( $('<tbody></tbody>') )
				)


			var tableDom = projectsTableData.length > 10 ? "Bipt" : "Bt";
			var color_dataType = 'regions' == dataType ? 'country' : 'id';

			$(`#explore_card_${cardID} .explore-card-${cardID}-${tableType}-table`).DataTable({
				data: projectsTableData,
				columns: [
					{className: "explore-table-expandRow", data: null, orderable: false, defaultContent: icons.add+icons.addFilter},
					{data: "id", title: "Project #"},
					{data: "name", title: "Project", "createdCell": function(td, cdata, rdata){
						$(td).html(
								`<div class='explore-card-table-legend-icon table_tips' style='border-color:${motusData.tableColourScale(rdata[color_dataType])};background-color:${motusData.tableColourScale(rdata[color_dataType])}'><div class='tip_text'>${firstToUpper(color_dataType)}: ${rdata.name}</div></div>`+
								`<a href='javascript:void(0);' onclick='viewProfile("projects", ${rdata.id});'>${rdata.name}</a>`
						);
					}},
					{data: "dtCreated", title: "Start date"},
					{className: "table_tips", data: "stations", title: "Stations deployed", "createdCell": function(td, cdata, rdata){
						$(td).html(
								`${rdata.stations.length} of ${rdata.allStations.length}`+
								`${icons.help}<div class='tip_text'>Number of stations with detections of the total deployed in this project</div>`
						);
					}},
					{className: "table_tips", data: "animals", title: "Animals tagged", "createdCell": function(td, cdata, rdata){
						$(td).html(
								`${rdata.animals.length} of ${rdata.allAnimals.length}`+
								`${icons.help}<div class='tip_text'>Number of animals detected of the total deployed in this project</div>`
						);
					}},
					{className: "table_tips", data: "species", title: "Species tagged", "createdCell": function(td, cdata, rdata){
						$(td).html(
								`${rdata.species.length} of ${rdata.allSpecies.length}`+
								`${icons.help}<div class='tip_text'>Number of species detected of the total deployed in this project</div>`
						);
					}},
					{data: "fee_id", title: "Groups", "createdCell": function(td, cdata, rdata){
						$(td).html(
							`<a href='javascript:void(0);' onclick='viewProfile("projectsGroup", ["${rdata.fee_id}"]);'>${rdata.fee_id}</a>`
						);
					}}
				],
				dom: tableDom,
				buttons: [
					'copyHtml5',
					'excelHtml5',
					'csvHtml5',
					'pdfHtml5'
				],
				autoWidth: false,
				columnDefs: [ {
					"targets": 0,
					"orderable": false
				}],
				order: [[1, 'asc']]
			})

			$(`#explore_card_${cardID} .explore-card-${cardID}-${tableType}-table tbody`).on('click', `td.explore-table-expandRow`, function(){

				var tr = $(this).closest('tr');
				var row = $(this).closest('table').DataTable().row( tr );

						//			console.log( row );

				if ( row.child.isShown() ) {
					// This row is already open - close it
					row.child.hide();
					tr.removeClass('shown');
				} else if (typeof row.child() !== 'undefined') {
					// Open this row
					row.child.show();
					tr.addClass('shown');
				} else {
					// Create and open this row
					var newRow = row.child( row.data().description ).show();

				}

			});
		}
	}
}




function stationTable( cardID ) {

	$("#explore_card_stationHits .explore-card-stationHits-timeline").parent().hide();

	if ($(`#explore_card_${cardID} .explore-card-${cardID}-table`).length == 0) {

		var headers = ["Station Name", "Start Date", "Status", "Animals", "Species", "Project"];

		$(`#explore_card_${cardID}`)
			.append( $("<table></table>")
				.attr('class', `explore-card-${cardID}-table`)
				.append( $('<thead></thead>')
					.append( $('<tr></tr>')	)
				)
				.append( $('<tbody></tbody>') )
			)

		//headers.forEach( x => $(`#explore_card_${cardID} .explore-card-${cardID}-table thead tr`).append( $('<th></th>').text(x) ) );
		timeRange.range = timeRange.max - timeRange.min;

		var tableDom = motusData.selectedStations.length > 10 ? "Blipt" : "Bt";

		var color_dataType = 'regions' == dataType ? 'regions' : 'projects';
		var color_dataVar = 'regions' == dataType ? 'country' : 'project';

		$(`#explore_card_${cardID} .explore-card-${cardID}-table`).DataTable({
			data: motusData.selectedStations,
			columns: [
				{className: "explore-table-expandRow", data: null, orderable: false, defaultContent: icons.add+icons.addFilter},
				{data: "name", title: "Station", "createdCell": function(td, cdata, rdata){

					var dataVal = rdata[color_dataVar].split(",").map( x => motusData[color_dataType].filter( p => p.id == x )[0].name ).join(", ");

					$(td).html(
							`<div class='explore-card-table-legend-icon table_tips' style='border-color:${motusData.tableColourScale(rdata[color_dataVar])};background-color:${motusData.tableColourScale(rdata[color_dataVar])}'>`+
								`<div class='tip_text'>${firstToUpper(color_dataVar)}: ${dataVal}</div>`+
							`</div>`+
							`<a href='javascript:void(0);' onclick='viewProfile("stations", ${rdata.id});'>${rdata.name}</a>`
					);
				}},
				{data: "dtStart", title: "Start date", "createdCell": function(td, cdata, rdata){
					$(td).html( cdata.toISOString().substr(0,10) );
				}},
				{data: "dtEnd", title: "Status", "createdCell": function(td, cdata, rdata){
					$(td).html( `${(moment().diff(cdata, 'day') < 1 ? "Active" : "Ended on:<br/>" + cdata.toISOString().substr(0,10) )}` );
				}},
				{data: "nAnimals", title: "Number of Animals", "createdCell": function(td, cdata, rdata){
					$(td).html(
						`<a href='javascript:void(0);' onclick='viewProfile("animals", [${rdata.animals.map( x => '"'+x+'"' ).join(',')}]);'>${cdata}</a>`
					);
				}},
				{data: "nSpecies", title: "Number of Species", "createdCell": function(td, cdata, rdata){
					$(td).html(
						`<a href='javascript:void(0);' onclick='viewProfile("species", [${rdata.species.map( x => '"'+x+'"' ).join(',')}]);'>${cdata}</a>`
					);
				}},
				{data: "projID", title: "Project", "createdCell": function(td, cdata, rdata){
					$(td).html(
						`<a href='javascript:void(0);' onclick='viewProfile("projects", [${cdata.split(",").map( x => '"'+x+'"' ).join(',')}]);'>${cdata.split(",").map( x => motusData.projects.filter( p => p.id == x )[0].name ).join(", ")}</a>`
					);
				}}
			],
			dom: tableDom,
			buttons: [
				'copyHtml5',
				'excelHtml5',
				'csvHtml5',
				'pdfHtml5'
			],
			autoWidth: false,
			columnDefs: [ {
				"targets": 0,
				"orderable": false
			}],
			order: [[1, 'asc']]
		}).on('draw.dt', function(){
			$(`#explore_card_${cardID} .explore-card-${cardID}-table`).DataTable().rows().every(function(){
				let stationDeps = motusData.selectedStationDeps.filter( x => this.data().stationDeps.includes(x.id) );
				this.child( detectionTimeline(
						stationDeps,
						{ width: $(this.node() ).width() - 20,
							timeLineRange: {
								min:d3.min(stationDeps, x => x.dtStart),
								max:d3.max(stationDeps, x => x.dtEnd),
								range:d3.max(stationDeps, x => x.dtEnd) - d3.min(stationDeps, x => x.dtStart)
							} }
					) ).hide();
			//				this.nodes().to$().addClass('shown');
			});
		});

		$(`#explore_card_${cardID} .explore-card-${cardID}-table tbody`).on('click', `td.explore-table-expandRow`, function(){

			var tr = $(this).closest('tr');
			var row = $(this).closest('table').DataTable().row( tr );

			if ( row.child.isShown() ) {
				// This row is already open - close it
				row.child.hide();
				tr.removeClass('shown');
			} else {
				// Open this row

				row.child.show();
				tr.addClass('shown');
			}

		});
	} else {

		$(`#explore_card_${cardID} .explore-card-${cardID}-table`).parent().show();

	}

}


function animalTimeline( cardID ) {

	$("#explore_card_" + cardID + " > div:not(.explore-card-header)").hide();

	if ($(".explore-card-" + cardID + "-timeline").length == 0) {

		$("#explore_card_" + cardID + "")
			.append( $("<div class='explore-card-chart-wrapper'><div class='explore-card-" + cardID + "-timeline'></div></div>") )
	}
	if ($(".explore-card-" + cardID + "-timeline svg.linear-timeline").length == 0) {

		var width_el = $(".explore-card-" + cardID + "-timeline");
		width = 0;
		while(width == 0 && width_el.get(0).tagName != "BODY") {
			width = width_el.width();
			width_el = width_el.parent();
		}

		if (width == 0) {width_el.parent().width();}

		var height = Math.min(600,
													Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
													);

		$(".explore-card-" + cardID + "-timeline").append(

			detectionTimeline(motusData.tracksLongByAnimal,{
					width:width,
					height: height,
		//			resize: $(".explore-card-" + cardID + "-timeline").parent(),
					timelineSVG: $(`<svg height='${height}' style='width:100%;margin:-8px 0;cursor:pointer;' class='linear-timeline'></svg>`),
					dataSource: "animals",
					yAxis: true,
					zoomable: true
				})

		 );
	}

	$("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline svg").hide();
	$("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline").parent().show();
	$("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline svg.linear-timeline").show();

}
function animalMontlyTimeline( cardID ) {


	/*

	I need to create a toggle, or decide on one of the following:
		1. Show unique animals per month/hour
		2. Show unique species per month/hour


	This plot displays three categories of detections:
		1. Local detections: Animals tagged AND detected in the same region
		2. Remote detections: Animals tagged in the region and detected elsewhere
		3. Visitor detections: Animals tagged elsewhere and detected within the region

	*/

	$("#explore_card_" + cardID + " > div:not(.explore-card-header)").hide();


	if ($(".explore-card-" + cardID + "-timeline").length == 0) {

		$("#explore_card_" + cardID + "")
			.append( $("<div class='explore-card-chart-wrapper'><div class='explore-card-" + cardID + "-timeline'></div></div>") )
	}
	if ($(".explore-card-" + cardID + "-timeline svg.monthly-timeline").length == 0) {

		$(".explore-card-" + cardID + "-timeline").append("<svg class='monthly-timeline'></svg>");

		timelineAxisVals = [];

		motusData.tagHits = {};

		//timeRange = {};

		var animalsByDayOfYear = [];

		const group_by = 'month';
		const gSize = 12;	// size of date groups

		var day = 1;


		for (var i=1; i<=gSize; i++) {
			day = moment().month(i).dayOfYear();
			animalsByDayOfYear[ day ] = { "Julian date": day, visiting: [], local: [], remote: [], total: [] };

			Object.values(motusData.selectionNames).forEach(function(d) {animalsByDayOfYear[ day ][ d ] = [];});
		}


		motusData.animalsByDayOfYear.forEach( function(d, i) {

			if (d.local.length > 0 || d.remote.length > 0 || d.visiting.length > 0) {

				var animalsToday = d.local;

				if (!['animals', 'species'].includes(dataType)) {
					animalsToday = animalsToday.concat(d.visiting);
				}

				if (group_by != 'day') {
					day = moment()[group_by](moment().dayOfYear(i)[group_by]()).dayOfYear();
				} else {
					day = Math.floor( Math.floor( i / gSize ) * gSize );
				}

				Object.entries(motusData.selectionNames).forEach(function(k) {
					//console.log("k[1] = %s, motusData['animalsBy'"+firstToUpper(dataType)+"] = %o", k[1], motusData["animalsBy"+firstToUpper(dataType)]);
					if  (dataType == 'animals' || dataType == 'species') {
						animalsByDayOfYear[ day ][ k[1] ] = animalsByDayOfYear[ day ][ k[1] ].concat(	d.local	);
					} else if (motusData["animalsBy"+firstToUpper(dataType)] && typeof motusData["animalsBy"+firstToUpper(dataType)].get( k[0] ) !== 'undefined') {
						animalsByDayOfYear[ day ][ k[1] ] = animalsByDayOfYear[ day ][ k[1] ].concat(
							d.local.filter( x => typeof motusData["animalsBy"+firstToUpper(dataType)].get( k[0] ).get( x ) !== 'undefined' && motusData["animalsBy"+firstToUpper(dataType)].get( k[0] ).get( x ).length > 0 )
						);
					} else if (dataType == 'stations') {
						animalsByDayOfYear[ day ][ k[1] ] = animalsByDayOfYear[ day ][ k[1] ].concat(
							d.local
						);
					}


				});

				animalsByDayOfYear[day].local = animalsByDayOfYear[day].local.concat(d.local);

				animalsByDayOfYear[day].remote = animalsByDayOfYear[day].remote.concat(d.remote);
				animalsByDayOfYear[day].visiting = ['animals', 'species'].includes(dataType) ? [] : animalsByDayOfYear[day].visiting.concat(d.visiting);
				animalsByDayOfYear[day].total = animalsByDayOfYear[day].total.concat(animalsToday);

			}
		});

		animalsByDayOfYear = animalsByDayOfYear.map(function(d){

			for (k in d) {

				if (k != "Julian date") d[k] = d[k];//.filter(onlyUnique);//.length;

			}

			return d;
		});

		animalsByDayOfYear = animalsByDayOfYear.flat();

		animalsByDayOfYear.columns = Object.keys(animalsByDayOfYear[0])
		animalsByDayOfYear.columns.splice( animalsByDayOfYear.columns.indexOf('total'), 1 );
		animalsByDayOfYear.columns.splice( animalsByDayOfYear.columns.indexOf('local'), 1 );
		animalsByDayOfYear.columns.splice( animalsByDayOfYear.columns.indexOf('remote'), 1 );

		if (['animals', 'species'].includes(dataType)) {
			animalsByDayOfYear.columns.splice( animalsByDayOfYear.columns.indexOf('visiting'), 1 );
		}

		motusMap.colourScale = d3.scaleOrdinal().domain( ['visiting'].concat( motusFilter[dataType].map(x => motusData.selectionNames[ x ] ) ) ).range( ["#000000"].concat( customColourScale.jnnnnn.slice(0, motusFilter[dataType].length + 1) ) );

		var radialChartConstruct = d3.radialBarChart().colourScale( motusMap.colourScale ).dateFormat('MMM');

		$("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline svg.hourly-timeline").hide();
				$("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline").parent().show();

		console.log(animalsByDayOfYear);

		var radialChart = d3.select(".explore-card-" + cardID + "-timeline svg.monthly-timeline")
			.datum(animalsByDayOfYear).call(radialChartConstruct);

	}
	$("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline svg").hide();
	$("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline").parent().show();
	$("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline svg.monthly-timeline").show();
}

function animalHourlyTimeline( cardID ) {

console.log("Hourly");
		/*

		I need to create a toggle, or decide on one of the following:
			1. Show unique animals per month/hour
			2. Show unique species per month/hour


		This plot displays three categories of detections:
			1. Local detections: Animals tagged AND detected in the same region
			2. Remote detections: Animals tagged in the region and detected elsewhere
			3. Visitor detections: Animals tagged elsewhere and detected within the region

		*/

		$("#explore_card_" + cardID + " > div:not(.explore-card-header)").hide();

		if ($(".explore-card-" + cardID + "-timeline").length == 0) {

			$("#explore_card_" + cardID + "")
				.append( $("<div class='explore-card-chart-wrapper'><div class='explore-card-" + cardID + "-timeline'></div></div>") )
		}
		if ($(".explore-card-" + cardID + "-timeline svg.hourly-timeline").length == 0) {

			$(".explore-card-" + cardID + "-timeline").append("<svg class='hourly-timeline'></svg>");

			timelineAxisVals = [];

			motusData.tagHits = {};

			//timeRange = {};

			var animalsByHourOfDay = [];

			const group_by = 'hour';
			const gSize = 24;	// size of hour groups

			for (var i=0; i < gSize; i++) {

				animalsByHourOfDay[ i ] = { "Hour": i, visiting: [], local: [], remote: [], total: [] };

				Object.values(motusData.selectionNames).forEach(function(d) {animalsByHourOfDay[ i ][ d ] = [];});
			}

			motusData.animalsByHourOfDay.forEach( function(d, i) {

				if (d.local.length > 0 || d.remote.length > 0 || d.visiting.length > 0) {

					var animalsToday = d.local;

					if (!['animals', 'species'].includes(dataType)) {
						animalsToday = animalsToday.concat(d.visiting);
					}

					Object.entries(motusData.selectionNames).forEach(function(k) {
						if  (dataType == 'animals' || dataType == 'species') {
							animalsByHourOfDay[ i ][ k[1] ] = animalsByHourOfDay[ i ][ k[1] ].concat(	d.local	);
						} else if (motusData["animalsBy"+firstToUpper(dataType)] && typeof motusData["animalsBy"+firstToUpper(dataType)].get( k[0] ) !== 'undefined') {
							animalsByHourOfDay[ i ][ k[1] ] = animalsByHourOfDay[ i ][ k[1] ].concat(
								d.local.filter( x => typeof motusData["animalsBy"+firstToUpper(dataType)].get( k[0] ).get( x ) !== 'undefined' && motusData["animalsBy"+firstToUpper(dataType)].get( k[0] ).get( x ).length > 0 )
							);
						} else if (dataType == 'stations') {
							animalsByHourOfDay[ i ][ k[1] ] = animalsByHourOfDay[ i ][ k[1] ].concat(
								d.local
							);
						}


					});
					animalsByHourOfDay[i].local = animalsByHourOfDay[i].local.concat(d.local);

					animalsByHourOfDay[i].remote = animalsByHourOfDay[i].remote.concat(d.remote);
					animalsByHourOfDay[i].visiting = animalsByHourOfDay[i].visiting.concat(d.visiting);
					animalsByHourOfDay[i].visiting = ['animals', 'species'].includes(dataType) ? [] : animalsByHourOfDay[i].visiting.concat(d.visiting);
					animalsByHourOfDay[i].total = animalsByHourOfDay[i].total.concat(animalsToday);

				}
			});

			animalsByHourOfDay = animalsByHourOfDay.map(function(d){

				for (k in d) {

					if (k != "Hour") d[k] = d[k];//.filter(onlyUnique);//.length;



				}

				return d;
			});

			animalsByHourOfDay = animalsByHourOfDay.flat();

			animalsByHourOfDay.columns = Object.keys(animalsByHourOfDay[0])
			animalsByHourOfDay.columns.splice( animalsByHourOfDay.columns.indexOf('total'), 1 );
			animalsByHourOfDay.columns.splice( animalsByHourOfDay.columns.indexOf('local'), 1 );
			animalsByHourOfDay.columns.splice( animalsByHourOfDay.columns.indexOf('remote'), 1 );
			if (['animals', 'species'].includes(dataType)) {
				animalsByHourOfDay.columns.splice( animalsByHourOfDay.columns.indexOf('visiting'), 1 );
			}


			motusMap.colourScale = d3.scaleOrdinal().domain( ['visiting'].concat( motusFilter[dataType].map(x => motusData.selectionNames[ x ] ) ) ).range( ["#000000"].concat( customColourScale.jnnnnn.slice(0, motusFilter[dataType].length + 1) ) );

			var radialChartConstruct = d3.radialBarChart().colourScale( motusMap.colourScale ).dateFormat('H');

			$("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline svg.monthly-timeline").hide();
					$("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline").parent().show();

			console.log(animalsByHourOfDay);

			var radialChart = d3.select(".explore-card-" + cardID + "-timeline svg.hourly-timeline")
				.datum(animalsByHourOfDay).call(radialChartConstruct);

		}

		$("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline svg").hide();
		$("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline").parent().show();
		$("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline svg.hourly-timeline").show();
	}




function speciesTable( cardID ) {

	console.log("Species table: " + cardID);

	$("#explore_card_" + cardID + " > div:not(.explore-card-header)").hide();

	if ($('.explore-card-' + cardID + '-speciesTable').length == 0) {

		//$("#explore_card_stationHits .explore-card-header").text("Stations in th" + ( motusFilter.regions.length > 1 ? "ese" : "is") + " region" + ( motusFilter.regions.length > 1 ? "s" : ""));

		var headers = ["", "Species", "Number of animals", "Stations Visited"];

		$("#explore_card_" + cardID)
			.append( $("<table></table>")
				.attr("class", "explore-card-" + cardID + "-speciesTable")
				.append( $('<thead></thead>')
					.append( $('<tr></tr>')	)
				)
				.append( $('<tbody></tbody>') )
			)

		headers.forEach( x => $("#explore_card_" + cardID + " .explore-card-" + cardID + "-speciesTable thead tr").append( $('<th></th>').text(x) ) );


		var color_dataType = 'regions' == dataType ? 'country' : 'project';

		getAnimalsTableData();

		getSpeciesTableData();


		var tableDom = motusData.speciesTableData.length > 10 ? "Bitp" : "Bt";

		$("#explore_card_" + cardID + " .explore-card-" + cardID + "-speciesTable").DataTable({
			data: motusData.speciesTableData,
			columns: [
				{className: "explore-table-expandRow", data: null, orderable: false, defaultContent: icons.add+icons.addFilter},
				{data: "name", title: "Species", "createdCell": function(td, cdata, rdata){
					$(td).html(
						rdata[color_dataType].map(
							(d, i) =>
								`<div class='explore-card-table-legend-icon table_tips' style='border-color:${motusData.tableColourScale( d )};background-color:${motusData.tableColourScale( d )}'>`+
									`<div class='tip_text'>${firstToUpper(color_dataType)}: ${rdata.colourName[i]}</div>`+
								`</div>`
							).join('') +
						`<a href='javascript:void(0);' class='tips' alt='View species profile' onclick='viewProfile("species", [${rdata.species}]);'>${rdata.name}</a>`
					);
				}},
				{data: "nAnimals", title: "Animals detected"},
				{data: "nStations", title: "Stations visited"},
				{data: "sort", visible: false, orderable: true}
			],
			dom: tableDom,
			buttons: [
				'copyHtml5',
				'excelHtml5',
				'csvHtml5',
				'pdfHtml5'
			],
			autoWidth: false,
			columnDefs: [ {
				"targets": 0,
				"orderable": false
			}],
			order: [[4, 'asc']]
		});

		initiateTooltip("#explore_card_" + cardID + " .explore-card-" + cardID + "-speciesTable");

		$(`#explore_card_${cardID} .explore-card-${cardID}-speciesTable tbody`).on('click', `td.explore-table-expandRow .add_icon`, function(){

			var tr = $(this).closest('tr');
			var row = $(this).closest('table').DataTable().row( tr );

			if ( row.child.isShown() ) {
				// This row is already open - close it
				row.child.hide();
				tr.removeClass('shown');
			} else if (typeof row.child() !== 'undefined') {
				// Open this row
				row.child.show();
				tr.addClass('shown');
			} else {
				// Create and open this row
				var newRow = row.child( `<div class='explore-species-table-animals'><table><thead><tr></tr></thead><tbody></tbody></table></div>` ).show();

				getAnimalsTableData();

				tableDom = motusData.animalsTableData.filter( d => d.species == row.data().species ).length > 10 ? "Bitp" : "t";

				row.child().find('.explore-species-table-animals table').DataTable({
					data: motusData.animalsTableData.filter( d => d.species == row.data().species ),
					columns: [
						{data: "name", title: "Animal", "createdCell": function(td, cdata, rdata){
							$(td).html(
													`<div class='explore-card-table-legend-icon table_tips' style='border-color:${motusData.tableColourScale(rdata[color_dataType])};background-color:${motusData.tableColourScale(rdata[color_dataType])}'><div class='tip_text'>${firstToUpper(color_dataType)}: ${['project','country'].includes(color_dataType)?rdata[color_dataType + "Name"]:rdata[color_dataType]}</div></div>`+
													`<a href='javascript:void(0);' class='tips' alt='View animal profile' onclick='viewProfile("animals", [${rdata.id}]);'>${rdata.name} #${rdata.id}</a>`
												);
						}},
						{data: "dtStart", title: "Release date"},
						{data: "dtEnd", title: "Status"},
						{data: "nStations", title: "Stations visited"},
						{data: "nDays", title: "Days detected"},
						{data: "projectName", title: "Project", "createdCell": function(td, cdata, rdata){
							$(td).html(
								`<a href='javascript:void(0);' onclick='viewProfile("projects", [${rdata.project}]);'>${rdata.projectName}</a>`
							);
						}}
					],
					dom: tableDom,
					buttons: [
						'copyHtml5',
						'excelHtml5',
						'csvHtml5',
						'pdfHtml5'
					],
					autoWidth: false
				});

				initiateTooltip(row.child());

				tr.addClass('shown');
			}

		});


	} else {

		$("#explore_card_" + cardID + " .explore-card-" + cardID + "-speciesTable").parent().show();

	}
}


function animalsTable( cardID ) {

	console.log("Animals table: " + cardID);

	$("#explore_card_" + cardID + " > div:not(.explore-card-header)").hide();

	if ($('.explore-card-' + cardID + '-animalsTable').length == 0) {

		//$("#explore_card_stationHits .explore-card-header").text("Stations in th" + ( motusFilter.regions.length > 1 ? "ese" : "is") + " region" + ( motusFilter.regions.length > 1 ? "s" : ""));

		var headers = ["Deployment ID", "Species", "Stations Visited", "Days detected", "Tagging date", "Status", "Project"];

		$("#explore_card_" + cardID)
			.append( $("<table></table>")
				.attr("class", "explore-card-" + cardID + "-animalsTable")
				.append( $('<thead></thead>')
					.append( $('<tr></tr>')	)
				)
				.append( $('<tbody></tbody>') )
			)

		headers.forEach( x => $("#explore_card_" + cardID + " .explore-card-" + cardID + "-animalsTable thead tr").append( $('<th></th>').text(x) ) );


		var color_dataType = 'regions' == dataType ? 'country' : 'project';

		getAnimalsTableData();//3

		var tableDom = motusData.animalsTableData.length > 10 ? "Blipt" : "Bt";

		$("#explore_card_" + cardID + " .explore-card-" + cardID + "-animalsTable").DataTable({
			data: motusData.animalsTableData,
			columns: [
				{data: "id", title: "Deployment ID", "createdCell": function(td, cdata, rdata){
					$(td).html(
											`<a href='javascript:void(0);' class='tips' alt='View animal profile' onclick='viewProfile("animals", [${rdata.id}]);'>#${rdata.id}</a>`
										);
				}},
				{data: "name", title: "Species", "createdCell": function(td, cdata, rdata){
					$(td).html(
							`<div class='explore-card-table-legend-icon table_tips' style='border-color:${rdata.colourCode};background-color:${rdata.colourCode}'>`+
									`<div class='tip_text'>${firstToUpper(color_dataType)}: ${rdata.colourName}</div>`+
								`</div>`+
						`<a href='javascript:void(0);' class='tips' alt='View species profile' onclick='viewProfile("species", [${rdata.species}]);'>${cdata}</a>`
					);
				}},
				{data: "nStations", title: "Stations visited"},
				{data: "nDays", title: "Days detected"},
				{data: "dtStart", title: "Tagging date"},
				{data: "dtEnd", title: "Status"},
				{data: "projectName", title: "Project","createdCell": function(td, cdata, rdata){
					$(td).html(
						`<a href='javascript:void(0);' class='tips' alt='View species profile' onclick='viewProfile("species", [${rdata.project}]);'>${cdata}</a>`
					);
				}},
				{data: "sort", visible: false, orderable: true}
			],
			dom: tableDom,
			buttons: [
				'copyHtml5',
				'excelHtml5',
				'csvHtml5',
				'pdfHtml5'
			],
			autoWidth: false,
			columnDefs: [ {
				"targets": 0,
				"orderable": false
			}],
			order: [[4, 'asc']]
		});

		initiateTooltip("#explore_card_" + cardID + " .explore-card-" + cardID + "-animalsTable");

	} else {

		$("#explore_card_" + cardID + " .explore-card-" + cardID + "-animalsTable").parent().show();

	}
}

function getGroupedExploreProfileData( g, profileIDs = [] ) {
	var gProfiles = motusData.profiles.filter( d => profileIDs.length == 0 || profileIDs.includes( d.id ) );
	var groupProfile = {id: g.id, name: g.name, description: "", photo: "", shortDescription: ""};
	var val,i;


	for (const k in gProfiles[0] ) {
		if (k == 'dtStart') {
			val = d3.min(gProfiles, d => d[k]);
		} else if (k == 'dtEnd') {
			val = d3.max(gProfiles, d => d[k]);
		} else if (k == 'lastActivity' || k == 'lastDetection' || k == 'lastStationDeployment' || k == 'lastTagDeployment') {
			// Needed for 'lastActivityType' to be selected correctly
			const k_alt = k=='lastActivityType'?'lastActivity':k;
			console.log(k_alt);
			i = d3.maxIndex(gProfiles, d => typeof d[k_alt] === 'undefined' ? 0 : d[k_alt].dtEnd);
			val = gProfiles[i][k];
		} else if (k == 'summary') {
			// Sums values for each property
			val = gProfiles.reduce((a,c,i) => {
					for (key in a) {
						a[key] = a[key].concat(c.summary[key]);
					}
					return a;
				}, Object.fromEntries(Object.keys(gProfiles[0].summary).map( d => [d, [ ]] ))
			)

			val = Object.fromEntries(Object.entries(val).map( d => [d[0], [...new Set(d[1].filter( x => x!="NA"))].length]));
		} else if (k == 'stats') {
			// Sums values for each property
			val = gProfiles.reduce((a,c,i) => {
					for (key in a) {
						a[key] = a[key].concat(c.stats[key]);
					}
					return a;
				}, Object.fromEntries(Object.keys(gProfiles[0].stats).map( d => [d, [ ]] ))
			)

				val = Object.fromEntries(Object.entries(val).map( d => [d[0], [...new Set(d[1].filter( x => x!="NA"))].length]));
			/*
			profile.stats = {
				animalsTagged: animalsTagged.length,
				speciesTagged: speciesTagged.length,
				animalsDetected: stations.length > 0 ? animalsDetected.length : 0,
				speciesDetected: stations.length > 0 ? speciesDetected.length : 0,
				stations: stations.length,
				countries: Array.from(stations.map(x => x.country).values()).concat(Array.from(motusData.selectedAnimals.map(x => x.country).values())).filter(onlyUnique).length,
				detections: d3.sum(detections.map( x=> x.dtEndList.length ))
			}
			*/
		} else {
			val = false;
		}
		//	console.log("keys: %o, k: %s, val: %o", Object.keys(gProfiles[0]), k, val);

		if (val !== false) {
			groupProfile[k] = val;
		}
	}

	motusData.groups.push(groupProfile);

	addExploreProfile(groupProfile);
}
function getExploreProfileData(d) {

		var profile = {
			id: d.id,
			name: d.name
		}
	//	console.log("Profile %s: %s", profile.id, profile.name);

//		console.log(d);

		if (dataType == 'stations') {
			var station = d;

			// Some stations are shared among multiple projects. Select just the first project here.
			station.projID = station.projID.split(',')[0];

			var stationDeps = motusData.selectedStationDeps.filter( x => d.stationDeps.includes(x.id) );
					stationDeps.forEach( x => {x.dtStart = new Date(x.dtStart)});

			var detections = [];
			if (typeof motusData.tracksByStation[ d.id ] !== 'undefined')
				detections = motusData.tracksByStation[ d.id ].map( x => motusData.selectedTracks[x] );


			var animalsDetected = motusData.selectedAnimals.filter( x => d.animals.includes(x.id) );
			var speciesDetected = d.species.filter(onlyUnique);
			var project = motusData.projects.filter(x => x.id == d.projID)[0];

			console.log("detections for %s: %o", d.id, detections)

			// Latest activity

			var lastDataProcessed = d.dtEnd;

			// Why is this so complicated? Because we have nested data within each 'detection'
			// Each detection is actually a track segment with a list of events within it.
			// Further, route ID contains the two receiver IDs which make the connection, with the smaller number first
			// This way I can group tracks in either direction together. However,
			// This also means I must pay attention to the direction when looking
			// At the dates since whether I use the start or end dates will depend on the direction.
			// The function below loops through each event and selects either the start or end dates based on
			// the direction and which receiver ID matches.
			var lastDetectionSubIndex = [];
			var dtMax = [];
			var lastDetectedAnimal = [];

			var lastDetectionIndex = detections.length > 0 ? d3.maxIndex( detections, (x) => {
					const dir = x.dir;
					const recvs = x.route.split('.');
					const maxDate = dir.reduce( (a, dir, i) => {
							if ((dir == -1 && recvs[0] == d.id) ||
									(dir == 1 && recvs[1] == d.id)) {
								a.push(x.dtEndList[i]);
							}
							else if ((dir == 1 && recvs[0] == d.id) ||
											 (dir == -1 && recvs[1] == d.id)) {
								a.push(x.dtStartList[i])
							}
							return a;
						}, []);
					const maxIndex = d3.maxIndex( maxDate, d => new Date(d) )
					dtMax.push( new Date( maxDate[maxIndex] ) );

					lastDetectedAnimal.push( motusData.animals.filter( k => k.id == x.animal[maxIndex] )[0] );
					lastDetectionSubIndex.push( maxIndex );
					return new Date( maxDate[maxIndex] );
				} ) : false;
			var lastDetection = detections.length > 0 ? detections[lastDetectionIndex] : false;

			//console.log("lastDetection: %o, lastDetectionIndex: %s, lastDetectionSubIndex: %s, dtMax: %s", lastDetection, lastDetectionIndex, lastDetectionSubIndex, dtMax);

			if (lastDetection) {
						lastDetectionSubIndex = lastDetectionSubIndex[lastDetectionIndex];
			//			console.log(lastDetectionSubIndex);
			//			console.log(lastDetectedAnimal);
						lastDetection.lastDetectedAnimal = [lastDetectedAnimal[lastDetectionIndex]];
						lastDetection.dtMax = dtMax[lastDetectionIndex].toISOString().substring(0, 10);

/*

				var lastDetectionIndex = [];

				lastDetection.lastDetectedAnimal = [];
				lastDetection.dir.split(',').forEach( (dir, i) => {
					const recvs = lastDetection.route.split('.');
						if (((dir == -1 && recvs[0] == d.id) ||
								(dir == 1 && recvs[1] == d.id)) &&
								lastDetection.dtEndList.split(',')[i] == dtMax) {

							lastDetection.lastDetectedAnimal.push( motusData.animals.filter( k => k.id == lastDetection.animals.split(',')[i] )[0] );
							lastDetectionIndex.push(i);
						} else if (((dir == 1 && recvs[0] == d.id) ||
										 (dir == -1 && recvs[1] == d.id)) &&
			 								lastDetection.dtStartList.split(',')[i] == dtMax) {

							lastDetection.lastDetectedAnimal.push( motusData.animals.filter( k => k.id == lastDetection.animals.split(',')[i] )[0] );
							lastDetectionIndex.push(i);

						}
				});
*/
				//lastDetection.lastDetectionIndex = lastDetectionIndex;

			}
			var lastStationDeployment = stationDeps.length > 1 ? stationDeps[d3.maxIndex( stationDeps, x => x.dtStart )] : stationDeps[0];
			var lastActivityIndex = d3.maxIndex([lastStationDeployment?lastStationDeployment.dtStart:-1, lastDetection?lastDetection.dtEnd:-1]);


		} else if (["regions", "projects"].includes(dataType)){

			var dataVar = dataType == "projects" ? "projID" : "country";


			//	Deployments


			var stations = motusData.selectedStations.filter( x => x[dataVar] == d.id);

			var	animalsTagged = motusData.selectedAnimals.filter( x => x[dataVar] == d.id);

			animalsTagged.forEach(x=>{x.dtStart = new Date(x.dtStart); x.dtEnd = new Date(x.dtEnd);});

			var	speciesTagged = animalsTagged.map( (x) => x.species ).filter( onlyUnique );

			// 	Detections

			var	animalsDetected = stations.length > 0 ?
															stations.map( x => x.animals ).flat().filter(onlyUnique) :
															[];

			var	speciesDetected = stations.length > 0 ?
															stations.map( x => x.species ).flat().filter(onlyUnique) :
															[];
			// Station detections
			var tracksByStations = stations.map( (x) => motusData.tracksByStation[ x.id ] ).flat().filter(onlyUnique);

			var detections = Object.values( motusData.selectedTracks ).filter( x => tracksByStations.includes( x.route ) );
			// Tag detections
//			var detections = Object.values( motusData.selectedTracks ).filter( x => x.projID.includes( d.id ) );
			var tracksByAnimals = animalsTagged.map( (x) => motusData.tracksByAnimal[ x.id ] ).flat().filter(onlyUnique);

			var animalDetections = Object.values( motusData.selectedTracks ).filter( x => tracksByAnimals.includes( x.route ) );

			console.log(d);

			// Last activity

			var lastActiveTag = animalsTagged.length > 0 ? d3.max( animalsTagged, x => x.dtEnd ) : false;
			var lastActiveStation = stations.length > 0 ? d3.max( stations, x => x.dtEnd ) : false;
		//	var lastDetection = detections.length > 0 ? detections[d3.maxIndex( detections, x => x.dtEnd )] : false;

			//							getLastDetection(detections, matchID = [], matchType = 'stations', getIndex = false)
			if (detections.length > 0) {

				if (dataType == 'projects') {

					//var lastDetections = detections.map(x => getLastDetection(x, d.id, matchType = 'projects', getIndex = false));
					//	console.log(lastDetections);

					var lastDetection = detections.length > 0 ? detections[d3.maxIndex( detections,
										x => getLastDetection(x, d.id, {matchType: 'projects', getIndex: false})
									)] : false;

					var [lastDetectionDir, lastDetectionIndex] = lastDetection ? getLastDetection(lastDetection, d.id, {matchType: 'projects', getIndex: true, getDirection: true}) : false;

					var dtMax = lastDetectionIndex ? lastDetection[lastDetectionDir[lastDetectionIndex]==1?'dtEndList':'dtStartList'][lastDetectionIndex] : false;

				} else if (dataType == 'regions') {
					var lastDetection = detections.length > 0 ? detections[d3.maxIndex( detections,
										x => getLastDetection(x, d.id, {matchType: 'stations', getIndex: false})
									)] : false;

					var dtMax = detections.length > 0 ? d3.max( detections,
										x => getLastDetection(x, d.id, {matchType: 'stations', getIndex: false})
									) : false;
				}
				dtMax = dtMax ? new Date(dtMax).toISOString().substring(0, 10) : false;

				if (lastDetection) {

					var lastDetectionIndex = [];

					lastDetection.lastDetectedAnimal = [];
					lastDetection.dir.forEach( (dir, i) => {
						const recvProjs = lastDetection.recvProjs;
							if (((dir == -1 && recvProjs[0] == d.id) ||
									(dir == 1 && recvProjs[1] == d.id)) &&
									lastDetection.dtEndList[i] == dtMax) {

								lastDetection.lastDetectedAnimal.push( motusData.animals.filter( k => k.id == lastDetection.animal[i] )[0] );
								lastDetectionIndex.push(i);
							} else if (((dir == 1 && recvProjs[0] == d.id) ||
												 (dir == -1 && recvProjs[1] == d.id)) &&
				 								lastDetection.dtStartList[i] == dtMax) {

								lastDetection.lastDetectedAnimal.push( motusData.animals.filter( k => k.id == lastDetection.animal[i] )[0] );
								lastDetectionIndex.push(i);

							}
					});

	/*				detections.forEach(	x => {
						var detectionData = getLastDetection(x, d.id, {matchType: 'projects', dtMax: dtMax, getIndex: true, getLastAnimal: true});
					//	console.log(detectionData)
						lastDetectionIndex.push( detectionData[0] )
						lastDetection.lastDetectedAnimal.push( motusData.animals.filter( a => detectionData[1].includes(a.id) )[0] )
					});*/

					lastDetection.lastDetectedAnimal.forEach( x => {
						const sp = motusData.species.filter( spp => spp.id == x.species )[0]
						x.species = typeof sp === 'undefined' ? 'Unknown Species:' + x.species : sp[currLang];
					});

					const lastDetectionStation = lastDetection.recvProjs[1] == d.id && (lastDetection.recvProjs[0] != d.id || lastDetection.dir[lastDetectionIndex[0]] == 1) ? lastDetection.recv2 : lastDetection.recv1;
					lastDetection.lastDetectionIndex = lastDetectionIndex;
					lastDetection.lastDetectionStation = motusData.selectedStations.filter(x => {
						return x.stationDeps.includes(lastDetectionStation);
					})[0];

				}
				var lastTagDeployment = animalsDetected.length > 0 ? animalsTagged[d3.maxIndex( animalsTagged, x => x.dtStart )] : false;
				if (lastTagDeployment) {
					var sp = motusData.species.filter( spp => spp.id == lastTagDeployment.species )[0];
					lastTagDeployment.species = typeof sp === 'undefined' ? 'Unknown Species:' + lastTagDeployment.species : sp[currLang];
	//				lastTagDeployment.species = motusData.species.filter( spp => spp.id == lastTagDeployment.species )[0][currLang];
				}

				var lastStationDeployment = stations.length > 0 ? stations[d3.maxIndex( stations, x => x.dtStart )] : false;
				if (lastStationDeployment) {
					lastStationDeployment.status = lastStationDeployment.status == 'not active' ? 'inactive' : lastStationDeployment.status;
				}
				var lastActivityIndex = d3.maxIndex([lastTagDeployment?lastTagDeployment.dtStart:-1, lastStationDeployment?lastStationDeployment.dtStart:-1, lastDetection?lastDetection.dtEnd:-1]);
			}
		} else {


			var stations = motusData.selectedStations.filter( (x) => x[dataType].includes(d.id) );

			if (dataType == 'animals'){

				var detections = Object.values( motusData.selectedTracks ).filter( (x) => x.animal.includes(d.id) );

				var animals = motusData.selectedAnimals.filter( x => x.id == d.id)[0];

				var species = motusData.species.filter( x => x.id == animals.species)[0];
				var project = motusData.projects.filter(x => x.id == d.projID)[0];

		 } else { // dataType == 'species'

				var detections = Object.values( motusData.selectedTracks ).filter( (x) => x[dataType].includes(d.id) );

				var species = motusData.species.filter( x => x.id == d.id)[0];
				var animals = species.animals;
				animals = typeof animals === 'string' ? animals.split(',') : animals;

		 }
	 }

	  if (dataType == 'stations') {
			profile.summary = {
				animalsDetected: animalsDetected,
				speciesDetected: speciesDetected,
				projects: animalsDetected.map(x => x.projID).filter(onlyUnique),
				countries: animalsDetected.map(x => x.country).filter(onlyUnique),
				detections: detections
			}

			profile.coordinates = d.geometry.coordinates;
			profile.frequency= d.frequency;
			profile.project = project;

			profile.status = d.status=='not active'?'inactive':d.status;

			profile.lastData = d.lastData;
			profile.lastStationDeployment = lastStationDeployment;
			profile.lastDetection = lastDetection;
			profile.lastActivity = [lastStationDeployment, lastDetection][lastActivityIndex];
			profile.lastActivityType = ["Station deployed", "Tag detected"][lastActivityIndex];

			profile.dtStart = d.dtStart;
			profile.dtEnd = d.dtEnd;

		} else if (dataType == 'regions') {

			profile.summary = {
				animalsTagged: animalsTagged.length,
				speciesTagged: speciesTagged.length,
				animalsDetected: motusData.selectedStationDeps.length > 0 ? animalsDetected.length : 0,
				speciesDetected: motusData.selectedStationDeps.length > 0 ? speciesDetected.length : 0,
				projects: Array.from(stations.map(x => x.projID).values()).concat(Array.from(animalsTagged.map(x => x.projID).values())).filter(onlyUnique).length,
				stations: stations.length,
				detections: detections
			}

			//	lastData: [Math.round( subset[subset.length-1].lastData )],
		} else if (dataType == 'projects')  {
			console.log(d.dtCreated);

			profile.subtitle = {text:`Created on ${new Date(d.dtCreated).toISOString().substring(0, 10)}`, link: false};

			profile.leadUserId = d.lead_user_id;
			profile.group = {name: d.fee_id, id: d.fee_id};
			profile.lastTagDeployment = lastTagDeployment;
			profile.lastStationDeployment = lastStationDeployment;
			profile.lastDetection = lastDetection;
			profile.lastActivity = [lastTagDeployment, lastStationDeployment, lastDetection][lastActivityIndex];
			profile.lastActivityType = ["Animal tagged", "Station deployed", "Tag detected"][lastActivityIndex];
			profile.status = (new Date() - profile.lastActivity) < (7 * 24 * 60 * 60 * 1000) ? "Active" : "Inactive";
		//	console.log(d3.max(stations, x => x.dtEnd))
			profile.status = profile.status == "Inactive" && (new Date() - d3.max(stations, x => x.dtEnd)) > (7 * 24 * 60 * 60 * 1000) ? "Inactive" : "Active";
			profile.shortDescription = typeof d.shortDescription === "undefined" ? "" : d.shortDescription;
			profile.description = typeof d.description === "undefined" ? "" : d.description;

			profile.dtStart = new Date(d.dtCreated).toISOString().substring(0, 10);
			profile.dtEnd = profile.lastActivity ? profile.lastActivity.dtEnd : false;

			if (isGrouped) {

				profile.summary = {
					animalsTagged: animalsTagged,
					speciesTagged: speciesTagged,
					animalsDetected: stations.length > 0 ? animalsDetected : [],
					speciesDetected: stations.length > 0 ? speciesDetected : [],
					stations: stations
				}

				profile.stats = {
					animalsTagged: animalsTagged,
					speciesTagged: speciesTagged,
					animalsDetected: stations.length > 0 ? animalsDetected : [],
					speciesDetected: stations.length > 0 ? speciesDetected : [],
					stations: stations,
					countries: Array.from(stations.map(x => x.country).values()).concat(Array.from(motusData.selectedAnimals.map(x => x.country).values())).filter(onlyUnique),
					detections: detections
				}
			} else {

				profile.summary = {
					animalsTagged: animalsTagged.length,
					speciesTagged: speciesTagged.length,
					animalsDetected: stations.length > 0 ? animalsDetected.length : 0,
					speciesDetected: stations.length > 0 ? speciesDetected.length : 0,
					stations: stations.length
				}

				profile.stats = {
					animalsTagged: animalsTagged.length,
					speciesTagged: speciesTagged.length,
					animalsDetected: stations.length > 0 ? animalsDetected.length : 0,
					speciesDetected: stations.length > 0 ? speciesDetected.length : 0,
					stations: stations.length,
					countries: Array.from(stations.map(x => x.country).values()).concat(Array.from(motusData.selectedAnimals.map(x => x.country).values())).filter(onlyUnique).length,
					detections: d3.sum(detections.map( x=> x.dtEndList.length ))
				}
			}

		} else if (dataType == 'species') {

			profile.subtitle = {text:species.scientific, link: false};
			profile.description = devText;
	/*
			profile.inaturalist = `https://www.inaturalist.org/taxa/${encodeURIComponent(species.scientific)}`;
			profile.iucnRedList = `https://apiv3.iucnredlist.org/api/v3/website/${encodeURIComponent(species.scientific)}`;
			profile.ebird = (motusData.speciesByID.get(d.id)[0].group == 'BIRDS' ? '' : false);
*/
			var conservationStatusRandom = Object.keys(conservationStatus)[Math.round(Math.random()*(Object.keys(conservationStatus).length-5))];

			profile.summary = {
				AnimalsTagged: animals,
				Stations: stations,
				Projects: Array.from(stations.map(x => x.projID).values()).concat(Array.from(motusData.selectedAnimals.map(x => x.projID).values())).filter(onlyUnique),
				Countries: Array.from(stations.map(x => x.country).values()).concat(Array.from(motusData.selectedAnimals.map(x => x.country).values())).filter(onlyUnique),
				Detections: detections,
				"iNaturalist": `<a href="https://www.inaturalist.org/taxa/${encodeURIComponent(species.scientific)}" target="_blank"><img src='images/inaturalist_logo_sm.png' alt='iNaturalist Logo'></a>`,
				"IUCN Red List": `<a href="https://apiv3.iucnredlist.org/api/v3/website/${encodeURIComponent(species.scientific)}" target="_blank" class='explore-status-conservation explore-conservation-${conservationStatusRandom} tips' alt='${conservationStatus[conservationStatusRandom]}'>${conservationStatusRandom}</a>`,
				"eBird": (motusData.species.filter( x => x.id == d.id)[0].group == 'BIRDS' ? `<a href="https://www.allaboutbirds.org/guide/${encodeURIComponent(species.english.replace(' ', '_').replace("'",""))}" target="_blank"><img src='images/eBird_logo.png' alt='eBird Logo'></a>` : false)
			}

			profile.status = motusData.selectedAnimals.filter(x => x.species == d.id).reduce((a,c) => {var status = a;if (c.status=='active') {status='active'}return status;}, "inactive");

		} else { // dataType == 'animals' ?

			var conservationStatusRandom = Object.keys(conservationStatus)[Math.round(Math.random()*(Object.keys(conservationStatus).length-5))];

			profile.subtitle = {text:species.scientific, link: false};
			profile.coordinates = d.geometry.coordinates;
			profile.frequency= d.frequency;
			profile.project = project;
			profile.status = d.status;
			profile.name = species.english;
			profile.description = devText;

			profile.dtStart = d.dtStart;
			profile.dtEnd = d.dtEnd;

			profile.summary = {
				stations: stations,
				projects: Array.from(stations.map(x => x.projID).values()).concat(Array.from(motusData.selectedAnimals.map(x => x.projID).values())).filter(onlyUnique),
				countries: Array.from(stations.map(x => x.country).values()).concat(Array.from(motusData.selectedAnimals.map(x => x.country).values())).filter(onlyUnique),
				detections: detections,
				"iNaturalist": `<a href="https://www.inaturalist.org/taxa/${encodeURIComponent(species.scientific)}" target="_blank"><img src='images/inaturalist_logo_sm.png' alt='iNaturalist Logo'></a>`,
				"IUCN Red List": `<a href="https://apiv3.iucnredlist.org/api/v3/website/${encodeURIComponent(species.scientific)}" target="_blank" class='explore-status-conservation explore-conservation-${conservationStatusRandom} tips' alt='${conservationStatus[conservationStatusRandom]}'>${conservationStatusRandom}</a>`,
				"eBird": (motusData.species.filter( x => x.id == d.species)[0].group == 'BIRDS' ? `<a href="https://www.allaboutbirds.org/guide/${encodeURIComponent(species.english.replace(' ', '_').replace("'",""))}" target="_blank"><img src='images/eBird_logo.png' alt='eBird Logo'></a>` : false)
			}

		}

		if (!exploreProfile_hasLoaded) {

			console.log(profile);

			profile.photo = dataType == 'species' || dataType == 'animals' ?
										"photos/species/" + ( speciesPhotos.filter( x => x.includes(species.english.toLowerCase()) ).length > 0 ? speciesPhotos.filter( x => x.includes(species.english.toLowerCase()) )[0] : speciesPhotos[Math.round(Math.random()*(speciesPhotos.length-1))] ) :
									dataType == 'stations' ?
										"photos/stations/" + ( stationPhotos.filter( x => x.includes(station.name.toLowerCase()) ).length > 0 ? stationPhotos.filter( x => x.includes(station.name.toLowerCase()) )[0] : stationPhotos[Math.round(Math.random()*(stationPhotos.length-1))] ) :
//										"photos/stations/" + (stationPhotos[Math.round(Math.random()*(stationPhotos.length-1))]) :
									"";


			if (isGrouped) {
				motusData.profiles.push(profile);
			} else {
				addExploreProfile(profile);
			}
		}

}

function addExploreTabs() {

	if (dataType != 'stations' || motusFilter.selections.length > 1) {

	var tabName = dataType != 'stations' ? ("Stations " +
			(
				dataType != 'species' && dataType != 'animals' ? 'in this ' + dataType.substring(0, dataType.length - 1) :
				"visited by this " + (dataType != 'species' ? 'animal' : dataType)
			)) : "Station timelines";

	//	Add the card dom element to contain the chart
	addExploreCard({
			data:'tabs',
			type:'stationHits',
			header: 'Stations',
			tabs: {
				[`${tabName}: ` + motusData.selectedStations.length] : stationTable
				//"Station detection timelines": detectionTimeline
			},
			defaultTab: 0,
			attachEl:".explore-card-map",
			attachMethod:"after"
		});

	}
	/**********************************************
										Animals
	**********************************************/


	//	Add the card dom element to contain the chart
	//	addExploreCard({data:'chart', type:'tagHits'});


	if (motusFilter.animals.length > 0) {

	addExploreCard({
			data:'tabs',
			type:'tagHits',
			header: 'Detections',
			tabs: {
			//	"Animals in this region": animalTable,,
				"Detection timeline": animalTimeline,
				"Detections by Hour of Day": animalHourlyTimeline,
				"Detections by Month of Year": animalMontlyTimeline
			},
			defaultTab: 0,
			attachEl: ".explore-card-map",
			attachMethod: "after"
		});

	addExploreCard({
			data:'tabs',
			type:'speciesHits',
			header: 'Animals',
			icon: icons.species,
			tabs: {
				[
					(["animals", "species"].includes(dataType) ? "Species Tagged" : "Species detected") +
					": " + motusData.selectedSpecies.length
				] : speciesTable,
				[
					(["animals", "species"].includes(dataType) ? "Tagged Animals" : "Animals detected") +
					": " + motusData.selectedAnimals.length
				] : animalsTable
			},
			defaultTab: motusData.selectedSpecies.length > 1 ? 0 : 1,
			attachEl: ".explore-card-map",
			attachMethod: "after"
		});
	//	Add the timeline
	//	animalTimeline()

	}

	var nProjects = [
		motusData.selectedStationProjects.length,
		motusData.selectedAnimalProjects.length
	];

	addExploreCard({
		data:'tabs',
		type:'projectsTable',
		header: 'Projects',
		tabs: {
		//	"Animals in this region": animalTable,
			["Projects with stations: " + nProjects[0]]: function(cardID) {projectsTable(cardID, 'stations');},
			["Projects with tag deployments: " + nProjects[1]] : function(cardID) {projectsTable(cardID, 'tags');}
		},
		defaultTab: d3.sum(motusData.selectedProjects, d => d.stations.filter( x => x!='NA').length ) > 0 ? 0 : 1,
		attachEl: ".explore-card-map",
		attachMethod: "after"
	});


}
function addExploreProfilesWrapper() {

	// Grouped profiles have a different header and display multi-profiles differently
	isGrouped = (typeof motusFilter.group !== 'undefined' && motusFilter.group.length > 0);

	//	Add profile container DOM
	$("#exploreContent .explore-card-wrapper")
		.append(`<div class='explore-card${isGrouped?' grouped':''}' id='explore_card_profiles'>`+
							`<div class='explore-card-add explore-card-${dataType}' alt='Add a ${dataType=='species'?dataType:dataType.slice(0,-1)}'>`+
								`<select class='explore-card-add-${dataType}' data-placeholder='Select a ${dataType=='species'?dataType:dataType.slice(0,-1)}'>`+
									`<option></option>`+
								`</select>`+
							`</div>`+
							`<div class='explore-card-profiles-toggles'></div>`+
						`</div>`+
						`<div class='explore-card-profiles-tabs'>`+
							`<div class='explore-card-tab expand-menu-btn'>${icons.expand}</div>`+
						`</div>`);


	$("#exploreContent .explore-card-wrapper .explore-card-add").appendTo(".explore-control-content.explore-control-add");

	// Add explore content toggles
	if (["stations","regions","projects"].includes(dataType)) {

		var toggleText = dataType == "stations" ? `Animals tagged near this ${dataType.slice(0,-1)} only` : `Animals tagged in this ${dataType.slice(0,-1)} only`;

		$("#exploreContent .explore-card-profiles-toggles").append(`<button class='toggleButton'>${toggleText}</button>`);

		$("#exploreContent .explore-card-profiles-toggles .toggleButton").click(function(e){$(this).toggleClass('selected');setFilter.call(this, e);});

	}

	// Add explore content expand button
	$("#exploreContent .explore-card-profiles-tabs .expand-menu-btn").click(function(){$(this).parent().toggleClass('expanded');});

}

function addExploreProfile(profile) {


	if (motusData["selected"+firstToUpper(dataType)].length == 1) {
		document.title = profile.name +
											(dataType == 'animals' ? " #" + profile.id : "") +
											(" Motus " + firstToUpper(dataType!='species'?dataType.slice(0,-1):dataType)) +
											" Summary"
	}

	if ($("#explore_card_profile_" + profile.id).length == 0) {


		// If no profiles exist, creat the necessary wrapper and control elements



		if (typeof profile.dtStart !== 'undefined' && typeof profile.dtEnd !== 'undefined') {
		//	timeline.setSlider([profile.dtStart, profile.dtEnd]);
			motusFilter.dtStart = new Date(profile.dtStart);
			motusFilter.dtEnd = new Date(profile.dtEnd);
		}

		//	Add Explore Profile HTML

		$("#explore_card_profiles")
			.prepend(`<div class='explore-card-profile grid-container' id='explore_card_profile_${profile.id}' data-profile-id='${profile.id}'>`+
								`<div class='explore-card-image tips enlarge' alt='Click to expand'><img src='' alt='Click to expand'/><div class='explore-card-image-bg'></div><div class='explore-card-image-icon'>${icons.camera}</div></div>`+
						//	 	`<div class='explore-card-name'><div style='font-size:${24 - (Math.floor(profile.label.length/15)*2)}pt;'>${profile.label}</div></div>`+
							 	`<div class='explore-card-name'>`+

								(isGrouped ?
									// GROUPED Profiles
										"<div id='explore_card_profile_group'>"+
											`<h3>`+
												`<span style="font-variant: small-caps;color: var(--theme-background-colour-pale2);opacity: 0.75; margin-left: 30px;margin-right: 15px;">`+
													`${firstToUpper(toSingular(dataType))} group</span> <span style='font-size:30pt'>${motusFilter.group}</span></h3>`+
										"</div>"
										// UNGROUPED Profiles
										:
									`<div class='explore-card-name-text'>${profile.name} ${dataType=='animals'?'#'+profile.id:''}`+
										`<div class='explore-profile-subtitle ${(profile.subtitle&&profile.subtitle.link)?'link':''}'>${profile.subtitle?profile.subtitle.text:''}</div>`+
										`<div class='explore-profile-switch'>Switch ${dataType=='species'?dataType:dataType.slice(0,-1)}</div>`+
										(motusFilter.selections.length > 1 ?
											`<div class='btn explore-card-remove remove_btn tips' alt='Remove this ${dataType=="species"?dataType:dataType.slice(0, -1)}'>${icons.remove}</div>`
											: '')+
									`</div>`+
									(typeof profile.status !== 'undefined' ? `<div class='explore-profile-status explore-profile-status-${profile.status.toLowerCase()} tips' alt='${profile.status}'>${profile.status.toLowerCase()}</div>`:'')+
								//	`<div class='btn add_btn explore-card-add tips' alt='Compare with another ${dataType=="species"?dataType:dataType.slice(0, -1)}'>${icons.remove}</div>`+
									"")+
									// END isGROUPED
								`</div>`+
								`<div class='explore-profile-summary-wrapper'>`+
									Object.entries(profile.summary).map( (d,i) => {
										var profileDataType = d[0].replace('Detected', '').replace('Tagged', '').replace('Segments', '').toLowerCase();
										return `<div class='explore-card-profile-data explore-card-data${i + 1}' onclick='showProfileData("${profile.id}", "${d[0]}")'>`+
															`${icons[profileDataType] || ""}`+
															`<div class='explore-profile-data-label'>${d[0].replace('Det', ' Det').replace('Tag', ' Tag').replace('Seg', ' Seg')}</div>`+
															`<div class='explore-profile-data-value ${icons[profileDataType]!=undefined? "" : "colspan2"}'>${typeof d[1] == "object" ? d[1].length :  d[1]}</div>`+
														`</div>`;
									}).join('')+
									(dataType == 'projects' && !isGrouped ?
									`<div class='explore-profile-shortDescription'>${profile.shortDescription}</div>`
									 : "")+
								"</div>"+
								`<div class='explore-profile-info'>`+
									`<div class='expand_btn'> info</div>`+
									`<div class='explore-profile-info-section'><h4>Latest Activity</h4>`+
									(
										profile.lastDetection && profile.lastDetection.lastDetectedAnimal.length > 1 ?
										`<div style='font-size:10pt;'>Tags detected: ${profile.lastDetection.lastDetectedAnimal.length} animals of ${profile.lastDetection.lastDetectedAnimal.map(x=>x.species).filter(onlyUnique).length} species on ${profile.lastDetection.dtEnd.toISOString().substring(0, 10).replace("T", " @ ")}</div>`
											:
										profile.lastDetection && profile.lastDetection.lastDetectedAnimal.length == 1 ?
										`<div style='font-size:10pt;' ${dataType == 'stations' ? '' : "class='colspan2'"}>Tag detected: `+
										`<div class='explore-status-button' onclick='showProfileData("${profile.lastDetection.lastDetectedAnimal[0].id}", "animals")'>${profile.lastDetection.lastDetectedAnimal[0].species} #${profile.lastDetection.lastDetectedAnimal[0].id} `+
										`<div class='explore-status-icon explore-status-icon-${profile.lastDetection.lastDetectedAnimal[0].status.toLowerCase()} tips' alt='${profile.lastDetection.lastDetectedAnimal[0].status}'> </div>`+
										`</div> on <b>${profile.lastDetection.dtEnd.toISOString().substring(0, 10).replace("T", " @ ")}</b>`+
										( dataType == 'stations' ? '' :
											` at <div class='explore-status-button' onclick='showProfileData("${profile.lastDetection.lastDetectionStation.id}", "stations")'>${profile.lastDetection.lastDetectionStation.name} `+
											`<div class='explore-status-icon explore-status-icon-${profile.lastDetection.lastDetectionStation.status.toLowerCase()} tips' alt='${profile.lastDetection.lastDetectionStation.status}'> </div>`+
											`</div>`
										)+
										`</div>`
											: ''
									)+
										(profile.lastTagDeployment?
											`<div style='font-size:10pt;'>Tag deployed: `+
											`<div class='explore-status-button' onclick='showProfileData("${profile.lastTagDeployment.id}", "animals")'>${profile.lastTagDeployment.species} #${profile.lastStationDeployment.id} `+
											`<div class='explore-status-icon explore-status-icon-${profile.lastTagDeployment.status.toLowerCase()} tips' alt='${profile.lastTagDeployment.status}'> </div>`+
											`</div> on <b>${profile.lastTagDeployment.dtStart.toISOString().substring(0, 10).replace("T", " @ ")}</b></div>`
											:''
										)+
									(
										profile.lastStationDeployment ?
											`<div style='font-size:10pt;'>Station deployed: `+
											`<div class='explore-status-button' onclick='showProfileData("${profile.lastStationDeployment.id}", "stations")'>${profile.lastStationDeployment.name} `+
											`<div class='explore-status-icon explore-status-icon-${profile.lastStationDeployment.status.toLowerCase()} tips' alt='${profile.lastStationDeployment.status}'> </div>`+
											`</div> on <b>${profile.lastStationDeployment.dtStart.toISOString().substring(0, 10).replace("T", " @ ")}</b></div>`
											:	''
										)+
								`</div>`+

								(dataType == 'projects' ?
									`<div class='explore-profile-info-section'><h4>Metrics</h4>`+
										Object.entries(profile.stats).map( (d,i) => {
											var profileDataType = d[0].replace('Detected', '').replace('Tagged', '').replace('Segments', '');
											return `<div class='explore-profile-info-stat'>`+
																`<div class='explore-profile-stat-label'>${firstToUpper(d[0].replace('Det', ' Det').replace('Tag', ' Tag').replace('Seg', ' Seg'))}</div>`+
																`<div class='explore-profile-stat-value' onclick='showProfileData("${profile.id}", "${profileDataType}")'>${typeof d[1] == "object" ? d[1].length :  d[1]}</div>`+
															"</div>";

										}).join('')+
									`</div><div class='explore-profile-info-section'><h4>Affiliations</h4>`+
									`<div class='explore-profile-user'>Principal investigator: <a href="javascript:void(0);">User #${profile.leadUserId}</a></div>`+

									( isGrouped ?
											""
											:
											'<div class="explore-profile-group">Group(s): ' + (profile.group!=undefined&&profile.group.name!=undefined?`<a href="#e=projects&d=projects&group=${profile.group.id}" onclick="viewProfile('projectsGroup','${profile.group.id}');return false;">${profile.group.name}</a>`:'None') +'</div>'
									)+
									`</div><div class='explore-profile-info-section'><h4>Detailed Description</h4>`+
									`<div class='explore-profile-description colspan2'>${profile.description}</div>`+
									`</div>`
								 : dataType == 'species' ?
								 `<div class='explore-profile-info-section'><h4>Description</h4>`+
								 	`<div class='explore-profile-description colspan2'>${profile.description}</div>`+
								 `</div>`

								 : dataType == 'animals' ?
								 `<div class='explore-profile-info-section'><h4>Metrics</h4>`+
								 	`<div>Deployment location: <div class='explore-status-button'>${profile.coordinates.join(", ")} ${icons.target}</div></div>`+
								 `</div><div class='explore-profile-info-section'><h4>Affiliations</h4>`+
									 `<div class='explore-profile-info-project'>Project: <a href="javascript:void(0);">${profile.project.name} (#${profile.project.id})</a></div>`+
									 `<div class='explore-profile-user'>Principal investigator: <a href="javascript:void(0);">User #${profile.project.lead_user_id}</a></div>`+
									 `<div class='explore-profile-group'>Group(s): ${profile.project.fee_id.length>0?'<a href="javascript:void(0);">'+profile.project.fee_id+'</a>':"None"}</div>`+
								 `</div><div class='explore-profile-info-section'><h4>Description</h4>`+
								 	`<div class='explore-profile-description colspan2'>${profile.description}</div>`+
								 `</div>`

								 : dataType == 'stations' ?
								 `<div class='explore-profile-info-section'><h4>Metrics</h4>`+
								 	`<div> Deployment location: <div class='explore-status-button'>${profile.coordinates.join(", ")} ${icons.target}</div></div>`+
								 `</div>`+
						//	 `<div class='explore-profile-info-antennas'>Antennas: <div class='explore-status-button' onclick='viewAntennaRanges(populateAntennaInfo);'>Load antenna configuration</div></div>`+

								 `<div class='explore-profile-info-section explore-profile-info-antennas'><h4>Antennas</h4>`+
								 	`<div class='add-antennas-btn'><div class='explore-status-button' onclick='viewAntennaRanges(populateAntennaInfo);'>Load antenna configuration</div></div>`+
								 `</div>`+

								 `<div class='explore-profile-info-section'><h4>Affiliations</h4>`+
									 `<div class='explore-profile-info-project'>Project: <a href="javascript:void(0);">${profile.project.name} (#${profile.project.id})</a></div>`+
									 `<div class='explore-profile-user'>Principal investigator: <a href="javascript:void(0);">User #${profile.project.lead_user_id}</a></div>`+
									 `<div class='explore-profile-group'>Group(s): ${profile.project.fee_id.length>0?'<a href="javascript:void(0);">'+profile.project.fee_id+'</a>':"None"}</div>`+
								 `</div>`

								 : '')+
							 `</div>`+
							"</div>");


		profile.el = $("#explore_card_profile_" + profile.id).get(0);

		$(profile.el).find(".explore-profile-info .expand_btn").click(function(){$(this).parent().toggleClass("expanded");});


		if (profile.photo == "") {

			$("#explore_card_profile_" + profile.id).addClass("no-photo").removeClass('tips');

		} else {
			$("#explore_card_profile_" + profile.id + " .explore-card-image")
				.click(function(){
					initiateLightbox(this);
			}).find('img').attr("src", profile.photo)
			.siblings(".explore-card-image-bg").css("background-image", `url("${profile.photo}")`);

		}



		$("#explore_card_profile_" + profile.id + " .explore-profile-switch").click(function(){
			var profileID = $(this).closest(".explore-card-profile").toggleClass("switching", true).attr('id').replace("explore_card_profile_", "");
			$("#exploreContent .explore-card-add > select").toggleClass("switch-profile", true).val(profileID);//.select2("open");
			$(`.explore-map-${dataType}-add svg`).trigger('click');
			selectNewProfile();
		})

		$("#explore_card_profile_" + profile.id + " .explore-card-name").click(function(e){
			if (!$(e.target).hasClass("explore-profile-switch") && $("#explore_card_profiles").is(":not(.grouped)")) {
				$(this).closest(".explore-card-profile").toggleClass('expanded');
			}
		})

		$("#explore_card_profile_" + profile.id + " .explore-card-remove").click(function(){removeExploreProfile(this, exploreType)});

		/*if (motusFilter[exploreType][0] === 'all') {motusFilter[exploreType] = [];}

		motusFilter[exploreType].push(String(profile.id));
		motusFilter[exploreType] = motusFilter[exploreType].filter(onlyUnique);
*/
		if ($("#exploreContent .explore-card-profile").length == 1) {
	//		$(".explore-card-wrapper").addClass('solo-card');
	//		$("#explore_card_profiles").addClass('solo-card');
			$(".explore-card-wrapper #explore_card_profiles .explore-card-profile").addClass('expanded');
			try { motusMap.setColour('id'); }
			catch(err) { console.log("motusMap not yet created"); }
		} else {
			$(".explore-card-wrapper").removeClass('solo-card');
			$("#explore_card_profiles").removeClass('solo-card');
			$(".explore-card-wrapper #explore_card_profiles .explore-card-profile").removeClass('expanded');
			try { motusMap.setColour('species'); }
			catch(err) { console.log("motusMap not yet created"); }
		}
	} else {
		$("#explore_card_profile_" + profile.id).addClass('flash')
		setTimeout('$("#explore_card_profile_' + profile.id + '").removeClass("flash");',250);
	}

	initiateTooltip(profile.el)
}

function populateAntennaInfo() {

//	Only for profiles
	if (exploreType != 'main') {

//	Loop through each profile
		Object.entries(motusData.selectionNames).forEach((d) => {

//	Remove the button to add antenna info
			$(`#explore_card_profile_${d[0]} .explore-profile-info-antennas .add-antennas-btn`).remove();

//	Select the appropriate antenna deployments and loop through each one
			motusData.antennas.features.filter( x => x.id == d[0] ).forEach( x => {

//	Add a row with the antenna properties of interest
				$(`#explore_card_profile_${d[0]} .explore-profile-info-antennas`).append(
					`<div class='colspan2'><div>Port ${x.properties.port}:</div><div>Bearing: ${x.properties.bearing}</div><div>Antenna type: ${x.properties.type}</div><div>Frequency: ${x.properties.freq}</div><div>Height: ${x.properties.height}</div></div>`
				);

			});
		});
	}
}


function removeExploreProfile(el, filterType) {

	var cardID = $(el).closest('.explore-card-profile').attr('data-profile-id');

	$(el).closest('.explore-card-profile').remove();

	motusFilter[dataType] = motusFilter[dataType].filter(x => x != cardID);
	motusFilter.selections = motusFilter.selections.filter(x => x != cardID);
	if ($("#exploreContent .explore-card-profile").length == 0) {
		$(".explore-card-add").trigger('click');
	} else {
		if (exploreType == 'regions') {updateURL(true);}

		if ($("#exploreContent .explore-card-profile").length == 1) {
			$(".explore-card-wrapper #explore_card_profiles .explore-card-profile").addClass('expanded');
			$(".explore-card-wrapper #explore_card_profiles .explore-card-remove").remove();
		}
	}
	motusMap.setVisibility();
	updateData();
}



function detectionTimeline( d, {
															width = 300,
															height = 60,
															timelineScale = d3.scaleLinear().domain([ timeRange.min, timeRange.max ]).range([ 0, width ]),
															dayWidth = timelineScale( timeRange.min + (1 * 24 * 60 * 60 * 1000) ),
															colourScale = d3.scaleSequential(d3.interpolateSinebow).domain([ 1, 10 ]),
															timelineSVG = $("<svg width='"+width+"' height='"+height+"' style='margin:-8px 0;cursor:pointer;'></svg>"),
															resize = false,
															dataSource = 'station',
															yAxis = false,
															margin = {left: 40, right: 20},
															zoomable = false,
															setTimeline = false,
															timeLineRange = timeRange
														} = {} ) {
//	console.log(colourScale.range())
	timeline.colourScale = colourScale;
//	console.log("Station: %s, Timeline Range: %o", d[0]?d[0].name:d, timeLineRange)

	if (width > 0) {

		timelineScale = d3.scaleLinear().domain([ timeLineRange.min, timeLineRange.max ]).range([margin.left, width-margin.right])

		dayWidth = dayWidth < 1 ? 1 : dayWidth;

		var timeFormat = ( timeLineRange.range / (1000 * 60 * 60 * 24 * 365) ) * ( 300 / width ) > 2 ? "%Y" :
								( ( timeLineRange.range / (1000 * 60 * 60 * 24 * 365) ) * ( 300 / width ) > 1 ? "%b %Y" : "%Y-%m-%d" );

		var x_scale = d3.scaleTime()
									.domain( [ new Date(timeLineRange.min), new Date(timeLineRange.max) ] )
									.range( [margin.left, width-margin.right] );

		var axis_x = d3.axisBottom( x_scale )
										.tickFormat( d3.timeFormat( timeFormat ) )
										.ticks( Math.round( width /  75 ) );

		var hasData = false;

		var svg = d3.select( timelineSVG[0] );
		if (!zoomable) {
			svg
				.on("touchstart touchmove mousemove", dataHover)
				.on("touchend mouseleave", function(e) {dataHover(e, "out");})
				.call(d3.zoom().scaleExtent([.5, 20])  // This control how much you can unzoom (x0.5) and zoom (x20)
					.extent([[0, 0], [width, 0]])
					.on("zoom", updateChart));
		}

		var stationHits = {};

		if (dataSource != 'station') {
			if (d.length > 0) {
				hasData = true;
			}
			d.forEach(function({id, ts, stations, species, project, frequency}, ind) {

			//if (splitData.stations.some( x => motusFilter.selections.includes( x ) ))

//				if (ind%100 == 0) console.log(trackData)
				var dates = [];
				var spp = [];
				var animals = [];

				stations.forEach((station, i) => {
						if (
									( dataType == "projects" || motusFilter.projects.includes('all') || motusFilter.projects.includes( project ) ) &&
									( motusFilter.frequencies.includes('all') || motusFilter.frequencies.includes( frequency ) ) &&
									( dataType == "species" || motusFilter.species.includes('all') || motusFilter.species.includes( species ) ) &&
									( dataType == "animals" || motusFilter.animals.includes('all') || motusFilter.animals.includes( id ) ) &&
									( (dataType == "stations" && motusFilter.selections.includes( station )) || ( motusFilter.stations.includes('all') || motusFilter.stations.includes(station) ) ) &&
									(
										dataType == "regions" || motusFilter.regions.includes('all') || true
									)
								) {

							dates.push( ts[i]*1000 );
							spp.push( species );
							animals.push( id );
						}
				})



//				if (ind%100 == 0) console.log(dates)

				//var dates = trackData.dir.split(',')

//				console.log(trackData);
//				var dates = dtsStart.concat(dtsEnd);

				var data = countInstances( dates.map(k => new Date(k).valueOf()) );
				//var spp = {};

				spp.forEach(function(k, i){

		//			if ( spp.length != 0 && typeof data[2] !== 'undefined' && data[2][data[2].length - 1] == dates[i]) {

					if ( typeof data[2] !== 'undefined' && data[0][data[2].length - 1] == dates[i]) {

						data[2][i].push(k);

					} else if ( typeof data[2] !== 'undefined' ) {

						data[2].push([k]);

					} else {

						data[2] = [[k]];

					}

					if ( typeof data[3] !== 'undefined' && data[0][data[3].length - 1] == dates[i]) {

						data[3][i].push(animals[i]);

					} else if ( typeof data[3] !== 'undefined' ) {

						data[3].push([animals[i]]);

					} else {

						data[3] = [[animals[i]]];

					}

				});


				var date_str;


				for (var i = 0; i < data[0].length; i++) {
					date_str = new Date( data[0][i] ).toISOString().substr(0, 10);
					if ( typeof stationHits[ date_str ] !== 'undefined' ) {
						stationHits[ date_str ].count += data[1][i];
						stationHits[ date_str ].species = stationHits[ date_str ].species.concat(data[2][i]).filter(onlyUnique);
						stationHits[ date_str ].animals = stationHits[ date_str ].animals.concat(data[3][i]).filter(onlyUnique);
					} else {
						stationHits[ date_str ] = {date: data[0][i], count: data[1][i], species: data[2][i].filter(onlyUnique), animals: data[3][i].filter(onlyUnique)};
					}
				}
			});
		} else {
			d.forEach(function(v) {

				var w = width * ((v.dtEnd.valueOf()) - (v.dtStart.valueOf())) / timeLineRange.range;
				var x = width * ((v.dtStart.valueOf()) - timeLineRange.min) / timeLineRange.range;

				svg
					.append('rect')
					.attr('width', w)
					.attr('height', height)
					.attr('x', x)
					.style('fill', '#CCCCCC');

				var g = d3.select( timelineSVG[0] )
					.append('g');

				w = width * ( 24 * 60 * 60 * 3000 ) / timeLineRange.range;

				if (typeof motusData.tracksByStation[v.id] !== 'undefined') {

					hasData = true;
				//	console.log("Track data for %s is %o", v.id, motusData.tracksByStation[v.id]);
					motusData.tracksByStation[v.id].forEach(function(x){

						var datePos = ( x.split('.')[0] == v.id ? 'dtStart' : 'dtEnd' ) + 'List';

						var trackData = motusData.selectedTracks[x];
					//	console.log("Selected track: %o", trackData)
						if (typeof trackData[datePos] !== 'undefined') {

							var dates = trackData[datePos];

							var data = countInstances( dates.map(k => moment(k).valueOf()) );
							const animals = trackData.animal;

							trackData.species.forEach(function(k, i){

					//			if ( spp.length != 0 && typeof data[2] !== 'undefined' && data[2][data[2].length - 1] == dates[i]) {

								if ( typeof data[2] !== 'undefined' && data[0][data[2].length - 1] == dates[i]) {

									data[2][i].push(k);

								} else if ( typeof data[2] !== 'undefined' ) {

									data[2].push([k]);

								} else {

									data[2] = [[k]];

								}

								if ( typeof data[3] !== 'undefined' && data[0][data[3].length - 1] == dates[i]) {

									data[3][i].push(animals[i]);

								} else if ( typeof data[3] !== 'undefined' ) {

									data[3].push([animals[i]]);

								} else {

									data[3] = [[animals[i]]];

								}

							});
							var date_str;

							for (var i = 0; i < data[0].length; i++) {
								date_str = new Date( data[0][i] ).toISOString().substr(0, 10);
								if ( typeof stationHits[ date_str ] !== 'undefined' ) {
									stationHits[ date_str ].count += data[1][i];
									stationHits[ date_str ].species = stationHits[ date_str ].species.concat(data[2][i]).filter(onlyUnique);
									stationHits[ date_str ].animals = stationHits[ date_str ].animals.concat(data[3][i]).filter(onlyUnique);
								} else {
									stationHits[ date_str ] = {date: data[0][i], count: data[1][i], species: data[2][i].filter(onlyUnique), animals: data[3][i].filter(onlyUnique)};
								}
							}
						}

					});

				} else {
					// no data
					console.log("No data for %s", v.id);
				}

			});
		}


		if (zoomable) {

			motusData.stationHits = stationHits;
			stationHits = Object.values(stationHits).map(x => ({date: new Date(x.date), value: x.count, colour: x.animals, species: x.species, animals: x.animals}));

			var stationHitsExpanded = d3.sort(stationHits, (a,b) => a.date > b.date).reduce( (a,c,i,arr) => {
					if (i > 0 && c.date - arr[i-1].date > (1000*60*60*24)) {
						var newDate = arr[i-1].date.addDays(1);
						while (c.date - newDate > (1000*60*60*24) ) {
							a.push({date: newDate, value: 0, colour: [], species: [], animals: []});
							newDate = newDate.addDays(1);
						}
					}
					a.push({date: c.date, value: c.value, colour: c.colour, species: c.species, animals: c.animals});

					return a;
				}, []);
			var colourVals = stationHits.map(x => x.colour).flat().filter(onlyUnique);
		//	motusMap.colourScale = d3.scaleOrdinal().domain(colourVals).range(["#000000"].concat(customColourScale.jnnnnn.slice(0, colourVals.length-1)))
			console.log(colourVals);
			motusData.stationHitsExpanded = stationHitsExpanded;
//			console.log(motusMap.colourScale.range());
		//	var tmp = zoomableTimeline(stationHitsExpanded, {height: height, width: width, motusMap.colourScale: motusMap.colourScale, colourVals: colourVals });


			zoomableTimeline(stationHitsExpanded, {height: height, width: width, svg: svg, colourScale: timeline.colourScale, colourVals: colourVals });

		} else {

			var maxCount = d3.max(Object.values(stationHits), x => x.count);

			var maxSpp = d3.max(Object.values(stationHits), x => x.species.length);

			var g = d3.select( timelineSVG[0] )
				.append('g')
				.attr('class','hits');

			stationHits = Object.values(stationHits).map(x => ({date: new Date(x.date), value: x.count, colour: x.animals, species: x.species, animals: x.animals}));

						motusData.stationHits = stationHits;
			var y_scale = d3.scaleLinear()
										.domain([0, d3.max(stationHits, x => x.value)]).nice()
										.range([0, height - 20]);

			colourScale.domain(d3.extent(stationHits, x => x.colour.length));

		//	x_scale.domain(d3.extent(stationHits, x => x.date));
			g.selectAll('rect')
				.data(stationHits)
				.enter()
					.append('rect')
						//.attr('width', 3 ) // Three days
						.attr('width', x_scale(new Date("2020-01-02")) - x_scale(new Date("2020-01-01")) ) // one day
						.attr('height', (x) => y_scale(x.value) )
						.attr('x', (x) => x_scale(x.date) )
						.attr('fill', (x) => colourScale(x.animals.length) )
						.attr('transform', x => `translate(0 ${(height - 20) - y_scale(x.value)})`);
	//					.attr('transform', translate);
		//							.attr('class', 'hover-data')
		//							.on('mouseover', (e,d) => dataHover(e, d, 'in'))
		//							.on('mouseout', (e,d) => dataHover(e, d, 'out'));

			var tooltip_data_bar = d3.select( timelineSVG[0] )
																.append('g')
																	.style('display', 'none');
			tooltip_data_bar.append('rect')
											.attr('width', dayWidth)
											.attr('height', height)
											.attr('fill', '#000')
											.attr('x', 0)
											.attr('y', 0);

		}

		if (setTimeline) {
			timeline.setLimits(d3.extent( stationHits.map( x => x.date ) ));
		}

		function updateChart(event) {

			// recover the new scale
			var newX = event.transform.rescaleX(x_scale);

			console.log("newX: %s, newY: %s", newX);

		}
		if (typeof resize !== 'undefined') {
			window.addEventListener("resize", resizeWidth);
		}

		function bisect(mx) {
			const bisect = d3.bisector( d => d.date ).left;

			const date = x_scale.invert(mx);
			const index = bisect(Object.values(stationHits), date, 1);
			const a = Object.values(stationHits)[index - 1];
			const b = Object.values(stationHits)[index];
			return b && (date - a.date > b.date - date) ? b : a;
		}

		function dataHover(e, dir = 'in') {
			//							from: https://observablehq.com/@d3/line-chart-with-tooltip
			if (dir == 'in') {
				const x_pos = d3.pointer(e, this)[0];
				const date =  x_scale.invert( x_pos );//.toISOString().substr(0, 10);
				const d = stationHits.filter( x => Math.abs(date - x.date) < (24*60*60*1000) )[ 0 ];

				$('.tooltip').html(
					"<center><h3>"+
						( date.toISOString().substr(0, 10) )+
					"</h3></center>"+
					(d ?
						`<table style="width:100%;text-align:center;font-size:14pt;"><tbody>`+
							`<tr><td colspan="2">${d.value} detections</td></tr>`+
							`<tr><td>${d.animals.length} ${icons.animals}</td><td style="padding-left: 10px;">${d.species.length} ${icons.species}</td></tr>`+
							`<tr><td><b>Animal${d.animals.length==1?"":"s"}</b></td><td style="padding-left: 10px;"><b>Species</b></td></tr>`+
						`</tbody></table>`
					: "") +
					"</div>"
				);

				if (e.pageX + 15 + $('.tooltip').outerWidth() > $(window).width()) {
					$('.tooltip').css({top:e.pageY - 10, left:e.pageX - $('.tooltip').outerWidth() - 15});
				} else {
					$('.tooltip').css({top:e.pageY - 10, left:e.pageX + 15});
				}
				tooltip_data_bar.attr('transform', `translate(${x_pos},0)`).style('display', null)
				$('.tooltip:hidden').show();
			} else {
				$('.tooltip').hide();
				tooltip_data_bar.style('display', 'none');
			}
		}
		function dataHeight(x) {
			return 2 + ( ( height - 25 ) * x.count / maxCount);
		}

		function translate(x) {
			return "translate(0, " + (((height - 25) - dataHeight(x))/2) + ")";
		}
		function resizeWidth() {

//			alert(`${resize.width()} - ${width}`);

			if (resize.length > 0 && resize.width() > 0 && width != resize.width()) {


				var width_el = resize;
				var tmp_width = 0;

				while(tmp_width == 0 && width_el.get(0).tagName != "BODY") {
					tmp_width = width_el.width();
					width_el = width_el.parent();
				}

				if (tmp_width != width) {
					width = tmp_width;
					resize.find("svg").remove();
					resize.append( detectionTimeline( motusData.tracksLongByAnimal, {
						width:width,
						timelineSVG: $("<svg height='"+height+"' style='width:100%;margin:-8px 0;cursor:pointer;'></svg>"),
						dataSource: dataSource,
						colourScale: d3.scaleSequential().domain([ 1, 10 ]).range(["#000000","#000000"]),
						margin: margin
					}) );
				}
			}
		}

		if (!hasData) {

			d3.select( timelineSVG[0] )
				.append('text')
				.attr('dy', '.3em')
				.attr('text-anchor', 'middle')
				.attr('x', (width / 2) )
				.attr('y', (height / 2) )
				.attr('class','no-data-text')
				.style('font-weight', '600')
				.text("NO DETECTIONS");

		}
		if (!zoomable){
			console.log("Station '%s' scale: %o",d[0].name, x_scale.domain())
			d3.select( timelineSVG[0] )
				.append( 'g' )
				.attr('class','axis-x')
				.attr('transform', `translate(0 ${height - 20})`)
	//			.attr('transform', `translate(0 20)`)
				.call(axis_x);

			if (yAxis) {

				var y_scale = d3.scaleLinear()
											.domain( [maxCount, 0] )
											.range( [0, height - 20] );

				var axis_y = d3.axisLeft( y_scale )
												//.tickFormat( d3.timeFormat( timeFormat ) )
												.ticks( Math.round( height /  75 ) );

				d3.select( timelineSVG[0] )
					.append( 'g' )
					.attr('class','axis-y')
					.attr('transform', `translate(${margin.left} 0)`)
					.call(axis_y);
			}
		}
	}


	return timelineSVG[0];

}


// In an array of track segments, it can be complicated to find the date
// of the last detection since dates are contained within a nested list
// of start and end times which designate the arrival/departure times of
// movements between stations.
// matchID can be an array (stations, animals) or string (projects)
function getLastDetection(x, matchID = [], {matchType = 'stations', getIndex = false, getLastAnimal = false, getDirection = false}={}) {

	var maxDate;
	if (getLastAnimal) {var lastAnimal=[];}
	if (getDirection) {var lastDirection=[];}
	if (getLastAnimal && getIndex) {var lastAnimalIndex=[];}

	if (matchID.length > 0 &&  matchType == 'stations') {

		const recvProjs = x.recvProjs;
		maxDate = x.dir.reduce( (a, dir, i) => {
				if ((dir == -1 && matchID.includes(x.recv1)) ||
						(dir == 1 && matchID.includes(x.recv2))) {
					a.push(x.dtEndList[i]);
				}
				if ((dir == 1 && matchID.includes(x.recv1)) ||
					 	(dir == -1 && matchID.includes(x.recv2))) {
					a.push(x.dtStartList[i])
				}
				return a;
			}, []);

	} else if (matchID.length > 0 &&  matchType == 'animals') {

		const animal = x.animal;
		maxDate = x.dir.reduce( (a, dir, i) => {
				if (recvIDs.includes(x.animal[i])) {
					a.push(x.dtEndList[i]);
					a.push(x.dtStartList[i])
				}
				return a;
			}, []);

	} else if (matchID.toString().length > 0 &&  matchType == 'projects') {
		const recvProjs = x.recvProjs;
		maxDate = x.dir.reduce( (a, dir, i) => {
				if (x.project[i] == matchID) {
					a.push(x.dtStartList[i]);
					a.push(x.dtEndList[i]);
					if (getLastAnimal) {
						lastAnimal.push(x.animal[i]);
					}
					if (getDirection) {
						lastDirection.push(dir);
					}
					if (getLastAnimal && getIndex) {
						lastAnimalIndex.push(i);
					}
				} else if ((dir == -1 && recvProjs[0] == matchID) ||
									 (dir == 1 && recvProjs[1] == matchID)) {
					a.push(x.dtEndList[i]);
					if (getLastAnimal) {
						lastAnimal.push(x.animal[i]);
					}
					if (getDirection) {
						lastDirection.push(dir);
					}
					if (getLastAnimal && getIndex) {
						lastAnimalIndex.push(i);
					}
				}
			 	if (x.project[i] != matchID &&
						((dir == 1 && recvProjs[0] == matchID) ||
						 (dir == -1 && recvProjs[1] == matchID))
					 ) {
					a.push(x.dtStartList[i])
					if (getLastAnimal) {
						lastAnimal.push(x.animal[i]);
					}
					if (getDirection) {
						lastDirection.push(dir);
					}
					if (getLastAnimal && getIndex) {
						lastAnimalIndex.push(i);
					}
				}
				return a;
			}, []);

	}
	return 	getLastAnimal && getIndex ? [lastAnimalIndex, lastAnimal] :
					getDirection && getIndex ? [lastDirection, d3.maxIndex(maxDate, x => new Date(x))] :
					getLastAnimal ? lastAnimal :
					getIndex ? d3.maxIndex(maxDate, x => new Date(x)) :
					d3.max(maxDate, x => new Date(x));
}

function selectNewProfile() {


	if (!$("#explore_card_map").hasClass("fixed") ) {

		// Initiate the popup
		$(".popup,.popup_bg").remove();
		$("body").append(	`<div class='popup'>`+
												`<div class='popup-topbar'>`+
													`<div class='popup-header'>Select a new station</div><div class='popup-topbar-close'>X</div>`+
												`</div>`+
													`<div class='popup-content'></div>`+
											`</div>`);

		$(".popup .popup-topbar .popup-topbar-close").click(function(){
			$(".popup").remove();
			$(".popup_bg").remove();
			selectNewProfile();
	//						$("body > *:not(.popup)").css({filter:"blur(0)"});
		});

	}
	// Add the popup content
	if (dataType == "stations") {
		$("#explore_card_map").toggleClass("fixed");
		$(".explore-card-add").toggleClass("fixed visible");
		if ($("#explore_card_map").hasClass("fixed")) {
			$("#explore_card_map svg .explore-map-track:not(.hidden)").css({display:"none"});
		} else {
			$("#explore_card_map svg .explore-map-track:not(.hidden)").css({display:""});
		}
	}

	// Display the popup;
	$('.popup').css({top:0, left:0, height:"28px", right: 0, width: "auto"});

	$('.popup:hidden').show();
	$('.popup_bg:hidden').show();
}
