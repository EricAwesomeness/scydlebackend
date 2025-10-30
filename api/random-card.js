import { MODE_QUERIES, getMode, scryfallRandomUrl } from "./_lib.js";

export default async function handler(req, res) {
    const mode = getMode(req);
    const q = MODE_QUERIES[mode];

    try {
        const r = await fetch(scryfallRandomUrl(q), {
            headers: { "User-Agent": "Scrydle/1.0 (random-card)" },
        });
        if (!r.ok) return res.status(502).json({ error: `Scryfall ${r.status}` });

        const card = await r.json();                // ← full payload
        return res.status(200).json({ mode, source: "live", ...card });
    } catch (e) {
        return res.status(500).json({ error: String(e) });
    }
}
