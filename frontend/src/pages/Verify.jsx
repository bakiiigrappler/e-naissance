import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, ShieldX, Search, ArrowLeft, QrCode, FileText, Fingerprint } from "lucide-react";
import Logo from "../components/Logo.jsx";
import { FlagStripe, LogoLoader } from "../components/Brand.jsx";
import { verifyToken, lookupShortCode } from "../documents/signature.js";
import { DOC_TYPES } from "../documents/registry.jsx";
import { fmt } from "../documents/format.js";

/** Page publique : vérifie la signature numérique d'un document e-Naissance. */
export default function Verify() {
  const [params] = useSearchParams();
  const [input, setInput] = useState(params.get("t") ?? "");
  const [state, setState] = useState("idle"); // idle | loading | done
  const [result, setResult] = useState(null);

  const run = async (value = input) => {
    const v = value.trim();
    if (!v) return;
    setState("loading");
    await new Promise((r) => setTimeout(r, 700));
    // Code court (EN-XXXX-XXXX-XXXX) : recherche du jeton émis (en production : registre central côté serveur)
    const token = /^EN-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/i.test(v) ? lookupShortCode(v.toUpperCase()) : v;
    setResult(token ? await verifyToken(token) : { valid: false, reason: "Code inconnu : aucun document émis ne correspond à ce code signé." });
    setState("done");
  };

  useEffect(() => { if (params.get("t")) run(params.get("t")); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const p = result?.payload;
  return (
    <div className="verify">
      <FlagStripe className="verify__stripe" />
      <header className="verify__top">
        <Logo light={false} />
        <Link to="/connexion" className="link"><ArrowLeft size={14} /> Espace agents</Link>
      </header>

      <main className="verify__main">
        <motion.div className="verify__card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <span className="verify__badge"><ShieldCheck size={14} /> Service public de vérification</span>
          <h1>Vérifier un document d'état civil</h1>
          <p className="verify__intro">Scannez le QR code du document, ou saisissez le <b>code signé</b> imprimé sous le QR code (ex. : EN-1A2B-3C4D-5E6F).</p>

          <form className="verify__form" onSubmit={(e) => { e.preventDefault(); run(); }}>
            <div className="verify__input">
              <QrCode size={18} />
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Code signé ou lien du QR code" />
            </div>
            <button className="btn btn--primary" disabled={state === "loading"}><Search size={16} /> Vérifier</button>
          </form>

          <AnimatePresence mode="wait">
            {state === "loading" && (
              <motion.div key="l" className="verify__loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LogoLoader size={64} label="Vérification de la signature numérique…" />
              </motion.div>
            )}
            {state === "done" && result && (
              <motion.div key={`r-${result.valid}`} className={`verify__result ${result.valid ? "is-ok" : "is-ko"}`}
                initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}>
                <div className="verify__result-head">
                  <motion.span className="verify__result-icon" initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 380, damping: 14 }}>
                    {result.valid ? <ShieldCheck size={26} /> : <ShieldX size={26} />}
                  </motion.span>
                  <div>
                    <strong>{result.valid ? "Document authentique" : "Document non vérifié"}</strong>
                    <span>{result.valid ? "La signature numérique est valide : le document n'a pas été modifié depuis son émission." : result.reason}</span>
                  </div>
                </div>
                {result.valid && p && (
                  <dl className="verify__dl">
                    <div><dt><FileText size={14} /> Type</dt><dd>{DOC_TYPES[p.t] ?? p.t}</dd></div>
                    <div><dt>Numéro</dt><dd>{p.n}{p.a ? ` (année ${p.a})` : ""}</dd></div>
                    <div><dt>Titulaire</dt><dd>{p.nom}</dd></div>
                    <div><dt>Date de naissance</dt><dd>{fmt(p.dn)}</dd></div>
                    <div><dt>Émis le</dt><dd>{fmt(p.e)}</dd></div>
                    <div><dt>Centre</dt><dd>{p.c}</dd></div>
                    <div><dt><Fingerprint size={14} /> Code signé</dt><dd className="mono">{result.code}</dd></div>
                  </dl>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <p className="verify__note">Signature ECDSA P-256 et empreinte SHA-256. Démonstration : en production, la vérification interroge le registre central de l'état civil.</p>
      </main>
    </div>
  );
}
