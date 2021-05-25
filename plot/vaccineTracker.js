(async () => {
  const data = await getData();

  const svg = d3
    .select("#vaccineTracker")
    .attr("width", size.width)
    .attr("height", size.height);

  const dateRange = [data[0].date, data[data.length - 1].date];

  const x = d3
    .scaleTime()
    .domain(dateRange)
    .range([margin.left, size.width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([data[0].total_doses, data[data.length - 1].total_doses])
    .range([size.height - margin.bottom, margin.top]);

  svg
    .append("g")
    .attr("transform", `translate(0, ${size.height - margin.bottom})`)
    .style("font-size", "12pt")
    .call(d3.axisBottom().scale(x).ticks(7).tickFormat(d3.timeFormat("%b")));

  const line = d3
    // .area(d3.curveLinear)
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.total_doses));
  // .y0((d) => y(d.total))
  // .y1(y(0));

  svg
    .append("g")
    .attr("stroke", "#003660")
    .attr("stroke-width", 3)
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

    const div = d3.select("#plotarea").append("div").attr("class", "tooltip");

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

      div
        .html(
          `<div class="tooltipdate">${
            currDate.getMonth() + 1
          }/${currDate.getDate()}/${currDate.getUTCFullYear()}</div><hr>Total At Least One Dose: ${d3.format(
            ","
          )(val.total_doses)}`
        )
        .style("left", x(currDate) + 10 + "px")
        .style(
          "top",
          y(val.total_doses) - size.height - margin.bottom - margin.top + "px"
        );
      line
        .attr("x1", x(currDate))
        .attr("x2", x(currDate))
        .attr("y1", margin.top)
        .attr("y2", size.height - margin.bottom);

      circ
        .attr("cx", x(val.date))
        .attr("cy", y(val.total_doses))
        .attr("display", "block");
    });

    svg.on("mouseleave", () => {
      hover.remove();
      div.remove();
    });
  });

  const ylines = [50000, 150000, 250000];
  ylines.forEach((yval, i) => {
    svg
      .append("line")
      .attr("stroke", "black")
      .attr("stroke-width", 0.2)
      .attr("y1", y(yval))
      .attr("y2", y(yval))
      .attr("x1", margin.left)
      .attr("x2", size.width - margin.right);
    svg
      .append("text")
      .attr("class", "svgtxt")
      .text(yval / 1000 + ",000" + (i == ylines.length - 1 ? " people" : ""))
      .attr("opacity", 0.4)
      .attr("y", y(yval) - 5)
      .attr("x", margin.left)
      .attr("text-anchor", "start")
      .attr("alignment-baseline", "bottom");
  });
})();
