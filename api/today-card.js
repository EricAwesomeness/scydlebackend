import { Redis } from "@upstash/redis";
import { MODE_QUERIES, getMode, scryfallRandomUrl, expandToFirstPrinting } from "./_lib.js";

const redis = new Redis({
    url:
        process.env.scrydle_KV_REST_API_URL ||
        process.env.scrydle_KV_URL ||
        process.env.scrydle_REDIS_URL,
    token:
        process.env.scrydle_KV_REST_API_TOKEN ||
        process.env.scrydle_KV_REST_API_READ_ONLY_TOKEN,
});

export default async function handler(req, res) {
    const mode = getMode(req);
    const q = MODE_QUERIES[mode];
    const today = new Date().toISOString().slice(0, 10);
    const key = `scrydle:card:${today}:${mode}`;

    try {
        const cached = await redis.get(key);
        if (cached) {
            // Return full cached card (already first printing)
            return res.status(200).json({ mode, source: "cache", ...cached });
        }

        const r = await fetch(scryfallRandomUrl(q), {
            headers: { "User-Agent": "Scrydle/1.0 (today-card)" },
        });
        if (!r.ok) return res.status(502).json({ error: `Scryfall ${r.status}` });

        const card = await r.json();

        // NEW: Replace with earliest printing
        // const first = await expandToFirstPrinting(card, "-is:funny -is:promo -is:digital");
        const first = await expandToFirstPrinting(card);

        // Store full object (no trimming)
        await redis.set(key, first, { ex: 60 * 60 * 36 });

        return res.status(200).json({ mode, source: "live+cached", ...first });
    } catch (e) {
        console.error("today-card error:", e);
        return res.status(500).json({ error: String(e) });
    }
}
