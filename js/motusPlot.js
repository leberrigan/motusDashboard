
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
    default:
      console.error("Motus plot type not set.");
      return;
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

  function dataHover(e, datum, dir){

    console.log(datum);
    if (typeof e.touches !== 'undefined') {
      e.preventDefault();
    }
    if (dir == 'in') {

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
  const I = d3.range(X.length).filter(i => !isNaN(X[i]) && !isNaN(Y[i]));

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
