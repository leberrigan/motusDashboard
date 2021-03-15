

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
    var sPageURL = window.location.search.substring(1),
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


function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

	
function firstToUpper(string) {
	if (string !== null && string !== undefined) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	} else {
		console.warn("firstToUpper error: null or undefined given");
		return string;
	}
}

function initiateTooltip(el) {
	
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
	
}

function initiateLightbox() {
	$("#lightbox").click(function(){$(this).fadeOut(250);$("#lightbox_bg").fadeOut(250);});
	
	$('.enlarge').click(function(){
		
		if (this.tagName != 'IMG') {
			var img_url = $(this).css('background-image');
			img_url = /^url\((['"]?)(.*)\1\)$/.exec(img_url);
			img_url = img_url ? img_url[2] : "";
		} else {
			var img_url = this.src;
		}
		
		
		$("#lightbox_bg").fadeIn(250);
		$("#lightbox img").attr('src', img_url).parent().fadeIn(250);
	
	});
	
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
	species: 'Species',
	model: 'Model',
	tagID: 'Tag ID',
	manufacturer: 'Brand',
	lat1: 'Initial latitude',
	lon1: 'Initial longitude',
	lat2: 'Final Latitude',
	lon2: 'Final longitude'
	
}
