// This file is to help me develp a new data flow for the API MaximumConnectionsError


async function API_stations() {

/*

  Station data needs to be pulled from:
  "species",
  "stations",
	"receivers",
  "station/recent",
  "stationDeployments",
	"tags/local",
  "stationTags"

*/
  let timer = new Date();

//  logMessage("Get tag data");
//  await API_tags();
  logMessage("Get stations");
  await requestDataAPI( "stations" )
  logMessage("Get antenna deployments");
  await requestDataAPI( "antennaDeployments" )
  logMessage("Get station deployments");
  await requestDataAPI( "stationDeployments" )
  logMessage("Get station deployment info");
  await Promise.all([
    requestDataAPI( "receivers" ),
    requestDataAPI( "stationTags" ),
    requestDataAPI( "tags/local" ),
    requestDataAPI( "station/recent" )
  ]);

  motusData.stations.forEach( (d, k, arr) => {
    let stationDeps = motusData.stationDeployments.filter( x => x.stationID == d.id );
    d.nDeps = stationDeps.length;
    if (stationDeps.length > 0) {
      d.stationDeps = stationDeps.map( x => x.id );
      d.animals = stationDeps.map( x => x.animals ).flat();
      d.species = stationDeps.map( x => x.species ).flat();
      d.nAnimals = [...new Set(d.animals)].length;
      d.nSpecies = [...new Set(d.species)].length;
      d.dtStart = d3.min(stationDeps, x => x.dtStart );
      d.dtEnd = d3.max(stationDeps, x => x.dtEnd );

      // Add coordinates to station deployments
      stationDeps.forEach( (x, key, a) => {
          a[key].geometry = d.geometry;
          a[key].project = d.project;
          a[key].name = d.name;
        //  a[key] = { ...d, ...x};
      });

      arr[k] = { ...stationDeps[0], ...d};
    } else {
      d.stationDeps = [];
      d.localAnimals = [];
      d.lastData = false;
      d.animals = [];
      d.species = [];
      arr[k] = { ...Object.fromEntries(Object.keys(motusData.stationDeployments[0]).map(x => [x,""])), ...d}
//      logMessage("No data for station " + d.id, "warn");
    }
  });

  motusData.stationsByProject = d3.group(motusData.stations, x => x.project);

  motusData.stationDeps = motusData.stationDeployments;
  motusData.stations_indexed = d3.index(motusData.stations, x => x.id);
  /*
  Promise.all([
    requestDataAPI( "species" ),
    requestDataAPI( "receivers" ),
    requestDataAPI( "stationTags" ),
    requestDataAPI( "tags/local" ),
    requestDataAPI( "station/recent" ),
  ]).then(()=>{
  });*/
  logMessage("Finished in " + ((new Date() - timer) / 1000) + " seconds");

  return true;
}

function API_antennas() {

  /*

    Antenna deployments only depend on a single entry point:
    	"antennaDeployments"

  */
}

