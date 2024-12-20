// Motus Wildlife Tracking System
// Lucas Berrigan
// 29 May 2022


// Used to time events
var testTimer = [];

// The latest database version
const DB_VERSION = 1;

// Generic function called at the start when loading any 'explore' page.
// A way to increase efficiency is to only request data that is required for the given page, but
//	in the end that doesn't save us a whole lot since most pages will be referencing data from
// 	all metadata tables anyways.
// I've included 'motusDataTableNames' here as a placeholder in case we chose to only load certain tables at first.

function getMotusData(motusDataTableNames = [], opts = {}) {

	logMessage("Get Motus Data", "info", "Startup");

	if (typeof motusDataTableNames === 'string') motusDataTableNames = [motusDataTableNames];

	if (motusDataTableNames && motusDataTableNames.length > 0) {
		motusDataTableNames.forEach(x => {
			indexedDBTables[x].get = true;
		});
	}

	// If indexedDB hasn't been loaded
	if (typeof motusData.db === 'undefined') {
		// load the indexedDB
		initiateIndexedDB(motusDataTableNames );
	} if (typeof motusData.db === 'object' && typeof motusData.db.idbdb == null) {
		// Indexed DB has been disabled (incognito?)
		loadWithoutIndexedDB(motusDataTableNames);
	} else {
		// We can't add any new tables into the indexed DB after it has been created so we'll just load anything new into memory
	//	requestDataAPI();
		logMessage("Database already initialized", "info", "IndexedDB");

	}

}

function initiateIndexedDB(tablesToDownload) {

	var promises = [];

	Object.keys(indexedDBTables).forEach(function(f){

		var url = indexedDBTables[f].file;

		if (url) {
			indexedDBTables[f].promise = API_AVAILABLE && indexedDBTables.API ? d3.json :
																		url.substr(url.lastIndexOf('.') + 1, url.length) == 'csv' ||
																		url.substr(url.lastIndexOf('=') + 1, url.length) == 'csv' ? d3.csv : d3.json;
		}

	});


	logMessage("Initiate", "info", "IndexedDB");
	// Check whether IndexedDB is supported
	if (indexedDB) {
		// Declare the database
	  motusData.db = new Dexie("dashboard");
		//
	  motusData.db.version( DB_VERSION ).stores(
			Object.fromEntries(
				Object.entries( indexedDBTables ).map( x => [ x[0], x[1].key ] )
			)
		).upgrade((trans)=>{

			logMessage(`Upgrading database to latest version (${DB_VERSION})`, "info", "IndexedDB");
			logMessage(`Deleting tables: (${trans.storeNames.join(", ")})`, "info", "IndexedDB");

			trans.storeNames.forEach(k => {
				trans.db[k].clear();
			});

		});

		logMessage(`Initiating local Motus DB with ${Object.keys(indexedDBTables).length} tables...`, "info", "IndexedDB");

	  motusData.db.open()
    	.catch ('MissingApiError',function(error){// If IndexedDB is NOT supported
					logMessage("indexedDB not supported!", "error", "IndexedDB");
					logMessage(error, "error", "IndexedDB");
					loadWithoutIndexedDB();
			}).catch (function (error) {
	        // Show e.message to user
					logMessage("Some other error: ", "error", "IndexedDB");
					logMessage(error, "error", "IndexedDB");
					loadWithoutIndexedDB();
	    });

	  motusData.db.on('ready', checkIndexedDBTables);

	} else { // If IndexedDB is NOT supported

		loadWithoutIndexedDB(tablesToDownload);

	}
}

async function loadWithoutIndexedDB(tablesToDownload) {

	indexedDB = false;

	// Download file-based tables
	if (Object.values(tablesToDownload).some( x => !x.API ) ) {
		Object.entries(tablesToDownload).filter( x => !x[1].API ).forEach(x => {
			logMessage(`Downloading table ${x[0]} locally...`, "info", "Local DB");
			downloadMotusData( x[0] ).then(response => {afterDataLoads(response, x[0], false);});
		});
	}

	// Download API tabls
	if (Object.values(tablesToDownload).some( x => x.API ) ) {
		// Download files sequentially
		(async () => {
			for (k in Object.fromEntries(Object.entries(tablesToDownload).filter( x => x[1].API ))) {
				logMessage(`Downloading table ${k} via Dashboard API...`, "info", "Local DB");
				await requestDataAPI( tablesToDownload[k].API );
				logMessage(`Finished downloading ${k}.`, "info", "Local DB");
				await afterDataLoads(false, k, false);
			}
		})();

	}
}


async function checkIndexedDBTables() {

	// Check to see which tables need to be downloaded

	logMessage("DB Ready. Checking tables...", "info", "IndexedDB");

	// Start by loading a information about each table, including dates of last download
	await getIndexedDBTable("motusTables");

	// Update 'indexedDBTables' object with stored table information (if it exists)
	if (motusData.motusTables) {
		motusData.motusTables = Object.fromEntries(motusData.motusTables.map( x => ([[x.name],x])));
		for (k in motusData.motusTables) {
			indexedDBTables[k] = {...indexedDBTables[k], ...motusData.motusTables[k]};
		}
	}

	//	Get the tables from indexedDB if the exist and return true for each instance that is successful.
	var tableStatus = await Promise.all( Object.keys(indexedDBTables).filter( x => indexedDBTables[x].get ).map( x => getIndexedDBTable(x) ) );

	logMessage("Finished checking tables", "info", "IndexedDB");

	if (tableStatus.every(x => x)) {
		logMessage("All data is up to date", "info", "IndexedDB");
		return true;
	} else if ( Object.values(indexedDBTables).some( x => x.download ) ) {

		var tablesToDownload = Object.fromEntries(Object.entries(indexedDBTables).filter( x => x[1].download ));

		logMessage(`Downloading data for ${Object.values(tablesToDownload).length} tables: ${Object.keys(tablesToDownload)}`, "info", "IndexedDB");

		if (motusData.motusTables) {
			if (NEW_DOWNLOAD_AGE < (new Date() - d3.max(motusData.motusTables, x => x.downloadDate))/(24*36e5)) {
				logMessage(`Your Motus database is out of date (more than ${NEW_DOWNLOAD_AGE} days old).<br/> Downloading a new database. This may take several seconds...`, "title");
				logMessage(`Downloading ${Object.values(tablesToDownload).length} tables...`, "info", "IndexedDB");
			} else if (NEW_DOWNLOAD_AGE > (new Date() - d3.min(motusData.motusTables, x => x.downloadDate))/(24*36e5)) {
				logMessage(`Local database is up to date`, "title");
				logMessage(`Downloading ${Object.values(tablesToDownload).length} tables...`, "info", "IndexedDB");
			}
		} else {
			logMessage("Downloading data for the first time.<br/>This may take several seconds...", "title");
			logMessage(`Downloading ${Object.values(tablesToDownload).length} tables...`, "info", "IndexedDB");
		}


		// Download file-based tables
		if (Object.values(tablesToDownload).some( x => !x.API && !x.derived ) ) {
			Promise.all(
				Object.entries(tablesToDownload).filter( x => !x[1].API && !x.derived ).map(x => {
					logMessage(`Downloading table ${x[0]} locally...`, "info", "IndexedDB");
					downloadMotusData( x[0] ).then(response => {afterDataLoads(response, x[0], true);});
				})
			);
		}

		// Download API tables
		if (Object.values(tablesToDownload).some( x => x.API ) ) {
			// Download files sequentially in case they depend on each other
			await (async () => {
				for (k in Object.fromEntries(Object.entries(tablesToDownload).filter( x => x[1].API ))) {
					logMessage(`Downloading table ${k} via Dashboard API...`, "info", "IndexedDB");
					await requestDataAPI( tablesToDownload[k].API );
					logMessage(`Finished downloading ${k}.`, "info", "IndexedDB");
					await afterDataLoads(false, k, true);
				}
			})();
		}

		// Get derived tables
		if (Object.values(tablesToDownload).some( x => x.derived ) ) {
			// Get files sequentially in case they depend on each other
			(async () => {
				for (k in Object.fromEntries(Object.entries(tablesToDownload).filter( x => x[1].derived && x[0] != "motusTables" ))) {
					logMessage(`Deriving table ${k}...`, "info", "IndexedDB");
					await getDerivedTable( k );
					logMessage(`Finished deriving data for table ${k}.`, "info", "IndexedDB");
					await afterDataLoads(false, k, true);
				}
			})();
		}

	} else {
		logMessage("There was an error while loading the data!", "error", "IndexedDB");
	}

}

