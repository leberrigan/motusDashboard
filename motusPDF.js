PDFDocument.prototype.addSVG = function(svg, x, y, options) {
  return SVGtoPDF(this, svg, x, y, options), this;
};
function makePDF(opts = {"type": "Data", "selection": false}) {
	if ($("iframe#pdf_output").length == 0) {
		$("body").append('<div class="pdf-output-wrapper"><div style="text-align:center;margin-top:10px;"><a class="hidden_link" target="_blank"></a><button class="download_btn">Download</button><button class="close_btn">Close</button></div><iframe id="pdf_output"></iframe></div>').find('iframe').get(0);
		$(".pdf-output-wrapper,.pdf-output-wrapper .close_btn").click(function(e){
			if (e.target !== this) return;
			$(".pdf-output-wrapper").fadeOut(250);
      $("body").css("overflow-y", "");
		});

		$(".pdf-output-wrapper").fadeIn(250);
    $("body").css("overflow-y", "hidden");

    let blob;

		var files = {

			motusLogo: {
				url: "http://localhost/Motus/Dashboard/images/motus-logo-lg.png"
			},
			bcLogo: {
				url: "http://localhost/Motus/Dashboard/images/birds-canada-logo.png"
			}

		}
		var filesLoaded = 0;

		var doc = new PDFDocument();
		var stream = doc.pipe(blobStream());


		for (var file in files) {
		  files[file].xhr = new XMLHttpRequest();
		  files[file].xhr.onreadystatechange = function() {
		    if (this.readyState == 4 && this.status == 200) {
		      loadFile(this);
		    }
		  };
		  files[file].xhr.responseType = "arraybuffer";
		  files[file].xhr.open("GET", files[file].url);
		  files[file].xhr.send(null);
		}


		var blobURL = null;

		stream.on("finish", function() {
		   // get a blob you can do whatever you like with
		  blob = stream.toBlob("application/pdf");

		  blobURL = stream.toBlobURL('application/pdf');

		  $("#pdf_output").attr("src",blobURL);
		  $(".pdf-output-wrapper .download_btn").click(download);
		 // $(".pdf-output-wrapper .download_btn").click(download);

		});

		function loadFile(xhr) {

			for (var file in files) {
				if (files[file].url === xhr.responseURL) {
					files[file].data = xhr.response;
				}
			}
			filesLoaded += 1;
			if (filesLoaded == Object.keys(files).length) {
				showPDF();
			}

		}
		function showPDF() {
			var page = 0;
			doc.on('pageAdded', function() {
						page++;
					  doc.moveTo(10, 90)
							 .lineTo(doc.page.width-10, 90)
							 .stroke();
					  // pass loaded ArrayBuffer data instead of a path to image
					  doc.image(files.motusLogo.data, 10, 10, { height: 50 });
					  doc.image(files.bcLogo.data, doc.page.width - 110, 10, { height: 50 });

					  doc.fontSize(15);
					  doc.fillColor("black").text("Motus Report" + (opts.selection?": "+opts.selection:""), 15, 75);
					  doc.fontSize(12);
					  doc.fillColor("black").text(page + ".", 0, 75, { width: doc.page.width - 15, align:'right' });

			});

			doc.image(files.motusLogo.data, 0.5 * (doc.page.width - 225) , 25, { height: 150 });
			doc.image(files.bcLogo.data, 0.5 * (doc.page.width - 150) , doc.page.height - 85, { height: 75 });

			if (opts.titleIcon) {

				console.log(opts.titleIcon.svg.node());
				doc.addSVG(opts.titleIcon.svg.node(), 0.5 * (doc.page.width - 400), (0.5 * doc.page.height) - doc.heightOfString("M") - 175);

			}
			if (opts.selection) {
			  doc.fontSize(35);
				doc.text(opts.selection, 50, (0.5 * doc.page.height) - doc.heightOfString("M") - 50, {
					align:"center"
				});
			}
		  doc.fontSize(25);
			doc.text("Motus "+opts.type+" Report", 50, (0.5 * doc.page.height) - doc.heightOfString("M"), {
				align:"center"
			});
			doc.fontSize(15);
			doc.text(moment().format("D MMMM YYYY"), x = 50, y = (0.5 * doc.page.height), {
				align:"center"
			});

			doc.moveTo( 100, (0.5 * doc.page.height) + 50 )
					.lineTo( doc.page.width - 100, (0.5 * doc.page.height) + 50 )
					.stroke();

			fancySummaryTable(opts.summaryTable.vars, opts.summaryTable.vals, (0.5 * doc.page.height) + 100);

			if (opts.stations) {
					doc.addPage();
					console.log(opts.stations)
					console.log("Loading " + opts.stations.data.length + " rows of stations");

					table(opts.stations.data, cols = opts.stations.cols, colWidths = opts.stations.colWidths);

			}
			if (opts.species) {
        if (!opts.stations) {
  					doc.addPage();
        }
					console.log(opts.species)
					console.log("Loading " + opts.species.data.length + " rows of animals");

					table(opts.species.data, cols = opts.species.cols, colWidths = opts.species.colWidths);

			}


			doc.addPage();
			var map_clone = $(".leaflet-overlay-pane svg").clone();
			map_clone.find('.hidden').remove();

			doc.addSVG(map_clone.get(0), 10, 150);
		//	doc.addSVG($(".explore-timeline-btn").get(0), 10, 150, { width:100 });

			doc.addPage();
			doc.fontSize(17);
			doc.fillColor("black").text("Tag detections by month", 0, 110,{align:"center"});
			doc.addSVG($(".explore-card-tagHits-timeline svg").get(0), 25, 150, {height:0.5 * (doc.page.height - 100)});

    	if (opts.animals) {
					doc.addPage();
					console.log(opts.animals)
					console.log("Loading " + opts.animals.data.length + " rows of animals");

					table(opts.animals.data, cols = opts.animals.cols, colWidths = opts.animals.colWidths);
			}

      console.log('Finish');

		  doc.end();
		}
		function download() {
			var fileName = 'motusDataReport-' + moment().format('DDMMMYYYY') + '.pdf';
			console.log("Downloading: " + fileName + ", " + blobURL);

			if (!blob) return;

		  $(".pdf-output-wrapper .hidden_link")
				.attr({href: blobURL, download: fileName})
				.get(0)
				.click();
		  window.URL.revokeObjectURL(blobURL);
		}
	} else {

		$(".pdf-output-wrapper").fadeIn(250);

	}

	function fancySummaryTable(vars, vals, top) {
		var colours = ["#5555AA", "#00AAAA", "#55AA55", "#AA00AA"];
		var tableWidth = doc.page.width - 20;
		var cellWidth = tableWidth / vars.length;
			for (var i = 0; i < vars.length; i++) {

				doc.fillColor(colours[ i % colours.length ]);

				doc.fontSize(25);
				doc.text(vals[i], 10 + (i * cellWidth), top, {
					width: cellWidth,
			    align: 'center',
			    columns: 1
				});

			  doc.fillColor('black');

				doc.fontSize(17);
				doc.text(vars[i], 10 + (i * cellWidth), top + 50, {
					width: cellWidth,
			    align: 'center',
			    columns: 1
				});

			}

	}

	function table(data, cols, colWidths, x = 10, y = 100, width = doc.page.width - 20, row_height = 20) {

		var my = 5;
		var mx = 10;

		if (!colWidths) {

			colWidths = [];

			for (var i=0; i<cols.length; i++) {colWidths.push(1);}

		}

		headerRow();
		doc.fontSize(12);
		doc.font('Helvetica');
		doc.strokeColor("#AAAAAA");

    var pages = 0;
    var rows_per_page = Math.floor( ( doc.page.height - (y + 20) ) / (row_height+2) ) - 1;

    console.log(rows_per_page);

		data.forEach( function(d, row_index) {

      if (row_index - (pages * rows_per_page) > rows_per_page) {
        doc.addPage();
        pages++;
        headerRow();
     }

			row(d, row_index - (pages * rows_per_page) - (pages>0));

		});

		function headerRow() {

			var n = colWidths.reduce( (a,c) => a += c );

			doc.fontSize(12);
			doc.fillColor("#000000");
			doc.font('Helvetica-Bold');

			cols.forEach( function(d, col_index) {

				var x_pos = x + ((col_index==0?col_index:colWidths.slice(0, col_index).reduce( (a,c) => a += c )) * width / n);

				doc.text(d, x_pos, y + my - (doc.heightOfString(d, {width:colWidths[ col_index ] * width / n}) - 14.5), {width: colWidths[ col_index ] * width / n, align: "center"});

			});

			doc.moveTo(x, y + row_height)
				.lineTo(width, y + row_height)
				.stroke();

		}

		function row(cells, row_index) {

			var n = colWidths.reduce( (a,c) => a += c );

			cells.forEach( function(d, col_index) {

				var x_pos = x + ((col_index==0?col_index:colWidths.slice(0, col_index).reduce( (a,c) => a += c )) * width / n);

	/*			doc.lineJoin('miter')
					.rect(x_pos, y + ( ( 1 + row_index ) * row_height ), colWidths[ col_index ] * width / n, row_height)
					.stroke();
*/

				doc.text(d, x_pos + mx, y + ( ( 1 + row_index ) * row_height ) + my, {width: (colWidths[ col_index ] * width / n) - mx, align: col_index == 0 ? "left" : "center"});

			});

			doc.moveTo(x, y + ( ( 1 + row_index ) * row_height ) + row_height)
				.lineTo(width, y + ( ( 1 + row_index ) * row_height ) + row_height)
				.stroke();

		}
	}
}
