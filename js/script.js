let width = 900;
let height = 600;

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("border", "1px solid black")
  .style("scale", "0.8");

let tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

const g = svg.append("g");

(async function () {
  let topology = await d3.json(
    "https://raw.githubusercontent.com/cszang/dendrobox/master/data/world-110m2.json"
  );
  let tsunami = await d3.csv("data/tsunami_dataset.csv");

  console.log(topology);
  console.log(tsunami);

  // your code here
  const projection = d3.geoMercator().center([4.89, 52.37]).scale(150);

  const path = d3.geoPath().projection(projection);

  g.selectAll("path")
    .data(topojson.feature(topology, topology.objects.countries).features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", "lightgray")
    .attr("stroke", "black");

  g.selectAll("circle")
    .data(tsunami)
    .enter()
    .append("circle")
    .attr("cx", (d) => projection([d.LONGITUDE, d.LATITUDE])[0])
    .attr("cy", (d) => projection([d.LONGITUDE, d.LATITUDE])[1])
    .attr("r", 2)
    .attr("fill", (d) => {
      switch (d.DAMAGE_TOTAL_DESCRIPTION) {
        case "Limited (<$1 million)":
          return "green";
        case "Moderate (~$1 to $5 million)":
          return "orange";
        case "Severe (~>$5 to $24 million)":
          return "red";
        case "Extreme (~$25 million or more)":
          return "purple";
        default:
          return "none";
      }
    })
    .on("mouseover", function (event, d) {
      tooltip.style("opacity", 1);
      tooltip
        .html(`Deaths: ${d.DEATHS_TOTAL_DESCRIPTION}`)
        .style("left", `${event.pageX}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", function (event, d) {
      tooltip.style("opacity", 0);
    });
})();

let zoom = d3
  .zoom()
  .scaleExtent([1, 8])
  .on("zoom", function (event) {
    g.selectAll("path").attr("transform", event.transform);
    g.selectAll("circle").attr("transform", event.transform);
  });

svg.call(zoom);
