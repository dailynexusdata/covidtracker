(async () => {
  const data = await getData();

  const svg = d3
    .select("#vaccineTracker")
    .attr("width", size.width)
    .attr("height", size.height);
  const svgDiv = d3.select("#vaccineTrackerDiv");

  const dateRange = [data[0].date, data[data.length - 1].date];

  const x = d3
    .scaleTime()
    .domain(dateRange)
    .range([margin.left, size.width - margin.right]);

  const yinit = d3
    .scaleLinear()
    .domain([
      0,
      data[data.length - 1].total_doses / data[data.length - 1].population,
    ]);
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

  const line1 = d3
    // .area(d3.curveLinear)
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.total_doses / d.population));
  // .y0((d) => y(d.total))
  // .y1(y(0));

  const line2 = d3
    // .area(d3.curveLinear)
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.total_double_doses / d.population));

  const total_area = d3
    .area()
    .x((d) => x(d.date))
    .y0((d) => y(d.total_double_doses / d.population))
    .y1((d) => y(d.total_doses / d.population));
  const double_area = d3
    .area()
    .x((d) => x(d.date))
    .y0(size.height - margin.bottom)
    .y1((d) => y(d.total_double_doses / d.population));

  svg
    .append("g")
    .attr("stroke", "none")
    .attr("fill", COLOR2)
    .attr("fill-opacity", 0.3)
    .datum(data)
    .append("path")
    .attr("d", total_area);
  svg
    .append("g")
    .attr("stroke", "none")
    .attr("fill", COLOR1)
    .attr("fill-opacity", 0.3)
    .datum(data)
    .append("path")
    .attr("d", double_area);

  svg
    .append("g")
    .attr("stroke", COLOR1)
    .attr("stroke-width", 3)
    .attr("fill", "none")
    .selectAll("myline")
    .data([data])
    .enter()
    .append("path")
    .attr("d", line2);
  svg
    .append("g")
    .attr("stroke", COLOR2)
    .attr("stroke-width", 3)
    .attr("fill", "none")
    .selectAll("myline")
    .data([data])
    .enter()
    .append("path")
    .attr("d", line1);

  const legend = svg.append("g");

  legend
    .append("text")
    .attr("class", "svgtxt")
    .text("Fully Vaccinated")
    .attr("y", y(0.1))
    .attr("x", margin.left * 2)
    .attr("fill", COLOR1)
    .attr("text-align", "start")
    .attr("alignment-baseline", "middle");
  legend
    .append("text")
    .attr("class", "svgtxt")
    .text("At Least One Dose")
    .attr("y", y(0.1) - 16)
    .attr("x", margin.left * 2)
    .attr("fill", COLOR2)
    .attr("text-align", "start")
    .attr("alignment-baseline", "middle");
  legend
    .append("line")
    .attr("y1", y(0.1) - 16)
    .attr("y2", y(0.1) - 16)
    .attr("x1", margin.left)
    .attr("x2", margin.left * 2)
    .attr("stroke", COLOR2)
    .attr("stroke-width", 2);
  legend
    .append("line")
    .attr("y1", y(0.1))
    .attr("y2", y(0.1))
    .attr("x1", margin.left)
    .attr("x2", margin.left * 2)
    .attr("stroke", COLOR1)
    .attr("stroke-width", 2);

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
    const circ1 = hover
      .append("circle")
      .attr("r", 3)
      .attr("stroke", "black")
      .attr("display", "none");
    const circ2 = hover
      .append("circle")
      .attr("r", 3)
      .attr("stroke", "black")
      .attr("display", "none");
    const div = svgDiv
      .append("div")
      .attr("class", "tooltipvac")
      .style("display", "none");
    legend.attr("display", "none");
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
        )} </div><hr><b>At Least One Dose: <br>${d3.format(",")(
          val.total_doses
        )} people (${Math.round(
          (val.total_doses / val.population) * 100
        )}%)</b><br>Fully Vaccinated: <br>${d3.format(",")(
          val.total_double_doses
        )} people (${Math.round(
          (val.total_double_doses / val.population) * 100
        )}%)`
      );

      const tooltipBox = div.node().getBoundingClientRect();
      div
        .style("left", tooltipAlignmentx(x(currDate), tooltipBox))
        .style(
          "top",
          tooltipAlignmenty(y(val.total_doses / val.population), tooltipBox)
        )
        .style("display", "block");
      line
        .attr("x1", x(currDate))
        .attr("x2", x(currDate))
        .attr("y1", margin.top)
        .attr("y2", size.height - margin.bottom);

      circ1
        .attr("cx", x(val.date))
        .attr("cy", y(val.total_doses / val.population))
        .attr("display", "block");
      circ2
        .attr("cx", x(val.date))
        .attr("cy", y(val.total_double_doses / val.population))
        .attr("display", "block");
    });

    svgDiv.on("mouseleave", () => {
      entered = false;
      hover.remove();
      div.remove();
      legend.attr("display", "block");
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
      .text(yval * 100 + (yAxis.length - 1 === i ? "% of population" : "%"))
      .attr("opacity", 0.4)
      .attr("y", y(yval) - 5)
      .attr("x", margin.left)
      .attr("text-anchor", "start")
      .attr("alignment-baseline", "bottom");
  });
})();
