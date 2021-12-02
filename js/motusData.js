// Motus Wildlife Tracking System
// Lucas Berrigan
// 02 September 2021

var continentFreqs = {
	"North America":"166.380 MHz",
	"South America":"166.380 MHz",
	"Europe":"150.10 MHz",
	"Asia":"151.50 MHz",
	"Oceania":"151.50 MHz",
	"Africa":"150.10 MHz",
	"Antarctica":"none"
}

var regionFreqs = {
	"Americas":"166.380 MHz",
	"Europe":"150.10 MHz",
	"Asia":"151.50 MHz",
	"Oceania":"151.50 MHz",
	"Africa":"150.10 MHz",
	"Antarctica":"none"
}

var projectGroupNames = {
	1:'No affiliation',
	2:'US Dept. of the Interior',
	3:'Environment Canada',
	8:'Atlantic Offshore Wind Assessment',
	9:'Birds Canada'
}
var speciesGroupNames = {
	1: 'Not defined',
	'BATS': 'Bats',
	'BEETLES': 'Insects',
	'BIRDS': 'Birds',
	'BUTTERFL': 'Insects',
	'HYMENOPTERA': 'Insects',
	'MAMMALS': 'Mammals',
	'MOTHS': 'Insects',
	'ODONATA': 'Insects',
	'ORTHOPTERA': 'Insects',
	'REPTILES': 'Reptiles'
}

var motusDataTables;
var testTimer = [];

function getMotusData(motusDataTableNames = []) {

	testTimer.push([new Date(), "Get data"]);
  // List of all the files
  // This will have to change to include API calls
/*	var allFiles = {
		stations: filePrefix + "stations.csv",	// All stations including station deployments (a.k.a. receiver deployments)
		stationDeps: filePrefix + "recv-deps.csv",	// All receiver deployments, including deployment country
		regions: filePrefix + "country-stats.csv", // Number of projects, stations, and tag deployments in each country
		polygons: filePrefix + "ne_50m_admin_0_countries.geojson", // GEOJSON dataset of country polygons. Includes ISO contry names and codes.
		animals: filePrefix + "tag-deps.csv", // All tag deployments, including deployment country
		tracks: filePrefix + "siteTrans_real2" + (window.location.hostname.indexOf('beta') != -1 ? '-2' : '') + ".csv", // All site transitions
		species: filePrefix + "spp.csv", // List of all species and various names/codes
		projects: filePrefix + "projs.csv" // All projects, their codes, and descriptions
	};


	if (window.location.hostname.includes('sandbox.motus.org')) {
	// This will have to change to include API calls
		var allFiles = {
			// missing: country, continent, animals, species, localAnimals
			stations: "https://sandbox.motus.org/data/dashboard/stationDeployments?fmt=csv", // All station deployments, including photo url
			stationDeps: filePrefix + "recv-deps.csv",	// All receiver deployments, including deployment country
			// good
			antennaDeps: "https://sandbox.motus.org/data/dashboard/antennaDeployments?fmt=csv", // All antenna deployments, including deployment country
			regions: filePrefix + "country-stats.csv", // Number of projects, stations, and tag deployments in each country
			polygons: "https://sandbox.motus.org/wp-content/themes/dashboard_template/ne_50m_admin_0_countries.geojson.txt", // GEOJSON dataset of country polygons. Includes ISO contry names and codes.
			tracks: filePrefix + "siteTrans_real2" + (window.location.hostname.indexOf('beta') != -1 ? '-2' : '') + ".csv", // All site transitions
			// missing: country, continent, frequency
			animals: "https://sandbox.motus.org/data/dashboard/tagDeployments?fmt=csv", // List of all species and various names/codes
			// good
			species: "https://sandbox.motus.org/data/dashboard/species?fmt=csv", // List of all species and various names/codes
			// missing fee_id
			projects: "https://sandbox.motus.org/data/dashboard/projects?fmt=csv" // All projects, their codes, and descriptions
		};
	}*/

	motusIndexedDB( motusDataTableNames );

}

