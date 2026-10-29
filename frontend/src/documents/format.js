// Mise en forme des documents d'état civil : dates et heures en toutes lettres (style des registres).

const UNITS = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix",
  "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
const TENS = { 2: "vingt", 3: "trente", 4: "quarante", 5: "cinquante", 6: "soixante" };
const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

export function nombreEnLettres(n) {
  if (n < 20) return UNITS[n];
  if (n < 70) {
    const t = Math.floor(n / 10), u = n % 10;
    if (u === 0) return TENS[t];
    return u === 1 ? `${TENS[t]} et un` : `${TENS[t]}-${UNITS[u]}`;
  }
  if (n < 80) return n === 71 ? "soixante et onze" : `soixante-${UNITS[n - 60]}`;
  if (n === 80) return "quatre-vingts";
  if (n < 100) return `quatre-vingt-${UNITS[n - 80]}`;
  if (n < 1000) {
    const c = Math.floor(n / 100), r = n % 100;
    const head = c === 1 ? "cent" : `${UNITS[c]} cent${r === 0 ? "s" : ""}`;
    return r === 0 ? head : `${head} ${nombreEnLettres(r)}`;
  }
  const m = Math.floor(n / 1000), r = n % 1000;
  const head = m === 1 ? "mil" : `${nombreEnLettres(m)} mil`;
  return r === 0 ? head : `${head} ${nombreEnLettres(r)}`;
}

const parse = (iso) => { const [y, m, d] = iso.split("-").map(Number); return { y, m, d }; };

/** 2026-10-19 → « dix-neuf octobre deux mil vingt-six » */
export function dateEnLettres(iso) {
  if (!iso) return "—";
  const { y, m, d } = parse(iso);
  return `${d === 1 ? "premier" : nombreEnLettres(d)} ${MONTHS[m - 1]} ${nombreEnLettres(y)}`;
}

/** 2026-10-19 → « 19 octobre 2026 » */
export function dateLongue(iso) {
  if (!iso) return "—";
  const { y, m, d } = parse(iso);
  return `${d === 1 ? "1er" : d} ${MONTHS[m - 1]} ${y}`;
}

/** 03:20 → « trois heures vingt minutes » */
export function heureEnLettres(hhmm) {
  if (!hhmm) return "";
  const [h, mi] = hhmm.split(":").map(Number);
  const hs = h === 0 ? "zéro heure" : h === 1 ? "une heure" : `${nombreEnLettres(h)} heures`;
  if (!mi) return hs;
  return `${hs} ${mi === 1 ? "une minute" : `${nombreEnLettres(mi)} minutes`}`;
}

export const fmt = (iso) => (iso ? iso.split("-").reverse().join("/") : "—");
export const today = () => new Date().toISOString().slice(0, 10);

/** Code de vérification déterministe, ex. EN-7K2P-9QX4 */
export function verifCode(seed) {
  const hash = (salt) => {
    let h = 2166136261 ^ salt;
    for (const ch of seed) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36).padStart(7, "0");
  };
  const s = (hash(1) + hash(7)).toUpperCase().slice(0, 8);
  return `EN-${s.slice(0, 4)}-${s.slice(4)}`;
}

export const ne = (sexe) => (sexe === "F" ? "née" : "né");

/** « Maternité de Libreville » → « à la Maternité de Libreville » ; « Domicile » → « au domicile familial » */
export function aLieu(lieu = "") {
  if (/^domicile/i.test(lieu)) return "au domicile familial";
  if (/^(maternité|clinique|polyclinique)/i.test(lieu)) return `à la ${lieu}`;
  if (/^(hôpital|h\u00f4pital)/i.test(lieu)) return `à l'${lieu}`;
  if (/^(centre|chu)/i.test(lieu)) return `au ${lieu}`;
  return `à ${lieu}`;
}

/** « Quartier Louis, Libreville » → « au quartier Louis, Libreville » */
export function aDomicile(dom = "") {
  if (/^quartier /i.test(dom)) return `au quartier ${dom.slice(9)}`;
  return `à ${dom}`;
}