async function getIndexedDBTable(tableName, forceDownload = false) {

	logMessage(`Getting table '${tableName}' via indexed DB...`, "info", "IndexedDB");

	var DB_COUNT = await motusData.db[tableName].count();

	var API_COUNT = (indexedDBTables[tableName].API && API_AVAILABLE) ?
										(await countDataAPI( indexedDBTables[tableName].API )).results[0].nrec :
										false;

	var daysSinceLastDownload = (new Date() - new Date(indexedDBTables[tableName].downloadDate))/(24*36e5);

	if (API_COUNT) logMessage(`Counted ${API_COUNT} rows`, "info", "Dashboard API");

	var IS_RECENT = (tableName == 'motusTables' || (daysSinceLastDownload < NEW_DOWNLOAD_AGE && !isNaN(daysSinceLastDownload)) ) ;
	var HAS_ROWS = DB_COUNT > 0 && (!API_COUNT || API_COUNT == DB_COUNT);
	var IS_REQUESTED = indexedDBTables[tableName].get || forceDownload;
	var IS_SOURCED = typeof indexedDBTables[tableName].file === "string" || indexedDBTables[tableName].API;// Table isn't derived from other tables, but sourced from API or a file.

	if (HAS_ROWS && IS_RECENT && IS_REQUESTED) {

		logMessage(`Table '${tableName}' exists and is up to date.`, "info", "IndexedDB");

		let tableData = await motusData.db[tableName].toArray();

		logMessage(`Table '${tableName}' has been loaded from IndexedDB.`, "info", "IndexedDB");

		indexedDBTables[tableName].done = true;

		afterDataLoads(tableData, tableName, false);

	} else if (HAS_ROWS && IS_SOURCED && !IS_REQUESTED) {

		logMessage(`Table '${tableName}' exists, but won't be loaded entirely.`, "info", "IndexedDB");
		indexedDBTables[tableName].done = true;

	} else {
		if (forceDownload) {
			logMessage(`Forcing download of ${tableName}.`, "info","IndexedDB");
			indexedDBTables[tableName].get = true;
		} else if (IS_REQUESTED) {
			logMessage(`Requesting download of ${tableName}.`, "info","IndexedDB");
		}
		if (IS_SOURCED) {
			if (!IS_RECENT) {
				logMessage(`Table '${tableName}' is older than ${NEW_DOWNLOAD_AGE} days and needs to be downloaded again.`, "info", "IndexedDB");
			} else {
				logMessage(`Table '${tableName}' doesn't exist and needs to be downloaded.`, "info", "IndexedDB");
			}
		} else {
			indexedDBTables[tableName].derived = true;
		}
		indexedDBTables[tableName].download = true;
		if (tableName == "regions") {
			var success = await Promise.all(["stationDeps", "animals", "polygons"].map( async x => {
					if (!indexedDBTables[x].get) {
						logMessage(`Table '${x}' is missing and needs to be downloaded.`, "info", "IndexedDB");
						indexedDBTables[x].get = true;
						if (!motusData[x] || motusData[x].length == 0) return getIndexedDBTable(x);
					}
				})
			);
			console.log(success);
		}
		if (tableName == "species") {
			indexedDBTables.animals.get = true;
			if (!motusData.animals || motusData.animals.length == 0) await getIndexedDBTable("animals");
		}
		if (tableName == "animals") {
			indexedDBTables.tags.download = true;
			indexedDBTables.tags.get = true;
		}
		if (tableName == "stationDeps") {
			["antennas","stations", "stationDetectedTags", "stationLocalTags", "stationRecentData"].forEach( x => {
				if (!indexedDBTables[x].get) {
					indexedDBTables[x].get = true;
					if (!motusData[x] || motusData[x].length == 0) return getIndexedDBTable(x);
				}
			})
		}
	}

	return indexedDBTables[tableName].done;
}
async function downloadMotusData( tableName ) {

	logMessage(`Downloading ${tableName} data locally...`);
	var downloadedData = await indexedDBTables[tableName].promise( indexedDBTables[tableName].file );
	logMessage("Processing data...");
	return processRawData( downloadedData, tableName );

}

async function getDerivedTable(tableName, forceDownload = false) {

	if (tableName == "regions") {

		indexedDBTables[tableName].done = await getRegionData(); // Returns true based if successful

	}

	return checkIfFinished();

}

function afterDataLoads(data, tableName, updateIndexedDB) {

	//	Write the data to the motusData global object (if data exist)
	//		API calls handle this separately so `data` will be false.
	if (data) {
		motusData[tableName] = data;
	}

	// Indicate that the table has loaded
	indexedDBTables[tableName].done = true;

	// Some tables are linked together (contain data from one another) so here I'm
	//	inserting data from/into different tables after each one loads, based on parameters in 'indexedDBTables'
	handleLinkedTables( tableName, updateIndexedDB );

	// indexedDB only gets updated here
	if (updateIndexedDB)	updateMotusDB(tableName, motusData[tableName]);

	// Proceed to load the dashboard only once all the requested data has been loaded
	return checkIfFinished();
}


// Each table has a set of required tables from which data is derived.
function handleLinkedTables( tableName, updateIndexedDB ) {

	if ( ["stationRecentData", "stationLocalTags", "stationDetectedTags"].includes(tableName) ) {
		var indexVar = tableName == 'stationDetectedTags' ? "deploymentID" : "stationID";
		motusData[tableName+"_indexed"] =  d3.index(motusData[tableName], x => x[indexVar]);
		if (updateIndexedDB) {
			updateMotusDB("stationDeps", motusData.stationDeps);
		}
	}

	if (tableName == "antennas") {
		motusData.antennaDeploymentsByStationDeployment = d3.group(
			motusData.antennas, x => x.id
		)
	}
	if (tableName == "stationDeps") {
		motusData.stationDepsByRegions = d3.group(motusData.stationDeps, d => d.country);
		motusData.stationDepsByProjects = d3.group(motusData.stationDeps, d => d.project);
	} else if (tableName == "stations") {
		motusData.stationsByProject = d3.group(motusData.stations, x => x.project);
		motusData.stations_indexed = d3.index(motusData.stations, x => x.id);
		if (updateIndexedDB) {
			motusData.stations.forEach( (d, k, arr) => {
				let stationDeps = motusData.stationDeps.filter( x => x.stationID == d.id );
				d.nDeps = stationDeps.length;
				if (stationDeps.length > 0) {
					d.stationDeps = stationDeps.map( x => x.id );
					d.animals = stationDeps.map( x => x.animals ).flat();
					d.species = stationDeps.map( x => x.species ).flat();
					d.nAnimals = [...new Set(d.animals)].length;
					d.nSpecies = [...new Set(d.species)].length;
					d.dtStart = d3.min(stationDeps, x => x.dtStart );
					d.dtEnd = d3.max(stationDeps, x => x.dtEnd == null ? new Date() : x.dtEnd );

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
					arr[k] = { ...Object.fromEntries(Object.keys(motusData.stationDeps[0]).map(x => [x,""])), ...d}
				}
			});
			updateMotusDB("stationDeps", motusData.stationDeps);
		}
	} else if (tableName == "tags") {
		 motusData.tags_indexed = d3.index(motusData[tableName], x => x.id);
	} else if (tableName == "animals") {
		if (updateIndexedDB) {
			motusData.animals.forEach( (d, k, arr) => {
				let tag = motusData.tags_indexed.get( d.tagID );
				if (typeof tag !== 'undefined') {
					arr[k] = { ...tag, ...d};
				} else {
					arr[k] = { ...Object.fromEntries(Object.keys(motusData.tags.entries().next().value[1]).map(x => [x,""])), ...d}
			//      logMessage("No data for station " + d.id, "warn");
				}
			});
		}
		motusData.animals_indexed = d3.index( motusData.animals, x => x.id );
		motusData.animalsByRegions = d3.group(motusData.animals, d => d.country, d => d.id);
		motusData.animalsByProjects = d3.group(motusData.animals, d => d.project, d => d.id);
		motusData.animalsByProject = d3.group(motusData.animals, x => x.project);
	} else if (tableName == "species" && updateIndexedDB) {
		motusData.species.forEach( (d, k, arr) => {
			let animals = motusData.animals.filter( x => x.species == d.id );
			arr[k].animals = animals.map( x => x.id );
			arr[k].stations = [...new Set( animals.map( x => x.stations ).flat() )];
			arr[k].projects = animals.map( x => x.project );
		});
	} else if (tableName == "regions") {
		logMessage("Process data: Getting regions by code");
		motusData.regionByCode = d3.group(motusData.regions,  d => d.iso_a2);
	}

	//	return tableLinks[tableName];

}

function checkIfFinished() {

	if ( Object.values(indexedDBTables).every( x => x.done || !(x.get  || x.download) ) ) {
	//if ( Object.values(indexedDBTables).every( x => x.done || (!x.get && !x.file) ) ) {
		logMessage("", "title");
		logMessage(`Finished loading data.`, 'info', 'IndexedDB');
		logMessage(`There were ${Object.values(indexedDBTables).filter( x => x.downloaded ).length} tables downloaded and `+
								`${Object.values(indexedDBTables).filter( x => !x.downloaded ).length} tables loaded from the local database.`, 'info', 'IndexedDB');
		logMessage("Loading dashboard content...", 'info', 'IndexedDB');

		loadDashboardContent();
		return true;

	} else {

		// Not yet finished
		return false;

	}
}


function updateMotusDB(tableName, tableData) {

		logMessage(`Adding '${tableName}'...`, 'info', 'IndexedDB');
		console.log(tableData);
		motusData.db[tableName].bulkPut(tableData).then(function(lastKey) {
			logMessage(`Done adding '${tableName}' table.`, 'info'	, 'IndexedDB');
			// Delete vars that shouldn't be stored
			["promise","get","download","API","FILE","done"].forEach(k => {delete indexedDBTables[tableName][k];});
			console.log({...indexedDBTables[tableName],...({name: tableName, downloadDate: new Date()})});
			motusData.db.motusTables.put( {...indexedDBTables[tableName],...({name: tableName, downloadDate: new Date()})} )
		}).catch(Dexie.BulkError, function (e) {
			logMessage(`Error adding ${e.failures.length} of ${tableData.length} rows to '${tableName}' table.`, 'error', 'IndexedDB');
		});

}


