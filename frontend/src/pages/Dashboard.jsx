import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  FilePlus2, Inbox, Clock, CheckCircle2, FileOutput, FileWarning, AlertTriangle, ChevronRight,
  Search, Printer, PenTool, Send, FilePlus, Gavel, FileCheck2, Timer, ShieldCheck, ArrowRight, MoreHorizontal,
} from "lucide-react";
import { Panel, StatCard, StatusBadge, CountUp, fadeUp, stagger } from "../components/ui.jsx";
import Hero from "../components/Hero.jsx";
import { AdminDashboard, ConsultDashboard, HospitalDashboard } from "./RoleDashboards.jsx";
import { useAuth } from "../auth.jsx";

import { DashboardSkeleton, TableSkeletonRows } from "../components/Skeleton.jsx";
import { useLoading } from "../hooks/useLoading.js";
import {
  indicateurs, naissancesParMois, repartitionSexe, naissancesParCentre, dossiersRecents, aTraiter,
  activiteRecente, circuitNormal, circuitHorsDelai, FILTRES,
} from "../data/mock.js";

const ICONS = { today: Inbox, pending: Clock, validated: CheckCircle2, delivered: FileOutput, incomplete: FileWarning, late: AlertTriangle };
const ACT_ICONS = { sign: PenTool, send: Send, create: FilePlus, judge: Gavel, deliver: FileCheck2 };

// Contenu propre à l'officier et à l'agent (cahier des charges, section 4)
const ROLE_VIEW = {
  officier: {
    text: <>Vous avez <strong>3 actes à valider et signer</strong> et <strong>1 jugement à transcrire</strong> aujourd'hui.</>,
    kpis: ["today", "pending", "validated", "delivered", "incomplete", "late"],
    todo: aTraiter,
  },
  agent: {
    text: <>Vous avez <strong>2 dossiers incomplets</strong> à compléter et <strong>11 demandes de copie</strong> en attente de préparation.</>,
    kpis: ["today", "incomplete", "pending", "delivered", "late", "validated"],
    todo: [
      { label: "Dossiers incomplets à compléter", value: 2, path: "/naissances", urgent: true },
      { label: "Pièces à numériser", value: 5, path: "/naissances" },
      { label: "Demandes de copie / extrait à préparer", value: 11, path: "/actes" },
      { label: "Jugements reçus à saisir", value: 1, path: "/jugements" },
      { label: "Alertes de doublon à vérifier", value: 2, path: "/naissances", urgent: true },
    ],
  },
};

function RoleHero({ user }) {
  return (
    <Hero
      title={`Bonjour, ${user.identifiant}`}
      text={<>{ROLE_VIEW[user.role].text} Centre de {user.centre}.</>}
      actions={<>
        <Link to="/naissances/nouvelle" className="btn btn--white"><FilePlus2 size={16} /> Nouvelle déclaration</Link>
        <Link to="/actes" className="btn btn--ghost"><Search size={16} /> Rechercher un acte</Link>
      </>}
      kpis={[
        { icon: Timer, value: 1.8, decimals: 1, suffix: " j", label: "Délai moyen de traitement" },
        { icon: ShieldCheck, value: 94, suffix: " %", label: "Déclarations dans le délai légal" },
      ]} />
  );
}

