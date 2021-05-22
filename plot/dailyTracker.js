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
    .domain([data[0].daily, data[data.length - 1].daily])
    .range([size.height - margin.bottom, margin.top]);
})();
