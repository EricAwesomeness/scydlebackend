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

export function trimCard(card) {
    return {
        id: card.id,
        name: card.name,
        set: card.set,
        set_name: card.set_name,
        mana_cost: card.mana_cost ?? null,
        type_line: card.type_line ?? null,
        oracle_text: card.oracle_text ?? null,
        image: card.image_uris?.normal ?? card.image_uris?.png ?? null,
        scryfall_uri: card.scryfall_uri,
    };
}
