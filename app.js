const FALLBACK_HABITS = [
  "Bett Machen",
  "8k Steps",
  "Buch lesen",
  "Spanisch",
  "Tagebuch"
];

const STORAGE_KEY = "daily-progress-widget-v2";

const habitList = document.getElementById("habitList");
const progressFill = document.getElementById("progressFill");
const progressTrack = document.getElementById("progressTrack");
const percentage = document.getElementById("percentage");
const summary = document.getElementById("summary");
const dateLabel = document.getElementById("dateLabel");
const syncStatus = document.getElementById("syncStatus");
const refreshButton = document.getElementById("refreshButton");

let mode = "local";
let currentPageId = null;
let habits = loadLocalState();

function todayKey() {
  return new Intl.DateTimeFormat("de-DE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function loadLocalState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === todayKey() && Array.isArray(parsed.habits)) {
        return parsed.habits;
      }
    }
  } catch {}

  return FALLBACK_HABITS.map((name) => ({ name, done: false }));
}

function saveLocalState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      date: todayKey(),
      habits
    })
  );
}

function setStatus(text, state = "idle") {
  syncStatus.textContent = text;
  syncStatus.dataset.state = state;
}

function formatDate() {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  }).format(new Date());
}

function updateProgress() {
  const completed = habits.filter((habit) => habit.done).length;
  const total = habits.length;
  const value = total === 0 ? 0 : Math.round((completed / total) * 100);

  progressFill.style.width = `${value}%`;
  percentage.textContent = `${value}%`;
  summary.textContent = `${completed} von ${total} Habits erledigt`;
  progressTrack.setAttribute("aria-valuenow", String(value));
}

async function updateHabitInNotion(habitName, checked) {
  const response = await fetch("/api/habits", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      pageId: currentPageId,
      habit: habitName,
      checked
    })
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Notion konnte nicht aktualisiert werden.");
  }
}

function render() {
  habitList.innerHTML = "";

  habits.forEach((habit) => {
    const label = document.createElement("label");
    label.className = "habit";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = Boolean(habit.done);

    const checkmark = document.createElement("span");
    checkmark.className = "checkmark";

    const name = document.createElement("span");
    name.className = "habit-name";
    name.textContent = habit.name;

    input.addEventListener("change", async () => {
      const oldValue = habit.done;
      habit.done = input.checked;
      updateProgress();

      if (mode !== "notion") {
        saveLocalState();
        return;
      }

      input.disabled = true;
      setStatus("Synchronisiere …", "syncing");

      try {
        await updateHabitInNotion(habit.name, habit.done);
        setStatus("Mit Notion synchronisiert", "live");
      } catch (error) {
        habit.done = oldValue;
        input.checked = oldValue;
        updateProgress();
        setStatus("Synchronisierung fehlgeschlagen", "error");
        console.error(error);
      } finally {
        input.disabled = false;
      }
    });

    label.append(input, checkmark, name);
    habitList.appendChild(label);
  });

  updateProgress();
}

async function loadFromNotion({ quiet = false } = {}) {
  if (!quiet) {
    setStatus("Verbinde mit Notion …", "syncing");
    refreshButton.disabled = true;
  }

  try {
    const response = await fetch("/api/habits", {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Notion API ist noch nicht konfiguriert.");
    }

    const data = await response.json();

    if (!Array.isArray(data.habits) || !data.pageId) {
      throw new Error("Ungültige API-Antwort.");
    }

    habits = data.habits;
    currentPageId = data.pageId;
    mode = "notion";
    render();
    setStatus("Mit Notion synchronisiert", "live");
  } catch (error) {
    if (mode !== "notion") {
      mode = "local";
      currentPageId = null;
      render();
      setStatus("Lokaler Modus · Notion noch nicht verbunden", "local");
    } else {
      setStatus("Notion momentan nicht erreichbar", "error");
    }
    console.error(error);
  } finally {
    refreshButton.disabled = false;
  }
}

refreshButton.addEventListener("click", () => loadFromNotion());

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && mode === "notion") {
    loadFromNotion({ quiet: true });
  }
});

dateLabel.textContent = formatDate();
render();
loadFromNotion();

setInterval(() => {
  if (mode === "notion" && !document.hidden) {
    loadFromNotion({ quiet: true });
  }
}, 60000);
