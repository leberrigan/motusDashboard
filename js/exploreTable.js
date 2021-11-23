var motusTable = {};

function exploreTable(containerID, dataset) {
  if (typeof motusTable.columns === 'undefined') {
    motusTable = {
      el: containerID,
      columns: getTableColumns()
    };
  }
	if (typeof motusTable.el !== 'undefined' && $(`#${motusTable.el} table`).length > 0 && motusTable.dataType == dataset ) {

	  $(`#${motusTable.el}`).show();

	} else {


    if (typeof dataset !== 'object') {
      motusTable.dataType = dataset;
      dataset = getTableData(dataType);
    } else {
        motusTable.dataType = dataType;
    }

    if (!containerID) {
      console.error("Container ID invalid")
    } else {
      motusTable.dataType = dataType;
      $(`#${motusTable.el}`).show();
      $(`#${motusTable.el}`).html("<table></table>");

  		var tableDom = dataset.length > 10 ? "Bipt" : "Bt";
  		var color_dataType = 'regions' == dataType ? 'country' : 'project';


  		motusTable.dt = $(`#${motusTable.el} table`).DataTable({
  			data: dataset,
  			dom: tableDom,
				columns: motusTable.columns[dataType],
  			buttons: [
  				'copyHtml5',
  				'excelHtml5',
  				'csvHtml5',
  				'pdfHtml5'
  			],
  			autoWidth: false,
  			order: [[1, 'asc']]
  		});
      $(`#${motusTable.el} table`).toggleClass("hidden", false).show();

    }
  }

}

function reportTable(tableID, dataset) {


  var reportTable = {
      el: tableID,
      columns: getTableColumns()
    };

  if (typeof dataset !== 'object') {

    reportTable.dataType = dataset;
    dataset = getTableData(dataset);

  } else {
    reportTable.dataType = dataType;
    reportTable.dataType = getTableData(dataset);
  }

  if (!tableID) {

    console.error("Container ID invalid")

  } else {
    reportTable.dataType = dataType;

		reportTable.dt = $(reportTable.el).DataTable({
			data: dataset,
      ordering: false,
			dom: "",
			columns: reportTable.columns[dataType],
			autoWidth: false,
			order: [[1, 'asc']]
		});


  }

}

