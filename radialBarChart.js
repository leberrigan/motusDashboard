

(function () {
	d3.radialBarChart = function() {

		var colourScale = null;

		function radialBarChart( gParent ) {
			var data = gParent.data()[0];

			var gParentSize = gParent.node().getBoundingClientRect(); // the svg size
			var gParentItem = d3.select(gParent.node()); // the svg

			console.log(gParent);
		//	console.log(d3.max(data, d => d?d.total:d));

			var outerRadius = Math.min(gParentSize.width, gParentSize.height) / 2,
				width = gParentSize.width,
				height = gParentSize.height,
				innerRadius = Math.min(gParentSize.width, gParentSize.height) / 4;

				console.log(width + ", " + height)
		//	var grp = gParent.append("g").attr("class", "container");

		//	grp.each(function(data, i) {


			var legend = g => g.append("g")
					.selectAll("g")
					.data(data.columns.slice(1).reverse())
					.join("g")
						.attr("transform", (d, i) => `translate(-40,${(i - (data.columns.length - 1) / 2) * 20})`)
						.call(g => g.append("rect")
							.attr("width", 18)
							.attr("height", 18)
							.attr("fill", z))
						.call(g => g.append("text")
							.attr("x", 24)
							.attr("y", 9)
							.attr("dy", "0.35em")
							.text(d => firstToUpper(d)))


			var y = d3.scaleRadial()
				.domain([0, d3.max(data, d => d.total)])
				.range([innerRadius, outerRadius])

			var x = d3.scaleBand()
				.domain(data.map(d => d[data.columns[0]]))
				.range([0, 2 * Math.PI])
				.align(0)

			//x.domain(x.domain())

			//console.log(data.map(d => d[data.columns[0]]).filter(d=>!(d%12)))

			var z = colourScale === null ? d3.scaleOrdinal()
					.domain(data.columns.slice(1))
					.range(customColourScale.jnnnnn.slice(0, data.columns.slice(1).length).reverse()) :	colourScale

			var yAxis = g => g
				.attr("text-anchor", "middle")
				.call(g => g.append("text")
					.attr("y", d => -y(y.ticks(5).pop()))
					.attr("dy", "-1em")
					.text("Count"))
				.call(g => g.selectAll("g")
				  .data(y.ticks(5).slice(1))
				  .join("g")
					.attr("fill", "none")
					.call(group => group.append("circle")
						.attr("stroke", "#000")
						.attr("stroke-opacity", 0.5)
						.attr("r", y))
					.call(group => group.append("text")
						.attr("y", d => -y(d))
						.attr("dy", "0.35em")
						.attr("stroke", "#fff")
						.attr("stroke-width", 5)
						.text(y.tickFormat(5, "s"))
					 .clone(true)
						.attr("fill", "#000")
						.attr("stroke", "none")))

			var dateFun = dateFormat == "H" ? (d=>moment( d[data.columns[0]] ).format( dateFormat )) : (d=> moment().dayOfYear( d[data.columns[0]] ).format( dateFormat ) );


			var xAxis = g => g
				.attr("text-anchor", "middle")
				.call(g => g.selectAll("g")
				  .data(data)
				  .join("g")
					.attr("transform", d => `
					  rotate(${((x(d[data.columns[0]]) + x.bandwidth() / 2) * 180 / Math.PI - 90)})
					  translate(${innerRadius},0)
					`)
					.call(g => g.append("line")
						.attr("x2", -5)
						.attr("stroke", "#000"))
					.call(g => g.append("text")
						.attr("transform", d => (x(d[data.columns[0]] + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI
							? "rotate(90)translate(0,16)"
							: "rotate(-90)translate(0,-9)"))
						.text( dateFun )));

			var arc = d3.arc()
				.innerRadius(d => y(d[0]))
				.outerRadius(d => y(d[1]))
				.startAngle(d => x(d.data[data.columns[0]]))
				.endAngle(d => x(d.data[data.columns[0]]) + x.bandwidth())
				.padAngle(0.01)
				.padRadius(innerRadius)

			gParentItem
				.attr("viewBox", `${-width / 2} ${-10-height / 2} ${width} ${height}`)
			//	.style("width", "calc(100% - 20px)")
			//	.style("height", "calc(100% - 20px)")
				.style("font", "10px sans-serif");

			gParentItem.append("g")
				.selectAll("g")
				.data(d3.stack().keys(data.columns.slice(1))(data))
				.join("g")
				.attr("fill", d => z(d.key))
				.attr("class", d => `animal-timeline-arcs-${d.key}`)
				.selectAll("path")
				.data(d => d)
				.join("path")
				.attr("d", arc)
				.style('pointer-events', 'auto')
				.on('touchstart mouseover', (e,d) => dataHover(e, d, 'in'))
				.on('touchend mouseout', (e,d) => dataHover(e, d, 'out'))
				.on('click', (e,d) => dataClick(e, d));

			gParentItem.append("g")
				.call(xAxis);

			gParentItem.append("g")
				.call(yAxis);

			gParentItem.append("g")
				.append('g')
				.append('g')
				.attr("transform", `translate(-40,${(-1 - (data.columns.length - 1) / 2) * 20})`)
				.call(g => g.append("text")
							.attr("x", 24)
							.attr("y", 9)
							.attr("dy", "0.35em")
							.attr("font-weight", "bold")
							.text('Origin'));

			gParentItem.append("g")
				.call(legend);
		//	});
			return gParentItem.node();
		};

		function dataHover(e, data, dir) {
				//							from: https://observablehq.com/@d3/line-chart-with-tooltip
				if (dir == 'in') {

					const key = e.target.parentElement.classList[0].split('-')[3];
					const dateFun = dateFormat == "H" ? (d=>moment( d ).format( dateFormat )) : (d=> moment().dayOfYear( d ).format( dateFormat == "MMM" ? "MMMM" : dateFormat ) );

//					console.log(data.data["Julian date"])

					const date =  dateFun(data.data["Julian date"]);
					const hits = data[1] - data[0];

					$('.tooltip').html(
						"<div style='text-align:center;'><big>"+
							firstToUpper(key)+
						"</big><br />"+
							date+
							"<br/>"+
							hits+ " animals detected"+
						"</div>"
					);

					if (e.pageX + 15 + $('.tooltip').outerWidth() > $(window).width()) {
						$('.tooltip').css({top:e.pageY - 10, left:e.pageX - $('.tooltip').outerWidth() - 15});
					} else {
						$('.tooltip').css({top:e.pageY - 10, left:e.pageX + 15});
					}

					$('.tooltip:hidden').show();
				} else {
					$('.tooltip').hide();
				}

		}

		function dataClick(e, data) {
				console.log(data.key)
		}

		radialBarChart.colourScale = function (p) {
			if (!arguments.length) return colourScale;
			colourScale = p;
			return radialBarChart;
		};
		radialBarChart.dateFormat = function (p) {
			if (!arguments.length) return dateFormat;
			dateFormat = p;
			return radialBarChart;
		};

		return radialBarChart;
	};
var dateFormat = "MMM";
})();
