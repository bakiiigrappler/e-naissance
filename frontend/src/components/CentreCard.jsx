import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Landmark, Stethoscope, Globe2, ChevronDown, Check, MapPin, Hash, BookOpen, UserRound, FileText, Users } from "lucide-react";
import { CENTRES_INFO } from "../data/mock.js";

const SWITCHABLE = ["Tous les centres", "Libreville — 1er arrondissement", "Libreville — 3e arrondissement", "Owendo", "Akanda", "Ntoum"];

/** Carte « centre en cours » de la barre latérale, avec fiche détaillée et changement de centre (admin). */
export default function CentreCard({ user, collapsed, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const info = CENTRES_INFO[user.centre] ?? { type: "Centre d'état civil", nom: user.centre, sous: "", code: "—", registre: "—" };
  const Icon = info.hopital ? Stethoscope : info.code === "ALL" ? Globe2 : Landmark;
  const canSwitch = user.role === "admin";

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  if (collapsed) {
    return (
      <div className="centre centre--mini" title={`${info.type} : ${info.nom} ${info.sous}`}>
        <span className="centre__icon"><Icon size={18} /></span>
      </div>
    );
  }

  const rows = [
    { icon: MapPin, label: "Province", value: info.province },
    { icon: MapPin, label: "Commune", value: info.commune },
    { icon: Hash, label: "Code", value: info.code },
    { icon: BookOpen, label: info.hopital ? "Rattachement" : "Registre ouvert", value: info.registre },
    { icon: UserRound, label: info.hopital ? "Chef de service" : "Officier responsable", value: info.responsable },
    { icon: FileText, label: info.hopital ? "Certificats ce mois" : "Actes en 2026", value: info.actes?.toLocaleString("fr-FR") },
    { icon: Users, label: "Agents habilités", value: info.agents },
  ];

  return (
    <div className="centre" ref={ref}>
      {/* Présentation simple, séparée par des tirets (sans cadre) */}
      <button className={`centre-simple ${open ? "is-open" : ""}`} onClick={() => setOpen((v) => !v)} aria-expanded={open} title="Voir la fiche du centre">
        <span className="centre-simple__type">{info.type}</span>
        <span className="centre-simple__sep" aria-hidden="true" />
        <span className="centre-simple__name">{info.nom}</span>
        {info.sous && <span className="centre-simple__sous">{info.sous}</span>}
        <span className="centre-simple__sep" aria-hidden="true" />
        <span className="centre-simple__meta">
          <span className="centre__dot" /> En service <span className="centre-simple__dash">—</span> {info.code}
          <ChevronDown size={14} className="centre-simple__chev" />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div className="centre__pop" initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.16 }}>
            <div className="centre__pop-title">Fiche du centre</div>
            <dl className="centre__rows">
              {rows.filter((r) => r.value !== undefined && r.value !== "").map(({ icon: I, label, value }) => (
                <div key={label}><dt><I size={13} /> {label}</dt><dd>{value}</dd></div>
              ))}
            </dl>
            {canSwitch && (
              <>
                <div className="centre__pop-title">Changer de centre</div>
                <ul className="centre__list">
                  {SWITCHABLE.map((c) => {
                    const ci = CENTRES_INFO[c];
                    const active = c === user.centre;
                    return (
                      <li key={c}>
                        <button className={active ? "is-active" : ""} onClick={() => { onChange(c); setOpen(false); }}>
                          <span>{ci.nom}<small>{ci.sous}</small></span>
                          {active ? <Check size={15} /> : <span className="centre__list-code">{ci.code}</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
