function zoomableTimeline(data,{
		width = 500,
		height = 250,
		margin = {top: 20, right: 20, bottom: 30, left: 30},
		svg = d3.create("svg")
				.attr("viewBox", [0, 0, width, height]),
		colourScale = d3.scaleSequential(d3.interpolateTurbo).domain([ 1, 10 ]),
		colourVals = []
	} = {}){
	var chart = () => {
		  const zoom = d3.zoom()
		      .scaleExtent([1, 32])
		      .extent([[margin.left, 0], [width - margin.right, height]])
		      .translateExtent([[margin.left, -Infinity], [width - margin.right, Infinity]])
		      .on("zoom", zoomed);

			svg.on("touchstart touchmove mousemove", dataHover)
				 .on("touchend mouseleave", function(e) {dataHover(e, "out");});

		  svg.append("clipPath")
		      .attr("id", "timeline-clipPath")
		    .append("rect")
		      .attr("x", margin.left)
		      .attr("y", margin.top)
		      .attr("width", width - margin.left - margin.right)
		      .attr("height", height - margin.top - margin.bottom)

//console.log(data);
//console.log(d3.stack().keys(colourVals)(data));
/*		  const path = svg//.selectAll('path')
	//				.data(d3.stack().keys(colourVals)(data))
	//				.enter()
					.append("path")
		      .attr("clip-path", "url(#timeline-clipPath)")
		      .attr("class", "area-path")
//		      .attr("fill", d => colourScale(d.key))
//		      .attr("d", d => area(d, x));
		      .attr("d", area(data, x));*/

			var grect = svg.append("g")
					.attr("clip-path", "url(#timeline-clipPath)")
					.attr("class", "area-path")
//
		//	const dayWidth = x(24*60*60*1000) - x(0);

			var dayWidth = x(data[1].date) - x(data[0].date);
			console.log(dayWidth)
			motusData.test = data;
			const rects = grect.selectAll("rect")
					.data(data)
					.enter()
					.append("rect")
		      .attr("fill", d => colourScale(d.colour.length))
					.attr("x", d => x(d.date))
					.attr("y", d => y(d.value))
					.attr("width", d => dayWidth)
					.attr("height", d => y(0) - y(d.value))

		  const gx = svg.append("g")
		      .call(xAxis, x);

		  svg.append("g")
		      .call(yAxis, y);

		  svg.call(zoom)
		    .transition()
	      .duration(750)


			tooltip_data_bar.append('rect')
											.attr('width', dayWidth)
											.attr('height', height)
											.attr('fill', '#000')
											.attr('x', 0)
											.attr('y', 0);

		  function zoomed(event) {
		    const xz = event.transform.rescaleX(x);
				x_scale = xz;
		//    path.attr("d", (d) => area(d, xz));
		  //  path.attr("d", area(data, xz));
		//		const dayWidth = xz(24*60*60*1000) - xz(0);

				dayWidth = xz(data[1].date) - xz(data[0].date);

				rects.attr("width", dayWidth)
						 .attr("x", d => xz(d.date));

			 	tooltip_data_bar.attr("width", dayWidth)

		    gx.call(xAxis, xz);
		  }

		  return svg.node();
		}

		var area = (data, x) => d3.area()
	    .curve(d3.curveStepAfter)
	    .x(d => x(d.date))
	    .y0(y(0))
	    .y1(d => y(d.value))
			(data);

		var tooltip_data_bar = svg.append('g')
															.style('display', 'none');
		var yAxis = (g, y) => g
	    .attr("transform", `translate(${margin.left},0)`)
	    .call(d3.axisLeft(y).ticks(null, "s"))
	    .call(g => g.select(".domain").remove())
	    .call(g => g.select(".tick:last-of-type text").clone()
	        .attr("x", 3)
	        .attr("text-anchor", "start")
	        .attr("font-weight", "bold")
	        .text(data.y));

		var xAxis = (g, x) => g
	    .attr("transform", `translate(0,${height - margin.bottom})`)
	    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

		var y = d3.scaleLinear()
	    .domain([0, d3.max(data, d => d.value)]).nice()
	    .range([height - margin.bottom, margin.top]);

		var x = d3.scaleUtc()
	    .domain(d3.extent(data, d => d.date))
	    .range([margin.left, width - margin.right]);

		var x_scale = x;

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
			const date =  x_scale.invert( x_pos ).toISOString().substr(0, 10);
			const d = data.filter( d => d.date.toISOString().substr(0, 10) == date)[0];
	//		console.log(x_pos)
//			console.log(data)
	//		console.log(date)
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
	return chart();
}
