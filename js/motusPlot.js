// Usage:
//    motusPlot(motusData.tracksLongByAnimal,{plotType:"lonByJDate", cardID: x})
function motusPlot(d, {
  plotType,
  width = 480,
  height = 300,
  appendType = "appendTo",
  cardID,
  yLabel = "",
  parentEl = $("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline")
} = {}) {

  if (!d) {
    console.error("Missing Motus plot data");
    return;
  }
  if (d.length == 0) {
    console.error("Motus plot data length = 0");
    return;
  }
  $("#explore_card_" + cardID + " > div:not(.explore-card-header)").hide();
  $("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline svg").hide();
  $("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline").show().parent().show();


  switch(plotType) {
    case "latByJDate":
      coordsByJDate();
    break;
    case "lonByJDate":
      coordsByJDate();
    break;
    case "hourlyActivity":
      hourlyActivity();
    break;
    default:
      console.error("Motus plot type not set.");
      return;
  }

  function hourlyActivity() {

    if ($(".explore-card-" + cardID + "-timeline").length == 0) {

      $("#explore_card_" + cardID + "")
        .append( $("<div class='explore-card-chart-wrapper'><div class='explore-card-" + cardID + "-timeline'></div></div>") )
    }
    if ($(".explore-card-" + cardID + "-timeline svg.activity-by-hour").length == 0) {


      console.log(`Make a ${plotType} plot`);

      yLabel = ""; // y-axis label is blank since it is a categorical axis

      let data = Object.keys(d).map(k => {
        if (k == 'gps') {
          return d[k].map( v => {
            return [v.date, 'gps', v.fixes];
          });
        } else if (k == 'pulses') {
          return d[k].map( v => {
            return [v.date, `antenna ${v.port} pulses`, v.count];
          });
        } else if (k == 'hits') {
          return d[k].map( v => {
            return [v.date, `antenna ${v.port} hits`, v.count];
          });
        }
      }).flat();

      yDomain = [...new Set(data.map(x=>x[1]))];

      console.log(data);
      console.log(yDomain);

      width = parentEl.width();
      height = parentEl.height();

      let chart = Scatterplot(data, {
        xLabel: "Date",
        xType: d3.scaleUtc, // the x-scale type
      //  xFormat: "%j", // Julian date
        yLabel: yLabel,
        yType: d3.scalePoint,
        yDomain: yDomain,
        colour: ([,,colour]) => colour,
        width: width,
        height: height,
        colourScale: motusMap.colourScale,
        dataHover: function(a,b,c){dataHover(a,b,c,"activity");}
      });

      $(chart).addClass(yLabel.toLowerCase()+"-by-hour").appendTo(".explore-card-" + cardID + "-timeline");
    }

  }

  function coordsByJDate() {

    yLabel = plotType == 'latByJDate' ? "Latitude" : "Longitude";


    if ($(".explore-card-" + cardID + "-timeline").length == 0) {

      $("#explore_card_" + cardID + "")
        .append( $("<div class='explore-card-chart-wrapper'><div class='explore-card-" + cardID + "-timeline'></div></div>") )
    }
    if ($(".explore-card-" + cardID + "-timeline svg."+yLabel.toLowerCase()+"-by-jdate").length == 0) {

      console.log(`Make a ${plotType} plot`);

      let data = d.map( v => {

        return v.tracks.map( (val, i) => [
          new Date(v.ts[i] * 1000).setYear("2020"),
          val[ plotType == 'latByJDate' ? 1 : 0],
          v[ motusMap.colourVar ],
          v.id,
          v.stations[i]
//          new Date(v.ts[i] * 1000).getUTCFullYear()
        ] ); // [x , y]
      }).flat();

      console.log(data);
      width = parentEl.width();
      height = parentEl.height();


      let chart = Scatterplot(data, {
        xLabel: "Julian Date",
        xType: d3.scaleUtc, // the x-scale type
      //  xFormat: "%j", // Julian date
        yLabel: yLabel,
        colour: ([,,colour]) => colour,
        width: width,
        height: height,
        colourScale: motusMap.colourScale,
        dataHover: dataHover
      });

      $(chart).addClass(yLabel.toLowerCase()+"-by-jdate").appendTo(".explore-card-" + cardID + "-timeline");
    }

  }

  function dataHover(e, datum, dir, plotType){

    console.log(datum);
    if (typeof e.touches !== 'undefined') {
      e.preventDefault();
    }
    if (dir == 'in') {

      if (plotType == "activity") {

        $('.tooltip').html(
          "<big>"+datum[1]+"</big>"+
          `<br/>${icons.timeline} ${new Date(datum[0]).toLocaleString()}`+
          (
            datum[1] == 'gps' ? `<br/>${datum[2]} gps fixes` :
            datum[1].includes('pulses') ? `<br/>${datum[2]} pulses` :
                                `<br/>${datum[2]} tag hits`
          )

        );

      } else {
        var species = "Loading...";
        var track = motusData.tracksLongByAnimal.filter( x => x.id == datum[3] )[0];
        var station = motusData.stations.filter( x => x.id == datum[4] )[0];
        console.log(track);

        // Make a request to the database to find the species name
         motusData.db.animals.get( datum[3].toString() ).then( animal => {
          // var animal = exploreType == 'main' ? motusData.animals.filter( x => x.id == d.id )[0] : motusData.selectedAnimals.filter( x => x.id == d.id )[0];
           let species = typeof animal.species === 'undefined' || animal.species == "NA" ? "Unknown species" : motusData.species.filter(x => x.id == animal.species)[0];
           species = typeof species === 'undefined' ? "Unknown species" : species[currLang];
           console.log(animal);
           // When request received, add the text
            $('.tooltip').html("<center><h3>"+
                          icons.species + "&nbsp;&nbsp;&nbsp;" + (species) +
                          ` (#${track.id})` +
                           "&nbsp;&nbsp;&nbsp;" +
                          `<a class='station-status station-status-${animal.status}'>`+
                            `${firstToUpper(animal.status)}`+
                          "</a>"+

                        "</h3></center>"+
                        "<center><h3>"+
                            `${icons.station} ${station.name}`+

                       "&nbsp;&nbsp;&nbsp;&nbsp;" +
                  //      "</h3></center><center><h3>"+
                            `${icons.timeline} ${new Date(datum[0]).toISOString().substr(0,10)}`+

                        "</h3></center>"+

                        `<div class='tooltip-grid'>`+

                          `<div><b>Distance travelled: </b>${Math.round(d3.sum(track.dist)/1000)} km</div>`+

                          `<div><b>Average speed: </b>${Math.round(36 * d3.sum(track.dist)/(track.ts[track.ts.length-1]-track.ts[0]))/10} km/h</div>`+

                          `<div class='tooltip-grid-colspan2'><b>Project: </b>${motusData.projects.filter(x => x.id == animal.project)[0].name} (#${animal.project})</div>`+


                        `</div>`);
         });

        $('.tooltip').html(
          "<big>"+species+"</big>"+
          "</br>(Click to view profile)"
        );

      }
      if (typeof e.touches !== 'undefined') {
        if ($(document).width() < 600) {
          $('.tooltip').css({top:$(document).scrollTop() + 10, left: ($(document).width() - $('.tooltip').outerWidth()) / 2 });
        } else {
          if (e.touches[0].pageX + 15 + $('.tooltip').outerWidth() > $(window).width()) {
            $('.tooltip').css({top:e.touches[0].pageY - 10, left:e.touches[0].pageX - $('.tooltip').outerWidth() - 15});
          } else {
            $('.tooltip').css({top:e.touches[0].pageY - 10, left:e.touches[0].pageX + 15});
          }
        }
      } else {
        if (e.pageX + 15 + $('.tooltip').outerWidth() > $(window).width()) {
          $('.tooltip').css({top:e.pageY - 10, left:e.pageX - $('.tooltip').outerWidth() - 15});
        } else {
          $('.tooltip').css({top:e.pageY - 10, left:e.pageX + 15});
        }
      }
      $('.tooltip:hidden').show();
      if (isMobile) {
        $('.tooltip_bg:hidden').show();
      }
  	} else if (dir == 'out') {
  		$('.tooltip').hide();
  	}
  }

  $("#explore_card_" + cardID + " .explore-card-" + cardID + "-timeline svg."+yLabel.toLowerCase()+"-by-jdate").show();

}



