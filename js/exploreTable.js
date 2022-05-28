var motusTable = {};

function exploreTable(containerID, dataset, selectable = false) {

  var default_length = 25; // Default number of entries per page

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

  		tableDom = dataset.length > default_length ? selectable ? "Bfiplt" : "Biplt" : "Bt";
  		var color_dataType = 'regions' == dataType ? 'country' : 'project';


  		motusTable.dt = $(`#${motusTable.el} table`).DataTable({
  			data: dataset,
  			dom: tableDom,
				columns: motusTable.columns[dataType],
        pageLength: default_length,
  			buttons: selectable ? [
          'selectAll',
          'selectNone',
          {
            text: 'Select Filtered',
            action: function (e, table) {
              table.rows( {search:'applied'} ).select();
            }
          },
          {
            text: 'Deselect Filtered',
            action: function (e, table) {
              table.rows( {search:'applied'} ).deselect();
            }
          }
        ] : [
          {
              extend: 'csvHtml5',
              title: `Motus ${motusTable.dataType} data - Downloaded ${(new Date()).toISOString().substring(0,10)}`
          },
          {
              extend: 'copyHtml5',
              title: `Motus ${motusTable.dataType} data - Downloaded ${(new Date()).toISOString().substring(0,10)}`
          },
          {
              extend: 'excelHtml5',
              title: `Motus ${motusTable.dataType} data - Downloaded ${(new Date()).toISOString().substring(0,10)}`
          },
          {
              extend: 'pdfHtml5',
              title: `Motus ${motusTable.dataType} data - Downloaded ${(new Date()).toISOString().substring(0,10)}`
          }
  			],
        select: selectable,
  			autoWidth: false,
  			order: [[1, 'asc']]
  		}).on("select", (e, dt, t, i) => {
        if (t == "row") {
          var selectedIDs = dt.rows( i ).data().pluck('id');
            console.log(selectedIDs)
          for (var ind = 0; ind < selectedIDs.length; ind++) {
            reportAddSelection(dataType, selectedIDs[ind], "add");
          }
        }
      }).on("deselect", (e, dt, t, i) => {
        if (t == "row") {
          var selectedIDs = dt.rows( i ).data().pluck('id');
          for (var ind = 0; ind < selectedIDs.length; ind++) {
            reportAddSelection(dataType, selectedIDs[ind], "remove");
          }
        }
      });
      $(`#${motusTable.el} table`).toggleClass("hidden", false).show();
      $(`#${motusTable.el} table`)

    }
  }

}

function reportTable(tableID, dataset, dType) {

  console.log(dType);
  if (typeof dType === "undefined") { dType = dataType; }

  var reportTable = {
      el: tableID,
      columns: getTableColumns()
    };

  if (typeof dataset !== 'object') {

    reportTable.dataType = dataset;
    dataset = getTableData(dataset, dType);

  } else {
    reportTable.dataType = dType;
    dataset = getTableData(dataset, dType);
  }

  if (!tableID) {

    console.error("Container ID invalid")

  } else {
    reportTable.dataType = dType;

		reportTable.dt = $(reportTable.el).DataTable({
			data: dataset,
      ordering: false,
			dom: "",
			columns: reportTable.columns[dType],
			autoWidth: false,
			order: [[1, 'asc']]
		});


  }

}

