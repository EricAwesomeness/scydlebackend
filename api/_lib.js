// api/_lib.js
export const MODE_QUERIES = {
    classic: null,
    art: null,
    commander: "is:commander",
    mono: "(id=w OR id=u OR id=b OR id=r OR id=g)",
    planeswalker: "type:planeswalker",
    win: null,
};

export function getMode(req) {
    const m = (new URL(req.url, "http://x").searchParams.get("mode") || "classic")
        .toLowerCase();
    return MODE_QUERIES[m] !== undefined ? m : "classic";
}

export function scryfallRandomUrl(q) {
    const base = "https://api.scryfall.com/cards/random";
    return q ? `${base}?q=${encodeURIComponent(q)}` : base;
}

export async function expandToFirstPrinting(card, filters = "") {
    const base = `${card.prints_search_uri}&order=released&dir=asc&unique=prints`;
    const url = filters
        ? `${base}&q=${encodeURIComponent(filters)}`
        : base;

    const r = await fetch(url, {
        headers: { "User-Agent": "Scrydle/1.0 (first-printing)" },
    });
    if (!r.ok) throw new Error(`Scryfall prints ${r.status}`);

    const data = await r.json();
    const list = Array.isArray(data?.data) ? data.data : [];

    // Prefer earliest card where reprint === false; otherwise take the first.
    const first =
        list.find((c) => c.reprint === false) ??
        list[0] ??
        card;

    return first;
}