function LineChart(data, {
  x = ([x]) => x, // given d in data, returns the (temporal) x-value
  y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
  defined, // for gaps in data
  curve = d3.curveLinear, // method of interpolation between points
  marginTop = 20, // top margin, in pixels
  marginRight = 30, // right margin, in pixels
  marginBottom = 30, // bottom margin, in pixels
  marginLeft = 40, // left margin, in pixels
  width = 640, // outer width, in pixels
  height = 400, // outer height, in pixels
  xType = d3.scaleUtc, // the x-scale type
  xDomain, // [xmin, xmax]
  xRange = [marginLeft, width - marginRight], // [left, right]
  yType = d3.scaleLinear, // the y-scale type
  yDomain, // [ymin, ymax]
  yRange = [height - marginBottom, marginTop], // [bottom, top]
  yFormat, // a format specifier string for the y-axis
  yLabel, // a label for the y-axis
  colour = "currentColor", // stroke color of line
  strokeLinecap = "round", // stroke line cap of the line
  strokeLinejoin = "round", // stroke line join of the line
  strokeWidth = 1.5, // stroke width of line, in pixels
  strokeOpacity = 1, // stroke opacity of line
} = {}) {
  // Compute values.
  const X = d3.map(data, x);
  const Y = d3.map(data, y);
  const I = d3.range(X.length);
  if (defined === undefined) defined = (d, i) => !isNaN(X[i]) && !isNaN(Y[i]);
  const D = d3.map(data, defined);

  // Compute default domains.
  if (xDomain === undefined) xDomain = d3.extent(X);
  if (yDomain === undefined) yDomain = [0, d3.max(Y)];

  // Construct scales and axes.
  const xScale = xType(xDomain, xRange);
  const yScale = yType(yDomain, yRange);
  const xAxis = d3.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0);
  const yAxis = d3.axisLeft(yScale).ticks(height / 40, yFormat);

  // Construct a line generator.
  const line = d3.line()
      .defined(i => D[i])
      .curve(curve)
      .x(i => xScale(X[i]))
      .y(i => yScale(Y[i]));

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(xAxis);

  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(yAxis)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("x2", width - marginLeft - marginRight)
          .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text(yLabel));

  svg.append("path")
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", strokeWidth)
      .attr("stroke-linecap", strokeLinecap)
      .attr("stroke-linejoin", strokeLinejoin)
      .attr("stroke-opacity", strokeOpacity)
      .attr("d", line(I));

  return svg.node();
}