async function getSelections({
	selectedRegions = false,
	selectedProjects = false,
	selectedSpecies = false,
	selectedStations = false,
	selectedAnimals = false
} = {}) {

	motusData.tracksByAnimal = {};
	motusData.tracksBySpecies = {};
//	motusData.tracksByStation = {};
	motusData.stationHits = {};
	motusData.animalsByDayOfYear = [...Array(367).fill(0).map(x => ({local: [], remote: [], visiting: []}))];
	motusData.animalsByHourOfDay = [...Array(24).fill(0).map(x => ({local: [], remote: [], visiting: []}))];

	motusData.allTimes = [];

	motusFilter.animalsDetected = [];

	motusData.selectedTracks = {}


		if (dataType == 'regions') {

			motusData.selectedRegions = getSelectedRegions();

			// Local stations are those deployed within the region
			motusData.selectedStations = getSelectedStations({ key: "country", values: motusFilter.selections});
			motusData.selectedStationDeps = getSelectedStationDeps();
			motusFilter.selectedStations = motusData.selectedStations.map( x => x.id );
			motusFilter.selectedStationDeps = motusData.selectedStationDeps.map( x => x.id );

			// Local animals are those tagged within the region
			motusData.localAnimals = await getSelectedAnimals({ key: "country", values: motusFilter.selections});
			// Store an array of animals here as we'll need this array in multiple locations later on
			motusFilter.localAnimals = await motusData.localAnimals.map( x => x.id );
			// Visiting animals are those detected at local stations, but were not tagged locally
			motusData.visitingAnimals = await getSelectedAnimals( [...new Set(motusData.selectedStations.map( x => x.animals ).flat()) ].filter( x => !motusFilter.localAnimals.includes(x) ) );
			// Store an array of animals here as we'll need this array in multiple locations later on
			motusFilter.visitingAnimals = await motusData.visitingAnimals.map( x => x.id );

			motusFilter.selectedAnimals = await motusFilter.localAnimals.concat( motusFilter.visitingAnimals );
			motusData.selectedAnimals = await motusData.localAnimals.concat( motusData.visitingAnimals );



			testTimer.push([new Date(), "Get selections: local species"]);
			motusData.localSpecies = await getSelectedSpecies( motusData.localAnimals );
			testTimer.push([new Date(), "Get selections: visiting species"]);
			motusData.visitingSpecies = await getSelectedSpecies( motusData.visitingAnimals );
			testTimer.push([new Date(), "Get selections: all species"]);
			motusData.selectedSpecies = await [...new Set(motusData.visitingSpecies.concat( motusData.localSpecies ))];

			motusData.selectedLocalStations = motusData.selectedStations;
			motusData.selectedVisitingStations = await [...new Set( motusData.localAnimals.map( x => x.stations ).flat() )].filter( x => x!="NA");


			// Animal regions have tags deployed
			motusData.selectedAnimalRegions = await getSelectedRegions({ key: "iso_a2", values: [...new Set(motusData.localAnimals.map( x => x.country ))] });
			// Station projects have stations deployed
			motusData.selectedStationRegions = await getSelectedRegions({ key: "iso_a2", values: [...new Set(motusData.selectedStations.map( x => x.country ))] });

			// Routes consist of tracks by local animals and visiting animals
			motusData.tracksByAnimal = await getAnimalRoutes( motusFilter.selectedAnimals );
			motusData.tracksLong = (await getTracksLong( motusFilter.selectedAnimals )).filter( x => typeof x !== 'undefined' );
			motusData.tracksLongByAnimal = await getSelectedTracksLongByAnimal( motusFilter.selectedAnimals );
		//	motusData.selectedTracks = await getSelectedTracks( [...new Set(Object.values(motusData.tracksByAnimal).flat())] );

			// Animal projects have tags deployed
			motusData.selectedAnimalProjects = await getSelectedProjects( [...new Set(motusData.selectedAnimals.map( x => x.project ))] );
			// Station projects have stations deployed
			motusData.selectedStationProjects = await getSelectedProjects( [...new Set(motusData.selectedStations.map( x => x.project ))] );
			motusData.selectedProjects = await getSelectedProjects( motusData.selectedStations.map( x => x.project ).concat(motusData.selectedAnimals.map( x => x.project )).filter(onlyUnique) );

			motusFilter.selectedAnimalsDtStart = await d3.min( motusData.selectedAnimals, x => x.dtStart );
			motusFilter.selectedAnimalsDtEnd = await d3.max( motusData.selectedAnimals, x => x.dtEnd );

			motusFilter.selectedStationsDtStart = await d3.min( motusData.selectedStations, x => x.dtStart );
			motusFilter.selectedStationsDtEnd = await d3.max( motusData.selectedStations, x => x.dtEnd );

			motusFilter.selectedDtStart = await d3.min( [motusFilter.selectedAnimalsDtStart, motusFilter.selectedStationsDtStart] );
			motusFilter.selectedDtEnd = await d3.max( [motusFilter.selectedAnimalsDtEnd , motusFilter.selectedStationsDtEnd] );

		} else if (dataType == 'projects') {

				testTimer.push([new Date(), "Get selections: projects"]);
			motusData.selectedProjects = getSelectedProjects();

							testTimer.push([new Date(), "Get selections: stations"]);
			// Local stations are those deployed within the project
			motusData.selectedStations = getSelectedStations({ key: "project", values: motusFilter.selections});
			motusData.selectedStationDeps = getSelectedStationDeps();
			motusFilter.selectedStations = motusData.selectedStations.map( x => x.id );
			motusFilter.selectedStationDeps = motusData.selectedStationDeps.map( x => x.id );

			testTimer.push([new Date(), "Get selections: local animals"]);
			// Local animals are those tagged within the project
			motusData.localAnimals = await getSelectedAnimals({ key: "project", values: motusFilter.selections}).then(async (localAnimals) => {

				// Store an array of animals here as we'll need this array in multiple locations later on
				motusFilter.localAnimals = localAnimals.map( x => x.id );
				testTimer.push([new Date(), "Get selections: visiting animals"]);

				// Visiting animals are those detected at the station, but were not tagged locally
				// This takes a long time when there are a lot of animals
				motusFilter.visitingAnimals = [...new Set( motusData.selectedStations.map( x => x.animals ).flat() )].filter( x => !motusFilter.localAnimals.includes(x) );
				testTimer.push([new Date(), "Get selections: visiting animals2"]);

				testTimer.push([new Date(), "Get selections: animals"]);
				motusFilter.selectedAnimals = motusFilter.localAnimals.concat( motusFilter.visitingAnimals );

				// This takes a long time when there are a lot of animals
				motusData.visitingAnimals = await getSelectedAnimals( motusFilter.visitingAnimals ).then(async (visitingAnimals) => {


					testTimer.push([new Date(), "Get selections: animals2"]);
					// This takes a long time when there are a lot of animals
					motusData.selectedAnimals = localAnimals.concat( visitingAnimals );

					testTimer.push([new Date(), "Get selections: local species"]);
					motusData.localSpecies = await getSelectedSpecies( localAnimals );
					testTimer.push([new Date(), "Get selections: visiting species"]);
					motusData.visitingSpecies = await getSelectedSpecies( visitingAnimals );
				//	console.log(getSelectedSpecies( visitingAnimals ));
					testTimer.push([new Date(), "Get selections: all species"]);
					motusData.selectedSpecies = await getSelectedSpecies( motusData.selectedAnimals );


					motusData.selectedLocalStations = motusData.selectedStations;
					motusData.selectedVisitingStations = [...new Set( localAnimals.map( x => x.stations ).flat() )].filter( x => x!="NA");


//					testTimer.push([new Date(), `Get selections - animal paths from ${motusFilter.selectedAnimals.length} animals`]);
					// Routes consist of tracks by local animals and visiting animals

					testTimer.push([new Date(), `Get selections - animal paths from ${motusFilter.selectedAnimals.length} animals`]);
					motusData.tracksByAnimal = await getAnimalRoutes( motusFilter.selectedAnimals );
					testTimer.push([new Date(), `Get selections - tracks from ${Object.keys(motusData.tracksByAnimal).length} animals`]);
					motusData.tracksLong = (await getTracksLong( motusFilter.selectedAnimals )).filter( x => typeof x !== 'undefined' );
				//	motusData.selectedTracks = await getSelectedTracks( [...new Set(Object.values(motusData.tracksByAnimal).flat())] );
					testTimer.push([new Date(), `Get selections - LONG animal paths from ${motusFilter.selectedAnimals.length} animals`]);
					motusData.tracksLongByAnimal = await getSelectedTracksLongByAnimal( motusFilter.selectedAnimals );

			//		testTimer.push([new Date(), "Get selections - regions"]);
					// Animal regions have tags deployed
			//		motusData.selectedAnimalRegions = getSelectedRegions({ key: "iso_a2", values: [...new Set(motusData.selectedAnimals.map( x => x.country ))] });
					// Station projects have stations deployed
			//		motusData.selectedStationRegions = getSelectedRegions({ key: "iso_a2", values: [...new Set(motusData.selectedStations.map( x => x.country ))] });
			//		motusData.selectedRegions = getSelectedRegions({ key: "iso_a2", values: motusData.selectedStations.map( x => x.country ).concat( [...new Set(motusData.selectedAnimals.map( x => x.country ) )] ) });


					testTimer.push([new Date(), "Get selections - dates"]);
					motusFilter.selectedAnimalsDtStart = await d3.min( motusData.selectedAnimals, x => x.dtStart );
					motusFilter.selectedAnimalsDtEnd = await d3.max( motusData.selectedAnimals, x => x.dtEnd );

					motusFilter.selectedStationsDtStart = await d3.min( motusData.selectedStations, x => x.dtStart );
					motusFilter.selectedStationsDtEnd = await d3.max( motusData.selectedStations, x => x.dtEnd );

					motusFilter.selectedDtStart = await d3.min( [motusFilter.selectedAnimalsDtStart, motusFilter.selectedStationsDtStart] );
					motusFilter.selectedDtEnd = await d3.max( [motusFilter.selectedAnimalsDtEnd , motusFilter.selectedStationsDtEnd] );

					testTimer.push([new Date(), "Get selections - done"]);
					return visitingAnimals;

				});

				return localAnimals;

			});

			// Animal projects have tags deployed
			motusData.selectedAnimalProjects = await getSelectedProjects( [...new Set(motusData.localAnimals.map( x => x.project ))] );
			// Station projects have stations deployed
			motusData.selectedStationProjects = await getSelectedProjects( [...new Set(motusData.selectedStations.map( x => x.project ))] );

		} else if (dataType == 'stations') {

			motusData.selectedStations = getSelectedStations();
			motusData.selectedStationDeps = getSelectedStationDeps();
			motusFilter.selectedStations = motusFilter.selections;
			motusFilter.selectedStationDeps = motusData.selectedStationDeps.map( x => x.id );

			// Local animals are those tagged within 10 km of the station
			motusFilter.localAnimals = [...new Set(motusData.selectedStations.map( x => x.localAnimals ).flat())];
			// Local animals are those tagged within the project
			motusData.localAnimals = await getSelectedAnimals( motusFilter.localAnimals );
			// Visiting animals are those detected at the station, but were not tagged locally
			motusFilter.visitingAnimals = [...new Set(motusData.selectedStations.map( x => x.animals ).flat())].filter( x => !motusFilter.localAnimals.includes(x) );
			motusData.visitingAnimals = getSelectedAnimals( motusFilter.visitingAnimals );

			motusFilter.selectedAnimals = await motusFilter.localAnimals.concat( motusFilter.visitingAnimals );
			motusData.selectedAnimals = await getSelectedAnimals( motusFilter.selectedAnimals );
			motusData.selectedSpecies = await getSelectedSpecies( motusData.selectedAnimals );

			motusData.tracksByAnimal = await getAnimalRoutes( motusFilter.selectedAnimals );
			motusData.tracksLong = (await getTracksLong( motusFilter.selectedAnimals )).filter( x => typeof x !== 'undefined' );
			motusData.tracksLongByAnimal = await getSelectedTracksLongByAnimal( motusFilter.selectedAnimals );
			motusData.selectedTracks = motusData.tracksLong.filter( x => motusFilter.selections.includes(x.station1) | motusFilter.selections.includes(x.station2) );

			motusData.selectedAnimalProjects = await getSelectedProjects( [...new Set(motusData.selectedAnimals.map( x => x.project ))] );
			motusData.selectedStationProjects = getSelectedProjects( [...new Set(motusData.selectedStations.map( x => x.project ))] );
			motusData.selectedProjects = await getSelectedProjects( [...new Set(motusData.selectedStations.map( x => x.project ).concat(motusData.selectedAnimals.map( x => x.project )))] );

	//		motusData.selectedAnimalRegions = await getSelectedRegions({ key: "iso_a2", values: [...new Set(motusData.selectedAnimals.map( x => x.country ))] });
	//		motusData.selectedStationRegions = getSelectedRegions({ key: "iso_a2", values: [...new Set(motusData.selectedStations.map( x => x.country ))] });
	//		motusData.selectedRegions = await getSelectedRegions({ key: "iso_a2", values: [...new Set(motusData.selectedStations.map( x => x.country ).concat(motusData.selectedAnimals.map( x => x.country )))] });

			motusFilter.selectedDtStart = await d3.min( motusData.selectedStations, x => x.dtStart );
			motusFilter.selectedDtEnd = await d3.max( motusData.selectedStations, x => x.dtEnd );

		} else if (dataType == 'species') {

			motusData.selectedSpecies = getSelectedSpecies();
			motusData.selectedAnimals = await getSelectedAnimals({ key: "species", values: motusFilter.selections });
			motusFilter.selectedAnimals = await motusData.selectedAnimals.map( x => x.id );

			motusData.tracksByAnimal = await getAnimalRoutes( motusFilter.selectedAnimals );
			motusData.tracksLong = (await getTracksLong( motusFilter.selectedAnimals )).filter( x => typeof x !== 'undefined' );
			motusData.tracksLongByAnimal = await getSelectedTracksLongByAnimal( motusFilter.selectedAnimals );
	//		motusData.selectedTracks = await getSelectedTracks( [...new Set(Object.values(motusData.tracksByAnimal).flat())] );

			motusData.selectedStations = await getSelectedStations( [...new Set(motusData.tracksLong.map(x => x.stations).flat())] );
			motusData.selectedStationDeps = await getSelectedStationDeps();
			motusFilter.selectedStations = await motusData.selectedStations.map( x => x.id );
			motusFilter.selectedStationDeps = await motusData.selectedStationDeps.map( x => x.id );

			motusData.selectedAnimalProjects = getSelectedProjects( [...new Set(motusData.selectedAnimals.map( x => x.project ))] );
			motusData.selectedStationProjects = await getSelectedProjects( [...new Set(motusData.selectedStations.map( x => x.project ))] );
			motusData.selectedProjects = await getSelectedProjects( [...new Set(motusData.selectedStations.map( x => x.project ).concat(motusData.selectedAnimals.map( x => x.project )))] );

	//		motusData.selectedAnimalRegions = getSelectedRegions({ key: "iso_a2", values: [...new Set(motusData.selectedAnimals.map( x => x.country ))] });
	//		motusData.selectedStationRegions = await getSelectedRegions({ key: "iso_a2", values: [...new Set(motusData.selectedStations.map( x => x.country ))] });
	//		motusData.selectedRegions = await getSelectedRegions({ key: "iso_a2", values: [...new Set(motusData.selectedStations.map( x => x.country ).concat(motusData.selectedAnimals.map( x => x.country )))] });

			// Species don't have a sensible concept of 'local' and 'visiting' animals
			// But we still need to create the variables for the scripts to work.
			// So here local animals are just conspecifics
			motusFilter.localAnimals = motusFilter.selectedAnimals;
			motusData.localAnimals = motusData.selectedAnimals;
			// Perhaps we could introduce the concept of heterospecific animals which
			// could take up the space of 'visiting' animals
			motusFilter.visitingAnimals = [];
			motusData.visitingAnimals = [];


			motusFilter.selectedDtStart = await d3.min( motusData.selectedAnimals, x => x.dtStart );
			motusFilter.selectedDtEnd = await d3.max( motusData.selectedAnimals, x => x.dtEnd );

		} else if (dataType == 'animals') {

			motusData.selectedAnimals = await getSelectedAnimals();
			motusData.selectedSpecies = await getSelectedSpecies( [...new Set(motusData.selectedAnimals.map( x => x.species ))] );
			motusFilter.selectedAnimals = await motusData.selectedAnimals.map( x => x.id );

			motusData.tracksByAnimal = await getAnimalRoutes( motusFilter.selectedAnimals );
			motusData.tracksLong = (await getTracksLong( motusFilter.selectedAnimals )).filter( x => typeof x !== 'undefined' );
			motusData.tracksLongByAnimal = await getSelectedTracksLongByAnimal( motusFilter.selectedAnimals );
		//	motusData.selectedTracks = await getSelectedTracks( [...new Set(Object.values(motusData.tracksByAnimal).flat())] );

			motusData.selectedStations = await getSelectedStations( [...new Set(motusData.tracksLong.map(x => x.stations).flat())] );
			motusData.selectedStationDeps = await getSelectedStationDeps();
			motusFilter.selectedStations = await motusData.selectedStations.map( x => x.id );
			motusFilter.selectedStationDeps = await motusData.selectedStationDeps.map( x => x.id );

			motusData.selectedAnimalProjects = await getSelectedProjects( [...new Set(motusData.selectedAnimals.map( x => x.project ))] );
			motusData.selectedStationProjects = await getSelectedProjects( [...new Set(motusData.selectedStations.map( x => x.project ))] );
			motusData.selectedProjects = await getSelectedProjects( [...new Set(motusData.selectedStations.map( x => x.project ).concat(motusData.selectedAnimals.map( x => x.project )))] );

	//		motusData.selectedAnimalRegions = await getSelectedRegions({ key: "iso_a2", values: [...new Set(motusData.selectedAnimals.map( x => x.country ))] });
//			motusData.selectedStationRegions = await getSelectedRegions({ key: "iso_a2", values: [...new Set(motusData.selectedStations.map( x => x.country ))] });
	//		motusData.selectedRegions = await getSelectedRegions({ key: "iso_a2", values: [...new Set(motusData.selectedStations.map( x => x.country ).concat(motusData.selectedAnimals.map( x => x.country )))] });

			// Like species, animals don't have a sensible concept of 'local' and 'visiting' animals
			// But we still need to create the variables for the scripts to work.
			// So here local animals are just conspecifics
			motusFilter.localAnimals = await motusFilter.selectedAnimals;
			motusData.localAnimals = await motusData.selectedAnimals;
			// Perhaps we could introduce the concept of 'travelling with' animals which
			// could take up the space of 'visiting' animals
			motusFilter.visitingAnimals = [];
			motusData.visitingAnimals = [];


			motusFilter.selectedDtStart = await d3.min( motusData.selectedAnimals, x => x.dtStart );
			motusFilter.selectedDtEnd = await d3.max( motusData.selectedAnimals, x => x.dtEnd );

		}

		motusData.tracksByStationDepartures = d3.group(motusData.tracksLong, x => x.station1);
		motusData.tracksByStationArrivals = d3.group(motusData.tracksLong, x => x.station2);

	//	getSelectedTrackData( motusData.selectedTracks, reload = true );
		motusData.tracksIndexedByAnimal = d3.index(motusData.tracksLongByAnimal, x => x.id);

		motusData.tracksByAnimal = d3.index(motusData.tracksLongByAnimal, x => x.id)
		motusData.tracksByAnimal = d3.index(motusData.tracksLongByAnimal, x => x.id)
	  motusData.animalsIndexed = d3.index( motusData.animals, x => x.id );
	  motusData.speciesIndexed = d3.index( motusData.species, x => x.id );

		if (typeof selectionNames === "undefined") {
			motusData.selectionNames = Object.fromEntries( motusData["selected" + firstToUpper(dataType)].map( x => [x.id, x.name] ) );
		} else {
			motusData.selectionNames = selectionNames;
		}

		getDetectionsByTimeStep()
//}

	function getSelectedRegions(selections) {

		return (typeof selections !== "object" ?
			motusData.polygons.filter(
				x =>
				motusFilter.selections.includes(x.properties.iso_a2)
			).map(
				x => ({
					geometry:x.geometry,
					properties: x.properties,
					id: x.properties.iso_a2,
					name: x.properties.name,
					type: x.type
				})
			) :
			typeof selections.key !== 'undefined' ?
				motusData.polygons.filter(
					x =>
					selections.values.includes(x.properties[selections.key])
				).map(
					x => ({
						geometry:x.geometry,
						properties: x.properties,
						id: x.properties[selections.key],
						name: x.properties.name,
						type: x.type
					})
				) :
				motusData.polygons.filter(
					x =>
					selections.includes(x.properties.iso_a2)
				).map(
					x => ({
						geometry:x.geometry,
						properties: x.properties,
						id: x.properties.iso_a2,
						name: x.properties.name,
						type: x.type
					})
				)).map(
					x => ({
						...x,
						...motusData.regions.filter( k => k.id == x.id)[0]
					})
				);

	}

	function getSelectedProjects(selections) {

		return typeof selections !== "object" ?
			motusData.projects.filter(
				x => motusFilter.projects.includes(x.id)
						||
						(
							dataType == 'projects' &&
							motusFilter.selections.includes(x.id)
						)
			) :
			motusData.projects.filter(
				x => selections.includes(x.id)
			);

	}

	function getSelectedSpecies(selections) {
		if (selections && typeof selections[0] === "object") {
			selections = selections.map( x => x.species );
		}
		var toReturn = typeof selections !== "object" ?
			motusData.species.filter(
				x => motusFilter.species.includes(x.id)
						||
						(
							dataType == 'species' &&
							motusFilter.selections.includes(x.id)
						)
			) :
			motusData.species.filter(
				x => selections.includes(x.id)
			);

		toReturn.forEach( x => {
			x.name = x[currLang];
		});

		return toReturn;

	}

	function getSelectedStations(selections) {

		return typeof selections !== "object" ?
			motusData.stations.filter(
				x => motusFilter.stations.includes(x.id)
						||
						(
							dataType == 'stations' &&
							motusFilter.selections.includes(x.id)
						)
			) :
			typeof selections.key !== 'undefined' ?
				motusData.stations.filter(
					x => selections.values.includes(x[selections.key])
				) :
				motusData.stations.filter(
					x => selections.includes(x.id)
				);

	}

	function getSelectedStationDeps(selections) {
		if (typeof selections !== "object") {
			var selections = motusData.selectedStations.map( x => x.stationDeps ).flat()
			return motusData.stationDeps.filter(
					x => selections.includes( x.id )
				);
		} else {
			return typeof selections.key !== 'undefined' ?
					motusData.stationDeps.filter(
						x => selections.values.includes(x[selections.key])
					) :
					motusData.stationDeps.filter(
						x => selections.includes( x.id )
					);
		}

		return

	}

	function getSelectedAnimals(selections) {
		if (indexedDB) {
			return typeof selections === 'object' && typeof selections.key !== 'undefined' ?
				motusData.db.animals
					.where(selections.key)
					.anyOf(selections.values)
					.toArray()
					.then( x =>
						x.map( d =>
							{
								let species = motusData.species.filter( sp => sp.id == d.species );
								return {...d,
												...{name: species.length > 0 ? species[0][currLang] : "Undefined species"
													}
												};
							})
							.filter( d =>
								(typeof d.dtStart !== 'undefined') && !isNaN(d.dtStart.valueOf())
							)
					) :
				motusData.db.animals.bulkGet(
				typeof selections !== "object" ?
					(
						dataType == 'animals' ?
						motusFilter.selections :
						motusFilter.stations
					) : selections
				).then( x => x.filter( x => typeof x !== 'undefined') )
		} else {
			return undefined;
		}

	}



}

