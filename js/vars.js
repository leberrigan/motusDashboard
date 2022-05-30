/*
  Variables used in dashboard
*/

//	FOR DEMO ONLY
const speciesPhotos = ["swainson's thrush", "black-and-white warbler", "prairie warbler.jpg", "pectoral sandpiper.jpg","palm warbler","red-necked phalarope.jpg", "snow bunting.jpg", "semipalmated plover.jpg", "lincoln's sparrow.jpg", "cape may warbler.jpg", "semipalmated sandpiper.jpg", "eastern phoebe.jpg", "sanderling.jpg", "black-crowned night-heron.jpg", "yellow-billed cuckoo.jpg", "blackpoll warbler.jpg", "chipping sparrow.jpg", "dickcissel.jpg", "magnolia warbler.jpg", "tree swallow.jpg", "white-crowned sparrow.jpg"];
const stationPhotos = ["sable west spit.jpg", "pugwash.jpg", "panama sewage plant.jpg", "reserva nacional paracas.jpg", "nahant.jpg"];

const devText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";


//	CONSTANTS
const icons = {
	animals: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#FFFFFF" stroke="currentColor" stroke-width="20" viewBox="125 -10 250 500"><path d="m 307.38806,152.71231 v 163.57 c 0,8.284 -6.716,15 -15,15 -41.28149,-0.71533 -47.28327,1.62781 -80,0 -8.284,0 -15,-6.716 -15,-15 v -164.459 c -16.587,-15.09 -27,-36.85 -27,-61.041001 0,-45.563 36.937,-82.5 82.5,-82.5 45.563,0 82.5,36.937 82.5,82.5 0,24.672001 -10.834,46.811001 -28,61.930001 z" /><path d="M 251.05287,334.93644 V 488.58051"/></svg>',
	animate: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="explore-animate-btn tips" alt="Animate tracks" viewBox="0 0 16 16"><path d="M 13.206 7.5 L 4.5 2.4495 v 10.101 L 13.206 7.5 z m 1.188 -1.044 a 1.203 1.203 90 0 1 0 2.088 l -9.5445 5.538 C 4.0695 14.535 3 14.0175 3 13.038 V 1.962 c 0 -0.9795 1.0695 -1.497 1.8495 -1.044 l 9.5445 5.538 z"/></svg>',
	add: '<div class="add_icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/></svg></div>',
	camera: '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" id="svg8" version="1.1" viewBox="0 0 59.208336 38.041672" height="38.041672mm" width="59.208336mm"> <defs id="defs2" /> <metadata id="metadata5"> <rdf:RDF> <cc:Work rdf:about=""> <dc:format>image/svg+xml</dc:format> <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" /> <dc:title></dc:title> </cc:Work> </rdf:RDF> </metadata> <g transform="translate(-52.416666,-121.875)" id="layer1"> <path id="path4520" d="m 52.916667,156.77083 -10e-7,-23.8125 c 0.07609,-3.35273 1.582589,-5.35555 5.291667,-5.29166 H 71.4375 c 0.946943,-2.17074 0.246566,-4.80156 3.96875,-5.29167 h 13.229167 c 2.97845,0.037 3.387115,2.75455 3.96875,5.29167 h 13.229163 c 3.90069,-0.0631 5.18139,2.11388 5.29167,5.29166 v 23.8125 c -0.18623,1.7734 -1.22238,2.43252 -2.59859,2.64584 H 55.5625 c -1.892818,-0.18261 -2.402997,-1.32175 -2.645833,-2.64584 z" style="fill:none;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" /> <circle r="11.49465" cy="144.18936" cx="81.612877" id="path4524" style="fill:none;fill-opacity:1;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" /> <circle r="8.2983761" cy="144.20241" cx="81.675636" id="path4524-5" style="fill:none;fill-opacity:1;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" /> </g></svg>',
	countries: '<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 27 27"><g transform="translate(0,-270.54167)"> <path d="m 1.3229166,294.35417 7.9375,-2.64583 7.9374994,2.64583 7.9375,-2.64583 V 273.1875 l -7.9375,2.64584 -7.9374994,-2.64584 -7.9375,2.64584 z" style="fill:none;stroke:#000000;stroke-width:1.32291665;stroke-linecap:butt;stroke-linejoin:round;stroke-opacity:1;stroke-miterlimit:4;stroke-dasharray:none;paint-order:fill markers stroke" /> <path d="m 9.2604166,273.1875 v 18.52084" style="fill:none;stroke:#000000;stroke-width:1.32291665;stroke-linecap:butt;stroke-linejoin:round;stroke-opacity:1;stroke-miterlimit:4;stroke-dasharray:none;paint-order:fill markers stroke" /> <path d="M 17.197916,294.35417 V 275.83334" style="fill:none;stroke:#000000;stroke-width:1.32291665;stroke-linecap:butt;stroke-linejoin:round;stroke-opacity:1;stroke-miterlimit:4;stroke-dasharray:none;paint-order:fill markers stroke" /> </g></svg>',
	download: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 100 100"><g transform="translate(0,-77.196699)"><path style="stroke-width:0.22810185" d="M 71.184445,127.20913 H 58.681499 v -22.92514 c 0,-0.60812 -0.196624,-1.10698 -0.586906,-1.49794 -0.388685,-0.38983 -0.888457,-0.58577 -1.495664,-0.58577 H 44.093702 c -0.607663,0 -1.107206,0.19594 -1.497945,0.58577 -0.390967,0.39119 -0.586222,0.88982 -0.586222,1.49794 v 22.92423 H 29.50522 c -0.954834,0 -1.606293,0.43454 -1.95392,1.30224 -0.347627,0.82596 -0.194799,1.58462 0.455976,2.2801 l 20.840068,20.83962 c 0.478101,0.39028 0.976961,0.58554 1.497945,0.58554 0.5203,0 1.019843,-0.19526 1.498402,-0.58554 l 20.774831,-20.77392 c 0.433849,-0.52076 0.650318,-1.0438 0.650318,-1.56296 0,-0.6072 -0.195027,-1.10697 -0.586906,-1.49862 -0.389826,-0.39052 -0.889369,-0.58555 -1.497489,-0.58555 z" /><path d="m 10.924903,167.89927 80.108917,0.42385" style="fill:none;stroke:#000000;stroke-width:9.12407398;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:1;stroke-dasharray:none;stroke-opacity:1" /></g></svg>',
	detections: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" stroke-width="20" stroke="currentColor" viewBox="0 0 100 100">  <defs> <clipPath id="clipPath4716" clipPathUnits="userSpaceOnUse"> <path d="M 376.06161,376.06303 V 1.8911244 H 363.86239 L 189.05379,176.69972 14.245251,1.8911244 H 1.8897865 V 376.06303 H 14.089005 L 189.05379,201.09819 364.01863,376.06303 Z" style="display:inline;fill:#000000;fill-opacity:1;stroke:#000000;stroke-width:0.99999994;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"></path> </clipPath> </defs><g style="display:inline"></g> <g style="display:inline" transform="translate(-49.999997,-147)"> <circle r="12.5" cy="197" cx="100" style="fill:;fill-opacity:1;stroke-width:0.50107378;stroke-miterlimit:4;stroke-dasharray:none"></circle> <path clip-path="url(#clipPath4716)" id="path815-5" transform="matrix(0.26458333,0,0,0.26458333,49.999997,147)" d="M 188.97656,9.4570312 A 179.51911,179.5191 0 0 0 9.4570312,188.97656 179.51911,179.5191 0 0 0 188.97656,368.49609 179.51911,179.5191 0 0 0 368.49609,188.97656 179.51911,179.5191 0 0 0 188.97656,9.4570312 Z m 0,70.8574218 A 108.66142,108.66142 0 0 1 297.63867,188.97656 108.66142,108.66142 0 0 1 188.97656,297.63867 108.66142,108.66142 0 0 1 80.314453,188.97656 108.66142,108.66142 0 0 1 188.97656,80.314453 Z" style="fill:none;fill-opacity:1;stroke-width:18.91456032;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"></path> </g></svg>',
	expand:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg>',
	edit: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" class="explore-map-edit-btn tips" alt="Advanced">'+
	  '<path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>'+
	  '<path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>'+
	'</svg>',
	filters: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" class="explore-filter-btn tips" alt="Show filters" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2h-11z" /></svg>',
	addFilter: '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="20" height="20" class="add-filter-btn tips" alt="Add to filters"> <path style="fill:#000000;fill-rule:evenodd;stroke:none;stroke-width:0.5;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;fill-opacity:1" d="M 2.5 1.25 A 0.625 0.625 0 0 0 1.875 1.875 L 1.875 4.375 A 0.625 0.625 0 0 0 2.0351562 4.7929688 L 7.5 10.865234 L 7.5 18.125 A 0.625 0.625 0 0 0 8.3222656 18.716797 L 12.072266 17.466797 A 0.625 0.625 0 0 0 12.5 16.875 L 12.5 10.865234 L 16.464844 6.4589844 A 4.0735662 4.0735662 0 0 1 15.298828 5.8867188 L 11.410156 10.207031 A 0.625 0.625 0 0 0 11.25 10.625 L 11.25 16.425781 L 8.75 17.257812 L 8.75 10.625 A 0.625 0.625 0 0 0 8.5898438 10.207031 L 3.125 4.1347656 L 3.125 2.5 L 13.578125 2.5 A 4.0735662 4.0735662 0 0 1 13.794922 1.25 L 2.5 1.25 z " transform="scale(0.8)" /> <path style="fill:none;stroke:#00AA00;stroke-width:0.80000001;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="m 12.029041,2.2652033 2.948276,0.02397 M 13.503179,0.81503537 13.479209,3.7633111" /></svg>',
	removeFilter: '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="20" height="20" class="remove-filter-btn tips" alt="Remove filter"> <path style="fill:#000000;fill-rule:evenodd;stroke:none;stroke-width:0.5;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;fill-opacity:1" d="M 2.5 1.25 A 0.625 0.625 0 0 0 1.875 1.875 L 1.875 4.375 A 0.625 0.625 0 0 0 2.0351562 4.7929688 L 7.5 10.865234 L 7.5 18.125 A 0.625 0.625 0 0 0 8.3222656 18.716797 L 12.072266 17.466797 A 0.625 0.625 0 0 0 12.5 16.875 L 12.5 10.865234 L 16.464844 6.4589844 A 4.0735662 4.0735662 0 0 1 15.298828 5.8867188 L 11.410156 10.207031 A 0.625 0.625 0 0 0 11.25 10.625 L 11.25 16.425781 L 8.75 17.257812 L 8.75 10.625 A 0.625 0.625 0 0 0 8.5898438 10.207031 L 3.125 4.1347656 L 3.125 2.5 L 13.578125 2.5 A 4.0735662 4.0735662 0 0 1 13.794922 1.25 L 2.5 1.25 z " transform="scale(0.8)" id="path2" /> <path id="path4537-0" style="fill:none;stroke:#AA0000;stroke-width:0.80000001;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="m 12.537516,2.5363897 2.948276,0.02397" inkscape:connector-curvature="0" sodipodi:nodetypes="cc" /></svg>',
	help: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-question-circle" viewBox="0 0 16 16">'+
	  '<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>'+
	  '<path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>'+
	'</svg>',
	lastData: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z"/><path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/><path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/></svg>',
	map: '<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" stroke="currentColor" viewBox="0 0 27 27"><g transform="translate(0,-270.54167)"> <path d="m 1.3229166,294.35417 7.9375,-2.64583 7.9374994,2.64583 7.9375,-2.64583 V 273.1875 l -7.9375,2.64584 -7.9374994,-2.64584 -7.9375,2.64584 z" style="fill:none;stroke-width:1.32291665;stroke-linecap:butt;stroke-linejoin:round;stroke-opacity:1;stroke-miterlimit:4;stroke-dasharray:none;paint-order:fill markers stroke" /> <path d="m 9.2604166,273.1875 v 18.52084" style="fill:none;stroke-width:1.32291665;stroke-linecap:butt;stroke-linejoin:round;stroke-opacity:1;stroke-miterlimit:4;stroke-dasharray:none;paint-order:fill markers stroke" /> <path d="M 17.197916,294.35417 V 275.83334" style="fill:none;stroke-width:1.32291665;stroke-linecap:butt;stroke-linejoin:round;stroke-opacity:1;stroke-miterlimit:4;stroke-dasharray:none;paint-order:fill markers stroke" /> </g></svg>',
	menu: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 100 100"> <path d="M 97.206704,100 H 2.7932961 C 1.2505587,100 0,98.77005 0,97.25275 V 81.86813 C 0,80.35082 1.2505587,79.12088 2.7932961,79.12088 H 97.206704 C 98.749441,79.12088 100,80.35082 100,81.86813 V 97.25275 C 100,98.77005 98.749441,100 97.206704,100 Z m 0,-39.56044 H 2.7932961 C 1.2505587,60.43956 0,59.20962 0,57.69231 V 42.30769 C 0,40.79038 1.2505587,39.56044 2.7932961,39.56044 H 97.206704 c 1.542737,0 2.793296,1.22994 2.793296,2.74725 v 15.38462 c 0,1.51731 -1.250559,2.74725 -2.793296,2.74725 z m 0,-39.56044 H 2.7932961 C 1.2505587,20.87912 0,19.64918 0,18.13187 V 2.74725 C 0,1.22995 1.2505587,0 2.7932961,0 H 97.206704 C 98.749441,0 100,1.22995 100,2.74725 v 15.38462 c 0,1.51731 -1.250559,2.74725 -2.793296,2.74725 z" style="fill-rule:evenodd;stroke-width:0.27701786" /></svg>',
	pause: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="explore-pause-btn" alt="Pause" viewBox="0 0 16 16"><path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/></svg>',
	pdf: '<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 41.659309 29.902843"><g inkscape:label="Layer 1" inkscape:groupmode="layer" transform="translate(-70.25338,-154.21364)"> <text xml:space="preserve" x="73.117455" y="170.28175" transform="scale(0.92485882,1.0812461)"><tspan sodipodi:role="line" x="73.117455" y="170.28175" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:44.45785141px;font-family:\'Tw Cen MT Condensed\';-inkscape-font-specification:\'Tw Cen MT Condensed, Normal\';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-feature-settings:normal;text-align:start;writing-mode:lr-tb;text-anchor:start;stroke-width:1.11144626">PDF</tspan></text> </g></svg>',
	play: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="explore-play-btn" alt="Play" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>',
	projects: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" stroke="currentColor" viewBox="0 0 16 16">'+
	  '<path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>'+
	  '<path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>'+
	'</svg>',
	regions: "",
	remove: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/></svg>',
	species: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="70 160 70 50"><path d="m 107.67084,195.05271 2.93997,-5.47902 5.47902,2.20496 10.95805,-1.87087 10.02261,-7.55037 2.73951,-7.61718 -2.87315,-7.34991 -16.50389,4.54358 -8.61944,0.40091 -1.33635,-0.60136 -2.40542,-7.48355 -1.73725,-1.36975 -1.06908,-2.27179 -1.03031,2.17155 -1.73725,1.36975 -2.40542,7.48355 -1.33635,0.60136 -8.61944,-0.40091 -16.50389,-4.54358 -2.87315,7.34991 2.73951,7.61718 10.02261,7.55037 10.95805,1.87088 5.47902,-2.20497 2.93997,5.47903 -0.40089,7.08264 -0.63476,4.57699 1.97111,2.37202 1.43117,-2.07132 1.46998,2.17157 1.97111,-2.37202 -0.63476,-4.57699 z" style="stroke-width:3px;"></path></svg>',
	stations: '<svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid" width="18" height="20" viewBox="0 0 389.923 481.915">  <path d="M358.000,145.000 L358.000,88.000 L280.000,88.000 L280.000,127.000 L270.000,127.000 L270.000,88.000 L197.000,88.000 L197.000,210.720 L280.003,455.303 L275.586,459.008 L232.000,330.572 L232.000,338.000 L197.000,338.000 L197.000,404.988 L187.000,404.988 L187.000,338.000 L150.007,338.000 L108.464,460.008 L103.997,456.274 L187.000,212.504 L187.000,88.000 L114.000,88.000 L114.000,127.000 L104.000,127.000 L104.000,88.000 L30.000,88.000 L30.000,152.000 L20.000,152.000 L20.000,20.000 L30.000,20.000 L30.000,78.000 L104.000,78.000 L104.000,40.000 L114.000,40.000 L114.000,78.000 L187.000,78.000 L187.000,57.012 L197.000,57.012 L197.000,78.000 L270.000,78.000 L270.000,40.000 L280.000,40.000 L280.000,78.000 L358.000,78.000 L358.000,20.000 L368.000,20.000 L368.000,78.000 L368.000,88.000 L368.000,145.000 L358.000,145.000 ZM197.000,328.000 L231.127,328.000 L197.000,227.438 L197.000,328.000 ZM187.000,229.355 L153.412,328.000 L187.000,328.000 L187.000,229.355 Z" transform="translate(10.96 10.96)" style="stroke-width: 10;"></path></svg>',
	station: '<svg xmlns="http://www.w3.org/2000/svg" stroke="currentColor" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid" width="18" height="20" viewBox="0 0 389.923 481.915">  <path d="M358.000,145.000 L358.000,88.000 L280.000,88.000 L280.000,127.000 L270.000,127.000 L270.000,88.000 L197.000,88.000 L197.000,210.720 L280.003,455.303 L275.586,459.008 L232.000,330.572 L232.000,338.000 L197.000,338.000 L197.000,404.988 L187.000,404.988 L187.000,338.000 L150.007,338.000 L108.464,460.008 L103.997,456.274 L187.000,212.504 L187.000,88.000 L114.000,88.000 L114.000,127.000 L104.000,127.000 L104.000,88.000 L30.000,88.000 L30.000,152.000 L20.000,152.000 L20.000,20.000 L30.000,20.000 L30.000,78.000 L104.000,78.000 L104.000,40.000 L114.000,40.000 L114.000,78.000 L187.000,78.000 L187.000,57.012 L197.000,57.012 L197.000,78.000 L270.000,78.000 L270.000,40.000 L280.000,40.000 L280.000,78.000 L358.000,78.000 L358.000,20.000 L368.000,20.000 L368.000,78.000 L368.000,88.000 L368.000,145.000 L358.000,145.000 ZM197.000,328.000 L231.127,328.000 L197.000,227.438 L197.000,328.000 ZM187.000,229.355 L153.412,328.000 L187.000,328.000 L187.000,229.355 Z" transform="translate(10.96 10.96)" style="stroke-width: 10;"></path></svg>',
	stop: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="explore-stop-btn" alt="Stop" viewBox="0 0 16 16"><path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/></svg>',
	share: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5z"/></svg>',
	search: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="explore-search-btn tips" alt="Search" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>',
	tags: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#FFFFFF" stroke="currentColor" stroke-width="20" viewBox="125 -10 250 500"><path d="m 307.38806,152.71231 v 163.57 c 0,8.284 -6.716,15 -15,15 -41.28149,-0.71533 -47.28327,1.62781 -80,0 -8.284,0 -15,-6.716 -15,-15 v -164.459 c -16.587,-15.09 -27,-36.85 -27,-61.041001 0,-45.563 36.937,-82.5 82.5,-82.5 45.563,0 82.5,36.937 82.5,82.5 0,24.672001 -10.834,46.811001 -28,61.930001 z" /><path d="M 251.05287,334.93644 V 488.58051"/></svg>',
	target: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" stroke="currentColor" stroke-width="20" viewBox="0 0 225 225"><?xml version="1.0" encoding="UTF-8" standalone="no"?> <!-- Created with Inkscape (http://www.inkscape.org/) --> <svg xmlns="http://www.w3.org/2000/svg" width="58.208347mm" height="58.20834mm" viewBox="0 0 58.208347 58.20834" version="1.1" stroke="currentColor" id="svg8"> <g transform="translate(-2.645827,-3.3125006)"> <circle style="fill:none;fill-opacity:1;stroke-width:3;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" id="path4518" cx="32.178452" cy="32.628746" r="20.894449" /> <path style="fill:none;stroke-width:3;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="M 31.75,21.833333 V 3.3125006" id="path4522"/> </g> <g transform="translate(-2.645827,-3.3125006)"> <path style="fill:none;stroke-width:3;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="m 42.333333,32.416667 h 18.52084" id="path4522-1" /> <path style="fill:none;stroke-width:3;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="M 31.75,43 V 61.52084" id="path4522-1-2"/> <path style="fill:none;stroke-width:3;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="m 2.645827,32.416667 h 18.52084" id="path4522-1-5"/> </g> </svg> ',
	timeline: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="explore-timeline-btn tips" alt="Timeline" viewBox="0 0 16 16"><path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z"/><path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/><path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/></svg>',
	track: '<svg   xmlns:dc="http://purl.org/dc/elements/1.1/"   xmlns:cc="http://creativecommons.org/ns#"   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"   xmlns:svg="http://www.w3.org/2000/svg"   xmlns="http://www.w3.org/2000/svg"   version="1.1"   viewBox="0 0 23.052618 41.573452"   height="23"   width="18">  <defs     id="defs2">    <marker       style="overflow:visible"       id="marker1384"       refX="0"       refY="0"       orient="auto">      <path         transform="matrix(0.4,0,0,0.4,2.96,0.4)"         style="fill:#000000;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:1.00000003pt;stroke-opacity:1"         d="m -2.5,-1 c 0,2.76 -2.24,5 -5,5 -2.76,0 -5,-2.24 -5,-5 0,-2.76 2.24,-5 5,-5 2.76,0 5,2.24 5,5 z"         id="path1382" />    </marker>    <marker       style="overflow:visible"       id="DotM"       refX="0"       refY="0"       orient="auto">      <path         transform="matrix(0.4,0,0,0.4,2.96,0.4)"         style="fill:#000000;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:1.00000003pt;stroke-opacity:1"         d="m -2.5,-1 c 0,2.76 -2.24,5 -5,5 -2.76,0 -5,-2.24 -5,-5 0,-2.76 2.24,-5 5,-5 2.76,0 5,2.24 5,5 z"         id="path910" />    </marker>    <marker       style="overflow:visible"       id="DotL"       refX="0"       refY="0"       orient="auto">      <path         transform="matrix(0.8,0,0,0.8,5.92,0.8)"         style="fill:#000000;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:1.00000003pt;stroke-opacity:1"         d="m -2.5,-1 c 0,2.76 -2.24,5 -5,5 -2.76,0 -5,-2.24 -5,-5 0,-2.76 2.24,-5 5,-5 2.76,0 5,2.24 5,5 z"         id="path907" />    </marker>  </defs>  <g     transform="translate(-32.112052,-59.290716)"     id="layer1">    <path       d="M 34.395833,98.5625 52.916666,61.520831"       style="fill:none;stroke:#000000;stroke-width:1;stroke-miterlimit:3.29999995;stroke-dasharray:none;stroke-opacity:1;marker-start:url(#DotM);marker-end:url(#marker1384)" />  </g></svg>',
	zoom: '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/><path d="M10.344 11.742c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1 6.538 6.538 0 0 1-1.398 1.4z"/><path fill-rule="evenodd" d="M6.5 3a.5.5 0 0 1 .5.5V6h2.5a.5.5 0 0 1 0 1H7v2.5a.5.5 0 0 1-1 0V7H3.5a.5.5 0 0 1 0-1H6V3.5a.5.5 0 0 1 .5-.5z"/></svg>'
}

