(async () => {
  const data = await getData();

  const svg = d3
    .select("#totalTracker")
    .attr("width", size.width)
    .attr("height", size.height);

  const svgDiv = d3.select("#totalTrackerDiv");

  const dateRange = [data[0].date, data[data.length - 1].date];

  const x = d3
    .scaleTime()
    .domain(dateRange)
    .range([margin.left, size.width - margin.right]);

  const yinit = d3.scaleLinear().domain([0, data[data.length - 1].total_cases]);
  const yAxis = d3.axisLeft(yinit).scale().nice(3).ticks(3).slice(1);

  const y = d3
    .scaleLinear()
    .domain([0, yAxis[yAxis.length - 1]])
    .range([size.height - margin.bottom, margin.top]);

  svg
    .append("g")
    .attr("transform", `translate(0, ${size.height - margin.bottom})`)
    .style("font-size", "12pt")
    .style("font-family", "Georgia, serif")
    .call(d3.axisBottom().scale(x).ticks(7).tickFormat(d3.timeFormat("%b")));

  const line = d3
    // .area(d3.curveLinear)
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.total_cases));
  // .y0((d) => y(d.total))
  // .y1(y(0));

  const area = d3
    .area()
    .x((d) => x(d.date))
    .y0(size.height - margin.bottom)
    .y1((d) => y(d.total_cases));

  svg
    .append("g")
    .attr("stroke", COLOR2)
    .attr("stroke-width", 3)
    .attr("fill", "none")
    .datum(data)
    .append("path")
    .attr("d", line);
  svg
    .append("g")
    .attr("stroke", "none")
    .attr("fill", COLOR2)
    .attr("fill-opacity", 0.3)
    .selectAll("myArea")
    .data([data])
    .enter()
    .append("path")
    .attr("d", area);
  let entered = false;
  svgDiv.on("mouseenter", () => {
    if (entered) {
      return;
    }
    entered = true;
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

    const div = svgDiv
      .append("div")
      .attr("class", "tooltip")
      .style("display", "none");
    svgDiv.on("mousemove", (event) => {
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
      div.html(
        `<div class="tooltipdate">${d3.timeFormat("%B %-d, %Y")(
          currDate
        )}</div><hr>Total Cases: ${d3.format(",")(val.total_cases)}`
      );

      const tooltipBox = div.node().getBoundingClientRect();
      div
        .style("left", tooltipAlignmentx(x(currDate), tooltipBox))
        .style("top", tooltipAlignmenty(y(val.total_cases), tooltipBox))
        .style("display", "block");

      line
        .attr("x1", x(currDate))
        .attr("x2", x(currDate))
        .attr("y1", margin.top)
        .attr("y2", size.height - margin.bottom);

      circ
        .attr("cx", x(val.date))
        .attr("cy", y(val.total_cases))
        .attr("display", "block");
    });

    svgDiv.on("mouseleave", () => {
      hover.remove();
      div.remove();
      entered = false;
    });
  });

  yAxis.forEach((yval, i) => {
    svg
      .append("line")
      .attr("stroke", "black")
      .attr("stroke-width", 0.2)
      .attr("stroke-opacity", 0.3)
      .attr("y1", y(yval))
      .attr("y2", y(yval))
      .attr("x1", margin.left)
      .attr("x2", size.width - margin.right);
    svg
      .append("text")
      .attr("class", "svgtxt")
      .text(yval / 1000 + ",000" + (i == yAxis.length - 1 ? " cases" : ""))
      .attr("opacity", 0.4)
      .attr("y", y(yval) - 5)
      .attr("x", margin.left)
      .attr("text-anchor", "start")
      .attr("alignment-baseline", "bottom");
  });
})();
