// Signature numérique des documents (ECDSA P-256 + SHA-256, Web Crypto).
//
// ⚠️ DÉMONSTRATION : la clé privée est ici dans le navigateur pour que le prototype fonctionne sans serveur.
// En production, la signature doit être faite UNIQUEMENT côté serveur (idéalement dans un HSM) ;
// le navigateur ne doit connaître que la clé publique, qui sert à la vérification.

const DEMO_PRIVATE_JWK = { kty: "EC", crv: "P-256", x: "W34vTfzqNw-LBirIiAFTF2Zboua2RbBceSQhEf9OC9k", y: "gWkf1obhdSqaSqH8lpKvWOOHp037qQoRFxbHuQfxgPc", d: "8tdd9mBMCdJOiwTjxdgbXF00XtrxdEePNimX9c0LcEQ" };
export const PUBLIC_JWK = { kty: "EC", crv: "P-256", x: "W34vTfzqNw-LBirIiAFTF2Zboua2RbBceSQhEf9OC9k", y: "gWkf1obhdSqaSqH8lpKvWOOHp037qQoRFxbHuQfxgPc" };
const ALG = { name: "ECDSA", namedCurve: "P-256" };
const SIGN = { name: "ECDSA", hash: "SHA-256" };

const enc = new TextEncoder();
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64u = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
const b64uText = (t) => b64u(enc.encode(t));
const unb64uText = (s) => new TextDecoder().decode(unb64u(s));
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

/** JSON canonique (clés triées) : la même donnée produit toujours la même signature. */
export function canonical(obj) {
  return JSON.stringify(Object.keys(obj).sort().reduce((o, k) => ({ ...o, [k]: obj[k] }), {}));
}

let privKey, pubKey;
const getPriv = async () => (privKey ??= await crypto.subtle.importKey("jwk", DEMO_PRIVATE_JWK, ALG, false, ["sign"]));
const getPub = async () => (pubKey ??= await crypto.subtle.importKey("jwk", PUBLIC_JWK, ALG, false, ["verify"]));

/** Code court lisible dérivé de l'empreinte : EN-XXXX-XXXX-XXXX */
const shortCode = (hashHex) => {
  const s = BigInt(`0x${hashHex.slice(0, 15)}`).toString(36).toUpperCase().padStart(12, "0").slice(-12);
  return `EN-${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8, 12)}`;
};

/** Signe les données essentielles du document. Retourne le jeton à mettre dans le QR code. */
export async function signDocument(payload) {
  const data = enc.encode(canonical(payload));
  const [sig, digest] = await Promise.all([
    crypto.subtle.sign(SIGN, await getPriv(), data),
    crypto.subtle.digest("SHA-256", data),
  ]);
  const hashHex = hex(digest);
  const sigB64 = b64u(sig);
  const result = {
    token: `${b64uText(canonical(payload))}.${sigB64}`,
    code: shortCode(hashHex),
    hash: hashHex,
    signature: sigB64,
  };
  rememberIssued(result.code, result.token);
  return result;
}

// Registre des codes émis : permet de vérifier un document à partir de son code court.
// Démonstration : stocké dans le navigateur. En production : registre central côté serveur.
const ISSUED_KEY = "en-issued-codes";
function rememberIssued(code, token) {
  try {
    const map = JSON.parse(localStorage.getItem(ISSUED_KEY) ?? "{}");
    map[code] = token;
    localStorage.setItem(ISSUED_KEY, JSON.stringify(map));
  } catch { /* stockage indisponible */ }
}
export function lookupShortCode(code) {
  try { return JSON.parse(localStorage.getItem(ISSUED_KEY) ?? "{}")[code] ?? null; } catch { return null; }
}

/** Vérifie un jeton (ou une URL contenant ?t=…). */
export async function verifyToken(input) {
  try {
    let token = input.trim();
    const m = token.match(/[?&]t=([^&#\s]+)/);
    if (m) token = decodeURIComponent(m[1]);
    const [p, s] = token.split(".");
    if (!p || !s) return { valid: false, reason: "Format de code invalide." };
    const json = unb64uText(p);
    const payload = JSON.parse(json);
    const data = enc.encode(canonical(payload));
    const ok = await crypto.subtle.verify(SIGN, await getPub(), unb64u(s), data);
    const hashHex = hex(await crypto.subtle.digest("SHA-256", data));
    return ok
      ? { valid: true, payload, code: shortCode(hashHex), hash: hashHex }
      : { valid: false, payload, reason: "La signature ne correspond pas : le document a été modifié ou n'a pas été émis par e-Naissance." };
  } catch {
    return { valid: false, reason: "Code illisible ou corrompu." };
  }
}

export const verifyUrl = (token) => `${window.location.origin}/verifier?t=${encodeURIComponent(token)}`;
