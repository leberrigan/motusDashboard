/*


Current order:

// When document loads

	$(document).ready(function(){});
	 |
	 ---readData()
		 |
		 ---populateSelectOptions() --> setFilter()
		 |
		 ---loadDataTable()
			 |
			 ---loadExploreCards()

// When select input is changed

	setFilter()

*/

//
//	Global variables
//
var speciesPhotos = ["swainson's thrush", "black-and-white warbler", "prairie warbler.jpg", "pectoral sandpiper.jpg","palm warbler","red-necked phalarope.jpg", "snow bunting.jpg", "semipalmated plover.jpg", "lincoln's sparrow.jpg", "cape may warbler.jpg", "semipalmated sandpiper.jpg", "eastern phoebe.jpg", "sanderling.jpg", "black-crowned night-heron.jpg", "yellow-billed cuckoo.jpg", "blackpoll warbler.jpg", "chipping sparrow.jpg", "dickcissel.jpg", "magnolia warbler.jpg", "tree swallow.jpg", "white-crowned sparrow.jpg"];
var stationPhotos = ["sable west spit.jpg", "pugwash.jpg", "panama sewage plant.jpg", "reserva nacional paracas.jpg", "nahant.jpg"];

var devText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";


var icons = {
	/*	species: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="-50 0 900 400"><path d="m 593.63776,191.06651 -159.1803,45.46998 3.019,6.13 46.529,68.677 -2.439,5.834 -81.503,31.964 -82.23705,-31.992 -2.434,-5.803 46.52405,-68.701 2.95,-5.975 L 208.32143,191.0665 -44.302404,223.18575 61.054237,124.39961 208.32143,79.074162 l 140.55903,6.86332 15.3948,-13.13068 11.5769,-34.43522 18.8475,-13.58332 3.30134,-24.82593528 2.17411,-2.36971272 2.07904,2.47033816 3.38371,24.70155984 18.5618,13.77773 10.0921,32.89878 17.2207,14.50546 142.1253,-6.87232 150.64264,45.325448 106.87955,99.12663 z"/></svg>',*/
	animals: '<svg xmlns="http://www.w3.org/2000/svg" class="icon-animals icon" fill="#FFFFFF" stroke="currentColor" stroke-width="20" viewBox="125 -10 250 500"><path d="m 307.38806,152.71231 v 163.57 c 0,8.284 -6.716,15 -15,15 -41.28149,-0.71533 -47.28327,1.62781 -80,0 -8.284,0 -15,-6.716 -15,-15 v -164.459 c -16.587,-15.09 -27,-36.85 -27,-61.041001 0,-45.563 36.937,-82.5 82.5,-82.5 45.563,0 82.5,36.937 82.5,82.5 0,24.672001 -10.834,46.811001 -28,61.930001 z" /><path d="M 251.05287,334.93644 V 488.58051"/></svg>',
	animate: '<svg xmlns="http://www.w3.org/2000/svg" class="icon-animate icon" fill="currentColor" class="explore-animate-btn tips" alt="Animate tracks" viewBox="0 0 16 16"><path d="M 13.206 7.5 L 4.5 2.4495 v 10.101 L 13.206 7.5 z m 1.188 -1.044 a 1.203 1.203 90 0 1 0 2.088 l -9.5445 5.538 C 4.0695 14.535 3 14.0175 3 13.038 V 1.962 c 0 -0.9795 1.0695 -1.497 1.8495 -1.044 l 9.5445 5.538 z"/></svg>',
	add: '<div class="add_icon"><svg xmlns="http://www.w3.org/2000/svg" class="icon-add icon" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/></svg></div>',
	camera: '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" id="svg8" version="1.1" viewBox="0 0 59.208336 38.041672" class="icons-camera icon"> <defs id="defs2" /> <metadata id="metadata5"> <rdf:RDF> <cc:Work rdf:about=""> <dc:format>image/svg+xml</dc:format> <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" /> <dc:title></dc:title> </cc:Work> </rdf:RDF> </metadata> <g transform="translate(-52.416666,-121.875)" id="layer1"> <path id="path4520" d="m 52.916667,156.77083 -10e-7,-23.8125 c 0.07609,-3.35273 1.582589,-5.35555 5.291667,-5.29166 H 71.4375 c 0.946943,-2.17074 0.246566,-4.80156 3.96875,-5.29167 h 13.229167 c 2.97845,0.037 3.387115,2.75455 3.96875,5.29167 h 13.229163 c 3.90069,-0.0631 5.18139,2.11388 5.29167,5.29166 v 23.8125 c -0.18623,1.7734 -1.22238,2.43252 -2.59859,2.64584 H 55.5625 c -1.892818,-0.18261 -2.402997,-1.32175 -2.645833,-2.64584 z" style="fill:none;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" /> <circle r="11.49465" cy="144.18936" cx="81.612877" id="path4524" style="fill:none;fill-opacity:1;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" /> <circle r="8.2983761" cy="144.20241" cx="81.675636" id="path4524-5" style="fill:none;fill-opacity:1;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" /> </g></svg>',
	countries: '<svg xmlns="http://www.w3.org/2000/svg" class="icon-countries icon" viewBox="0 0 27 27"><g transform="translate(0,-270.54167)"> <path d="m 1.3229166,294.35417 7.9375,-2.64583 7.9374994,2.64583 7.9375,-2.64583 V 273.1875 l -7.9375,2.64584 -7.9374994,-2.64584 -7.9375,2.64584 z" style="fill:none;stroke:#000000;stroke-width:1.32291665;stroke-linecap:butt;stroke-linejoin:round;stroke-opacity:1;stroke-miterlimit:4;stroke-dasharray:none;paint-order:fill markers stroke" /> <path d="m 9.2604166,273.1875 v 18.52084" style="fill:none;stroke:#000000;stroke-width:1.32291665;stroke-linecap:butt;stroke-linejoin:round;stroke-opacity:1;stroke-miterlimit:4;stroke-dasharray:none;paint-order:fill markers stroke" /> <path d="M 17.197916,294.35417 V 275.83334" style="fill:none;stroke:#000000;stroke-width:1.32291665;stroke-linecap:butt;stroke-linejoin:round;stroke-opacity:1;stroke-miterlimit:4;stroke-dasharray:none;paint-order:fill markers stroke" /> </g></svg>',
	download: '<svg xmlns="http://www.w3.org/2000/svg" class="icon-download icon" viewBox="0 0 100 100"><g transform="translate(0,-77.196699)"><path style="stroke-width:0.22810185" d="M 71.184445,127.20913 H 58.681499 v -22.92514 c 0,-0.60812 -0.196624,-1.10698 -0.586906,-1.49794 -0.388685,-0.38983 -0.888457,-0.58577 -1.495664,-0.58577 H 44.093702 c -0.607663,0 -1.107206,0.19594 -1.497945,0.58577 -0.390967,0.39119 -0.586222,0.88982 -0.586222,1.49794 v 22.92423 H 29.50522 c -0.954834,0 -1.606293,0.43454 -1.95392,1.30224 -0.347627,0.82596 -0.194799,1.58462 0.455976,2.2801 l 20.840068,20.83962 c 0.478101,0.39028 0.976961,0.58554 1.497945,0.58554 0.5203,0 1.019843,-0.19526 1.498402,-0.58554 l 20.774831,-20.77392 c 0.433849,-0.52076 0.650318,-1.0438 0.650318,-1.56296 0,-0.6072 -0.195027,-1.10697 -0.586906,-1.49862 -0.389826,-0.39052 -0.889369,-0.58555 -1.497489,-0.58555 z" /><path d="m 10.924903,167.89927 80.108917,0.42385" style="fill:none;stroke:#000000;stroke-width:9.12407398;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:1;stroke-dasharray:none;stroke-opacity:1" /></g></svg>',
	detections: '<svg xmlns="http://www.w3.org/2000/svg" class="icon-detections icon" stroke-width="20" stroke="currentColor" viewBox="0 0 100 100">  <defs> <clipPath id="clipPath4716" clipPathUnits="userSpaceOnUse"> <path d="M 376.06161,376.06303 V 1.8911244 H 363.86239 L 189.05379,176.69972 14.245251,1.8911244 H 1.8897865 V 376.06303 H 14.089005 L 189.05379,201.09819 364.01863,376.06303 Z" style="display:inline;fill:#000000;fill-opacity:1;stroke:#000000;stroke-width:0.99999994;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"></path> </clipPath> </defs><g style="display:inline"></g> <g style="display:inline" transform="translate(-49.999997,-147)"> <circle r="12.5" cy="197" cx="100" style="fill:;fill-opacity:1;stroke-width:0.50107378;stroke-miterlimit:4;stroke-dasharray:none"></circle> <path clip-path="url(#clipPath4716)" id="path815-5" transform="matrix(0.26458333,0,0,0.26458333,49.999997,147)" d="M 188.97656,9.4570312 A 179.51911,179.5191 0 0 0 9.4570312,188.97656 179.51911,179.5191 0 0 0 188.97656,368.49609 179.51911,179.5191 0 0 0 368.49609,188.97656 179.51911,179.5191 0 0 0 188.97656,9.4570312 Z m 0,70.8574218 A 108.66142,108.66142 0 0 1 297.63867,188.97656 108.66142,108.66142 0 0 1 188.97656,297.63867 108.66142,108.66142 0 0 1 80.314453,188.97656 108.66142,108.66142 0 0 1 188.97656,80.314453 Z" style="fill:none;fill-opacity:1;stroke-width:18.91456032;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"></path> </g></svg>',
	expand:'<svg xmlns="http://www.w3.org/2000/svg" class="icon-expand icon" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg>',
	edit: '<svg xmlns="http://www.w3.org/2000/svg" class="icon-edit icon" viewBox="0 0 16 16" class="explore-map-edit-btn tips" alt="Open station planner">'+
	  '<path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>'+
	  '<path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>'+
	'</svg>',
	filters: '<svg xmlns="http://www.w3.org/2000/svg" class="icon-filter icon" class="explore-filter-btn tips" alt="Show filters" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2h-11z" /></svg>',
	addFilter: '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" class="icons-addFilter icon" class="add-filter-btn tips" alt="Add to filters"> <path style="fill:#000000;fill-rule:evenodd;stroke:none;stroke-width:0.5;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;fill-opacity:1" d="M 2.5 1.25 A 0.625 0.625 0 0 0 1.875 1.875 L 1.875 4.375 A 0.625 0.625 0 0 0 2.0351562 4.7929688 L 7.5 10.865234 L 7.5 18.125 A 0.625 0.625 0 0 0 8.3222656 18.716797 L 12.072266 17.466797 A 0.625 0.625 0 0 0 12.5 16.875 L 12.5 10.865234 L 16.464844 6.4589844 A 4.0735662 4.0735662 0 0 1 15.298828 5.8867188 L 11.410156 10.207031 A 0.625 0.625 0 0 0 11.25 10.625 L 11.25 16.425781 L 8.75 17.257812 L 8.75 10.625 A 0.625 0.625 0 0 0 8.5898438 10.207031 L 3.125 4.1347656 L 3.125 2.5 L 13.578125 2.5 A 4.0735662 4.0735662 0 0 1 13.794922 1.25 L 2.5 1.25 z " transform="scale(0.8)" /> <path style="fill:none;stroke:#00AA00;stroke-width:0.80000001;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="m 12.029041,2.2652033 2.948276,0.02397 M 13.503179,0.81503537 13.479209,3.7633111" /></svg>',
	removeFilter: '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" class="icons-removeFilter icon" class="remove-filter-btn tips" alt="Remove filter"> <path style="fill:#000000;fill-rule:evenodd;stroke:none;stroke-width:0.5;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;fill-opacity:1" d="M 2.5 1.25 A 0.625 0.625 0 0 0 1.875 1.875 L 1.875 4.375 A 0.625 0.625 0 0 0 2.0351562 4.7929688 L 7.5 10.865234 L 7.5 18.125 A 0.625 0.625 0 0 0 8.3222656 18.716797 L 12.072266 17.466797 A 0.625 0.625 0 0 0 12.5 16.875 L 12.5 10.865234 L 16.464844 6.4589844 A 4.0735662 4.0735662 0 0 1 15.298828 5.8867188 L 11.410156 10.207031 A 0.625 0.625 0 0 0 11.25 10.625 L 11.25 16.425781 L 8.75 17.257812 L 8.75 10.625 A 0.625 0.625 0 0 0 8.5898438 10.207031 L 3.125 4.1347656 L 3.125 2.5 L 13.578125 2.5 A 4.0735662 4.0735662 0 0 1 13.794922 1.25 L 2.5 1.25 z " transform="scale(0.8)" id="path2" /> <path id="path4537-0" style="fill:none;stroke:#AA0000;stroke-width:0.80000001;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="m 12.537516,2.5363897 2.948276,0.02397" inkscape:connector-curvature="0" sodipodi:nodetypes="cc" /></svg>',
	help: '<svg xmlns="http://www.w3.org/2000/svg" class="icons-help icon" fill="currentColor" class="bi bi-question-circle" viewBox="0 0 16 16">'+
	  '<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>'+
	  '<path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>'+
	'</svg>',
	lastData: '<svg xmlns="http://www.w3.org/2000/svg" class="icons-lastData icon" fill="currentColor" viewBox="0 0 16 16"><path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z"/><path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/><path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/></svg>',
	map: '<svg xmlns="http://www.w3.org/2000/svg" class="icons-map icon" stroke="currentColor" viewBox="0 0 27 27"><g transform="translate(0,-270.54167)"> <path d="m 1.3229166,294.35417 7.9375,-2.64583 7.9374994,2.64583 7.9375,-2.64583 V 273.1875 l -7.9375,2.64584 -7.9374994,-2.64584 -7.9375,2.64584 z" style="fill:none;stroke-width:1.32291665;stroke-linecap:butt;stroke-linejoin:round;stroke-opacity:1;stroke-miterlimit:4;stroke-dasharray:none;paint-order:fill markers stroke" /> <path d="m 9.2604166,273.1875 v 18.52084" style="fill:none;stroke-width:1.32291665;stroke-linecap:butt;stroke-linejoin:round;stroke-opacity:1;stroke-miterlimit:4;stroke-dasharray:none;paint-order:fill markers stroke" /> <path d="M 17.197916,294.35417 V 275.83334" style="fill:none;stroke-width:1.32291665;stroke-linecap:butt;stroke-linejoin:round;stroke-opacity:1;stroke-miterlimit:4;stroke-dasharray:none;paint-order:fill markers stroke" /> </g></svg>',
	menu: '<svg xmlns="http://www.w3.org/2000/svg" class="icons-menu icon" fill="currentColor" viewBox="0 0 100 100"> <path d="M 97.206704,100 H 2.7932961 C 1.2505587,100 0,98.77005 0,97.25275 V 81.86813 C 0,80.35082 1.2505587,79.12088 2.7932961,79.12088 H 97.206704 C 98.749441,79.12088 100,80.35082 100,81.86813 V 97.25275 C 100,98.77005 98.749441,100 97.206704,100 Z m 0,-39.56044 H 2.7932961 C 1.2505587,60.43956 0,59.20962 0,57.69231 V 42.30769 C 0,40.79038 1.2505587,39.56044 2.7932961,39.56044 H 97.206704 c 1.542737,0 2.793296,1.22994 2.793296,2.74725 v 15.38462 c 0,1.51731 -1.250559,2.74725 -2.793296,2.74725 z m 0,-39.56044 H 2.7932961 C 1.2505587,20.87912 0,19.64918 0,18.13187 V 2.74725 C 0,1.22995 1.2505587,0 2.7932961,0 H 97.206704 C 98.749441,0 100,1.22995 100,2.74725 v 15.38462 c 0,1.51731 -1.250559,2.74725 -2.793296,2.74725 z" style="fill-rule:evenodd;stroke-width:0.27701786" /></svg>',
	pause: '<svg xmlns="http://www.w3.org/2000/svg" class="icons-pause icon" fill="currentColor" class="explore-pause-btn" alt="Pause" viewBox="0 0 16 16"><path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/></svg>',
	pdf: '<svg xmlns="http://www.w3.org/2000/svg" class="icons-pdf icon" viewBox="0 0 41.659309 29.902843"><g inkscape:label="Layer 1" inkscape:groupmode="layer" transform="translate(-70.25338,-154.21364)"> <text xml:space="preserve" x="73.117455" y="170.28175" transform="scale(0.92485882,1.0812461)"><tspan sodipodi:role="line" x="73.117455" y="170.28175" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:44.45785141px;font-family:\'Tw Cen MT Condensed\';-inkscape-font-specification:\'Tw Cen MT Condensed, Normal\';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-feature-settings:normal;text-align:start;writing-mode:lr-tb;text-anchor:start;stroke-width:1.11144626">PDF</tspan></text> </g></svg>',
	play: '<svg xmlns="http://www.w3.org/2000/svg" class="icons-play icon" fill="currentColor" class="explore-play-btn" alt="Play" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>',
	projects: '<svg xmlns="http://www.w3.org/2000/svg" class="icons-projects icon" stroke="currentColor" viewBox="0 0 16 16">'+
	  '<path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>'+
	  '<path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>'+
	'</svg>',
	regions: "",
	remove: '<svg xmlns="http://www.w3.org/2000/svg" class="icons-remove icon" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/></svg>',
	species: '<svg xmlns="http://www.w3.org/2000/svg" class="icon-species icon" fill="currentColor" viewBox="70 160 70 50"><path d="m 107.67084,195.05271 2.93997,-5.47902 5.47902,2.20496 10.95805,-1.87087 10.02261,-7.55037 2.73951,-7.61718 -2.87315,-7.34991 -16.50389,4.54358 -8.61944,0.40091 -1.33635,-0.60136 -2.40542,-7.48355 -1.73725,-1.36975 -1.06908,-2.27179 -1.03031,2.17155 -1.73725,1.36975 -2.40542,7.48355 -1.33635,0.60136 -8.61944,-0.40091 -16.50389,-4.54358 -2.87315,7.34991 2.73951,7.61718 10.02261,7.55037 10.95805,1.87088 5.47902,-2.20497 2.93997,5.47903 -0.40089,7.08264 -0.63476,4.57699 1.97111,2.37202 1.43117,-2.07132 1.46998,2.17157 1.97111,-2.37202 -0.63476,-4.57699 z" style="stroke-width:3px;"></path></svg>',
	stations: '<svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid" class="icon-stations icon" viewBox="0 0 389.923 481.915">  <path d="M358.000,145.000 L358.000,88.000 L280.000,88.000 L280.000,127.000 L270.000,127.000 L270.000,88.000 L197.000,88.000 L197.000,210.720 L280.003,455.303 L275.586,459.008 L232.000,330.572 L232.000,338.000 L197.000,338.000 L197.000,404.988 L187.000,404.988 L187.000,338.000 L150.007,338.000 L108.464,460.008 L103.997,456.274 L187.000,212.504 L187.000,88.000 L114.000,88.000 L114.000,127.000 L104.000,127.000 L104.000,88.000 L30.000,88.000 L30.000,152.000 L20.000,152.000 L20.000,20.000 L30.000,20.000 L30.000,78.000 L104.000,78.000 L104.000,40.000 L114.000,40.000 L114.000,78.000 L187.000,78.000 L187.000,57.012 L197.000,57.012 L197.000,78.000 L270.000,78.000 L270.000,40.000 L280.000,40.000 L280.000,78.000 L358.000,78.000 L358.000,20.000 L368.000,20.000 L368.000,78.000 L368.000,88.000 L368.000,145.000 L358.000,145.000 ZM197.000,328.000 L231.127,328.000 L197.000,227.438 L197.000,328.000 ZM187.000,229.355 L153.412,328.000 L187.000,328.000 L187.000,229.355 Z" transform="translate(10.96 10.96)" style="stroke-width: 10;"></path></svg>',
	station: '<svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid" class="icon-stations icon" viewBox="0 0 389.923 481.915">  <path d="M358.000,145.000 L358.000,88.000 L280.000,88.000 L280.000,127.000 L270.000,127.000 L270.000,88.000 L197.000,88.000 L197.000,210.720 L280.003,455.303 L275.586,459.008 L232.000,330.572 L232.000,338.000 L197.000,338.000 L197.000,404.988 L187.000,404.988 L187.000,338.000 L150.007,338.000 L108.464,460.008 L103.997,456.274 L187.000,212.504 L187.000,88.000 L114.000,88.000 L114.000,127.000 L104.000,127.000 L104.000,88.000 L30.000,88.000 L30.000,152.000 L20.000,152.000 L20.000,20.000 L30.000,20.000 L30.000,78.000 L104.000,78.000 L104.000,40.000 L114.000,40.000 L114.000,78.000 L187.000,78.000 L187.000,57.012 L197.000,57.012 L197.000,78.000 L270.000,78.000 L270.000,40.000 L280.000,40.000 L280.000,78.000 L358.000,78.000 L358.000,20.000 L368.000,20.000 L368.000,78.000 L368.000,88.000 L368.000,145.000 L358.000,145.000 ZM197.000,328.000 L231.127,328.000 L197.000,227.438 L197.000,328.000 ZM187.000,229.355 L153.412,328.000 L187.000,328.000 L187.000,229.355 Z" transform="translate(10.96 10.96)" style="stroke-width: 10;"></path></svg>',
	stop: '<svg xmlns="http://www.w3.org/2000/svg" class="icon-stop icon" fill="currentColor" class="explore-stop-btn" alt="Stop" viewBox="0 0 16 16"><path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/></svg>',
	share: '<svg xmlns="http://www.w3.org/2000/svg" class="icon-share icon" fill="currentColor" viewBox="0 0 16 16"><path d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5z"/></svg>',
	search: '<svg xmlns="http://www.w3.org/2000/svg" class="icon-search icon" fill="currentColor" class="explore-search-btn tips" alt="Search" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>',
	tags: '<svg xmlns="http://www.w3.org/2000/svg" class="icon-tags icon" fill="#FFFFFF" stroke="currentColor" stroke-width="20" viewBox="125 -10 250 500"><path d="m 307.38806,152.71231 v 163.57 c 0,8.284 -6.716,15 -15,15 -41.28149,-0.71533 -47.28327,1.62781 -80,0 -8.284,0 -15,-6.716 -15,-15 v -164.459 c -16.587,-15.09 -27,-36.85 -27,-61.041001 0,-45.563 36.937,-82.5 82.5,-82.5 45.563,0 82.5,36.937 82.5,82.5 0,24.672001 -10.834,46.811001 -28,61.930001 z" /><path d="M 251.05287,334.93644 V 488.58051"/></svg>',
	target: '<svg xmlns="http://www.w3.org/2000/svg" class="icon-target icon" stroke="currentColor" stroke-width="20" viewBox="0 0 225 225"><?xml version="1.0" encoding="UTF-8" standalone="no"?> <!-- Created with Inkscape (http://www.inkscape.org/) --> <svg xmlns="http://www.w3.org/2000/svg" width="58.208347mm" height="58.20834mm" viewBox="0 0 58.208347 58.20834" version="1.1" stroke="currentColor" id="svg8"> <g transform="translate(-2.645827,-3.3125006)"> <circle style="fill:none;fill-opacity:1;stroke-width:3;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" id="path4518" cx="32.178452" cy="32.628746" r="20.894449" /> <path style="fill:none;stroke-width:3;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="M 31.75,21.833333 V 3.3125006" id="path4522"/> </g> <g transform="translate(-2.645827,-3.3125006)"> <path style="fill:none;stroke-width:3;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="m 42.333333,32.416667 h 18.52084" id="path4522-1" /> <path style="fill:none;stroke-width:3;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="M 31.75,43 V 61.52084" id="path4522-1-2"/> <path style="fill:none;stroke-width:3;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="m 2.645827,32.416667 h 18.52084" id="path4522-1-5"/> </g> </svg> ',
	timeline: '<svg xmlns="http://www.w3.org/2000/svg" class="icon-timeline icon" fill="currentColor" class="explore-timeline-btn tips" alt="Timeline" viewBox="0 0 16 16"><path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z"/><path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/><path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/></svg>',
	track: '<svg   xmlns:dc="http://purl.org/dc/elements/1.1/"   xmlns:cc="http://creativecommons.org/ns#"   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"   xmlns:svg="http://www.w3.org/2000/svg"   xmlns="http://www.w3.org/2000/svg"   version="1.1"   viewBox="0 0 23.052618 41.573452"   class="icon-track icon" >  <defs     id="defs2">    <marker       style="overflow:visible"       id="marker1384"       refX="0"       refY="0"       orient="auto">      <path         transform="matrix(0.4,0,0,0.4,2.96,0.4)"         style="fill:#000000;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:1.00000003pt;stroke-opacity:1"         d="m -2.5,-1 c 0,2.76 -2.24,5 -5,5 -2.76,0 -5,-2.24 -5,-5 0,-2.76 2.24,-5 5,-5 2.76,0 5,2.24 5,5 z"         id="path1382" />    </marker>    <marker       style="overflow:visible"       id="DotM"       refX="0"       refY="0"       orient="auto">      <path         transform="matrix(0.4,0,0,0.4,2.96,0.4)"         style="fill:#000000;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:1.00000003pt;stroke-opacity:1"         d="m -2.5,-1 c 0,2.76 -2.24,5 -5,5 -2.76,0 -5,-2.24 -5,-5 0,-2.76 2.24,-5 5,-5 2.76,0 5,2.24 5,5 z"         id="path910" />    </marker>    <marker       style="overflow:visible"       id="DotL"       refX="0"       refY="0"       orient="auto">      <path         transform="matrix(0.8,0,0,0.8,5.92,0.8)"         style="fill:#000000;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:1.00000003pt;stroke-opacity:1"         d="m -2.5,-1 c 0,2.76 -2.24,5 -5,5 -2.76,0 -5,-2.24 -5,-5 0,-2.76 2.24,-5 5,-5 2.76,0 5,2.24 5,5 z"         id="path907" />    </marker>  </defs>  <g     transform="translate(-32.112052,-59.290716)"     id="layer1">    <path       d="M 34.395833,98.5625 52.916666,61.520831"       style="fill:none;stroke:#000000;stroke-width:1;stroke-miterlimit:3.29999995;stroke-dasharray:none;stroke-opacity:1;marker-start:url(#DotM);marker-end:url(#marker1384)" />  </g></svg>',
	zoom: '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/><path d="M10.344 11.742c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1 6.538 6.538 0 0 1-1.398 1.4z"/><path fill-rule="evenodd" d="M6.5 3a.5.5 0 0 1 .5.5V6h2.5a.5.5 0 0 1 0 1H7v2.5a.5.5 0 0 1-1 0V7H3.5a.5.5 0 0 1 0-1H6V3.5a.5.5 0 0 1 .5-.5z"/></svg>'
}