function Pipeline({ steps, alert }) {
  const max = Math.max(...steps.filter((s) => s.statut !== "ACTE_ARCHIVE").map((s) => s.value));
  return (
    <div className={`pipe ${alert ? "pipe--alert" : ""}`}>
      {steps.map((s, i) => {
        const archived = s.statut === "ACTE_ARCHIVE";
        return (
          <motion.div key={s.statut} className={`pipe__step ${archived ? "pipe__step--done" : ""}`}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.07 }}>
            <div className="pipe__value"><CountUp value={s.value} /></div>
            <div className="pipe__label">{s.label}</div>
            <div className="pipe__track">
              <motion.div className="pipe__fill" initial={{ width: 0 }}
                animate={{ width: archived ? "100%" : `${(s.value / max) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.07, ease: "easeOut" }} />
            </div>
            {i < steps.length - 1 && <ArrowRight size={14} className="pipe__arrow" />}
          </motion.div>
        );
      })}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__label">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="chart-tooltip__row">
          <span className={`swatch swatch--${p.dataKey}`} />
          {p.dataKey === "y2026" ? "2026" : "2025"} : <strong>{p.value.toLocaleString("fr-FR")}</strong>
        </div>
      ))}
    </div>
  );
}

function NaissancesChart() {
  const [compare, setCompare] = useState(true);
  return (
    <Panel title="Naissances enregistrées par mois" subtitle="Année 2026, comparée à 2025"
      action={
        <div className="segmented">
          <button className={!compare ? "is-active" : ""} onClick={() => setCompare(false)}>2026</button>
          <button className={compare ? "is-active" : ""} onClick={() => setCompare(true)}>2026 vs 2025</button>
        </div>
      }>
      <motion.div className="chart" initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }} animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }} transition={{ duration: 1.1, delay: 0.3, ease: "easeOut" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={naissancesParMois} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--grid)" />
            <XAxis dataKey="mois" tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border-strong)", strokeDasharray: "4 4" }} />
            {compare && (
              <Area type="monotone" dataKey="y2025" stroke="var(--series-2)" strokeWidth={2} strokeDasharray="5 4"
                fill="none" dot={false} isAnimationActive={false} />
            )}
            <Area type="monotone" dataKey="y2026" stroke="var(--series-1)" strokeWidth={2.5}
              fill="var(--series-1)" fillOpacity={0.1} dot={{ r: 3, fill: "var(--series-1)", strokeWidth: 0 }}
              activeDot={{ r: 5 }} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </Panel>
  );
}

function Repartition() {
  const { garcons, filles } = repartitionSexe;
  const total = garcons + filles;
  const data = [{ name: "Garçons", value: garcons, key: "m" }, { name: "Filles", value: filles, key: "f" }];
  return (
    <Panel title="Répartition garçons / filles" subtitle="Naissances enregistrées en 2026">
      <div className="donut">
        <div className="donut__chart">
          <motion.div className="donut__ring" initial={{ opacity: 0, rotate: -90, scale: 0.85 }} animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius="70%" outerRadius="100%" paddingAngle={3}
                startAngle={90} endAngle={-270} stroke="none" isAnimationActive={false}>
                {data.map((d) => <Cell key={d.key} fill={d.key === "m" ? "var(--series-1)" : "var(--series-2)"} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          </motion.div>
          <div className="donut__center">
            <div className="donut__value"><CountUp value={total} /></div>
            <div className="donut__label">naissances</div>
          </div>
        </div>
        <div className="donut__legend">
          {data.map((d) => (
            <div key={d.key} className="donut__item">
              <span className={`swatch swatch--${d.key}`} />
              <span>{d.name}</span>
              <strong><CountUp value={d.value} /></strong>
              <span className="muted">{((d.value / total) * 100).toFixed(1).replace(".", ",")} %</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function DossiersRecents() {
  const [filtre, setFiltre] = useState("tous");
  const [tableLoading, setTableLoading] = useState(false);
  const changeFiltre = (key) => {
    if (key === filtre) return;
    setFiltre(key);
    setTableLoading(true);
    setTimeout(() => setTableLoading(false), 550);
  };
  const f = FILTRES.find((x) => x.key === filtre);
  const rows = f.statuts ? dossiersRecents.filter((d) => f.statuts.includes(d.statut)) : dossiersRecents;
  const initials = (n) => n.split(" ").slice(0, 2).map((p) => p[0]).join("");

  return (
    <Panel title="Dossiers récents" subtitle="Dernières déclarations reçues dans le centre"
      action={<Link to="/naissances" className="link">Voir tout <ChevronRight size={14} /></Link>}>
      <div className="chips">
        {FILTRES.map((x) => (
          <button key={x.key} className={`chip ${filtre === x.key ? "is-active" : ""}`} onClick={() => changeFiltre(x.key)}>
            {filtre === x.key && <motion.span layoutId="chip-bg" className="chip__bg" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            <span className="chip__text">{x.label}</span>
          </button>
        ))}
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Enfant</th><th>N° dossier</th><th>Né(e) le</th><th>Déclaré le</th><th>Statut</th><th>Agent</th><th />
            </tr>
          </thead>
          <tbody>
            {tableLoading ? <TableSkeletonRows rows={Math.max(rows.length, 3)} /> : (
            <AnimatePresence initial={false} mode="popLayout">
              {rows.map((d) => (
                <motion.tr key={d.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}>
                  <td>
                    <div className="person">
                      <span className={`person__avatar person__avatar--${d.sexe}`}>{initials(d.enfant)}</span>
                      <div>
                        <div className="strong">{d.enfant}</div>
                        <div className="muted small">{d.sexe === "F" ? "Fille" : "Garçon"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="mono">{d.id}</td>
                  <td>{d.naissance}</td>
                  <td>{d.declaration}</td>
                  <td><StatusBadge statut={d.statut} /></td>
                  <td className="muted">{d.agent}</td>
                  <td><button className="icon-btn row-action" aria-label="Actions"><MoreHorizontal size={18} /></button></td>
                </motion.tr>
              ))}
            </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export default function Dashboard() {
  const loading = useLoading(1300);
  return (
    <AnimatePresence mode="wait">
      {loading ? <DashboardSkeleton key="skeleton" /> : <RoleDashboard key="content" />}
    </AnimatePresence>
  );
}

function DashboardContent({ user }) {
  const view = ROLE_VIEW[user.role];
  const maxCentre = Math.max(...naissancesParCentre.map((c) => c.total));

  return (
    <motion.div className="page" variants={stagger} initial="hidden" animate="show">
      <RoleHero user={user} />

      <div className="page__head">
        <div>
          <h2 className="section-title">Vue d'ensemble</h2>
          <p className="page__subtitle">Indicateurs du centre, octobre 2026</p>
        </div>
        <button className="btn btn--outline"><Printer size={16} /> Imprimer le rapport</button>
      </div>

      <motion.div className="stats" variants={stagger}>
        {view.kpis.map((k) => indicateurs.find((i) => i.key === k)).map(({ key, ...i }) => <StatCard key={key} {...i} icon={ICONS[key]} />)}
      </motion.div>

      <Panel title="Circuit des dossiers" subtitle="Nombre de dossiers à chaque étape du traitement">
        <div className="pipe-group">
          <div className="pipe-group__label">Déclaration dans le délai</div>
          <Pipeline steps={circuitNormal} />
        </div>
        <div className="pipe-group">
          <div className="pipe-group__label pipe-group__label--alert">Déclaration hors délai : procédure judiciaire</div>
          <Pipeline steps={circuitHorsDelai} alert />
        </div>
      </Panel>

      <div className="grid grid--2-1">
        <NaissancesChart />
        <Repartition />
      </div>

      <DossiersRecents />

      <div className="grid grid--3">
        <Panel title="À traiter" subtitle="Actions qui vous attendent">
          <ul className="todo">
            {view.todo.map((t, i) => (
              <motion.li key={t.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.06 }}>
                <Link to={t.path} className="todo__row">
                  <span className={`todo__bullet ${t.urgent ? "is-urgent" : `is-${["green", "yellow", "blue"][i % 3]}`}`} />
                  <span className="todo__label">{t.label}</span>
                  <span className="todo__value">{t.value}</span>
                  <ChevronRight size={16} className="todo__chev" />
                </Link>
              </motion.li>
            ))}
          </ul>
        </Panel>

        <Panel title="Naissances par centre" subtitle="Province de l'Estuaire, 2026">
          <ul className="hbars">
            {naissancesParCentre.map((c, i) => (
              <li key={c.centre} className="hbars__row">
                <div className="hbars__top">
                  <span className="hbars__label">{c.centre}</span>
                  <span className="hbars__value"><CountUp value={c.total} /></span>
                </div>
                <span className="hbars__track">
                  <motion.span className="hbars__fill" initial={{ width: 0 }} animate={{ width: `${(c.total / maxCentre) * 100}%` }}
                    transition={{ duration: 0.9, delay: 0.3 + i * 0.08, ease: "easeOut" }} />
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Activité récente" action={<Link to="/journal" className="link">Journal <ChevronRight size={14} /></Link>}>
          <ul className="timeline">
            {activiteRecente.map((a, i) => {
              const Icon = ACT_ICONS[a.type];
              return (
                <motion.li key={i} className="timeline__row" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.07 }}>
                  <span className="timeline__icon"><Icon size={14} /></span>
                  <div className="timeline__body">
                    <div><strong>{a.user}</strong> {a.action}</div>
                    <div className="timeline__meta"><span className="mono">{a.ref}</span> · {a.heure}</div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <p className="disclaimer">Données fictives de démonstration.</p>
    </motion.div>
  );
}

function RoleDashboard() {
  const { user } = useAuth();
  if (user.role === "admin") return <AdminDashboard user={user} />;
  if (user.role === "consultation") return <ConsultDashboard user={user} />;
  if (user.role === "hopital") return <HospitalDashboard user={user} />;
  return <DashboardContent user={user} />;
}