const conservationStatus = {
	DD: "Data deficient",
	LC: "Least concern",
	NT: "Near threatened",
	VU: "Vulnerable",
	EN: "Endangered",
	CR: "Critically endangered",
	EW: "Extinct in the wild",
	EX: "Extinct",
  english: {
  	DD: "Data deficient",
  	LC: "Least concern",
  	NT: "Near threatened",
  	VU: "Vulnerable",
  	EN: "Endangered",
  	CR: "Critically endangered",
  	EW: "Extinct in the wild",
  	EX: "Extinct"
  },
  french: {
  	DD: "Data deficient",
  	LC: "Least concern",
  	NT: "Near threatened",
  	VU: "Vulnerable",
  	EN: "Endangered",
  	CR: "Critically endangered",
  	EW: "Extinct in the wild",
  	EX: "Extinct"
  },
  spanish: {
  	DD: "Data deficient",
  	LC: "Least concern",
  	NT: "Near threatened",
  	VU: "Vulnerable",
  	EN: "Endangered",
  	CR: "Critically endangered",
  	EW: "Extinct in the wild",
  	EX: "Extinct"
  }
}

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
	8:'Atlantic Offshore Wind',
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
const icon_paths = {
	stations:"M 8.95 3.625 L 8.95 2.2 L 7 2.2 L 7 3.175 L 6.75 3.175 L 6.75 2.2 L 4.925 2.2 L 4.925 5.268 L 7.0001 11.3826 L 6.8897 11.4752 L 5.8 8.2643 L 5.8 8.45 L 4.925 8.45 L 4.925 10.1247 L 4.675 10.1247 L 4.675 8.45 L 3.7502 8.45 L 2.7116 11.5002 L 2.5999 11.4068 L 4.675 5.3126 L 4.675 2.2 L 2.85 2.2 L 2.85 3.175 L 2.6 3.175 L 2.6 2.2 L 0.75 2.2 L 0.75 3.8 L 0.5 3.8 L 0.5 0.5 L 0.75 0.5 L 0.75 1.95 L 2.6 1.95 L 2.6 1 L 2.85 1 L 2.85 1.95 L 4.675 1.95 L 4.675 1.4253 L 4.925 1.4253 L 4.925 1.95 L 6.75 1.95 L 6.75 1 L 7 1 L 7 1.95 L 8.95 1.95 L 8.95 0.5 L 9.2 0.5 L 9.2 1.95 L 9.2 2.2 L 9.2 3.625 L 8.95 3.625 Z M 4.925 8.2 L 5.7782 8.2 L 4.925 5.686 L 4.925 8.2 Z M 4.675 5.7339 L 3.8353 8.2 L 4.675 8.2 L 4.675 5.7339 Z"
};
const NULL_SPECIES = {
	id: -1,
	english: "Unlisted Species",
	french: "Espèce indéfinie",
	scientific: "Unlisted Species",
	code: -1,
	group: "Unlisted Species",
	projects: [],
	stations: [],
	stationProjects: [],
	animals: []
};

