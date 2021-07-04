const size = { width: 286, height: 213 };
const margin = { left: 15, right: 15, top: 28, bottom: 25 };

const getData = async () => {
  let parseTime = d3.timeParse("%Y-%m-%d");

  return (
    await d3.json(
      "https://dailynexus.s3-us-west-1.amazonaws.com/cases_vaccines.json"
    )
  ).map((record) => {
    return {
      ...record,
      date: parseTime(record.date)
    };
  });
};
const tooltipAlignmentx = (x, tooltipBox) => {
  return (
    Math.max(
      margin.left - 10,
      Math.min(
        x - tooltipBox.width / 2,
        size.width - tooltipBox.width - margin.right + 10
      )
    ) + "px"
  );
};
const tooltipAlignmenty = (y, tooltipBox) => {
  return y - size.height - 10 - tooltipBox.height + "px";
};

const totalSelection = document.getElementById("covid19sidebartotalbutton");
const daySelection = document.getElementById("covid19sidebardaybutton");
const totalTracker = document.getElementById("covid19sidebartotalTracker");
const dailyTracker = document.getElementById("covid19sidebardailyTracker");
const vaccineSelection = document.getElementById("covid19sidebarvaccinebutton");
const vaccineTracker = document.getElementById("covid19sidebarvaccineTracker");

const title = document.getElementById("covid19sidebartitle");

totalSelection.addEventListener("click", () => {
  totalSelection.classList.add("selected");
  vaccineSelection.classList.remove("selected");
  daySelection.classList.remove("selected");
  totalTracker.classList.add("selectedPlot");
  vaccineTracker.classList.remove("selectedPlot");
  dailyTracker.classList.remove("selectedPlot");
  title.innerHTML = "Cumulative COVID-19 Cases";
});
daySelection.addEventListener("click", () => {
  totalSelection.classList.remove("selected");
  vaccineSelection.classList.remove("selected");
  daySelection.classList.add("selected");
  totalTracker.classList.remove("selectedPlot");
  vaccineTracker.classList.remove("selectedPlot");
  dailyTracker.classList.add("selectedPlot");
  title.innerHTML = "Daily COVID-19 Cases";
});
vaccineSelection.addEventListener("click", () => {
  totalSelection.classList.remove("selected");
  vaccineSelection.classList.add("selected");
  daySelection.classList.remove("selected");
  totalTracker.classList.remove("selectedPlot");
  vaccineTracker.classList.add("selectedPlot");
  dailyTracker.classList.remove("selectedPlot");
  title.innerHTML = "COVID-19 Vaccines Administered";
});
daySelection.classList.add("selected");
dailyTracker.classList.add("selectedPlot");

const COLOR1 = "#85BDDEbb";
const COLOR2 = "#D96942";

