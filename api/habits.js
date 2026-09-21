const HABIT_NAMES = [
  "Bett Machen",
  "8k Steps",
  "Buch lesen",
  "Spanisch",
  "Tagebuch"
];

const NOTION_VERSION = "2026-03-11";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function berlinDate() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function notionHeaders() {
  return {
    Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json"
  };
}

async function notionFetch(path, options = {}) {
  const response = await fetch(`https://api.notion.com/v1${path}`, {
    ...options,
    headers: {
      ...notionHeaders(),
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || `Notion API Fehler (${response.status})`;
    throw new Error(message);
  }

  return data;
}

async function getTodayPage() {
  const dataSourceId = process.env.NOTION_DATA_SOURCE_ID;
  const today = berlinDate();

  const result = await notionFetch(
    `/data_sources/${encodeURIComponent(dataSourceId)}/query`,
    {
      method: "POST",
      body: JSON.stringify({
        filter: {
          property: "Date",
          date: {
            equals: today
          }
        },
        page_size: 1
      })
    }
  );

  return result.results?.[0] || null;
}

function pageToHabits(page) {
  return HABIT_NAMES.map((name) => ({
    name,
    done: Boolean(page.properties?.[name]?.checkbox)
  }));
}

export default {
  async fetch(request) {
    try {
      if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATA_SOURCE_ID) {
        return json(
          { error: "Notion-Umgebungsvariablen sind noch nicht konfiguriert." },
          500
        );
      }

      if (request.method === "GET") {
        const page = await getTodayPage();

        if (!page) {
          return json(
            { error: "Für heute wurde kein Habit-Datensatz in Notion gefunden." },
            404
          );
        }

        return json({
          pageId: page.id,
          date: berlinDate(),
          habits: pageToHabits(page)
        });
      }

      if (request.method === "POST") {
        const body = await request.json().catch(() => null);

        if (
          !body ||
          typeof body.pageId !== "string" ||
          !HABIT_NAMES.includes(body.habit) ||
          typeof body.checked !== "boolean"
        ) {
          return json({ error: "Ungültige Anfrage." }, 400);
        }

        await notionFetch(`/pages/${encodeURIComponent(body.pageId)}`, {
          method: "PATCH",
          body: JSON.stringify({
            properties: {
              [body.habit]: {
                checkbox: body.checked
              }
            }
          })
        });

        return json({ ok: true });
      }

      return json({ error: "Methode nicht unterstützt." }, 405);
    } catch (error) {
      console.error(error);
      return json(
        { error: error instanceof Error ? error.message : "Unbekannter Fehler." },
        500
      );
    }
  }
};
