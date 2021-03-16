<?php
/**
 * Template Name: MotusDashboard
 * This template will only display the content you entered in the page editor
 */
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
		<head>
			<!-- Required meta tags -->
			<meta charset="<?php bloginfo( 'charset' ); ?>">
			<meta name="viewport" content="width=device-width, initial-scale=1">

			<title>Explore Data</title>
			<link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css"/>
			<link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-beta.1/dist/css/select2.min.css" rel="stylesheet"/>
			<link href="https://cdn.datatables.net/1.10.22/css/jquery.dataTables.min.css" rel="stylesheet"/>
			<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css" />
			<link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
			<link href='https://api.mapbox.com/mapbox.js/plugins/leaflet-fullscreen/v1.0.1/leaflet.fullscreen.css' rel='stylesheet' />
			<link rel="stylesheet" type="text/css" media="all" href="<?php bloginfo( 'stylesheet_url' ); ?>" />
			<!-- CSS only -->

<!-- JavaScript Bundle with Popper -->
			<script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>
			<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js" integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU=" crossorigin="anonymous"></script>
			<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-beta.1/dist/js/select2.min.js"></script>
			<script src="https://cdn.datatables.net/1.10.22/js/jquery.dataTables.min.js"></script>
			<script type="text/javascript" src="https://cdn.jsdelivr.net/momentjs/latest/moment.min.js"></script>
			<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js"></script>
			<script src="https://d3js.org/d3.v6.min.js"></script>
			<script src="https://d3js.org/d3-scale-chromatic.v2	.min.js"></script>
			<script src="https://d3js.org/d3-geo-projection.v2.min.js"></script>
			<script src="https://d3js.org/topojson.v2.min.js"></script>
			<script src="https://d3js.org/d3-time.v2.min.js"></script>
			<script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
			<script src='https://api.mapbox.com/mapbox.js/plugins/leaflet-fullscreen/v1.0.1/Leaflet.fullscreen.min.js'></script>
			<script src="https://cdnjs.cloudflare.com/ajax/libs/tinycolor/1.4.2/tinycolor.min.js"></script>
			
			<script src="<?php bloginfo('template_url'); ?>/d3-colour-legend.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/d3-colour-legend-vertical.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/timelines.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/common_scripts.js"></script>
			<script src="<?php bloginfo('template_url'); ?>/scripts.js"></script>
		</head>
		<body>