const motusFrequencies = ["166.38","150.1","151.5","434","dual","none"];


const STATION_ICON_MAPPING = {
	selectedStation: {x: 0, y: 0, width: 125, height: 125, mask: false},
	selectedActiveStation: {x: 0, y: 0, width: 125, height: 125, mask: false},
	selectedInactiveStation: {x: 125, y: 0, width: 125, height: 125, mask: false},
	otherInactiveStation: {x: 125, y: 125, width: 125, height: 125, mask: false},
	otherActiveStation: {x: 0, y: 125, width: 125, height: 125, mask: false},
	otherStation: {x: 0, y: 125, width: 125, height: 125, mask: false},
	Lotek_Americas: {x: 0, y: 0, width: 125, height: 125, mask: false},
	Lotek_Europe_Africa: {x: 125, y: 0, width: 125, height: 125, mask: false},
	Lotek_Australia_Asia: {x: 0, y: 125, width: 125, height: 125, mask: false},
	CTT_Global: {x: 125, y: 125, width: 125, height: 125, mask: false},
	dual: {x: 0, y: 250, width: 125, height: 125, mask: false},
	dual_Americas: {x: 0, y: 250, width: 125, height: 125, mask: false},
	dual_Europe_Africa: {x: 125, y: 250, width: 125, height: 125, mask: false},
	dual_Australia_Asia: {x: 0, y: 375, width: 125, height: 125, mask: false},
	highlighted: {x: 0, y: 0, width: 125, height: 125, mask: true}
};

