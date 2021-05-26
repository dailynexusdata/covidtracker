const size = { width: 288, height: 215 };
const margin = { left: 15, right: 15, top: 20, bottom: 25 };

const getData = async () => {
  return (await d3.json("plot/cases_vaccines.json")).map((record) => {
    // const [year, mon, day] = record.date.split("-");
    return {
      ...record,
      date: new Date(record.date),
    };
  });
};
const tooltipAlignmentx = (x, tooltipBox) => {
  // console.log(tooltipBox);
  return (
    Math.max(
      margin.left - 10,
      Math.min(
        x - tooltipBox.width / 2,
        size.width - tooltipBox.width - margin.right + 10
      )
    ) + "px"
  );
  // return (x > size.width / 2 ? x - 173 : x + 5) + "px";
};
const tooltipAlignmenty = (y, tooltipBox) => {
  return y - size.height - 10 - tooltipBox.height + "px";
};
// const tooltipAlignmentx = (x) => {
//   return (x > size.width / 2 ? x - 173 : x + 5) + "px";
// };
// const tooltipAlignmenty = (y) => {
//   return y - size.height - margin.bottom - margin.top + "px";
// };

const totalSelection = document.getElementById("totalbutton");
const daySelection = document.getElementById("daybutton");
const totalTracker = document.getElementById("totalTracker");
const dailyTracker = document.getElementById("dailyTracker");
const vaccineSelection = document.getElementById("vaccinebutton");
const vaccineTracker = document.getElementById("vaccineTracker");

const title = document.getElementById("title");

totalSelection.addEventListener("click", () => {
  totalSelection.classList.add("selected");
  vaccineSelection.classList.remove("selected");
  daySelection.classList.remove("selected");
  totalTracker.classList.add("selectedPlot");
  vaccineTracker.classList.remove("selectedPlot");
  dailyTracker.classList.remove("selectedPlot");
  title.innerHTML = "Cumulative Covid Cases";
});
daySelection.addEventListener("click", () => {
  totalSelection.classList.remove("selected");
  vaccineSelection.classList.remove("selected");
  daySelection.classList.add("selected");
  totalTracker.classList.remove("selectedPlot");
  vaccineTracker.classList.remove("selectedPlot");
  dailyTracker.classList.add("selectedPlot");
  title.innerHTML = "Daily Covid Cases";
});
vaccineSelection.addEventListener("click", () => {
  totalSelection.classList.remove("selected");
  vaccineSelection.classList.add("selected");
  daySelection.classList.remove("selected");
  totalTracker.classList.remove("selectedPlot");
  vaccineTracker.classList.add("selectedPlot");
  dailyTracker.classList.remove("selectedPlot");
  title.innerHTML = "Cumulative Vaccines";
});
daySelection.classList.add("selected");
dailyTracker.classList.add("selectedPlot");

// daySelection.classList.add("selected");
// dailyTracker.classList.add("selectedPlot");