function Scatterplot(data, {
  x = ([x]) => x, // given d in data, returns the (quantitative) x-value
  y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
  r = 3, // (fixed) radius of dots, in pixels
  title, // given d in data, returns the title
  marginTop = 20, // top margin, in pixels
  marginRight = 100, // right margin, in pixels
  marginBottom = 30, // bottom margin, in pixels
  marginLeft = 100, // left margin, in pixels
  inset = r * 2, // inset the default range, in pixels
  insetTop = inset, // inset the default y-range
  insetRight = inset, // inset the default x-range
  insetBottom = inset, // inset the default y-range
  insetLeft = inset, // inset the default x-range
  width = 640, // outer width, in pixels
  height = 400, // outer height, in pixels
  xType = d3.scaleLinear, // type of x-scale
  xDomain, // [xmin, xmax]
  xRange = [marginLeft + insetLeft, width - marginRight - insetRight], // [left, right]
  yType = d3.scaleLinear, // type of y-scale
  yDomain, // [ymin, ymax]
  yRange = [height - marginBottom - insetBottom, marginTop + insetTop], // [bottom, top]
  xLabel, // a label for the x-axis
  yLabel, // a label for the y-axis
  xFormat, // a format specifier string for the x-axis
  yFormat, // a format specifier string for the y-axis
  fill = "currentColor", // fill color for dots
  fillOpacity = "0.1", // fill color for dots
  stroke = "currentColor", // stroke color for the dots
  colour = "#000",
  colourScale,
  strokeWidth = 1.5, // stroke width for dots
  halo = "#fff", // color of label halo
  haloWidth = 3, // padding around the labels
  dataHover
} = {}) {
  // Compute values.
  const X = d3.map(data, x);
  const Y = d3.map(data, y);
  const COLOUR = d3.map(data, colour);
  const T = title == null ? null : d3.map(data, title);

  const I = yType().name == 'i' ?
              d3.range(X.length).filter(i => !isNaN(X[i])) :
              d3.range(X.length).filter(i => !isNaN(X[i]) && !isNaN(Y[i]));

  console.log("X: ", X);
  console.log("Y: ", Y);
  // Compute default domains.
  if (xDomain === undefined) xDomain = d3.extent(X);
  if (yDomain === undefined) yDomain = d3.extent(Y);

  // Construct scales and axes.
  const xScale = xType(xDomain, xRange);
  const yScale = yType(yDomain, yRange);
  const xAxis = d3.axisBottom(xScale).ticks(width / 80, xFormat);
  const yAxis = d3.axisLeft(yScale).ticks(height / 50, yFormat);

  const svg = d3.create("svg")
    //  .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "width: 100%;");

  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(xAxis)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("y2", marginTop + marginBottom - height)
          .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
          .attr("x", width / 2)
          .attr("y", marginBottom + 4)
          .attr("fill", "currentColor")
          .attr("text-anchor", "end")
          .text(xLabel));

  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(yAxis)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("x2", width - marginLeft - marginRight)
          .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
          .attr("x", -height / 2)
          .attr("y", -35)
          .attr("transform", "rotate(-90)")
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text(yLabel));

  if (T) svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
    .selectAll("text")
    .data(I)
    .join("text")
      .attr("dx", 7)
      .attr("dy", "0.35em")
      .attr("x", i => xScale(X[i]))
      .attr("y", i => yScale(Y[i]))
      .text(i => T[i])
      .call(text => text.clone(true))
      .attr("fill", "none")
      .attr("stroke", halo)
      .attr("stroke-width", haloWidth);

  svg.append("g")
      .attr("stroke-width", strokeWidth)
    .selectAll("circle")
    .data(I)
    .join("circle")
      .attr("stroke", i => colourScale(COLOUR[i]))
      .attr("fill", i => colourScale(COLOUR[i]))
      .attr("fill-opacity", fillOpacity)
      .attr("cx", i => xScale(X[i]))
      .attr("cy", i => yScale(Y[i]))
      .attr("r", r)
      .on("mouseover touchstart", (e,i) => {dataHover(e,data[i],"in");})
      .on("mouseout touchend", (e,i) => {dataHover(e,data[i],"out");});

  return svg.node();
}




