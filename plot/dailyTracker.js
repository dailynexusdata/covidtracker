(async () => {
  const data = await getData();

  const svg = d3
    .select("#dailyTracker")
    .attr("width", size.width)
    .attr("height", size.height);

  const dateRange = [data[0].date, data[data.length - 1].date];

  const x = d3
    .scaleTime()
    .domain(dateRange)
    .nice()
    .range([margin.left, size.width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([0, Math.max(...data.map(({ daily }) => daily))])
    .range([size.height - margin.bottom, margin.top]);

  const yHeight = d3
    .scaleLinear()
    .domain([0, Math.max(...data.map(({ daily }) => daily))])
    .range([0, size.height - margin.bottom - margin.top]);
  svg
    .append("g")
    .attr("transform", `translate(0, ${size.height - margin.bottom})`)
    .style("font-size", "12px")
    .call(d3.axisBottom().scale(x).ticks(5));

  svg
    .append("g")
    .attr("fill", "green")
    .selectAll("bars")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.date))
    .attr("width", 1)
    .attr("y", (d) => size.height - margin.bottom - yHeight(d.daily))
    .attr("height", (d) => {
      if (yHeight(d.daily) < 0) {
        console.log(d);
      }
      return yHeight(d.daily);
    });

  const ylines = [200, 400, 600];
  ylines.forEach((yval) => {
    svg
      .append("line")
      .attr("stroke", "black")
      .attr("stroke-width", 0.2)
      .attr("y1", y(yval))
      .attr("y2", y(yval))
      .attr("x1", margin.left + 25)
      .attr("x2", size.width - margin.right);

    svg
      .append("text")
      .text(yval)
      .attr("opacity", 0.4)
      .attr("y", y(yval))
      .attr("x", margin.left)
      .attr("text-anchor", "start")
      .attr("alignment-baseline", "middle");
  });
})();
