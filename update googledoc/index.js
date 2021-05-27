const axios = require("axios");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const fs = require("fs");

const credentials = JSON.parse(
  fs.readFileSync("update googledoc/credentials.json", "utf8")
);

axios
  .get(
    "https://data.chhs.ca.gov/dataset/f333528b-4d38-4814-bebb-12db1f10f535/resource/046cdd2b-31e5-4d34-9ed3-b48cdbc4be7a/download/covid19cases_test.csv"
  )
  .then(({ data }) => {
    let total = 0;

    const output = data
      .split("\n")
      .filter((str) => {
        return str.includes("Santa Barbara");
      })
      .map((line) => {
        const vals = line.split(",");
        const [year, mon, day] = vals[0].split("-");
        return { date: `${mon}/${day}/${year}`, daily: +vals[8] };
      })
      .reverse()
      .map((val) => {
        total += val.daily;
        return { ...val, total };
      });
    // .filter(({ total }) => total > 0);

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