async function API_tags() {

/*

  Tag data needs to be pulled from:
	"tags",
	"tagDeployments",
	"species",
	"tags/local",
	"stationTags"

*/
  let timer = new Date();

  logMessage("Get species meta");
  await requestDataAPI( "species" );
  logMessage("Get tag meta");
  await requestDataAPI( "tags" );
  logMessage("Get tag deployments");
  await requestDataAPI( "tagDeployments" );

  motusData.tagDeployments.forEach( (d, k, arr) => {
    let tag = motusData.tags_indexed.get( d.tagID );
    if (typeof tag !== 'undefined') {
      arr[k] = { ...tag, ...d};
    } else {
      arr[k] = { ...Object.fromEntries(Object.keys(motusData.tags.entries().next().value[1]).map(x => [x,""])), ...d}
  //      logMessage("No data for station " + d.id, "warn");
    }
  });

  motusData.animals = motusData.tagDeployments;
  motusData.animalsByProject = d3.group(motusData.tagDeployments, x => x.project);
  // returns a Map object
  motusData.animals_indexed = d3.index( motusData.tagDeployments, x => x.id );

  motusData.species.forEach( (d, k, arr) => {
    let animals = motusData.animals.filter( x => x.species == d.id );
    arr[k].animals = animals.map( x => x.id );
    arr[k].stations = [...new Set( animals.map( x => x.stations ).flat() )];
    arr[k].projects = animals.map( x => x.project );
  });

  logMessage("Finished in " + ((new Date() - timer) / 1000) + " seconds");

  return true;

}
async function API_tracks() {

/*

  Tracks data depend on two entry points:
  	"tracks",
    "stations"

  This is going to be the most time consuming part by far.
  Optimize by keeping track of date of last download.
  If date is within a certain threshold (1 month, perhaps) or if deployEnd has passed, don't update the track.

*/

  let timer = new Date();
//  logMessage("Get station data");
//  await API_stations( );
//  logMessage("Get tag data");
//  await API_tags( );
  logMessage("Get tracks data");
  await requestDataAPI( "tracks" );

  logMessage("Finished loading track data in " + ((new Date() - timer) / 1000) + " seconds");

  return true;
}

async function API_projects() {

/*

  Data needs to be pulled from:
	 "projects"

*/
  let timer = new Date();

  logMessage("Get project meta");
  await requestDataAPI("projects");

  logMessage("Finished loading project meta in " + ((new Date() - timer) / 1000) + " seconds");

  return true;
}
/* Order in which tables must be loaded
stationDeps
stations
antennas
animals
species
trackLongByAnimal
tracksByAnimal
projects

*/


async function API_data(option = -1) {
  switch(option) {
    case 0:
      await API_stations()
      API_updateMotusDB({results: motusData.stationDeployments}, "stationDeps");
      API_updateMotusDB({results: motusData.stations}, "stations");
      API_updateMotusDB({results: motusData.antennaDeployments}, "antennas");
      break;
    case 1:
      await API_tags()
      API_updateMotusDB({results: motusData.tagDeployments}, "animals");
      API_updateMotusDB({results: motusData.species}, "species");
      break;
    case 2:
      await API_tracks()
      API_updateMotusDB({results: motusData.tracksByAnimal}, "tracksLongByAnimal");
      API_updateMotusDB({results: motusData.tracks}, "tracksByAnimal");
      break;
    case 3:
      await API_projects()
      API_updateMotusDB({results: motusData.projects}, "projects");
      break;
    default:
      let timer = new Date();
      logMessage("Get all data");
      await API_data(0);
      await API_data(1);
      await API_data(2);
      await API_data(3);
      logMessage("Finished loading all data in " + ((new Date() - timer) / 1000) + " seconds");
      break;
  }

  return true;
}
/*
async function API_data(tablesToLoad) {

  if (!tablesToLoad) {
    tablesToLoad = !['main', 'report'].includes(exploreType) ? "projects" :
                  ['projects', 'regions'].includes(dataType) ? "projects" :
                   ['species', 'animals'].includes(dataType) ? "tags" : "stations";
  }

  switch (tablesToLoad) {
    case "all":
      await Promise.all([API_stations(), API_tags()]);
      API_projects();
      API_antennas();
      break;
    case "stations":
      API_stations();
      break;
    case "tags":
      API_tags();
      break;
    case "projects":
      await Promise.all([API_stations(), API_tags()]);
      API_projects();
      break;
    case "antennas":
      await API_stations();
      API_antennas();
      break;
  }

}
*/

function getStationActivity() {

  API_stationActivity();

}

async function API_stationActivity(count = true, table = false) {

/*

  Station activity data is pulled from:
	"gps",
	"antPulse"

*/

	motusFilter.selectedStations.forEach( x => {
		Promise.all([requestDataAPI( "gps", x ), requestDataAPI( "antPulse", x )]).then((response) => {
			if (response[0].status == 'success' || response[1].status == 'success') addExploreTabs();
			else logMessage("Failed to load station activity!", "warn");
		});
	});

}