function getTableData(dataset, dType) {

  if (typeof dType === "undefined") { dType = dataType; }
  if (typeof dataset === 'string') {dataset = motusData[dataset];}


  if (dType == 'stations')
    return dataset;
  else if (dType == 'animals')
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
  else if (dType == 'species')
    return dataset.map( d => ({
      ...d,
      ...{
        name: d[currLang],
        nAnimals: typeof d.animals == 'string' ? d.animals.split(',').length : d.animals.length,
        nProjects: typeof d.projects == 'string' ? d.projects.split(',').length : d.projects.length,
      }
    }));
  else if (dType == 'projects')
    return dataset.map( d => ({
      ...d,
      ...{
        nAnimals: {display: d.animals[0] != "NA" ? `<a href='javascript:void(0);' onclick="viewTableStats(event, 'animals',['${d.animals.join("','")}'])">${d.animals.length}</a>` : 0, order: d.animals.length},
        nStations: {display:  typeof d.stations !== 'undefined' && d.stations[0] != "NA" ?
          `<a href='javascript:void(0);' onclick="viewTableStats(event, 'stations',['${d.stations.join("','")}'])">${d.stations.length}</a>` : 0, order: d.stations == undefined ? 0 : d.stations.length},
        nSpecies: {display:  typeof d.species !== 'undefined' && d.species[0] != "NA" ? `<a href='javascript:void(0);' onclick="viewTableStats(event, 'species',['${d.species.join("','")}'])">${d.species.length}</a>` : 0, order: d.species == undefined ? 0 : d.species.length}
      }
    }));
  else if (dType == 'regions')
    return dataset.filter( d => d.both != 0 );
  else
    return dataset;

}
function getTableColumns() {
  return  dataType == "stations" ? {
      stations: [
        {data: "id", title: "Station ID"},
        {data: "name", title: "Station"},
        {data: "dtStart", title: "Start date", "createdCell": function(td, cdata, rdata){
          $(td).html( cdata.toISOString().substr(0,10) );
        }},
        {data: "dtEnd", title: "Status", "createdCell": function(td, cdata, rdata){
          $(td).html( `${(moment().diff(cdata, 'day') < 1 ? "Active" : "Ended on:<br/>" + cdata.toISOString().substr(0,10) )}` );
        }},
        {data: "nAnimals", title: "Animals Detected", "createdCell": function(td, cdata, rdata){
          $(td).html(
            `<a href='${window.location.origin}${window.location.pathname}#e=report&d=animals&selections=${encodeURIComponent(rdata.animals.join(','))}' onclick='viewProfile("animals", [${rdata.animals.map( x => '"'+x+'"' ).join(',')}]);return false;'>${cdata}</a>`
          );
        }},
        {data: "nSpecies", title: "Species Detected", "createdCell": function(td, cdata, rdata){
          $(td).html(
            `<a href='${window.location.origin}${window.location.pathname}#e=report&d=species&selections=${encodeURIComponent(rdata.species.join(','))}' onclick='viewProfile("species", [${rdata.species.map( x => '"'+x+'"' ).join(',')}]);return false;'>${cdata}</a>`
          );
        }}/*,
        {data: "projID", title: "Project", "createdCell": function(td, cdata, rdata){
          $(td).html(
            `<a href='${window.location.origin}${window.location.pathname}#e=report&d=projects&selections=${encodeURIComponent(cdata.split(';').join(','))}' onclick='viewProfile("projects", [${cdata.split(";").map( x => '"'+x+'"' ).join(',')}]);return false;'>${cdata.split(";").map( x => motusData.projects.filter( p => p.id == x )[0].project_name ).join(", ")}</a>`
          );
        }}*/
      ],
      animals: [
  			{data: "name", title: "Species", "createdCell": function(td, cdata, rdata){
  				$(td).html(
            `<a href='${window.location.origin}${window.location.pathname}#e=report&d=species&selections=${rdata.species}' class='tips' alt='View species profile' onclick='viewProfile("species", [${rdata.species}]);return false;'>${cdata}</a>`
  				);
  			}},
  			{data: "id", title: "Deployment ID"},
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
        {data: "animals", title: "Animals detected", "createdCell": function(td, cdata, rdata){
          $(td).html( cdata.length );
        }},
      //  {data: "nStations", title: "Stations visited"},
        {data: "projects", title: "Projects", "createdCell": function(td, cdata, rdata){
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
    } :
    dataType == "projects" ? {
      stations: [
        {data: "id", title: "ID"},
        {data: "name", title: "Name"},
        {data: "dtStart", title: "Start date", "createdCell": function(td, cdata, rdata){
          $(td).html( cdata.toISOString().substr(0,10) );
        }},
        {data: "dtEnd", title: "Status", "createdCell": function(td, cdata, rdata){
          $(td).html( `${(moment().diff(cdata, 'day') < 1 ? "Active" : "Ended on:<br/>" + cdata.toISOString().substr(0,10) )}` );
        }},
        {data: "nAnimals", title: "Animals", "createdCell": function(td, cdata, rdata){
          $(td).html(
            `<a href='${window.location.origin}${window.location.pathname}#e=report&d=animals&selections=${encodeURIComponent(rdata.animals.join(','))}' onclick='viewProfile("animals", [${rdata.animals.map( x => '"'+x+'"' ).join(',')}]);return false;'>${cdata}</a>`
          );
        }},
        {data: "nSpecies", title: "Species", "createdCell": function(td, cdata, rdata){
          $(td).html(
            `<a href='${window.location.origin}${window.location.pathname}#e=report&d=species&selections=${encodeURIComponent(rdata.species.join(','))}' onclick='viewProfile("species", [${rdata.species.map( x => '"'+x+'"' ).join(',')}]);return false;'>${cdata}</a>`
          );
        }},
        {data: "projectID", title: "Project", "createdCell": function(td, cdata, rdata){
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
    } :
     dataType == "animals" ? {
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
    } :
     dataType == "species" ? {
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
    } :
     dataType == "regions" ? {
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
    } :
    false;
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
