var w = 960,
    h = 500,
    p = 5.5,
    n = 100;

var chart = d3.chart.scatter()
    .width(w)
    .height(h);

var vis = d3.select("#vis")
    .data([{
      x: d3.range(n).map(function(i) { return i / n; }),
      y: d3.range(n).map(function(i) { return Math.sin(4 * i * Math.PI / n) + (Math.random() - .5) / 5; })
    }])
  .append("svg:svg")
    .attr("width", w + p + p)
    .attr("height", h + p + p)
  .append("svg:g")
    .attr("transform", "translate(" + p + "," + p + ")")
    .call(chart);

var loess = science.stats.loess()
    .bandwidth(.2),
    x = vis[0][0].__chart__.x,
    y = vis[0][0].__chart__.y,
    line = d3.svg.line()
      .x(function(d) { return x(d[0]); })
      .y(function(d) { return y(d[1]); });

vis.selectAll("g.datum")
    .append("svg:circle")
    .attr("r", 3);

vis.selectAll("path")
    .data(function(d) {
      return [d3.zip(d.x, loess(d.x, d.y))];
    })
  .enter().append("svg:path")
    .attr("d", line);