var logos = {

	motus: "images/motus-logo-lg.png",
	birdsCanada: "images/birds-canada-logo.png"

}
var conservationStatus = {
	DD: "Data deficient",
	LC: "Least concern",
	NT: "Near threatened",
	VU: "Vulnerable",
	EN: "Endangered",
	CR: "Critically endangered",
	EW: "Extinct in the wild",
	EX: "Extinct"
}

var default_tableOpts = {
	dom: "Bipt",
	"language": {
		"info": "Showing _TOTAL_ entries",
		"infoEmpty": "Showing 0 entries",
		"infoFiltered": "",
	},
	buttons: [
		'copy',
		'csv'
	],
}

var icon_paths = {

	stations:"M 8.95 3.625 L 8.95 2.2 L 7 2.2 L 7 3.175 L 6.75 3.175 L 6.75 2.2 L 4.925 2.2 L 4.925 5.268 L 7.0001 11.3826 L 6.8897 11.4752 L 5.8 8.2643 L 5.8 8.45 L 4.925 8.45 L 4.925 10.1247 L 4.675 10.1247 L 4.675 8.45 L 3.7502 8.45 L 2.7116 11.5002 L 2.5999 11.4068 L 4.675 5.3126 L 4.675 2.2 L 2.85 2.2 L 2.85 3.175 L 2.6 3.175 L 2.6 2.2 L 0.75 2.2 L 0.75 3.8 L 0.5 3.8 L 0.5 0.5 L 0.75 0.5 L 0.75 1.95 L 2.6 1.95 L 2.6 1 L 2.85 1 L 2.85 1.95 L 4.675 1.95 L 4.675 1.4253 L 4.925 1.4253 L 4.925 1.95 L 6.75 1.95 L 6.75 1 L 7 1 L 7 1.95 L 8.95 1.95 L 8.95 0.5 L 9.2 0.5 L 9.2 1.95 L 9.2 2.2 L 9.2 3.625 L 8.95 3.625 Z M 4.925 8.2 L 5.7782 8.2 L 4.925 5.686 L 4.925 8.2 Z M 4.675 5.7339 L 3.8353 8.2 L 4.675 8.2 L 4.675 5.7339 Z"

}