const ANIMAL_ICON_MAPPING = {
	selectedAnimal: {x: 250, y: 0, width: 250, height: 250, mask: false},
	otherAnimal: {x: 0, y: 0, width: 250, height: 250, mask: false},
	raptor: {x: 0, y: 250, width: 250, height: 250, mask: false},
	warbler: {x: 250, y: 250, width: 250, height: 250, mask: false},
	gull: {x: 0, y: 500, width: 250, height: 250, mask: false},
	swallow: {x: 250, y: 500, width: 250, height: 250, mask: false},
	shorebird: {x: 0, y: 750, width: 250, height: 250, mask: false},
	dragonfly: {x: 250, y: 750, width: 250, height: 250, mask: false},
	bat: {x: 0, y: 1000, width: 250, height: 250, mask: false},
	monarch: {x: 250, y: 1000, width: 250, height: 250, mask: false}
};





// VARIABLES

// All Motus data loaded into memory is stored in this object
var motusData = {};

// These are possible options for filters in the toolbar
// This could probably be better named
var filters = {
	options: {
		projects: {},
		stations: {},
		species: {},
		animals: {},
		frequencies: {
			"166.38": "166.38 MHz",
			"150.1": "150.1 MHz",
			"151.5": "151.5 MHz",
			"434": "434 MHz",
			"dual": "Dual Mode",
			"none": "Unknown"
		},
		regions: ["North America", "Latin America", "Europe", "Asia", "Australia", "Africa"],
		models: ["NTQB2-1", "NTQB2-1-2", "NTQB2-2", "NTQB2-3-2", "NTQB2-4-2"],
		status: ['Active','Inactive']
	},
	selected: {
		species: ['all']
	},
	data: {}
}

