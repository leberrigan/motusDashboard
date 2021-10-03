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

  if (dataset == 'stations')
    return dataset;
  else if (dataset == 'animals')
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
  else if (dataset == 'species')
    return dataset.map( d => ({
      ...d,
      ...{
        name: d[currLang],
        nAnimals: typeof d.animals == 'string' ? d.animals.split(',').length : d.animals.length,
        nProjects: typeof d.projects == 'string' ? d.projects.split(',').length : d.projects.length,
      }
    }));
  else if (dataset == 'projects')
    return dataset;
  else if (dataset == 'regions')
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
      {data: "created_dt", title: "Start date"},
      /*{className: "table_tips", data: "stations", title: "Stations deployed", "createdCell": function(td, cdata, rdata){
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
      }},*/
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
