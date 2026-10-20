// Based on http://bl.ocks.org/900762 by John Firebaugh.
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { bandwidths, kde } from "../../src/index.js";

// Waiting times between eruptions of the Old Faithful geyser, in minutes.
const data = await d3.json("faithful.json");

const width = 800,
      height = 400,
      x = d3.scaleLinear([30, 110], [0, width]),
      y = d3.scaleLinear([0, .1], [height, 0]);

// A histogram of the proportion of the data in each 1-minute bin.
const bins = d3.bin().domain(x.domain()).thresholds(d3.range(31, 110))(data);

const svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.selectAll("rect")
  .data(bins)
  .join("rect")
    .attr("fill", "steelblue")
    .attr("x", (bin) => x(bin.x0))
    .attr("y", (bin) => y(bin.length / data.length))
    .attr("width", (bin) => x(bin.x1) - x(bin.x0) - 1)
    .attr("height", (bin) => height - y(bin.length / data.length));

// The density estimate with each bandwidth selector.
const line = d3.line(([a]) => x(a), ([, b]) => y(b)),
      points = d3.range(30, 110, .1);

svg.selectAll("path")
  .data(Object.values(bandwidths))
  .join("path")
    .attr("d", (bandwidth) => {
      const density = kde(data, {bandwidth});
      return line(points.map((p) => [p, density(p)]));
    });
