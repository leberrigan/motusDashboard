

(function () {
	d3.radialBarChart = function() {

		var colourScale = null;

		function radialBarChart( gParent ) {
			var data = gParent.data()[0];

			var gParentSize = gParent.node().getBoundingClientRect(); // the svg size
			var gParentItem = d3.select(gParent.node()); // the svg

			console.log(data);
			console.log(gParentSize);
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
				.domain([0, d3.max(data, d => d.total.length)])
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

			var dateFun = dateFormat == "H" ? ( d => d[data.columns[0]] ) : ( d => moment().dayOfYear( d[data.columns[0]] ).format( dateFormat ) );


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
				.innerRadius(d => {return y(d[0])})
				.outerRadius(d => y(d[1]))
				.startAngle(d => x(d.data[data.columns[0]]))
				.endAngle(d => x(d.data[data.columns[0]]) + x.bandwidth())
				.padAngle(0.01)
				.padRadius(innerRadius)

			gParentItem
				.attr("viewBox", `${-width / 2} ${-20-height / 2} ${width} ${height + 20}`)
			//	.style("width", "calc(100% - 20px)")
			//	.style("height", "calc(100% - 20px)")
				.style("font", "10px sans-serif");

			gParentItem.append("g")
				.call(xAxis);

			gParentItem.append("g")
				.call(yAxis);
				
			gParentItem.append("g")
				.selectAll("g")
				.data(d3.stack().keys(data.columns.slice(1)).value( (d, key) => d[key].length )(data))
				.join("g")
				.attr("fill", d => z(d.key))
			//	.attr("class", d => `animal-timeline-arcs-${d.key}`)
				.attr("data-category", d => d.key)
				.selectAll("path")
				.data(d => d)
				.join("path")
				.attr("d", arc)
				.style('pointer-events', 'auto')
				.style('opacity','0.8')
				.style('stroke','#000')
				.style('stroke-width','3px')
				.style('cursor','pointer')
				.on('touchstart mouseover mousemove', (e,d) => dataHover(e, d, 'in'))
				.on('touchend mouseout', (e,d) => dataHover(e, d, 'out'))
				.on('click', (e,d) => dataClick(e, d));


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
					$(e.target).css("opacity", "1");
					const key = d3.select(e.target.parentElement).attr("data-category");
					const dateFun = dateFormat == "H" ? (d=>`${d}:00 UTC`) : (d=> moment().dayOfYear( d ).format( dateFormat == "MMM" ? "MMMM" : dateFormat ) );

					const hits = data[1] - data[0];

					const animals = data.data[key].filter( onlyUnique );

					const species = motusData.animals.filter( x => animals.includes( x.id ) ).map( x => x.species ).filter( onlyUnique );


						$('.tooltip').html(
							"<center><h3>"+
								key+
								"</h3><h2>"+
								(dateFun == "H" ? "Time: " : "")+
								dateFun( data.data[Object.keys(data.data)[0]] )+
							"</h2></center>"+
							`<table style="width:100%;text-align:center;font-size:14pt;"><tbody>`+
									`<tr><td colspan="2">${hits} detections</td></tr>`+
									`<tr><td>${animals.length} ${icons.animals}</td><td style="padding-left: 10px;">${species.length} ${icons.species}</td></tr>`+
									`<tr><td><b>Animal${animals.length==1?"":"s"}</b></td><td style="padding-left: 10px;"><b>Species</b></td></tr>`+
								`</tbody></table>`+
							"</div>"
						);

					if (e.pageX + 15 + $('.tooltip').outerWidth() > $(window).width()) {
						$('.tooltip').css({top:e.pageY - 10, left:e.pageX - $('.tooltip').outerWidth() - 15});
					} else {
						$('.tooltip').css({top:e.pageY - 10, left:e.pageX + 15});
					}

					$('.tooltip:hidden').show();
				} else {
					$(e.target).css("opacity", "0.8");
					$('.tooltip').hide();
				}

		}


		function dataClick(e, data) {
				// Highlight all the tracks that shares these animals

				const key = d3.select(e.target.parentElement).attr("data-category");
				const dateFun = dateFormat == "H" ? (d=>`${d}:00 UTC`) : (d=> moment().dayOfYear( d ).format( dateFormat == "MMM" ? "MMMM" : dateFormat ) );
				const date = dateFun( data.data[Object.keys(data.data)[0]] );

			//	const hits = data[1] - data[0];

				const animals = data.data[key];


				$(".popup").remove();
					$("body").append(`<div class='popup'><div class='popup-topbar'><div class='popup-header'>Detections from ${date}</div><div class='popup-topbar-close'>X</div></div><div class='popup-content'></div></div>`);
					$(".popup").draggable({handle: ".popup-topbar"});

					$(".popup .popup-topbar .popup-topbar-close").click(function(){
						$(".popup").remove();
					});

					if (typeof motusData.animalsTableData === 'undefined') {getAnimalsTableData();}

					var tableDom = motusData.animalsTableData.filter( x => animals.includes( x.id ) ).length > 10 ? "itp" : "t";

					$('.popup .popup-content').html( "<table></table>" );


					var color_dataType = 'regions' == dataType ? 'country' : 'project';

					$('.popup .popup-content table').DataTable({
							data: motusData.animalsTableData.filter( x => animals.includes( x.id ) ),
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
