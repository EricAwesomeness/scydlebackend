import { Redis } from "@upstash/redis";
import { MODE_QUERIES, scryfallRandomUrl, expandToFirstPrinting } from "./_lib.js";

const redis = new Redis({
    url:
        process.env.scrydle_KV_REST_API_URL ||
        process.env.scrydle_KV_URL ||
        process.env.scrydle_REDIS_URL,
    token:
        process.env.scrydle_KV_REST_API_TOKEN ||
        process.env.scrydle_KV_REST_API_READ_ONLY_TOKEN,
});

export default async function handler(_req, res) {
    const today = new Date().toISOString().slice(0, 10);
    try {
        const results = {};
        for (const mode of Object.keys(MODE_QUERIES)) {
            const q = MODE_QUERIES[mode];

            const r = await fetch(scryfallRandomUrl(q), {
                headers: { "User-Agent": "Scrydle/1.0 (cron)" },
            });
            if (!r.ok) throw new Error(`Scryfall ${r.status} for mode ${mode}`);

            const card = await r.json();

            const first = await expandToFirstPrinting(card);

            const key = `scrydle:card:${today}:${mode}`;
            await redis.set(key, first, { ex: 60 * 60 * 36 });

            results[mode] = { date: today, name: first.name, set: first.set, set_name: first.set_name };
        }

        return res.status(200).json({ ok: true, ...results });
    } catch (err) {
        console.error("cron-pick-card error:", err);
        return res.status(500).json({ ok: false, error: String(err) });
    }
}
