// 
// D3 Globe projections
// 
// Tween between projections: https://bl.ocks.org/git-ashish/35d6480d477d22a21961e641955ba03c
//
// 
<!DOCTYPE html>
<meta charset="utf-8">

<!-- Load d3.js -->
<script src="https://d3js.org/d3.v4.js"></script>
<script src="https://d3js.org/d3-scale-chromatic.v1.min.js"></script>
<script src="https://d3js.org/d3-geo-projection.v2.min.js"></script>

<!-- Create an element where the map will take place -->
<svg id="my_dataviz" width="440" height="400"></svg>


<script>

// The svg
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
var projection = d3.geoMercator()
    .scale(85)
    .translate([width/2, height/2*1.3])

// A path generator
var path = d3.geoPath()
    .projection(projection)

// Load world shape AND list of connection
d3.queue()
  .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")  // World shape
  .defer(d3.csv, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_connectionmap.csv") // Position of circles
  .await(ready);

function ready(error, dataGeo, data) {

    // Reformat the list of link. Note that columns in csv file are called long1, long2, lat1, lat2
    var link = []
    data.forEach(function(row){
      source = [+row.long1, +row.lat1]
      target = [+row.long2, +row.lat2]
      topush = {type: "LineString", coordinates: [source, target]}
      link.push(topush)
    })

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(dataGeo.features)
        .enter().append("path")
            .attr("fill", "#b8b8b8")
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            .style("stroke", "#fff")
            .style("stroke-width", 0)

    // Add the path
    svg.selectAll("myPath")
      .data(link)
      .enter()
      .append("path")
        .attr("d", function(d){ return path(d)})
        .style("fill", "none")
        .style("stroke", "#69b3a2")
        .style("stroke-width", 2)

}

</script>