// In order to save loading time, this script saves all tracks by animals in the local database
// and only updates the tracks when new data is added.
// The problem is how to identify when new tracks are added - it might have to be a query to the server
//	- Server: are there tracks to update?
// Whenever new tracks are added, there should be a small enough number that it won't be too resource
// intensive to loop through all the new tracks to update the pre-existing table.


// This function takes an array of animal IDs and returns an array of animal IDs and routes.
// It first searches the indexeddb table 'tracksByAnimal' and then takes the animals it can't
// find and then searches through all the tracks for them.
async function getAnimalRoutes(animals) {

	animals = typeof animals === "undefined" ?
		motusData.selectedAnimals.map( x => x.id ) :
		typeof animals === "object" ?
			animals :
			[ animals ];

	if (indexedDB) {
		return motusData.db.tracksByAnimal.bulkGet(animals);/*.then( d => {

			// Return animals which don't have tracks in the db
			var animalsToSearch = animals.filter( (a,i) => !d[i] );
			// If there are animals that need tracks
			if (animalsToSearch.length > 0)	{
				// Create a new empty array that will later be added to the db
				var newTracksByAnimal = [];
				//

				motusData.tracks.forEach( t => {

					t.animal.filter( a => animalsToSearch.includes(a) ).forEach( a => {

						newTracksByAnimal.push({id: a, route: t.route});

					});

				});

				newTracksByAnimal = Array.from(d3.rollup(newTracksByAnimal, v => ({id: v[0].id, route: v.map( x => x.route )}), k => k.id ).values());

				var newTrackAnimalIDs = newTracksByAnimal.map( x => x.id );

	//			console.log(animalsToSearch.filter( a => !newTrackAnimalIDs.includes(a) ));

				animalsToSearch.filter( a => !newTrackAnimalIDs.includes(a) ).forEach( a => {
					newTracksByAnimal.push({id: a, route: []});
				})


				// Update the local database with the new tracks
			//	motusData.db.tracksByAnimal.bulkPut(newTracksByAnimal).then(()=>{logMessage(`Added ${newTracksByAnimal.length} rows to 'tracksByAnimal' table.`);})


				console.log("TEST: %o", d)
				// Combine the new tracks with the ones taken from the database.
				d = d.filter( x => typeof x !== 'undefined' ).concat(newTracksByAnimal);


			}
			console.log("TEST: %o", d)
			return Object.fromEntries( d.map( x => Object.values(x) ) );

		});*/
	} else {
		return undefined;
	}

}