var motusData = {};

var filters = {
	options: {
		projects: {},
		stations: {},
		species: {},
		animals: {},
		frequencies: ["166.380","434", "151.5", "150.1"],
		regions: ["North America", "Latin America", "Europe", "Asia", "Australia", "Africa"],
		models: ["NTQB2-1", "NTQB2-1-2", "NTQB2-2", "NTQB2-3-2", "NTQB2-4-2"],
		status: ['Active','Inactive']
	},
	selected: {
		species: ['all']
	},
	data: {}
}
var dataTypes = ['Stations', 'Animals', 'Regions', 'Projects', 'Species']

var timeRange = {};

var default_startDate = new Date('2014-02-05'),
	default_endDate = new Date('2021-04-20');
var dtLims2;
(function(){
	dtLims2 = function(){

		function dateLimits(){
				dateLimits.min = dateLimits.getMinDate();
				dateLimits.max = dateLimits.getMaxDate();
				return dateLimits;
		};

		dateLimits.getMinDate = function() {

				console.log("Get Min Date");
			if (typeof motusData.selectedStations !== 'undefined' && typeof motusData.selectedAnimals !== 'undefined') {
				return d3.min([d3.min(motusData.selectedStations, x => x.dtStart), d3.min(motusData.selectedAnimals, x => x.dtStart)]);
			} else if (typeof motusData.selectedStations !== 'undefined') {
				return d3.min(motusData.selectedStations, x => x.dtStart);
			} else if (typeof motusData.selectedAnimals !== 'undefined') {
				return d3.min(motusData.selectedAnimals, x => x.dtStart);
			} else if (typeof motusData.stations !== 'undefined' && typeof motusData.animals !== 'undefined') {
				return d3.min([d3.min(motusData.stations, x => x.dtStart), d3.min(motusData.animals, x => x.dtStart)]);
			} else if (typeof motusData.stations !== 'undefined') {
				return d3.min(motusData.stations, x => x.dtStart);
			} else if (typeof motusData.animals !== 'undefined') {
				return d3.min(motusData.animals, x => x.dtStart);
			} else {
				return new Date();
			}

		}

		dateLimits.getMaxDate = function() {
			console.log("Get Max Date");
			if (typeof motusData.selectedStations !== 'undefined' && typeof motusData.selectedAnimals !== 'undefined') {
				return d3.max([d3.max(motusData.selectedStations, x => x.dtEnd), d3.max(motusData.selectedAnimals, x => x.dtEnd)]);
			} else if (typeof motusData.selectedStations !== 'undefined') {
				return d3.max(motusData.selectedStations, x => x.dtEnd);
			} else if (typeof motusData.selectedAnimals !== 'undefined') {
				return d3.max(motusData.selectedAnimals, x => x.dtEnd);
			} else if (typeof motusData.stations !== 'undefined' && typeof motusData.animals !== 'undefined') {
				return d3.max([d3.max(motusData.stations, x => x.dtEnd), d3.max(motusData.animals, x => x.dtEnd)]);
			} else if (typeof motusData.stations !== 'undefined') {
				return d3.max(motusData.stations, x => x.dtEnd);
			} else if (typeof motusData.animals !== 'undefined') {
				return d3.max(motusData.animals, x => x.dtEnd);
			} else {
				return new Date();
			}

		}

		dateLimits.min = typeof dateLimits.min === 'undefined' ? dateLimits.getMinDate() :
			typeof dateLimits.min.getTime === 'undefined' || isNaN(dateLimits.min.getTime()) ? dateLimits.getMinDate() :
			typeof dateLimits.min === 'string' && isNaN(new Date(dateLimits.min).getTime()) ? dateLimits.getMinDate() :
			typeof dateLimits.min === 'string' && !isNaN(new Date(dateLimits.min).getTime()) ? new Date(dateLimits.min) :
			dateLimits.min;

		dateLimits.max = typeof dateLimits.max === 'undefined' ? dateLimits.getMaxDate() :
			typeof dateLimits.max.getTime === 'undefined' || isNaN(dateLimits.max.getTime()) ? dateLimits.getMaxDate() :
			typeof dateLimits.max === 'string' && isNaN(new Date(dateLimits.max).getTime()) ? dateLimits.getMaxDate() :
			typeof dateLimits.max === 'string' && !isNaN(new Date(dateLimits.max).getTime()) ? new Date(dateLimits.max) :
			dateLimits.max;

		return dateLimits;
	}
})();

var dtLims = {min: default_startDate, max: default_endDate};

var motusFilter = {
	dtStart: default_startDate,
	dtEnd: default_endDate,
	species: ["all"],
	regions: ["all"],
	projects: ["all"],
	stations: ["all"],
	status: ["all"],
	frequencies: ["all"],
	selections: [],
	colour: ''
};
var URLdataType = null,
	URLmapType = null;

var isMobile = false;

var currLang = 'english';
var regionVar = 'country';

var exploreType,
	mapType,
	dataType; // 'stations' or 'species'

var reportStep = 1;


function updateURL(reload) {

	var stateToPush = 'e=' + (exploreType) + '&d=' + (dataType),
		toEncode;

	for (f in motusFilter) {
		if (typeof motusFilter[f] !== 'undefined' && f != 'default') {
			if (motusFilter[f][0] != 'all' &&
				(!f.includes("selected")) &&
				(f != 'dtStart' || motusFilter.dtStart.toISOString().substr(0,10) != default_startDate.toISOString().substr(0,10)) &&
				(f != 'dtEnd' || motusFilter.dtEnd.toISOString().substr(0,10) != default_endDate.toISOString().substr(0,10))
				) {
				if (['dtStart','dtEnd'].includes(f)) {
					toEncode = motusFilter[f].toISOString().substr(0,10);
				} else  {
					toEncode = motusFilter[f];
				}
				if ( f == 'selections' ||
						( motusFilter.default && motusFilter.default[f] != motusFilter[f] && ['dtStart','dtEnd', 'colour'].includes(f) ) ||
						!( !['dtStart','dtEnd', 'colour', 'group'].includes(f) && motusFilter.default && motusFilter.default[f] && motusFilter.default[f].sort().join(',') == motusFilter[f].sort().join(',') )
						) {
					stateToPush+='&'+f+'='+encodeURIComponent(toEncode.constructor.name == "Array" ? toEncode.filter(onlyUnique) : toEncode);
				}
			}
		}

	}
//	console.log("URL length: ", stateToPush.length);
//	stateToPush = (compressString(stateToPush));
//	console.log("URL length: ", stateToPush.length);
//	stateToPush = encodeURIComponent((stateToPush));
//	console.log("URL length: ", stateToPush.length);

	stateToPush = "#" + stateToPush;

	if (reload === true) {
		window.location.href = stateToPush;
		$('.explore-card-wrapper').animate({'opacity':0}, 500, function(){location.reload();});

	}
	else {
		window.history.pushState("", document.title, stateToPush);
	}


}

function detectNavigation() {

	var url_params = getSearchParameters( window.location.hash.substr(1) );

	if (typeof exploreType === "undefined") {
		// Define the explore view
		//  exploreType defaults to "main" if not present in expected set of values
		exploreType = "report";
	}

	if (typeof dataType === "undefined") {
		// Define the main dataset being explore
		//  dataType defaults to null if not present in expected set of values
		dataType = url_params.d !== undefined && dataTypes.includes(firstToUpper(url_params.d)) ? url_params.d : 'stations';
	}

	if ( 	(typeof url_params.e !== 'undefined' && url_params.e !== exploreType)	||
				(typeof url_params.d !== 'undefined' && url_params.d !== dataType )				) {

		$('.explore-card-wrapper').animate({'opacity':0}, 500, function(){location.reload();});

	} else if (	url_params.d === undefined 																									||
							!dataTypes.includes(firstToUpper(url_params.d))															||
							url_params.e === undefined 																									||
							(!dataTypes.includes(firstToUpper(url_params.e)) && url_params.e != 'main' && url_params.e != 'report')			) {

		window.location.href=`#e=${exploreType}&d=${dataType}`;
		$('.explore-card-wrapper').animate({'opacity':0}, 500, function(){location.reload();});

	} else if (url_params.d != url_params.e && url_params.e != 'main' && url_params.e != 'report') {

		window.location.href=`#e=report&d=${dataType}`;
		$('.explore-card-wrapper').animate({'opacity':0}, 500, function(){location.reload();});

	}

	motusFilter = {
		dtStart: url_params.dtStart === undefined || url_params.dtStart.length == 0 ? motusFilter.dtStart : new Date(url_params.dtStart),
		dtEnd: url_params.dtEnd === undefined || url_params.dtEnd.length == 0 ? motusFilter.dtEnd : new Date(url_params.dtEnd),
		species: url_params.species === undefined || url_params.species.length == 0 ? ["all"] : url_params.species.split(','),
		animals: url_params.animals === undefined || url_params.animals.length == 0 ? ["all"] : url_params.animals.split(','),
		regions: url_params.regions === undefined || url_params.regions.length == 0 ? ["all"] : url_params.regions.split(','),
		projects: url_params.projects === undefined || url_params.projects.length == 0 ? ["all"] : url_params.projects.split(','),
		stations: url_params.stations === undefined || url_params.stations.length == 0 ? ["all"] : url_params.stations.split(','),
		status: url_params.status === undefined || url_params.status.length == 0 ? ["all"] : url_params.status.split(','),
		selections: url_params.selections === undefined || url_params.selections.length == 0 ? url_params[dataType] === undefined ? [] : url_params[dataType].split(',') : url_params.selections.split(','),
		frequencies: url_params.frequencies === undefined || url_params.frequencies.length == 0 ? ["all"] : url_params.frequencies.split(','),
		group: url_params.group === undefined || url_params.group.length == 0 ? [] : url_params.group,
		colour: url_params.frequencies === undefined || url_params.frequencies.length == 0 ? [] : url_params.colour
	};
	if (motusFilter[dataType].includes('all') && motusFilter.selections.length > 0) {
//		motusFilter[dataType] = motusFilter.selections;
	//} else if ( !motusFilter.selections.every( x => motusFilter[dataType].includes(x))) {
//		motusFilter[dataType].concat( motusFilter.selections.filter( x => !motusFilter[dataType].includes(x) ) );
	}


	if (motusMap.setVisibility) {
		motusMap.setVisibility();
	}
}

var filePrefix;

$(document).ready(function(){

//	$('.explore-card-wrapper').css({'opacity':0});

	testTimer.push([new Date(), "Startup"]);

	// Are we on a mobile device?
	isMobile = window.mobileCheck();

	$('body').toggleClass("touch", isMobile)

	//	Get URL parameters
	detectNavigation();

	// For Development:
	// get file prefix
	filePrefix = window.location.hostname == 'localhost' || window.location.hostname == 'leberrigan.github.io' ? 'data/' : window.location.hostname.includes('motus.org') ? "https://" + window.location.hostname + "/wp-content/uploads/2021/09/" : "https://" + window.location.hostname + "/wp-content/uploads/";

	// Change the document title based on the view and data type
	document.title = "Motus Report - " + (exploreType == 'main' ? ( "Explore " + firstToUpper(dataType) ) : ( firstToUpper(exploreType) + " summary" ) );

	// Capture any changes in URL
	window.onhashchange = detectNavigation;
	// For Development:
	// Fix Wordpress URL
	if (exploreType == 'main' && window.location.hostname != 'localhost' && window.location.hostname != 'leberrigan.github.io') {window.location.href="#e=main&d="+dataType;}

	// Set the default start and end dates
	default_startDate = dtLims.min;
	default_endDate = dtLims.max;


//	getMotusData( ["stations"] );
	getMotusData(  );

});

