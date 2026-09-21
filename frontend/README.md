# Dept E — Frontend


## Setup

1. Open `js/config.js` and replace the two placeholder URLs:

```js
WEBHOOK_ANALYSE: "https://YOUR_N8N_INSTANCE/webhook/business",
WEBHOOK_FETCH:   "https://YOUR_N8N_INSTANCE/webhook/business-search",
```

2. Host the folder on any static server (e.g. Netlify, Vercel, GitHub Pages, or simply open `index.html` locally for testing).

3. Make sure your n8n instance has CORS enabled for the domain you host from, or enable the "Allowed Origins" setting in n8n → Settings → API.

---

## Flow

```
User enters URL
      │
      ▼
POST /business          ← Webhook 1
  { website: "https://..." }
  → Scrape → Build prompt → Save to Drive → Respond 200
      │
      ▼  (user picks reports)
POST /business-search   ← Webhook 2
  { reports: ["business", "audience", ...] }
  → 7 parallel Drive searches → Merge → Respond
  ← { data: { business, audience, keyword, competitor, backlink, seo, ad } }
      │
      ▼
Display tabbed results panel
```

---



## Files

```
/
├── index.html          Main page (3 screens: input → select → results)
├── css/
│   └── style.css       Fairy-core design system
├── js/
│   ├── config.js       Webhook URLs + timeouts — edit this first
│   ├── reports.js      Report definitions (keys, labels, icons)
│   └── app.js          All UI logic & API calls
└── README.md           This file
```