const TEXT_FRAGMENTS = {
//	KEY:	{english: "", fr: "",	es: ""}
	month_1:	{english: "Jan", fr: "jan",	es: "ene"},
	month_2:	{english: "Feb", fr: "fev",	es: "feb"},
	month_3:	{english: "Mar", fr: "mar",	es: "mar"},
	month_4:	{english: "Apr", fr: "avr",	es: "abr"},
	month_5:	{english: "May", fr: "mai",	es: "mai"},
	month_6:	{english: "Jun", fr: "jun",	es: "jun"},
	month_7:	{english: "Jul", fr: "jul",	es: "jul"},
	month_8:	{english: "Aug", fr: "aou",	es: "ago"},
	month_9:	{english: "Sep", fr: "sep",	es: "sep"},
	month_10:	{english: "Oct", fr: "oct",	es: "oct"},
	month_11:	{english: "Nov", fr: "nov",	es: "nov"},
	month_12:	{english: "Dec", fr: "dec",	es: "dec"}
}

// All 5 data categories
var dataTypes = ['Stations', 'Animals', 'Regions', 'Projects', 'Species'];

var default_startDate = new Date('2014-02-05'),
    default_endDate = new Date();

// Date limits are set to the default dates at the start
var dtLims = {min: default_startDate, max: default_endDate};

