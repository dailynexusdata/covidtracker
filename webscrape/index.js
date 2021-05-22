const axios = require("axios");
const fs = require("fs");

axios
  .get(
    "https://static.usafacts.org/public/data/covid-19/covid_confirmed_usafacts.csv"
  )
  .then(({ data }) => {
    const header = data.substring(0, data.indexOf("\n"));
    const dates = header.match(/StateFIPS,([\d,\-]*)/)[1].split(",");
    const sbRow = data
      .match(/Santa Barbara County .*\"06\",([\d,]*)/)[1]
      .split(",");

    const output = [];
    dates.forEach((d, i) => {
      const [year, mon, day] = d.split("-");
      // date, total, new
      output.push({
        date: `${mon}/${day}/${year}`,
        total: +sbRow[i],
        daily: i === 0 ? 0 : sbRow[i] - sbRow[i - 1],
      });
    });

    fs.writeFileSync("cases.json", JSON.stringify(output), "utf8");
  });