function loadDashboardContent() {


	addReportControls();

	motusData.stationDepsByRegions = d3.group(motusData.stationDeps, d => d.country);
	motusData.stationDepsByProjects = d3.group(motusData.stationDeps, d => d.projID);
	motusData.animalsByRegions = d3.group(motusData.animals, d => d.country, d => d.id);
	motusData.animalsByProjects = d3.group(motusData.animals, d => d.projID, d => d.id);
	motusData.regionByCode = d3.group(motusData.regions,  d => d.ADM0_A3);

	motusTable.el = "exploreTable";


	testTimer.push([new Date(), "Get selections"]);
	if (motusFilter.selections.length > 0) {
		toggleLoadingOverlay(true);
		getSelections().then(()=>{updateSelectionStatus();displayReportPreview();loadReportStep(4)});
	} else {
		console.log("TEST")
		loadReportStep(1)
	}

/*
	populateExploreControls();

	initiateTooltip();

	initiatePopup();

	initiateLightbox();


	populateSelectOptions();

	exploreMap({containerID: 'explore_map'});

	motusMap.regionColours = d3.scaleOrdinal().domain(["166.380 MHz", "151.50 MHz", "150.10 MHz", "none"]).range(["#66c2a5","#fc8d62","#8da0cb","#999999"]);

	if (exploreType != 'main') {

		addExploreProfilesWrapper();

		testTimer.push([new Date(), "Get selections"]);

		// References indexeddb
		getSelections().then( () => {
			// Set the default timeline date limits
			timeRange.min = dtLims.min;
			timeRange.max = dtLims.max;
			// Load map objects (will be replaced?)
			loadMapObjects();
			// Add the tab menu item for the map
			addExploreTab('explore-card-map', 'Map', {selected: true, icon: icons.map});
			// Add the explore profiles
			exploreSummary();

		} );

	} else {
		loadMapObjects();
	}

	if (["stations","animals","regions", "species", "projects"].includes(dataType)) {
//		setTimeout(function(){},1)
	} else {
		exploreTable({containerID: 'explore_table', name: dataType, data: motusData[dataType]});
	}
*/

}


function updateSelectionStatus() {

	if (!testTimer.some( x=>x[1] == "Done")) {
		testTimer.push([new Date(), "Done"]);

		testTimer.forEach( (x,i) => {
			var text = i == 0 ? "Begin" : testTimer[i-1][1];
			x[2] = i == 0 ? 0 : x[0] - testTimer[i-1][0];
			console.log(`${text}: ${x[2]}`);
			if (i == testTimer.length - 1) {
				console.log(`Total: ${d3.sum(testTimer, t => t[2])}`);
			}
		});
	}

	if (motusMap.highlightSelections) motusMap.highlightSelections();
	if (motusFilter.selections.length > 0) {

		$(".explore-report-selectionStatus .status-value").each(function(){

			var dataVar = this.parentElement.attributes["--data-var"].value;

			if (dataVar == dataType) {
				$(this).parent().toggleClass("selected",true);
			} else {$(this).parent().removeClass("selected");}

			if (['selectedDtStart', 'selectedDtEnd'].includes(dataVar)) {
				$(this).text( motusFilter[dataVar] ? motusFilter[dataVar].toISOString().substr(0,10) : "" );
			} else {
				$(this).text( motusData[dataVar] ? motusData[dataVar].length : "" );
			}
		});

		$(".explore-report-selectionStatus.no-data").removeClass("no-data");

	} else {

			$(".explore-report-selectionStatus:not(.no-data)").addClass("no-data");
	}

	toggleLoadingOverlay(false);

}

function exploreMapTableToggleView(showMap) {
	$(".explore-report-control-wrapper .report-control-buttons small span").text(showMap?"map":"table");
	console.log("LOADED: %s", showMap?"map":"table")
	if (showMap) {
		$(`#${motusTable.el}, #exploreTable`).toggleClass("hidden", true);

			if (typeof motusMap.svg !== 'undefined' && $(`#${motusMap.el} svg`).length > 0 ) {
				console.log('show map');
			  $(`#${motusMap.el}`).toggleClass("hidden", false).show();

			} else {
				console.log('create map');
				exploreMap({containerID: 'exploreMap'});

			}
		loadMapObjects();
		$(".explore-report-control-wrapper .report-control-buttons .toggle_view").text("View a table instead");
	} else {	// Show Table!
		$(`#${motusMap.el}, #exploreMap`).toggleClass("hidden", true);
		exploreTable("exploreTable");
		$(".explore-report-control-wrapper .report-control-buttons .toggle_view").text("View a map instead");
	}
}


function addReportControls() {

	////////////////////////////////////
	// dataType
	$(".explore-report-control-wrapper .report-control-datatype").html("<select></select>");

	$(".explore-report-control-wrapper .report-control-datatype select").select2({
		data: dataTypes.map( x => ({id: x.toLowerCase(), text:x }) ),
		matcher: select2Matcher,
		templateResult: select2TemplateResult,
		width: "100%",
		placeholder: select2Placeholder,
		templateSelection: (state) => {return "Find detections by: "+state.text;}
	}).change(function(){
		if( dataType != this.value ) {
			$(".report-status-text").text("");
			toggleLoadingOverlay(true);
			dataType = this.value;
			setTimeout(()=>{
				updateURL();
				addReportControls();
				timeRange.min = dtLims.min;
				timeRange.max = dtLims.max;
				if (["stations", "regions"].includes(dataType)) {
					exploreMapTableToggleView(true);
					loadMapObjects();
				} else if (["animals", "species", "projects"].includes(dataType)) {
					exploreMapTableToggleView(false);
				}
			}, 250);
		} else {
			if (["stations", "regions"].includes(dataType) && !motusMap.svg) {
				exploreMapTableToggleView(true);
			} else if (["animals", "species", "projects"].includes(dataType) && !motusTable.dt ) {
				exploreMapTableToggleView(false);
			}
		}
	}).val(dataType);

	////////////////////////////////////
	// selections

	$(".explore-report-control-wrapper .report-control-selections").html(`<select multiple data-placeholder='Select ${dataType}'></select>`);


	if (dataType == 'animals') {
		motusData.animals.forEach( x=> {
		    let species = motusData.species.filter( sp => sp.id == x.species);
		    x.name = typeof species === 'object' && species.length > 0 ? species[0][currLang] : "Unknown species";
		} );
		var selectionsData = motusData.animals.map( x => ({id: x.id, text: `${x.name} #${x.id}` }) );
	} else {
		var textVar = dataType == 'species' ? currLang : dataType == 'regions' ? "country" : "name";
		var selectionsData = motusData[dataType].map( x => ({id: x.id, text:x[textVar] }) );
	}

	$(".explore-report-control-wrapper .report-control-selections select").select2({
		data: selectionsData,
		templateResult: select2TemplateResult,
		width: "100%",
		placeholder: select2Placeholder,
		minimumInputLength: selectionsData.length > 10e3 ? 3 : 0
	}).change(function(e){

		motusFilter.selections = $(e.target).val();

		$(".report-status-text").text("");

		toggleLoadingOverlay(true);

		getSelections().then(updateSelectionStatus);

		updateData();

	});

	////////////////////////////////////
	// Section header

	$(".section-header").click(function(){
		if (!$(this).hasClass("selected")) {
			loadReportStep( parseInt(this.classList[this.classList.length - 1].replace("report-step","")) );
		}
	})

	////////////////////////////////////
	// Control buttons


	$(".explore-report-control-wrapper .report-control-buttons").html(
		"<div class='report-step report-step1'>"+
			" <button class='reset_btn' style='margin-left:10px;'>Deselect all</button>"+
			" <button class='next_btn dark_btn'>Step 2: Refine selections &gt;&gt;</button>"+
			"<small class='report-status-text' style='margin-left:20px;'></small>"+
		"</div>"+
		"<div class='report-step report-step1'>"+
			"<button class='toggle_view'>View a table instead</button>"+
			"<small style='color:#777;margin-left:20px;'><i>You may also make selections using the <span>map</span> below</i></small>"+
		"</div>"+
		"<div class='report-step report-step2'>"+
			" <button class='reset_btn' style='margin-left:10px;'>Reset filters</button>"+
			" <button class='prev_btn'>&lt;&lt; Back</button>"+
			" <button class='next_btn dark_btn'>Step 3: Format report &gt;&gt;</button>"+
			"<small class='report-status-text' style='margin-left:20px;'></small>"+
		"</div>"+
		"<div class='report-step report-step3'>"+
			" <button class='annual_reports toggleButton'>Report years separately</button>"+
			" <button class='quarterly_reports toggleButton' disabled='disabled'>Split years into quarters</button>"+
			" <button class='latest_period_only toggleButton' disabled='disabled'>Only report the latest period</button>"+
		"</div>"+
		"<div class='report-step report-step3'>"+
			" <button class='prev_btn'>&lt;&lt; Back</button>"+
			" <button class='next_btn dark_btn'>Step 4: Create report &gt;&gt;</button>"+
			"<small class='report-status-text' style='margin-left:20px;'></small>"+
		"</div>"+
		"<div class='report-step report-step4'>"+
			" <button class='prev_btn'>&lt;&lt; Back</button>"+
			" <button class='restart_btn dark_btn'>Restart to select new data</button>"+
			"<small class='report-status-text' style='margin-left:20px;'></small>"+
		//	" <button class='submit_btn'></button>"+
		"</div>"
	);

	$(".explore-report-control-wrapper .report-control-buttons .toggle_view").click(function(){
		exploreMapTableToggleView($(`#${motusTable.el}`).is(":visible") );
	});

	$(".explore-report-control-wrapper .report-control-buttons .toggleButton").click(function(){
		$(this).toggleClass("selected");

		// Defer these actions until user clicks 'create report' button
		if ( $(this).hasClass("annual_reports") ) {
			// Make an annual report
			if ( !$(this).is(".selected") ) {
				$(this).siblings(".quarterly_reports,.latest_period_only").attr('disabled', true).removeClass('selected');
			} else {
				$(this)
					.siblings(".quarterly_reports")
						.attr('disabled', false)
						.toggleClass('selected',  $(this).siblings(".quarterly_reports").data("selected") === true );
				$(this)
					.siblings(".latest_period_only")
						.attr('disabled', false)
						.toggleClass('selected',  $(this).siblings(".latest_period_only").data("selected") === true );
			}
		} else if ( $(this).hasClass("quarterly_reports") || $(this).hasClass("latest_period_only") ) {
			// Make an quarterly report
			 $(this).data("selected", $(this).is(".selected"));
		}
	});


	$(".explore-report-control-wrapper .report-control-buttons .report-step .next_btn").click(nextReportStep);
	$(".explore-report-control-wrapper .report-control-buttons .report-step .prev_btn").click(prevReportStep);

	$(".explore-report-control-wrapper .report-control-buttons .report-step1 .next_btn").click(function(){

		// See if there's enough data to make a reports
		var err = false;
		var warn = false;
		var msg = false;
		if (!motusFilter.selections) {

			err = "You must make a selection first";

		} else if (motusData.selectedStations.length == 0) {

			err = "There are no stations or detections associated with your selection";

		} else if (motusData.selectedAnimals.length == 0) {

			err = "There are no animals or detections associated with your selection";

		} else if (motusData.selectedTracks.length == 0) {

			warn = "There are no detections associated with your selection. Are you sure you want to make a report?";

		}

		if (warn) {
			console.warn("Warning: %s", warn);
			$(".report-status-text").text(warn).css("color", "#FA0");
		}
		if (err) {
			console.error("Error: %s", err);
			$(".report-status-text").text(err).css("color", "#A00");
			prevReportStep();
		}

	});
	$(".explore-report-control-wrapper .report-control-buttons .report-step4 .restart_btn").click(function(){loadReportStep(1);});
	$(".explore-report-control-wrapper .report-control-buttons .report-step3 .next_btn").click(function(){
		if (!displayReportPreview()) {
			prevReportStep();
		}
	});

	$(".explore-report-control-wrapper .report-control-buttons .report-step1 button.reset_btn").click(function(){
		if (motusFilter.selections.length > 0) {
			resetMotusFilter();
		}
	});
	$(".explore-report-control-wrapper .report-control-buttons .report-step2 button.reset_btn").click(function(){
		resetMotusFilter("not selected");
	});



	////////////////////////////////////
	// Selection status

		$(".explore-report-selectionStatus").html( getSelectionStatusDOM() );

		$(".explore-report-selectionStatus .status-selection").click( selectionStatusPopup );

	// Timeline

	$(".explore-report-control-wrapper .report-control-timeline").html("<div id='dateSlider'>"+
																																					"<div class='slider visible'><div id='custom-handle-1' class='ui-slider-handle'></div><div id='custom-handle-2' class='ui-slider-handle'></div></div>"+
																																				"</div>");


	exploreTimeline({ min: dtLims.min.valueOf() / 1000,
										max: dtLims.max.valueOf() / 1000,
										defaultValues: [ motusFilter.dtStart.valueOf() / 1000, motusFilter.dtEnd.valueOf() / 1000 ],
									 	height: 150
									});


	timeRange.min = dtLims.min;
	timeRange.max = dtLims.max;

	$(timeline.el).dragslider("option", { "min": timeline.min, "max": timeline.max});





	// Select the datatype
	$(".explore-report-control-wrapper .report-control-datatype select").trigger("change")

	// Make the selections if there are any
	if (motusFilter.selections) {
		$(".explore-report-control-wrapper .report-control-selections select").val(motusFilter.selections).trigger("change");
			timeline.createLegend();
	}


}


function nextReportStep() {
	// Deselect previous step header when going forwards
//	$(`.report-step${reportStep}`).toggleClass("selected", false);
	$(`.report-step:not(.section-header)`).css("display", "none");
	$(`.section-header.report-step`).toggleClass("selected", false);
	reportStep++;
	$(`.report-step${reportStep}`).css("display", "");
	$(`.section-header.report-step${reportStep}`).toggleClass("selected", true);
}