// This defines the current filter settings for the loaded data.
// The idea is to eliminate page refreshes and load data dynamically as the filters changes
// However, this may still require occasional page refreshes due to memory usage
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
	colour: '',
	default: {
		dtStart: default_startDate,
		dtEnd: default_endDate,
		species: ["all"],
		regions: ["all"],
		projects: ["all"],
		stations: ["all"],
		status: ["all"],
		frequencies: ["all"],
		selections: [],
		regionType: 'continent',
		colour: ''
	}
}

// Is the client on a mobile device? Will be set by function after initiation.
var isMobile = false;

// Language defaults to English
var currLang = 'english';

// I probably don't need all these - just dataType and exploreType
var exploreType,
//		mapType,
		dataType; // 'stations' or 'species'

// This is provide a URL for accessing data
const	filePrefix =  window.location.hostname.includes('motus.org') ? "https://" + window.location.hostname + "/dashboard/data/" : "data/";
const	imagePrefix =  window.location.hostname.includes('motus.org') ?
										window.location.pathname.includes("dashboard-beta") ?
											"https://" + window.location.hostname + "/wp-content/themes/dashboard_template/images/" :
												"https://" + window.location.hostname + "/dashboard/images/" : "images/";
const	mapFilePrefix = window.location.hostname == 'localhost' || window.location.hostname == 'leberrigan.github.io' ? 'data/' : "https://" + window.location.hostname + "/dashboard/maps/";


