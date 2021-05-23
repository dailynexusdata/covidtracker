const size = { width: 288, height: 220 };
const margin = { left: 15, right: 15, top: 15, bottom: 25 };

const getData = async () => {
  return (await d3.json("plot/cases.json")).map(({ date, total, daily }) => {
    const [mon, day, year] = date.split("/");

    return {
      date: new Date(year, mon - 1, day),
      total,
      daily,
    };
  });
};

const totalSelection = document.getElementById("totalbutton");
const daySelection = document.getElementById("daybutton");
const totalTracker = document.getElementById("totalTracker");
const dailyTracker = document.getElementById("dailyTracker");

totalSelection.addEventListener("click", () => {
  totalSelection.classList.add("selected");
  daySelection.classList.remove("selected");
  totalTracker.classList.add("selectedPlot");
  dailyTracker.classList.remove("selectedPlot");
});
daySelection.addEventListener("click", () => {
  totalSelection.classList.remove("selected");
  daySelection.classList.add("selected");
  totalTracker.classList.remove("selectedPlot");
  dailyTracker.classList.add("selectedPlot");
});

totalSelection.classList.add("selected");
totalTracker.classList.add("selectedPlot");