function getTableData(dataset) {

  if (typeof dataset === 'string') {dataset = motusData[dataset];}

  if (dataType == 'stations')
    return dataset;
  else if (dataType == 'animals')
    return dataset.map( d => {
      const sp = motusData.species.filter( x => x.id == d.species);
      return {
        ...d,
        ...{
          name: sp.length > 0 ? sp[0][currLang] : "Unknown species",
          sort: sp.length > 0 ? sp[0].sort : -1,
          projectName: motusData.projects.filter( x => x.id == d.project)[0].name
        }
      };
    });
  else if (dataType == 'species')
    return dataset.map( d => ({
      ...d,
      ...{
        name: d[currLang],
        nAnimals: typeof d.animals == 'string' ? d.animals.split(',').length : d.animals.length,
        nProjects: typeof d.projects == 'string' ? d.projects.split(',').length : d.projects.length,
      }
    }));
  else if (dataType == 'projects')
    return dataset.map( d => ({
      ...d,
      ...{
        nAnimals: {display: d.animals[0] != "NA" ? `<a href='javascript:void(0);' onclick="viewTableStats(event, 'animals',['${d.animals.join("','")}'])">${d.animals.length}</a>` : 0, order: d.animals.length},
        nStations: {display: d.stations[0] != "NA" ? `<a href='javascript:void(0);' onclick="viewTableStats(event, 'stations',['${d.stations.join("','")}'])">${d.stations.length}</a>` : 0, order: d.stations.length},
        nSpecies: {display: d.species[0] != "NA" ? `<a href='javascript:void(0);' onclick="viewTableStats(event, 'species',['${d.species.join("','")}'])">${d.species.length}</a>` : 0, order: d.species.length}
      }
    }));
  else if (dataType == 'regions')
    return dataset.filter( d => d.both != 0 );
  else
    return dataset;

}
function getTableColumns() {
  return  {
    stations: [
      {data: "id", title: "Station ID"},
      {data: "name", title: "Station"},
      {data: "dtStart", title: "Start date", "createdCell": function(td, cdata, rdata){
        $(td).html( cdata.toISOString().substr(0,10) );
      }},
      {data: "dtEnd", title: "Status", "createdCell": function(td, cdata, rdata){
        $(td).html( `${(moment().diff(cdata, 'day') < 1 ? "Active" : "Ended on:<br/>" + cdata.toISOString().substr(0,10) )}` );
      }},
      {data: "nAnimals", title: "Number of Animals", "createdCell": function(td, cdata, rdata){
        $(td).html(
          `<a href='${window.location.origin}${window.location.pathname}#e=report&d=animals&selections=${encodeURIComponent(rdata.animals.join(','))}' onclick='viewProfile("animals", [${rdata.animals.map( x => '"'+x+'"' ).join(',')}]);return false;'>${cdata}</a>`
        );
      }},
      {data: "nSpecies", title: "Number of Species", "createdCell": function(td, cdata, rdata){
        $(td).html(
          `<a href='${window.location.origin}${window.location.pathname}#e=report&d=species&selections=${encodeURIComponent(rdata.species.join(','))}' onclick='viewProfile("species", [${rdata.species.map( x => '"'+x+'"' ).join(',')}]);return false;'>${cdata}</a>`
        );
      }},
      {data: "projID", title: "Project", "createdCell": function(td, cdata, rdata){
        $(td).html(
          `<a href='${window.location.origin}${window.location.pathname}#e=report&d=projects&selections=${encodeURIComponent(cdata.split(';').join(','))}' onclick='viewProfile("projects", [${cdata.split(";").map( x => '"'+x+'"' ).join(',')}]);return false;'>${cdata.split(";").map( x => motusData.projects.filter( p => p.id == x )[0].project_name ).join(", ")}</a>`
        );
      }}
    ],
    animals: [
			{data: "id", title: "Deployment ID"},
			{data: "name", title: "Species", "createdCell": function(td, cdata, rdata){
				$(td).html(
          `<a href='${window.location.origin}${window.location.pathname}#e=report&d=species&selections=${rdata.species}' class='tips' alt='View species profile' onclick='viewProfile("species", [${rdata.species}]);return false;'>${cdata}</a>`
				);
			}},
	//		{data: "nStations", title: "Stations visited"},
	//		{data: "nDays", title: "Days detected"},
      {data: "dtStart", title: "Start date", "createdCell": function(td, cdata, rdata){
        $(td).html( cdata.toISOString().substr(0,10) );
      }},
      {data: "dtEnd", title: "Status", "createdCell": function(td, cdata, rdata){
        $(td).html( `${(moment().diff(cdata, 'day') < 1 ? "Active" : "Ended on:<br/>" + cdata.toISOString().substr(0,10) )}` );
      }},
			{data: "projectName", title: "Project","createdCell": function(td, cdata, rdata){
				$(td).html(
					`<a href='${window.location.origin}${window.location.pathname}#e=report&d=projects&selections=${rdata.project}' class='tips' alt='View project profile' onclick='viewProfile("project", [${rdata.project}]);return false;'>${cdata}</a>`
    		);
			}},
			{data: "sort", visible: false, orderable: true}
    ],
    species: [
      {data: currLang, title: "Species", "createdCell": function(td, cdata, rdata){
        $(td).html(
          `<a href='${window.location.origin}${window.location.pathname}#e=report&d=species&selections=${rdata.species}' class='tips' alt='View species profile' onclick='viewProfile("species", [${rdata.species}]);return false;'>${cdata}</a>`
        );
      }},
      {data: "animals", title: "Animals tagged", "createdCell": function(td, cdata, rdata){
        $(td).html( cdata.length );
      }},
    //  {data: "nStations", title: "Stations visited"},
      {data: "projects", title: "Tagging Projects", "createdCell": function(td, cdata, rdata){
        $(td).html( cdata.length );
      }},
      {data: "sort", visible: false, orderable: true}
    ],
    projects: [
      {data: "id", title: "ID", "createdCell": function(td, cdata, rdata){
        $(td).html(
            `<b>#${cdata}</b>`
        );
      }},
      {data: "name", title: "Project"},
      {data: "dtCreated", title: "Start date"},
      {data: "nStations", title: "Stations deployed", "render": {_: "display", sort: "order"}},
      {data: "nAnimals", title: "Animals tagged", "render": {_: "display", sort: "order"}},
      {data: "nSpecies", title: "Species tagged", "render": {_: "display", sort: "order"}},
      {data: "fee_id", title: "Groups", "createdCell": function(td, cdata, rdata){
        $(td).html(
          `<a href='javascript:void(0);' onclick='viewProfile("projectsGroup", ["${rdata.fee_id}"]);return false;'>${rdata.fee_id}</a>`
        );
      }}
    ],
    regions: [
      {data: "country", title: "Name"},
      {data: "animals", title: "Animals tagged"},
      {data: "stations", title: "Stations deployed"}
//    {data: "nProjects", title: "Tagging Projects"}
    ]
  };
}

function viewTableStats(e, dataVar, ids) {

  	var popupText = "";
  	var popupData = [];

  	filterPopup("Loading...", e)

  	setTimeout( function(ids, dataVar) {


				popupData = getSelectionQuickList(dataVar, motusData[dataVar].filter( d => ids.includes(d.id) ) );

				popupText = "<div class='report-"+dataVar+"'>"+
											"<table>"+
												"<thead><tr>" +
													"<th>" + Object.keys(  popupData[0] ).map( x => camelToRegularText( x ).replace("I D", "ID") ).join("</th><th>") + "</th>"+
												"</tr></thead>"+
												"<tbody><tr>" +
													popupData.map( d => "<td>" + Object.values( d ).join("</td><td>") + "</td>").join("</tr><tr>") +
												"</tr></tbody>"+
											"</table>"+
										"</div>";

  			showPopup(popupText, e);

  			$(`.popup .report-${dataVar} table`).DataTable({
  				paging:false,
  				dom: "fiB<'scroll-box't>",
  		    "language": {
  		      "info": "Showing _TOTAL_ entries",
  					"infoEmpty": "Showing 0 entries",
  					"infoFiltered": "",
  		    },
  				buttons: [
  					{
  						extend:'copy',
  						title: camelToRegularText( dataVar )
  					},
  					{
  						extend:'csv',
  						title: camelToRegularText( dataVar )
  					}
  				],
  				scrollY: "40vh",
  				scrollCollapse: true
  			})

  		//	showPopup(false, e)
  	}, 10, ids, dataVar)

}
