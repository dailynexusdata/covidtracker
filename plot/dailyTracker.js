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
    // .nice()
    .range([margin.left, size.width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([0, Math.max(...data.map(({ cases }) => cases))])
    .range([size.height - margin.bottom, margin.top]);

  const ylines = [250, 500, 750];
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
      .text(yval + (i === ylines.length - 1 ? " cases" : ""))
      .attr("opacity", 0.4)
      .attr("y", y(yval) - 5)
      .attr("x", margin.left)
      .attr("text-anchor", "start")
      .attr("alignment-baseline", "bottom");
  });
  svg.on("mouseenter", () => {
    const hover = svg.append("g");
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
          }/${currDate.getDate()}/${currDate.getUTCFullYear()}</div><hr><b>7-day Average: ${Math.round(
            d3.format(",")(val.avg)
          )}</b><br>New Cases: ${d3.format(",")(val.cases)}`
        )
        .style("left", x(currDate) + 10 + "px")
        .style(
          "top",
          y(val.avg) - size.height - margin.bottom - margin.top + "px"
        );

      circ
        .attr("cx", x(val.date))
        .attr("cy", y(val.avg))
        .attr("display", "block");
    });

    svg.on("mouseleave", () => {
      hover.remove();
      div.remove();
    });
  });

  const yHeight = d3
    .scaleLinear()
    .domain([0, Math.max(...data.map(({ cases }) => cases))])
    .range([0, size.height - margin.bottom - margin.top]);
  svg
    .append("g")
    .attr("transform", `translate(0, ${size.height - margin.bottom})`)
    .style("font-size", "12pt")
    .call(d3.axisBottom().scale(x).ticks(5).tickFormat(d3.timeFormat("%b")));

  svg
    .append("g")
    .attr("fill", "#FEBC11")
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

  const line = d3
    .line()
    .x(({ date }) => x(date))
    .y(({ avg }) => y(avg));

  svg
    .append("g")
    .attr("fill", "none")
    .attr("stroke", "#002B4C")
    .attr("stroke-width", 2)
    .selectAll("avg")
    .data([data.slice(3, data.length - 3)])
    .enter()
    .append("path")
    .attr("d", line);
})();
