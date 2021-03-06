
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


    /*
    //only for testing purpose
    value: function(input) {
        console.log("this is working!");
        $.ui.slider.prototype.value.apply(this,arguments);
    }
    */
});

})(jQuery);
			
	$(document).ready(function(){
	
		$('.tips').mousemove(function(e){
			$('.tooltip').text($(this).attr('alt'));
			
			//	console.log("tooltip.left: " + parseInt($('.tooltip').css('left')) + " + tooltip.width: " + $('.tooltip').outerWidth() + " = " + (parseInt($('.tooltip').css('left')) + $('.tooltip').outerWidth()) + "  >  " + $(window).width());
			
			if (e.pageX + 15 + $('.tooltip').outerWidth() > $(window).width()) {
				$('.tooltip').css({top:e.pageY - 10, left:e.pageX - $('.tooltip').outerWidth() - 15});
			} else {
				$('.tooltip').css({top:e.pageY - 10, left:e.pageX + 15});
			}
			
			$('.tooltip:hidden').show();
		//	console.log("Top: " + $(this).offset().top + " - Left: " + $(this).offset().left)
		}).mouseleave(function(){$('.tooltip').hide()});
		
		$("#lightbox").click(function(){$(this).fadeOut(250);$("#lightbox_bg").fadeOut(250);});
		
		$('img.enlarge').click(function(){
			
			$("#lightbox_bg").fadeIn(250);
			$("#lightbox img").attr('src', $(this).attr('src')).parent().fadeIn(250);
		
		});
		
		var allValues = [];
		$('.explore_species .table td.chart-data').each(function(){
			allValues.push(parseInt($(this).text())); 
		});
			
		var maxValue = Math.max.apply(null, allValues);
		
		$('.explore_species .table td.chart-horiz').each(function(){
			var val = parseInt($(this).closest('tr').find('td:nth-child(3)').text());
			//console.log("$('.explore_species').innerWidth():" + $('.explore_species').innerWidth() + " - $('.explore_species .table tr').outerWidth():" + $('.explore_species .table tr').outerWidth() + " - $('.explore_species .table td:last-child').outerWidth():" + $('.explore_species .table td:last-child').outerWidth() + " = " + maxWidth);
			//console.log("maxWidth:" + maxWidth + " * val:" + val + " / maxValue:" + maxValue + " = " + (maxWidth * val / maxValue));
			$(this).css({width:"100%"}).append('<div></div>')
			var maxWidth = $(this).innerWidth();
			$(this).find('div').css({backgroundColor:$(this).closest('tr').find('.legend_color').css('background-color'), width: Math.floor(100 * (maxWidth * val / maxValue) / $(this).outerWidth()) + "%", height:'100%', display:'none', border:"solid 1px black"});
		});
		
		$('.explore_species table.table').css("width", "100%");
		$('.explore_species .table td:last-child div').show(250);
		
		$('#leftMenu .icon').click(function(){
			if ($('#leftMenu').hasClass('visible')) {
				$('#leftMenu').removeClass('visible')
				$('#leftMenu .icon.close').hide();
				$('#leftMenu .icon.open').show();hhh
			} else {
				$('#leftMenu').addClass('visible');
				$('#leftMenu .icon.close').show();
				$('#leftMenu .icon.open').hide();
			}
		});
		
		$(".explore_metrics > .header, .explore_card > .header").click(function(){
			if (!$(this).parent().hasClass("expanded_metrics")) {
				if ($(this).parent().hasClass('visible')) {
					$(this).children('.metric_controls, .metric_legend').fadeOut(100);
					$(this).siblings().slideUp(100);
					$(this).parent().removeClass('visible');
				} else if (!$(this).parent().hasClass('visible')) {
					$(this).children('.metric_controls, .metric_legend').fadeIn(100);
					$(this).siblings('.visible').slideDown(100);
					if ($(this).siblings('.visible').length == 0) {$(this).siblings().slideDown(100);}
					$(this).parent().addClass('visible');
				}
			}
		});
		
		
		$(".explore_metrics:not(.visible) > .header, .explore_card:not(.visible) > .header").each(function(){
			$(this).children('.metric_controls, .metric_legend').fadeOut(100);
			$(this).siblings('.visible').slideUp(100);
		});
		
		$(".explore_metrics > .header > .metric_controls, .explore_metrics > .header > .metric_legend").click(function(e){e.stopPropagation();});
		
		$(".metric_controls img").click(function(){
		
			if ($(this).hasClass('graph') & !$(this).closest(".explore_metrics").children(".visible").hasClass('graph')) {
				$(this).closest(".explore_metrics").children(".visible").removeClass('visible').siblings('.graph').addClass('visible');	
			} 
			
			if ($(this).hasClass('table') & !$(this).closest(".explore_metrics").children(".visible").hasClass('table')) {
				$(this).closest(".explore_metrics").children(".visible").removeClass('visible').siblings('.table').addClass('visible');
			} 
			
			if ($(this).hasClass('expand')) {
				if (! $(this).closest('.explore_metrics').children(".visible").hasClass('graph')) {
					$("#lightbox_bg").css({opacity:1,background:"white"}).fadeIn(250);
					
					$(this)
						.closest('.explore_metrics')
						.addClass('expanded_metrics')
						.css({
							top: $(this).closest('.explore_metrics').children('.visible').is('svg') ? "0": "calc(50% - " + ($(this).closest('.explore_metrics').outerHeight()/2) + "px)"
						})
						.find('.metric_controls')
						.fadeOut(250);
						
					$("body").css({overflow:"hidden"});
					
					if ($(this).closest('.explore_metrics').children('.visible').is('svg')) {
						var mapContainerID = $(this).closest('.explore_metrics').children('svg.visible').attr('id');
						var dims = {w: $("#" + mapContainerID).outerWidth() - $(window).width(), h: $("#" + mapContainerID).outerHeight() - $(window).height()};
						console.log(dims.w/2);
						svgs[mapContainerID].select('g')
							.attr("transform", "translate(" + (dims.w / 2) + "," + (0 / 2) + ")");
					}
					
					$("#lightbox_bg").unbind().click(function(){
						if ($(".expanded_metrics").children('.visible').is('svg')) {
							var mapContainerID = $(".expanded_metrics").children('svg.visible').attr('id');
							svgs[mapContainerID].select('g')
								.attr("transform", "translate(0, 0)");
						}
						$(".expanded_metrics")
							.removeClass('expanded_metrics')
							.css({
								top: "auto"
							})
							.find('.metric_controls')
							.fadeIn(250);
						$("body").css({overflowY:"scroll"});
						$("#lightbox_bg").css({opacity:0.5,background:"#555555"}).fadeOut(250);
						
					});
				} else {
					$(this).closest('.explore_metrics').children(".visible").click();
				}
			}
		
		});
		
		
		$(".explore_filters select").select2({ width: 'calc(100% - 6em)'});
		
		$(".station_activityTimeline .slider").dragslider({
			range: true,
			rangeDrag: true,
			min: new Date('2014-02-05').getTime() / 1000,
			max: new Date('2021-04-20').getTime() / 1000,
			step: 86400,
			values: [ new Date('2014-02-05').getTime() / 1000, new Date('2020-12-09').getTime() / 1000 ],
			create: function(e, ui) {
				$("#custom-handle-1 .ui-slider-handle-text").text( new Date( $(this).dragslider("values")[0] * 1000 ).toISOString().substr(0,10) )
				$("#custom-handle-2 .ui-slider-handle-text").text( new Date( $(this).dragslider("values")[1] * 1000 ).toISOString().substr(0,10) )
				$(".ui-slider .ui-slider-handle").focus(function(){$(this).blur();});
			},
			slide: function( event, ui ) {
				$( "#custom-handle-1 .ui-slider-handle-text" ).text( new Date(ui.values[ 0 ] *1000).toISOString().substr(0,10) );
				$( "#custom-handle-2 .ui-slider-handle-text" ).text( new Date(ui.values[ 1 ] *1000).toISOString().substr(0,10) );
			}
		});
		
		$(".toggleButton").click(function(){
			
			var toggleName = this.className.split(" ");
			
			while(toggleName[0] == "toggleButton" || toggleName[0] == "selected" || toggleName[0] == "disabled") {
				toggleName.shift();
			}
			
			toggleName = toggleName[0];
			
			
			$(".toggleButton." + toggleName).removeClass('selected');
			
			$(this).addClass('selected');
			
			if (toggleName == 'explore' || toggleName == 'mapStations' || toggleName == 'mapSpecies') {
			
				var typeToShow = this.innerHTML.toLowerCase();
				console.log("Show: ." + toggleName + "_type_" + typeToShow);
				
				$("." + toggleName + "_type_" + typeToShow + (toggleName == "explore" ? ":not(.explore_map)" : "")).addClass('visible');
				
				$(".toggleButton." + toggleName + ":not(.selected)").each(function(){
					
					console.log("Hide: ." + toggleName + "_type_" + $(this).html().toLowerCase());
					$("." + toggleName + "_type_" + $(this).html().toLowerCase()).removeClass('visible');
					
				});
				
				if (toggleName == 'explore') {
					$(".explore_type.visible .toggleButton.selected").click();
				}
				
			}
			
		});
		
		$(".toggleButton.explore.selected").click();
		
		$(".explore_species table.table").DataTable( {
		//$("#explore_species_table").DataTable( {
			"dom": '<"top">rt<"bottom"ilp><"clear">',
			"columnDefs": [ {
				"targets": 0,
				"orderable": false
				}, {
				"targets": 7,
				"orderable": false
				} ]
		} );
		
		$(".explore_species .dataTables_wrapper").addClass('visible table');
		initializeChoropleth("explore_mapStations_regions");
		
		

	});

