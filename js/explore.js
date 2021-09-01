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
var speciesPhotos = ["SESA.png", "SAND.jpg", "BCNH.jpg", "YBCU.jpg", "BLPW.jpg", "CHSP.jpg", "DICK.jpg", "MAWA.jpg", "TRES.jpg", "WCSP.jpg"];
var stationPhotos = ["SABLE_WEST_SPIT.jpg", "PUGWASH.jpg", "PANAMA_SEWAGE.jpg", "PARACAS.jpg"];

var icons = {
	lastData: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z"/><path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/><path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/></svg>',
/*	species: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="-50 0 900 400"><path d="m 593.63776,191.06651 -159.1803,45.46998 3.019,6.13 46.529,68.677 -2.439,5.834 -81.503,31.964 -82.23705,-31.992 -2.434,-5.803 46.52405,-68.701 2.95,-5.975 L 208.32143,191.0665 -44.302404,223.18575 61.054237,124.39961 208.32143,79.074162 l 140.55903,6.86332 15.3948,-13.13068 11.5769,-34.43522 18.8475,-13.58332 3.30134,-24.82593528 2.17411,-2.36971272 2.07904,2.47033816 3.38371,24.70155984 18.5618,13.77773 10.0921,32.89878 17.2207,14.50546 142.1253,-6.87232 150.64264,45.325448 106.87955,99.12663 z"/></svg>',*/
	species: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="70 160 70 50"><path d="m 107.67084,195.05271 2.93997,-5.47902 5.47902,2.20496 10.95805,-1.87087 10.02261,-7.55037 2.73951,-7.61718 -2.87315,-7.34991 -16.50389,4.54358 -8.61944,0.40091 -1.33635,-0.60136 -2.40542,-7.48355 -1.73725,-1.36975 -1.06908,-2.27179 -1.03031,2.17155 -1.73725,1.36975 -2.40542,7.48355 -1.33635,0.60136 -8.61944,-0.40091 -16.50389,-4.54358 -2.87315,7.34991 2.73951,7.61718 10.02261,7.55037 10.95805,1.87088 5.47902,-2.20497 2.93997,5.47903 -0.40089,7.08264 -0.63476,4.57699 1.97111,2.37202 1.43117,-2.07132 1.46998,2.17157 1.97111,-2.37202 -0.63476,-4.57699 z" style="stroke-width:3px;"></path></svg>',
	animals: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#FFFFFF" stroke="#000000" stroke-width="20" viewBox="125 -10 250 500"><path d="m 307.38806,152.71231 v 163.57 c 0,8.284 -6.716,15 -15,15 -41.28149,-0.71533 -47.28327,1.62781 -80,0 -8.284,0 -15,-6.716 -15,-15 v -164.459 c -16.587,-15.09 -27,-36.85 -27,-61.041001 0,-45.563 36.937,-82.5 82.5,-82.5 45.563,0 82.5,36.937 82.5,82.5 0,24.672001 -10.834,46.811001 -28,61.930001 z" /><path d="M 251.05287,334.93644 V 488.58051"/></svg>',
	countries: '<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 27 27"><g transform="translate(0,-270.54167)"> <path d="m 1.3229166,294.35417 7.9375,-2.64583 7.9374994,2.64583 7.9375,-2.64583 V 273.1875 l -7.9375,2.64584 -7.9374994,-2.64584 -7.9375,2.64584 z" style="fill:none;stroke:#000000;stroke-width:1.32291665;stroke-linecap:butt;stroke-linejoin:round;stroke-opacity:1;stroke-miterlimit:4;stroke-dasharray:none;paint-order:fill markers stroke" /> <path d="m 9.2604166,273.1875 v 18.52084" style="fill:none;stroke:#000000;stroke-width:1.32291665;stroke-linecap:butt;stroke-linejoin:round;stroke-opacity:1;stroke-miterlimit:4;stroke-dasharray:none;paint-order:fill markers stroke" /> <path d="M 17.197916,294.35417 V 275.83334" style="fill:none;stroke:#000000;stroke-width:1.32291665;stroke-linecap:butt;stroke-linejoin:round;stroke-opacity:1;stroke-miterlimit:4;stroke-dasharray:none;paint-order:fill markers stroke" /> </g></svg>',
	tags: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#FFFFFF" stroke="#000000" stroke-width="20" viewBox="125 -10 250 500"><path d="m 307.38806,152.71231 v 163.57 c 0,8.284 -6.716,15 -15,15 -41.28149,-0.71533 -47.28327,1.62781 -80,0 -8.284,0 -15,-6.716 -15,-15 v -164.459 c -16.587,-15.09 -27,-36.85 -27,-61.041001 0,-45.563 36.937,-82.5 82.5,-82.5 45.563,0 82.5,36.937 82.5,82.5 0,24.672001 -10.834,46.811001 -28,61.930001 z" /><path d="M 251.05287,334.93644 V 488.58051"/></svg>',
	download: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 100 100"><g transform="translate(0,-77.196699)"><path style="stroke-width:0.22810185" d="M 71.184445,127.20913 H 58.681499 v -22.92514 c 0,-0.60812 -0.196624,-1.10698 -0.586906,-1.49794 -0.388685,-0.38983 -0.888457,-0.58577 -1.495664,-0.58577 H 44.093702 c -0.607663,0 -1.107206,0.19594 -1.497945,0.58577 -0.390967,0.39119 -0.586222,0.88982 -0.586222,1.49794 v 22.92423 H 29.50522 c -0.954834,0 -1.606293,0.43454 -1.95392,1.30224 -0.347627,0.82596 -0.194799,1.58462 0.455976,2.2801 l 20.840068,20.83962 c 0.478101,0.39028 0.976961,0.58554 1.497945,0.58554 0.5203,0 1.019843,-0.19526 1.498402,-0.58554 l 20.774831,-20.77392 c 0.433849,-0.52076 0.650318,-1.0438 0.650318,-1.56296 0,-0.6072 -0.195027,-1.10697 -0.586906,-1.49862 -0.389826,-0.39052 -0.889369,-0.58555 -1.497489,-0.58555 z" /><path d="m 10.924903,167.89927 80.108917,0.42385" style="fill:none;stroke:#000000;stroke-width:9.12407398;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:1;stroke-dasharray:none;stroke-opacity:1" /></g></svg>',
	detections: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#FFFFFF" stroke="#000000" stroke-width="20" viewBox="0 0 100 100"><defs> <clipPath id="clipPath4716" clipPathUnits="userSpaceOnUse"> <path d="M 376.06161,376.06303 V 1.8911244 H 363.86239 L 189.05379,176.69972 14.245251,1.8911244 H 1.8897865 V 376.06303 H 14.089005 L 189.05379,201.09819 364.01863,376.06303 Z" style="display:inline;fill:#000000;fill-opacity:1;stroke:#000000;stroke-width:0.99999994;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" /> </clipPath> </defs> <metadata > <rdf:RDF> <cc:Work rdf:about=""> <dc:format>image/svg+xml</dc:format> <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" /> <dc:title></dc:title> </cc:Work> </rdf:RDF> </metadata> <g style="display:inline" /> <g style="display:inline" transform="translate(-49.999997,-147)"> <circle r="12.5" cy="197" cx="100" style="fill:#000000;fill-opacity:1;stroke-width:0.50107378;stroke-miterlimit:4;stroke-dasharray:none" /> <path clip-path="url(#clipPath4716)" id="path815-5" transform="matrix(0.26458333,0,0,0.26458333,49.999997,147)" d="M 188.97656,9.4570312 A 179.51911,179.5191 0 0 0 9.4570312,188.97656 179.51911,179.5191 0 0 0 188.97656,368.49609 179.51911,179.5191 0 0 0 368.49609,188.97656 179.51911,179.5191 0 0 0 188.97656,9.4570312 Z m 0,70.8574218 A 108.66142,108.66142 0 0 1 297.63867,188.97656 108.66142,108.66142 0 0 1 188.97656,297.63867 108.66142,108.66142 0 0 1 80.314453,188.97656 108.66142,108.66142 0 0 1 188.97656,80.314453 Z" style="fill:none;fill-opacity:1;stroke:#000000;stroke-width:18.91456032;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" /> </g></svg>',
	expand:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg>',
	edit: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" class="explore-map-edit-btn tips" alt="Open station planner">'+
	  '<path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>'+
	  '<path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>'+
	'</svg>',
	regions: "",
	projects: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">'+
	  '<path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>'+
	  '<path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>'+
	'</svg>',
	help: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-question-circle" viewBox="0 0 16 16">'+
	  '<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>'+
	  '<path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>'+
	'</svg>',
	share: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5z"/></svg>',
	map: '<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 27 27"><g transform="translate(0,-270.54167)"> <path d="m 1.3229166,294.35417 7.9375,-2.64583 7.9374994,2.64583 7.9375,-2.64583 V 273.1875 l -7.9375,2.64584 -7.9374994,-2.64584 -7.9375,2.64584 z" style="fill:none;stroke:#000000;stroke-width:1.32291665;stroke-linecap:butt;stroke-linejoin:round;stroke-opacity:1;stroke-miterlimit:4;stroke-dasharray:none;paint-order:fill markers stroke" /> <path d="m 9.2604166,273.1875 v 18.52084" style="fill:none;stroke:#000000;stroke-width:1.32291665;stroke-linecap:butt;stroke-linejoin:round;stroke-opacity:1;stroke-miterlimit:4;stroke-dasharray:none;paint-order:fill markers stroke" /> <path d="M 17.197916,294.35417 V 275.83334" style="fill:none;stroke:#000000;stroke-width:1.32291665;stroke-linecap:butt;stroke-linejoin:round;stroke-opacity:1;stroke-miterlimit:4;stroke-dasharray:none;paint-order:fill markers stroke" /> </g></svg>',
	pdf: '<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 41.659309 29.902843"><g inkscape:label="Layer 1" inkscape:groupmode="layer" transform="translate(-70.25338,-154.21364)"> <text xml:space="preserve" x="73.117455" y="170.28175" transform="scale(0.92485882,1.0812461)"><tspan sodipodi:role="line" x="73.117455" y="170.28175" style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:44.45785141px;font-family:\'Tw Cen MT Condensed\';-inkscape-font-specification:\'Tw Cen MT Condensed, Normal\';font-variant-ligatures:normal;font-variant-caps:normal;font-variant-numeric:normal;font-feature-settings:normal;text-align:start;writing-mode:lr-tb;text-anchor:start;stroke-width:1.11144626">PDF</tspan></text> </g></svg>',
	search: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="explore-search-btn tips" alt="Search" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>',
	filters: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" class="explore-filter-btn tips" alt="Show filters" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2h-11z" /></svg>',
	timeline: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="explore-timeline-btn tips" alt="Timeline" viewBox="0 0 16 16"><path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z"/><path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/><path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/></svg>',
	animate: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="explore-animate-btn tips" alt="Animate tracks" viewBox="0 0 16 16"><path d="M 13.206 7.5 L 4.5 2.4495 v 10.101 L 13.206 7.5 z m 1.188 -1.044 a 1.203 1.203 90 0 1 0 2.088 l -9.5445 5.538 C 4.0695 14.535 3 14.0175 3 13.038 V 1.962 c 0 -0.9795 1.0695 -1.497 1.8495 -1.044 l 9.5445 5.538 z"/></svg>',
	play: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="explore-play-btn" alt="Play" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>',
	pause: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="explore-pause-btn" alt="Pause" viewBox="0 0 16 16"><path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/></svg>',
	stop: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="explore-stop-btn" alt="Stop" viewBox="0 0 16 16"><path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/></svg>',
	stations: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid" width="18" height="23" viewBox="0 0 389.923 481.915"> <defs> <style>.cls-1 { stroke: #000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 20px; fill: none; fill-rule: evenodd; } </style> </defs> <path d="M358.000,145.000 L358.000,88.000 L280.000,88.000 L280.000,127.000 L270.000,127.000 L270.000,88.000 L197.000,88.000 L197.000,210.720 L280.003,455.303 L275.586,459.008 L232.000,330.572 L232.000,338.000 L197.000,338.000 L197.000,404.988 L187.000,404.988 L187.000,338.000 L150.007,338.000 L108.464,460.008 L103.997,456.274 L187.000,212.504 L187.000,88.000 L114.000,88.000 L114.000,127.000 L104.000,127.000 L104.000,88.000 L30.000,88.000 L30.000,152.000 L20.000,152.000 L20.000,20.000 L30.000,20.000 L30.000,78.000 L104.000,78.000 L104.000,40.000 L114.000,40.000 L114.000,78.000 L187.000,78.000 L187.000,57.012 L197.000,57.012 L197.000,78.000 L270.000,78.000 L270.000,40.000 L280.000,40.000 L280.000,78.000 L358.000,78.000 L358.000,20.000 L368.000,20.000 L368.000,78.000 L368.000,88.000 L368.000,145.000 L358.000,145.000 ZM197.000,328.000 L231.127,328.000 L197.000,227.438 L197.000,328.000 ZM187.000,229.355 L153.412,328.000 L187.000,328.000 L187.000,229.355 Z" transform="translate(10.96 10.96)" class="cls-1"/></svg>',
	station: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid" width="18" height="23" viewBox="0 0 389.923 481.915"> <defs> <style>.cls-1 { stroke: #000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 20px; fill: none; fill-rule: evenodd; } </style> </defs> <path d="M358.000,145.000 L358.000,88.000 L280.000,88.000 L280.000,127.000 L270.000,127.000 L270.000,88.000 L197.000,88.000 L197.000,210.720 L280.003,455.303 L275.586,459.008 L232.000,330.572 L232.000,338.000 L197.000,338.000 L197.000,404.988 L187.000,404.988 L187.000,338.000 L150.007,338.000 L108.464,460.008 L103.997,456.274 L187.000,212.504 L187.000,88.000 L114.000,88.000 L114.000,127.000 L104.000,127.000 L104.000,88.000 L30.000,88.000 L30.000,152.000 L20.000,152.000 L20.000,20.000 L30.000,20.000 L30.000,78.000 L104.000,78.000 L104.000,40.000 L114.000,40.000 L114.000,78.000 L187.000,78.000 L187.000,57.012 L197.000,57.012 L197.000,78.000 L270.000,78.000 L270.000,40.000 L280.000,40.000 L280.000,78.000 L358.000,78.000 L358.000,20.000 L368.000,20.000 L368.000,78.000 L368.000,88.000 L368.000,145.000 L358.000,145.000 ZM197.000,328.000 L231.127,328.000 L197.000,227.438 L197.000,328.000 ZM187.000,229.355 L153.412,328.000 L187.000,328.000 L187.000,229.355 Z" transform="translate(10.96 10.96)" class="cls-1"/></svg>',
	track: '<svg   xmlns:dc="http://purl.org/dc/elements/1.1/"   xmlns:cc="http://creativecommons.org/ns#"   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"   xmlns:svg="http://www.w3.org/2000/svg"   xmlns="http://www.w3.org/2000/svg"   version="1.1"   viewBox="0 0 23.052618 41.573452"   height="23"   width="18">  <defs     id="defs2">    <marker       style="overflow:visible"       id="marker1384"       refX="0"       refY="0"       orient="auto">      <path         transform="matrix(0.4,0,0,0.4,2.96,0.4)"         style="fill:#000000;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:1.00000003pt;stroke-opacity:1"         d="m -2.5,-1 c 0,2.76 -2.24,5 -5,5 -2.76,0 -5,-2.24 -5,-5 0,-2.76 2.24,-5 5,-5 2.76,0 5,2.24 5,5 z"         id="path1382" />    </marker>    <marker       style="overflow:visible"       id="DotM"       refX="0"       refY="0"       orient="auto">      <path         transform="matrix(0.4,0,0,0.4,2.96,0.4)"         style="fill:#000000;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:1.00000003pt;stroke-opacity:1"         d="m -2.5,-1 c 0,2.76 -2.24,5 -5,5 -2.76,0 -5,-2.24 -5,-5 0,-2.76 2.24,-5 5,-5 2.76,0 5,2.24 5,5 z"         id="path910" />    </marker>    <marker       style="overflow:visible"       id="DotL"       refX="0"       refY="0"       orient="auto">      <path         transform="matrix(0.8,0,0,0.8,5.92,0.8)"         style="fill:#000000;fill-opacity:1;fill-rule:evenodd;stroke:#000000;stroke-width:1.00000003pt;stroke-opacity:1"         d="m -2.5,-1 c 0,2.76 -2.24,5 -5,5 -2.76,0 -5,-2.24 -5,-5 0,-2.76 2.24,-5 5,-5 2.76,0 5,2.24 5,5 z"         id="path907" />    </marker>  </defs>  <g     transform="translate(-32.112052,-59.290716)"     id="layer1">    <path       d="M 34.395833,98.5625 52.916666,61.520831"       style="fill:none;stroke:#000000;stroke-width:1;stroke-miterlimit:3.29999995;stroke-dasharray:none;stroke-opacity:1;marker-start:url(#DotM);marker-end:url(#marker1384)" />  </g></svg>'
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

var default_startDate = new Date('2014-02-05'),
	default_endDate = new Date('2021-04-20');

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
	colour: ''
};
var URLdataType = null,
	URLmapType = null;

