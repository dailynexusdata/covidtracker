(async () => {
  const data = await getData();

  const svg = d3
    .select("#totalTracker")
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
    .domain([data[0].total, data[data.length - 1].total])
    .range([size.height - margin.bottom, margin.top]);

  svg
    .append("g")
    .attr("transform", `translate(0, ${size.height - margin.bottom})`)
    .style("font-size", "12px")
    .call(d3.axisBottom().scale(x).ticks(5));

  const line = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.total));

  svg
    .append("g")
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("fill", "none")
    .selectAll("myline")
    .data([data])
    .enter()
    .append("path")
    .attr("d", line);

  svg.on("mouseenter", () => {
    const hover = svg.append("g");
    const line = hover
      .append("line")
      .style("stroke-dasharray", "3, 3")
      .attr("stroke", "black");
    const circ = hover
      .append("circle")
      .attr("r", 3)
      .attr("stroke", "black")
      .attr("display", "none");

    svg.on("mousemove", (event) => {
      const currDate = x.invert(d3.pointer(event)[0]);

      if (currDate < dateRange[0] || currDate > dateRange[1]) {
        return;
      }

      const val = data.reduce((past, curr) => {
        return past.date.getTime() <= currDate.getTime() &&
          currDate.getTime() <= curr.date.getTime()
          ? past
          : curr;
      });

      line
        .attr("x1", x(currDate))
        .attr("x2", x(currDate))
        .attr("y1", margin.top)
        .attr("y2", size.height - margin.bottom);

      circ
        .attr("cx", x(val.date))
        .attr("cy", y(val.total))
        .attr("display", "block");
    });

    svg.on("mouseleave", () => {
      hover.remove();
    });
  });
})();
