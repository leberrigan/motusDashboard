<?php
/**
 * Template Name: MotusDashboard
 * This template will only display the content you entered in the page editor
 */
?>

<!DOCTYPE html>
<html lang="en">
		<head>
			<!-- Required meta tags -->
			<meta charset="<?php bloginfo( 'charset' ); ?>">
			<meta name="viewport" content="width=device-width, initial-scale=1">

			<title>Explore Data</title>
			<!-- You can use Open Graph tags to customize link previews.
			Learn more: https://developers.facebook.com/docs/sharing/webmasters -->
			<meta property="og:url"           content="https://leberrigan.github.io/motusDashboard/explore.html" />
			<meta property="og:type"          content="website" />
			<meta property="og:title"         content="Motus Wildlife Tracking System - Explore Data" />
			<meta property="og:description"   content="Explore the tracks of all the animals in our database using this tool." />
			<meta property="og:image"         content="images/motus-logo-lg.png" />


 			<link rel='shortcut icon' href='favicon.ico'>

			<link href="<?php bloginfo('template_url'); ?>/css/jquery-ui.css"rel="stylesheet" />
			<link href="<?php bloginfo('template_url'); ?>/css/select2.min.css" rel="stylesheet"/>
			<link href="<?php bloginfo('template_url'); ?>/css/jquery.dataTables.min.css" rel="stylesheet"/>
			<link href="<?php bloginfo('template_url'); ?>/css/select.dataTables.min.css " rel="stylesheet"/>
			<link href="<?php bloginfo('template_url'); ?>/css/daterangepicker.css" rel="stylesheet" />
			<link href="<?php bloginfo('template_url'); ?>/css/leaflet.css" rel="stylesheet" />
			<link href='<?php bloginfo('template_url'); ?>/css/leaflet.fullscreen.css' rel='stylesheet' />
			<link href='<?php bloginfo('template_url'); ?>/css/leaflet.draw.css' rel='stylesheet' />
			<!--link rel='stylesheet' href='style.css'/-->
			<link href='<?php bloginfo('template_url'); ?>/css/explore.css' rel="stylesheet" />
			<link type="text/css" media="all" href="<?php bloginfo( 'stylesheet_url' ); ?>" rel="stylesheet" />

			<!-- CSS only -->

<!-- JavaScript Bundle with Popper -->
			<script src="<?php bloginfo('template_url'); ?>/js/jquery-3.5.1.min.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/jquery-ui.min.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/select2.min.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/jquery.dataTables.min.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/jquery.ui.touch-punch.min.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/dataTables.select.min.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/dataTables.buttons.min.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/buttons.html5.min.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/moment.min.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/daterangepicker.min.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/d3.v6.min.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/d3-scale-chromatic.v2.min.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/d3-geo-projection.v2.min.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/topojson.v2.min.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/d3-time.v2.min.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/radialBarChart.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/timelines.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/lz-string.min.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/leaflet.js"></script>
			<script src='<?php bloginfo('template_url'); ?>/js/Leaflet.fullscreen.min.js'></script>
			<script src='<?php bloginfo('template_url'); ?>/js/leaflet.draw.js'></script>
			<!--script src='pdfkit.standalone.js'></script-->
			<script src="<?php bloginfo('template_url'); ?>/js/pdfkit.standalone.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/SVGtoPDF.js"></script>
			<!--script src='https://unpkg.com/pdfkit@0.9.1/js/pdfkit.js'></script-->
			<script src='<?php bloginfo('template_url'); ?>/js/motusPDF.js'></script>
    	<script src="<?php bloginfo('template_url'); ?>/js/blob-stream.js"></script>
    	<script src="<?php bloginfo('template_url'); ?>/js/dexie.js"></script>

			<!-- deck.gl standalone bundle -->
			<script src="<?php bloginfo('template_url'); ?>/js/deckGL.8.7.2.min.js"></script>
			<!-- deck.gl-leaflet -->
			<script src="<?php bloginfo('template_url'); ?>/js/deck.gl-leaflet.1.2.1.min.js"></script>

			<script src="<?php bloginfo('template_url'); ?>/js/common_scripts.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/vars.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/timeline.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/zoomableTimeline.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/help.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/map.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/motusData.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/explore.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/summary.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/editor.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/viewTrack.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/antenna_shapes.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/motusPlot.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/js/motus-deckGL.js"></script>


		</head>
		<body class='dark'>