async function getSelectedTracksLongByAnimal( animals ) {
	if (indexedDB) {
		if (animals) {
			let data = await motusData.db.tracksLongByAnimal.bulkGet( animals );
			return data.filter(x => typeof x !== 'undefined' );
		}	else {
			return await motusData.db.tracksLongByAnimal.toArray();
		}
	} else {
		// Get it from the canned supply
	}

}

function getSelectedTracks( routes ) {
	if (indexedDB) {
		return motusData.db.tracks.bulkGet( routes );
	} else {
		return undefined;
	}

}

function getTracksLong( animals ) {
	if (indexedDB) {
		return motusData.db.tracksByAnimal.bulkGet( animals );
	} else {
		return undefined;
	}

}

function getDetectionsByTimeStep() {
	// Local animals first
	motusFilter.localAnimals.forEach( animalID => {

		let tracks = motusData.tracksIndexedByAnimal.get( animalID );

		if (typeof tracks !== 'undefined') {
			tracks.ts.forEach( (ts, i) => {
				if (dataType != 'stations' || motusFilter.selectedStations.includes( tracks.stations[i] ) ) {
					motusData.animalsByDayOfYear[moment(ts * 1000).dayOfYear()].local.push( animalID );
					motusData.animalsByHourOfDay[moment(ts * 1000).format("H")].local.push( animalID );
				} else {
					motusData.animalsByDayOfYear[moment(ts * 1000).dayOfYear()].remote.push( animalID );
					motusData.animalsByHourOfDay[moment(ts * 1000).format("H")].remote.push( animalID );
				}
			});
		}

	});

	motusFilter.visitingAnimals.forEach( animalID => {

		let tracks = motusData.tracksIndexedByAnimal.get( animalID );
		if (typeof tracks !== 'undefined') {
			tracks.ts.forEach( (ts, i) => {
				if (dataType != 'stations' || motusFilter.selectedStations.includes( tracks.stations[i] ) ) {
					motusData.animalsByDayOfYear[moment(ts * 1000).dayOfYear()].visiting.push( animalID );
					motusData.animalsByHourOfDay[moment(ts * 1000).format("H")].visiting.push( animalID );
				}
			});
		}

	});

	motusData.allTimes =  motusData.tracksLongByAnimal.map( x => x.ts).flat();
}