var isMobile = false;

var exploreType,
	mapType,
	dataType; // 'stations' or 'species'


function updateURL(reload) {

	var stateToPush = 'e=' + (exploreType) +
		'&d=' + (dataType),
		toEncode;

	for (f in motusFilter) {
		if (typeof motusFilter[f] !== 'undefined' && f != 'default') {
			if (motusFilter[f][0] != 'all' &&
				(f != 'dtStart' || motusFilter.dtStart.toISOString().substr(0,10) != default_startDate.toISOString().substr(0,10)) &&
				(f != 'dtEnd' || motusFilter.dtEnd.toISOString().substr(0,10) != default_endDate.toISOString().substr(0,10))
				) {
					if (['dtStart','dtEnd'].includes(f)) {
						toEncode = moment( motusFilter[f] ).toISOString().substr(0,10);
					} else  {
						toEncode = motusFilter[f];
					}
				if ( ['dtStart','dtEnd'].includes(f) || f == dataType || !( motusFilter.default && motusFilter.default[f] && motusFilter.default[f].sort().join(',') == motusFilter[f].sort().join(',') ) ) {
					stateToPush+='&'+f+'='+encodeURIComponent(toEncode);
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
		exploreType = url_params.e === undefined ? "main" : ["regions", "animals", "species", "stations", "projects"].includes(url_params.e) ? url_params.e : "main";
	}

	if (typeof dataType === "undefined") {
		// Define the main dataset being explore
		//  dataType defaults to null if not present in expected set of values
		dataType = url_params.d !== undefined && dataTypes.includes(firstToUpper(url_params.d)) ? url_params.d : 'stations';
	}

	if ( (typeof url_params.e !== 'undefined' && url_params.e !== exploreType) || (typeof url_params.d !== 'undefined' && url_params.d !== dataType ) ) {window.location.reload();}

	motusFilter = {
		dtStart: url_params.dtStart === undefined ? motusFilter.dtStart : moment(url_params.dtStart),
		dtEnd: url_params.dtEnd === undefined ? motusFilter.dtEnd : moment(url_params.dtEnd),
		species: url_params.species === undefined || url_params.species.length == 0 ? motusFilter.species : url_params.species.split(','),
		animals: url_params.animals === undefined || url_params.animals.length == 0 ? motusFilter.animals : url_params.animals.split(','),
		regions: url_params.regions === undefined ? ["all"] : url_params.regions.split(','),
		projects: url_params.projects === undefined ? ["all"] : url_params.projects.split(','),
		stations: url_params.stations === undefined ? ["all"] : url_params.stations.split(','),
		status: url_params.status === undefined ? ["all"] : url_params.status.split(','),
		frequencies: url_params.frequencies === undefined ? ["all"] : url_params.frequencies.split(','),
		colour: url_params.frequencies === undefined ? [] : url_params.colour
	};

	if (motusMap.setVisibility) {
		motusMap.setVisibility();
	}
}

var filePrefix;

$(document).ready(function(){

//	$('.explore-card-wrapper').css({'opacity':0});


	// Are we on a mobile device?
	isMobile = window.mobileCheck();

	//	Get URL parameters
	detectNavigation();

	// For Development:
	// get file prefix
	filePrefix = window.location.hostname == 'localhost' || window.location.hostname == 'leberrigan.github.io' ? 'data/' : window.location.hostname.includes('motus.org') ? "https://" + window.location.hostname + "/wp-content/uploads/2021/08/" : "https://" + window.location.hostname + "/wp-content/uploads/";

	// Change the document title based on the view and data type
	document.title = "Motus - " + (exploreType == 'main' ? ( "Explore" + firstToUpper(dataType) ) : ( firstToUpper(exploreType) + " summary" ) );

	// Capture any changes in URL
	window.onhashchange = detectNavigation;

	// For Development:
	// Fix Wordpress URL
	if (exploreType == 'main' && window.location.hostname != 'localhost' && window.location.hostname != 'leberrigan.github.io') {window.location.href="dashboard/#e=main&d="+dataType;}

	// Set the default start and end dates
	default_startDate = dtLims.min;
	default_endDate = dtLims.max;

	// Set the HTML structure of the page based on exploreType
	var HTML_dom = "<div class='title-wrapper'>"+
						//(exploreType == 'main' ? "<div class='title-header'>Explore "+firstToUpper(dataType)+"</div>" : "<div class='title-header'>Explore [NAME]</div>")+
						"<div id='explore_menu'>"+
							(dataTypes.map(x=>"<div class='explore-menu-item"+(x==firstToUpper((exploreType == 'main' ? dataType : exploreType))?" selected":"")+"' __data='"+(x.toLowerCase())+"'>"+(x=='Animals'?'Tracks':x)+"</div>").join(""))+
						"</div>"+
					"</div>"+
					"<div class='explore-card-wrapper' style='opacity:0;'>"+
						"<div class='explore-controls' id='explore_controls'>"+
							"<div class='explore-control-wrapper'></div>"+
						"</div>"+
						(
							["animals","stations","regions","projects","species"].includes(dataType) ? (

									(exploreType != 'main' || dataType == 'regions' ? "<div id='explore_card_map' class='explore-card explore-card-map'>" : "") +
										"<div id='explore_map'></div>" +
									(exploreType != 'main' || dataType == 'regions' ? "</div>" : "") +
									(exploreType != 'main'? `<div class='page-name'>${firstToUpper(dataType=='species'?dataType:dataType.substring(0, dataType.length - 1))} summary</div>` : "")

								) :	""
						)+
						(
						/*	["projects","species","regions"].includes(dataType) ?*/ "<div class='explore-table-wrapper'><table class='hover' id='explore_table' style='width:100%;'></table></div>" //: ""
						)
					"</div>";

	// Append the above HTML and then set the view class
	$("#exploreContent").append(HTML_dom).toggleClass('profiles', exploreType != 'main');//.toggleClass('data-summary', exploreType == 'main' && dataType == 'regions');

	// Set the click events for main menu
	$("#explore_menu .explore-menu-item").click(function(){

		// This should probably be done differently. #change

		// Record the current datatype
		var dataType_old = dataType;

		// Get the new datatype
		// This should be stored differently
		dataType = $(this).attr('__data');

		// Store the current explore view
		var exploreType_old = exploreType;

		// Set the explore view to 'main' (it defaults to this view when you click on the main menu)
		exploreType = 'main';

		// Refresh the page if the data type has changed (unless it was and is a table) or if the explore view has changed
		var refresh = exploreType_old != exploreType || (dataType_old != dataType && !( ['regions','projects','species'].includes(dataType_old) && ['regions','projects','species'].includes(dataType) ) );

		// Empty the motus filters
		// We should probably have an option here to maintain filters. #change
		motusFilter={};

		// Update the url
		updateURL( refresh );

		// If we're not refreshing, we'll make the selected menu item change and then transition to the new data
		if (!refresh) {

			// Set selected menu option
			$("#explore_menu .explore-menu-item.selected").removeClass("selected");
			$(this).addClass("selected");

			// Load the new data
			// This function needs to change. #change
			exploreSummaryTabSelect(dataType);

		}

	});

	// Load the data
	//	Now that we know what content to load and we have the dom to put it in, read in the required datasets
	loadMotusData();

});

// REMOVE
function setProgress(percent) {
}


// Loads all the data needed based on the dataType and your exploreView
function loadMotusData() {

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
			stationDeps: "https://sandbox.motus.org/data/dashboard/stationDeployments?fmt=csv", // All station deployments, including photo url
			recvDeps: filePrefix + "recv-deps.csv",	// All receiver deployments, including deployment country
			antennaDeps: "https://sandbox.motus.org/data/dashboard/antennaDeployments?fmt=csv", // All antenna deployments, including deployment country
			regions: filePrefix + "country-stats.csv", // Number of projects, stations, and tag deployments in each country
			polygons: filePrefix + "ne_50m_admin_0_countries.geojson", // GEOJSON dataset of country polygons. Includes ISO contry names and codes.
			tracks: filePrefix + "siteTrans_real2" + (window.location.hostname.indexOf('beta') != -1 ? '-2' : '') + ".csv", // All site transitions
			animals: "https://sandbox.motus.org/data/dashboard/tagDeployments?fmt=csv", // List of all species and various names/codes
			species: "https://sandbox.motus.org/data/dashboard/species?fmt=csv", // List of all species and various names/codes
			projects: "https://sandbox.motus.org/data/dashboard/projects?fmt=csv" // All projects, their codes, and descriptions
		};
	}

// Create an empty file list to be populated based on the dataType/exploreView

	var fileList = [];

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


	var promises = [];

	fileList.forEach(function(f){

		if (typeof allFiles[f] !== 'undefined') {
			var url = allFiles[f];
			url.substr(url.lastIndexOf('.') + 1, url.length) == 'csv' ? promises.push(d3.csv(url)) : promises.push(d3.json(url));
		}

	});

	Promise.all(promises).then(function(response){

		fileList.forEach(function(f, i){

			motusData[f] = response[i];

		});

		if (typeof motusData.animals !== 'undefined') {
			motusData.animals.forEach(function(x){
				x.dtEnd = x.dtEnd == "NA" ? moment().toISOString().substr(0, 10) : x.dtEnd;
				x.geometry = {coordinates: [+x.lon, +x.lat], type: "Point"};
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
			$.each( motusData.stationDeps, function() {
				if ( this.dtEnd == "NA" ) {
					this.dtEnd = moment().toISOString().substr(0,10);
				}
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
		console.log("Loaded " + Object.keys(motusData).length + " data set" + (Object.keys(motusData).length == 1 ? "" : "s"));

		readData();

	});
}
/*
function makeTimelineSVG() {

	$("#dateSlider").append("<svg id='activityTimeline' width='" + $("#explore_main_wrapper").innerWidth() + "'></svg>");

	var dateLimits = recvDepsLink.map(function(d){
		return {
			start: d.dtStart,
			end: d.dtEnd
		}
	});
	timeline.min = d3.min(dateLimits.map(d=>+d.start)) / 1000
	timeline.max = d3.max(dateLimits.map(d=>+d.end)) / 1000
	var timeLineRange = [
			{
				label: "",
				times: [
					{
						"starting_time": timeline.min * 1000,
						"ending_time": timeline.max * 1000
					}
				]
			}
		]


	var timeLineConstruct = d3.timeline()
		.tickFormat({
			format: d3.timeFormat("%Y-%m-%d"),
			tickTime: d3.timeDays,
			numTicks: 10,
			tickSize: 6})
		.margin({left: 0, right: 0, top: 0, bottom: 0});

	timeline.svg = d3.select("#activityTimeline")
		.datum(timeLineRange).call(timeLineConstruct);

}
*/
function readData() {

	populateExploreControls();


	if ( ["regions", "projects", "species"].includes(dataType) && exploreType == 'main' ) {
		//console.log(dataType);
			//		exploreSummaryTabSelect(dataType);
				/*
		$("#explore_controls .explore-summary-control-tab").click(function(){

			$("#explore_controls .explore-summary-selections input").hide();

			$("#explore_controls .explore-summary-control-tab").removeClass('selected');
			$(this).addClass('selected');

			var tabText = $(this).text().toLowerCase();
			var selectedTab = ["region", "project", "species"].filter(x=>tabText.indexOf(x) != -1)[0];

			exploreSummaryTabSelect(selectedTab);

		});*/
	}
	if (dataType == 'animals' || dataType == 'stations' || exploreType != 'main') {
		exploreTimeline({ min: dtLims.min.valueOf() / 1000,
											max: dtLims.max.valueOf() / 1000,
											defaultValues: [ motusFilter.dtStart.valueOf() / 1000, motusFilter.dtEnd.valueOf() / 1000 ] });
	}

	initiateTooltip();
	initiatePopup();

	initiateLightbox();


	populateSelectOptions();

//	dataType = 'species';
//	mapType = 'tracks';

	if (["stations","animals","regions", "species", "projects"].includes(dataType)) {
		exploreMap({containerID: 'explore_map'});
		setTimeout(function(){loadMapObjects();},1)
	} else {
		exploreTable({containerID: 'explore_table', name: dataType, data: motusData[dataType]});
	}

	//loadMapObjects({"tagDeps": subset});

	//loadMapData(['regions', 'stations', 'tagDeps', 'tracks'] , afterMapLoads);



}
function exploreSummaryTabSelect(selectedTab) {

	$("#explore_controls .explore-summary-selections span").text(`Select one or more ${selectedTab} below`);

		if (selectedTab == 'regions') {
			$("#explore_controls .explore-summary-selections button.multiSelect_btn:visible").hide();
			$("#explore_table:visible").hide();
			if ($.fn.DataTable.isDataTable("#explore_table")) {
				$("#explore_table").DataTable().clear().destroy();
			}

			$(".explore-card-map:hidden").show();
			$("#explore_map:hidden").show();
		} else {
			$("#explore_controls .explore-summary-selections button:not(.multiSelect_btn):visible").hide();
			$(".explore-card-map:visible").hide();
			$("#explore_map:visible").hide();

			if (selectedTab == 'regionTable') {

				var tbl = [ dataType, motusData.regions.filter( x => x.both != 0 ) ];

			} else if (selectedTab == 'projects') {

				var tbl = [selectedTab,Array.from(motusData.projects.map(function(d) {

					var stations = motusData.stationDepsByProjects.get(`${d.id}`);
					var animals = motusData.animalsByProjects.get(`${d.id}`);

					return {
						id: d.id,
						project_name: d.project_name,
						fee_id: d.fee_id,
						stations: typeof stations !== 'undefined' ? stations.length : 0,
						animals: typeof animals !== 'undefined' ? animals.size : 0
					};

				}).values())];

			}

			function loadTable(multi) {

				var opts = {
						select: {
							style: multi?"multi+shift":"single"
						},
						order: [[ multi ? 1 : 0, 'asc' ]],
						dom: '<"explore-table-header-controls"fi>lpti'

					};
				var cols = selectedTab == 'projects' ? ['id', 'project_name', 'fee_id', 'stations', 'animals'] :
									(selectedTab == 'regionTable' ? ['country', 'stations', 'animals'] :
																									['english', 'scientific', 'animals', 'projects', 'group', 'code', 'sort']);

				opts.columnDefs = [];

				if (selectedTab == 'species') {


					opts.order = [[6, 'asc']];
					opts.columns = [];

					for (var i in cols) {

						opts.columns.push({
							data: cols[i],
							title: dataColNames[selectedTab][cols[i]],
							createdCell: cols[i] == 'animals' ? function(td, cdata, rdata){
								$(td).html(`<a href='javascript:void(0);' class='tips' alt='View list of animals'>${rdata.animals.split(',').length}</a>`).css('text-align', 'center');
								} : cols[i] == 'projects' ? function(td, cdata, rdata){
								$(td).html(`<a href='javascript:void(0);' class='tips' alt='View list of projects'>${rdata.projects.split(',').filter(onlyUnique).length}</a>`).css('text-align', 'center');
							} : null,
							className: "",
				      searchable: i != 6,
	      			visible: !(i == 4 || i == 5 || i == 6),
							orderable: !(i == 4 || i == 5),
							orderData: i == 1 ? [6, 1] : i
						});
					}

					console.log(opts.columns);
				}

				if (multi) {

					opts.columnDefs.push({
							targets: 0,
							data: null,
							defaultContent: '',
							orderable: false,
							className: 'select-checkbox' });

				//	opts.select.selector = 'td:first-child';

					cols = [''].concat(cols);

					$("#explore_controls .explore-summary-selections button.multiSelect_btn:visible").hide();

				}
				loadDataTable(
					tbl,
					cols,
					opts,
					[{event: 'select', fun: onSelect},
					{event: 'deselect', fun: onSelect}]
				);
			}

			loadTable(false);

			$("#explore_controls .explore-summary-selections button.multiSelect_btn").show();

			$("#explore_controls .explore-summary-selections button.multiSelect_btn").click(function(){

				loadTable(true);
				$("#explore_table th.select-checkbox").on('click', selectAll);
				$(".explore-summary-control-options .explore-table-header-controls").remove();
				$(".explore-summary-" + selectedTab + "-control-options").append($(".explore-table-header-controls"));

			});

			$("#explore_table:hidden").show();

			$("#explore_table th.select-checkbox").on('click', selectAll);

			function selectAll() {

				$(this).closest("tr").toggleClass("selected");
				var table = $("#explore_table").DataTable();
				if( $(this).closest("tr").hasClass("selected")){
					table.rows({page: 'current'}).select();
				}
				else {
					table.rows({page: 'current'}).deselect();
				}

			}

			$(".explore-summary-selections .submit_btn").click(function(){
				var data = $("#explore_table").DataTable().rows( {selected: true} ).data();

				default_startDate = dtLims.min;
				default_endDate = dtLims.max;

				var dataVar = dataType == 'regions' ? 'ADM0_A3' : 'id';

				var selection = [];

				for (var i=0; i<data.length; i++) {
					selection.push(data[i][dataVar]);
				}

				viewProfile(dataType, selection);
			});
			$(".explore-summary-selections .reset_btn").click(function(){
				$("#explore_table").DataTable().rows().deselect();
			});
			$(".explore-summary-control-options .explore-table-header-controls").remove();
			$(".explore-summary-" + selectedTab + "-control-options").append($(".explore-table-header-controls"));

			function onSelect(e, dt, t, i) {
				var nSelected = $("#explore_table").DataTable().rows( {selected: true} ).count();
				if (nSelected > 0 && $("#explore_table td.select-checkbox").length == 0) {

			        var data = dt.rows( {selected: true} ).data();

					var dataVar = dataType != 'species' ? dataType != 'projects' ? 'ADM0_A3' : 'id' : 'id';

					var selection = data[0][dataVar];

					default_startDate = dtLims.min;
					default_endDate = dtLims.max;

				//	viewProfile(profileName, selection);

					loadOverlayPane( dataType, dataVar, selection );


				} else if (nSelected > 0) {
					$("#explore_controls .explore-summary-selections span").text(`${nSelected} ${(selectedTab=='species'?selectedTab:(nSelected == 1 ? selectedTab.slice(0,-1):selectedTab))} selected`);
					$("#explore_controls .explore-summary-selections button:not(.multiSelect_btn)").show();
				//	$("#explore_controls .explore-summary-selections button.multiSelect_btn:visible").hide();
				} else {
					$("#explore_controls .explore-summary-selections button:not(.multiSelect_btn)").hide();
				//	if (!$("#explore_table td.select-checkbox").length > 0) {
				//		$("#explore_controls .explore-summary-selections button.multiSelect_btn").show();
				//	}
					$("#explore_controls .explore-summary-selections span").text(`Select one or more ${selectedTab} in the table below`);
				}
			}
		}
		$("#explore_controls .explore-summary-control-options").hide();
		$("#explore_controls .explore-summary-" + selectedTab + "-control-options").show();

}



function loadOverlayPane( profileName, dataVar, selection ) {

	$('#explore_overlay').remove();

	$('body').append('<div id="explore_overlay"><div class="explore-overlay-content"></div></div>');

	if ($("#explore_overlay_bg").length == 0) {
		$('body').append('<div id="explore_overlay_bg"></div>');
		$("#explore_overlay_bg").click(closeExploreOverlay);
		console.log( profileName );
	}
	$("#explore_overlay_bg").fadeIn(100);

	var selected_row = motusData[profileName].filter( d => d[dataVar] == selection)[0];

	if (profileName == 'regions') {
		var cols = {'country':"header", 'code':'subheader', 'stations':"stat", 'animals':"stat"};

		selected_row.code = `CODE: "${selected_row.ADM0_A3}"`;

	} else if (profileName == 'species') {

		var cols = {'english':"header", 'scientific':"subheader", "group":"group"};

	} else if (profileName == 'projects') {
		var cols = {'project_name':"header", 'code':"subheader", 'created_dt':"data", 'fee_id':"group", 'description':"text"};

		selected_row.code = `CODE: "${selected_row.project_code}"`;

	}

	var vals = {};

	console.log(cols);

	Object.entries(cols).forEach(function(d){

		if (d[1] == 'stat') {selected_row[d[0]] = `${firstToUpper(d[0])}: ${selected_row[d[0]]}`;}

		if (selected_row[d[0]].length > 0) {
			$('#explore_overlay .explore-overlay-content').append(`<div class='explore-overlay-${d[1]}'>${selected_row[d[0]]}</div>`);
		}
	});

	$('#explore_overlay .explore-overlay-content').append("<div class='button_wrapper'><input type='button'  class='submit_btn' value='View summary' /><input type='button' class='close_btn' value='Close' /></div>");

	$("#explore_overlay .explore-overlay-content .submit_btn").click(viewExploreProfile);

	function viewExploreProfile() {	viewProfile(profileName, selection); }

	$("#explore_overlay .explore-overlay-content .close_btn").click(closeExploreOverlay);

	function closeExploreOverlay() { $("#explore_overlay_bg").fadeOut(100);$("#explore_overlay").remove(); }


}
function populateExploreControls() {

	var toAppend = [];

	if (exploreType != 'main') {
		toAppend = ["filters", "timeline", "animate", "search", 'pdf', 'share'];
	} else if ( ['regions', 'projects','species'].includes(dataType) ) {
		toAppend = ["type"];
		if (exploreType == 'main') {
//			$('#explore_controls').addClass('data-summary');
		}
	} else if (dataType == 'stations') {
		toAppend = ["filters", "timeline", "search", "edit", 'pdf', 'share'];
	} else if (dataType == 'animals') {
		toAppend = ["filters", "timeline", "animate", "search", "view", 'pdf', 'share'];
	}
	toAppend.push('help');

	if (toAppend.length > 0) {

		toAppend.forEach(function(x){

			var hasIcon = ( ! ( ['regions', 'projects','species'].includes(dataType) && exploreType == 'main' ) ) && x != 'view';

			$("#explore_controls > div").append(
				"<div class='explore-map-" + dataType + "-" + x + (hasIcon ? " toggleDisplay" : "") + "'>"+

					(hasIcon?icons[x]:"")+

					(hasIcon?'<div class="explore-control-hidden"'+(x=='filters'?' id="explore_filters"':'')+'>':"")+


					(
						x == 'view' ? (

							//dataType == 'stations_NULL' ? ("<select style='width:150px'><option>Active stations</option><option>Prospective stations</option><option>Rectangles</option><option>Circles</option></select>") :
							dataType == 'stations' ? ("<select style='width:200px' multiple='multiple'>"+
																						"<option selected='selected'>Active stations</option><option>Prospective stations</option><option>Regional coordination\n groups</option>"+
																				"</select>") :

							("<a href='javascript:void(0);' onclick='exploreControls(this);'>View " + (dataType == 'stations' ? "prospective stations" : "deployments")  + "</a>")

						) : (
						x == 'edit' ? "<label for='explore_controls_plan_layer_select'>Layers: </label><select id='explore_controls_plan_layer_select' style='width:200px' multiple='multiple'>"+
															"<option selected='selected'>Active stations</option><option>Prospective stations</option><option>Coordination regions</option><option>Antenna ranges</option>"+
													"</select>"+
													"<button onclick='$(this).siblings(\"select\").select2(\"open\");'>Add layer</button>"+
													"<button onclick='exploreMapAddStation()' class='submit_btn'>Add a prospective station</button>" :
						(
						x == 'pdf' ? "<input type='button' onclick='exploreControls(this.parentElement.parentElement);' value='Agree and Download' />" :
						(
							x == 'timeline' ?  "<div id='dateSlider'><div class='slider visible'><div id='custom-handle-1' class='ui-slider-handle'></div><div id='custom-handle-2' class='ui-slider-handle'></div></div></div>"  : (
									x == 'search' ? "<input type='text' /><input type='button' value='Search' />" :
									(
										x == 'type' ?
										(
											['regions', 'projects','species'].includes(dataType) ?
												"<div class='explore-summary-selections'>"+
													"<span></span> "+
													"<button class='multiSelect_btn'>Select multiple</button> "+
													"<button class='submit_btn'>Summarise these data</button>"+
													"<button class='reset_btn'>Clear selections</button>"+
												"</div>"+
												"<div class='explore-summary-regions-control-options explore-summary-control-options'>"+
													"<label for='explore_control_regions_type'>Mapping regions by: </label><select id='explore_control_regions_type' style='width:150px'>"+
													(["state/province", "country", "continent", "ecoregion", "BCR", "KBA", "Custom..."].map((x)=>"<option value='"+x+"'>"+firstToUpper(x)+"</option>"))+
													"</select>"+
													"<input type='button' onclick='exploreControls(this);' value='View as table' />"+
												"</div>"+
												"<div class='explore-summary-regionTable-control-options explore-summary-control-options'>"+
													"<label for='explore_control_regions_type'>List regions by: </label><select id='explore_control_regions_type' style='width:150px'>"+
													(["state/province", "country", "continent", "ecoregion", "BCR", "KBA", "Custom..."].map((x)=>"<option value='"+x+"'>"+firstToUpper(x)+"</option>"))+
													"</select>"+
													"<input type='button' onclick='exploreControls(this);' value='View as map' />"+
												"</div>"+
												"<div class='explore-summary-projects-control-options explore-summary-control-options'></div>"+
												"<div class='explore-summary-species-control-options explore-summary-control-options'></div>" : ""
										) : x == 'animate' ?
										(
											`<button class='animate-play tips' alt='Play'>${icons.play}</button>`+
											`<button class='animate-pause tips' alt='Pause'>${icons.pause}</button>`+
											`<button class='animate-stop tips' alt='Stop'>${icons.stop}</button>`
										) : x == 'share' ?
										(
											`<div class="fb-share-button" data-href="${window.location.href}"	data-layout="button"></div>`
										) : ""
									)
								)
							)
						)
						)
					)+

					(hasIcon?'</div>':"")+


				"</div>"
			);

		});
		//console.log($("#explore_controls > div").html());
	}

	$("#explore_controls .animate-play").click(function(){animateTimeline($("#dateSlider").get(0));});

	$("#explore_controls select").select2({
		matcher: function(params, data) {
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
		templateResult: function (data, container) {
			if (data.element) {
				$(container).addClass($(data.element).attr("class"));
			}
			return data.text;
		},
		placeholder: function(){return $(this).data('placeholder');},
	}).change(function(){exploreControls(this);});

	$("#explore_controls .toggleDisplay svg").click(function(){

		$(this).parent().toggleClass('selected').siblings('.toggleDisplay.selected').toggleClass('selected');

		if ($(this).parent().hasClass(`explore-map-${dataType}-edit`)) {
			exploreMapEditor();
		}

	});

}
function exploreControls(el, opt) {
	opt = typeof opt === 'undefined' ? $(el).closest('div:not(.explore-control-hidden)').attr('class').split(' ')[0].split('-').pop() : opt;
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

					vals.push( $(this).children("span").text() );
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
												.filter((d,i) => [1,2,3,4,5,8].includes(i)) // Select which columns to use
												.map( (d, i) => i == 1 ? d.toISOString().substr(0,10) : (i == 2 ? `${(moment().diff(d, 'day') < 1 ? "Active" : "Ended on: " + d.toISOString().substr(0,10) )}` : d)
												)
											),
						cols: $("#explore_card_stationHits table.explore-card-stationHits-table th").map(function(){return $.trim($(this).text());}).get().filter((d,i) => i > 0),
						colWidths: [4,2,2,1,1,3]
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
												.filter((d,i) => [2,5,6].includes(i)) // Select which columns to use
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
function afterMapLoads() {

	if (exploreType == 'main') {

		$("#explore_controls .explore-control-tab").click(function(){

			$("#explore_controls .explore-control-tab").removeClass('selected');
			$(this).addClass('selected');

		});

		if ( ["regions", "projects", "species"].includes(dataType) ) {
			console.log(dataType);
			exploreSummaryTabSelect(dataType);
		}
/*
		if (dataType == 'regions') {

			$("#explore_map").hide();
			$("#explore_controls .explore-summary-control-options").hide();
		}*/

	} else {

		if (exploreType == 'regions') {


			exploreSummary({summaryType: "regions"});
	//		exploreRegions(motusFilter.regions);


		}
		else if (exploreType == 'projects') {

			exploreSummary({summaryType: "projects"});
//			exploreProjects(motusFilter.projects);
		}
		else if (exploreType == 'stations') {
				console.log(motusFilter[dataType]);
					exploreSummary({summaryType: "stations", selectedStations: motusFilter.stations});
//			exploreStations(motusFilter.stations);
		}
		else if (exploreType == 'species') {

					exploreSummary({summaryType: "species"});
//			exploreStations(motusFilter.stations);
		}
		else if (exploreType == 'animals') {

					console.log(motusData);
					console.log(motusFilter);
					exploreSummary({summaryType: "animals"});
//			exploreStations(motusFilter.stations);
		}
		else {
			addExploreCard({data:'chart', type:'barChart'});
			addExploreCard({data:'chart', type:'detectionTimeline'});

			loadDataTable(['animals','species'].includes(exploreType) ? 'tagDeps' : exploreType);

			addExploreCard({data:'add'});

			updateURL();

			updateData();
		}
	}


	$('.explore-card-wrapper').animate({'opacity':1}, 500);

}
function exploreTable(opts) {

	$("#" + opts.containerID).append("<div class='" + opts.containerID.replace('_','-') + "-wrapper'><table id='" + opts.containerID + "_" + dataType + "'><thead><tr>"+
									 (Object.keys(opts.data[0]).map(x=>"<th>"+dataColNames[opts.name][x]+"</th>").join(""))+
									 "</tr></thead><tbody></tbody></table></div>")

	opts.data.forEach(function(d){

		var toAppend = "<tr>";

		Object.values(d).forEach(x=>(toAppend+="<td>"+x+"</td>"));

		$("#" + opts.containerID + "_" + dataType + " tbody").append(toAppend + "</tr>");

	});
	$("#" + opts.containerID + "_" + dataType).DataTable({
		dom: '<"#explore_table_controls"lf><ip><rt>'
	});

	$("#explore_controls > div").append($("#explore_table_controls > div"))

	/*
	$("#" + opts.containerID).append("<div class='" + opts.containerID + "-wrapper'><table id='" + opts.containerID + "_" + dataType + "'></table></div>");
	$("#" + opts.containerID + "_" + dataType).DataTable({
		data: opts.data,
		columns: Object.keys(opts.data[0])
	})
	*/

	$('.explore-card-wrapper').animate({'opacity':1}, 500);
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
		for (const [name, d] of motusData.stationDepsByName.entries()){

			filters.options.stations[d[0].id] = [name, d[d.length-1].status != 'active' ? 'inactive' : 'active'];

		};
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

						return "<div"+classes+">"+(x == 'dates' ? "<input " : "<select ")+" id='filter_"+x+"' class='filter_"+x+"'"+(x == 'dates' ? '>' : "' multiple='multiple' "+(x == 'status' ? " style='width:150px' " : x == 'frequencies' ? " style='width:170px' " : "")+"data-placeholder='All "+x+"'><option value='all'></option></select>") + "</div>";

					}).join(""));

	$(exploreType == 'main' ? "#explore_filters" : "#explore_filters").append(toAppend);

	$(exploreType == 'main' ? "#explore_filters" : "#explore_filters").parent().prepend("<div class='filter_status'>Showing <span></span> of <span></span> " + ( dataType == 'animals' ? 'tracks' : dataType ) + "</div>");

	if (motusData.nTracks) {$("#explore_filters").siblings('.filter_status').find('span:eq(1)').text(motusData.nTracks);}
	else if (dataType == 'stations') {$("#explore_filters").siblings('.filter_status').find('span:eq(1)').text(motusData.stationDeps.length);}

	$("#explore_filters").after("<div class='filterButton clear-filters' alt='Clear filters'>Clear filters"+'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>'+"</div>");

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
		matcher: function(params, data) {
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
		templateResult: function (data, container) {
			if (data.element) {
				$(container).addClass($(data.element).attr("class"));
			}
			return data.text;
		},
		placeholder: function(){return $(this).data('placeholder');},
	}).change(setFilter);
	//console.log(timeline);
	$("#explore_filters input.filter_dates").daterangepicker({
		opens: 'left',
		minDate: moment.unix(timeline.min),
		maxDate: moment(),
		startDate: motusFilter.dtStart,
		endDate: motusFilter.dtEnd,
		locale: {
			format: "YYYY/MM/DD"
		},
        ranges: {
           'Today': [moment(), moment()],
           'Past 7 days': [moment().subtract(6, 'days'), moment()],
           'Past 30 days': [moment().subtract(29, 'days'), moment()],
           'Past 6 months':  [moment().subtract(6, 'months'), moment()],
           'Past year': [moment().subtract(1, 'year'), moment()],
           'Past 3 years': [moment().subtract(3, 'years'), moment()],
           'All time': [moment.unix(timeline.min), moment()],
           //'This Month': [moment().startOf('month'), moment().endOf('month')],
           //'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
	}, function(start, end, label) {

		timeline.setSlider( [ start.unix(), end.subtract(12, 'hours').unix()], true, false );
		//timeline.setSlider( [ start.unix(), end.diff(start, 'days') > 0 ? end.unix() : start.unix() ] );
		motusMap.setVisibility();

	});
}


function loadDataTable(tbl, columns, options, onEvent) {

	/*

		This function loads a data table into a single element. It will reload data in this element each time it is run.
		tbl = name of the table you want to display
		filterVar = name of the variable you want to filter by

	*/

	if (typeof tbl === 'undefined') {
		tbl = dataType;
	}

	if (typeof tbl !== 'string') {
		var dataset = tbl[1];
		tbl = tbl[0];
	} else {
		var dataset = motusData[tbl];
	}

	if ($("#explore_table").length == 0) {
		$("#exploreContent").append('<div class="explore-table-wrapper"><table id="explore_table" style="width:100%"></table></div>');
	}

	console.log(columns);
	if (typeof options.columns === "undefined") {
		var columnNames = columns.filter(x=>x==="").concat(Object.keys(dataset[0]).filter(x => typeof columns === 'undefined' || columns.includes(x)));

		var columns = [];
		console.log(tbl);
		console.log(columnNames);

		for (var i in columnNames) {
			columns.push({
				data: columnNames[i],
				title: dataColNames[tbl][columnNames[i]],
				className: ""
			});
		}
	}
	if ($.fn.DataTable.isDataTable("#explore_table")) {
		$("#explore_table").DataTable().clear().destroy();
	}

	$("#explore_table").html("");
	console.log(options);
	if (typeof options.columns !== 'undefined') {
		options = {
			...{
				data: dataset
			},
			...options
		};
	}
	if (typeof options !== 'undefined') {
		options = {
			...{
				data: dataset,
				columns: columns
			},
			...options
		};
	} else {
		options = {
			data: dataset,
			columns: columns
		};
	}
	console.log(options);

	var table = $("#explore_table").DataTable(options);

	if (typeof onEvent !== 'undefined') {
		if (typeof onEvent.length !== 'undefined') {
			onEvent.forEach(x => table.on(x.event, x.fun));
		} else {
			table.on(onEvent.event, onEvent.fun);
		}
	}

	if (exploreType != 'main') {
		motusFilter[exploreType].forEach(function(f) {addProfile(f, tbl)});
	} else {
		return false;
	}
}

function addProfile(profile_id, dataset) {

		dataset = typeof dataset === 'undefined' ? (exploreType == 'species' ? 'tagDeps' : exploreType) : dataset;

		var filterName = exploreType != 'species' && exploreType != 'regions' ? (exploreType != 'species' ? 'id' : 'id') : exploreType;


		if (dataset == 'stations') {
			/*
			if (typeof filters.options.stations[profile_id] === 'undefined') {
				profile_id = motusData.stationDepsByName.get(motusData.stationDeps.filter(x=>x.id==profile_id)[0].name)[0].id;
				//console.log(profile_id);
			}

			var stationName = filters.options.stations[profile_id][0];
			var subset = motusData.stationDepsByName.get(stationName);*/
			motusFilter = { stations: motusFilter.stations.concat([profile_id]).filter(onlyUnique) };

			updateURL(true);

		} else if (dataset == 'projects') {

			motusFilter = { projects: motusFilter.projects.concat([profile_id]).filter(onlyUnique) };
			updateURL(true);

		} else if (dataset == 'regions') {
			motusFilter = { regions: motusFilter.regions.concat([profile_id]).filter(onlyUnique) };
			updateURL(true);
			return;
		} else {
			var stationName = filters.options[exploreType][profile_id];
			var subset = motusData[dataset].filter(function(d){

				return profile_id == d[filterName];

			});
		}

		if (subset.length > 0) {

			var status = ( exploreType == 'species' ? {
														animals: [subset.length],
														projects: [subset.map(x => x.projID).filter(onlyUnique).length],
														stations: [96],
														conservation: ['NT',"Near-threatened"]
													}
					   : ( exploreType == 'animals' ? {
														species: [subset.length],
														projects: [subset.map(x => x.projID).filter(onlyUnique).length],
														stations: [96],
														conservation: ['NT',"Near-threatened"]
													}
					   : ( exploreType == 'stations' ? {
														animals: [d3.sum(subset, d => d.nAnimals)],
											//			projectID: [subset[0].projID],
														species: [d3.sum(subset, d => d.nSpp)],
														lastData: [Math.round( subset[subset.length-1].lastData )],
														status: [subset[subset.length-1].status]
													}
					   : 							{
														animals: [subset[0].nAnimals],
														projectID: [subset[0].projID],
														species: [subset[0].nSpp],
														lastData: [Math.round( subset[0].lastData )]
													}
						)	)	)

			// Photos: my thought here is that eventually we'd have default photo for each species.
			// 		- Perhaps some day we users could upload an image for a deployment and it would replace this default.


			addExploreCard({
				data: subset,
				id: profile_id,
				name: stationName,
				status: status,
				photo: exploreType == 'species' ? 'https://i.postimg.cc/jdFJcfF1/Screenshot-2020-11-10-110730.png' : 'https://i.postimg.cc/2yLppgyn/20190717-130907-1.jpg'
			});

			updateData();

		} else {
			console.warn(firstToUpper(exploreType) + ' ' + filterName + ' ' + profile_id + ' could not be found!');

		}

		$("body").trigger('click');
}


function addExploreCardProfile(profile) {

	// Profile = {id, label, data: [ {type, label, value}, ... ] }

	// define the profile DOM structure
	var struct = "grid";
  var data = profile.data.filter(d => d.value > 0 || profile.data.length <= 4).map((d, i) => `<div class='explore-card-profile-data explore-card-data${i + 1}' onclick='showProfileData("${profile.id}", "${d.type}")'>${d.icon}<span>${d.value}</span><div class='explore-card-data-label'>${d.label}</div></div>`);

	console.log(profile.data)
	console.log(data)
	var toAppend = `<div class='explore-card-profile ${struct}-container' id='explore_card_profile_${profile.id}'>`+
										`<div class='explore-card-image tips enlarge' alt='Click to expand'></div>`+
									 	`<div class='explore-card-name'><div style='font-size:${24 - (Math.floor(profile.label.length/15)*2)}pt;'>${profile.label}</div></div>`+
										 data.join('')+
									"</div>";


	$("#explore_card_profiles").prepend(toAppend);

}

function showProfileData(profileID, varName) {

	console.log("ProfileID: %s, varName: %s", profileID, varName);

	$(`.explore-card-profiles-tabs .explore-card-${varName == 'animals' || varName == 'species'? 'speciesHits' : varName == 'stations' ? 'stationHits' : varName == 'countries' ? 'map' : varName == 'detections' ? 'tagHits' : varName == 'projects' ? 'projectsTable' : varName }-tab`).click();

}

function addExploreCard(card) {


	if (typeof card.data === 'object') {

		if ($("#explore_card_profile_" + card.id).length == 0) {

			if ($("#explore_card_profiles").length == 0) {

				var profiles_header = "";

				var headers = (exploreType == 'species' ? ['Name', 'Animals', 'Projects', 'Stations', 'Conservation Status'] :
				(exploreType == 'regions' ? ['Name', 'Animals', 'Species', 'Projects', 'Stations'] :
				(exploreType == 'projects' ? ['Name', 'Animals', 'Countries', 'Species', 'Stations'] : ['Name', 'Animals', 'Species', 'Last data', 'Status'])));

			//	headers.forEach(function(x){profiles_header += "<div class='explore-card-stats-"+(x.toLowerCase().replace(' ',''))+"'>"+x+"</div>";});
				headers.forEach(function(x){profiles_header += "<th class='"+(x.toLowerCase().replace(' ','-'))+"'>"+x+"</th>";});


				$("#exploreContent .explore-card-wrapper").append("<div class='explore-card' id='explore_card_profiles'><div class='explore-card-add explore-card-"+exploreType+"' alt='Add a "+exploreType+"'><select class='explore-card-add-"+exploreType+"' data-placeholder='Select a "+exploreType+"' style='width:300px;'><option></option></select></div><div class='explore-card-profiles-toggles'></div></div><div class='explore-card-profiles-tabs'><div class='expand-menu-btn'>"+icons.expand+"</div></div>");


// OLD				$("#exploreContent .explore-card-wrapper").append("<div class='explore-card' id='explore_card_profiles'><div class='explore-card-profiles-name'>"+icons[exploreType]+"&nbsp;&nbsp;&nbsp;"+card.name+"</div><table><thead><tr class='explore-card-profiles-header'>"+profiles_header+"<th></th></tr></thead><tbody class='explore-card-profiles-wrapper'></tbody></table><div class='explore-card-add explore-card-"+exploreType+"' alt='Add a "+exploreType+"'><select class='explore-card-add-"+exploreType+"' data-placeholder='Select a "+exploreType+"' style='width:300px;'><option></option></select></div><div class='explore-card-profiles-toggles'></div><div class='explore-card-profiles-tabs'><div class='expand-menu-btn'>"+icons.expand+"</div></div></div>");



			//	$("#exploreContent .explore-card-wrapper").append("<div class='explore-card' id='explore_card_profiles'><div class='explore-card-profiles-name'>"+card.name+"</div><div class='explore-card-profiles-header'>"+profiles_header+"<th></th></tr></thead><tbody class='explore-card-profiles-wrapper'></tbody></table>"+
		//		"<div class='explore-card-add explore-card-"+exploreType+"' alt='Add a "+exploreType+"'><select class='explore-card-add-"+exploreType+"' data-placeholder='Select a "+exploreType+"' style='width:300px;'><option></option></select></div><div class='explore-card-profiles-toggles'></div><div class='explore-card-profiles-tabs'><div class='expand-menu-btn'>"+icons.expand+"</div></div></div>");
				/*$(".explore-card-profiles-controls").append("<button class='explore-card-more-details'>More details</button>"+
																										"<button class='explore-card-profiles-download-pdf'>Download PDF report</button>"+
																										"<button class='explore-card-profiles-download-csv'>Download summary data</button>");
				$(".explore-card-profiles-download-pdf").click(function(){$(".explore-map-"+dataType+"-pdf input[type=button]").trigger('click');});
				$(".explore-card-more-details").click(function(){detailedView=true;exploreRegions(motusFilter.regions)});
				*/
				addExploreTab('explore-card-map', 'Map', {selected: true, icon: icons.map});
				addExploreTab('explore-card-profiles-download-pdf', 'Download report', {click:function(){$(".explore-map-"+dataType+"-pdf input[type=button]").trigger('click');}, noToggle:true, icon: icons.download});

				if (["stations","regions","projects"].includes(dataType)) {

					var toggleText = dataType == "stations" ? `Animals tagged near this ${dataType.slice(0,-1)} only` : `Animals tagged in this ${dataType.slice(0,-1)} only`;

					$("#exploreContent .explore-card-profiles-toggles").append(`<button class='toggleButton'>${toggleText}</button>`);

					$("#exploreContent .explore-card-profiles-toggles .toggleButton").click(function(e){$(this).toggleClass('selected');setFilter.call(this, e);});

				}

				$("#exploreContent .explore-card-profiles-tabs .expand-menu-btn").click(function(){$(this).parent().toggleClass('expanded');});

			}

			var profile = {id: card.id, label: card.name, photo: card.photo, data: []};

			var toAppend = "<tr class='explore-card-profile' id='explore_card_profile_" + card.id + "'>"+
								"<td class='explore-card-header'>" +
									"<div class='explore-card-image tips enlarge' alt='Click to expand'></div>"+
									"<div class='explore-card-name'>"+card.name +"</div>"+
								"</td>";


						//		"<td class='explore-card-status'>";

			for (s in card.status) {


				var title = s == 'conservation' ? 'Conservation<br>status' :
						   (s == 'lastData' ? 'Last Data' :
						   (s.indexOf('ID') != -1 ? s.replace('ID', ' ID') : firstToUpper(s.replace('Det', ' Det').replace('Tag', ' Tag').replace('Seg', ' Seg'))));

				var icon = icons[ s.replace('Detected', '').replace('Tagged', '').replace('Segments', '') ];

				var statusText = card.status[s][0];
				statusText = s == 'status' ? (statusText != 'active' ? 'Inactive' : 'Active') : statusText;

				profile.data.push( { type: s.replace('Detected', '').replace('Tagged', '').replace('Segments', ''), label: title, icon: icon, value: statusText } );

				toAppend += "<td><div class='status-icon status-icon-" + s + (s == 'conservation' ? ' tips' : (s == 'status' ? ' status-icon-'+(statusText.toLowerCase()) : '')) + "'>"+ icon +"<div>"+ statusText + (s == 'lastData' ? '<div>days</div>' : '') + "</div></div></td>";
			}


			toAppend += "<td class='explore-card-options'>"+
			//toAppend += "</td><td class='explore-card-options'>"+
							"<div class='explore-card-remove explore-card-subtext' alt='Remove "+exploreType+"'>"+'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/></svg>'+"</div></td>"+
						"</tr>";

			toAppend += "<tr></tr>";

//			$("#explore_card_profiles .explore-card-profiles-wrapper").append(toAppend);
			addExploreCardProfile(profile);

		//	if ($(".explore-card-add").length > 0) {$(".explore-card-add").before(toAppend);}

		//	else {$(".explore-card-map").before(toAppend);}

			card.el = $("#explore_card_profile_" + card.id).get(0);
			/*
			if ($.fn.DataTable.isDataTable("#explore_table")) {
				$("#explore_card_profiles table").DataTable().clear().destroy();
			}*/

			if (card.photo == "") {
				$("#explore_card_profile_" + card.id).addClass("no-photo")
				.find(".explore-card-image")
				.click(function(){
						if ($("#explore_card_profiles").hasClass('solo-card')) {
							$("#exploreContent .explore-card-add").click();
						} else {
							viewSolo(card.id);
						}
				});
			//	$("#explore_card_profile_" + card.id).addClass("no-photo");
			} else {
				$("#explore_card_profile_" + card.id + " .explore-card-image")
					.css("background-image", "url(" + card.photo + ")")
					.click(function(){
						if ($("#explore_card_profiles").hasClass('solo-card')) {
							initiateLightbox(this);
						}	else {
							viewSolo(card.id);
						}
				});
			}

			$("#explore_card_profile_" + card.id + " .explore-card-remove").click(function(){removeExploreCard(this, exploreType)});

	//		console.log(card.status);

			for (i in card.status) {

				var text = String(card.status[i][0]);


				var adjustedFontSize = 15 - text.length;
				var adjustedPadding = [(8 + text.length), (16 - (text.length * 3))];
				var adjustedWidth = 40 - (adjustedPadding[1] * 2);
				var adjustedHeight = 40 - (adjustedPadding[0] * 2);

				//$("#explore_card_profile_"+card.id+" .status-icon-" + i).text(text);
				if (i == 'conservation') {
				//	$("#explore_card_profile_"+card.id+" .status-icon-" + i).css({fontSize: adjustedFontSize + 'pt', padding: adjustedPadding[0]+"px "+adjustedPadding[1] + "px", width: adjustedWidth+'px', height: adjustedHeight+'px'});
					$("#explore_card_profile_"+card.id+" .status-icon-" + i).css({fontSize: adjustedFontSize + 'pt', padding: adjustedPadding[0]+"px "+adjustedPadding[1] + "px", width: adjustedWidth+'px', height: adjustedHeight+'px'});
				}
				if (card.status[i][1] != undefined) {

					$("#explore_card_profile_"+card.id+" .status-icon-" + i).addClass('status-icon-' + (card.status[i][1].replace(' ', '-').toLowerCase())).attr('alt', card.status[i][1]);

				}
			}


			if (motusFilter[exploreType][0] === 'all') {motusFilter[exploreType] = [];}

			motusFilter[exploreType].push(String(card.id));
			motusFilter[exploreType] = motusFilter[exploreType].filter(onlyUnique);

			//if (typeof motusMap.setVisibility !== 'undefined') {motusMap.setVisibility();}

			if ($("#exploreContent .explore-card-profile").length == 1) {
				$("#explore_card_profiles").addClass('solo-card');
				try { motusMap.setColour('id'); }
				catch(err) { console.log("motusMap not yet created"); }
			} else {
				$("#explore_card_profiles").removeClass('solo-card');
				try { motusMap.setColour('species'); }
				catch(err) { console.log("motusMap not yet created"); }
			}
		} else {
			$("#explore_card_profile_" + card.id).addClass('flash')
			setTimeout('$("#explore_card_profile_' + card.id + '").removeClass("flash");',250);
		}
	}
	else if (card.data == 'custom') 	{
		var toAppend = "<div class='explore-card explore-card-"+card.type+"' id='explore_card_"+card.type+"'>"+card.html+"</div>";
		if (card.attachEl) {
			$(card.attachEl)[card.attachMethod](toAppend);
		} else {
			$(".explore-card-wrapper").append(toAppend);
		}
	}
	else if ( card.data == 'tabs' ) {

		// If a default is set use that one, otherwise use the first
		var selectedTab = ( typeof card.defaultTab !== 'undefined' ) ?  Object.keys(card.tabs)[card.defaultTab] : Object.keys(card.tabs)[0];

		// Make the header with a select input instead of plain text
		var exploreCardHeader = $("<div class='explore-card-header'><select style='width:100%;'></select></div>");

		if (Object.keys(card.tabs).length > 1) {
			// Add an option for each tab
			for (t in card.tabs) {
				exploreCardHeader.find('select').append( $("<option></option>").val(t).text(t).attr('selected', (selectedTab == t ? 'selected' : false) ) );
			}
		} else {
			exploreCardHeader.find('select').after(`${Object.keys(card.tabs)[0]}`);
			exploreCardHeader.find('select').remove();
		}
		// Make the explore card and append the header to it
		var exploreCard = $("<div></div>")
			.addClass("explore-card explore-card-" + card.data)
			.attr('id', 'explore_card_' + card.type)
			.append( exploreCardHeader );

		if (typeof card.colSpan !== 'undefined') {
			exploreCard.addClass('explore-card-full-width');
		}

		// Append the explore card to the wrapper
		if ( card.attachEl ) {
			$( card.attachEl )[ card.attachMethod ]( exploreCard );
		} else {
			$(".explore-card-wrapper").append( exploreCard );
		}

		// Make select in header a select2 object
		$('#explore_card_' + card.type + ' .explore-card-header select').select2()
			.change(switchTabs);

		function switchTabs() {card.tabs[this.options[this.selectedIndex].value](card.type);}

		console.log("card");
		console.log(card);

		card.icon = typeof card.icon === 'undefined' ? icons[card.header.toLowerCase().split(' ')[0]] : card.icon;

		addExploreTab('explore-card-' + card.type, card.header, {icon: card.icon, insertAfter: 'explore-card-map-tab', card: card, selectedTab: selectedTab});

//		card.tabs[ selectedTab ]( card.type );

		exploreCard.hide();

	}
	else if (card.data == 'chart') {

		var toAppend = "<div class='explore-card explore-card-"+card.data+"' id='explore_card_"+card.type+"'><div class='explore-card-header'></div><div class='explore-card-chart-wrapper'><div><svg></svg></div></div></div>";

		$(".explore-card-wrapper").append(toAppend);

		/*

		var selections = [];

		var selectedVar = 'tags';

		motusFilter[exploreType].forEach(function(id){
			selections.push({
				name: $("#explore_card_profile_" + id + " .explore-card-header").text(),
				value: $("#explore_card_profile_" + id + " .status-icon-" + selectedVar + " > div").text(),
				colour: $("#explore_card_profile_" + id + " .explore-card-image").css("border-left-color")
			});
		});
		console.log(selections);

		drawExploreChart({type:'barChart',data: selections});*/

	}
	else if (card.data === 'add') {
		//$("#exploreContent .explore-card-map").append("<div class='explore-card explore-card-add tips' alt='Add a "+exploreType+"'><select class='explore-card-add-species' data-placeholder='Select a "+exploreType+"' style='width:200px;'><option></option></select></div>")


		card.el = $("#exploreContent .explore-card-add").get(0);
		//console.log(filters.options[exploreType]);
		if (exploreType == 'stations') {
			for (d in filters.options[exploreType]) {
				$("#exploreContent .explore-card-add-" + exploreType).append('<option value="' + d + '" class="filter-option-' + filters.options[exploreType][d][1] + '">' + filters.options[exploreType][d][0] + '</option>');
			}
		} else {
			for (d in filters.options[exploreType]) {
				$("#exploreContent .explore-card-add-" + exploreType).append('<option value="' + d + '">' + filters.options[exploreType][d] + '</option>')
			}
		}
		$("#exploreContent .explore-card-add").click(function(e){
			e.stopPropagation();
			if (!$(this).hasClass('visible') && !$('#explore_card_profiles').hasClass('view-solo')) {
				$(this).addClass('visible');
				$('body').click(function(){$("#exploreContent .explore-card-add").removeClass('visible');$(this).unbind('click');});
				$("#exploreContent .explore-card-add > select").select2("open");
			} else if ($('#explore_card_profiles').hasClass('view-solo')) {
				$('#explore_card_profiles').removeClass('solo-card view-solo');
				$('.explore-card-profile').show();
			}
		});

		$("#exploreContent .explore-card-add-" + exploreType).select2({
			matcher: function(params, data) {
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
			templateResult: function (data, container) {
				if (data.element) {
					$(container).addClass($(data.element).attr("class"));
				}
				return data.text;
			},
			placeholder: function(){return $(this).data('placeholder');},
		}).change(function(f) {addProfile(this.options[this.selectedIndex].value);});

	}

	initiateTooltip(card.el);

	//updateURL();

}


function addExploreTab(el, header, opts = {}) {

	var tab = $(`<div class='${el}-tab explore-card-tab'>${header}</div>`);

	if (!opts.click) {

		if (typeof opts.card !== 'undefined') {
			var data = {fnc: opts.card.tabs[ opts.selectedTab ], arg: opts.card.type};
		}

		tab.click(data, function(e) {

			var elID = this.className.split(' ')[0].replace(/-/g,'_').replace(new RegExp("_tab$"),'');

			if ($(`#${elID}`).is(":hidden")) {
				console.log(`#${elID}`);
				$(".explore-card:not(#explore_card_profiles):visible").hide();

				$(`#${elID}`).show();

				// Create content on first click
				if ($(`#${elID} div:not(.explore-card-header)`).length == 0 && $(`#${elID} table`).length == 0) {
					e.data.fnc( e.data.arg );
				}

				// Redraw tables on subsequent clicks
				if ($(`#${elID} table`).length > 0) {
					console.log('Redrawing table')
					$(`#${elID} table`).DataTable().columns.adjust().draw();
				}
			}
		});
	} else {
		tab.click(opts.click);
	}


	if (opts.icon) {
		tab.prepend(opts.icon);
	}
	if (!opts.noToggle) {
		tab.click(function(){$(this).toggleClass('selected',true);$(this).siblings().removeClass('selected');if ($(this).siblings('.expand-menu-btn').is(":visible") && $(this).parent().is(".expanded")) {$(this).siblings('.expand-menu-btn').trigger('click')}})
	}
	if (opts.insertAfter) {
		$(".explore-card-profiles-tabs ." + opts.insertAfter).after(tab);
	} else {
		$(".explore-card-profiles-tabs").append(tab);
	}
	if (opts.selected) {tab.trigger('click');}
}


function removeExploreCard(el, filterType) {

	var cardID = $(el).closest('.explore-card-profile').attr('id').replace('explore_card_profile_', '');

	$(el).closest('.explore-card-profile').remove();

	motusFilter[exploreType] = motusFilter[exploreType].filter(function(x){return x != cardID;});
	if ($("#exploreContent .explore-card-profile").length == 0) {
		$(".explore-card-add").trigger('click');
	} else {
		if (exploreType == 'regions') {updateURL(true);}

		if ($("#exploreContent .explore-card-profile").length == 1) {
			$("#explore_card_profiles").addClass('solo-card');
			//motusMap.setColour('id');
		}
	}
	motusMap.setVisibility();
	updateData();
}
function setCardColours(colourFun) {

	$("#explore_card_profiles .explore-card-profile").each(function(){
	//	if ($("#explore_card_profiles .explore-card-profile").length == 1) {
	//		$(this).find('.explore-card-image').css('border-color', "#000000");
	//	} else {
			 var colour = exploreType == 'stations' ? colourFun($(this).find(".explore-card-name").text()) : exploreType == 'regions' ? colourFun( this.id.replace("explore_card_profile_", "") ) : colourFun(parseInt(this.id.replace("explore_card_profile_", "")));

			 $(this).find('.explore-card-image').css({'border-color':colour})
		//}

	});

}

function setFilter(e) {

	if ($(this).hasClass('colourType_selector')) {
		var val = this.value;

		motusFilter.colour = val;

		if (val == 'species' && mapType != 'tracks') {val = 'nSpp';}

		motusMap.svg
			.selectAll('.explore-map-' + dataType + '.explore-map-' + mapType)
			.style(mapType == 'tracks' ? 'stroke' : 'fill', d => motusMap.colorScales[dataType][mapType][val](d[val]));

		motusMap.legend.svg.html("");

		if (val == 'nSpp' || val == 'nAnimals' || val == 'lastData') {

			$("#explore_map_legend svg").show();

			var colourScale = motusMap.colorScales[dataType][mapType][val];

			if (val == 'projID' && mapType != 'regions') {
				colourScale = motusMap.colorScales[dataType][mapType][val].domain(motusMap.visible.Projs).range(motusMap.visible.Projs.map(function(key){ return projectColours[key]; }))
			} else if (val == 'nAnimals') {
				var d = colourScale.domain();
				colourScale.domain([d[1], d[0]]);
			}

			var legendWidth = $(motusMap.legend.el._groups[0][0]).parent().outerWidth();

			legend({
				el: motusMap.legend.svg,
				color: colourScale,
				title: $(this).select2('data')[0].text,
			//	ticks: ((val == 'projID' && mapType != 'regions') ?  : undefined),
				tickFormat: ( (val == 'nSpp' || val == 'species' || val == 'nAnimals') ? ".0f" : 's' ),
				invert: (val == 'nSpp' || val == 'species' || val == 'nAnimals'),
				height: legendWidth > 600 ? 600 : legendWidth
			});

			if (val == 'nAnimals') {
				d = colourScale.domain();
				colourScale.domain([d[1], d[0]]);
			}
		} else {
			$("#explore_map_legend svg").hide();

		}

	} else if ( $(this).parent().hasClass('explore-card-profiles-toggles') ) {

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

		var filterName = e.target.id.replace("filter_", "");

		var newFilter = $(e.target).val();
		console.log(filterName + ": " + newFilter);
		newFilter = newFilter.length == 0 ? ['all'] : (filterName == 'status' && newFilter == 'inactive' ? ['terminated','not active','pending'] : newFilter);

		motusFilter[filterName] = newFilter;

		var displayText = motusFilter[filterName].map(v => $("#filter_" + filterName + " option[value='" + v + "']").text());


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



function viewSolo(profile_id) {
	console.log("#explore_card_profile_"+profile_id);
	$("#explore_card_profile_"+profile_id).show();
	$("#explore_card_profiles").addClass('solo-card view-solo');
}

function updateData() {

	if (exploreType != 'main') {
		if ($("#exploreContent .explore-card-profile").length == 1) {
			$("#explore_card_profiles").addClass('solo-card');
			try { motusMap.setColour('id'); }
			catch(err) { console.log("motusMap not yet created"); }
		} else {
			$("#explore_card_profiles").removeClass('solo-card');
			try { motusMap.setColour(exploreType=='stations' ? 'name' :'species'); }
			catch(err) { console.log("motusMap not yet created"); }
		}

	}

	motusMap.setVisibility();

	updateURL();

}
