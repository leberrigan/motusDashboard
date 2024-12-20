

			(function( $, undefined ) {

$.widget("ui.dragslider", $.ui.slider, {

    options: $.extend({},$.ui.slider.prototype.options,{rangeDrag:false}),

    _create: function() {
      $.ui.slider.prototype._create.apply(this,arguments);
      this._rangeCapture = false;
    },

    _mouseCapture: function( event ) {
      var o = this.options;

      if ( o.disabled ) return false;

      if(event.target == this.range.get(0) && o.rangeDrag == true && o.range == true) {
        this._rangeCapture = true;
        this._rangeStart = null;
      }
      else {
        this._rangeCapture = false;
      }

      $.ui.slider.prototype._mouseCapture.apply(this,arguments);

      if(this._rangeCapture == true) {
          this.handles.removeClass("ui-state-active").blur();
      }

      return true;
    },

    _mouseStop: function( event ) {
      this._rangeStart = null;
      return $.ui.slider.prototype._mouseStop.apply(this,arguments);
    },

    _slide: function( event, index, newVal ) {
      if(!this._rangeCapture) {
        return $.ui.slider.prototype._slide.apply(this,arguments);
      }

      if(this._rangeStart == null) {
        this._rangeStart = newVal;
      }

      var oldValLeft = this.options.values[0],
          oldValRight = this.options.values[1],
          slideDist = newVal - this._rangeStart,
          newValueLeft = oldValLeft + slideDist,
          newValueRight = oldValRight + slideDist,
          allowed;

      if ( this.options.values && this.options.values.length ) {
        if(newValueRight > this._valueMax() && slideDist > 0) {
          slideDist -= (newValueRight-this._valueMax());
          newValueLeft = oldValLeft + slideDist;
          newValueRight = oldValRight + slideDist;
        }

        if(newValueLeft < this._valueMin()) {
          slideDist += (this._valueMin()-newValueLeft);
          newValueLeft = oldValLeft + slideDist;
          newValueRight = oldValRight + slideDist;
        }

        if ( slideDist != 0 ) {
          newValues = this.values();
          newValues[ 0 ] = newValueLeft;
          newValues[ 1 ] = newValueRight;

          // A slide can be canceled by returning false from the slide callback
          allowed = this._trigger( "slide", event, {
            handle: this.handles[ index ],
            value: slideDist,
            values: newValues
          } );

          if ( allowed !== false ) {
            this.values( 0, newValueLeft, true );
            this.values( 1, newValueRight, true );
          }
          this._rangeStart = newVal;
        }
      }



    },


});

})(jQuery);

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.hash.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};