function getSelectedTrackData(selectedTracks, reload = false) {

	if (reload || typeof motusData.selectedTracks === 'undefined' || Object.values(motusData.selectedTracks).length == 0) {

		motusData.selectedTracks = {};

		logMessage(`Processing ${selectedTracks.length} tracks...`)

		console.log(selectedTracks);

		selectedTracks.forEach(function(v) {

			var dtStart = v.dtStartList;
			var dtEnd = v.dtEndList;
			var tsStart = v.tsStart;
			var tsEnd = v.tsEnd;
			var allTimes = [];
			var animals = v.animal;
			var species = v.species;
			var frequency = v.frequency;
			var project = v.project;
			var dir = v.dir;

			var origin = "visiting";

			if (['species', 'animals'].includes(dataType)) {
				var selectedRecv1 = true;
				var selectedRecv2 = true;
			} else {
				var selectedRecv1 = motusFilter.selectedStationDeps.includes(v.recv1);
				var selectedRecv2 = motusFilter.selectedStationDeps.includes(v.recv2);
			}

			if (dataType == 'stations') {
				var selectedIndices = animals.map( (x,i) => motusFilter.selectedAnimals.includes(x) ? i : -1 ).filter(x => x != -1);
				dtStart = dtStart.filter((x,i) => selectedIndices.includes(i));
				dtEnd = dtEnd.filter((x,i) => selectedIndices.includes(i));
				tsStart = tsStart.filter((x,i) => selectedIndices.includes(i));
				tsEnd = tsEnd.filter((x,i) => selectedIndices.includes(i));
			//	console.log("1: %i %o", animals.length,selectedIndices);
				animals = animals.filter((x,i) => selectedIndices.includes(i));
				species = species.filter((x,i) => selectedIndices.includes(i));
				frequency = frequency.filter((x,i) => selectedIndices.includes(i));
				project = project.filter((x,i) => selectedIndices.includes(i));
				dir = dir.filter((x,i) => selectedIndices.includes(i));
			//	console.log("2: %o - %i", animals, species.length);
				allTimes = dtStart.concat(dtEnd);
				origin = motusData.selectedStations.filter( x => x.localAnimals.some( k => animals.includes(k) ) ).map( x => x.id ).join("-");
				origin = origin.length > 0 ? origin : 'visiting';
			}

			if (selectedRecv1 || selectedRecv2) {
/*
				if (!motusData.tracksByStation[v.recv1]) {
					motusData.tracksByStation[v.recv1] = [v.route];
				} else {
					motusData.tracksByStation[v.recv1].push(v.route);
				}
				if (!motusData.tracksByStation[v.recv2]) {
					motusData.tracksByStation[v.recv2] = [v.route];
				} else {
					motusData.tracksByStation[v.recv2].push(v.route);
				}
*/
				motusData.nTracks += animals.length;

			}

			if ( ['projects', 'regions'].includes(dataType) ) {
				motusFilter[dataType].forEach(function(c) {
					if ( typeof motusData["animalsBy" + firstToUpper(dataType)].get( c ) !== 'undefined' &&
					 		 Array.from( motusData["animalsBy" + firstToUpper(dataType)].get( c ).keys() ).some(x => v.animal.includes(x))	) {
						origin = c;
					}
				});

			} else if ( dataType == 'stations' ) {

			}

			animals.forEach(function(x, i){

				if (motusFilter.localAnimals.includes( x )) {
					if ( !motusFilter.animalsDetected.includes( x ) ) { motusFilter.animalsDetected.push( x ); }
				  allTimes.push(dtStart[i]);
					allTimes.push(dtEnd[i]);
					if (selectedRecv1 || selectedRecv2) {
						motusData.animalsByDayOfYear[moment(dtStart[i]).dayOfYear()].local.push(x);
						motusData.animalsByDayOfYear[moment(dtEnd[i]).dayOfYear()].local.push(x);
						motusData.animalsByHourOfDay[moment(tsStart[i] * 1000).format("H")].local.push(x);
						motusData.animalsByHourOfDay[moment(tsEnd[i] * 1000).format("H")].local.push(x);
					} else {
						motusData.animalsByDayOfYear[moment(dtStart[i]).dayOfYear()].remote.push(x);
						motusData.animalsByDayOfYear[moment(dtEnd[i]).dayOfYear()].remote.push(x);
						motusData.animalsByHourOfDay[moment(tsStart[i] * 1000).format("H")].remote.push(x);
						motusData.animalsByHourOfDay[moment(tsEnd[i] * 1000).format("H")].remote.push(x);
					}
				} else {
					if (selectedRecv1 || selectedRecv2) {motusFilter.visitingAnimals.push(x);}
					if (selectedRecv1) {
						allTimes.push(dtStart[i]);
						motusData.animalsByDayOfYear[moment(dtStart[i]).dayOfYear()].visiting.push(x);
						motusData.animalsByHourOfDay[moment(tsStart[i] * 1000).format("H")].visiting.push(x);
					}
					if (selectedRecv2) {
						allTimes.push(dtEnd[i]);
						motusData.animalsByDayOfYear[moment(dtEnd[i]).dayOfYear()].visiting.push(x);
						motusData.animalsByHourOfDay[moment(tsEnd[i] * 1000).format("H")].visiting.push(x);
					}
				}

				if (typeof motusData.tracksBySpecies[ species[ i ] ] !== 'undefined') {
				//	motusData.tracksByAnimal[x].push(v.route);
					motusData.tracksBySpecies[ species[ i ] ].push(v.route);
				} else {
					//motusData.tracksByAnimal[x] = [v.route];

					if (motusData.tracksBySpecies[ species[ i ] ]) {
						motusData.tracksBySpecies[ species[ i ] ].push(v.route);
					} else {
						motusData.tracksBySpecies[ species[ i ] ] = [v.route];
					}
				}

		//		animals.push( x );

			});

			motusData.allTimes = motusData.allTimes.concat(allTimes);

	//			var colourVal = dataType == 'projects' ? origin : dataType == 'regions' ? origin : dataType == 'stations' ? ( selectedRecv1 ? v.recv1 : selectedRecv2 ? v.recv2 : "other" ) : dataType == 'species' ? v.species.split(',').filter(x=>motusFilter.species.includes(x)).filter(onlyUnique).join(',') : v.animal.split(',').filter(x=>motusFilter.animals.includes(x)).join(',')

			if (motusFilter.selections.length > 1) {
				var colourVal = ['projects','regions','stations'].includes(dataType) ? origin : dataType == 'species' ? [...new Set(v.species.filter(x=>motusFilter.species.includes(x)))].join(',') : v.animal.filter(x=>motusFilter.animals.includes(x)).join(',')
			} else {
				var colourVal = ['projects','regions','stations'].includes(dataType) ? v.species[Math.floor(Math.random()*v.species.length)] : v.project[Math.floor(Math.random()*v.project.length)];
			}
			motusData.selectedTracks[v.route] = {
				animal: animals,
				species: species,
				type: v.type,
				recv1: v.recv1,
				recv2: v.recv2,
				project: project,
				project: project,
				route: v.route,
				dtStart: new Date(d3.min(allTimes)),
				dtEnd: new Date(d3.max(allTimes)),
				dtStartList: dtStart,
				dtEndList: dtEnd,
				origin: origin,
				colourVal: colourVal,
				frequency: frequency,
				coordinates: [ [v.lon1, v.lat1], [v.lon2, v.lat2]],
				dist: v.dist,
				dir: dir,
				recvProjs: v.recvProjs
			};
		});
	}
}