(async () => {
  const data = await getData();

  (() => {
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
        `M ${size.width / 4 + 5} ${size.height * 0.57} Q ${
          size.width / 3 + 10
        } ${size.height * 0.57}, ${size.width / 3 + 10} ${size.height * 0.51}`
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
        let currDate = x.invert(d3.pointer(event)[0]);

        let val = data.reduce((past, curr) => {
          return past.date.getTime() <= currDate.getTime() &&
            currDate.getTime() <= curr.date.getTime()
            ? past
            : curr;
        });
        if (currDate < dateRange[0]) {
          val = data[0];
          currDate = dateRange[0];
        } else if (currDate > dateRange[1]) {
          val = data[data.length - 1];
          currDate = dateRange[1];
        }

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

  (() => {
    const svg = d3
      .select("#covid19sidebartotalTracker")
      .attr("width", size.width)
      .attr("height", size.height);

    const svgDiv = d3.select("#covid19sidebartotalTrackerDiv");

    const dateRange = [data[0].date, data[data.length - 1].date];

    const x = d3
      .scaleTime()
      .domain(dateRange)
      .range([margin.left, size.width - margin.right]);

    const yinit = d3
      .scaleLinear()
      .domain([0, data[data.length - 1].total_cases]);
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
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.total_cases));

    const area = d3
      .area()
      .x((d) => x(d.date))
      .y0(size.height - margin.bottom)
      .y1((d) => y(d.total_cases));
    console.log(data);
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
        let currDate = x.invert(d3.pointer(event)[0]);

        let val = data.reduce((past, curr) => {
          return past.date.getTime() <= currDate.getTime() &&
            currDate.getTime() <= curr.date.getTime()
            ? past
            : curr;
        });
        if (currDate < dateRange[0]) {
          val = data[0];
          currDate = dateRange[0];
        } else if (currDate > dateRange[1]) {
          val = data[data.length - 1];
          currDate = dateRange[1];
        }
        div
          .html(
            `<div class="tooltipdate">${d3.timeFormat("%B %-d, %Y")(
              currDate
            )}</div><hr>Total Cases: ${d3.format(",")(val.total_cases)}`
          )
          .style("display", "block");

        const tooltipBox = div.node().getBoundingClientRect();
        div
          .style("left", tooltipAlignmentx(x(currDate), tooltipBox))
          .style("top", tooltipAlignmenty(y(val.total_cases), tooltipBox));

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
  (() => {
    const svg = d3
      .select("#covid19sidebarvaccineTracker")
      .attr("width", size.width)
      .attr("height", size.height);
    const svgDiv = d3.select("#covid19sidebarvaccineTrackerDiv");

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
      .attr("y", size.height - (margin.bottom * 3) / 2)
      .attr("x", margin.left * 2)
      .attr("fill", COLOR1)
      .attr("text-align", "start")
      .attr("alignment-baseline", "middle");
    legend
      .append("text")
      .attr("class", "svgtxt")
      .text("At Least One Dose")
      .attr("y", size.height - margin.bottom * 2.2)
      .attr("x", margin.left * 2)
      .attr("fill", COLOR2)
      .attr("text-align", "start")
      .attr("alignment-baseline", "middle");
    legend
      .append("line")
      .attr("y1", size.height - margin.bottom * 2.2)
      .attr("y2", size.height - margin.bottom * 2.2)
      .attr("x1", margin.left)
      .attr("x2", margin.left * 2)
      .attr("stroke", COLOR2)
      .attr("stroke-width", 2);
    legend
      .append("line")
      .attr("y1", size.height - (margin.bottom * 3) / 2)
      .attr("y2", size.height - (margin.bottom * 3) / 2)
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
        let currDate = x.invert(d3.pointer(event)[0]);

        let val = data.reduce((past, curr) => {
          return past.date.getTime() <= currDate.getTime() &&
            currDate.getTime() <= curr.date.getTime()
            ? past
            : curr;
        });
        if (currDate < dateRange[0]) {
          val = data[0];
          currDate = dateRange[0];
        } else if (currDate > dateRange[1]) {
          val = data[data.length - 1];
          currDate = dateRange[1];
        }
        div
          .html(
            `<div class="tooltipdate">${d3.timeFormat("%B %-d, %Y")(
              currDate
            )} </div><hr><b>At Least One Dose: <br>${Math.round(
              (val.total_doses / val.population) * 100
            )}% (${d3.format(",")(
              val.total_doses
            )} people)</b><br>Fully Vaccinated: <br>${Math.round(
              (val.total_double_doses / val.population) * 100
            )}% (${d3.format(",")(val.total_double_doses)} people)`
          )
          .style("display", "block");

        const tooltipBox = div.node().getBoundingClientRect();
        div
          .style("left", tooltipAlignmentx(x(currDate), tooltipBox))
          .style(
            "top",
            tooltipAlignmenty(y(val.total_doses / val.population), tooltipBox)
          );
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
        .text(
          yval * 100 + (yAxis.length - 1 === i ? "% of county population" : "%")
        )
        .attr("opacity", 0.4)
        .attr("y", y(yval) - 5)
        .attr("x", margin.left)
        .attr("text-anchor", "start")
        .attr("alignment-baseline", "bottom");
    });
  })();
})();