var colorScale;
var data = {};

var svgs = {};
var projections = {};
var topoData = {};

var mapCentroid;

function initializeChoropleth(mapContainerID) {
	// The svg
	svgs[mapContainerID] = d3.select("#" + mapContainerID)
	   .attr("preserveAspectRatio", "xMinYMin meet")
	   .attr("viewBox", "0 0 600 300")
	   .classed("svg-content-responsive", true);
	 
	colorScale = d3.scaleThreshold()
			  .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
			  .range(d3.schemeBlues[7]);
	// Map and projection

	// Data and color scale
	data[mapContainerID] = d3.map();

	// Load external data and boot
	d3.queue() // Example used: https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson
	  .defer(d3.json, "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson") // from http://geojson.xyz/
	  .defer(d3.csv, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function(d) { data[mapContainerID].set(d.code, +d.pop); })
	  .await(ready(mapContainerID));
}
function ready(mapContainerID) {
	return function(error, topo) {
		
		mapCentroid = [30, -40];
  
		var path = d3.geoPath();
		
		var projection = d3.geoMercator()
		  .scale(70)
		  .center(mapCentroid);
		// Draw the map
		const g = svgs[mapContainerID].append("g")
		g
		 .selectAll("path")
		 .data(topo.features)
		 .enter()
		 .append("path")
			  // draw each country
			  .attr("d", d3.geoPath()
				.projection(projection)
			  )
			  // set the color of each country
			  .attr("fill", function (d) {
				d.total = data[mapContainerID].get(d.properties.adm0_a3_us) || 0;
				return colorScale(d.total);
			  }).style("");
		  
		  
	  const zoom = d3.zoom()
		  .scaleExtent([1, 50])
		  .extent([[0, 0], [400, 300]])
		  .on("zoom", () => g.attr("transform", d3.event.transform));
	  
	  svgs[mapContainerID].call(zoom);
	}
}