function getAnimalsTableData( reload = false ) {

	if (reload || typeof motusData.animalsTableData === 'undefined' || motusData.animalsTableData.length == 0) {

		var color_dataType = 'regions' == dataType ? 'country' : 'project';

		motusData.animalsTableData = motusData.selectedAnimals.filter( d => !isNaN(d.dtStart.valueOf()) ).map(d => {
			var speciesMeta = motusData.species.filter( x => x.id == d.species);
			var tracks = motusData.tracksByAnimal.get(d.id);
					tracks = typeof tracks !== 'undefined' ? tracks : Object.fromEntries(Object.entries(motusData.tracksLongByAnimal[0]).map(x => [x[0],typeof x[1] === 'object' ? [] : ""]));
//			console.log(tracks);
			return {
				id: d.id,
				species: d.species,
				sort: speciesMeta.length>0?speciesMeta[0].sort:9999,
				name: speciesMeta.length>0?speciesMeta[0].english:"Undefined",
				dtStart: d.dtStart.toISOString().substr(0,10),
				dtEnd: ((new Date() - d.dtEnd)/(24 * 60 * 60 * 1000) < 1 ? "Active" : "Ended on:<br/>" + d.dtEnd.toISOString().substr(0,10)),
				frequency: d.frequency,
				country: d.country,
				countryName: typeof motusData.regionByCode.get(d.country) !== 'undefined' ? motusData.regionByCode.get(d.country)[0].country : 'Not defined',
				nStations: [...new Set( tracks.stations )].length,
				nDays: [...new Set( tracks.ts.map( x => new Date(x).toISOString().substr(0,10) ) )].length,
				project: d.project,
				projectName: typeof motusData.projects.filter(x => x.id == d.project)[0] !== 'undefined' ? motusData.projects.filter(x => x.id == d.project)[0].name : 'Not defined',
				colourName: d[color_dataType],
				colourCode: motusMap.colourScale(d[color_dataType]),
			}
		});
	}
}
function getSpeciesTableData( reload = false ) {

	if (reload || typeof motusData.animalsTableData === 'undefined' || motusData.animalsTableData.length == 0) {
		getAnimalsTableData();
	}

	if (reload || typeof motusData.speciesTableData === 'undefined' || motusData.speciesTableData.length == 0) {

		var color_dataType = 'regions' == dataType ? 'country' : 'project';

		motusData.speciesTableData = Array.from(
										d3.rollup(
											motusData.animalsTableData,
											(v) => {
												var speciesMeta = motusData.species.filter( x => x.id == v[0].species)[0];
												var stations = (motusData.tracksBySpecies[v[0].species]?Array.from(motusData.tracksBySpecies[v[0].species].map(x=>x.split('.')).values()).flat().filter(onlyUnique):[]);
												var project = v.reduce( function(a, c) { a.push( c.project ); return a; }, [ ]).filter(onlyUnique);
												return {
													id: ( Array.from( v.map( d => d.id ).values() ) ).join(','),
													species: v[0].species,
													name: v[0].name,
													dtStart: d3.min(v, d => d.dtStart),
													dtEnd: d3.max(v, d => d.dtEnd),
													nAnimals: v.length,
													animals: Array.from( v.map( d => d.id ).values() ),
													stations: stations,
													nStations: stations.length,
													country: v.reduce( function(a, c) { a.push( c.country ); return a; }, [ ]).filter(onlyUnique),
													project: project,
													colourName: ['project', 'country'].includes(color_dataType) ? v.reduce( function(a, c) { a.push( c[color_dataType + "Name"] ); return a; }, [ ]).filter(onlyUnique) : v.reduce( function(a, c) { a.push( c[color_dataType] ); return a; }, [ ]).filter(onlyUnique),
													colourCode: v.reduce( function(a, c) { a.push( motusMap.colourScale( c[color_dataType] ) ); return a; }, [ ]).filter(onlyUnique),
													sort: speciesMeta?speciesMeta.sort:999999,
													group: speciesMeta?speciesMeta.group:"Unknown"
												}
											},
											d => d.name
										).values()
									);
	}
}



// Get all or some of the station data
async function getStationData( stationID ) {

	// Get the results for a single station
	if (typeof stationID === "number") {

		if (indexedDB) {
			return motusData.db.stations.get( stationID.toString() );
		} else {
			// Dexie is not enabled
			console.warn("Dexie is not enabled");

			if (typeof motusData.stations === 'undefined' || motusData.stations.length == 0) {
				await downloadMotusData( "stations" );
			}

			return motusData.stations.filter( x => x.id == stationID );
		}

	} else if (typeof stationID === "object") {

		if (indexedDB) {
			return motusData.db.stations.bulkGet( stationID.map(String) );
		} else {
			// Dexie is not enabled
			console.warn("Dexie is not enabled");

			if (typeof motusData.stations === 'undefined' || motusData.stations.length == 0) {
				await downloadMotusData( "stations" );
			}

			return motusData.stations.filter( x => stationID.includes( x.id ) );
		}

	}	else { // Get all stations

		if (indexedDB) {
			return motusData.db.stations.toArray();
		} else {
			// Dexie is not enabled
			console.warn("Dexie is not enabled");

			if (typeof motusData.stations === 'undefined' || motusData.stations.length == 0) {
				await downloadMotusData( "stations" );
			}

			return motusData.stations;
		}

	}

}

function getRegionData() {

	var HAS_REQUIRED_DATA = ["polygons", "animals", "stationDeps"].every( x => (typeof motusData[x] !== 'undefined' && motusData[x].length > 0) );

	if (HAS_REQUIRED_DATA) {

		motusData.animalsByStateProv = d3.rollup(motusData.animals, d => ({animals: d.map( v => v.id )}), x => x.stateProv );
		motusData.animalsByCountry = d3.rollup(motusData.animals, d => ({animals: d.map( v => v.id )}), x => x.country );
		motusData.animalsByContinent = d3.rollup(motusData.animals, d => ({animals: d.map( v => v.id )}), x => x.continent );

		motusData.stationsByStateProv = d3.rollup(motusData.stations, d => ({stations: d.map( v => v.id )}), x => x.stateProv );
		motusData.stationsByCountry = d3.rollup(motusData.stations, d => ({stations: d.map( v => v.id )}), x => x.country );
		motusData.stationsByContinent = d3.rollup(motusData.stations, d => ({stations: d.map( v => v.id )}), x => x.continent );

//		motusData.polygons // countries

		motusData.stateProv = Array.from(d3.rollup([...motusData.animalsByStateProv].concat([...motusData.stationsByStateProv]), v => ({id: v[0][0], iso_a2: v[0][0], stations: v[0][1].stations?v[0][1].stations:v[1]&&v[1][1].stations?v[1][1].stations:[],animals: v[0][1].animals?v[0][1].animals:v[1]&&v[1][1].animals?v[1][1].animals:[]}), d => d[0]).values());
		motusData.country = Array.from(d3.rollup([...motusData.animalsByCountry].concat([...motusData.stationsByCountry]), v => ({id: v[0][0], iso_a2: v[0][0], stations: v[0][1].stations?v[0][1].stations:v[1]&&v[1][1].stations?v[1][1].stations:[],animals: v[0][1].animals?v[0][1].animals:v[1]&&v[1][1].animals?v[1][1].animals:[]}), d => d[0]).values());
		motusData.continent = Array.from(d3.rollup([...motusData.animalsByContinent].concat([...motusData.stationsByContinent]), v => ({id: v[0][0], iso_a2: v[0][0], stations: v[0][1].stations?v[0][1].stations:v[1]&&v[1][1].stations?v[1][1].stations:[],animals: v[0][1].animals?v[0][1].animals:v[1]&&v[1][1].animals?v[1][1].animals:[]}), d => d[0]).values());

		motusData.regions = motusData.country.map( x => ({...x, ...{both: x.animals.length + x.stations.length }}) );

		motusData.stationRegions = [
			{type: "stateProv", regions: motusData.stationsByStateProv},
			{type: "country", regions: motusData.stationsByCountry},
			{type: "continent", regions: motusData.stationsByContinent}
		];

		return true;

	} else {
		logMessage("Cannot generate regions table: Missing required data! " + ["polygons", "animals", "stationDeps"].filter( x => !(typeof motusData[x] !== 'undefined' && motusData[x].length > 0) ), "error", "Motus Data");
		return false;
	}

}