// Used to compare the length of time needed for different operations
var testTimer=[];

// List which tabels need to be loaded for each view to make things more efficient
var requiredTables = {
	main: {
		stations: ["stations","stationDeps", "animals", "species", "projects"],
		animals: ["stations","stationDeps", "animals", "tracksLongByAnimal", "species", "projects"],
		regions: ["stations","stationDeps", "polygons", "regions", "species", "projects"],
		projects: ["stations","stationDeps", "animals", "species", "projects"],
		species: ["stations","stationDeps", "species", "projects"]
	},
	summary: {
		stations: ["stations", "stationDeps", "animals", "regions", "polygons", "species", "projects", "tracksLongByAnimal"],
		animals: ["stations", "stationDeps", "animals", "regions", "polygons", "species", "projects", "tracksLongByAnimal"],
		regions: ["stations", "stationDeps", "animals", "regions", "polygons", "species", "projects", "tracksLongByAnimal"],
		projects: ["stations", "stationDeps", "animals", "regions", "species", "projects", "tracksLongByAnimal"],
		species: ["stations", "stationDeps", "animals", "regions", "polygons", "species", "projects", "tracksLongByAnimal"]
	}
}


// A list of all tables accessible from the API
const API_TABLES = [
	"antennaDeployments",
	"gps",
	"antPulse",
	"projects",
	"receivers",
	"species",
	"stations",
	"station/recent",
	"stationDeployments",
	"stationTags",
	"tags",
	"tags/local",
	"tagDeployments"
];

// A list of all tables accessible from the local demo (for testing only)
const LOCAL_TABLES = [
	"antennaDeployments",
	"projects",
	"receivers",
	"species",
	"stations",
	"station/recent",
	"stationDeployments",
	"stationTags",
	"tracks",
	"tags",
	"tags/local",
	"tagDeployments"
];

/* Order in which tables must be loaded

		antennas
		stationDeps
		stationDetectedTags
		stationLocalTags
		stationRecentData
		stations
		tags
		animals
		species
		trackLongByAnimal
		tracksByAnimal
		projects

*/

var NEW_DOWNLOAD_AGE = 7; // Number of days before we download a new file

// These are all the tables I store in the local db along with their URLs.
	// Links = How tables are linked together
	//	- before: tables that should be loaded before loading this one
	//	- after: 	tables that should be (re)loaded after loading this one