function prevReportStep() {
	// Hide the next step header when going backwards
	$(`.report-step${reportStep}`).css("display", "none");
	$(`.report-step:not(.section-header)`).css("display", "none");
	$(`.section-header.report-step`).toggleClass("selected", false);
	reportStep--;
	$(`.section-header.report-step${reportStep}`).toggleClass("selected", true);
	$(`.report-step${reportStep}`).css("display", "");
}

function loadReportStep( step ) {
	// Hide subsequent step headers when going backwards
	if (step < reportStep) {
		reportStep = step + 1;
		while($(`.report-step${reportStep}`).length > 0) {
			$(`.report-step${reportStep}`).css("display", "none");
			reportStep++;
		}
	}
	// Hide all steps
	$(`.report-step:not(.section-header)`).css("display", "none");
	$(`.section-header.report-step`).toggleClass("selected", false);
	reportStep = step;
	$(`.section-header.report-step${reportStep}`).toggleClass("selected", true);
	$(`.report-step${step}`).css("display", "");
}

function resetMotusFilter( options ) {

	Object.keys(motusFilter).forEach( x => {
		if (['dtStart','dtEnd'].includes(x)) {motusFilter[x] = new Date(timeline.position[['dtStart','dtEnd'].indexOf(x)] * 1000);}
		else if (
			(
				x.includes('select') ||
				['localAnimals', 'visitingAnimals', 'animalsDetected'].includes(x)
			) &&
			options != 'not selected'
		) {
			motusFilter[x] = [];
		} else if (
			!(
				x.includes('select') ||
				['localAnimals', 'visitingAnimals', 'animalsDetected'].includes(x)
			) &&
			x != 'colour'
		) {
			motusFilter[x] = ['all']
		}
	});

	$(".explore-report-control.report-control-selections select").val(motusFilter.selections).trigger("change")

	updateData();

}


