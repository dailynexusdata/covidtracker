(async () => {
  const data = await getData();

  const svg = d3
    .select("#covid19sidebardailyTracker")
    .attr("width", size.width)
    .attr("height", size.height);

  const svgDiv = d3.select("#covid19sidebardailyTrackerDiv");

  const dateRange = [data[0].date, data[data.length - 1].date];

  const x = d3
    .scaleTime()
    .domain(dateRange)
    .range([margin.left, size.width - margin.right]);

  const yinit = d3
    .scaleLinear()
    .domain([0, Math.max(...data.map(({ cases }) => cases))]);

  const yAxis = d3.axisLeft(yinit).scale().nice().ticks(3).slice(1);

  const y = d3
    .scaleLinear()
    .domain([0, yAxis[yAxis.length - 1]])
    .range([size.height - margin.bottom, margin.top]);

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
      .text(yval + (i === yAxis.length - 1 ? " cases" : ""))
      .attr("opacity", 0.4)
      .attr("y", y(yval) - 5)
      .attr("x", margin.left)
      .attr("text-anchor", "start")
      .attr("alignment-baseline", "bottom");
  });

  svg
    .append("svg:defs")
    .append("svg:marker")
    .attr("id", "triangle")
    .attr("refX", 4)
    .attr("refY", 2)
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 4 0 0 2 4 4")
    .attr("fill", COLOR2);
  const labels = svg.append("g");

  labels
    .append("text")
    .text("7-day")
    .attr("class", "tooltip")
    .attr("x", size.width - 40)
    .attr("y", size.height - (margin.bottom * 16) / 5)
    .attr("text-anchor", "middle")
    .attr("font-size", 14)
    .attr("fill", COLOR2)
    .attr("font-weight", "bold");

  labels
    .append("text")
    .text("average")
    .attr("class", "tooltip")
    .attr("x", size.width - 40)
    .attr("y", size.height - margin.bottom * 2.7)
    .attr("text-anchor", "middle")
    .attr("font-size", 14)
    .attr("fill", COLOR2)
    .attr("font-weight", "bold");

  labels
    .append("path")
    .attr(
      "d",
      `M ${size.width - 63} ${size.height - margin.bottom * 2.25} Q ${
        size.width - 40
      } ${size.height - margin.bottom * 2.25}, ${size.width - 40} ${
        size.height - margin.bottom * 2.65
      }`
    )
    .attr("fill", "none")
    .attr("stroke", COLOR2)
    .attr("stroke-width", 2)
    .attr("marker-start", "url(#triangle)");

  labels
    .append("text")
    .text("New cases")
    .attr("x", size.width / 3 + 10)
    .attr("y", size.height * 0.5)
    .attr("class", "tooltip")
    .attr("text-anchor", "middle")
    .attr("font-size", 14)
    .attr("fill", COLOR1);

  labels
    .append("svg:defs")
    .append("svg:marker")
    .attr("id", "triangle2")
    .attr("refX", 4)
    .attr("refY", 2)
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 4 0 0 2 4 4")
    .attr("fill", COLOR1);
  labels
    .append("path")
    .attr(
      "d",
      `M ${size.width / 4 + 5} ${size.height * 0.57} Q ${size.width / 3 + 10} ${
        size.height * 0.57
      }, ${size.width / 3 + 10} ${size.height * 0.51}`
    )
    .attr("fill", "none")
    .attr("stroke", COLOR1)
    .attr("stroke-width", 2)
    .attr("marker-start", "url(#triangle2)");

  const yHeight = d3
    .scaleLinear()
    .domain([0, yAxis[yAxis.length - 1]])
    .range([0, size.height - margin.bottom - margin.top]);
  svg
    .append("g")
    .attr("transform", `translate(0, ${size.height - margin.bottom})`)
    .style("font-size", "12pt")
    .style("font-family", "Georgia, serif")
    .call(d3.axisBottom().scale(x).ticks(5).tickFormat(d3.timeFormat("%b")));

  const bars = svg
    .append("g")
    .attr("fill", COLOR1)
    .selectAll("bars")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.date))
    .attr("width", 1)
    .attr("y", (d) => size.height - margin.bottom - yHeight(d.cases))
    .attr("height", (d) => {
      if (yHeight(d.cases) < 0) {
        console.log(d);
        return size, height;
      }
      return yHeight(d.cases);
    });

  let entered = false;
  svgDiv.on("mouseenter", () => {
    if (entered) {
      return;
    }
    entered = true;

    const hover = svg.append("g");
    const circ = hover
      .append("circle")
      .attr("r", 3)
      .attr("stroke", "black")
      .attr("display", "none");

    const div = svgDiv
      .append("div")
      .attr("class", "tooltip")
      .style("display", "none");

    bars.attr("fill-opacity", 0.3);

    labels.attr("display", "none");
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

      bars
        .attr("fill-opacity", (day) => {
          // console.log(day);
          return day.date.getTime() === val.date.getTime() ? 1 : 0.3;
        })
        .attr("width", (day) => {
          // console.log(day);
          return day.date.getTime() === val.date.getTime() ? 2.5 : 0.3;
        });

      div
        .html(
          `<div class="tooltipdate">${d3.timeFormat("%B %-d, %Y")(
            currDate
          )}</div><hr><b>7-day Average: ${Math.round(
            d3.format(",")(val.avg)
          )}</b><br>New Cases: ${d3.format(",")(val.cases)}`
        )
        .style("display", "block");

      const tooltipBox = div.node().getBoundingClientRect();
      const xval = tooltipAlignmentx(x(currDate), tooltipBox);
      div
        .style("left", xval)
        .style("top", tooltipAlignmenty(y(val.avg), tooltipBox));

      // div.style("left", xval + "px");
      // div.style("left", xval + 1 + "px");

      // console.log(div.node().getBoundingClientRect());
      circ
        .attr("cx", x(val.date))
        .attr("cy", y(val.avg))
        .attr("display", "block");
    });

    svgDiv.on("mouseleave", () => {
      entered = false;
      hover.remove();
      div.remove();
      bars.attr("fill-opacity", 1).attr("width", 1);
      labels.attr("display", "block");
    });
  });

  const line = d3
    .line()
    .x(({ date }) => x(date))
    .y(({ avg }) => y(avg));

  svg
    .append("g")
    .attr("fill", "none")
    .attr("stroke", COLOR2)
    .attr("stroke-width", 2)
    .selectAll("avg")
    .data([data.slice(3, data.length - 3)])
    .enter()
    .append("path")
    .attr("d", line);
})();
