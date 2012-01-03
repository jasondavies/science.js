var w = 960,
    h = 500,
    p = 35.5,
    n = 100,
    x = d3.scale.linear().range([0, w]),
    y = d3.scale.linear().domain([-1.5, 1.5]).range([h, 0]);

var xAxis = d3.svg.axis().scale(x),
    yAxis = d3.svg.axis().scale(y);

var vis = d3.select("#vis")
    .data([{
      x: d3.range(n).map(function(i) { return i / n; }),
      y: d3.range(n).map(function(i) { return Math.sin(4 * i * Math.PI / n) + (Math.random() - .5) / 5; })
    }])
  .append("svg")
    .attr("width", w + p + p)
    .attr("height", h + p + p)
  .append("g")
    .attr("transform", "translate(" + p + "," + p + ")");

var loess = science.stats.loess().bandwidth(.2),
    line = d3.svg.line()
      .x(function(d) { return x(d[0]); })
      .y(function(d) { return y(d[1]); });

vis.selectAll("circle")
    .data(function(d) { return d3.zip(d.x, d.y); })
  .enter().append("circle")
    .attr("cx", function(d) { return x(d[0]); })
    .attr("cy", function(d) { return y(d[1]); })
    .attr("r", 3);

vis.selectAll("path")
    .data(function(d) {
      return [d3.zip(d.x, loess(d.x, d.y))];
    })
  .enter().append("path")
    .attr("d", line);

vis.append("g")
    .attr("class", "bottom axis")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis.orient("bottom"));

vis.append("g")
    .attr("class", "left axis")
    .call(yAxis.orient("left"));
