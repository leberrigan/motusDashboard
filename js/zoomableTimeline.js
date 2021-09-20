function zoomableTimeline(data,{
		width = 500,
		height = 250,
		margin = {top: 20, right: 20, bottom: 30, left: 30},
		focusHeight = 100,
		svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, focusHeight])
      .style("display", "block"),
		colourScale = d3.scaleSequential(d3.interpolateTurbo).domain([ 1, 10 ]),
		colourVals = [],
		plotHeight = height - focusHeight,
		focus = []
	} = {}){

	var area = (data, x) => d3.area()
    .curve(d3.curveStepAfter)
    .x(d => x(d.date))
    .y0(y(0))
    .y1(d => y(d.value))
		(data);

	var tooltip_data_bar = svg.append('g')
														.style('display', 'none');
	var yAxis = (g, y, title) => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(null, "s"))
    .call(g => g.select(".domain").remove())
    .call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(data.y))
    .call(g => g.selectAll(".title").data([title]).join("text")
        .attr("class", "title")
        .attr("x", -margin.left)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text(title));

	var xAxis = (g, x, height) => g
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

	var y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)]).nice()
    .range([plotHeight, margin.top]);

	var x = d3.scaleUtc()
    .domain(d3.extent(data, d => d.date))
    .range([margin.left, width - margin.right]);

	var x_scale = x;

	var zoom;

	var chart = (() => {

			zoom = d3.zoom()
					.scaleExtent([1, 32])
					.extent([[margin.left, margin.top], [width - margin.right, plotHeight]])
					.translateExtent([[margin.left, -Infinity], [width - margin.right, Infinity]])
					.on("zoom", zoomed);

		  svg.append("clipPath")
		      .attr("id", "timeline-clipPath")
		    .append("rect")
		      .attr("x", margin.left)
		      .attr("y", margin.top)
		      .attr("width", width - margin.left - margin.right)
		      .attr("height", plotHeight)

			var grect = svg.append("g")
					.attr("clip-path", "url(#timeline-clipPath)")
					.attr("class", "rects")

			grect.on("touchstart touchmove mousemove", dataHover)
				 	 .on("touchend mouseleave", function(e) {dataHover(e, "out");});

			var dayWidth = x(data[1].date) - x(data[0].date);

			const rects = grect.selectAll("rect")
					.data(data)
					.enter()
					.append("rect")
		      .attr("fill", d => colourScale(d.colour.length))
					.attr("x", d => x(d.date))
					.attr("y", d => y(d.value))
					.attr("width", d => dayWidth)
					.attr("height", d => y(0) - y(d.value))

		  const gx = svg.append("g");

		  const gy = svg.append("g");

		  svg.call(zoom)
		    .transition()
	      .duration(750);

			tooltip_data_bar.append('rect')
											.attr('width', dayWidth)
											.attr('height', plotHeight)
											.attr('fill', '#000')
											.attr('x', 0)
											.attr('y', 0);

		  function zoomed(event) {
//				console.log(event);
				var sourceEvent = event.sourceEvent

	  		if (!sourceEvent || sourceEvent.type === "mousemove") return;

		    const xz = event.transform.rescaleX(x);
				x_scale = xz;

				dayWidth = xz(data[1].date) - xz(data[0].date);

				rects.attr("width", dayWidth)
						 .attr("x", d => xz(d.date));

			 	tooltip_data_bar.attr("width", dayWidth)

	      gx.call(xAxis, xz, height - focusHeight);

				const brushExtent = x.range().map(xz.invert, xz).map(x);

				if (brushExtent[0] == x.range()[0] && brushExtent[1] == x.range()[1])  {
					svg.select(".brush").call(brush.clear);
				} else {
				  svg.select(".brush").call(brush.move, brushExtent );
				}

		  }

		  return Object.assign(svg.node(), {
		    update(focusX, focusY) {

		      gx.call(xAxis, focusX, plotHeight);
		      gy.call(yAxis, focusY, data.y);

					dayWidth = focusX(data[1].date) - focusX(data[0].date);

					rects.attr("width", dayWidth)
							 .attr("x", d => focusX(d.date));
		    }
		  });
		})();

  const brush = d3.brushX();

	var focusView = () => {

		svg.append("g")
			.append("rect")
			.attr("x", margin.left/2)
			.attr("y", plotHeight + margin.top)
			.attr("width", width - ((margin.left/2) + (margin.right/2)))
			.attr("height", focusHeight + margin.top)
			.style("stroke-width", "1px")
			.style("stroke", "#000000")
			.style("fill", "none")

	  brush.extent([[margin.left, plotHeight + margin.top + 0.5], [width - margin.right, plotHeight + focusHeight + margin.top - 0.5]])
	      .on("brush", brushed)
	      .on("end", brushended);

	  const defaultSelection = x.domain();

	  svg.append("g")
				.attr('class','brush-axis-x')
	      .call(xAxis, x, plotHeight + focusHeight + margin.top);

		var dayWidth = x(data[1].date) - x(data[0].date);

		const y_copy = y.copy().range([plotHeight + focusHeight + margin.top, plotHeight + margin.top]);

		const rects = svg.append('g')
				.attr('class','brush-rects')
				.selectAll('rect')
				.data(data)
				.enter()
				.append("rect")
	      .attr("fill", d => colourScale(d.colour.length))
				.attr("x", d => x(d.date))
				.attr("y", d => y_copy(d.value))
				.attr("width", d => dayWidth)
				.attr("height", d => y_copy(0) - y_copy(d.value))


		const gb = svg.append("g")
				.attr('class','brush')
				.call(brush)
				.call(brush.move, defaultSelection)
				console.log(brush);
	 // function brushed({selection, sourceEvent}) {

	  function brushed(event) {
//			console.log(event);
			var sourceEvent = event.sourceEvent
			var selection = event.selection;
  		if (!sourceEvent || sourceEvent.type === "zoom") return;
	    if (selection) {
	      svg.property("value", selection.map(x.invert, x).map(d3.utcDay.round));
	      svg.dispatch("input");
			//	console.log(selection.map(x.invert, x).map(d3.utcDay.round));
				focus = selection.map(x.invert, x).map(d3.utcDay.round);

				svg.call(zoom.transform, d3.zoomIdentity
				      .scale(width / (selection[1] - selection[0]))
				      .translate(-selection[0], 0));

				update();
	    }
	  }

	  function brushended({selection}) {
	    if (!selection) {
	      gb.call(brush.move, defaultSelection);
				focus = defaultSelection;
				update();
	    }
	  }

		focus = defaultSelection;

	  return svg.node();
	}


	function dataHover(e, dir = 'in') {
		//							from: https://observablehq.com/@d3/line-chart-with-tooltip
		if (dir == 'in') {
			const x_pos = d3.pointer(e, this)[0];
			const date =  x_scale.invert( x_pos ).toISOString().substr(0, 10);
			const d = data.filter( d => d.date.toISOString().substr(0, 10) == date)[0];
			console.log(x_pos)
			console.log(data)
			console.log(date)
			$('.tooltip').html(
				"<center><h3>"+
					( date )+
				"</h3></center>"+
				(d ?
					`<table style="width:100%;text-align:center;font-size:14pt;"><tbody>`+
						`<tr><td>${d.value} ${icons.animals}</td><td style="padding-left: 10px;">${d.colour.length} ${icons.species}</td></tr>`+
						`<tr><td><b>Animal${d.value==1?"":"s"}</b></td><td style="padding-left: 10px;"><b>Species</b></td></tr>`+
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
	var update = function() {
	  const [minX, maxX] = focus;
	  const maxY = d3.max(data, d => minX <= d.date && d.date <= maxX ? d.value : NaN);
		if (!isNaN(maxY)) {
	  	chart.update(x.copy().domain(focus), y.copy().domain([0, maxY]));
		}
	};
	focusView();
	update();
}