// Maximum number of results per table (10k)
const API_RESULTS_MAX = 1e4;

const API_AVAILABLE = !['localhost','leberrigan.github.io'].includes(window.location.hostname);

const AVAILABLE_TABLES = API_AVAILABLE ? API_TABLES : LOCAL_TABLES;

async function requestDataAPI( req_table, req_id, req_page, req_count ) {

	var req_prefix =  API_AVAILABLE ? `https://${window.location.hostname}/data/dashboard/` : "data/";

	if ( !AVAILABLE_TABLES.includes( req_table ) ) {
    if (req_table == "tracks" && API_AVAILABLE) {
      var API_EXCEPTION = true;
      req_prefix = `https://${window.location.hostname}/wp-content/uploads/2022/05/`;
    } else {
      logMessage("Invalid table: " + req_table, "error");
		  return false;
    }
	}

  // Don't bother counting the rows if there isn't even a dataframe that exists yet
  req_count = typeof req_count === "undefined" ? (!typeof motusData[req_table.replace("/","_")] === 'undefined') : req_count;

  if (typeof motusData[req_table.replace("/","_")] === 'undefined') {
     motusData[req_table.replace("/","_")] = [];
  }

  if (API_AVAILABLE && !API_EXCEPTION) {
  	var req_url = req_prefix + (req_count?"count/":"") + req_table + (req_id?"?stationId=" + req_id + "&":"?") + (req_page?"page=" + req_page:"");

    logMessage("Request URL: " + req_url)

    var response = await d3.json(req_url);

  } else { // NO API

  	var req_url = req_prefix + "API_" + req_table.replace("/","_").replace(/D/, "_d").replace(/T/, "_t") + ".csv";

    logMessage("Request URL: " + req_url)

    var response = (req_count || typeof req_count === "undefined") ? {
      request: "/" + req_table,
      status: "success",
      results: [{nrec: await d3.csv(req_url).then(result => result.length)}],
      csv: true
    } : {
      request: "/" + req_table,
      status: "success",
      results: await d3.csv(req_url),
      csv: true
    }

  }


  if (req_count) {

  	logMessage("Counting data");

    return response;

  } else if (typeof req_count === "undefined") {

  	logMessage("Checking if any new records exist");

    if (response.status == 'success') {
      logMessage("Request succeeded! Request: " + response.request);
      if (typeof motusData[req_table.replace("/","_")] === 'undefined' || response.results[0].nrec != motusData[req_table.replace("/","_")].length) {
        logMessage("Requesting new "+req_table+" data...");
        return await requestDataAPI( req_table, req_id, req_page, false );
      } else {
        logMessage("Data is up to date!");
        return response;
      }
    } else {
      logMessage("Request failed! Request: " + response.request, "error");
      return response;
    }

  } else {

    logMessage("Loading data from: " + req_url);

//  	var response = await processDataAPI( response );

  	return await processDataAPI( response );//await API_updateMotusDB( response, tblName )
  }

}
//API_updateMotusDB({results: motusData.stations}, "stations")
async function API_updateMotusDB(response, tableName = false) {

  tableName = tableName ? tableName : response.request.substr(1).replace("/","_");
  var tableData = response.results;

  //if ( ["API_projects", "API_stations"].includes(tableName) ) {tableName = tableName.replace("API_", "");}

  if (typeof motusData.db[tableName] !== 'undefined') {

  	logMessage(`Adding '${tableName}'...`);
  	console.log(tableData);
  	var lastKey = await motusData.db[tableName].bulkPut(tableData).catch(Dexie.BulkError, function (e) {
  		logMessage(`Error adding ${e.failures.length} of ${tableData.length} rows to '${tableName}' table.`, "error");
  	});

    if (lastKey) {
  	   logMessage(`Done adding '${tableName}' table.`);
    }

  } else {

    logMessage(`Table '${tableName}' doesn't exist within IndexedDB`, "warn");

  }

  return response;

}

