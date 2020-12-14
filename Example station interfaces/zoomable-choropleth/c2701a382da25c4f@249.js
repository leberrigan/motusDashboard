// https://observablehq.com/@bjnsn/zoomable-choropleth@249
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Zoomable Choropleth

This notebook combines [d3-zoom](https://github.com/d3/d3-zoom) for panning and zooming, [d3-geo](https://github.com/d3/d3-geo) for rendering vector geometry, and [TopoJSON](https://github.com/topojson) for efficient representation of vector geometry.`
)});
  main.variable(observer("map")).define("map", ["d3","width","height","topojson","us","color","data","states","format"], function(d3,width,height,topojson,us,color,data,states,format)
{
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);

  const projection = d3.geoMercator()
      .scale(1 / (2 * Math.PI))
      .translate([0, 0]);
  
  const geoPath = d3.geoPath();
  const g = svg.append("g");
  
  g
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .join("path")
      .attr("fill", d => color(data.get(d.id)))
      .attr("d", geoPath)
    .append("title")
      .text(d => `${d.properties.name}, ${states.get(d.id.slice(0, 2)).name}
${format(data.get(d.id))}`);
 
  const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .extent([[0, 0], [width, height]])
      .on("zoom", () => g.attr("transform", d3.event.transform));
  
  svg.call(zoom);

  return svg.node();
}
);
  main.variable(observer("data")).define("data", ["d3"], async function(d3){return(
Object.assign(new Map(await d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", ({id, rate}) => [id, +rate])), {title: "Unemployment rate (%)"})
)});
  main.variable(observer("height")).define("height", function(){return(
600
)});
  main.variable(observer("initialCenter")).define("initialCenter", function(){return(
[-98 - 35 / 60, 39 + 50 / 60]
)});
  main.variable(observer("initialScale")).define("initialScale", function(){return(
1 << 12
)});
  main.variable(observer("path")).define("path", ["d3"], function(d3){return(
d3.geoPath()
)});
  main.variable(observer("color")).define("color", ["d3"], function(d3){return(
d3.scaleQuantize([1, 10], d3.schemeBlues[9])
)});
  main.variable(observer("format")).define("format", function(){return(
d => `${d}%`
)});
  main.variable(observer("states")).define("states", ["us"], function(us){return(
new Map(us.objects.states.geometries.map(d => [d.id, d.properties]))
)});
  main.variable(observer("us")).define("us", ["d3"], function(d3){return(
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
)});
  main.variable(observer("feature")).define("feature", ["d3","topojson"], function(d3,topojson){return(
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(topology => topojson.feature(topology, topology.objects.states))
)});
  main.variable(observer("topojson")).define("topojson", ["require"], function(require){return(
require("topojson-client@3")
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5", "d3-tile@1")
)});
  return main;
}