function detectionTimeline( d, {
															width = 300,
															height = 60,
															timelineScale = d3.scaleLinear().domain([ timeline.min, timeline.max ]).range([ 0, width ]),
															dayWidth = timelineScale( (3 * 24 * 60 * 60 * 1000) ),
															colourScale = d3.scaleSequential(d3.interpolateSinebow).domain([ 1, 10 ]),
															timelineSVG = $("<svg width='"+width+"' height='"+height+"' style='margin:-8px 0;cursor:pointer;'></svg>"),
															resize = false,
															dataSource = 'station',
															yAxis = false,
															margin = {left: 40, right: 20},
															zoomable = false,
															setTimeline = false,
															selectedStation = false,
															timeLineRange = {min: new Date(timeline.min * 1000), max:new Date(timeline.max * 1000)}
														} = {} ) {

//	console.log(colourScale.range())
	timeline.colourScale = colourScale;
//	console.log("Station: %s, Timeline Range: %o", d[0]?d[0].name:d, timeLineRange)

	if (width > 0) {
		timelineScale = d3.scaleLinear().domain([ timeLineRange.min, timeLineRange.max ]).range([margin.left, width-margin.right])
		timeLineRange.range = (timeLineRange.max - timeLineRange.min)
		dayWidth = dayWidth < 1 ? 1 : dayWidth;

		var timeFormat = ( timeLineRange.range / (1000 * 60 * 60 * 24 * 365) ) * ( 300 / width ) > 2 ? "%Y" :
								( ( timeLineRange.range / (1000 * 60 * 60 * 24 * 365) ) * ( 300 / width ) > 1 ? "%b %Y" : "%Y-%m-%d" );

		var x_scale = d3.scaleTime()
									.domain( [ timeLineRange.min, timeLineRange.max ] )
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

		if ( dataSource == 'station' ) {

      let stationDeps = motusData.stationDeps.filter( x => x.stationID == selectedStation );

	    stationDeps.forEach(function(v) {
        let dtEnd = v.dtEnd==null?new Date():v.dtEnd;
				var w = width * ((dtEnd.valueOf()) - (v.dtStart.valueOf())) / timeLineRange.range;
				var x = width * ((v.dtStart.valueOf()) - (timeLineRange.min - 1000)) / timeLineRange.range;

				svg
					.append('rect')
					.attr('width', w)
					.attr('height', height)
					.attr('x', x)
					.style('fill', '#CCCCCC');

				var g = d3.select( timelineSVG[0] )
					.append('g');
      });
    }

		if (d.length > 0) {
			hasData = true;
		}
		d.forEach(function({id, ts, stations, species, project, frequency}, ind) {

			var dates = [];
			var spp = [];
			var animals = [];

			stations.forEach((station, i) => {
					if (
								( dataType == "projects" || motusFilter.projects.includes('all') || motusFilter.projects.includes( project ) ) &&
								( motusFilter.frequencies.includes('all') || motusFilter.frequencies.includes( frequency ) ) &&
								( dataType == "species" || motusFilter.species.includes('all') || motusFilter.species.includes( species ) ) &&
								( dataType == "animals" || motusFilter.animals.includes('all') || motusFilter.animals.includes( id ) ) &&
								(
                  (dataSource == "station" && selectedStation == station) ||
                  ( dataSource != "station" &&
                    (
                      ( motusFilter.stations.includes('all') && dataType != "stations" ) ||
                      motusFilter.stations.includes(station) ||
                      ( motusFilter.selections.includes( station ) && dataType == "stations" )
                    )
                  )
                ) &&
								(
									dataType == "regions" || motusFilter.regions.includes('all') || true
								)
							) {

						dates.push( ts[i]*1000 );
						spp.push( species );
						animals.push( id );
					}
			})

			var data = countInstances( dates.map(k => new Date(k).valueOf()) );

			spp.forEach(function(k, i){

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

			colourScale.domain(d3.extent(stationHits, x => x.colour.length));

		//	x_scale.domain(d3.extent(stationHits, x => x.date));
			g.selectAll('rect')
				.data(stationHits)
				.enter()
					.append('rect')
						//.attr('width', 3 ) // Three days
						.attr('width', x_scale(new Date("2020-01-02")) - x_scale(new Date("2020-01-01")) ) // one day
						.attr('height', (x) => y_scale(x.value) )
						.attr('x', (x) => x_scale(x.date) )
						.attr('fill', (x) => colourScale(x.animals.length) )
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

//			alert(`${resize.width()} - ${width}`);

			if (resize.length > 0 && resize.width() > 0 && width != resize.width()) {


				var width_el = resize;
				var tmp_width = 0;

				while(tmp_width == 0 && width_el.get(0).tagName != "BODY") {
					tmp_width = width_el.width();
					width_el = width_el.parent();
				}

				if (tmp_width != width) {
					width = tmp_width;
					resize.find("svg").remove();
					resize.append( detectionTimeline( d, {
						width:width,
						timelineSVG: $("<svg height='"+height+"' style='width:100%;margin:-8px 0;cursor:pointer;'></svg>"),
						dataSource: dataSource,
						colourScale: d3.scaleSequential().domain([ 1, 10 ]).range(["#000000","#000000"]),
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
//			console.log("Station '%s' scale: %o",d[0].name, x_scale.domain())
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