function processDataAPI(response) {

  var tblName = response.request.substr(1).replace("/", "_");

	if (response.status != 'success') {
		logMessage("Download failed: " + response.status, 'error');
		return false;
	}
	logMessage("Data loaded successfully");

	if (!motusData[tblName] && response.request != "/gps")
		motusData[tblName] = [];
	else if (!motusData[tblName])
			motusData[tblName] = {};

	console.log(response);

	if (response.request == "/antennaDeployments") { // Done
		if (response.page == 1 || typeof response.page === 'undefined') {
			motusData[tblName] = [];
		}
		motusData[tblName] = motusData[tblName].concat(
			response.results.map( x => {
					renameObjectKey(x, "deploymentID", "id");
					renameObjectKey(x, "type", "model");
					renameObjectKey(x, "true_bearing", "bearing");
					return x;
				})
			);

    logMessage(motusData[tblName][0]);

    // If we're at the last page
    if (response.csv || typeof response.page === 'undefined' || (response.page > 0 && response.results.length != API_RESULTS_MAX)) {
      // returns a Map object
      motusData[tblName + "ByStationDeployment"] = d3.group(
        motusData[tblName], x => x.id
      )
      motusData.antennas = motusData[tblName];
    }

	} else if (response.request == "/gps") { // Done
		if (response.page == 1 || typeof response.page === 'undefined') {
			motusData[tblName][response.stationId] = [];
		}
		motusData[tblName][response.stationId] = motusData[tblName][response.stationId].concat(
				response.results.map( x => {
					x.date = new Date( x.ts * 1e3 );
					x.fixes = 1; // Assume 1 fix per hour (very few cases where there are more and it's not that relevant)
					return x;
				})
			);
	} else if (response.request == "/antPulse") { // Done
		if (response.page == 1 || typeof response.page === 'undefined') {
			motusData[tblName][response.stationId] = [];
		}
		motusData[tblName][response.stationId] = motusData[tblName][response.stationId].concat(
				response.results.map( x => {
					x.ts = x.hourBin * 3600
					x.date = new Date( x.ts * 1e3 );
					return x;
				})
			);
  } else if (response.request == "/tags") { // Done
		if (response.page == 1 || typeof response.page === 'undefined') {
			motusData[tblName] = [];
		}
	  motusData[tblName] = motusData[tblName].concat(
		   response.results.map( x => {
				renameObjectKey(x, "tagID", "id");
				renameObjectKey(x, "projectID", "project");
				renameObjectKey(x, "burstInterval", "tagBI");
        x.manufacturer = x.model == null ? "UNKNOWN" : x.model.includes("LIFE") ? "CTT" : "Lotek";
				return x;
			})
		);
    // If we're at the last page
    if (response.csv || typeof response.page === 'undefined' || (response.page > 0 && response.results.length != API_RESULTS_MAX)) {
    //  motusData[tblName+"_indexed"]  = d3.index(motusData[tblName], x => x.id);
    }

  } else if ( response.request == "/tagDeployments") { // Done

  		if (response.page == 1 || typeof response.page === 'undefined') {
  			motusData[tblName] = [];
  		}
  		motusData[tblName] = motusData[tblName].concat(
  			response.results.map( x => {
  				var region = x.region === null ? [null, null] : x.region.split(".");
  				return {
  					geometry: {
      				type: "Point",
  						coordinates: [] // Missing
  					},
  					type: "Feature",
  					id: x.tagDeployID,
  			//		properties: {
  						dtStart: new Date(x.tsStart * 1e3),
  						dtEnd: x.tsEnd === null ? null : new Date(x.tsEnd * 1e3),
  						tagID: x.tagID,
  						species: x.speciesID,
  						group: x.group,
  						photo: "",//x.photo,	// missing
              continent: "NA",
  						country: region[0],
              projects: [], // Project contributing to detections
              stations: [], // Stations visited
  						stateProv: region[1],
  						status: x.status == 2 ? "active" : x.status == 1 ? "inactive" : "pending"
  						// Missing: name, projectID
  		//			}
  				};
  			})
  		);
      // If we're at the last page
      if (response.csv || typeof response.page === 'undefined' || (response.page > 0 && response.results.length != API_RESULTS_MAX)) {
        motusData.animals = motusData.tagDeployments;
      }

		} else if (response.request == "/receivers") {
			if (response.page == 1 || typeof response.page === 'undefined') {
				motusData[tblName] = [];
			}
			motusData[tblName] = motusData[tblName].concat(
				response.results.map( x => {
					renameObjectKey(x, "sensorID", "id");
					renameObjectKey(x, "serialNumber", "serno");
					return x;
				})
			);
		} else if (response.request == "/projects") {
			if (response.page == 1 || typeof response.page === 'undefined') {
				motusData[tblName] = [];
			}
			motusData[tblName] = motusData[tblName].concat(
				response.results.map( x => {
					renameObjectKey(x, "projectID", "id");
          let stations = motusData.stationsByProject.get( x.id );
          let animals = motusData.animalsByProject.get( x.id );
          x.dtCreated = d3.min( [
            typeof stations === 'undefined' ? new Date() : d3.min(stations, d => d.dtStart==""?new Date():d.dtStart ),
            typeof animals === 'undefined' ? new Date() : d3.min(animals, d => d.dtStart==""?new Date():d.dtStart )] );
          stations = typeof stations === 'undefined' ? [] : stations.map( d => d.id );
          species = typeof animals === 'undefined' ? [] : animals.map( d => d.species );
          animals = typeof animals === 'undefined' ? [] : animals.map( d => d.id );
					x.fee_id = projectGroupNames[x.fee_id==""||!x.fee_id?1:x.fee_id];
          x.stations = stations;
          x.animals = animals;
          x.species = species;
					return x;
				}) // Missing: species, stations, animals, dt_created
			);
		} else if (response.request == "/stationDeployments") { // Done
  		if (response.page == 1 || typeof response.page === 'undefined') {
  			motusData[tblName] = [];
  		}
  		motusData[tblName] = motusData[tblName].concat(
  			response.results.map( x => {
          var antennas = motusData.antennaDeploymentsByStationDeployment.get( x.sensorDeployID );
              antennas = typeof antennas === 'undefined' ? [] : antennas;
          var freqs = [...new Set(antennas.map( d => d.frequency ))].join(",");
  				var region = x.region === null ? [null, null] : x.region.split(".");
  				return {
  					geometry: {
      				type: "Point",
  						coordinates: [] // Populated from 'stations' table.
  					},
  					type: "Feature",
  					id: x.sensorDeployID,
            frequency: freqs,
  			//		properties: {
  						dtStart: new Date(x.tsStart * 1e3),
  						dtEnd: x.tsEnd === "NULL" || x.tsEnd === null ? null : new Date(x.tsEnd * 1e3),
  						stationID: x.stationID,
  						receiverID: x.sensorID,
  						group: x.group,
  						photo: x.photo,
              nAnt: antennas.length,
//              name: "",
//              project: 0,
              continent: "NA",
  						country: region[0],
  						stateProv: region[1],
  						status: x.status == 2 ? "active" : x.status == 1 ? "inactive" : "pending",
  						receiverType: x.type
  						// Missing: name, projectID
  			//		}
  				};
  			})
  		);
      // If we're at the last page
      if (response.csv || typeof response.page === 'undefined' || (response.page > 0 && response.results.length != API_RESULTS_MAX)) {
        motusData.stationDeps = motusData.stationDeployments;
      }
  	} else if (response.request == "/stations") { // Done
  		if (response.page == 1 || typeof response.page === 'undefined') {
  			motusData[tblName] = [];
  		}
  		motusData[tblName] = motusData[tblName].concat(
  			response.results.map( x => {
  				return {
  					geometry: {
      				type: "Point",
  						coordinates: [+x.longitude, +x.latitude]
  					},
  					type: "Feature",
  					id: x.stationID,
          //  properties: {
    					name: x.stationName,
    					status: x.station_status == 2 ? "active" : x.station_status == 1 ? "inactive" : "pending",
    					project: x.projectID
          //  }
  				};
  			})
  		);
  	} else if (response.request == "/species") { // done
  		if (response.page == 1 || typeof response.page === 'undefined') {
  			motusData[tblName] = [];
  		}
  		motusData[tblName] = motusData[tblName].concat(
  			response.results.map( x => {
  				x.id = x.speciesID;
  				return x;
  			}) // Missing: stations, stationProjects, projects, animals
  		);
  	} else if (response.request == "/regions") {
  		filters.options.regions = {};
  		motusData.regions.forEach(function(x) {
  			if (x.both > 0) {filters.options.regions[x.ADM0_A3] = x.country;}
  			x.id = x.ADM0_A3;
  		});
  	} else if (response.request == "/polygons") {
  		motusData.polygons = motusData.polygons.features
  	} else if (response.request == "/tracks") {

  		if (response.page == 1 || typeof response.page === 'undefined') {
  			motusData[tblName] = [];
  		}
  		motusData[tblName] = motusData[tblName].concat(
  			response.results.map( x => {
          let station1 = motusData.stations_indexed.get(x.station1);
          let station2 = motusData.stations_indexed.get(x.station2);
          let coords1 = station1 ? station1.geometry.coordinates : [null, null];
          let coords2 = station2 ? station2.geometry.coordinates : [null, null];
  				return {
  					geometry: {
      				type: "LineString",
  						coordinates: [coords1, coords2] // Populated from 'stations' table.
  					},
  					type: "Feature",
  					id: x.tagDeployId,
  				//	properties: {
  						ts1: new Date(x.ts1 * 1e3),
  						ts2: new Date(x.ts2 * 1e3),
  						station1: x.station1,
  						station2: x.station2,
              stations: [x.station1, x.station2],
              lat1: coords1[1],
              lon1: coords1[0],
              lat2: coords2[1],
              lon2: coords2[0],
  						simultaneous: x.is_simul == "TRUE", // Is there another detection at the same time?
  						dist: 0,
              downloadDate: new Date()
  				//	}
  				};
			})
		);
    // If we're at the last page
    if (response.csv || typeof response.page === 'undefined' || (response.page > 0 && response.results.length != API_RESULTS_MAX)) {
      motusData.tracksByAnimal = motusData[tblName];
			motusData.tracksLongByAnimal = Array.from( d3.rollup(
        motusData[tblName],
				v => {
          let animal = motusData.animals_indexed.get( v[0].id );
          if (typeof animal === 'undefined') {
            animal = Object.fromEntries(Object.keys(motusData.animals[0]).map(x => [x,""]));
          }
          return ({
  					id: v[0].id,
  					tracks: v.map(x => (x.geometry.coordinates[1])),
  					tsStart: d3.min(v, x => +x.ts1/1000),
  					ts: v.map(x => +x.ts2/1000),
  					frequency:  animal.frequency,
  					species:  animal.species,
  					//stations:  v.map(x => [x.station1, x.station2]).flat(),
  					stations:  v.map(x => x.station2),
  					project:  animal.project,
  					dist: v.map(x => +x.dist),
  					is_simul:   v.map(x => x.simultaneous),
            downloadDate: d3.max(v, x => x.downloadDate)
  				})
        },
				d => d.id
			).values() );
/*
      motusData[tblName] = Array.from(d3.rollup(
        motusData[tblName],
        v => {
          let animal = motusData.animals.filter( x => x.id == v[0].id );
          return {
            tagDeployID: v.map( d => d.tag_deploy_id ),
            speciesID: v.map( d => d.species_id )
          }
        },
        x => x.deploymentID
      ).values());*/
    }

	} else if (response.request == "/stationTags") { // Done
    if (response.page == 1 || typeof response.page === 'undefined') {
      motusData[tblName] = [];
    }

    motusData[tblName] = motusData[tblName].concat( response.results );

    // If we're at the last page
    if (response.csv || typeof response.page === 'undefined' || (response.page > 0 && response.results.length != API_RESULTS_MAX)) {
      // returns a Map object
      motusData.stationDetectedTags_indexed = d3.rollup(
        motusData[tblName],
        v => {
          return {
            deploymentID: v[0].deploymentID,
            tagDeployID: v.map( d => d.tag_deploy_id ),
            speciesID: v.map( d => d.species_id )
          }
        },
        x => x.deploymentID
      )
      motusData.stationDetectedTags = Array.from(motusData.stationDetectedTags_indexed.values());

      motusData.stationDeps.forEach( x => {
        var stationTags = motusData.stationDetectedTags_indexed.get( x.id );
        if (typeof stationTags !== 'undefined') {
          x.animals = stationTags.tagDeployID;
          x.species = stationTags.speciesID;
        } else {
          x.animals = [];
          x.species = [];
        }
      });

    }
  } else if (response.request == "/tags/local") {


    if (response.page == 1 || typeof response.page === 'undefined') {
      motusData[tblName] = [];
    }

    motusData[tblName] = motusData[tblName].concat( response.results );

    // If we're at the last page
    if (response.csv || typeof response.page === 'undefined' || (response.page > 0 && response.results.length != API_RESULTS_MAX)) {

      // returns a Map object
      motusData.stationLocalTags_indexed = d3.rollup(
        motusData[tblName],
        v => {
          return {
            stationID: v[0].stationID,
            tagDeployID: v.map( d => d.tagDeployID )
          }
        },
        x => x.stationID
      )

      motusData.stationLocalTags = Array.from( motusData.stationLocalTags_indexed.values() );

      motusData.stationDeps.forEach( x => {
        var localAnimals = motusData.stationLocalTags_indexed.get( x.stationID );
        if (typeof localAnimals !== 'undefined') {
          x.localAnimals = localAnimals.tagDeployID;
        } else {
          x.localAnimals = [];
        }
      });

    }


	} else if (response.request == "/station/recent") {

    if (response.page == 1 || typeof response.page === 'undefined') {
      motusData[tblName] = [];
    }

    motusData[tblName] = motusData[tblName].concat( response.results );
    // If we're at the last page
    if (response.csv || typeof response.page === 'undefined' || (response.page > 0 && response.results.length != API_RESULTS_MAX)) {

      motusData.stationRecentData_indexed = d3.index(motusData[tblName], x => x.stationID);
      motusData.stationRecentData = motusData[tblName];

      motusData.stationDeps.forEach( x => {
        var lastData = motusData.stationRecentData_indexed.get( x.stationID );
        if (typeof lastData !== 'undefined') {
          x.lastData = lastData.date;
        } else {
          x.lastData = false;
        }
      });

    }

	}


	// If we're at API_RESULTS_MAX that means there are probably more entries to retreive
	if (response.page > 0 && response.results.length == API_RESULTS_MAX) {
		// Make a request for data again (remove leading slash)
		return requestDataAPI(response.request.substring(1), response.stationId, response.page+1);
	} else {


		// Returns true once all pages have been downloaded
		return response;

	}

}

//await requestDataAPI("gps",101,1)
//await requestDataAPI("receivers")
//await requestDataAPI("stations")
//await requestDataAPI("stationDeployments")
//await requestDataAPI("stationTags")
//await requestDataAPI("species")
//await requestDataAPI("tags")
