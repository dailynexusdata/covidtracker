const axios = require("axios");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const fs = require("fs");

const credentials = JSON.parse(
  fs.readFileSync("update googledoc/credentials.json", "utf8")
);

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
    return output;
  })
  .then(async (data) => {
    const doc = new GoogleSpreadsheet(
      "1Zv8NaDk8hiCqIQa5v_ImA89a7IT9dY98Gnh-IbJkdW0"
    );

    await doc.useServiceAccountAuth({
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    });

    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];

    const rowDates = (await sheet.getRows()).map(({ date }) => date);
    const dataToAdd = data.filter(({ date }) => {
      return !rowDates.includes(date);
    });

    console.log(`Appending ${dataToAdd.length} rows...`);

    sheet.addRows(dataToAdd);
  });
