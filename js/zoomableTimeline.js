function zoomableTimeline(data,{
		width = 500,
		height = 250,
		margin = {top: 50, right: 20, bottom: 30, left: 30},
		focusHeight = 100,
		svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, focusHeight])
      .style("display", "block"),
		colourScale = d3.scaleSequential(d3.interpolateTurbo).domain([ 1, 10 ]),
		colourVals = [],
		plotHeight = height - focusHeight,
		focus = []
	} = {}){

	var tooltip_data_bar;

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

	var day2 = new Date(+data[0].date + (24 * 60 * 60 * 1000));


	if (x.domain()[1] - x.domain()[0] < (7 * 24 * 60 * 60 * 1000)) {
		x.domain([new Date(x.domain()[0] - (3.5 * 24 * 60 * 60 * 1000)), new Date(+x.domain()[1] + (3.5 * 24 * 60 * 60 * 1000))])
			console.log(data[0])
	}

	var x_scale = x;
	var x_zoom = x;

  const brush = d3.brushX();

	colourScale.domain(d3.extent(data, d => d.colour.length))

	Legend(colourScale, {title: "Number of animals detected", svg: svg, marginLeft: margin.left})

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

			var dayWidth = x(day2) - x(data[0].date);

			grect.append('rect')
					.attr('class', 'background')
					.style('fill', '#FFFFFF')
					.attr("x", 0)
					.attr("y", margin.top)
					.attr("width", width - margin.right)
					.attr("height", plotHeight)
					.on("click", dataClick);


			const rects = grect.selectAll(".dataRect")
					.data(data)
					.enter()
					.append("rect")
					.attr('class', 'dataRect')
		      .attr("fill", d => colourScale(d.colour.length))
					.attr("x", d => x(d.date))
					.attr("y", d => y(d.value))
					.attr("width", d => dayWidth)
					.attr("height", d => y(0) - y(d.value))
					.style('pointer-events', 'none');

		  const gx = svg.append("g")
										.attr('class','plot-axis-x');

		  const gy = svg.append("g")
										.attr('class','plot-axis-y');

		  grect.call(zoom)
		    .transition()
	      .duration(750);

			tooltip_data_bar = grect.append('rect')
											.style('display', 'none')
											.attr('class', 'helper-bar')
											.attr('width', dayWidth)
											.attr('height', plotHeight - margin.top - 1)
											.attr('fill', '#FFFFFF')
											.attr('fill-opacity', '0.3')
											.attr('stroke', '#000000')
											.attr('stroke-width', '1')
											.attr('x', 0)
											.attr('y', margin.top + 1)
											.style('pointer-events', 'none');

		  function zoomed(event) {

				var sourceEvent = event.sourceEvent

				var t = event.transform;

		    x_zoom.domain( t.rescaleX( x ).domain() );

				dayWidth = x_zoom( day2 ) - x_zoom( data[0].date );

				rects.attr("width", dayWidth)
						 .attr("x", d => x_zoom( d.date ) )

			 	tooltip_data_bar.attr("width", dayWidth)

	      gx.call(xAxis, x_zoom, height - focusHeight);

				const brushExtent = x_zoom.range().map(t.invertX, t);

				if (!sourceEvent || sourceEvent === null || sourceEvent.type === "brush") {
					return;
				} else if (Math.round(brushExtent[0]) <= Math.round(x.range()[0]) && Math.round(brushExtent[1]) >= Math.round(x.range()[1]))  {
					svg.select(".brush").call(brush.clear);
				} else {
				  svg.select(".brush").call(brush.move, brushExtent );
				}

		  }

		  return Object.assign(svg.node(), {
		    update(focusX, focusY) {

					x_zoom = focusX
//					x_zoom.domain(focusX.domain())

		      gx.call(xAxis, focusX, plotHeight);
		      gy.call(yAxis, focusY, data.y);

					dayWidth = focusX(day2) - focusX(data[0].date);

					rects.attr("width", dayWidth)
							 .attr("x", d => focusX(d.date));
		    }
		  });
		})();


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

		var dayWidth = x(day2) - x(data[0].date);

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

	  function brushed(event) {
			var sourceEvent = event.sourceEvent
  		if (!sourceEvent || sourceEvent.type === "zoom") return;
			var selection = event.selection || x.range();
	    if (selection) {

				x_zoom.domain( selection.map(x.invert, x) );
				focus = selection.map(x.invert, x).map(d3.utcDay.round);

	      svg.select(".plot-axis-x").call(xAxis, x_zoom, plotHeight);
				dayWidth = x_zoom(day2) - x_zoom( data[0].date );

				svg.select('.rects').selectAll('.dataRect')
						 .attr("x", d => x_zoom( d.date ) )
 						 .attr("width", dayWidth)

			 	tooltip_data_bar.attr("width", dayWidth)


				svg.select('.rects').call(zoom.transform, d3.zoomIdentity
				      .scale(width / (selection[1] - selection[0]))
				      .translate(-selection[0], 0));
	    }
	  }

	  function brushended({selection, sourceEvent}) {
	    if (!selection) {
	      gb.call(brush.move, defaultSelection);
				if (sourceEvent && sourceEvent.type !== 'zoom') {
					brushed({sourceEvent: "brushended", selection: defaultSelection.map(x)})
				}
	    }
	  }

		focus = defaultSelection;

	  return svg.node();
	}

		function dataHover(e, dir = 'in') {
			//							from: https://observablehq.com/@d3/line-chart-with-tooltip
			if (dir == 'in') {
				const x_pos = d3.pointer(e, this)[0];
				const date =  x_zoom.invert( x_pos ).toISOString().substr(0, 10);
				const d = data.filter( d => d.date.toISOString().substr(0, 10) == date)[0];

				$('.tooltip').html(
					"<center><h3>"+
						( date )+
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
				tooltip_data_bar.attr('transform', `translate(${x_pos - (tooltip_data_bar.attr('width') / 2)},0)`).style('display', null)
				$('.tooltip:hidden').show();
			} else {
				$('.tooltip').hide();
				tooltip_data_bar.style('display', 'none');
			}
		}

		function dataClick(e) {
				// Highlight all the tracks that shares these animals
				const x_pos = d3.pointer(e, this)[0];
				const date =  x_zoom.invert( x_pos ).toISOString().substr(0, 10);
				const d = data.filter( d => d.date.toISOString().substr(0, 10) == date)[0];
				$(".popup").remove();
				if (typeof d !== 'undefined' && d.value > 0) {
					$("body").append(`<div class='popup'><div class='popup-topbar'><div class='popup-header'>Detections on: ${date}</div><div class='popup-topbar-close'>X</div></div><div class='popup-content'></div></div>`);
					$(".popup").draggable({handle: ".popup-topbar"});

					$(".popup .popup-topbar .popup-topbar-close").click(function(){
						$(".popup").remove();
					});

					if (typeof motusData.animalsTableData === 'undefined') {getAnimalsTableData();}

					var tableDom = motusData.animalsTableData.filter( x => d.animals.includes( x.id ) ).length > 10 ? "itp" : "t";

					$('.popup .popup-content').html( "<table></table>" );


					var color_dataType = 'regions' == dataType ? 'country' : 'project';

					$('.popup .popup-content table').DataTable({
							data: motusData.animalsTableData.filter( x => d.animals.includes( x.id ) ),
							columns: [
								{data: null, className: "icons", orderable: false, defaultContent: icons.addFilter},
								{data: "id", title: "Animal", "createdCell": function(td, cdata, rdata){
									$(td).html(
															`<div class='explore-card-table-legend-icon table_tips' style='border-color:${motusMap.colourScale(rdata[color_dataType])};background-color:${motusMap.colourScale(rdata[color_dataType])}'><div class='tip_text'>${firstToUpper(color_dataType)}: ${['project','country'].includes(color_dataType)?rdata[color_dataType + "Name"]:rdata[color_dataType]}</div></div>`+
															`<a href='javascript:void(0);' class='tips' alt='View animal profile' onclick='viewProfile("animals", [${cdata}]);'>#${cdata}</a>`
														);
								}},
								{data: "name", title: "Species", "createdCell": function(td, cdata, rdata){
									$(td).html(
															`<a href='javascript:void(0);' class='tips' alt='View  profile' onclick='viewProfile("species", ["${rdata.species}"]);'>${cdata}</a>`
														);
								}},
								{data: "dtStart", title: "Release date"},
								{data: "dtEnd", title: "Status"},
								{data: "nStations", title: "Stations visited"},
								{data: "nDays", title: "Days detected"},
								{data: "projectName", title: "Project", "createdCell": function(td, cdata, rdata){
									$(td).html(
										`<a href='javascript:void(0);' onclick='viewProfile("projects", [${rdata.project}]);'>${rdata.projectName}</a>`
									);
								}}
							],
							dom: tableDom,
							autoWidth: false,
							columnDefs: [ {
								targets: 0,
								orderable: false
							}
							],
							order: [[1, 'asc']]
						});

				$('.popup').css({top:$("html").scrollTop() + ($(window).height() - $('.popup').outerHeight())/2, left:($(window).width() - $('.popup').outerWidth())/2});

				$('.popup:hidden').show();
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
