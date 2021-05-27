const size = { width: 286, height: 213 };
const margin = { left: 15, right: 15, top: 28, bottom: 25 };

const getData = async () => {
  return (await d3.json("plot/cases_vaccines.json")).map((record) => {
    return {
      ...record,
      date: new Date(record.date),
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
  title.innerHTML = "Cumulative COVID-19 Vaccines";
});
daySelection.classList.add("selected");
dailyTracker.classList.add("selectedPlot");

const COLOR1 = "#85BDDEbb"; //"rgb(231,111,81)";
const COLOR2 = "#D96942";
