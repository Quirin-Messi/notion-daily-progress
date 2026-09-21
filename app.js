const DEFAULT_HABITS = [
  "Gym",
  "Lesen",
  "2 L Wasser",
  "10.000 Schritte",
  "Stretching",
  "Tagesplanung"
];

const STORAGE_KEY = "daily-progress-widget-v1";

const habitList = document.getElementById("habitList");
const progressFill = document.getElementById("progressFill");
const progressTrack = document.getElementById("progressTrack");
const percentage = document.getElementById("percentage");
const summary = document.getElementById("summary");
const dateLabel = document.getElementById("dateLabel");
const resetButton = document.getElementById("resetButton");

function todayKey() {
  return new Intl.DateTimeFormat("de-DE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // Daily reset: a saved state from another day is ignored.
    if (parsed.date !== todayKey()) return null;

    return parsed;
  } catch {
    return null;
  }
}

function saveState(habits) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      date: todayKey(),
      habits
    })
  );
}

let habits =
  loadState()?.habits ||
  DEFAULT_HABITS.map((name, index) => ({
    id: String(index + 1),
    name,
    done: false
  }));

function render() {
  habitList.innerHTML = "";

  habits.forEach((habit) => {
    const label = document.createElement("label");
    label.className = "habit";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = habit.done;
    input.addEventListener("change", () => {
      habit.done = input.checked;
      saveState(habits);
      updateProgress();
    });

    const checkmark = document.createElement("span");
    checkmark.className = "checkmark";

    const name = document.createElement("span");
    name.className = "habit-name";
    name.textContent = habit.name;

    label.append(input, checkmark, name);
    habitList.appendChild(label);
  });

  updateProgress();
}

function updateProgress() {
  const completed = habits.filter((habit) => habit.done).length;
  const total = habits.length;
  const value = total === 0 ? 0 : Math.round((completed / total) * 100);

  progressFill.style.width = `${value}%`;
  percentage.textContent = `${value}%`;
  summary.textContent = `${completed} von ${total} Habits erledigt`;
  progressTrack.setAttribute("aria-valuenow", value);
}

function formatDate() {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  }).format(new Date());
}

resetButton.addEventListener("click", () => {
  habits = habits.map((habit) => ({ ...habit, done: false }));
  saveState(habits);
  render();
});

dateLabel.textContent = formatDate();
render();
