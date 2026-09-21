/**
 * config.js — Dept E
 *
 * ⚠️  Replace the URLs below with your actual n8n webhook URLs.
 *
 * WEBHOOK_ANALYSE (/business)
 *   Receives:  { website: "https://..." }
 *   Should return: { content: "<the full prompt text>" }
 *   Currently your n8n "Code in JavaScript" node builds a prompt string
 *   in $json.content — make sure "Respond to Webhook" returns that.
 *   In your Respond node set Response Body to: ={{ JSON.stringify({ content: $json.content }) }}
 *
 * WEBHOOK_FETCH (/business-search)
 *   Receives:  { reports: ["audience", "ad", ...] }
 *   Should return: { business: "...", audience: "...", ad: "...", ... }
 *   In your Respond to Webhook1 node, change the expression to:
 *   ={{ JSON.stringify($json) }}
 *   (Code in JavaScript8 already builds the object with the right keys)
 */
const CONFIG = {
  WEBHOOK_ANALYSE: "http://localhost:5678/webhook-test/business",
  WEBHOOK_FETCH:   "http://localhost:5678/webhook-test/business-search",
  ANALYSE_TIMEOUT: 90000,
  FETCH_TIMEOUT:   60000,
};