function updateURL(reload) {

	var stateToPush = 'e=' + (exploreType) + '&d=' + (dataType),
		toEncode;

	for (f in motusFilter) {
		if (typeof motusFilter[f] !== 'undefined' && f != 'default' && !['detected','visiting','local'].some( x => f.toLowerCase().includes(x))) {
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
				if (
						motusFilter[f].length > 0 &&
						(
							['dtStart','dtEnd', 'colour', 'group', 'selections'].includes(f) ||
						 	!(
								typeof motusFilter.default === 'object' &&
									(
	 										(
	 										 typeof motusFilter.default[f] === 'object' && motusFilter.default[f].every( x => motusFilter[f].includes(x) )
									 	) || (
											 typeof motusFilter.default[f] === 'string' && motusFilter.default[f] == motusFilter[f]
											)
									)
								)
							)
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

const PAGE_LOAD_TIME = new Date();

function logMessage(msg, severity, category) {
	if (severity == "title") {
		$(".loader .loader-text-title").html( msg );
	} else {
		$(".loader .loader-text").text( msg );
		msg = ("(" + (new Date() - PAGE_LOAD_TIME) + ")").padEnd(10," ") + (category?`[${category}]`:"[uncategorized]").padEnd(17, " ") + msg;
		switch (severity) {
			case "error":
				console.error(msg);
				break;
			case "warn":
				console.warn(msg);
				break;
			case "info":
				console.info(msg);
				break;
			case "debug":
				console.debug(msg);
				break;
			default:
				console.log(msg);
				break;
		}
	}
}


function detectNavigation() {

	var reload = false;
	var url_params = getSearchParameters( window.location.hash.substr(1) );
	var page_url = window.location.pathname.split("/")[window.location.pathname.split("/").length-1]; // "explore.html" or "report.html"

	if (page_url == "report.html") {
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
	} else {
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

		if ( 	(typeof url_params.e !== 'undefined' && url_params.e !== exploreType)	||
					(typeof url_params.d !== 'undefined' && url_params.d !== dataType )				) {

			reload = true;

		} else if (	url_params.d === undefined 																									||
								!dataTypes.includes(firstToUpper(url_params.d))															||
								url_params.e === undefined 																									||
								(!dataTypes.includes(firstToUpper(url_params.e)) && url_params.e != 'main')			) {

			window.location.href=`#e=${exploreType}&d=${dataType}`;
			reload = true;

		} else if (url_params.d != url_params.e && url_params.e != 'main') {

			window.location.href=`#e=main&d=${dataType}`;
			reload = true;
		}
	}


	motusFilter = {
		dtStart: url_params.dtStart === undefined || url_params.dtStart.length == 0 ? motusFilter.dtStart : moment(url_params.dtStart),
		dtEnd: url_params.dtEnd === undefined || url_params.dtEnd.length == 0 ? motusFilter.dtEnd : moment(url_params.dtEnd),
		species: url_params.species === undefined || url_params.species.length == 0 ? ["all"] : url_params.species.split(','),
		animals: url_params.animals === undefined || url_params.animals.length == 0 ? ["all"] : url_params.animals.split(','),
		regions: url_params.regions === undefined || url_params.regions.length == 0 ? ["all"] : url_params.regions.split(','),
		projects: url_params.projects === undefined || url_params.projects.length == 0 ? ["all"] : url_params.projects.split(','),
		stations: url_params.stations === undefined || url_params.stations.length == 0 ? ["all"] : url_params.stations.split(','),
		status: url_params.status === undefined || url_params.status.length == 0 ? ["all"] : url_params.status.split(','),
		selections: url_params.selections === undefined || url_params.selections.length == 0 ? url_params[dataType] === undefined ? [] : url_params[dataType].split(',') : url_params.selections.split(','),
		frequencies: url_params.frequencies === undefined || url_params.frequencies.length == 0 ? ["all"] : url_params.frequencies.split(','),
		group: url_params.group === undefined || url_params.group.length == 0 ? [] : url_params.group,
		colour: url_params.frequencies === undefined || url_params.frequencies.length == 0 ? [] : url_params.colour,
		default: motusFilter.default
	};
	if (motusFilter[dataType].includes('all') && motusFilter.selections.length > 0) {
//		motusFilter[dataType] = motusFilter.selections;
	} else if ( !motusFilter.selections.every( x => motusFilter[dataType].includes(x))) {
//		motusFilter[dataType].concat( motusFilter.selections.filter( x => !motusFilter[dataType].includes(x) ) );
	}
	logMessage(motusFilter);

	if (motusMap.setVisibility) {
		motusMap.setVisibility();
	}
	if (reload) {
		$('.explore-card-wrapper').animate({'opacity':0}, 500, function(){location.reload();});
		$(".loader").removeClass("hidden");
	}
}

function getSearchParameters(prmstr = window.location.hash.substr(1)) {
    return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}

function transformToAssocArray( prmstr ) {
    var params = {};
    var prmarr = prmstr.split("&");
    for ( var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = decodeURIComponent(tmparr[1]);
    }
    return params;
}

window.mobileCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}
jQuery.fn.d3Click = function () {
  this.each(function (i, e) {
    var evt = new MouseEvent("click");
    e.dispatchEvent(evt);
  });
};
jQuery.fn.cleanWhitespace = function() {
	this.contents().filter(
		function() { return (this.nodeType == 3 && !/\S/.test(this.nodeValue)); })
		.remove();
	return this;
}
function navigate(page){
	if (page == 'main') {
		window.location.href = (window.location.hostname == 'localhost' ? "explore.html" : "dashboard/")+"#exploreType=main&dataType="+dataType+"&mapType="+mapType;
	}
}
function firstToUpper(string) {
	if (string !== null && string !== undefined) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	} else {
		console.warn("firstToUpper error: null or undefined given");
		return string;
	}
}
function explore_profile(exploreType, profile_id){
		window.location.href = (window.location.hostname == 'localhost' ? "explore2.html" : "dashboard-profile/")+"#exploreType="+exploreType+"&dataType="+dataType+"&mapType="+mapType+"&"+exploreType+"="+profile_id;
}

function initiateTooltip(el) {
	if (!isMobile) {
		var $els = $( typeof el === 'undefined' ? '.tips' : el );

		if (!$els.hasClass('tips')) {$els = $els.find('.tips')}

		$els.mousemove(function(e){
			$('.tooltip').text($(this).attr('alt'));

			if (e.pageX + 15 + $('.tooltip').outerWidth() > $(window).width()) {
				$('.tooltip').css({top:e.pageY - 10, left:e.pageX - $('.tooltip').outerWidth() - 15});
			} else {
				$('.tooltip').css({top:e.pageY - 10, left:e.pageX + 15});
			}
			$('.tooltip:hidden').show();
		}).mouseleave(function(){$('.tooltip').hide()});
	} else if($(".tooltip_bg").length == 0) {
		$(".tooltip").after("<div class='tooltip_bg'></div>")
		$(".tooltip_bg").click(function(){$(".tooltip,.tooltip_bg").hide();});
	}
}
function initiatePopup() {
}

function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}

function hexToRgb(hex) {
  var res = hex.match(/[a-f0-9]{2}/gi);
  return res && res.length === 3
    ? res.map(function(v) { return parseInt(v, 16) })
    : null;
}

function viewProfile(profileType, dataID) {

	var group = profileType.includes('Group');
	var groupID = dataID;

	profileType = profileType.replace('Group', '');

	if (exploreType!='report') {exploreType = profileType;}
	dataType = profileType;

	dataID = typeof dataID === 'object' ? dataID : [dataID];

	if (exploreType != "report") {
		motusFilter={};
		if (group) {
			if (profileType == 'projects') {
				dataID = motusData.projects.filter( d => dataID.includes(d.fee_id) ).map( d => d.id )
			} else {
				dataID = motusData[dataType].filter( d => dataID.includes(d.id) ).map( d => d.id )
			}
			motusFilter.group = groupID;
		//	motusFilter[profileType] = dataID;
			motusFilter.selections = dataID;
		} else {
			motusFilter.group = undefined;
		//	motusFilter[profileType] = dataID;
			motusFilter.selections = dataID;
	}


		$(".loader").removeClass("hidden");


		updateURL(true);

	} else {
		//motusFilter.selections = dataID;
		reportAddSelection(profileType, dataID);
	}

}
function initiateLightbox(el) {
	if (typeof el === 'undefined') {

		$("#lightbox").click(function(){$(this).fadeOut(250);});
		$('.enlarge').click(initiateLightbox);

	} else {

		if (el.tagName != 'IMG' && $(el).find('img').length == 0) {
			var img_url = $(el).css('background-image');
			img_url = /^url\((['"]?)(.*)\1\)$/.exec(img_url);
			img_url = img_url ? img_url[2] : "";
		} else if (el.tagName != 'IMG') {
			var img_url = $(el).find('img').attr("src");
		} else {
			var img_url = el.src;
		}

		$("#lightbox img").attr('src', img_url).parent().fadeIn(250);
	}


}

function camelToRegularText( txt ) {
	return firstToUpper(txt.replace(/([A-Z])/g, ' $1')).trim();
}

function showPopup( content, event, location ) {

	$(".popup").remove();

	$("body").append("<div class='popup'><div class='popup-topbar'><div class='popup-topbar-close'>X</div></div><div class='popup-content'></div></div>");
	$(".popup").draggable({handle: ".popup-topbar"});
	$(".popup .popup-topbar .popup-topbar-close").click(function(){$(".popup").remove();});

	$('.popup .popup-content').html(content);

	initiateTooltip($('.popup .popup-content .tips'));

	if (!location)
		location = {top: event.pageY, left: event.pageX }

	if (location.left + $('.popup').outerWidth() > $(window).width()) {
		location.left = location.left - $('.popup').outerWidth() - 30;
	}

	$('.popup').css(location);

	$('.popup:hidden').show();

}


function filterPopup( content, event, location ) {

	if ($("#filterPopup").length == 0) {
		$("body").append("<div class='popup' id='filterPopup'><!--div class='popup-topbar'><div class='popup-topbar-close'>X</div></div--><div class='close'>X</div><div class='popup-content'></div></div>");
		$("#filterPopup").draggable({handle: ".popup-topbar"});
		$("#filterPopup .close").click(function(){$(".popup").remove();});
	}

	if (content) {

		$('#filterPopup .popup-content').html(content);
		initiateTooltip($('#filterPopup .popup-content .tips'));

	}

	$('#filterPopup:hidden').show();

	if (!location)
		location = {
			top: $(event.target).offset().top + $(event.target).outerHeight() - 2,
			left: $(event.target).offset().left - ( $('#filterPopup').outerWidth() / 2 )
		}

	if (location.left + $('#filterPopup').outerWidth() > $(window).width()) {
		location.left = $(window).width() - $('#filterPopup').outerWidth();
	} else if (location.left < 0) {
		location.left = 0;
	}

	$('#filterPopup').css(location);
}

function countInstances(arr) {
  var a = [],
    b = [],
    prev;

  arr.sort();
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] !== prev) {
      a.push(arr[i]);
      b.push(1);
    } else {
      b[b.length - 1]++;
    }
    prev = arr[i];
  }

  return [a, b];
}

var dataColNames = {
	projID: 'Project ID',
	deployID: 'Deployment ID',
	status: 'Status',
	name: 'Name',
	serno: 'Serial number',
	dtStart: 'Start date',
	dtEnd: 'End date',
	lat: 'Latitude',
	lon: 'Longitude',
	nAnt: 'Number of antennas',
	frequency: 'Frequency',
//	species: 'Species',
	model: 'Model',
	tagID: 'Tag ID',
	manufacturer: 'Brand',
	lat1: 'Initial latitude',
	lon1: 'Initial longitude',
	lat2: 'Final Latitude',
	lon2: 'Final longitude',
	projects: {
		id: "Project ID",
		created_dt: "Date created",
		dtCreated: "Date created",
		name: "Project name",
		shortName: "Short name",
		description: "Description",
		name: "Project name",
		project_code: "Project code",
		description_short: "Short description",
		fee_id: "Project type",
		shortDescription: "Short description",
		stations: "Number of stations",
		animals: "Number of animals tagged"
	},
	species: {
		sort: "Taxonomic order",
		id: "Species ID",
		code: "Species code",
		group: "Species group",
		english: "English",
		french: "Français",
		spanish: "Español",
		scientific: "Scientific",
		animals: "Animals tagged",
		projects: "Projects"
	},
	regions: {
		country: "Country",
		stations: "Stations",
		animals: "Animals",
		both: "Both",
		adm0_a2: "Country Code"
	}
}
function viewWebsite(url) {
 $("#websitebox iframe").attr("src", url);
 $("#websitebox_bg, #websitebox").fadeIn(250);
 $("#websitebox_bg").click(function(){
 	$("#websitebox_bg, #websitebox").fadeOut(250);
 });

}
/// String compression scripts from: https://stackoverflow.com/questions/4570333/string-compression-in-javascript

function compressString(c){var x='charCodeAt',b,e={},f=c.split(""),d=[],a=f[0],g=256;for(b=1;b<f.length;b++)c=f[b],null!=e[a+c]?a+=c:(d.push(1<a.length?e[a]:a[x](0)),e[a+c]=g,g++,a=c);d.push(1<a.length?e[a]:a[x](0));for(b=0;b<d.length;b++)d[b]=String.fromCharCode(d[b]);return d.join("")}

function decompressString(b){var a,e={},d=b.split(""),c=f=d[0],g=[c],h=o=256;for(b=1;b<d.length;b++)a=d[b].charCodeAt(0),a=h>a?d[b]:e[a]?e[a]:f+c,g.push(a),c=a.charAt(0),e[o]=f+c,o++,f=a;return g.join("")}

function getArray(object) {
		var newArrayLength = Object.values(object).filter( x => typeof x === 'object' )[0].length;
    return Object.keys(object).reduce(function (r, k) {
			if (typeof object[k] !== 'object') {
				object[k] = fillArray(object[k], newArrayLength);
			}
		  object[k].forEach(function (a, i) {
          r[i] = r[i] || {};
          r[i][k] = a;
      });
      return r;
    }, []);
}
function fillArray(value, len) {
  var arr = [];
  for (var i = 0; i < len; i++) {
    arr.push(value);
  }
  return arr;
}
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

var customColourScale = {
	jnnnnn: ["#3957ff", "#d3fe14", "#c9080a", "#fec7f8", "#0b7b3e", "#0bf0e9", "#c203c8", "#fd9b39", "#888593", "#906407", "#98ba7f", "#fe6794", "#10b0ff", "#ac7bff", "#fee7c0", "#964c63", "#1da49c", "#0ad811", "#bbd9fd", "#fe6cfe", "#297192", "#d1a09c", "#78579e", "#81ffad", "#739400", "#ca6949", "#d9bf01", "#646a58", "#d5097e", "#bb73a9", "#ccf6e9", "#9cb4b6", "#b6a7d4", "#9e8c62", "#6e83c8", "#01af64", "#a71afd", "#cfe589", "#d4ccd1", "#fd4109", "#bf8f0e", "#2f786e", "#4ed1a5", "#d8bb7d", "#a54509", "#6a9276", "#a4777a", "#fc12c9", "#606f15", "#3cc4d9", "#f31c4e", "#73616f", "#f097c6", "#fc8772", "#92a6fe", "#875b44", "#699ab3", "#94bc19", "#7d5bf0", "#d24dfe", "#c85b74", "#68ff57", "#b62347", "#994b91", "#646b8c", "#977ab4", "#d694fd", "#c4d5b5", "#fdc4bd", "#1cae05", "#7bd972", "#e9700a", "#d08f5d", "#8bb9e1", "#fde945", "#a29d98", "#1682fb", "#9ad9e0", "#d6cafe", "#8d8328", "#b091a7", "#647579", "#1f8d11", "#e7eafd", "#b9660b", "#a4a644", "#fec24c", "#b1168c", "#188cc1", "#7ab297", "#4468ae", "#c949a6", "#d48295", "#eb6dc2", "#d5b0cb", "#ff9ffb", "#fdb082", "#af4d44", "#a759c4", "#a9e03a", "#0d906b", "#9ee3bd", "#5b8846", "#0d8995", "#f25c58", "#70ae4f", "#847f74", "#9094bb", "#ffe2f1", "#a67149", "#936c8e", "#d04907", "#c3b8a6", "#cef8c4", "#7a9293", "#fda2ab", "#2ef6c5", "#807242", "#cb94cc", "#b6bdd0", "#b5c75d", "#fde189", "#b7ff80", "#fa2d8e", "#839a5f", "#28c2b5", "#e5e9e1", "#bc79d8", "#7ed8fe", "#9f20c3", "#4f7a5b", "#f511fd", "#09c959", "#bcd0ce", "#8685fd", "#98fcff", "#afbff9", "#6d69b4", "#5f99fd", "#aaa87e", "#b59dfb", "#5d809d", "#d9a742", "#ac5c86", "#9468d5", "#a4a2b2", "#b1376e", "#d43f3d", "#05a9d1", "#c38375", "#24b58e", "#6eabaf", "#66bf7f", "#92cbbb", "#ddb1ee", "#1be895", "#c7ecf9", "#a6baa6", "#8045cd", "#5f70f1", "#a9d796", "#ce62cb", "#0e954d", "#a97d2f", "#fcb8d3", "#9bfee3", "#4e8d84", "#fc6d3f", "#7b9fd4", "#8c6165", "#72805e", "#d53762", "#f00a1b", "#de5c97", "#8ea28b", "#fccd95", "#ba9c57", "#b79a82", "#7c5a82", "#7d7ca4", "#958ad6", "#cd8126", "#bdb0b7", "#10e0f8", "#dccc69", "#d6de0f", "#616d3d", "#985a25", "#30c7fd", "#0aeb65", "#e3cdb4", "#bd1bee", "#ad665d", "#d77070", "#8ea5b8", "#5b5ad0", "#76655e", "#598100", "#86757e", "#5ea068", "#a590b8", "#c1a707", "#85c0cd", "#e2cde9", "#dcd79c", "#d8a882", "#b256f9", "#b13323", "#519b3b", "#dd80de", "#f1884b", "#74b2fe", "#a0acd2", "#d199b0", "#f68392", "#8ccaa0", "#64d6cb", "#e0f86a", "#42707a", "#75671b", "#796e87", "#6d8075", "#9b8a8d", "#f04c71", "#61bd29", "#bcc18f", "#fecd0f", "#1e7ac9", "#927261", "#dc27cf", "#979605", "#ec9c88", "#8c48a3", "#676769", "#546e64", "#8f63a2", "#b35b2d", "#7b8ca2", "#b87188", "#4a9bda", "#eb7dab", "#f6a602", "#cab3fe", "#ddb8bb", "#107959", "#885973", "#5e858e", "#b15bad", "#e107a7", "#2f9dad", "#4b9e83", "#b992dc", "#6bb0cb", "#bdb363", "#ccd6e4", "#a3ee94", "#9ef718", "#fbe1d9", "#a428a5", "#93514c", "#487434", "#e8f1b6", "#d00938", "#fb50e1", "#fa85e1", "#7cd40a", "#f1ade1", "#b1485d", "#7f76d6", "#d186b3", "#90c25e", "#b8c813", "#a8c9de", "#7d30fe", "#815f2d", "#737f3b", "#c84486", "#946cfe", "#e55432", "#a88674", "#c17a47", "#b98b91", "#fc4bb3", "#da7f5f", "#df920b", "#b7bbba", "#99e6d9", "#a36170", "#c742d8", "#947f9d", "#a37d93", "#889072", "#9b924c", "#23b4bc", "#e6a25f", "#86df9c", "#a7da6c", "#3fee03", "#eec9d8", "#aafdcb", "#7b9139", "#92979c", "#72788a", "#994cff", "#c85956", "#7baa1a", "#de72fe", "#c7bad8", "#85ebfe", "#6e6089", "#9b4d31", "#297a1d", "#9052c0", "#5c75a5", "#698eba", "#d46222", "#6da095", "#b483bb", "#04d183", "#9bcdfe", "#2ffe8c", "#9d4279", "#c909aa", "#826cae", "#77787c", "#a96fb7", "#858f87", "#fd3b40", "#7fab7b", "#9e9edd", "#bba3be", "#f8b96c", "#7be553", "#c0e1ce", "#516e88", "#be0e5f", "#757c09", "#4b8d5f", "#38b448", "#df8780", "#ebb3a0", "#ced759", "#f0ed7c", "#e0eef1", "#0969d2", "#756446", "#488ea8", "#888450", "#61979c", "#a37ad6", "#b48a54", "#8193e5", "#dd6d89", "#8aa29d", "#c679fe", "#a4ac12", "#75bbb3", "#6ae2c1", "#c4fda7", "#606877", "#b2409d", "#5874c7", "#bf492c", "#4b88cd", "#e14ec0", "#b39da2", "#fb8300", "#d1b845", "#c2d083", "#c3caef", "#967500", "#c56399", "#ed5a05", "#aadff6", "#6685f4", "#1da16f", "#f28bff", "#c9c9bf", "#c7e2a9", "#5bfce4", "#e0e0bf", "#e8e2e8", "#ddf2d8", "#9108f8", "#932dd2", "#c03500", "#aa3fbc", "#547c79", "#9f6045", "#04897b", "#966f32", "#d83212", "#039f27", "#df4280", "#ef206e", "#0095f7", "#a5890d", "#9a8f7f", "#bc839e", "#88a23b", "#e55aed", "#51af9e", "#5eaf82", "#9e91fa", "#f76c79", "#99a869", "#d2957d", "#a2aca6", "#e3959e", "#adaefc", "#5bd14e", "#df9ceb", "#fe8fb1", "#87ca80", "#fc986d", "#2ad3d9", "#e8a8bb", "#a7c79c", "#a5c7cc", "#7befb7", "#b7e2e0", "#85f57b", "#f5d95b", "#dbdbff", "#fddcff", "#6e56bb", "#226fa8", "#5b659c", "#58a10f", "#e46c52", "#62abe2", "#c4aa77", "#b60e74", "#087983", "#a95703", "#2a6efb", "#427d92"]
}

// Copyright 2021, Observable Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/color-legend
function Legend(color, {
  title,
  tickSize = 6,
  width = 320,
  height = 44 + tickSize,
  marginTop = 18,
  marginRight = 0,
  marginBottom = 16 + tickSize,
  marginLeft = 0,
  ticks = width / 64,
  tickFormat,
  tickValues,
	svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("overflow", "visible")
      .style("display", "block")
} = {}) {

  function ramp(color, n = 256) {
    const canvas = document.createElement("canvas");
    canvas.width = n;
    canvas.height = 1;
    const context = canvas.getContext("2d");
    for (let i = 0; i < n; ++i) {
      context.fillStyle = color(i / (n - 1));
      context.fillRect(i, 0, 1, 1);
    }
    return canvas;
  }

  let tickAdjust = g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
  let x;

  // Continuous
  if (color.interpolate) {
    const n = Math.min(color.domain().length, color.range().length);

    x = color.copy().rangeRound(d3.quantize(d3.interpolate(marginLeft, width - marginRight), n));

    svg.append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color.copy().domain(d3.quantize(d3.interpolate(0, 1), n))).toDataURL());
  }

  // Sequential
  else if (color.interpolator) {
    x = Object.assign(color.copy()
        .interpolator(d3.interpolateRound(marginLeft, width - marginRight)),
        {range() { return [marginLeft, width - marginRight]; }});

    svg.append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color.interpolator()).toDataURL());

    // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
    if (!x.ticks) {
      if (tickValues === undefined) {
        const n = Math.round(ticks + 1);
        tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)));
      }
      if (typeof tickFormat !== "function") {
        tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
      }
    }
  }

  // Threshold
  else if (color.invertExtent) {
    const thresholds
        = color.thresholds ? color.thresholds() // scaleQuantize
        : color.quantiles ? color.quantiles() // scaleQuantile
        : color.domain(); // scaleThreshold

    const thresholdFormat
        = tickFormat === undefined ? d => d
        : typeof tickFormat === "string" ? d3.format(tickFormat)
        : tickFormat;

    x = d3.scaleLinear()
        .domain([-1, color.range().length - 1])
        .rangeRound([marginLeft, width - marginRight]);

    svg.append("g")
      .selectAll("rect")
      .data(color.range())
      .join("rect")
        .attr("x", (d, i) => x(i - 1))
        .attr("y", marginTop)
        .attr("width", (d, i) => x(i) - x(i - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", d => d);

    tickValues = d3.range(thresholds.length);
    tickFormat = i => thresholdFormat(thresholds[i], i);
  }

  // Ordinal
  else {
    x = d3.scaleBand()
        .domain(color.domain())
        .rangeRound([marginLeft, width - marginRight]);

    svg.append("g")
      .selectAll("rect")
      .data(color.domain())
      .join("rect")
        .attr("x", x)
        .attr("y", marginTop)
        .attr("width", Math.max(0, x.bandwidth() - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", color);

    tickAdjust = () => {};
  }

  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x)
        .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
        .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
        .tickSize(tickSize)
        .tickValues(tickValues))
      .call(tickAdjust)
      .call(g => g.select(".domain").remove())
      .call(g => g.append("text")
        .attr("x", marginLeft)
        .attr("y", marginTop + marginBottom - height - 6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .attr("class", "title")
        .text(title));

  return svg.node();
}

function toSingular(plural) {
	return plural.toLowerCase() == 'species' ? plural : plural.slice(0, -1);
}




/**
 *  Sorts all arrays together with the first. Pass either a list of arrays, or a map. Any key is accepted.
 *     Array|Object arrays               [sortableArray, ...otherArrays]; {sortableArray: [], secondaryArray: [], ...}
 *     Function comparator(?,?) -> int   optional compareFunction, compatible with Array.sort(compareFunction)
 */
function sortArrays(arrays, comparator = (a, b) => (a < b) ? -1 : (a > b) ? 1 : 0) {
    let arrayKeys = Object.keys(arrays);
    let sortableArray = Object.values(arrays)[0];
    let indexes = Object.keys(sortableArray);
    let sortedIndexes = indexes.sort((a, b) => comparator(sortableArray[a], sortableArray[b]));

    let sortByIndexes = (array, sortedIndexes) => sortedIndexes.map(sortedIndex => array[sortedIndex]);

    if (Array.isArray(arrays)) {
        return arrayKeys.map(arrayIndex => sortByIndexes(arrays[arrayIndex], sortedIndexes));
    } else {
        let sortedArrays = {};
        arrayKeys.forEach((arrayKey) => {
            sortedArrays[arrayKey] = sortByIndexes(arrays[arrayKey], sortedIndexes);
        });
        return sortedArrays;
    }
}

// Allows me to rename an object keys
function renameObjectKey(o, oldKey, newKey) {
  delete Object.assign(o, {[newKey]: o[oldKey] })[oldKey];
}