var indexedDBTables = {
	motusTables: 				{key: "name", get: true, done: true},

	antennas: 					{file: filePrefix + "API_antenna-deployments.csv",					key: 'id', 															API: "antennaDeployments",					links: {before: [], after: []}},	// All receiver deployments, including deployment country
	stationDeps: 				{file: filePrefix + "API_station_deployments.csv", 					key: 'id', 															API: "stationDeployments",					links: {before: ["antennas"], after: ["stations", "stationLocalTags", "stationDetectedTags","stationRecentData"]}},	// All receiver deployments, including deployment country
	stationDetectedTags:{file: filePrefix + "API_station_tags.csv", 								key: 'deploymentID', 										API: "stationTags",									links: {before: [], after: []}}, //
	stationLocalTags: 	{file: filePrefix + "API_tags_local.csv",										key: 'stationID', 											API: "tags/local",									links: {before: [], after: []}}, //
	stationRecentData: 	{file: filePrefix + "API_station_recent.csv",								key: 'stationID', 											API: "station/recent", get: true,		links: {before: [], after: []}}, //
	stations: 					{file: filePrefix + "API_stations.csv", 										key: 'id, project, country, *animals', 	API: "stations",										links: {before: ["stationDeps","antennas", "stationLocalTags", "stationDetectedTags","stationRecentData"], after: ["stationDeps"]}},	// All stations including station deployments (a.k.a. receiver deployments)

	tags:					 			{file: filePrefix + "API_tags.csv", 												key: 'id', 															API: "tags",												links: {before: [], after: []}}, // All tag deployments, including deployment country
	animals:					 	{file: filePrefix + "API_tag_deployments.csv", 							key: 'id, project, country, species', 	API: "tagDeployments",							links: {before: ["tags"], after: []}}, // All tag deployments, including deployment country
	species: 						{file: filePrefix + "API_species.csv",											key: 'id',															API: "species",											links: {before: ["animals"], after: []}}, // List of all species and various names/codes
	tracksLongByAnimal: {file: filePrefix + "API_tracks.csv", 											key: 'id', 															API: "tracks",											links: {before: ["animals","stations"], after: []}}, //
	tracksByAnimal: 		{file: false, 																							key: 'id', 															API: false,													links: {before: ["animals","stations"], after: []}}, //

	projects: 					{file: filePrefix + "API_projects.csv", 										key: 'id',															API: "projects",										links: {before: ["animals","stations"], after: []}}, // All projects, their codes, and descriptions

	stationsByRegion: 	{file: false, 																							key: 'region, regionType', 							API: false,													links: {before: ["stations"], after: []}}, //
	animalsByRegion: 		{file: false, 																							key: 'region, regionType', 							API: false,													links: {before: ["animals"], after: []}}, //
	polygons: 					{file: mapFilePrefix + "ne_50m_admin_0_countries.geojson", 	key: '++, id', 													API: false,													links: {before: [], after: []}}, // GEOJSON dataset of country polygons. Includes ISO contry names and codes.
	regions: 						{file: false, 																							key: 'id', 															API: false,													links: {before: ["animals","stations", "polygons", "projects"], after: []}}, // Number of projects, stations, and tag deployments in each country

	prospectiveStations:{file: mapFilePrefix + "prospective_stations.geojson", 			key: 'id', 															API: false,													links: {before: [], after: []}}, // GEOJSON dataset of country polygons. Includes ISO contry names and codes.
	coordinationRegions:{file: mapFilePrefix + "motus-regional-collaboratives.geojson", 	key: '++, id', 										API: false,													links: {before: [], after: []}}, //GEOJSON dataset of country polygons. Includes ISO contry names and codes.

	antPulses:		 			{file: false, 																							key: 'id', 															API: "antPulses",										links: {before: ["antennas","stations"], after: []}}, //
	gpsHits: 						{file: false, 																							key: 'id', 															API: "gps",													links: {before: ["stations"], after: []}} //
}

// A list of all tables accessible from the API
var MOTUS_TABLES = {
	"antennaDeployments": {
    english: "Antennas",
    api: true,
    local: true,
    get: false,
    key: "id",
		update: "check"
  },
	"gps": {
    english: "GPS Hits",
    api: true,
    local: true,
    get: false,
    key: "id",
		update: "check"
  },
	"antPulse": {
    english: "Pulse Counts",
    api: true,
    local: true,
    get: false,
    key: "id",
		update: "check"
  },
	"projects": {
    english: "Motus Projects",
    api: true,
    local: true,
    get: true,
    key: "id",
		update: "check"
  },
	"receivers": {
    english: "Receiver devices",
    api: true,
    local: true,
    get: false,
    key: "id",
		update: "check"
  },
	"species": {
    english: "Species tagged",
    api: true,
    local: true,
    get: true,
    key: "id",
		update: "check"
  },
	"stations": {
    english: "Motus stations",
    api: true,
    local: true,
    get: true,
    key: "id",
		update: "check"
  },
	"station/recent": {
    english: "Recent data",
    api: true,
    local: true,
    get: false,
    key: "id",
		update: "always"
  },
	"stationDeployments": {
    english: "Station deployments",
    api: true,
    local: true,
    get: true,
    key: "id",
		update: "check"
  },
	"stationTags": {
    english: "Tags detected at each station",
    api: true,
    local: true,
    get: false,
    key: "id",
		update: "check"
  },
	"tags": {
    english: "Motus tags",
    api: true,
    local: true,
    get: false,
    key: "id",
		update: "check"
  },
	"tags/local": {
    english: "Tags deployed locally at each station",
    api: true,
    local: true,
    get: false,
    key: "id",
		update: "check"
  },
	"tagDeployments": {
    english: "Animals",
    api: true,
    local: true,
    get: false,
    key: "id",
		update: "check"
  }
};