async function getStationActivity() {

	var selectedStations = motusFilter.selectedStations;

	// Check if any activity data exists in the DB for each station.
	// Return an object for each activity table with an array of booleans indicating whether data exist for that station/table combo.
	var indexedDB_success = Object.fromEntries(
		await Promise.all(
			["gpsHits", "antPulses"].map(async (tableName) => {
				var data = await motusData.db[tableName].bulkGet( selectedStations );
				return [
					tableName, selectedStations.map( (stationID, i) => {
						if (typeof data[i] !== 'undefined') {
							motusData[tableName][stationID] = data;
							logMessage(`Successfully loaded ${tableName} for #${stationID}`, "info", "IndexedDB");
							return true;
						} else {
							logMessage(`Failed to load ${tableName} for #${stationID}`, "warn", "IndexedDB");
							return false;
						}
					})
				];
			})
		)
	);
	// For stations which don't have data in the db, see if they can be downloaded via API
	var download_success = Object.fromEntries(
		await Promise.all(
			["gpsHits", "antPulses"].map(async (tableName) => {
				return [
					tableName, selectedStations.map( stationID => {
						if (indexedDB_success[tableName][stationID]) {
							return false;
						} else {
							var response = requestDataAPI( indexedDBTables[tableName].API, stationID );
							if (response.status == 'success') logMessage(`Successfully loaded ${tableName} for #${stationID}`, "info", "Dashboard API");
							else logMessage(`Failed to load ${tableName} for #${stationID}`, "warn", "Dashboard API");
							return response.status == 'success';
						}
					})
				];
			})
		)
	);
/*
	var download_success = await selectedStations.map( async x => {
		logMessage(`Motus Data: Loading activity data for station #${x}...`, "info");

		var response = await Promise.all([requestDataAPI( "gps", x ), requestDataAPI( "antPulse", x )]);

		if (response[0].status == 'success' || response[1].status == 'success') logMessage(`Dashboard API: Successfully loaded activity for #${x}`, "info");
		else logMessage(`Dashboard API: Failed to load activity for #${x}`, "warn");

		return {[x]: (response[0].status == 'success' || response[1].status == 'success')};
	});
*/
	// Check each table to see if it's been populated and update the motusDB accordingly.
	["gpsHits", "antPulses"].forEach((tableName) => {
		if (typeof motusData[tableName] !== 'undefined' && motusData[tableName].length > 0 && download_success[tableName].some( x => x ) ) {
			updateMotusDB(tableName, motusData[tableName]);
		}
	});

  return {indexedDB: indexedDB_success, download: download_success};

}


function processRawData( data, tableName ) {

	if (tableName == 'stations') {
		data.forEach(function(x,k,arr) {
				x.project = x.project.split(',')[0];
				//x.project = x.projectID.split(',')[0];
				x.animals = x.animals.split(";");
				x.localAnimals = x.localAnimals.split(";");
				x.species = x.species.split(";");
				x.stationDeps = x.stationDeps.split(";");
				x.type = "Feature";
				x.frequency = x.frequency == "NA" || x.frequency == ""? "none" : x.frequency.includes(',')  && x.frequency.includes('434')? "dual" : x.frequency;
				x.geometry = {
					type: "Point",
					coordinates: [+x.lon, +x.lat]
				};

				x.dtStart = new Date(x.dtStart);
				x.dtEnd = x.dtEnd == null ? new Date() : new Date(x.dtEnd);
				x.statProv = "NA";
				x.group = "0";
				x.stationID = "0";
				x.lastData = Math.ceil((new Date() - x.dtEnd) / (24 * 60 * 60 * 1000)); // Days ago

				x.status = x.status == 'active' || x.lastData < 1 ? 'active' : 'inactive';
				delete x.lat;
				delete x.lon;
		});
	} else if (tableName == 'stationDeps') {
		data = data.filter(d => (!isNaN(+d.lat) && !isNaN(+d.lon) && d.frequency != 'NA'));

		data.forEach(function(x) {
			x.type = "Feature";
			x.geometry = {
				type: "Point",
				coordinates: [+x.lon, +x.lat]
			};
			renameObjectKey(x, "project", "project");
			renameObjectKey(x, "station", "stationID");
			x.animals = x.animals.split(";");
			x.localAnimals = x.localAnimals.split(";");
			x.species = x.species.split(";");

			x.dtStart = new Date(x.dtStart);
			x.frequency = x.frequency == "NA" ? "none" : x.frequency;
			x.dtEnd = x.dtEnd == "NA" ? null : new Date(x.dtEnd);

			x.lastData = Math.ceil((new Date() - x.dtEnd) / (24 * 60 * 60 * 1000)); // Days ago

			x.status = x.status == 'active' || x.lastData < 1 ? 'active' : 'inactive';
		} );

	} else if (tableName == 'projects') {
		data.forEach(function(x) {
			x.fee_id = projectGroupNames[x.fee_id==""||x.fee_id=="NA"||!x.fee_id?1:x.fee_id];
			x.name = x.name;
			x.stations = x.stations.split(";");
			x.animals = x.animals.split(";");
			x.species = x.species.split(";");
		});
	} else if (tableName == 'regions') {
		data.forEach(function(x) {
			if (x.both > 0) {filters.options.regions[x.iso_a2] = x.country;}
			x.id = x.iso_a2;
		});
	} else if (tableName == 'animals') {
		data.forEach(function(x){
			x.geometry = {coordinates: [+x.lon, +x.lat], type: "Point"};

			var colourVal = dataType == 'projects' ? x.project : dataType == 'regions' ? x.country : dataType == 'stations' ? "other" : dataType == 'species' ? x.species : x.animal;

			x.dtStart = new Date(x.dtStart);
			x.dtEnd = x.dtEnd == "NULL" || x.dtEnd == null  ? new Date() : new Date(x.dtEnd);

			x.status = new Date() - new Date(x.dtEnd) > (2 * 24 * 60 * 60 * 1000) ? 'inactive' : 'active';
			x.geometry = {coordinates: [+x.lon, +x.lat], type: "Point"};
			x.colourVal = colourVal;
			x.type = "Feature";

			x.project = x.project;
			x.projects = x.projects.split(";");
			x.stations = x.stations.split(";");
		});
	} else if (tableName == 'species') {
		data.forEach(function(x) {
			x.animals = x.animals.split(";");
			x.projects = x.projects.split(";");
			x.stations = x.stations.split(";");
			x.group = speciesGroupNames[x.group==""?1:x.group];
			x.stationProjects = x.stationProjects.split(";");
		});
	} else if (tableName == 'polygons') {
		data = data.features
		data.forEach( x => {
			x.id = x.properties.iso_a2;
		});
	} else if (tableName == 'tracks') {

		testTimer.push([new Date(), "Start tracksByAnimal"]);
		data.forEach( (x, i) => {

			x.animal = x.animal.split(',')
			x.species = x.species.split(',')
			x.dir = x.dir.split(',')
			x.dtStartList = x.dtStart.split(',')
			x.dtStart = d3.max( x.dtStartList );
			x.dtEndList = x.dtEnd.split(',')
			x.dtEnd = d3.max( x.dtEndList );
			x.tsStart = x.tsStart.split(',')
			x.tsEnd = x.tsEnd.split(',')
			x.recvProjs = x.recvProjs.split(',')
			x.project = x.project.split(',')
			x.frequency = x.frequency.split(',')

		});
		// Group routes together into tracks
		testTimer.push([new Date(), "End tracksByAnimal"]);

	} else if (tableName == 'tracksLongByAnimal') {
			data = data.filter( x => x.lat1 != 'NA' && x.lat != 0 );

			data = Array.from( d3.rollup(data,
				v => ({
					id: v[0].animal,
					tracks: v.map(x => ([+x.lon2, +x.lat2])),
					tsStart: d3.min(v, x => +x.ts1),
					ts: v.map(x => +x.ts2),
					frequency:  v[0].frequency,
					species:  v[0].species,
					//stations:  v.map(x => [x.station1, x.station2]).flat(),
					stations:  v.map(x => x.station2),
					project:  v[0].project,
					dist: v.map(x => +x.dist)
				}),
				d => d.animal
			).values() );
	} else if (tableName == "antennas") {

		data = {type: "FeatureCollection", features: data.map(function(d){

        var station = motusData.stationDeps.filter( v => v.id == d.recvDeployID );

        if (station.length != 0 && station[0].lat && station[0].lon && +station[0].lat != 0 && +station[0].lon != 0 ) {

          var coordinates = getAntennaShape({lat: +station[0].lat, lon: +station[0].lon, antennaType: d.antennaType, bearing: d.bearing});

          // If it's a polygon, close the path
          if (coordinates.length > 1) {coordinates.push(coordinates[coordinates.length - 1])}

        }  else {

          var coordinates = [];

        }
        return {
          id: d.recvDeployID,
          type: "Feature",
          properties: {
						stationID: station.length == 0 ? 0 : station[0].station,
						species: station.length == 0 ? [] : station[0].species,
						frequency: station.length == 0 ? 0 : station[0].frequency,
						project: station.length == 0 ? 0 : station[0].project,
						species: station.length == 0 ? [] : station[0].species,
						continent: station.length == 0 ? "NA" : station[0].continent,
						country: station.length == 0 ? "NA" : station[0].country,
            type: d.antennaType,
            bearing: d.bearing,
            port: d.port,
            height: d.heightMeters,
            dongle: d.dongle_type,
            freq: d.frequency,
            status: d.deploymentStatus,
						dtStart: station.length == 0 ? new Date() : station[0].dtStart,
						dtEnd:  station.length == 0 ? new Date() : station[0].dtEnd
          },
          geometry: {
            type: coordinates.length == 1 ? "Point" : "Polygon",
            coordinates: coordinates.length == 1 ? coordinates[0] : [coordinates]
          }
        };

      }).filter( d => d.geometry.coordinates.length > 0)
    };
	}

	console.log(`Done processing ${tableName} data...`);

	return data;

}


// Returns the amount of space being used by indexeddb, in MB
async function checkDataUsage() {
	return navigator.storage.estimate().then((space)=>{
		return space.usage / Math.pow(2, 20); // MB
	});
}