function selectionStatusPopup( e ) {

	var dataVar = this.attributes["--data-var"].value;

	var popupText = "";
	var popupData = [];
	if (!['selectedDtStart', 'selectedDtEnd'].includes(dataVar) && motusData[dataVar].length == 0)
		return false;

	filterPopup("Loading...", e)

	setTimeout( function(e, dataVar) {

			if (['selectedDtStart', 'selectedDtEnd'].includes(dataVar)) {
				popupText = motusFilter[dataVar] ? motusFilter[dataVar].toISOString().substr(0,10) : "";
			} else {
				popupData = motusData[dataVar] ? getSelectionQuickList( dataVar ) : [{}];
				popupText = "<div class='report-refine'>"+
											"<table>"+
												"<thead><tr>" +
													"<th>Select</th>"+
													"<th>" + Object.keys(  popupData[0] ).map( x => camelToRegularText( x ).replace("I D", "ID") ).join("</th><th>") + "</th>"+
												"</tr></thead>"+
												"<tbody><tr class='selected'>" +
													"<td></td>"+
													popupData.map( d => "<td>" + Object.values( d ).join("</td><td>") + "</td>").join("</tr><tr class='selected'><td class='select-checkbox'></td>") +
												"</tr></tbody>"+
											"</table>"+
										"</div>";
			}

			filterPopup(popupText, e);

			$("#filterPopup table").DataTable({
				columnDefs: [ {
					orderable: false,
					className: 'select-checkbox',
					targets:   0
				} ],
				paging:false,
				select: {
					style: "multi"
				},
				dom: "fiB<'scroll-box't>",
		    "language": {
		      "info": "Showing _TOTAL_ entries",
					"infoEmpty": "Showing 0 entries",
					"infoFiltered": "",
		    },
				buttons: [
					'selectAll',
					'selectNone',
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
				scrollCollapse: true,
		    order: [[ 1, 'asc' ]]
			}).rows({ page: 'all'}).select();

			setTimeout( function() {
				$("#filterPopup table").DataTable()
				 .rows().invalidate('data')
				 .draw(false);
			}, 100)
		/*
			$("#filterPopup tbody tr").click( function(e) {
				e.stopPropagation();
				$(this).find("input[type=checkbox]").prop("checked", !$(this).find("input[type=checkbox]").prop("checked") );

				$(this).toggleClass("selected", $(this).find("input[type=checkbox]").prop("checked") )
			});
		*/
			// This fixes the popup position after the DataTable has rendered in case it goes off the right side of the screen
			filterPopup(false, e)
	}, 10, e, dataVar)


}

function getSelectionQuickList( dataVar, data ) {

	data = typeof data === "undefined" ? motusData[dataVar] : data;
	var toReturn = [];


	if (dataVar.toLowerCase().includes("stations")) {
		toReturn = data.map( d => ({id: d.id, name: d.name, firstDeployed: d.dtStart.toISOString().substr(0,10), project: d.projID, currentStatus: d.status}) );
	} else if (dataVar.toLowerCase().includes("animals")) {
		toReturn = data.filter( d => d.dtStart && !isNaN(d.dtStart.valueOf()) ).map( d => ({deploymentID: d.id, tagID: d.tagID, name: d.name, firstDeployed: d.dtStart.toISOString().substr(0,10), project: d.projID, frequency: d.frequency}) );
	} else if (dataVar.toLowerCase().includes("species")) {
		toReturn = data.map( d => ({name: d[currLang], latin: d.scientific, group: d.group}) )
	} else if (dataVar.toLowerCase().includes("projects")) {
		toReturn = data.toLowerCase().map( d => ({ID: d.id, name: d.name, created: d.dtCreated, group: d.fee_id}) );
	}

	return toReturn;

}


function getSelectionStatusDOM() {

	if (dataType == "stations") {
		return "<div class='status-section'>"+
							`<div class="status-selection" --data-var="selectedStations">${icons.station}<div class='status-value'></div> stations</div>`+
							`<span class="inter-text">from</span>`+
							`<div class="status-selection" --data-var="selectedStationProjects">${icons.projects}<div class='status-value'></div> projects</div>`+
						"</div>"+
							`<span class="inter-text">have detected</span>`+
						"<div class='status-section'>"+
							`<div class="status-selection" --data-var="selectedAnimals">${icons.animals}<div class='status-value'></div> animals</div>`+
							`<span class="inter-text">of</span>`+
							`<div class="status-selection" --data-var="selectedSpecies">${icons.species}<div class='status-value'></div> species</div>`+
							`<span class="inter-text">from</span>`+
							`<div class="status-selection" --data-var="selectedAnimalProjects">${icons.projects}<div class='status-value'></div> projects</div>`+
						"</div>"+
						`<span class="inter-text">between</span>`+
						"<div class='status-section'>"+
							`<div class="status-selection" --data-var="selectedDtStart"><div class='status-value'></div></div>`+
							`<span class="inter-text">and</span>`+
							`<div class="status-selection" --data-var="selectedDtEnd"><div class='status-value'></div></div>`+
						"</div>";
	} else if (dataType == "animals") {
			return "<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedAnimals">${icons.animals}<div class='status-value'></div> animals</div>`+
								`<span class="inter-text">of</span>`+
								`<div class="status-selection" --data-var="selectedSpecies">${icons.species}<div class='status-value'></div> species</div>`+
								`<span class="inter-text">from</span>`+
								`<div class="status-selection" --data-var="selectedAnimalProjects">${icons.projects}<div class='status-value'></div> projects</div>`+
							"</div>"+
							`<span class="inter-text">have been detected by</span>`+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedStations">${icons.station}<div class='status-value'></div> stations</div>`+
								`<span class="inter-text">from</span>`+
								`<div class="status-selection" --data-var="selectedStationProjects">${icons.projects}<div class='status-value'></div> projects</div>`+
							"</div>"+
							`<span class="inter-text">between</span>`+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedDtStart"><div class='status-value'></div></div>`+
								`<span class="inter-text">and</span>`+
								`<div class="status-selection" --data-var="selectedDtEnd"><div class='status-value'></div></div>`+
							"</div>";
	} else if (dataType == "species") {
			return "<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedAnimals">${icons.animals}<div class='status-value'></div> animals</div>`+
								`<span class="inter-text">of</span>`+
								`<div class="status-selection" --data-var="selectedSpecies">${icons.species}<div class='status-value'></div> species</div>`+
								`<span class="inter-text">from</span>`+
								`<div class="status-selection" --data-var="selectedAnimalProjects">${icons.projects}<div class='status-value'></div> projects</div>`+
							"</div>"+
							`<span class="inter-text">have been detected by</span>`+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedStations">${icons.station}<div class='status-value'></div> stations</div>`+
								`<span class="inter-text">from</span>`+
								`<div class="status-selection" --data-var="selectedStationProjects">${icons.projects}<div class='status-value'></div> projects</div>`+
							"</div>"+
							`<span class="inter-text">between</span>`+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedDtStart"><div class='status-value'></div></div>`+
								`<span class="inter-text">and</span>`+
								`<div class="status-selection" --data-var="selectedDtEnd"><div class='status-value'></div></div>`+
							"</div>";
	} else if (dataType == "projects") {
			return "<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedProjects">${icons.projects}<div class='status-value'></div> projects</div>`+
								`<span class="inter-text"> including </span>`+
								`<div class="status-selection" --data-var="selectedStationProjects"><div class='status-value'></div> projects</div>`+
								`<span class="inter-text">with stations</span>`+
								`<div class="status-selection" --data-var="selectedAnimalProjects"><div class='status-value'></div> projects</div>`+
								`<span class="inter-text">with tagged animals</span>`+
							"</div>"+
							`<span class="inter-text">have detections between</span>`+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedDtStart"><div class='status-value'></div></div>`+
								`<span class="inter-text">and</span>`+
								`<div class="status-selection" --data-var="selectedDtEnd"><div class='status-value'></div></div>`+
							"</div>"+
							"<div class='flex-break'></div>"+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedLocalStations">${icons.station}<div class='status-value'></div> stations</div>`+
							"</div>"+
								`<span class="inter-text">in these projects have detected</span>`+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="visitingAnimals">${icons.animals}<div class='status-value'></div> animals</div>`+
								`<span class="inter-text">of</span>`+
								`<div class="status-selection" --data-var="visitingSpecies">${icons.species}<div class='status-value'></div> species</div>`+
							"</div>"+
							"<div class='flex-break'></div>"+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="localAnimals">${icons.animals}<div class='status-value'></div> animals</div>`+
								`<span class="inter-text">of</span>`+
								`<div class="status-selection" --data-var="localSpecies">${icons.species}<div class='status-value'></div> species</div>`+
							"</div>"+
							`<span class="inter-text">in these projects have been detected by</span>`+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedVisitingStations">${icons.station}<div class='status-value'></div> stations</div>`+
							"</div>";
	} else if (dataType == "regions") {
			return "<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedRegions">${icons.projects}<div class='status-value'></div> regions</div>`+
								`<span class="inter-text"> including </span>`+
								`<div class="status-selection" --data-var="selectedStationRegions"><div class='status-value'></div> regions</div>`+
								`<span class="inter-text">with stations</span>`+
								`<div class="status-selection" --data-var="selectedAnimalRegions"><div class='status-value'></div> regions</div>`+
								`<span class="inter-text">with tagged animals</span>`+
							"</div>"+
							`<span class="inter-text">have detections between</span>`+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedDtStart"><div class='status-value'></div></div>`+
								`<span class="inter-text">and</span>`+
								`<div class="status-selection" --data-var="selectedDtEnd"><div class='status-value'></div></div>`+
							"</div>"+
							"<div class='flex-break'></div>"+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedLocalStations">${icons.station}<div class='status-value'></div> stations</div>`+
							"</div>"+
								`<span class="inter-text">in these regions have detected</span>`+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="visitingAnimals">${icons.animals}<div class='status-value'></div> animals</div>`+
								`<span class="inter-text">of</span>`+
								`<div class="status-selection" --data-var="visitingSpecies">${icons.species}<div class='status-value'></div> species</div>`+
							"</div>"+
							"<div class='flex-break'></div>"+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="localAnimals">${icons.animals}<div class='status-value'></div> animals</div>`+
								`<span class="inter-text">of</span>`+
								`<div class="status-selection" --data-var="localSpecies">${icons.species}<div class='status-value'></div> species</div>`+
							"</div>"+
							`<span class="inter-text">in these regions have been detected by</span>`+
							"<div class='status-section'>"+
								`<div class="status-selection" --data-var="selectedVisitingStations">${icons.station}<div class='status-value'></div> stations</div>`+
							"</div>";
		}

}

function displayReportPreview() {

	// See if there's enough data to make a reports
	var err = false;
	var warn = false;
	var msg = false;
	if (!motusFilter.selections) {

		err = "You must make a selection first";

	}/* else if (motusData.selectedStations.length == 0) {

		err = "There are no stations or detections associated with your selection";

	}*/ else if (motusData.selectedAnimals.length == 0) {

		err = "There are no animals or detections associated with your selection";

	} else if (motusData.selectedTracks.length == 0) {

		warn = "There are no detections associated with your selection. Are you sure you want to make a report?";

	}

	if (warn) {
		console.warn("Warning: %s", warn);
		$(".report-status-text").text(warn).css("color", "#FA0");
	}
	if (err) {
		console.error("Error: %s", err);
		$(".report-status-text").text(err).css("color", "#A00");
		return false;
	} else {
		msg = `Making a report for ${motusFilter.selections.length} ${motusFilter.selections.length > 1 ? dataType : toSingular(dataType)}...`;
		console.log(msg);
		$(".report-step4 .report-status-text").text(msg).css("color", "#0A0");
	}

	// Hide the map and table
	$(`#${motusMap.el}:visible, #${motusTable.el}:visible`).hide();


	// If we are to split up data by time, how are we to do it?
	var splitTime =  $(".report-control-buttons .quarterly_reports").is(".selected") ? "quarterly" :
									$(".report-control-buttons .annual_reports").is(".selected") ? "annual" : false;


	if ( $("#exploreReport .report-controls").length == 0) {
		$("#exploreReport").html(
			"<div class='report-controls'>"+
				"<div class='section-header'>Report preview</div>"+
				" <button class='toggleButton shrink_btn'>Shrink pages</button>"+
				" <button class='toggleButton select_btn selected'>Select all</button>"+
				" <button class='submit_btn print_btn'>Print or save as PDF</button>"+
				"<div class='zoom-controls'>"+
					" <button class='close_btn closeZoom_btn'>Close zoom</button>"+
				"</div>"+
		"</div>");
		$("#exploreReport .closeZoom_btn").click(function(){$("#exploreReport, #exploreReport .report-page-wrapper").removeClass("zoomed");});
		$("#exploreReport .print_btn").click(function(){window.print();});
		$("#exploreReport .select_btn").click(function(){
			$(this).toggleClass("selected").removeClass('partial');
			if ($(this).is(".selected")) {
				$("#exploreReport .report-page-wrapper").toggleClass("selected", true);
			} else {
				$("#exploreReport .report-page-wrapper").toggleClass("selected", false);
			}
		})
		$("#exploreReport .shrink_btn").click(function(){
			$("#exploreReport").toggleClass("small", !$(this).hasClass("selected"));
			$(this).toggleClass("selected");
		})
	} else {
		$("#exploreReport .report-page-wrapper").remove();
	}

	var report = {
		header: `Motus ${firstToUpper(toSingular(dataType))} Report`,
		motusLogo: `<img src="${logos.motus}" alt="Motus Wildlife Tracking System" style="float:left;">`,
		birdsLogo: `<img src="${logos.birdsCanada}" alt="Birds Canada" style="float:right;">`,
		publicationDate: new Date().toISOString().substr(0, 10),
		pageIndex: 1
	}


	// Select the date intervals to loop through
	var dates = [motusFilter.selectedDtStart, motusFilter.selectedDtEnd];
	dates = splitTime == 'annual' ? [dates[0], d3.timeYears(dates[0], dates[1]), dates[1]].flat() :
					splitTime == 'quarterly' ? [dates[0], d3.timeMonths(dates[0], dates[1], 3), dates[1]].flat() :
					dates;

	if (dates.length > 2) {

		report.datePos = 0;
		report.intervalName = monthDiff(dates[0], dates[1]) < 4 ? "Quarterly" : "Annual"; // How many months between the two dates?

		// This provides the necesssary time to display the pages as they are loaded.
		report.interval = setInterval(function(){

			// If there are more than one selections, start with a master summary
			if (motusFilter.selections.length > 1) {
				report = addReportSummaryPage(motusData[`selected${firstToUpper(dataType)}`], report, [dates[report.datePos], dates[report.datePos+1]]);
			}

			// Loop through each selection individually
			motusData[`selected${firstToUpper(dataType)}`].forEach((d) => {report = addReportSelectionPage(d, report, [dates[report.datePos], dates[report.datePos+1]]);});

			report.datePos++;

			if (report.pageIndex > 3) {
				$("#exploreReport:not(.small) .shrink_btn").trigger("click");
			}

			if (report.datePos == dates.length-1) {
				// End point
				clearInterval(report.interval);
				finishReport(report);
				// Clear status
				$(".report-step4 .report-status-text").text("Finished report");
			}
		} , 10)

	} else {

		dates = $(".report-control-buttons .latest_period_only").is(".selected") ? [dates[dates.length - 3], dates[dates.length - 2]] : dates;

		// If there are more than one selections, start with a master summary
		if (motusFilter.selections.length > 1) {
			report = addReportSummaryPage(motusData[`selected${firstToUpper(dataType)}`], report);
		}

		// Loop through each selection individually
		motusData[`selected${firstToUpper(dataType)}`].forEach((d) => {report = addReportSelectionPage(d, report);});

		finishReport(report);

		// Clear status
		$(".report-step4 .report-status-text").text("Finished report");
	}

	return true;
}

function finishReport(report) {

	if (report.pageIndex > 3) {
		$("#exploreReport:not(.small) .shrink_btn").trigger("click");
	}
	// Page selection function
	$("#exploreReport .report-page-wrapper .report-checkbox, #exploreReport .report-page-wrapper").click(function(e) {

					e.stopPropagation();
					console.log(e);
		if ($("#exploreReport").is(".small:not(.zoomed)") || $(this).is(".report-checkbox")) {
			( $(this).is(".report-checkbox") ? $(this).closest(".report-page-wrapper") : $(this) ).toggleClass("selected");
			if ($("#exploreReport .report-page-wrapper.selected").length == 0) {
				$("#exploreReport .select_btn").removeClass('selected').removeClass('partial');
			} else if ($("#exploreReport .report-page-wrapper.selected").length == $("#exploreReport .report-page-wrapper").length) {
				$("#exploreReport .select_btn").addClass('selected').removeClass('partial');
			} else {
				$("#exploreReport .select_btn").removeClass('selected').addClass('partial')
			}
		} else if ($("#exploreReport").is(".small.zoomed")) {
//			$(this).find('.report-zoom').trigger('click');
			$("#exploreReport .report-page-wrapper").removeClass('zoomed');
			$(this).toggleClass("zoomed");
		}

	});

	// Zoom function
	$("#exploreReport .report-page-wrapper .report-zoom").click(function(e) {

		e.stopPropagation();

		if ( !$(this).closest(".report-page-wrapper").is(".zoomed") )
			$("#exploreReport .report-page-wrapper").removeClass('zoomed');

		$(this).closest(".report-page-wrapper").toggleClass("zoomed");

		$("#exploreReport").toggleClass("zoomed", $("#exploreReport .report-page-wrapper.zoomed").length > 0);

	});
}

function getSeasonName(dt) {
	if (typeof dt !== 'object') {
		console.error("That was not a date!");
		return false;
	} else {
		return (dt.getMonth() <= 3 ? "Winter" :
						dt.getMonth() <= 6 ? "Spring" :
						dt.getMonth() <= 9 ? "Summer" :
																		"Fall")+
					 " " + dt.getFullYear() ;
	}
}

function addReportSummaryPage(d, report, interval) {

	if (interval) {
		report.season = report.intervalName == "Quarterly" ? getSeasonName( interval[0] ) : interval[0].getFullYear();
	}

	$("#exploreReport").append(
		`<div class='report-page-wrapper first-page selected'>
			<!--  Source: https://stackoverflow.com/questions/5445491/height-equal-to-dynamic-width-css-fluid-layout -->
			<div class='report-page-wrapper-dummy'></div>
			<div class="report-zoom">${icons.zoom}</div>
			<div class='report-page'>
				<div class="report-checkbox"></div>
				<div class="report-header">${report.header}</div>
				<div class="report-season">${interval?report.season:""}</div>
				<div class="report-pageIndex">${report.pageIndex}</div>
				<div class="report-title"><div class="report-subtitle"></div></div>
				<div class="report-stats"></div>
				<div class="report-timeline"><h2>Detection timeline</h2></div>
				<div class="report-table"><h2>${firstToUpper( toSingular( dataType ) )} summary</h2><table></table></div>
				<div class="report-footer">${report.motusLogo} Report created on: ${report.publicationDate} ${report.birdsLogo}</div>
			</div>

		</div>`
	);

	report = {
			...report,
			...{
				title: "Multi-"+toSingular(dataType)+" summary",
				subtitle: d.length + " " + dataType + " selected",
				stats: d.reduce( (a,c) => {

					c = getReportStats(c);

					if (a.length == 0)
						a = c;
					else {
						Object.keys(c).forEach( k => {
							if(a[k])
								a[k].push(c[k])
							else
								a[k] = [c[k]];
						});
					}

					return a;
				}, {}),
				timeline: detectionTimeline(Object.values(motusData.selectedTracks),{
						width: 800,
//							resize: $(`#exploreReportPage${report.page} .report-timeline`),
						timelineSVG: $("<svg style='width:100%;margin:-8px 0;cursor:pointer;' viewbox='0 0 800 75'></svg>"),
						dataSource: "animals",
						margin:{left:0,right:0},
						setTimeline: true
					})
		}
	};

	console.log(report.stats)

	$(`.report-page:eq(${report.pageIndex-1}) .report-title`).prepend(report.title);
	$(`.report-page:eq(${report.pageIndex-1}) .report-subtitle`).html(report.subtitle);
	$(`.report-page:eq(${report.pageIndex-1}) .report-stats`).html(Object.keys(report.stats).map( k => {

		let statVal = report.stats[k].map( x => x.val );

		statVal = k == 'dates' ? `${d3.min(statVal,  x => x[0])} - ${d3.max(statVal,  x => x[1])}` :
							typeof statVal[0] === 'object' ? [...new Set(statVal.flat())].length :
																								[...new Set(statVal)].join(", ");

		return `<div class="report-stat${report.stats[k][0].icon?"":" no-icon"}">
							<div class='report-stat-value'>${statVal}</div>
							${report.stats[k][0].icon?"<div class='report-stat-icon'>"+report.stats[k][0].icon+"</div>":""}
							<div class='report-stat-label'>${report.stats[k][0].name}</div>
						</div>`;
		}));
	$(`.report-page:eq(${report.pageIndex-1}) .report-timeline`).append(report.timeline);

	console.log(motusData[`selected${firstToUpper(dataType)}`]);
	console.log(`selected${firstToUpper(dataType)}`);

	reportTable(`.report-page:eq(${report.pageIndex-1}) .report-table table`, motusData[`selected${firstToUpper(dataType)}`]);

	report.pageIndex++;

	return report;
}

function addReportSelectionPage(d, report, interval) {

	if (interval) {
		report.season = report.intervalName == "Quarterly" ? getSeasonName( interval[0] ) : interval[0].getFullYear();
	}

	$("#exploreReport").append(
		`<div class='report-page-wrapper selected'>
			<div class='report-page-wrapper-dummy'></div>
			<div class="report-zoom">${icons.zoom}</div>
			<div class='report-page'>
				<div class="report-checkbox"></div>
				<div class="report-header"><small>${report.header}</small></div>
				<div class="report-season">${interval?report.season:""}</div>
				<div class="report-pageIndex">${report.pageIndex}</div>
				<div class="report-title"><div class="report-subtitle"></div></div>
				<div class="report-stats"></div>
				<div class="report-timeline"><h2>Detection timeline</h2></div>
				<div class="report-table report-table-species"><h2>Detected species</h2><table></table></div>
				<div class="report-footer">${report.motusLogo} Report created on: ${report.publicationDate} ${report.birdsLogo}</div>
			</div>
		</div>`
	);


	report = {
			...report,
			...{
				title: d.name,
				subtitle: ["stations","animals"].includes(dataType) ? `Lat: ${d.geometry.coordinates[1]}, lon: ${d.geometry.coordinates[0]}` :
										dataType == "projects" ? (d.fee_id == projectGroupNames[1] ? "" : d.fee_id) :
										dataType == "species" ? d.scientific :
										/*dataType == "regions" ?*/ "",
				stats: getReportStats(d),
				timeline: detectionTimeline( getSelectionTracks(d),{
						width: 800,
//							resize: $(`#exploreReportPage${report.page} .report-timeline`),
						timelineSVG: $("<svg style='width:100%;margin:-8px 0;cursor:pointer;' viewbox='0 0 800 75'></svg>"),
						dataSource: "animals",
						margin:{left:0,right:0},
						setTimeline: true
					}),
				table: {
					species: getReportSpeciesTableData(d)
				}
		}
	};

	$(`.report-page:eq(${report.pageIndex-1}) .report-title`).prepend(report.title);
	$(`.report-page:eq(${report.pageIndex-1}) .report-subtitle`).html(report.subtitle);
	$(`.report-page:eq(${report.pageIndex-1}) .report-stats`).html(Object.keys(report.stats).map( k => {
		return `<div class="report-stat${report.stats[k].icon?"":" no-icon"}">
							<div class='report-stat-value'>${k == 'dates' ? report.stats[k].val.join(" - ") : typeof report.stats[k].val === 'object' ? report.stats[k].val.length : report.stats[k].val}</div>
							${report.stats[k].icon?"<div class='report-stat-icon'>"+report.stats[k].icon+"</div>":""}
							<div class='report-stat-label'>${report.stats[k].name}</div>
						</div>`;
		}));
	$(`.report-page:eq(${report.pageIndex-1}) .report-timeline`).append(report.timeline);
	$(`.report-page:eq(${report.pageIndex-1}) .report-table-species table`).DataTable({
		...default_tableOpts,
		...{
			data: report.table.species
		}
	});

	report.pageIndex++;

	return report;

}

function getSelectionTracks( data ) {
	if (dataType == 'stations') {
		return motusData.selectedTracks.filter( x => data.id == x.recv1 || data.id == x.recv2);
	} else if (dataType == 'animals') {
		return motusData.selectedTracks.filter( x => motusData.tracksByAnimal[ data.id ].includes( x.route ) );
	} else if (dataType == 'species') {
		var selectedRoutes = data.animals.map( x => motusData.tracksByAnimal[x] ).flat();
		return motusData.selectedTracks.filter( x => selectedRoutes.includes( x.route ) );
	} else if (dataType == 'projects') {
		return motusData.selectedTracks.filter( x => x.project.includes( data.id ) || x.recvProjs.includes( data.id ) );
	} else if (dataType == 'regions') {
		let regionStations = motusData.selectedStations.filter( x => x[regionVar] == data.id ).map( x => x.id );
		let regionAnimals = motusData.selectedAnimals.filter( x => x[regionVar] == data.id ).map( x => x.id );
		return motusData.selectedTracks.filter( x => regionStations.includes(x.recv1) || regionStations.includes(x.recv2) || regionAnimals.some( j => x.animal.includes( j ) ) );
	}
}
function getReportStats( data ) {

	var toReturn = {};

	if (dataType == 'stations') {
		["animals", "species", "projects", "dates","frequency"].forEach( d => {

			let val = "";
			let name = firstToUpper(d);
			let icon = icons[d];

			if (d == 'dates') {
				val = [ data.dtStart.toISOString().substr(0,10) , data.dtEnd.toISOString().substr(0,10) ];
				name = "Deployment dates";
			} else if (d == 'projects') {
				val = data.animals.reduce( (a,c) => {
					let animal = motusData.animals.filter( x => x.id == c );
					if (animal.length > 0)
						a.push(animal[0].projID);
					return a;
				}, []);
				val = [...new Set(val)];
				name = "Projects with tags detected";
			} else {
				val = data[d];
				val = d == 'frequency' ? val + " MHz" : val;
				name = d == 'frequency' ? (`${firstToUpper(toSingular(dataType))} ${d}`) : (`${name} detected`)
			}

			toReturn[d] = {name: name, val: val, icon: icon};

		});
	} else if (dataType == 'animals') {
		if (!data.stations) {data.stations = [];}
		["stations", "projects", "dates", "frequency"].forEach( d => {

			let val = "";
			let name = firstToUpper(d);
			let icon = icons[d];

			if (d == 'dates') {
				val = [ data.dtStart.toISOString().substr(0,10) , data.dtEnd.toISOString().substr(0,10) ];
				name = "Deployment dates";
			} else if (d == 'projects') {
				val = data.stations.reduce( (a,c) => {
					let station = motusData.stations.filter( x => x.id == c );
					if (station.length > 0)
						a.push(station[0].projID);
					return a;
				}, []);
				val = [...new Set(val)];
				name = "Projects with tags detected";
			} else {
				val = data[d];
				val = d == 'frequency' ? val + " MHz" : val;
				name = d == 'frequency' ? (`${firstToUpper(toSingular(dataType))} ${d}`) : (`${name} detected`)
			}

			toReturn[d] = {name: name, val: val, icon: icon};

		});
	} else if (dataType == 'species') {
		if (!data.stations) {data.stations = [];}
		["stations", "projects", "dates", "frequency"].forEach( d => {

			let val = "";
			let name = firstToUpper(d);
			let icon = icons[d];

			if (d == 'dates') {
				val = [ motusFilter.dtStart.toISOString().substr(0,10) , motusFilter.dtEnd.toISOString().substr(0,10) ];
			//	val = [ data.dtStart.toISOString().substr(0,10) , data.dtEnd.toISOString().substr(0,10) ];
				name = "Deployment dates";
			} else if (d == 'projects') {
				val = data.stations.reduce( (a,c) => {
					let station = motusData.stations.filter( x => x.id == c );
					if (station.length > 0)
						a.push(station[0].projID);
					return a;
				}, []);
				val = [...new Set(val)];
				name = "Projects with tags detected";
			} else {
				val = data[d];
				val = d == 'frequency' ? val + " MHz" : val;
				name = d == 'frequency' ? (`${firstToUpper(toSingular(dataType))} ${d}`) : (`${name} detected`)
			}

			toReturn[d] = {name: name, val: val, icon: icon};

		});
	}

	return toReturn;

}

function toggleLoadingOverlay(show) {

	if (show) {
		$("#exploreMap,#exploreTable,#exploreSelectionStatus").addClass("blur");
		$("#loadingOverlay").css("top", ( $(".explore-report-control-wrapper").outerHeight() + $(".explore-report-control-wrapper").outerHeight() ) + "px" ).fadeIn(250);
	} else {
		$("#exploreMap,#exploreTable,#exploreSelectionStatus").removeClass("blur");
		$("#loadingOverlay").fadeOut(250);
	}
}
// Stuff to do once the map has finished loading
function afterMapLoads() {


}


function exploreControls(el, opt) {
	opt = typeof opt === 'undefined' ? $(el).closest('div').attr('class').replace('explore-control-content ','').split(' ')[0].split('-').pop() : opt;
	console.log(el);
	console.log(opt);
	if (opt == 'help') {

			exploreHelp();

	} else	if (opt == 'edit') {
	//	console.log(el.value);
		if (dataType == 'stations') {
			/*  Change point type
			motusMap.groupData = el.value.toLowerCase() == 'rectangles' ? 'rect' : (
				el.value.toLowerCase() == 'circles' ? 'circles' : false
			);
			motusMap.map.fire('moveend');
			*/

			if ($(el).val() == "Prospective stations" || ( typeof $(el).val() == 'object' && $(el).val().includes("Prospective stations") ) ) {
				viewProspectiveStations();
			} else {
				motusMap.g.selectAll('.explore-map-prospective-station').classed('hidden', true);
			}

			if ($(el).val() == "Antenna ranges" || ( typeof $(el).val() == 'object' && $(el).val().includes("Antenna ranges") ) ) {
				viewAntennaRanges();
			} else {
				motusMap.g.selectAll('.explore-map-antenna-range').classed('hidden', true);
			}

			if ($(el).val() == "Coordination regions" || ( typeof $(el).val() == 'object' && $(el).val().includes("Coordination regions") ) ) {
				viewRegionalCoordinationGroups();
			} else {
				motusMap.g.selectAll('.explore-map-regional-groups').classed('hidden', true);
			}

			if ($(el).val() == "Active stations" || ( typeof $(el).val() == 'object' && $(el).val().includes("Active stations") ) ) {
				motusMap.setVisibility();
			} else {
				motusMap.g.selectAll('.explore-map-station:not(.disable-filter)').classed('hidden', true);
			}
		}
	} else if (opt == 'animate') {

	} else if (opt == 'view') {
		if (exploreType == 'main' && dataType == 'animals') {

			drawMapObjects('tagDeps');

		}
	} else if (opt == 'options') {
		var isTable = $(el).val().indexOf('table')!=-1;
		exploreSummaryTabSelect('region'+(isTable?'Table':'s'));
	} else if (opt == 'pdf') {




		if ($(el).hasClass('refresh_btn') || $("iframe#pdf_output").length == 0) {

					if ($("iframe#pdf_output").length == 0) {
						$("body").append('<div class="pdf-output-wrapper"><div style="text-align:center;margin-top:10px;"><a class="hidden_link" target="_blank"></a><button class="download_btn">Download</button><button class="close_btn">Close</button><button class="refresh_btn">Refresh</button></div><iframe id="pdf_output"></iframe></div>').find('iframe').get(0);

						$(".pdf-output-wrapper .refresh_btn").click(function(e){exploreControls(this, 'pdf')});

						$(".pdf-output-wrapper,.pdf-output-wrapper .close_btn").click(function(e){
							if (e.target !== this) return;
							$(".pdf-output-wrapper").fadeOut(250);
							$("body").css("overflow-y", "");
						});
					} else if ($(el).hasClass('refresh_btn')) {

								$(".pdf-output-wrapper iframe").attr('src', '');
					}

							$(".pdf-output-wrapper").fadeIn(250);
							$("body").css("overflow-y", "hidden");
			var zoom = motusMap.map.getZoom();
			var tab = $(".explore-card-profiles-tabs > .selected");
			$(".explore-card-profiles-tabs .explore-card-tab:not(.explore-card-map-tab):not(.explore-card-profiles-download-pdf-tab)").click();
			$(".explore-card-profiles-tabs .explore-card-map-tab").click();
			motusMap.map.setZoom(2);
			setTimeout(function(){
				var vars = [];
				var vals = [];

				$("#explore_card_profiles .explore-card-profile-data").each(function(i){

					vals.push( $(this).children(".explore-card-data-value").text() );
					vars.push( $(this).children(".explore-card-data-label").text() );

				});

				var opts = {};

				if (exploreType == 'regions') {
					var region_svg = d3.create('svg');

					var path = d3.geoPath().projection(d3.geoMercator().fitSize([500,100],motusData.selectedRegions[0]));

					region_svg.append("svg:defs").append("svg:marker")
						.attr("id", "station_path")
						.attr("refX", 5)
						.attr("refY", 10)
						.attr("markerWidth", 60)
						.attr("markerHeight", 80)
						.attr("viewBox", "0 0 30 40")
						.attr("markerUnits","userSpaceOnUse")
						.attr("orient", "auto")
						.append("path")
						.attr("d", icon_paths.stations)
						.style('pointer-events', 'auto')
						.style("stroke", "#000");


					var g = region_svg.attr('width',500)
							.attr('height',100)
							.append('g');

					g.selectAll("regions")
							.data(motusData.selectedRegions)
							.enter().append("path")
							.attr("d", path)
							.attr('class', 'explore-map-regions leaflet-zoom-hide')
							.style('stroke', '#000')
						//	.style('fill', '#FFF')
							.style('fill', d => motusFilter.regions.includes(d.properties.adm0_a3) ? "#FFF" : "#CCC" )
							.style('stroke-width', '1px');


				  g.selectAll('stations')
							.data(motusData.stations.filter(d => motusData.selectedStations.includes(d.id)).sort((a, b) => d3.ascending(a.id, b.id)))
							//.data(motusData.stations)
							.enter().append("path")
							.attr('marker-end','url(#station_path)')
							.attr("d", path.pointRadius(6))
		//					.style('stroke', '#000')
							.style('fill', (d) => d.dtEnd > moment().subtract(1, 'days') ? '#0F0' : '#F00')
							.attr('class', 'explore-map-stations leaflet-zoom-hide')
							//.style('fill', d => regionStations.includes(d.id) ? "#F00" : "#000")
					//		.style('stroke-width', '1px')

					d3.geoPath().bounds({features:motusData.selectedRegions, type: "FeatureCollection"});

					opts = {
						type: exploreType,
						selection: firstToUpper($("#explore_card_profiles .explore-card-name").text()),
						summaryTable: {vars: vars, vals: vals},
						titleIcon: {svg: region_svg}
					};

				} else {
					opts = {
						type: exploreType,
						selection: firstToUpper($("#explore_card_profiles .explore-card-name").text()),
						summaryTable: {vars: vars, vals: vals}
					};
				}
				if ($("#explore_card_stationHits table.explore-card-stationHits-table").length > 0) {

					opts.stations = {
						// Remove the HTML from the first row!
						data: $("#explore_card_stationHits table.explore-card-stationHits-table").DataTable().rows().data().toArray()
											.map(x => Object.values(x)
												.filter((d,i) => [1,2,3,4,5,9].includes(i)) // Select which columns to use
												.map( (d, i) => i == 1 ? d.toISOString().substr(0,10) : (i == 2 ? `${(moment().diff(d, 'day') < 1 ? "Active" : "Ended on: " + d.toISOString().substr(0,10) )}` : d)
												)
											),
						cols: $("#explore_card_stationHits table.explore-card-stationHits-table th").map(function(){return $.trim($(this).text());}).get().filter((d,i) => i > 0),
						colWidths: [4,2,3,1,1,3]
					}
				}
				if ($("#explore_card_tagHits table.explore-card-tagHits-table").length > 0) {
					opts.animals = {
						// Remove the HTML from the first row!
						data: $("#explore_card_tagHits table.explore-card-tagHits-table").DataTable().rows().data().toArray().map(x => x.map((k,i) => i==0||i==2?$("<a>"+k+"</a>").text():k)),
						cols: $("#explore_card_tagHits table.explore-card-tagHits-table th").map(function(){return $.trim($(this).text());}).get(),
						colWidths: [4,2,3,1,1]
					}
				}
				if ($("#explore_card_speciesHits table.explore-card-speciesHits-speciesTable").length > 0) {
					opts.species = {
						// Remove the HTML from the first row!
						data: $("#explore_card_speciesHits table.explore-card-speciesHits-speciesTable").DataTable().rows().data().toArray()
											.map(x => Object.values(x)
												.filter((d,i) => [2,5,8].includes(i)) // Select which columns to use
									//			.map( (d, i) => i == 2 ? `${d.replace('<br/>',' ')}` : d )
											),
						cols: $("#explore_card_speciesHits table.explore-card-speciesHits-speciesTable th").map(function(){return $.trim($(this).text());}).get().filter((d,i) => i > 0),
						colWidths: [4,1,1]
					}
				}
				makePDF(opts);

				setTimeout(function(){
					motusMap.map.setZoom(zoom);
					tab.click();
				}, 250);
			}, 500);
		} else {
			$(".pdf-output-wrapper").fadeIn(250);
			$("body").css("overflow-y", "hidden");
		}
	}
}


function populateSelectOptions() {
	/*
	var filterNames = ['projects','stations', 'species', 'animals', 'regions', 'frequencies', 'models', 'status'];

	var filters_toInclude = exploreType == 'main' ? filterNames : (
							exploreType == 'stations' ? filterNames : (
							exploreType == 'species' ? filterNames : (
							exploreType == 'animals' ? filterNames : filterNames)));
	*/

	if (typeof motusData.projects !== 'undefined') {
		motusData.projects.forEach(function(d){

			filters.options.projects[d.id] = d.project_name;

		});
	}
	if (typeof motusData.stationDeps !== 'undefined') {

		filters.options.stations = Object.fromEntries( motusData.stationDeps.map( d => [ d.id, [ d.name, ( d.status != 'active' ? 'inactive' : 'active' ) ] ] ) );

		filters.options.frequencies = {};

		(Array.from(motusData.stationDeps.map(d => d.frequency).values())).filter(onlyUnique).filter(d => d.length > 0 && d!="NA" && d.split(',').length == 1).forEach(d => filters.options.frequencies[`${d}`] = d + " MHz");
	}
	if (typeof motusData.species !== 'undefined') {
		motusData.species.forEach(function(d){

			filters.options.species[d.id] = d.english;

		});
	}

	if (typeof motusData.tagDeps !== 'undefined') {
		filters.options.models = motusData.tagDeps.map(d => d.model).filter(onlyUnique).filter(d => d.length > 0);
		filters.options.frequencies = {};
		(Array.from(motusData.tagDeps.map(d => d.frequency).values())).filter(onlyUnique).filter(d => d.length > 0 && d!="NA" && d.split(',').length == 1).forEach(d => filters.options.frequencies[`${d}`] = d + " MHz");
	}
	if (typeof motusData.tracks !== 'undefined') {
	//	filters.options.models = motusData.tracks.map(d => d.model).filter(onlyUnique).filter(d => d.length > 0);
	//	filters.options.frequencies = {};
	//	(Array.from(motusData.tracks.map(d => d.frequency).values())).filter(onlyUnique).filter(d => d.length > 0 && d!="NA" && d.split(',').length == 1).forEach(d => filters.options.frequencies[`${d}`] = d + " MHz");
	}
	console.log(motusData);

	var toAppend = (["projects","stations","species","regions","frequencies","dates"].map(function(x){

						const classes = ['stations','species'].includes(x) ? ' class="dataType_' + x +'"': "";

						return "<div"+classes+">"+(x == 'dates' ? "<input " : "<select ")+" id='filter_"+x+"' class='filter_"+x+"'"+(x == 'dates' ? '>' : "' multiple='multiple' data-placeholder='All "+x+"'><option value='all'></option></select>") + "</div>";

					}).join(""));

	$(exploreType == 'main' ? "#explore_filters" : "#explore_filters").append(toAppend);

	$(exploreType == 'main' ? "#explore_filters" : "#explore_filters").append("<div class='filter-status'>Showing <span></span> of <span></span> " + ( dataType == 'animals' ? 'tracks' : dataType ) + "</div>");

	if (motusData.nTracks) {$("#explore_filters .filter-status").find('span:eq(1)').text(motusData.nTracks);}
	else if (dataType == 'stations') {$("#explore_filters .filter-status").find('span:eq(1)').text(motusData.stationDeps.length);}


	$("#explore_filters").append("<div class='filterButton clear-filters' alt='Clear filters'>Clear filters"+'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>'+"</div>");

	$(".clear-filters").click(function(){
		$("#explore_filters select").each(function(){
			if ($(this).select2("val") != 0 && (! $(this).hasClass(`filter_${dataType}`) || exploreType == 'main') ) {
				$(this).select2().val(null).trigger("change");
				console.log(this.classList)
			}
		});

		timeline.setSlider([dtLims.min.valueOf(), dtLims.max.valueOf()], true);
		//$("#filter_summary > div:not(.explore_dates)").removeClass('visible');

//		if (exploreType != 'main') var summaryFilter = motusFilter[dataType];
	//	motusFilter = {};
//		if (exploreType != 'main') motusFilter[dataType] = summaryFilter;

		$("#filter_summary").removeClass('visible');

		$("#explore_filters").parent(".active").removeClass('active');

		updateURL();

		motusMap.setVisibility();

	})
	/*
	$("#exploreContent").append("<div class='filter-options-wrapper'>"+
									"<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' class='bi bi-funnel tips' viewBox='0 0 16 16' alt='Filter data'>"+
										"<path fill-rule='evenodd' d='M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2h-11z'/>"+
									"</svg>"+
								"</div>");
	*/
	for(d in filters.options) {

		if (d == 'stations') {
			for (stationID in filters.options.stations) {

				$("#filter_stations").append('<option value="' + stationID + '" class="filter-option-' + filters.options.stations[stationID][1] + '">' + filters.options.stations[stationID][0] + '</option>');

			};
		} else {
			for (v in filters.options[d]) {

				$("#filter_" + d).append('<option value="' + v + '">' + filters.options[d][v] + '</option>');

			};
		}
	}

	$((exploreType == 'main' || true ? "#explore_filters" : "#exploreContent") + " select").select2({
		matcher: (params, data) => {
			// If there are no search terms, return all of the data
			if ($.trim(params.term) === '') {
				return data;
			}

			// Do not display the item if there is no 'text' property
			if (typeof data.text === 'undefined') {
				return null;
			}

			// `params.term` should be the term that is used for searching
			// `data.text` is the text that is displayed for the data object
			if (data.text.toUpperCase().indexOf(params.term.toUpperCase()) > -1) {
				return data;
			}


			if (data.id.indexOf(params.term) > -1) {
				return data;
			}

			// Return `null` if the term should not be displayed
			return null;
		},
		templateResult: (data, container) => {
			if (data.element) {
				$(container).addClass($(data.element).attr("class"));
			}
			return data.text;
		},
		placeholder: () => $(this).data('placeholder'),
		width: "100%"
	}).change(setFilter);

}


function setFilter(e, filterName) {
	if ( $(this).parent().hasClass('explore-card-profiles-toggles') ) {

		var toggle_type = this.textContent.toLowerCase().includes('stations') ? "stationDeps" : "animals";
		var is_selected = $(this).hasClass('selected');

		if (is_selected) {
			if ( ['regions', 'projects'].includes(dataType) ) {
				if (toggle_type == 'stationDeps') {
					motusFilter.stations = motusFilter[ dataType ].map(x => (motusData[ toggle_type + "By" + firstToUpper(dataType) ].get(x).map(v => v.id))).flat();
				} else {
					motusFilter[ toggle_type ] = motusFilter[ dataType ]
						.filter(x => (typeof motusData[ toggle_type + "By" + firstToUpper(dataType) ].get(x) !== 'undefined'))
						.map(x => Array.from(motusData[ toggle_type + "By" + firstToUpper(dataType) ].get(x).keys())).flat().filter(onlyUnique);
				}
			}
		} else {

			motusFilter[ toggle_type == 'stationDeps' ? "stations" : toggle_type ] = ["all"];

		}
		motusMap.setVisibility();
	} else {

		filterName = filterName ? filterName : e.target.id.replace("filter_", "");

		var newFilter = $(e.target).val();
		console.log(filterName + ": " + newFilter);
		newFilter = newFilter.length == 0 ? ['all'] : (filterName == 'status' && newFilter == 'inactive' ? ['terminated','not active','pending'] : newFilter);

		motusFilter[filterName] = newFilter;

	//	var displayText = motusFilter[filterName].map(v => $("#filter_" + filterName + " option[value='" + v + "']").text());

		if (filterName == dataType) {
			if (motusFilter[dataType].includes('all') && motusFilter.selections.length > 0) {
				motusFilter[dataType] = motusFilter.selections;
			} else if ( !motusFilter.selections.every( x => motusFilter[dataType].includes(x))) {
				motusFilter[dataType].concat( motusFilter.selections.filter( x => !motusFilter[dataType].includes(x) ) );
			}
		}

				testTimer.push([new Date(), "Update data"]);

		updateData();
	//	$("#filter_summary > div.explore_" + filterName + ":not(.visible)").addClass('visible');
	//	$("#filter_summary > div.clear_filters:not(.visible)").addClass('visible');
	//	$("#filter_summary > div.explore_" + filterName + " > span").text(displayText.join(', '));

	}
	//console.log(motusFilter);
	if (Object.keys(motusFilter).every(function(k) {return ['dtStart', 'dtEnd', 'colour', 'regions'].includes(k) || motusFilter[k].includes('all');}) && motusFilter.dtStart == default_startDate && motusFilter.dtEnd == default_endDate) {
		$("#explore_filters").parent(".active").removeClass('active');
	} else {
		$("#explore_filters").parent(":not(.active)").addClass('active');
	}

	return false;
}


function updateData() {

	window.dispatchEvent(new Event('resize'));

	if (motusMap.setVisibility)	motusMap.setVisibility();

	testTimer.push([new Date(), "Update url"]);


	updateSelectionStatus();

	updateURL();

}

function select2TemplateResult (data, container) {
	if (data.element) {
		$(container).addClass($(data.element).attr("class"));
	}
	return data.text;
}
function select2Placeholder() {return $(this).data('placeholder');}
function select2Matcher(params, data) {
	// If there are no search terms, return all of the data
	if ($.trim(params.term) === '') {
		return data;
	}

	// Do not display the item if there is no 'text' property
	if (typeof data.text === 'undefined') {
		return null;
	}

	// `params.term` should be the term that is used for searching
	// `data.text` is the text that is displayed for the data object
	if (data.text.toUpperCase().indexOf(params.term.toUpperCase()) > -1) {
		return data;
	}


	if (data.id.indexOf(params.term) > -1) {
		return data;
	}

	// Return `null` if the term should not be displayed
	return null;

}
function detectionTimeline( d, {
															width = 300,
															height = 60,
															timelineScale = d3.scaleLinear().domain([ timeRange.min, timeRange.max ]).range([ 0, width ]),
															dayWidth = timelineScale( timeRange.min + (1 * 24 * 60 * 60 * 1000) ),
															colourScale = d3.scaleSequential(d3.interpolateTurbo).domain([ 1, 10 ]),
															timelineSVG = $("<svg width='"+width+"' height='"+height+"' style='margin:-8px 0;cursor:pointer;'></svg>"),
															resize = false,
															dataSource = 'station',
															yAxis = false,
															margin = {left: 40, right: 20},
															zoomable = false,
															setTimeline = false
														} = {} ) {

	timeline.colourScale = colourScale;
	//console.log(d)

	if (width > 0) {

		timelineScale = d3.scaleLinear().domain([ timeRange.min, timeRange.max ]).range([margin.left, width-margin.right])

		dayWidth = dayWidth < 1 ? 1 : dayWidth;

		var timeFormat = ( timeRange.range / (1000 * 60 * 60 * 24 * 365) ) * ( 300 / width ) > 2 ? "%Y" :
							( ( timeRange.range / (1000 * 60 * 60 * 24 * 365) ) * ( 300 / width ) > 1 ? "%b %Y" : "%Y-%m-%d" );

		var x_scale = d3.scaleTime()
									.domain( [ new Date(timeRange.min), new Date(timeRange.max) ] )
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
			d.forEach(function(trackData, ind) {

				var dtsStart = trackData.dtStartList;
				var dtsEnd = trackData.dtEndList;
				var splitData = {
					stations: trackData.route.split('.'),
					projects: trackData.project,
					species: trackData.species,
					animals: trackData.animal,
					regions: motusFilter.selections
				};

//				if (ind%100 == 0) console.log(trackData)
				var dates = [];
				var spp = [];
				var animals = [];

				trackData.dir.forEach((dir ,i) => {
					if (( dataType == "projects" || motusFilter.projects.includes('all') || motusFilter.projects.includes(splitData.projects[i]) ) &&
							( dataType == "species" || motusFilter.species.includes('all') || motusFilter.species.includes(trackData.species[i]) ) &&
							( dataType == "animals" || motusFilter.animals.includes('all') || motusFilter.animals.includes(trackData.animal[i]) ) &&
							( motusFilter.selections.includes( splitData[dataType][i] ))) {

							if ( motusFilter.stations.includes('all') || motusFilter.stations.includes(splitData.stations[0]) ) {
								dates.push( dir == 1 ? dtsStart[i] : dtsEnd[i] );
								spp.push(trackData.species[i]);
								animals.push(trackData.animal[i]);
							}
							if ( motusFilter.stations.includes('all') || motusFilter.stations.includes(splitData.stations[1]) ) {
								dates.push( dir == 1 ? dtsEnd[i] : dtsStart[i] );
								spp.push(trackData.species[i]);
								animals.push(trackData.animal[i]);
							}
					}
				}, []);


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

				var w = width * ((new Date(v.dtEnd).valueOf()) - (new Date(v.dtStart).valueOf())) / timeRange.range;
				var x = width * ((new Date(v.dtStart).valueOf()) - timeRange.min) / timeRange.range;

				svg
					.append('rect')
					.attr('width', w)
					.attr('height', height)
					.attr('x', x)
					.style('fill', '#CCCCCC');


				var g = d3.select( timelineSVG[0] )
					.append('g');

				w = width * ( 24 * 60 * 60 * 3000 ) / timeRange.range;

				if (typeof motusData.tracksByStation[v.id] !== 'undefined') {

					hasData = true;
					console.log(v.id)
					motusData.tracksByStation[v.id].forEach(function(x){

						var datePos = ( x.split('.')[0] == v.id ? 'dtStart' : 'dtEnd' ) + 'List';

						var trackData = motusData.selectedTracks[x];

						if (typeof trackData[datePos] !== 'undefined') {

							var dates = trackData[datePos];

							var data = countInstances( dates.map(k => moment(k).valueOf()) );
							const animals = trackData.animals;

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

			timeline.colourScale.domain(d3.extent(stationHits, x => x.colour.length));

			x_scale.domain(d3.extent(stationHits, x => x.date));

			g.selectAll('rect')
				.data(stationHits)
				.enter()
					.append('rect')
						//.attr('width', 3 ) // Three days
						.attr('width', x_scale(new Date("2020-01-02")) - x_scale(new Date("2020-01-01")) ) // one day
						.attr('height', (x) => y_scale(x.value) )
						.attr('x', (x) => x_scale(x.date) )
						.attr('fill', (x) => timeline.colourScale(x.animals.length) )
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

			if (resize.length > 0 && width != resize.width()) {


				var width_el = resize;
				var tmp_width = 0;

				while(tmp_width == 0 && width_el.get(0).tagName != "BODY") {
					tmp_width = width_el.width();
					width_el = width_el.parent();
				}

				if (tmp_width != width) {
					width = tmp_width;
					resize.find("svg").remove();
					resize.append( detectionTimeline( Object.values(motusData.selectedTracks), {
						width:width,
						timelineSVG: $("<svg height='"+height+"' style='width:100%;margin:-8px 0;cursor:pointer;'></svg>"),
						dataSource: dataSource,
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
