// Motus Wildlife Tracking System
// Lucas Berrigan
// 02 September 2021

function getMotusData(datasetName) {

  // List of all the files
  // This will have to change to include API calls
	var allFiles = {
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
	}

  // Create an empty file list to be populated based on the dataType/exploreView
	var fileList = [];

  if (typeof datasetName !== 'undefined') {

    if (typeof allFiles[datasetName] !== 'undefined') {

      fileList = [datasetName];

    } else {

      console.error('Dataset "%s" does not exist!', datasetName);

    }

  } else {
  	if (exploreType == 'main') {

  		if (dataType == 'animals') {
  				fileList = ["stationDeps", "tracks", "species", "animals"];
  		} else if (dataType == 'stations') {
  				fileList = ["stationDeps"];
  		} else {
  				fileList = ["stationDeps", "polygons", "regions",  "projects", "species", "animals"];
  		}

  	} else {

  		// We use all the files in the profiles view, but in retrospect we probably don't need to do this?
  		// Perhaps we should just load all the files at once.
  		fileList = Object.keys(allFiles);
  	}
  }

	if (window.location.hostname.includes('sandbox.motus.org')) {
		fileList.concat(['stations','antennaDeps']);
	}

	var promises = [];

	fileList.forEach(function(f){

		if (typeof allFiles[f] !== 'undefined') {
			var url = allFiles[f];
			url.substr(url.lastIndexOf('.') + 1, url.length) == 'csv' || url.substr(url.lastIndexOf('=') + 1, url.length) == 'csv' ? promises.push(d3.csv(url)) : promises.push(d3.json(url));
		} else {

      console.error('Dataset "%s" does not exist!', f);

    }

	});

  // Fetch all the data1
  console.log("Fetching files...");

	Promise.all(promises).then(function(response) {

  	fileList.forEach(function(f, i){

  		motusData[f] = response[i];

  	});


		if (!window.location.hostname.includes('sandbox.motus.org')) {
			if (typeof motusData.stations !== 'undefined') {

			}


	  	if (typeof motusData.animals !== 'undefined') {
	  		motusData.animals.forEach(function(x){
	  			x.geometry = {coordinates: [+x.lon, +x.lat], type: "Point"};

					var colourVal = dataType == 'projects' ? x.projID : dataType == 'regions' ? x.country : dataType == 'stations' ? "other" : dataType == 'species' ? x.species : x.animal;

	  			x.dtEnd = x.dtEnd.length == "NA" ? new Date().toISOString().substr(0, 10) : x.dtEnd;
	  			x.status = new Date() - new Date(x.dtEnd) > (2 * 24 * 60 * 60 * 1000) ? 'inactive' : 'active';
	  			x.geometry = {coordinates: [+x.lon, +x.lat], type: "Point"};
					x.colourVal = colourVal;
					x.type = "Feature";

	  		});

	  	}
	  	if (typeof motusData.projects !== 'undefined') {
	  		motusData.projects.forEach(function(x) {
	  			x.fee_id = getProjectType(x.fee_id);
	  			x.name = x.project_name;
	  		});
	  		function getProjectType(fee_id) {
	  			return (fee_id > 1 ? fee_id > 2 ? fee_id > 3 ? fee_id > 8 ? 'Birds Canada' : 'Wind development' : 'Environment Canada' : 'US Dept. of the Interior' : '')
	  		}
	  	}

	  	if (typeof motusData.stationDeps !== 'undefined') {

				motusData.stationDeps = motusData.stationDeps.filter(d => (!isNaN(+d.lat) && !isNaN(+d.lon) && d.frequency != 'NA'));

  		 	motusData.stationDeps.forEach(function(x) {

				//	x.dtEnd = x.tsEnd.length == 0 ? moment().toISOString().substr(0, 10) : moment(+x.tsEnd * 1000).toISOString().substr(0, 10);
					x.dtEnd = x.dtEnd == "NA" ? moment().toISOString().substr(0, 10) : x.dtEnd;
	  		} );
	  		motusData.stationDepsByName = d3.group(motusData.stationDeps, d => d.name);
	  	}

	  	if (typeof motusData.species !== 'undefined') {
	  		motusData.speciesByID = d3.group(motusData.species, d => d.id);
	  	}
	  	if (typeof motusData.regions !== 'undefined') {
	  		filters.options.regions = {};
	  		motusData.regions.forEach(function(x) {
	  			if (x.both > 0) {filters.options.regions[x.ADM0_A3] = x.country;}
	  		});
	  		console.log(filters.options.regions);
	  	}

		} else {

	  	if (typeof motusData.animals !== 'undefined') {

	  		motusData.animals = motusData.animals.filter(d => d.tsStart.length > 0);

	  		motusData.animals.forEach(function(x){

					var colourVal = dataType == 'projects' ? x.projID : dataType == 'regions' ? 'other' : dataType == 'stations' ? "other" : dataType == 'species' ? x.species : x.animal;

	  			x.dtStart = new Date(+x.tsStart * 1000).toISOString().substr(0, 10);
	  			x.dtEnd = x.tsEnd.length == 0 ? new Date().toISOString().substr(0, 10) : new Date(+x.tsEnd * 1000).toISOString().substr(0, 10);
	  			x.status = new Date() - new Date(x.dtEnd) > (2 * 24 * 60 * 60 * 1000) ? 'inactive' : 'active';
	  			x.geometry = {coordinates: [+x.lon, +x.lat], type: "Point"};
					x.colourVal = colourVal;
					x.type = "Feature";

	  		});

	  	}

	  	if (typeof motusData.projects !== 'undefined') {
	  		motusData.projects.forEach(function(x) {
	  			x.fee_id = getProjectType(0);
	  			x.name = x.Name;
					x.id = x.projectID;
	  		});
	  		function getProjectType(fee_id) {
	  			return (fee_id > 1 ? fee_id > 2 ? fee_id > 3 ? fee_id > 8 ? 'Birds Canada' : 'Wind development' : 'Environment Canada' : 'US Dept. of the Interior' : '')
	  		}
	  	}

	  	if (typeof motusData.stationDeps !== 'undefined') {
	  		motusData.stationDeps = motusData.stationDeps.filter(d => (!isNaN(+d.lat) && !isNaN(+d.lon) && d.frequency != 'NA'));
  		 	motusData.stationDeps.forEach(function(x) {

				//	x.dtEnd = x.tsEnd.length == 0 ? moment().toISOString().substr(0, 10) : moment(+x.tsEnd * 1000).toISOString().substr(0, 10);
					x.dtEnd = x.dtEnd == "NA" ? moment().toISOString().substr(0, 10) : x.dtEnd;
	  		} );
	  		motusData.stationDepsByName = d3.group(motusData.stationDeps, d => d.name);
	  	}

	  	if (typeof motusData.species !== 'undefined') {
				motusData.species.forEach(function(x) {
					x.id = x.speciesID;
				});
	  		motusData.speciesByID = d3.group(motusData.species, d => d.id);
	  	}

	  	if (typeof motusData.regions !== 'undefined') {
	  		filters.options.regions = {};
	  		motusData.regions.forEach(function(x) {
	  			if (x.both > 0) {filters.options.regions[x.ADM0_A3] = x.country;}
	  		});
	  		console.log(filters.options.regions);
	  	}
		}



  	console.log("Loaded " + Object.keys(motusData).length + " data set" + (Object.keys(motusData).length == 1 ? "" : "s"));

  	loadDashboardContent();

  });

}
