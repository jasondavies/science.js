import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { loess } from "../../src/index.js";

const width = 960,
      height = 500,
      margin = 35.5,
      n = 100;

// A noisy sine wave, and its LOESS smoothing.
const xs = d3.range(n).map((i) => i / n),
      ys = xs.map((x) => Math.sin(4 * Math.PI * x) + (Math.random() - .5) / 5),
      smoothed = loess(xs, ys, {bandwidth: .2});

const x = d3.scaleLinear([0, 1], [0, width]),
      y = d3.scaleLinear([-1.5, 1.5], [height, 0]);

const svg = d3.select("#vis").append("svg")
    .attr("width", width + 2 * margin)
    .attr("height", height + 2 * margin)
  .append("g")
    .attr("transform", `translate(${margin},${margin})`);

svg.selectAll("circle")
  .data(d3.zip(xs, ys))
  .join("circle")
    .attr("cx", ([a]) => x(a))
    .attr("cy", ([, b]) => y(b))
    .attr("r", 3);

svg.append("path")
    .datum(d3.zip(xs, smoothed))
    .attr("class", "curve")
    .attr("d", d3.line(([a]) => x(a), ([, b]) => y(b)));

svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

svg.append("g")
    .call(d3.axisLeft(y));
