PDFDocument.prototype.addSVG = function(svg, x, y, options) {
  return SVGtoPDF(this, svg, x, y, options), this;
};

var pdf_config = {page_size: 'letter', width: 612, height: 792};


function makePDF(opts = {"type": "Data", "selection": false}) {


    let blob;

		var files = {

			motusLogo: {
				url: "http://localhost/Motus/Dashboard/images/motus-logo-lg.png"
			},
			bcLogo: {
				url: "http://localhost/Motus/Dashboard/images/birds-canada-logo.png"
			}

		}

    // Get the map dimensions
    var map_dims = {
                      w: $(`#${motusMap.el}`).width(),
                      h: $(`#${motusMap.el}`).height(),
                      x: $($(`#${motusMap.el} .leaflet-tile-container`)).css('transform').replace(/[matrix\(|\)]{2}/, '').split(',').map(x => parseInt(x))[4],
                      y: $($(`#${motusMap.el} .leaflet-tile-container`)).css('transform').replace(/[matrix\(|\)]{2}/, '').split(',').map(x => parseInt(x))[5]
                    };
    // Get the map dimensions
    var svg_dims = {
                      w: $(`#${motusMap.el} .leaflet-overlay-pane svg`).width(),
                      h: $(`#${motusMap.el} .leaflet-overlay-pane svg`).height(),
                      x: $(`#${motusMap.el} .leaflet-overlay-pane svg`).offset().left - $(`#${motusMap.el}`).offset().left,
                      y: $(`#${motusMap.el} .leaflet-overlay-pane svg`).offset().top - $(`#${motusMap.el}`).offset().top
                    };

    map_dims.w_r = (pdf_config.width - 20 ) / map_dims.w;
    svg_dims.w_r = (pdf_config.width - 20 ) / svg_dims.w;

    //map_dims.h_r = 1;//pdf_config.height / map_dims.h;

    // Load map tile images
    $(`#${motusMap.el} .leaflet-tile-container > img`).each(addImageFiles);


    function addImageFiles() {

      var pos = $(this).css('transform').replace(/[matrix\(|\)]{2}/, '').split(',').map(x => parseInt(x));
      console.log(pos);

      var dims = {
              w: Math.round( 256 * map_dims.w_r ),
              h: Math.round( 256 * map_dims.w_r ),
              x: Math.round( ( (pos[4] - svg_dims.x)) * map_dims.w_r) + 10 + (map_dims.x * map_dims.w_r),
              y: Math.round( ( (pos[5] - svg_dims.y)) * map_dims.w_r) + 150 + (map_dims.y * map_dims.w_r)
            };

    //  if (dims.x > 0 && dims.y > 0 && dims.x + dims.w  < pdf_config.width && dims.y + dims.h  < pdf_config.height) {
      files[Object.keys(files).length] = {type: 'map_tile', url: $(this).attr('src'), dims: dims };
    //  }
    }

		var filesLoaded = 0;

		var doc = new PDFDocument({pdf_config});
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
				if (files[file].url.replace(/(http|https):\/\//, '') === xhr.responseURL.replace(/(http|https):\/\//, '') ) {
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
      // HEADER
			doc.image(files.motusLogo.data, 0.5 * (doc.page.width - 225) , 25, { height: 150 });
      // FOOTER
			doc.image(files.bcLogo.data, 0.5 * (doc.page.width - 150) , doc.page.height - 85, { height: 75 });
      doc.fontSize(15).font('Helvetica-Bold').fillColor("black").text("Motus is a program of ", 0, doc.page.height - 105, {align: "center", width: doc.page.width});
  		doc.font('Helvetica');

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


		//	doc.addSVG($(".explore-timeline-btn").get(0), 10, 150, { width:100 });

      $(".explore-card-tagHits-timeline svg").each(function(i){
        if (i == 0) {
          doc.addPage();
    			doc.fontSize(17);
        }
        $("#explore_card_tagHits .explore-card-header select").val( $(`#explore_card_tagHits .explore-card-header select option:eq(${i})`).val() ).trigger("change");
        if ($(".explore-card-tagHits-timeline svg").length == 1) {
          var dims = {width: doc.page.width - 50, height: doc.page.height - 200}
          var xpos = 25;
          var ypos = 150;
        } else if ($(".explore-card-tagHits-timeline svg").length == 2) {
          var dims = {width: doc.page.width - 50, height: 0.5 * (doc.page.height - 200)}
          var xpos = 25;
          var ypos = 150 + ( (i % 2) * (dims.height + 25) );
        } else if ($(".explore-card-tagHits-timeline svg").length > 2) {
          var dims = {width: 0.5 * (doc.page.width - 75), height: 0.5 * (doc.page.height - 200)}
          var xpos = 25 + ( ( (i % 2) ) * (dims.width + 25) );
          var ypos = 150 + ( (i > 1) * (dims.height + 25) );
        } else if ($(".explore-card-tagHits-timeline svg").length == 0) {
          var dims = {width: 0.5 * (doc.page.width - 75), height: 0.5 * (doc.page.height - 200)}
          var xpos = 25 + ( ( (i % 2) ) * (dims.width + 25) );
          var ypos = 150 + ( (i > 1) * (dims.height + 25) );
        }

        console.log(`i: ${i}    xpos: ${xpos}    ypos: ${ypos}`);
  			doc.fillColor("black").text($("#explore_card_tagHits .explore-card-header select option").get(i).value, xpos - 25, ypos - 40, {align:"center", width: dims.width});
  			doc.addSVG($(".explore-card-tagHits-timeline svg").get(i), xpos, ypos, dims);

      });
/*
      if (> 0) {
      } else if ( $(".explore-card-tagHits svg").length > 0 ) {
    			doc.addPage();
    			doc.fontSize(17);
    			doc.fillColor("black").text("Tag detections by month", 0, 110,{align:"center"});
    			doc.addSVG( $(".explore-card-tagHits svg").get(0), 25, 150, {height:0.5 * (doc.page.height - 100)});
      }
*/


      // Add map to the third page
      // This involves both an SVG and a series of tile images.

      doc.addPage();

      // Clone the SVG map
      var map_clone = $(".leaflet-overlay-pane svg").clone();
      map_clone.find('.hidden').remove();

      map_dims.minX = d3.min(Array.from(Object.values(files).filter(d => d.type == 'map_tile').map(d => d.dims.x).values()));
      map_dims.minY = d3.min(Array.from(Object.values(files).filter(d => d.type == 'map_tile').map(d => d.dims.y).values()));
      map_dims.maxY = d3.max(Array.from(Object.values(files).filter(d => d.type == 'map_tile').map(d => d.dims.y).values()));

      // Add the image tiles first
      for ( var f in files ) {
        if (files[f].type == 'map_tile') {
          if ( files[f].data ) {
            console.log(files[f].dims);
        //    console.log({x: 10 +files[f].dims.x - map_dims.minX, y: 150 + files[f].dims.y - map_dims.minY, width: files[f].dims.w});
            doc.image( files[f].data , 10 + files[f].dims.x - map_dims.minX, 150 + files[f].dims.y - map_dims.minY, {width: files[f].dims.w});
            map_dims.tileH = files[f].dims.h;
          }
        }
      }

      // Add the map SVGs to the pdf
      doc.addSVG(map_clone.get(0), map_dims.minX, 180, {width: svg_dims.w * map_dims.w_r, height: svg_dims.h * (map_dims.w_r), preserveAspectRatio: "xMinYMin"});

      console.log({svg: svg_dims, map: map_dims, doc: doc.page});
      // Add a frame to the map
      doc.rect(doc.page.width - 10, 150, 10, svg_dims.h * map_dims.w_r)
          .fill('white');
      doc.rect(0, 90, doc.page.width, 60)
          .fill('white');
    //  doc.rect(0, 90 + (map_dims.maxY - map_dims.minY + map_dims.tileH), doc.page.width, doc.page.height - (90 + (map_dims.maxY - map_dims.minY + map_dims.tileH)))
    //      .fill('white');
      doc.rect(10, 150, doc.page.width - 20, (map_dims.maxY - map_dims.minY + map_dims.tileH))
          .stroke();


      // Insert the tables
      var y_start = 0;
			if (opts.stations) {
					doc.addPage();
					console.log(opts.stations)
					console.log("Loading " + opts.stations.data.length + " rows of stations");

					y_start = table(opts.stations.data, cols = opts.stations.cols, colWidths = opts.stations.colWidths);

			}

			if (opts.species) {

        if (!opts.stations || (y_start > doc.page.height / 2)) {
  					doc.addPage();
            y_start = 0;
        }

				console.log("Loading " + opts.species.data.length + " rows of animals");

				table(opts.species.data, opts.species.cols, opts.species.colWidths, y_start);

			}

      // Add a table of all animals detected

    	if (opts.animals) {
        if ( ( !opts.stations && !opts.species ) || (y_start > doc.page.height / 2)) {
					doc.addPage();
          y_start = 0;
        }
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


	function fancySummaryTable(vars, vals, top) {
		var colours = ["#5555AA", "#00AAAA", "#55AA55", "#AA00AA", "#AA5555", "#AAAA00"];
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

	function table(data, cols, colWidths, y_start = 0, x = 10, y = 100, width = doc.page.width - 20, row_height = 20) {

		var my = 5;
		var mx = 10;
    var y_pos = 0;
    y = y + y_start;
    console.log("y = " + y + "; y_start = " + y_start)

		if (!colWidths) {

			colWidths = [];

			for (var i=0; i<cols.length; i++) {colWidths.push(1);}

		}

		headerRow();
		doc.font('Helvetica');
		doc.fontSize(12);
		doc.strokeColor("#AAAAAA");

    var pages = 0;
    var rows_per_page = Math.floor( ( doc.page.height - ( y + row_height + 72 ) ) / ( row_height ) ) - 1;

    console.log("rows_per_page: " + rows_per_page);
    console.log("Bottom row baseline: " + (y + row_height + (rows_per_page*row_height)));
    var page_index = 0;

		data.forEach( function(d, row_index) {

      if (page_index > rows_per_page) {
        doc.addPage();
        pages++;
        page_index = 0;
        if (pages == 1 && y_start > 0) {
          y = 100;
          rows_per_page = Math.floor( ( doc.page.height - ( y + row_height + 72 ) ) / ( row_height ) ) - 1;
          console.log("rows_per_page: " + rows_per_page);
          console.log("Bottom row baseline: " + (y + row_height + (rows_per_page*row_height)));
        }
        headerRow();
    		doc.font('Helvetica');
     }
			row(d, page_index);
      page_index++;
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

      y_pos = y + ( ( 1 + row_index ) * row_height );

			cells.forEach( function(d, col_index) {
        if (colWidths[ col_index ] > 0) {
  				var x_pos = x + ((col_index==0?col_index:colWidths.slice(0, col_index).reduce( (a,c) => a += c )) * width / n);

  	/*			doc.lineJoin('miter')
  					.rect(x_pos, y + ( ( 1 + row_index ) * row_height ), colWidths[ col_index ] * width / n, row_height)
  					.stroke();
  */

  				doc.text(d, x_pos + mx, y_pos + my, {width: (colWidths[ col_index ] * width / n) - mx, align: col_index < 2 ? "left" : "center"});
        }
			});

			doc.moveTo(x, y + ( ( 1 + row_index ) * row_height ) + row_height)
				.lineTo(width, y_pos + row_height)
				.stroke();

		}

    return y_pos + row_height;
	}
}
