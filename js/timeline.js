
var timeline = {};

function exploreTimeline({
	el = "#dateSlider .slider",
	duration = 3000,
	min = new Date('2014-02-05').valueOf() / 1000,
	max = new Date('2021-04-20').valueOf() / 1000,
	range = 0,
	step = 86400,
	startVal = new Date('2014-02-05').valueOf() / 1000,
	distance = 0,
	svg = {},
	position = [0,0],
	width = 270,
	height = 40,
	status = 'off',
	timerStartTime = 0,
	timerElapsed = 0,
	defaultValues = [ motusFilter.dtStart.valueOf() / 1000, motusFilter.dtEnd.valueOf() / 1000 ]
} = {}) {
	timeline = {
		el: el,
		timer: undefined,
		duration: duration,
		min: min,
		max: max,
		range: range,
		step: step,
		startVal: startVal,
		distance: distance,
		svg: svg,
		position: position,
		status: status,
		timerStartTime: timerStartTime,
		timerElapsed: timerElapsed,
		defaultValues: defaultValues,
		animationStartVals: defaultValues,
		animate: function(e) {
			// So we can pause and restart the animation
			e += timeline.timerElapsed;
			// Sometimes it jumps past the max value
			e = (e > timeline.duration ? timeline.duration : e);
			// Val to select on the dragslider input (right slider)
			var selectedVal = timeline.min + ((timeline.range - timeline.distance) / (timeline.duration/e));
			// Set slider position
			timeline.setSlider([selectedVal, selectedVal + timeline.distance]);

			// Set visiblity of data in maps
			motusMap.setVisibility();

			// If timeline is paused, record elapsed time in case it is resumed.
			if (timeline.status == 'pause') {
				timeline.timerElapsed = e;
				timeline.timer.stop();
			}

			// If timeline ends or is stopped, go through the process of resetting the handles
			if (e == timeline.duration) {
				timeline.animationEnd();
			}
		},
		animationEnd: function() {

			timeline.timerElapsed = 0;
			timeline.timer.stop();
			timeline.setSlider(timeline.animationStartVals);

		//	if (!$(".filterButton").hasClass('selected')) {$(el).parent().hide();}
	//		$('#explore_filters').css({marginBottom:"-" + $('#explore_filters').innerHeight() + "px"});
	//		$(".animate_timeline").removeClass('selected');
			timeline.status = 'stop';
			motusMap.setVisibility();
		},
		setSlider: function(position, moveSlider = false, setPicker = true, callback) {

			if (typeof position[0] === 'string') {
				position = [new Date( position[0] ), new Date( position[1] )];
			}

			if (typeof position[0] === 'object') {
				$(el).dragslider( 'values', [+position[0]/1000,+position[1]/1000]);
			} else {
				$(el).dragslider( 'values', position);
			}


			if (typeof position[0] === 'number') {
				position = [new Date( position[0] * 1000 ), new Date( position[1] * 1000 )];
			}


			// Set the Motus data filters
			motusFilter.dtStart = position[0];
			motusFilter.dtEnd = position[1];
			// Set the text in the slider handles
		//	$('#filter_dates').text(( motusFilter.dtStart.toISOString().substr(0,10)) + " - " + ( motusFilter.dtEnd.toISOString().substr(0,10)));

			if ($('#filter_dates').length > 0 && setPicker ) {
				$('#filter_dates').data('daterangepicker').setStartDate(motusFilter.dtStart);
				$('#filter_dates').data('daterangepicker').setEndDate(motusFilter.dtEnd);
			}
			if (typeof callback !== 'undefined') {callback();}
			//updateURL()
		},
		changeAnimationState: function(e) {

			timeline.status = e.target.children.length > 0 ? e.target.firstElementChild.classList[1] : e.target.classList[1];

			if (timeline.status == 'play') {

				if (!$(this).hasClass('selected')) {
				//	$(el).parent().show();
				//	$(this).addClass('selected');
				//	$('#explore_filters').css({marginBottom:"-" + $('#explore_filters').innerHeight() + "px"});
				}

				animateTimeline();

			} else if (timeline.status == 'stop') {

				timeline.animationEnd();

			}

		},
		createLegend: function () {
			// timeline.min and *.max must be set prior to call
			var width_el = $(el).parent();
			width = 0;
			while(width == 0 && width_el.get(0).tagName != "BODY") {
				width = width_el.width();
				width_el = width_el.parent();
			}

			if (width == 0) {$(el).parent().parent().width();}

			if (exploreType != 'main') {

				timeRange = {min: timeRange.min.valueOf(), max: timeRange.max.valueOf()}
				timeRange.range = timeRange.max - timeRange.min;
				$(timeline.el).dragslider("option","min",timeRange.min/1000).dragslider("option","max",timeRange.max/1000)

				$(el).parent().append(stationTimeline(Object.values(motusData.selectedTracks),{
						width:width,
						resize: $(el).parent(),
						timelineSVG: $("<svg height='"+height+"' style='width:100%;margin:-8px 0;cursor:pointer;'></svg>"),
						dataSource: "animals"
					}));
					console.log($(el).parent().find('svg'));
			} else {

				$(el).parent().append(`<svg id='activityTimeline' viewbox='0 0 ${width + 30} ${height - 10}'></svg>`);
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
					];

				var diffTime = timeline.range / (60 * 60 * 24);
				var timeFormat = diffTime > 600 ? diffTime > 2000 && width < 600 ? "%Y" : "%Y-%m" : "%Y-%m-%d";
				var tickWidth = (timeFormat.length * 5) + 20;	// Each character is approximately 5 pixels wide
				var numTicks = Math.ceil( width / tickWidth );
				numTicks = numTicks > 40 ? 20 : numTicks > 10 ? 10 : numTicks;

				console.log("width: %s, diffTime: %s, timeFormat: %s, tickWidth: %s, numTicks: %s", width, diffTime, timeFormat, tickWidth, numTicks);
				var timeLineConstruct = d3.timeline()
					.width(width)
					.tickFormat({
						format: d3.timeFormat(timeFormat),
						tickTime: d3.timeDays,
						numTicks: numTicks,
						tickSize: 6})
					.margin({left: 0, right: 0, top: 0, bottom: 0})
					.resize(true)
					.range(timeline.range);

				timeline.svg = d3.select("#activityTimeline")
					.datum(timeLineRange).call(timeLineConstruct);

			}
		}


	};


	$(el+" .timeline").click(function(){

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
						top: $(this).closest('.explore_metrics').children('.visible').is('#explore_map') ? "0": "calc(50% - " + ($(this).closest('.explore_metrics').outerHeight()/2) + "px)"
					})
					.find('.metric_controls')
					.fadeOut(250);

				$("body").css({overflow:"hidden"});

				if ($(this).closest('.explore_metrics').children('.visible').is('#explore_map')) {
					var mapContainerID = $(this).closest('.explore_metrics').children('#explore_map.visible').attr('id');
					var dims = {w: $("#" + mapContainerID).outerWidth() - $(window).width(), h: $("#" + mapContainerID).outerHeight() - $(window).height()};
				}

				$("#lightbox_bg").unbind().click(function(){
					if ($(".expanded_metrics").children('.visible').is('#explore_map')) {
						var mapContainerID = $(".expanded_metrics").children('#explore_map.visible').attr('id');
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


	$(el).dragslider({
		range: true,
		rangeDrag: true,
		min: timeline.min,
		max: timeline.max,
		step: timeline.step,
		values: defaultValues,
		create: function(e, ui) {

			timeline.position = $(this).dragslider("values");
		//	timeline.setSlider(timeline.position);
		//	updateURL();
			$(".ui-slider .ui-slider-handle").focus(function(){$(this).blur();});
			if (motusMap.setVisibility) {motusMap.setVisibility();}
		},
		slide: function( event, ui ) {

			$("#explore_filters").parent(":not(.active)").addClass('active');
			timeline.position = $(this).dragslider("values");
			timeline.setSlider(timeline.position);
			motusMap.setVisibility();
		},
		stop: updateURL
	});
	timeline.range = $(el).dragslider('option', 'max') - $(el).dragslider('option', 'min');

}



function animateTimeline(el) {

	timeline.animationStartVals = timeline.position;

	timeline.distance = timeline.position[1] - timeline.position[0];

	timeline.distance = (timeline.distance / timeline.range) > 0.99 ? timeline.range / 100 : timeline.distance;

	$(el).find(".slider").dragslider('values', [timeline.min, timeline.min + timeline.distance]);

	if (typeof timeline.duration === 'undefined') {
		timeline.duration = 3000 - (3000 * timeline.distance / timeline.range);
	}

	if (typeof timeline.timer === 'undefined') {timeline.timer = d3.timer(timeline.animate);}

	else {timeline.timer.restart(timeline.animate)}

	if (timeline.timer !== 'undefined') {timeline.timer.stop();}

	timeline.timer = d3.timer(timeline.animate);
}