function getAnimalsTableData( reload = false ) {

	if (reload || typeof motusData.animalsTableData === 'undefined' || motusData.animalsTableData.length == 0) {

		var color_dataType = 'regions' == dataType ? 'country' : 'project';

		motusData.animalsTableData = motusData.selectedAnimals.filter( d => !isNaN(d.dtStart.valueOf()) ).map(d => {
			var speciesMeta = motusData.species.filter( x => x.id == d.species);

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
				nStations: (motusData.tracksByAnimal[d.id]?[...new Set( motusData.tracksByAnimal[d.id].map(v=>v.split('.')).flat() )]:[]).length,
				nDays: motusData.tracksByAnimal[d.id]?motusData.tracksByAnimal[d.id].length * 2:0,
				project: d.projID,
				projectName: typeof motusData.projects.filter(x => x.id == d.projID)[0] !== 'undefined' ? motusData.projects.filter(x => x.id == d.projID)[0].name : 'Not defined',
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



const DB_VERSION = 8;

function motusIndexedDB( motusDataTableNames = [] ) {

	motusDataTables = {
		// [TABLE_NAME]: {[FILE_LOCATION], [INDEXDB_KEY], [GET_TABLE_ON_LOAD]}
		stations: {file: filePrefix + "stations.csv", key: 'id, project, country, *animals', get: true},	// All stations including station deployments (a.k.a. receiver deployments)
		stationDeps: {file: filePrefix + "recv-deps.csv", key: 'id', get: true},	// All receiver deployments, including deployment country
		regions: {file: filePrefix + "country-stats.csv", key: 'id', get: true}, // Number of projects, stations, and tag deployments in each country
		polygons: {file: filePrefix + "ne_50m_admin_0_countries.geojson", key: '++, id', get: true}, // GEOJSON dataset of country polygons. Includes ISO contry names and codes.
		animals: {file: filePrefix + "tag-deps.csv", key: 'id, project, country, species', get: true}, // All tag deployments, including deployment country
		tracks: {file: filePrefix + "siteTrans_real3" + (window.location.hostname.indexOf('beta') != -1 ? '-2' : '') + ".csv", key: 'route, *animal', get: true}, // All site transitions
	//	tracksLong: {file: filePrefix + "siteTrans_long2.csv", key: '++, animal', get: true}, // All site transitions
		species: {file: filePrefix + "spp.csv", key: 'id', get: true}, // List of all species and various names/codes
		projects: {file: filePrefix + "projs.csv", key: 'id', get: true}, // All projects, their codes, and descriptions
		tracksByAnimal: {file: false, key: 'id', get: false}, //
		tracksLongByAnimal: {file: filePrefix + "siteTrans_long2.csv", key: 'id', get: dataType == 'animals' && exploreType == 'main'}, //
		stationsByRegion: {file: false, key: 'region, regionType', get:false}, //
		animalsByRegion: {file: false, key: 'region, regionType', get:false} //
	};

	if (motusDataTableNames && motusDataTableNames.length > 0) {
		motusDataTables = Object.fromEntries( Object.entries(motusDataTables).filter( x => motusDataTableNames.includes(x[0]) ) );
	}

	var promises = [];

	Object.keys(motusDataTables).forEach(function(f){

			var url = motusDataTables[f].file;

			if (url) {
				motusDataTables[f].promise = url.substr(url.lastIndexOf('.') + 1, url.length) == 'csv' || url.substr(url.lastIndexOf('=') + 1, url.length) == 'csv' ?
					d3.csv : d3.json;
			}

	});
	testTimer.push([new Date(), "Get data: declare the database"]);
	// Check whether IndexedDB is supported
	if (indexedDB) {
		// Declare the database
	  motusData.db = new Dexie("explore_motus");
		//
	  motusData.db.version( DB_VERSION ).stores(
			Object.fromEntries(
				Object.entries(	motusDataTables	)
							.map( x => [ x[0], x[1].key ] )
			)
		).upgrade((trans)=>{
			console.log("Deleting tables: %o", trans.storeNames);

			trans.storeNames.forEach(k => {
				trans.db[k].clear();
			});

		});

		console.log(`Initiating local Motus DB with ${Object.keys(motusDataTables).length} tables...`);


	  motusData.db.open()
    	.catch ('MissingApiError',function(error){// If IndexedDB is NOT supported
					console.log(error);
					var tableToDownload = Object.entries(motusDataTables).filter( x => x[1].get );
					downloadMotusData( tableToDownload.map( x => x[1].promise( x[1].file ) ), tableToDownload.map( x => x[0] ) );
					indexedDB=false;
			}).catch (function (error) {
	        // Show e.message to user
					console.log("Some other error: ");
					console.log(error);
					var tableToDownload = Object.entries(motusDataTables).filter( x => x[1].get );
					downloadMotusData( tableToDownload.map( x => x[1].promise( x[1].file ) ), tableToDownload.map( x => x[0] ) );
					indexedDB=false;
	    });

	  motusData.db.on('ready', checkTables);

	} else { // If IndexedDB is NOT supported

		var tableToDownload = Object.entries(motusDataTables).filter( x => x[1].get );
		downloadMotusData( tableToDownload.map( x => x[1].promise( x[1].file ) ), tableToDownload.map( x => x[0] ) )

	}


}

function checkTables() {

	console.log("DB Ready. Checking tables...");

	Object.keys(motusDataTables).filter( x => motusDataTables[x].get || typeof motusDataTables[x].file === "string" ).forEach(function(tableName, i){

			// Check whether IndexedDB is supported
			if (indexedDB) {
				console.log(`Checking table '${tableName}'...`);
				motusData.db[tableName].count( count => {
					testTimer.push([new Date(), "Get data: respond to count of "+tableName]);
					if (count > 0 && motusDataTables[tableName].get) {
						console.log(`Table '${tableName}' exists.`);

						motusData.db[tableName]
							.toArray()
							.then( d => {
								testTimer.push([new Date(), "Get data: store table "+tableName+" with "+d.length+" rows in memory"]);

					//			console.log(`Table '${tableName}' loaded from local database.`);
								motusData[tableName] = d;
								motusDataTables[tableName].done = true;
								// Proceed to load the dashboard only once all the data has been downloaded
								checkIfFinished();
							});

					} else if (count > 0 && typeof motusDataTables[tableName].file === "string") {

						console.log(`Table '${tableName}' exists, but won't be loaded entirely.`);
						motusDataTables[tableName].done = true;

					} else {

						console.log(`Table '${tableName}' needs to be downloaded.`);
						motusDataTables[tableName].download = true;
					}

					if (i+1 == Object.keys(motusDataTables).filter( x => motusDataTables[x].get || typeof motusDataTables[x].file === "string" ).length && Object.values(motusDataTables).some( x => x.download )) {
						testTimer.push([new Date(), "Get data: downloading data"]);

						console.log(`Downloading...`);

						var tableToDownload = Object.entries(motusDataTables).filter( x => x[1].download );

						console.log(`Downloading data for ${tableToDownload.length} tables.`);

						downloadMotusData(tableToDownload.map( x => x[1].promise( x[1].file ) ), tableToDownload.map( x => x[0] ))

					}

				});
			}

	});

	function checkIfFinished() {

		if ( Object.values(motusDataTables).every( x => x.done || (!x.get && !x.file) ) ) {

			console.log(`Finished loading data.`);
			console.log(`There were ${Object.values(motusDataTables).filter( x => x.downloaded ).length} tables downloaded and `+
									`${Object.values(motusDataTables).filter( x => !x.downloaded ).length} tables loaded from the local database.`);
			console.log("Loading dashboard content...");
			loadDashboardContent();
		}
	}
}

function downloadMotusData(promises, fileList) {

	Promise.all(promises).then(function(response) {

  	fileList.forEach(function(f, i){

  		motusData[f] = response[i];

  	});
		console.log(fileList);

		if (!window.location.hostname.includes('sandbox.motus.org')) {
			if (fileList.includes("stations") ) {

			}


			var currentDate = new Date();


	  	if (fileList.includes("animals")) {
	  		motusData.animals.forEach(function(x){
	  			x.geometry = {coordinates: [+x.lon, +x.lat], type: "Point"};

					var colourVal = dataType == 'projects' ? x.projID : dataType == 'regions' ? x.country : dataType == 'stations' ? "other" : dataType == 'species' ? x.species : x.animal;

					x.dtStart = new Date(x.dtStart);
					x.dtEnd = x.dtEnd == "NA" ? new Date() : new Date(x.dtEnd);

	  			x.status = new Date() - new Date(x.dtEnd) > (2 * 24 * 60 * 60 * 1000) ? 'inactive' : 'active';
	  			x.geometry = {coordinates: [+x.lon, +x.lat], type: "Point"};
					x.colourVal = colourVal;
					x.type = "Feature";

					x.project = x.projID;
					x.projects = x.projects.split(";");
					x.stations = x.stations.split(";");

	  		});

	  	}
	  	if (fileList.includes("projects")) {
	  		motusData.projects.forEach(function(x) {
	  			x.fee_id = projectGroupNames[x.fee_id==""||x.fee_id=="NA"||!x.fee_id?1:x.fee_id];
	  			x.name = x.name;
					x.stations = x.stations.split(";");
					x.animals = x.animals.split(";");
					x.species = x.species.split(";");
	  		});
	  	}

	  	if (fileList.includes("stationDeps")) {

				motusData.stationDeps = motusData.stationDeps.filter(d => (!isNaN(+d.lat) && !isNaN(+d.lon) && d.frequency != 'NA'));

  		 	motusData.stationDeps.forEach(function(x) {

				//	x.dtEnd = x.tsEnd.length == 0 ? moment().toISOString().substr(0, 10) : moment(+x.tsEnd * 1000).toISOString().substr(0, 10);

					x.type = "Feature";
					x.geometry = {
						type: "Point",
						coordinates: [+x.lon, +x.lat]
					};

					x.dtStart = new Date(x.dtStart);
					x.frequency = x.frequency == "NA" ? "none" : x.frequency;
					x.dtEnd = x.dtEnd == "NA" ? new Date() : new Date(x.dtEnd);

					x.lastData = Math.ceil((currentDate - x.dtEnd) / (24 * 60 * 60 * 1000)); // Days ago

					x.status = x.status == 'active' || x.lastData < 1 ? 'active' : 'inactive';
	  		} );

	  		motusData.stationDepsByName = d3.group(motusData.stationDeps, x => x.name);
	  	}
	  	if (fileList.includes("stations")) {
  		 	motusData.stations.forEach(function(x) {
						x.project = x.projID.split(';')[0];
						x.projID = x.projID.split(';')[0];
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
						x.dtEnd = x.dtEnd == "NA" ? new Date() : new Date(x.dtEnd);

						x.lastData = Math.ceil((currentDate - x.dtEnd) / (24 * 60 * 60 * 1000)); // Days ago

						x.status = x.status == 'active' || x.lastData < 1 ? 'active' : 'inactive';
	  		});
	  	}

	  	if (fileList.includes("regions")) {
	  		filters.options.regions = {};
	  		motusData.regions.forEach(function(x) {
	  			if (x.both > 0) {filters.options.regions[x.ADM0_A3] = x.country;}
					x.id = x.ADM0_A3;
	  		});
	  	}


			if (fileList.includes("species")) {
				motusData.species.forEach(function(x) {
					x.animals = x.animals.split(";");
					x.projects = x.projects.split(";");
					x.stations = x.stations.split(";");
	  			x.group = speciesGroupNames[x.group==""?1:x.group];
					x.stationProjects = x.stationProjects.split(";");
				});
			}


			if (fileList.includes("polygons")) {
				motusData.polygons = motusData.polygons.features
				motusData.polygons.forEach( x => {
					x.id = x.properties.adm0_a3;
				});
			}


	  	if (fileList.includes("tracks")) {
				testTimer.push([new Date(), "Start tracksByAnimal"]);
	  		motusData.tracksByAnimal = [];

				motusData.tracks.forEach( (x, i) => {

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
				motusData.tracksByAnimal = d3.rollup(motusData.tracksByAnimal, v => ({id: v[0].id, route: v.map( x => x.route )}), k => k.id );

				testTimer.push([new Date(), "End tracksByAnimal"]);
	  	}
	  	if (fileList.includes("tracksLongByAnimal")) {
				motusData.tracksLongByAnimal = motusData.tracksLongByAnimal.filter( x => x.lat1 != 'NA' && x.lat != 0 );

				motusData.tracksLongByAnimal = Array.from( d3.rollup(motusData.tracksLongByAnimal,
					v => ({
						id: v[0].animal,
						tracks: v.map(x => ([+x.lon2, +x.lat2])),
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

			}

		} else {


	  	if (fileList.includes("animals")) {

	  		motusData.animals = motusData.animals.filter(d => d.tsStart.length > 0);

	  		motusData.animals.forEach(function(x){

					var colourVal = dataType == 'projects' ? x.projID : dataType == 'regions' ? 'other' : dataType == 'stations' ? "other" : dataType == 'species' ? x.species : x.animal;

	  			x.dtStart = new Date(+x.tsStart * 1000).toISOString().substr(0, 10);
	  			x.dtEnd = x.tsEnd.length == 0 ? new Date().toISOString().substr(0, 10) : new Date(+x.tsEnd * 1000).toISOString().substr(0, 10);
	  			x.status = new Date() - new Date(x.dtEnd) > (2 * 24 * 60 * 60 * 1000) ? 'inactive' : 'active';
	  			x.geometry = {coordinates: [+x.lon, +x.lat], type: "Point"};
					x.colourVal = colourVal;
					x.type = "Feature";

					x.project = x.projID;

	  		});

	  	}

	  	if (fileList.includes("projects")) {
	  		motusData.projects.forEach(function(x) {
	  			x.fee_id = projectGroupNames[x.fee_id==""||!x.fee_id?1:x.fee_id];
	  			x.name = x.name;
					x.id = x.projectID;
	  		});
	  	}

	  	if (fileList.includes("stationDeps")) {
	  		motusData.stationDeps = motusData.stationDeps.filter(d => (!isNaN(+d.lat) && !isNaN(+d.lon) && d.frequency != 'NA'));
  		 	motusData.stationDeps.forEach(function(x) {

				//	x.dtEnd = x.tsEnd.length == 0 ? moment().toISOString().substr(0, 10) : moment(+x.tsEnd * 1000).toISOString().substr(0, 10);
					x.dtEnd = x.dtEnd == "NA" ? moment().toISOString().substr(0, 10) : x.dtEnd;
	  		});
	  		motusData.stationDepsByName = d3.group(motusData.stationDeps, d => d.name);
	  	}

	  	if (fileList.includes("stations")) {
  		 	motusData.stations.forEach(function(x) {
						x.project = x.projID.split(';')[0];
						x.projID = x.projID.split(';')[0];;
	  		});
	  	}

	  	if (fileList.includes("species")) {
				motusData.species.forEach(function(x) {
					x.id = x.speciesID;
				});
	  	}

	  	if (fileList.includes("regions")) {
	  		filters.options.regions = {};
	  		motusData.regions.forEach(function(x) {
	  			if (x.both > 0) {filters.options.regions[x.ADM0_A3] = x.country;}
					x.id = x.ADM0_A3;
	  		});
	  	}

	  	if (fileList.includes("polygons")) {
	  		motusData.polygons = motusData.polygons.features
	  	}

	  	if (fileList.includes("tracks")) {

	  		motusData.tracksByAnimal = [];

				motusData.tracks.forEach( (x, i) => {

					x.animal = x.animal.split(',')
					x.species = x.species.split(',')
					x.dir = x.dir.split(',')
					x.dtStart = x.dtStart.split(',')
					x.dtEnd = x.dtEnd.split(',')
					x.tsStart = x.tsStart.split(',')
					x.tsEnd = x.tsEnd.split(',')

					motusData.animals.filter( a => x.animal.includes( a.id ) ).forEach( a => {

						motusData.tracksByAnimal.push({id: a.id, route: x.route});

					});

				});

	  	}

		}



  	console.log("Finished downloading " + response.length + " data set" + (response.length == 1 ? "" : "s"));

		// Update the local database only once data has been downloaded and processed
  	Object.keys(motusDataTables).forEach(function(f, i){

			if (typeof motusData[f] !== 'undefined') {

				motusDataTables[f].done = true;
				updateMotusDB(f, motusData[f]);
			} else {
				console.warn("There was an issue loading ", f);
			}

  	});

		// Proceed to load the dashboard only once all the data has been downloaded
		if ( Object.values(motusDataTables).every( x => x.done || !x.get ) ) {

			console.log(`Finished loading data.`)
			console.log(`There were ${Object.values(motusDataTables).filter( x => x.downloaded ).length} tables downloaded and `+
									`${Object.values(motusDataTables).filter( x => !x.downloaded ).length} tables loaded from the local database.`)
			console.log("Loading dashboard content...")

			loadDashboardContent();
		}

  });

}

function updateMotusDB(tableName, tableData) {

		console.log(`Adding '${tableName}'...`);
		console.log(tableData);
		motusData.db[tableName].bulkPut(tableData).then(function(lastKey) {
			console.log(`Done adding '${tableName}' table.`);
		}).catch(Dexie.BulkError, function (e) {
			console.log(`Error adding ${e.failures.length} of ${tableData.length} rows to '${tableName}' table.`);
		});

}


async function getSelections({
	selectedRegions = false,
	selectedProjects = false,
	selectedSpecies = false,
	selectedStations = false,
	selectedAnimals = false
} = {}) {
/*
	if (selectedRegions || selectedProjects || selectedSpecies || selectedStations || selectedAnimals) {

	} else {*/

	motusData.tracksByAnimal = {};
	motusData.tracksBySpecies = {};
	motusData.tracksByStation = {};
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
			motusData.selectedAnimalRegions = await getSelectedRegions({ key: "adm0_a3", values: [...new Set(motusData.localAnimals.map( x => x.country ))] });
			// Station projects have stations deployed
			motusData.selectedStationRegions = await getSelectedRegions({ key: "adm0_a3", values: [...new Set(motusData.selectedStations.map( x => x.country ))] });

			// Routes consist of tracks by local animals and visiting animals
			motusData.tracksByAnimal = await getAnimalRoutes( motusFilter.selectedAnimals );
			motusData.tracksLongByAnimal = await getSelectedTracksLongByAnimal( motusFilter.selectedAnimals );
			motusData.selectedTracks = await getSelectedTracks( [...new Set(Object.values(motusData.tracksByAnimal).flat())] );

			// Animal projects have tags deployed
			motusData.selectedAnimalProjects = await getSelectedProjects( [...new Set(motusData.selectedAnimals.map( x => x.projID ))] );
			// Station projects have stations deployed
			motusData.selectedStationProjects = await getSelectedProjects( [...new Set(motusData.selectedStations.map( x => x.projID ))] );
			motusData.selectedProjects = await getSelectedProjects( motusData.selectedStations.map( x => x.projID ).concat(motusData.selectedAnimals.map( x => x.projID )).filter(onlyUnique) );

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
					console.log(getSelectedSpecies( visitingAnimals ));
					testTimer.push([new Date(), "Get selections: all species"]);
					motusData.selectedSpecies = await getSelectedSpecies( motusData.selectedAnimals );


					motusData.selectedLocalStations = motusData.selectedStations;
					motusData.selectedVisitingStations = [...new Set( localAnimals.map( x => x.stations ).flat() )].filter( x => x!="NA");


//					testTimer.push([new Date(), `Get selections - animal paths from ${motusFilter.selectedAnimals.length} animals`]);
					// Routes consist of tracks by local animals and visiting animals

					testTimer.push([new Date(), `Get selections - animal paths from ${motusFilter.selectedAnimals.length} animals`]);
					motusData.tracksByAnimal = await getAnimalRoutes( motusFilter.selectedAnimals );
					testTimer.push([new Date(), `Get selections - tracks from ${Object.keys(motusData.tracksByAnimal).length} animals`]);
					motusData.selectedTracks = await getSelectedTracks( [...new Set(Object.values(motusData.tracksByAnimal).flat())] );
					testTimer.push([new Date(), `Get selections - LONG animal paths from ${motusFilter.selectedAnimals.length} animals`]);
					motusData.tracksLongByAnimal = await getSelectedTracksLongByAnimal( motusFilter.selectedAnimals );

					testTimer.push([new Date(), "Get selections - regions"]);
					// Animal regions have tags deployed
					motusData.selectedAnimalRegions = getSelectedRegions({ key: "adm0_a3", values: [...new Set(motusData.selectedAnimals.map( x => x.country ))] });
					// Station projects have stations deployed
					motusData.selectedStationRegions = getSelectedRegions({ key: "adm0_a3", values: [...new Set(motusData.selectedStations.map( x => x.country ))] });
					motusData.selectedRegions = getSelectedRegions({ key: "adm0_a3", values: motusData.selectedStations.map( x => x.country ).concat( [...new Set(motusData.selectedAnimals.map( x => x.country ) )] ) });


					motusFilter.selectedAnimalsDtStart = await d3.min( motusData.selectedAnimals, x => x.dtStart );
					motusFilter.selectedAnimalsDtEnd = await d3.max( motusData.selectedAnimals, x => x.dtEnd );

					motusFilter.selectedStationsDtStart = await d3.min( motusData.selectedStations, x => x.dtStart );
					motusFilter.selectedStationsDtEnd = await d3.max( motusData.selectedStations, x => x.dtEnd );

					motusFilter.selectedDtStart = await d3.min( [motusFilter.selectedAnimalsDtStart, motusFilter.selectedStationsDtStart] );
					motusFilter.selectedDtEnd = await d3.max( [motusFilter.selectedAnimalsDtEnd , motusFilter.selectedStationsDtEnd] );

					return visitingAnimals;

				});

				return localAnimals;

			});

			// Animal projects have tags deployed
			motusData.selectedAnimalProjects = await getSelectedProjects( [...new Set(motusData.localAnimals.map( x => x.projID ))] );
			// Station projects have stations deployed
			motusData.selectedStationProjects = await getSelectedProjects( [...new Set(motusData.selectedStations.map( x => x.projID ))] );

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
			motusData.tracksLongByAnimal = await getSelectedTracksLongByAnimal( motusFilter.selectedAnimals );
			motusData.selectedTracks = await getSelectedTracks( [...new Set(Object.values(motusData.tracksByAnimal).flat())] );

			motusData.selectedAnimalProjects = await getSelectedProjects( [...new Set(motusData.selectedAnimals.map( x => x.projID ))] );
			motusData.selectedStationProjects = getSelectedProjects( [...new Set(motusData.selectedStations.map( x => x.projID ))] );
			motusData.selectedProjects = await getSelectedProjects( [...new Set(motusData.selectedStations.map( x => x.projID ).concat(motusData.selectedAnimals.map( x => x.projID )))] );

			motusData.selectedAnimalRegions = await getSelectedRegions({ key: "adm0_a3", values: [...new Set(motusData.selectedAnimals.map( x => x.country ))] });
			motusData.selectedStationRegions = getSelectedRegions({ key: "adm0_a3", values: [...new Set(motusData.selectedStations.map( x => x.country ))] });
			motusData.selectedRegions = await getSelectedRegions({ key: "adm0_a3", values: [...new Set(motusData.selectedStations.map( x => x.country ).concat(motusData.selectedAnimals.map( x => x.country )))] });

			motusFilter.selectedDtStart = await d3.min( motusData.selectedStations, x => x.dtStart );
			motusFilter.selectedDtEnd = await d3.max( motusData.selectedStations, x => x.dtEnd );

		} else if (dataType == 'species') {

			motusData.selectedSpecies = getSelectedSpecies();
			motusData.selectedAnimals = await getSelectedAnimals({ key: "species", values: motusFilter.selections });
			motusFilter.selectedAnimals = await motusData.selectedAnimals.map( x => x.id );

			motusData.tracksByAnimal = await getAnimalRoutes( motusFilter.selectedAnimals );
			motusData.tracksLongByAnimal = await getSelectedTracksLongByAnimal( motusFilter.selectedAnimals );
			motusData.selectedTracks = await getSelectedTracks( [...new Set(Object.values(motusData.tracksByAnimal).flat())] );

			motusData.selectedStations = await getSelectedStations( [...new Set(motusData.selectedTracks.map( x => x.route.split('.') ).flat())] );
			motusData.selectedStationDeps = await getSelectedStationDeps();
			motusFilter.selectedStations = await motusData.selectedStations.map( x => x.id );
			motusFilter.selectedStationDeps = await motusData.selectedStationDeps.map( x => x.id );

			motusData.selectedAnimalProjects = getSelectedProjects( [...new Set(motusData.selectedAnimals.map( x => x.projID ))] );
			motusData.selectedStationProjects = await getSelectedProjects( [...new Set(motusData.selectedStations.map( x => x.projID ))] );
			motusData.selectedProjects = await getSelectedProjects( [...new Set(motusData.selectedStations.map( x => x.projID ).concat(motusData.selectedAnimals.map( x => x.projID )))] );

			motusData.selectedAnimalRegions = getSelectedRegions({ key: "adm0_a3", values: [...new Set(motusData.selectedAnimals.map( x => x.country ))] });
			motusData.selectedStationRegions = await getSelectedRegions({ key: "adm0_a3", values: [...new Set(motusData.selectedStations.map( x => x.country ))] });
			motusData.selectedRegions = await getSelectedRegions({ key: "adm0_a3", values: [...new Set(motusData.selectedStations.map( x => x.country ).concat(motusData.selectedAnimals.map( x => x.country )))] });

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
			motusData.tracksLongByAnimal = await getSelectedTracksLongByAnimal( motusFilter.selectedAnimals );
			motusData.selectedTracks = await getSelectedTracks( [...new Set(Object.values(motusData.tracksByAnimal).flat())] );

			motusData.selectedStations = await getSelectedStations( [...new Set(motusData.selectedTracks.map( x => x.route.split('.') ).flat())] );
			motusData.selectedStationDeps = await getSelectedStationDeps();
			motusFilter.selectedStations = await motusData.selectedStations.map( x => x.id );
			motusFilter.selectedStationDeps = await motusData.selectedStationDeps.map( x => x.id );

			motusData.selectedAnimalProjects = await getSelectedProjects( [...new Set(motusData.selectedAnimals.map( x => x.projID ))] );
			motusData.selectedStationProjects = await getSelectedProjects( [...new Set(motusData.selectedStations.map( x => x.projID ))] );
			motusData.selectedProjects = await getSelectedProjects( [...new Set(motusData.selectedStations.map( x => x.projID ).concat(motusData.selectedAnimals.map( x => x.projID )))] );

			motusData.selectedAnimalRegions = await getSelectedRegions({ key: "adm0_a3", values: [...new Set(motusData.selectedAnimals.map( x => x.country ))] });
			motusData.selectedStationRegions = await getSelectedRegions({ key: "adm0_a3", values: [...new Set(motusData.selectedStations.map( x => x.country ))] });
			motusData.selectedRegions = await getSelectedRegions({ key: "adm0_a3", values: [...new Set(motusData.selectedStations.map( x => x.country ).concat(motusData.selectedAnimals.map( x => x.country )))] });

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



		if (typeof selectionNames === "undefined") {
			motusData.selectionNames = Object.fromEntries( motusData["selected" + firstToUpper(dataType)].map( x => [x.id, x.name] ) );
		} else {
			motusData.selectionNames = selectionNames;
		}
//}

	function getSelectedRegions(selections) {

		return (typeof selections !== "object" ?
			motusData.polygons.filter(
				x =>
				motusFilter.selections.includes(x.properties.adm0_a3)
			).map(
				x => ({
					geometry:x.geometry,
					properties: x.properties,
					id: x.properties.adm0_a3,
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
					selections.includes(x.properties.adm0_a3)
				).map(
					x => ({
						geometry:x.geometry,
						properties: x.properties,
						id: x.properties.adm0_a3,
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

	return motusData.db.tracksByAnimal.bulkGet(animals).then( d => {

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
			motusData.db.tracksByAnimal.bulkPut(newTracksByAnimal).then(()=>{console.log(`Added ${newTracksByAnimal.length} rows to 'tracksByAnimal' table.`);})


			// Combine the new tracks with the ones taken from the database.
			d = d.filter( x => typeof x !== 'undefined' ).concat(newTracksByAnimal);


		}
		return Object.fromEntries( d.map( x => Object.values(x) ) );

	});

}

async function getSelectedTracksLongByAnimal( animals ) {

	if (animals) {
		let data = await motusData.db.tracksLongByAnimal.bulkGet( animals );
		return data.filter(x => typeof x !== 'undefined' );
	}	else {
		return await motusData.db.tracksLongByAnimal.toArray();
	}

}

function getSelectedTracks(routes) {
	return motusData.db.tracks.bulkGet( routes );
}

function getSelectedTrackData(selectedTracks, reload = false) {

	if (reload || typeof motusData.selectedTracks === 'undefined' || Object.values(motusData.selectedTracks).length == 0) {

		motusData.selectedTracks = {};

		console.log(`Processing ${selectedTracks.length} tracks...`)

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
				var selectedRecv1 = motusFilter.selectedStations.includes(v.recv1);
				var selectedRecv2 = motusFilter.selectedStations.includes(v.recv2);
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
				projID: project,
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
// Returns the amount of space being used by indexeddb, in MB
async function checkDataUsage() {
	return navigator.storage.estimate().then((space)=>{
		return space.usage / Math.pow(2, 20); // MB
	});
}
