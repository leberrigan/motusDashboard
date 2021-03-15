PDFDocument.prototype.addSVG = function(svg, x, y, options) {
  return SVGtoPDF(this, svg, x, y, options), this;
};
function makePDF(opts = {"type": "Data", "selection": false}) {
	if ($("iframe#pdf_output").length == 0) {
		$("body").append('<div class="pdf-output-wrapper"><div style="text-align:center;margin-top:10px;"><a class="hidden_link" target="_blank"></a><button class="download_btn">Download</button><button class="close_btn">Close</button></div><iframe id="pdf_output"></iframe></div>').find('iframe').get(0);
		$(".pdf-output-wrapper,.pdf-output-wrapper .close_btn").click(function(e){
			if (e.target !== this) return;
			$(".pdf-output-wrapper").fadeOut(250);
		});

		$(".pdf-output-wrapper").fadeIn(250);

		let blob;

		var files = {

			motusLogo: {
				url: "http://localhost/Motus/Dashboard/Example%20station%20interfaces/images/motus-logo-lg.png"
			},
			bcLogo: {
				url: "http://localhost/Motus/Dashboard/Example%20station%20interfaces/images/birds-canada-logo.png"
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

			doc.on('pageAdded', function() {

					  doc.rect(10, 70, doc.page.width-20, 20).fill("#000000");
					  // pass loaded ArrayBuffer data instead of a path to image
					  doc.image(files.motusLogo.data, 10, 10, { height: 50 });
					  doc.image(files.bcLogo.data, doc.page.width - 110, 10, { height: 50 });

					  doc.fontSize(15);
					  doc.fillColor("white").text("Motus "+opts.type+" Report" + (opts.selection?": "+opts.selection:""), 15, 75);
					  doc.fontSize(12);
					  doc.fillColor("white").text("#1aj18sd", 50, 75, { align:'right' });

			});

			doc.image(files.motusLogo.data, 0.5 * (doc.page.width - 225) , 100, { height: 150 });

			if (opts.selection) {
			  doc.fontSize(35);
				doc.text(opts.selection, 50, (0.5 * doc.page.height) - doc.heightOfString("M") - 50,{
					align:"center"
				});
			}
		  doc.fontSize(25);
			doc.text("Motus "+opts.type+" Report", 50, (0.5 * doc.page.height) - doc.heightOfString("M"),{
				align:"center"
			});
			doc.fontSize(15);
			doc.text(moment().format("D MMMM YYYY"), x = 50, y = (0.5 * doc.page.height),{
				align:"center"
			});


			doc.addPage();
			doc.addSVG($(".leaflet-overlay-pane svg").get(0), 10, 150);
		//	doc.addSVG($(".explore-timeline-btn").get(0), 10, 150, { width:100 });

			doc.addPage();
			doc.fontSize(17);
			doc.fillColor("black").text("Tag detections by month", 0, 110,{align:"center"});
			doc.addSVG($(".explore-card-tagHits-timeline svg").get(0), 25, 150, {height:0.5 * (doc.page.height - 100)});

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
}
