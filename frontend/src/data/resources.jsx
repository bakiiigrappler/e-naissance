// Configurations des pages listes. Données FICTIVES de démonstration.
import {
  FileText, Gavel, PenLine, BookMarked, Library, Users, History, Inbox, FolderOpen, ScrollText, Stethoscope,
} from "lucide-react";
import { Badge, Person, fmtDate } from "../components/ResourcePage.jsx";
import { StatusBadge } from "../components/ui.jsx";

const TODAY = "2026-10-29";
const COMMUNES = ["Libreville", "Owendo", "Akanda", "Ntoum"];
const PROVINCES = ["Estuaire", "Haut-Ogooué", "Moyen-Ogooué", "Ngounié", "Nyanga", "Ogooué-Ivindo", "Ogooué-Lolo", "Ogooué-Maritime", "Woleu-Ntem"];
const NATIONALITES = ["Gabonaise", "Camerounaise", "Congolaise", "Équato-guinéenne", "Autre"];
const days = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
// Délai légal (loi n°004/2021) : 2 semaines en commune
const delaiOf = (naissance, declaration) => (days(naissance, declaration) <= 14 ? "dans" : "hors");

const DelaiBadge = ({ r }) => (r.delai === "dans" ? <Badge tone="green">Dans le délai</Badge> : <Badge tone="alert">Hors délai</Badge>);

/* =====================================================================
   DÉCLARATIONS DE NAISSANCE
   ===================================================================== */
const histo = (r) => {
  const steps = [
    ["Déclaration enregistrée", r.agent, r.declaration],
    ["Pièces contrôlées", r.agent, r.declaration],
  ];
  if (["EN_ATTENTE_VALIDATION", "VALIDE", "ACTE_ETABLI", "ACTE_SIGNE"].includes(r.statut)) steps.push(["Transmis pour validation", r.agent, r.declaration]);
  if (["VALIDE", "ACTE_ETABLI", "ACTE_SIGNE"].includes(r.statut)) steps.push(["Dossier validé", "Officier01", r.declaration]);
  if (["ACTE_ETABLI", "ACTE_SIGNE"].includes(r.statut)) steps.push(["Acte établi", "Officier01", r.declaration]);
  if (r.statut === "ACTE_SIGNE") steps.push(["Acte signé et numéroté", "Officier01", r.declaration]);
  if (r.statut === "HORS_DELAI") steps.push(["Dossier classé hors délai", "Système", r.declaration]);
  if (r.statut === "PROCEDURE_JUDICIAIRE") steps.push(["Orienté vers le tribunal", "Officier01", r.declaration]);
  return steps.reverse().map(([action, user, date]) => ({ action, user, date: fmtDate(date) }));
};

const PIECES = [
  { name: "Certificat de naissance.pdf", meta: "Établissement de santé · 412 Ko" },
  { name: "CNI de la mère.pdf", meta: "Pièce d'identité · 236 Ko" },
  { name: "CNI du déclarant.pdf", meta: "Pièce d'identité · 198 Ko" },
];

const D = (id, nom, prenoms, sexe, dateNaissance, declaration, lieu, commune, mereNom, mereProfession, pereNom, pereProfession, declarantNom, declarantQualite, statut, agent, nbPieces = 3) => ({
  id, nom, prenoms, sexe, dateNaissance, heure: "08:40", lieu, commune, province: "Estuaire", nationalite: "Gabonaise",
  mereNom, mereDateNaissance: "1994-03-12", mereProfession, mereDomicile: `Quartier Louis, ${commune}`, mereNationalite: "Gabonaise", mereCni: "GA-1840-2231",
  pereNom, pereProfession, pereNationalite: pereNom ? "Gabonaise" : "", pereCni: pereNom ? "GA-1022-7764" : "",
  declarantNom, declarantQualite, declarantPiece: "CNI GA-3310-0921", declaration, statut, agent,
  delai: delaiOf(dateNaissance, declaration), pieces: PIECES.slice(0, nbPieces), mentions: [],
});

const declarationsRows = [
  D("DN-2026-04821", "NDONG", "Élise Marie", "F", "2026-10-26", "2026-10-29", "Maternité de Libreville", "Libreville", "NDONG Clarisse", "Enseignante", "NDONG Arnaud", "Comptable", "NDONG Arnaud", "Père", "EN_VERIFICATION", "Agent01"),
  D("DN-2026-04820", "MBA", "Kevin Olivier", "M", "2026-10-24", "2026-10-29", "Centre de santé d'Owendo", "Owendo", "MBA Sylvie", "Commerçante", "MBA Jean-Paul", "Chauffeur", "MBA Jean-Paul", "Père", "EN_ATTENTE_VALIDATION", "Agent03"),
  D("DN-2026-04819", "OBIANG", "Sarah", "F", "2026-10-21", "2026-10-28", "Maternité de Libreville", "Libreville", "OBIANG Nadia", "Infirmière", "", "", "OBIANG Nadia", "Mère", "VALIDE", "Agent01"),
  D("DN-2026-04818", "MOUSSAVOU", "Grâce", "F", "2026-09-02", "2026-10-28", "Domicile", "Akanda", "MOUSSAVOU Irène", "Ménagère", "MOUSSAVOU Paul", "Pêcheur", "MOUSSAVOU Paul", "Père", "HORS_DELAI", "Agent02", 1),
  D("DN-2026-04817", "NZÉ", "Junior Patrick", "M", "2026-10-19", "2026-10-28", "Maternité de Libreville", "Libreville", "NZÉ Pauline", "Juriste", "NZÉ Patrick", "Ingénieur", "NZÉ Patrick", "Père", "ACTE_SIGNE", "Agent03"),
  D("DN-2026-04816", "BOUSSOUGOU", "Ethan", "M", "2026-10-18", "2026-10-27", "Centre de santé d'Akanda", "Akanda", "BOUSSOUGOU Laure", "Étudiante", "", "", "BOUSSOUGOU Marthe", "Grand-mère", "DOSSIER_DEPOSE", "Agent02", 0),
  D("DN-2026-04815", "MINTSA", "Laure", "F", "2026-10-15", "2026-10-27", "Maternité de Libreville", "Libreville", "MINTSA Rose", "Secrétaire", "MINTSA Hervé", "Policier", "MINTSA Hervé", "Père", "ACTE_ETABLI", "Agent01"),
  D("DN-2026-04814", "ELLA", "Prince", "M", "2026-08-11", "2026-10-27", "Domicile", "Ntoum", "ELLA Joséphine", "Agricultrice", "", "", "ELLA Joséphine", "Mère", "PROCEDURE_JUDICIAIRE", "Agent02", 1),
  D("DN-2026-04813", "KOUMBA", "Divine", "F", "2026-10-20", "2026-10-26", "Centre de santé de Ntoum", "Ntoum", "KOUMBA Aline", "Coiffeuse", "KOUMBA Serge", "Mécanicien", "KOUMBA Serge", "Père", "EN_ATTENTE_VALIDATION", "Agent03"),
  D("DN-2026-04812", "NGUEMA", "Yann", "M", "2026-10-17", "2026-10-26", "Maternité de Libreville", "Libreville", "NGUEMA Estelle", "Banquière", "NGUEMA Luc", "Architecte", "NGUEMA Luc", "Père", "ACTE_SIGNE", "Agent01"),
  D("DN-2026-04811", "IBINGA", "Chloé", "F", "2026-10-16", "2026-10-25", "Centre de santé d'Owendo", "Owendo", "IBINGA Marie", "Vendeuse", "IBINGA Rodrigue", "Électricien", "IBINGA Rodrigue", "Père", "EN_ATTENTE_VALIDATION", "Agent02"),
  D("DN-2026-04810", "ONDO", "Samuel", "M", "2026-10-12", "2026-10-24", "Maternité de Libreville", "Libreville", "ONDO Carine", "Médecin", "ONDO Fabrice", "Professeur", "ONDO Fabrice", "Père", "ACTE_SIGNE", "Agent03"),
];
declarationsRows[4].mentions = [];

export const declarations = {
  title: "Déclarations de naissance",
  subtitle: "Toutes les déclarations reçues par le centre, de la saisie à la signature de l'acte",
  entity: "Déclaration", icon: FileText,
  createLabel: "Nouvelle déclaration",
  searchKeys: ["id", "nom", "prenoms", "mereNom", "pereNom", "commune"],
  searchPlaceholder: "Rechercher par n° de dossier, nom, parent, commune…",
  rows: declarationsRows,
  kpis: (rows) => [
    { label: "Déclarations", value: rows.length },
    { label: "À valider", value: rows.filter((r) => r.statut === "EN_ATTENTE_VALIDATION").length, tone: "yellow" },
    { label: "Actes signés", value: rows.filter((r) => r.statut === "ACTE_SIGNE").length, tone: "green" },
    { label: "Hors délai", value: rows.filter((r) => r.delai === "hors").length, tone: "alert" },
  ],
  filters: [
    { key: "tous", label: "Toutes" },
    { key: "cours", label: "En cours", test: (r) => ["DOSSIER_DEPOSE", "EN_VERIFICATION", "DOSSIER_COMPLET"].includes(r.statut) },
    { key: "attente", label: "À valider", test: (r) => r.statut === "EN_ATTENTE_VALIDATION" },
    { key: "etablis", label: "Établis / signés", test: (r) => ["VALIDE", "ACTE_ETABLI", "ACTE_SIGNE"].includes(r.statut) },
    { key: "horsdelai", label: "Hors délai", test: (r) => r.delai === "hors" },
  ],
  columns: [
    { key: "enfant", label: "Enfant", render: (r) => <Person name={`${r.nom} ${r.prenoms}`} sub={r.sexe === "F" ? "Fille" : "Garçon"} tone={r.sexe} /> },
    { key: "id", label: "N° dossier", className: "mono" },
    { key: "dateNaissance", label: "Né(e) le", render: (r) => fmtDate(r.dateNaissance) },
    { key: "commune", label: "Commune" },
    { key: "declaration", label: "Déclaré le", render: (r) => fmtDate(r.declaration) },
    { key: "delai", label: "Délai légal", render: (r) => <DelaiBadge r={r} /> },
    { key: "statut", label: "Statut", render: (r) => <StatusBadge statut={r.statut} /> },
    { key: "agent", label: "Agent", className: "muted" },
  ],
  canEdit: (r) => !["ACTE_SIGNE", "ACTE_ARCHIVE"].includes(r.statut),
  form: {
    defaults: { nationalite: "Gabonaise", mereNationalite: "Gabonaise", province: "Estuaire", commune: "Libreville", declaration: TODAY },
    sections: [
      { title: "Enfant", fields: [
        { name: "nom", label: "Nom", required: true, placeholder: "Ex. : NDONG" },
        { name: "prenoms", label: "Prénom(s)", required: true },
        { name: "sexe", label: "Sexe", type: "select", required: true, options: [{ value: "M", label: "Masculin" }, { value: "F", label: "Féminin" }] },
        { name: "nationalite", label: "Nationalité", type: "select", options: NATIONALITES },
        { name: "dateNaissance", label: "Date de naissance", type: "date", required: true },
        { name: "heure", label: "Heure de naissance", type: "time" },
        { name: "lieu", label: "Lieu de naissance", required: true, placeholder: "Établissement de santé ou domicile", full: true },
        { name: "commune", label: "Commune", type: "select", required: true, options: COMMUNES },
        { name: "province", label: "Province", type: "select", options: PROVINCES },
      ] },
      { title: "Mère", fields: [
        { name: "mereNom", label: "Nom et prénom(s)", required: true, full: true },
        { name: "mereDateNaissance", label: "Date de naissance", type: "date" },
        { name: "mereNationalite", label: "Nationalité", type: "select", options: NATIONALITES },
        { name: "mereProfession", label: "Profession" },
        { name: "mereCni", label: "N° pièce d'identité" },
        { name: "mereDomicile", label: "Domicile", full: true },
      ] },
      { title: "Père", note: "Facultatif si le père n'a pas reconnu l'enfant.", fields: [
        { name: "pereNom", label: "Nom et prénom(s)", full: true },
        { name: "pereProfession", label: "Profession" },
        { name: "pereNationalite", label: "Nationalité", type: "select", options: NATIONALITES },
        { name: "pereCni", label: "N° pièce d'identité" },
      ] },
      { title: "Déclarant", fields: [
        { name: "declarantNom", label: "Nom et prénom(s)", required: true, full: true },
        { name: "declarantQualite", label: "Qualité", type: "select", required: true, options: ["Père", "Mère", "Grand-parent", "Médecin / sage-femme", "Autre"] },
        { name: "declarantPiece", label: "Pièce d'identité" },
        { name: "declaration", label: "Date de déclaration", type: "date", required: true, hint: "Le délai légal est contrôlé automatiquement." },
      ] },
    ],
  },
  newRow: (v, rows) => {
    const n = Math.max(...rows.map((r) => +r.id.split("-")[2] || 0), 4821) + 1;
    return { ...v, id: `DN-2026-0${n}`, statut: "DOSSIER_DEPOSE", agent: "Officier01", delai: delaiOf(v.dateNaissance, v.declaration), pieces: [], mentions: [] };
  },
  detail: (r) => ({
    title: `${r.nom} ${r.prenoms}`, tone: r.sexe,
    subtitle: `${r.sexe === "F" ? "Fille" : "Garçon"} née le ${fmtDate(r.dateNaissance)} · ${r.commune}`,
    facts: [["N° dossier", r.id], ["Déclaré le", fmtDate(r.declaration)], ["Délai légal", r.delai === "dans" ? "Respecté" : "Dépassé"]],
    badge: <StatusBadge statut={r.statut} />,
    tabs: [
      { key: "infos", label: "Informations", sections: [
        { title: "Enfant", items: [["Nom", r.nom], ["Prénom(s)", r.prenoms], ["Sexe", r.sexe === "F" ? "Féminin" : "Masculin"], ["Nationalité", r.nationalite], ["Date de naissance", fmtDate(r.dateNaissance)], ["Heure", r.heure], ["Lieu", r.lieu], ["Commune / province", `${r.commune} · ${r.province}`]] },
        { title: "Mère", items: [["Nom et prénom(s)", r.mereNom], ["Date de naissance", fmtDate(r.mereDateNaissance)], ["Profession", r.mereProfession], ["Nationalité", r.mereNationalite], ["Pièce d'identité", r.mereCni], ["Domicile", r.mereDomicile]] },
        { title: "Père", items: [["Nom et prénom(s)", r.pereNom], ["Profession", r.pereProfession], ["Nationalité", r.pereNationalite], ["Pièce d'identité", r.pereCni]] },
        { title: "Déclarant", items: [["Nom et prénom(s)", r.declarantNom], ["Qualité", r.declarantQualite], ["Pièce", r.declarantPiece], ["Date de déclaration", fmtDate(r.declaration)], ["Délai légal", r.delai === "dans" ? `Respecté (${days(r.dateNaissance, r.declaration)} jours)` : `Dépassé (${days(r.dateNaissance, r.declaration)} jours)`], ["Agent", r.agent]] },
      ] },
      { key: "pieces", label: "Pièces", sections: [
        { title: "Pièces justificatives", type: "files", items: r.pieces ?? [], empty: { icon: FolderOpen, title: "Aucune pièce justificative", text: "Le certificat de naissance et la pièce d'identité du déclarant doivent être numérisés." } },
      ] },
      { key: "histo", label: "Historique", sections: [
        { title: "Suivi du dossier", type: "timeline", items: r.historique ?? histo(r), empty: { icon: History, title: "Aucun historique" } },
      ] },
      { key: "mentions", label: "Mentions", sections: [
        { title: "Mentions marginales", type: "timeline", items: r.mentions ?? [], empty: { icon: BookMarked, title: "Aucune mention marginale", text: "Les reconnaissances, rectifications ou décisions apparaîtront ici." } },
      ] },
    ],
  }),
};

/* =====================================================================
   ACTES DE NAISSANCE (consultation : un acte signé ne se modifie pas)
   ===================================================================== */
const A = (n, enfant, sexe, dateNaissance, dateEtablissement, statut, copies, mentions = [], delivrances = []) => ({
  id: `N°2026-${n}`, enfant, sexe, dateNaissance, dateEtablissement, registre: "REG-LBV1-N-2026", officier: "Officier01", statut, copies, mentions, delivrances,
});
export const actes = {
  title: "Actes de naissance",
  subtitle: "Actes établis et signés : consultation, impression et délivrance",
  entity: "Acte", icon: ScrollText, canCreate: false,
  searchKeys: ["id", "enfant", "registre"],
  searchPlaceholder: "Rechercher par n° d'acte, nom, registre…",
  rows: [
    A("1254", "NZÉ Junior Patrick", "M", "2026-10-19", "2026-10-29", "ACTE_SIGNE", 1, [], [{ action: "Extrait délivré", user: "Agent02", date: "29/10/2026" }]),
    A("1253", "NGUEMA Yann", "M", "2026-10-17", "2026-10-28", "ACTE_SIGNE", 2, [], [{ action: "Copie intégrale délivrée", user: "Agent01", date: "28/10/2026" }, { action: "Extrait délivré", user: "Agent01", date: "28/10/2026" }]),
    A("1252", "ONDO Samuel", "M", "2026-10-12", "2026-10-27", "ACTE_SIGNE", 0),
    A("1251", "ESSONE Mireille", "F", "2026-10-09", "2026-10-21", "ACTE_ARCHIVE", 3, [{ action: "Reconnaissance d'enfant par le père", user: "Officier01", date: "25/10/2026" }], [{ action: "Extrait délivré", user: "Agent03", date: "26/10/2026" }]),
    A("1250", "MOUELE Ruben", "M", "2026-10-05", "2026-10-15", "ACTE_ARCHIVE", 1),
    A("1249", "BIYOGO Anaïs", "F", "2026-10-02", "2026-10-14", "ACTE_ARCHIVE", 0),
    A("1248", "OYANE Fabrice", "M", "2026-09-29", "2026-10-10", "ACTE_ARCHIVE", 2),
    A("1247", "MAKAYA Esther", "F", "2026-09-25", "2026-10-06", "ACTE_ARCHIVE", 1),
    A("1246", "NDEMBI Lucas", "M", "2026-09-22", "2026-10-03", "ACTE_ARCHIVE", 0),
    A("1245", "AKOUE Victoire", "F", "2026-09-20", "2026-10-01", "ACTE_ARCHIVE", 4, [{ action: "Rectification du prénom (jugement n°2026/118)", user: "Officier01", date: "12/10/2026" }]),
  ],
  filters: [
    { key: "tous", label: "Tous" },
    { key: "signes", label: "Signés", test: (r) => r.statut === "ACTE_SIGNE" },
    { key: "archives", label: "Archivés", test: (r) => r.statut === "ACTE_ARCHIVE" },
    { key: "mentions", label: "Avec mentions", test: (r) => r.mentions.length > 0 },
  ],
  columns: [
    { key: "id", label: "N° d'acte", className: "mono strong" },
    { key: "enfant", label: "Enfant", render: (r) => <Person name={r.enfant} sub={r.sexe === "F" ? "Fille" : "Garçon"} tone={r.sexe} /> },
    { key: "dateNaissance", label: "Né(e) le", render: (r) => fmtDate(r.dateNaissance) },
    { key: "dateEtablissement", label: "Établi le", render: (r) => fmtDate(r.dateEtablissement) },
    { key: "registre", label: "Registre", className: "mono muted" },
    { key: "mentions", label: "Mentions", render: (r) => (r.mentions.length ? <Badge tone="blue">{r.mentions.length} mention</Badge> : <span className="muted">Aucune</span>) },
    { key: "statut", label: "Statut", render: (r) => <StatusBadge statut={r.statut} /> },
  ],
  detail: (r) => ({
    title: r.enfant, tone: r.sexe, subtitle: `Acte ${r.id} · registre ${r.registre}`, badge: <StatusBadge statut={r.statut} />,
    tabs: [
      { key: "acte", label: "Acte", sections: [
        { title: "Acte de naissance", items: [["Numéro", r.id], ["Enfant", r.enfant], ["Date de naissance", fmtDate(r.dateNaissance)], ["Établi le", fmtDate(r.dateEtablissement)], ["Officier signataire", r.officier], ["Registre", r.registre], ["Copies délivrées", String(r.copies)]] },
      ] },
      { key: "mentions", label: "Mentions", sections: [
        { title: "Mentions marginales", type: "timeline", items: r.mentions, empty: { icon: BookMarked, title: "Aucune mention marginale", text: "Cet acte n'a fait l'objet d'aucune mention." } },
      ] },
      { key: "deliv", label: "Délivrances", sections: [
        { title: "Historique des délivrances", type: "timeline", items: r.delivrances, empty: { icon: Inbox, title: "Aucune délivrance", text: "Aucune copie ni aucun extrait n'a encore été délivré pour cet acte." } },
      ] },
    ],
  }),
};

/* =====================================================================
   JUGEMENTS SUPPLÉTIFS
   ===================================================================== */
const J = (id, enfant, requerant, dateJugement, dateReception, statut, dateNaissanceRetenue, lieuRetenu, transcription = null) => ({
  id, enfant, requerant, juridiction: "Tribunal de première instance de Libreville", dateJugement, dateReception, statut,
  dateNaissanceRetenue, lieuRetenu, filiation: `Fils/fille de ${requerant}`, dispositif: "Déclare que l'enfant est né(e) à la date et au lieu retenus ; ordonne la transcription du présent jugement sur les registres de l'état civil.", transcription,
});
export const jugements = {
  title: "Jugements supplétifs",
  subtitle: "Suivi des décisions judiciaires et de leur transcription sur les registres",
  entity: "Jugement", icon: Gavel, createLabel: "Enregistrer un jugement",
  searchKeys: ["id", "enfant", "requerant"],
  searchPlaceholder: "Rechercher par n° de jugement, enfant, requérant…",
  rows: [
    J("JS-2026-0091", "ELLA Prince", "ELLA Joséphine", "2026-10-20", "2026-10-27", "JUGEMENT_DEFINITIF", "2026-08-11", "Ntoum"),
    J("JS-2026-0090", "MOUSSAVOU Grâce", "MOUSSAVOU Paul", "2026-10-18", "2026-10-25", "JUGEMENT_RENDU", "2026-09-02", "Akanda"),
    J("JS-2026-0087", "BEKALE Joseph", "BEKALE Odile", "2026-10-02", "2026-10-10", "TRANSCRIPTION_EFFECTUEE", "2019-05-14", "Libreville", { date: "2026-10-29", agent: "Agent01", officier: "Officier01", acte: "N°2026-1255" }),
    J("JS-2026-0084", "NTOUTOUME Rachel", "NTOUTOUME Marc", "2026-09-21", "2026-09-30", "TRANSCRIPTION_EFFECTUEE", "2015-11-03", "Owendo", { date: "2026-10-04", agent: "Agent03", officier: "Officier01", acte: "N°2026-1201" }),
    J("JS-2026-0080", "MBOUMBA Kelly", "MBOUMBA Anne", "", "2026-09-15", "JUGEMENT_SUPPLETIF_EN_ATTENTE", "", ""),
  ],
  filters: [
    { key: "tous", label: "Tous" },
    { key: "attente", label: "En attente", test: (r) => ["JUGEMENT_SUPPLETIF_EN_ATTENTE", "JUGEMENT_RENDU"].includes(r.statut) },
    { key: "transcrire", label: "À transcrire", test: (r) => r.statut === "JUGEMENT_DEFINITIF" },
    { key: "transcrits", label: "Transcrits", test: (r) => r.statut === "TRANSCRIPTION_EFFECTUEE" },
  ],
  columns: [
    { key: "id", label: "N° jugement", className: "mono strong" },
    { key: "enfant", label: "Enfant", render: (r) => <Person name={r.enfant} sub={`Requérant : ${r.requerant}`} tone="M" /> },
    { key: "dateJugement", label: "Rendu le", render: (r) => (r.dateJugement ? fmtDate(r.dateJugement) : <span className="muted">En attente</span>) },
    { key: "dateReception", label: "Reçu le", render: (r) => fmtDate(r.dateReception) },
    { key: "statut", label: "Statut", render: (r) => <StatusBadge statut={r.statut} /> },
  ],
  canEdit: (r) => r.statut !== "TRANSCRIPTION_EFFECTUEE",
  form: {
    defaults: { juridiction: "Tribunal de première instance de Libreville", dateReception: TODAY, statut: "JUGEMENT_RENDU" },
    sections: [
      { title: "Décision", fields: [
        { name: "juridiction", label: "Juridiction", required: true, full: true },
        { name: "dateJugement", label: "Date du jugement", type: "date", required: true },
        { name: "dateReception", label: "Date de réception", type: "date" },
        { name: "statut", label: "Statut", type: "select", required: true, options: [
          { value: "JUGEMENT_SUPPLETIF_EN_ATTENTE", label: "En attente de jugement" }, { value: "JUGEMENT_RENDU", label: "Jugement rendu" },
          { value: "JUGEMENT_DEFINITIF", label: "Jugement définitif" }] },
      ] },
      { title: "Personnes concernées", fields: [
        { name: "enfant", label: "Enfant (nom et prénoms)", required: true, full: true },
        { name: "requerant", label: "Requérant", required: true },
        { name: "dateNaissanceRetenue", label: "Date de naissance retenue", type: "date", required: true },
        { name: "lieuRetenu", label: "Lieu de naissance retenu", required: true },
        { name: "filiation", label: "Filiation retenue" },
      ] },
      { title: "Dispositif", fields: [{ name: "dispositif", label: "Dispositif du jugement", type: "textarea", full: true }] },
    ],
  },
  newRow: (v, rows) => ({ ...v, id: `JS-2026-0${Math.max(...rows.map((r) => +r.id.split("-")[2])) + 1}`, transcription: null }),
  detail: (r) => ({
    title: r.enfant, tone: "M", subtitle: `Jugement ${r.id} · ${r.juridiction}`, badge: <StatusBadge statut={r.statut} />,
    tabs: [
      { key: "jug", label: "Jugement", sections: [
        { title: "Décision", items: [["Numéro", r.id], ["Juridiction", r.juridiction], ["Date du jugement", r.dateJugement && fmtDate(r.dateJugement)], ["Date de réception", fmtDate(r.dateReception)]] },
        { title: "Éléments retenus", items: [["Requérant", r.requerant], ["Date de naissance retenue", r.dateNaissanceRetenue && fmtDate(r.dateNaissanceRetenue)], ["Lieu retenu", r.lieuRetenu], ["Filiation", r.filiation], ["Dispositif", r.dispositif]] },
      ] },
      { key: "trans", label: "Transcription", sections: [
        r.transcription
          ? { title: "Transcription sur le registre", items: [["Date", fmtDate(r.transcription.date)], ["Agent", r.transcription.agent], ["Officier validant", r.transcription.officier], ["Acte établi", r.transcription.acte]] }
          : { title: "Transcription sur le registre", type: "timeline", items: [], empty: { icon: ScrollText, title: "Pas encore transcrit", text: "La transcription sera possible lorsque le jugement sera définitif." } },
      ] },
      { key: "docs", label: "Documents", sections: [
        { title: "Documents numérisés", type: "files", items: r.transcription ? [{ name: `Jugement ${r.id}.pdf`, meta: "Copie certifiée · 1,2 Mo" }] : [], empty: { icon: FolderOpen, title: "Aucun document", text: "Numérisez la copie certifiée du jugement." } },
      ] },
    ],
  }),
};

/* =====================================================================
   RECTIFICATIONS (vide : aucun enregistrement)
   ===================================================================== */
export const rectifications = {
  title: "Rectifications",
  subtitle: "Corrections autorisées d'un acte : ancienne valeur, nouvelle valeur et décision",
  entity: "Rectification", icon: PenLine, createLabel: "Nouvelle rectification",
  searchKeys: ["id", "acte", "champ"], rows: [],
  empty: { icon: PenLine, title: "Aucune demande de rectification", text: "Les corrections d'actes autorisées par une décision apparaîtront ici, avec l'ancienne et la nouvelle valeur." },
  columns: [
    { key: "id", label: "Référence", className: "mono strong" },
    { key: "acte", label: "Acte concerné", className: "mono" },
    { key: "champ", label: "Information corrigée" },
    { key: "valeurs", label: "Ancienne → nouvelle", render: (r) => <span><s className="muted">{r.ancienneValeur}</s> → <strong>{r.nouvelleValeur}</strong></span> },
    { key: "statut", label: "Statut", render: (r) => <Badge tone="yellow">{r.statut}</Badge> },
  ],
  form: {
    defaults: {},
    sections: [
      { title: "Acte concerné", fields: [
        { name: "acte", label: "N° d'acte", required: true, placeholder: "Ex. : N°2026-1245" },
        { name: "champ", label: "Information à corriger", type: "select", required: true, options: ["Nom", "Prénom(s)", "Date de naissance", "Lieu de naissance", "Filiation", "Autre"] },
        { name: "ancienneValeur", label: "Ancienne valeur", required: true },
        { name: "nouvelleValeur", label: "Nouvelle valeur", required: true },
      ] },
      { title: "Justification", fields: [
        { name: "motif", label: "Motif", type: "textarea", required: true, full: true },
        { name: "decision", label: "Référence de la décision", placeholder: "Ex. : jugement n°2026/118" },
        { name: "autorite", label: "Autorité", type: "select", options: ["Tribunal de première instance", "Procureur de la République", "Officier d'état civil"] },
      ] },
    ],
  },
  newRow: (v, rows) => ({ ...v, id: `RC-2026-${String(rows.length + 1).padStart(4, "0")}`, statut: "En instruction" }),
  detail: (r) => ({
    title: r.acte, subtitle: `Rectification ${r.id}`, badge: <Badge tone="yellow">{r.statut}</Badge>,
    tabs: [
      { key: "rect", label: "Rectification", sections: [{ title: "Correction", items: [["Information", r.champ], ["Ancienne valeur", r.ancienneValeur], ["Nouvelle valeur", r.nouvelleValeur], ["Motif", r.motif], ["Décision", r.decision], ["Autorité", r.autorite]] }] },
      { key: "pieces", label: "Pièces", sections: [{ title: "Pièces justificatives", type: "files", items: [], empty: { icon: FolderOpen, title: "Aucune pièce jointe" } }] },
    ],
  }),
};

/* =====================================================================
   MENTIONS MARGINALES (vide : aucun enregistrement)
   ===================================================================== */
const TYPES_MENTION = ["Reconnaissance d'enfant", "Adoption", "Changement de nom", "Changement de prénom", "Décision relative à la filiation", "Rectification", "Reconstitution", "Annulation"];
export const mentions = {
  title: "Mentions marginales",
  subtitle: "Événements et décisions inscrits en marge des actes de naissance",
  entity: "Mention", icon: BookMarked, createLabel: "Ajouter une mention",
  searchKeys: ["id", "acte", "type"], rows: [],
  empty: { icon: BookMarked, title: "Aucune mention marginale", text: "Aucune mention n'a encore été inscrite. Ajoutez une reconnaissance, une adoption ou une décision affectant un acte." },
  columns: [
    { key: "id", label: "Identifiant", className: "mono strong" },
    { key: "acte", label: "Acte", className: "mono" },
    { key: "type", label: "Type", render: (r) => <Badge tone="blue">{r.type}</Badge> },
    { key: "dateDecision", label: "Date", render: (r) => fmtDate(r.dateDecision) },
    { key: "autorite", label: "Autorité" },
  ],
  form: {
    defaults: { dateDecision: TODAY },
    sections: [
      { title: "Mention", fields: [
        { name: "acte", label: "N° d'acte concerné", required: true },
        { name: "type", label: "Type de mention", type: "select", required: true, options: TYPES_MENTION },
        { name: "dateDecision", label: "Date de la décision", type: "date", required: true },
        { name: "autorite", label: "Autorité compétente", required: true },
        { name: "reference", label: "Référence du document", full: true },
        { name: "contenu", label: "Contenu de la mention", type: "textarea", required: true, full: true },
      ] },
    ],
  },
  newRow: (v, rows) => ({ ...v, id: `MM-2026-${String(rows.length + 1).padStart(4, "0")}` }),
  detail: (r) => ({
    title: r.acte, subtitle: `Mention ${r.id}`, badge: <Badge tone="blue">{r.type}</Badge>,
    tabs: [{ key: "m", label: "Mention", sections: [{ title: "Détail", items: [["Type", r.type], ["Date", fmtDate(r.dateDecision)], ["Autorité", r.autorite], ["Référence", r.reference], ["Contenu", r.contenu]] }] }],
  }),
};

/* =====================================================================
   REGISTRES
   ===================================================================== */
const R = (id, centre, annee, nbActes, ouverture, statut, derniers = []) => ({ id, centre, type: "Naissances", annee, nbActes, ouverture, statut, derniers });
export const registres = {
  title: "Registres",
  subtitle: "Province → commune → arrondissement → centre → registre → année → acte",
  entity: "Registre", icon: Library, createLabel: "Ouvrir un registre",
  searchKeys: ["id", "centre", "annee"],
  rows: [
    R("REG-LBV1-N-2026", "Libreville 1er arr.", "2026", 1255, "2026-01-02", "Ouvert", [{ action: "Acte N°2026-1255 (transcription)", user: "Officier01", date: "29/10/2026" }, { action: "Acte N°2026-1254", user: "Officier01", date: "29/10/2026" }]),
    R("REG-LBV3-N-2026", "Libreville 3e arr.", "2026", 744, "2026-01-02", "Ouvert"),
    R("REG-OWE-N-2026", "Owendo", "2026", 521, "2026-01-03", "Ouvert"),
    R("REG-AKA-N-2026", "Akanda", "2026", 398, "2026-01-02", "Ouvert"),
    R("REG-LBV1-N-2025", "Libreville 1er arr.", "2025", 3412, "2025-01-02", "Clôturé"),
    R("REG-LBV3-N-2025", "Libreville 3e arr.", "2025", 2987, "2025-01-02", "Clôturé"),
  ],
  filters: [
    { key: "tous", label: "Tous" },
    { key: "ouverts", label: "Ouverts", test: (r) => r.statut === "Ouvert" },
    { key: "clotures", label: "Clôturés", test: (r) => r.statut === "Clôturé" },
  ],
  columns: [
    { key: "id", label: "Registre", className: "mono strong" },
    { key: "centre", label: "Centre" },
    { key: "annee", label: "Année" },
    { key: "nbActes", label: "Actes", render: (r) => <strong>{Number(r.nbActes).toLocaleString("fr-FR")}</strong> },
    { key: "ouverture", label: "Ouvert le", render: (r) => fmtDate(r.ouverture) },
    { key: "statut", label: "Statut", render: (r) => <Badge tone={r.statut === "Ouvert" ? "green" : "muted"}>{r.statut}</Badge> },
  ],
  canEdit: (r) => r.statut === "Ouvert",
  form: {
    defaults: { type: "Naissances", annee: "2027", ouverture: "2027-01-02" },
    sections: [{ title: "Registre", fields: [
      { name: "centre", label: "Centre d'état civil", type: "select", required: true, options: ["Libreville 1er arr.", "Libreville 3e arr.", "Owendo", "Akanda", "Ntoum"] },
      { name: "type", label: "Type", type: "select", required: true, options: ["Naissances"] },
      { name: "annee", label: "Année", type: "number", required: true },
      { name: "ouverture", label: "Date d'ouverture", type: "date", required: true },
    ] }],
  },
  newRow: (v) => ({ ...v, id: `REG-${v.centre.slice(0, 3).toUpperCase()}-N-${v.annee}`, nbActes: 0, statut: "Ouvert", derniers: [] }),
  detail: (r) => ({
    title: r.id, subtitle: `${r.centre} · registre des naissances ${r.annee}`, badge: <Badge tone={r.statut === "Ouvert" ? "green" : "muted"}>{r.statut}</Badge>,
    tabs: [
      { key: "reg", label: "Registre", sections: [{ title: "Informations", items: [["Centre", r.centre], ["Type", r.type], ["Année", r.annee], ["Nombre d'actes", Number(r.nbActes).toLocaleString("fr-FR")], ["Ouvert le", fmtDate(r.ouverture)], ["Statut", r.statut]] }] },
      { key: "derniers", label: "Derniers actes", sections: [{ title: "Derniers actes inscrits", type: "timeline", items: r.derniers, empty: { icon: ScrollText, title: "Aucun acte récent", text: "Aucun acte n'a été inscrit récemment dans ce registre." } }] },
    ],
  }),
};

/* =====================================================================
   UTILISATEURS
   ===================================================================== */
const ROLES = ["Administrateur", "Officier d'état civil", "Agent d'état civil", "Consultation"];
const PERMS = {
  "Administrateur": [["Utilisateurs et rôles", "Gestion complète"], ["Paramètres et sauvegardes", "Gestion complète"], ["Statistiques", "Consultation"], ["Journal d'audit", "Consultation"]],
  "Officier d'état civil": [["Validation et signature", "Autorisé"], ["Transcription", "Autorisé"], ["Mentions marginales", "Autorisé"], ["Délivrance", "Autorisé"]],
  "Agent d'état civil": [["Réception et saisie", "Autorisé"], ["Contrôle des pièces", "Autorisé"], ["Numérisation", "Autorisé"], ["Signature", "Non autorisé"]],
  "Consultation": [["Recherche d'actes", "Autorisé"], ["Modification", "Non autorisé"]],
};
const U = (id, nom, identifiant, role, centre, statut, derniereConnexion, activite = []) => ({ id, nom, identifiant, email: `${identifiant.toLowerCase()}@etatcivil.ga`, telephone: "+241 07 00 00 00", role, centre, statut, derniereConnexion, activite });
export const utilisateurs = {
  title: "Utilisateurs",
  subtitle: "Comptes, rôles et habilitations des agents et officiers",
  entity: "Utilisateur", icon: Users, createLabel: "Nouvel utilisateur",
  searchKeys: ["nom", "identifiant", "role", "centre"],
  rows: [
    U("U-001", "MOUNGUENGUI Alice", "Admin01", "Administrateur", "Tous les centres", "Actif", "29/10/2026 08:02", [{ action: "Connexion", user: "Admin01", date: "29/10/2026 08:02" }]),
    U("U-002", "OBAME Christian", "Officier01", "Officier d'état civil", "Libreville 1er arr.", "Actif", "29/10/2026 08:12", [{ action: "A signé l'acte N°2026-1254", user: "Officier01", date: "29/10/2026 10:42" }, { action: "A transcrit le jugement JS-2026-0087", user: "Officier01", date: "29/10/2026 09:58" }]),
    U("U-003", "NZIENGUI Béatrice", "Agent01", "Agent d'état civil", "Libreville 1er arr.", "Actif", "29/10/2026 07:55", [{ action: "A créé la déclaration DN-2026-04821", user: "Agent01", date: "29/10/2026 10:15" }]),
    U("U-004", "ASSOUMOU Didier", "Agent02", "Agent d'état civil", "Libreville 1er arr.", "Actif", "29/10/2026 08:20", [{ action: "A délivré l'extrait N°2025-3310", user: "Agent02", date: "29/10/2026 09:40" }]),
    U("U-005", "MABIKA Sandrine", "Agent03", "Agent d'état civil", "Libreville 1er arr.", "Actif", "29/10/2026 08:05"),
    U("U-006", "EYEGHE Patrice", "Officier02", "Officier d'état civil", "Owendo", "Suspendu", "02/09/2026 16:30"),
    U("U-007", "LEYAMA Corinne", "Consult01", "Consultation", "Akanda", "Actif", "Jamais connecté"),
  ],
  filters: [
    { key: "tous", label: "Tous" },
    { key: "officiers", label: "Officiers", test: (r) => r.role === "Officier d'état civil" },
    { key: "agents", label: "Agents", test: (r) => r.role === "Agent d'état civil" },
    { key: "suspendus", label: "Suspendus", test: (r) => r.statut === "Suspendu" },
  ],
  columns: [
    { key: "nom", label: "Utilisateur", render: (r) => <Person name={r.nom} sub={r.email} tone={r.role === "Administrateur" ? "F" : "M"} /> },
    { key: "identifiant", label: "Identifiant", className: "mono" },
    { key: "role", label: "Rôle", render: (r) => <Badge tone={r.role === "Administrateur" ? "dark" : r.role.startsWith("Officier") ? "navy" : r.role.startsWith("Agent") ? "blue" : "muted"}>{r.role}</Badge> },
    { key: "centre", label: "Centre" },
    { key: "statut", label: "Statut", render: (r) => <Badge tone={r.statut === "Actif" ? "green" : "alert"}>{r.statut}</Badge> },
    { key: "derniereConnexion", label: "Dernière connexion", className: "muted" },
  ],
  form: {
    defaults: { statut: "Actif", role: "Agent d'état civil" },
    sections: [
      { title: "Identité", fields: [
        { name: "nom", label: "Nom et prénom(s)", required: true, full: true },
        { name: "identifiant", label: "Identifiant de connexion", required: true },
        { name: "email", label: "Adresse e-mail", type: "email" },
        { name: "telephone", label: "Téléphone" },
      ] },
      { title: "Habilitations", fields: [
        { name: "role", label: "Rôle", type: "select", required: true, options: ROLES },
        { name: "centre", label: "Centre de rattachement", type: "select", required: true, options: ["Tous les centres", "Libreville 1er arr.", "Libreville 3e arr.", "Owendo", "Akanda", "Ntoum"] },
        { name: "statut", label: "Statut du compte", type: "select", options: ["Actif", "Suspendu"] },
      ] },
    ],
  },
  newRow: (v, rows) => ({ ...v, id: `U-${String(rows.length + 1).padStart(3, "0")}`, derniereConnexion: "Jamais connecté", activite: [] }),
  detail: (r) => ({
    title: r.nom, tone: r.role === "Administrateur" ? "F" : "M", subtitle: `${r.role} · ${r.centre}`, badge: <Badge tone={r.statut === "Actif" ? "green" : "alert"}>{r.statut}</Badge>,
    tabs: [
      { key: "profil", label: "Profil", sections: [{ title: "Compte", items: [["Identifiant", r.identifiant], ["E-mail", r.email], ["Téléphone", r.telephone], ["Rôle", r.role], ["Centre", r.centre], ["Dernière connexion", r.derniereConnexion]] }] },
      { key: "droits", label: "Habilitations", sections: [{ title: "Permissions du rôle", items: PERMS[r.role] ?? [] }] },
      { key: "activite", label: "Activité", sections: [{ title: "Dernières actions", type: "timeline", items: r.activite ?? [], empty: { icon: History, title: "Aucune activité", text: "Cet utilisateur n'a encore effectué aucune opération." } }] },
    ],
  }),
};

/* =====================================================================
   JOURNAL D'ACTIVITÉ (consultation seule)
   ===================================================================== */
const L = (n, date, heure, user, action, cible, ancienne = "", nouvelle = "", resultat = "Succès") => ({ id: `LOG-${n}`, date, heure, user, action, cible, ancienne, nouvelle, resultat });
export const journal = {
  title: "Journal d'activité",
  subtitle: "Toutes les opérations importantes sont enregistrées (cahier des charges, section 23)",
  entity: "Opération", icon: History, canCreate: false,
  searchKeys: ["user", "action", "cible"],
  searchPlaceholder: "Rechercher un utilisateur, une action, un acte…",
  rows: [
    L("88412", "2026-10-29", "10:42", "Officier01", "Signature d'un acte", "N°2026-1254"),
    L("88411", "2026-10-29", "10:31", "Agent03", "Transmission pour validation", "DN-2026-04820", "EN_VERIFICATION", "EN_ATTENTE_VALIDATION"),
    L("88410", "2026-10-29", "10:15", "Agent01", "Création d'une déclaration", "DN-2026-04821"),
    L("88409", "2026-10-29", "09:58", "Officier01", "Transcription d'un jugement", "JS-2026-0087", "JUGEMENT_DEFINITIF", "TRANSCRIPTION_EFFECTUEE"),
    L("88408", "2026-10-29", "09:40", "Agent02", "Délivrance d'un extrait", "N°2025-3310"),
    L("88407", "2026-10-29", "09:12", "Agent02", "Tentative de suppression d'un acte validé", "N°2026-1198", "", "", "Refusé"),
    L("88406", "2026-10-29", "08:20", "Agent02", "Connexion", "—"),
    L("88405", "2026-10-29", "08:12", "Officier01", "Connexion", "—"),
    L("88404", "2026-10-28", "17:45", "Officier01", "Modification d'une déclaration", "DN-2026-04815", "Lieu : Libreville", "Lieu : Maternité de Libreville"),
    L("88403", "2026-10-28", "16:02", "Agent03", "Alerte doublon potentiel", "DN-2026-04820", "", "", "Avertissement"),
  ],
  filters: [
    { key: "tous", label: "Toutes" },
    { key: "refus", label: "Refusées / alertes", test: (r) => r.resultat !== "Succès" },
    { key: "modifs", label: "Modifications", test: (r) => r.ancienne || r.nouvelle },
  ],
  columns: [
    { key: "date", label: "Date / heure", render: (r) => <span className="mono">{fmtDate(r.date)} {r.heure}</span> },
    { key: "user", label: "Utilisateur", className: "strong" },
    { key: "action", label: "Action" },
    { key: "cible", label: "Acte / dossier", className: "mono" },
    { key: "resultat", label: "Résultat", render: (r) => <Badge tone={r.resultat === "Succès" ? "green" : r.resultat === "Refusé" ? "alert" : "yellow"}>{r.resultat}</Badge> },
  ],
  detail: (r) => ({
    title: r.action, subtitle: `${fmtDate(r.date)} à ${r.heure} · ${r.user}`,
    badge: <Badge tone={r.resultat === "Succès" ? "green" : r.resultat === "Refusé" ? "alert" : "yellow"}>{r.resultat}</Badge>,
    tabs: [{ key: "op", label: "Opération", sections: [
      { title: "Détail de l'opération", items: [["Identifiant", r.id], ["Utilisateur", r.user], ["Action", r.action], ["Acte / dossier", r.cible], ["Ancienne valeur", r.ancienne], ["Nouvelle valeur", r.nouvelle], ["Résultat", r.resultat]] },
    ] }],
  }),
};

/* =====================================================================
   CERTIFICATS DE NAISSANCE (établissement de santé → centre d'état civil)
   Loi n°004/2021 : l'établissement délivre gratuitement et sans délai le certificat.
   ===================================================================== */
const CERT_TONE = { "Brouillon": "muted", "Transmis au centre": "blue", "En attente de déclaration": "yellow", "Déclaré": "green" };
const C = (n, enfant, sexe, dateNaissance, heure, poids, mere, praticien, transmis, statut, declaration = "", x = {}) => ({
  id: `CN-2026-${n}`, enfant, prenomsProposes: x.prenoms ?? "", sexe, dateNaissance, heure, poids, taille: x.taille ?? "49",
  accouchement: x.accouchement ?? "Voie basse", lieuNaissance: "Maternité de Libreville", commune: "Libreville", nes: "Unique",
  mere, mereDateNaissance: x.mereDN ?? "1995-06-20", mereLieuNaissance: x.mereLieu ?? "Libreville", mereProfession: x.mereProf ?? "",
  mereNationalite: "Gabonaise", mereCoutume: x.coutume ?? "Fang", mereCni: x.mereCni ?? "GA-2207-1180", mereDomicile: x.domicile ?? "Libreville",
  pere: x.pere ?? "", pereDateNaissance: x.pereDN ?? "", pereLieuNaissance: x.pereLieu ?? "", pereProfession: x.pereProf ?? "",
  pereNationalite: x.pere ? "Gabonaise" : "", pereCoutume: x.pere ? (x.coutume ?? "Fang") : "", pereCni: x.pereCni ?? "",
  reconnaissance: x.pere ? "Père présent à la naissance, reconnaissance à déclarer" : "",
  praticien, qualitePraticien: praticien.startsWith("Dr") ? "Médecin" : "Sage-femme",
  etablissement: "Maternité de Libreville", transmis, statut, declaration,
});
export const certificats = {
  title: "Certificats de naissance",
  subtitle: "Établis par la maternité et transmis au centre d'état civil pour la déclaration",
  entity: "Certificat", icon: Stethoscope, createLabel: "Nouveau certificat",
  searchKeys: ["id", "enfant", "mere", "praticien"],
  searchPlaceholder: "Rechercher par n° de certificat, nom de la mère, praticien…",
  rows: [
    C("00931", "Bébé NDONG", "F", "2026-10-26", "08:40", "3,20", "NDONG Clarisse", "Dr MBOUMBA Hélène", "2026-10-26", "Déclaré", "DN-2026-04821",
      { prenoms: "Élise Marie", mereDN: "1994-03-12", mereProf: "Enseignante", domicile: "Quartier Louis, Libreville", pere: "NDONG Arnaud", pereDN: "1990-07-02", pereLieu: "Oyem", pereProf: "Comptable", pereCni: "GA-1188-4410" }),
    C("00930", "Bébé OBIANG", "F", "2026-10-21", "14:05", "2,95", "OBIANG Nadia", "MAKOSSO Eliane", "2026-10-21", "Déclaré", "DN-2026-04819",
      { prenoms: "Sarah", mereDN: "1997-01-25", mereProf: "Infirmière", domicile: "Quartier Glass, Libreville" }),
    C("00929", "Bébé NZÉ", "M", "2026-10-19", "03:20", "3,60", "NZÉ Pauline", "Dr MBOUMBA Hélène", "2026-10-19", "Déclaré", "DN-2026-04817",
      { prenoms: "Junior Patrick", taille: "51", mereDN: "1994-03-12", mereProf: "Juriste", domicile: "Quartier Louis, Libreville", pere: "NZÉ Patrick", pereDN: "1990-02-08", pereLieu: "Libreville", pereProf: "Ingénieur", pereCni: "GA-1022-7764" }),
    C("00928", "Bébé ABESSOLO", "M", "2026-10-27", "22:15", "3,05", "ABESSOLO Mireille", "MAKOSSO Eliane", "2026-10-28", "En attente de déclaration", "",
      { prenoms: "", mereDN: "1995-06-20", mereProf: "Commerçante", domicile: "Quartier Akébé, Libreville", pere: "ABESSOLO Franck", pereDN: "1991-11-30", pereLieu: "Bitam", pereProf: "Chauffeur", pereCni: "GA-3307-5521" }),
    C("00927", "Bébé OGANDAGA", "F", "2026-10-28", "06:50", "2,80", "OGANDAGA Fanny", "Dr ESSONO Paul", "2026-10-28", "En attente de déclaration", "",
      { mereDN: "1999-04-17", mereLieu: "Port-Gentil", mereProf: "Étudiante", coutume: "Myènè", domicile: "Quartier Nzeng-Ayong, Libreville", accouchement: "Césarienne" }),
    C("00926", "Bébé MOUSSOUNDA", "M", "2026-10-29", "05:30", "3,40", "MOUSSOUNDA Léa", "MAKOSSO Eliane", "", "Brouillon", "",
      { mereDN: "1996-08-09", mereLieu: "Mouila", mereProf: "Coiffeuse", coutume: "Punu", domicile: "Quartier PK8, Libreville", pere: "MOUSSOUNDA Rémi", pereDN: "1992-05-14", pereLieu: "Mouila", pereProf: "Électricien", pereCni: "" }),
    C("00925", "Bébé NGOUA", "F", "2026-10-29", "09:10", "3,10", "NGOUA Prisca", "Dr ESSONO Paul", "2026-10-29", "Transmis au centre", "",
      { prenoms: "Grâce", mereDN: "1993-12-03", mereProf: "Secrétaire", domicile: "Quartier Louis, Libreville", pere: "NGOUA Serge", pereDN: "1989-06-21", pereLieu: "Lambaréné", pereProf: "Gendarme", pereCni: "GA-2876-0045" }),
  ],
  kpis: (rows) => [
    { label: "Naissances enregistrées", value: rows.length },
    { label: "Transmis au centre", value: rows.filter((r) => r.statut === "Transmis au centre").length, tone: "navy" },
    { label: "En attente de déclaration", value: rows.filter((r) => r.statut === "En attente de déclaration").length, tone: "yellow" },
    { label: "Déclarés", value: rows.filter((r) => r.statut === "Déclaré").length, tone: "green" },
  ],
  filters: [
    { key: "tous", label: "Tous" },
    { key: "brouillons", label: "Brouillons", test: (r) => r.statut === "Brouillon" },
    { key: "attente", label: "En attente", test: (r) => ["Transmis au centre", "En attente de déclaration"].includes(r.statut) },
    { key: "declares", label: "Déclarés", test: (r) => r.statut === "Déclaré" },
  ],
  columns: [
    { key: "id", label: "N° certificat", className: "mono strong" },
    { key: "enfant", label: "Nouveau-né", render: (r) => <Person name={r.enfant} sub={`${r.sexe === "F" ? "Fille" : "Garçon"} · ${r.poids} kg`} tone={r.sexe} /> },
    { key: "dateNaissance", label: "Né(e) le", render: (r) => `${fmtDate(r.dateNaissance)} à ${r.heure}` },
    { key: "mere", label: "Mère" },
    { key: "praticien", label: "Praticien", className: "muted" },
    { key: "statut", label: "Statut", render: (r) => <Badge tone={CERT_TONE[r.statut]}>{r.statut}</Badge> },
  ],
  canEdit: (r) => r.statut !== "Déclaré",
  form: {
    defaults: { dateNaissance: TODAY, accouchement: "Voie basse", qualitePraticien: "Sage-femme", statut: "Transmis au centre", nes: "Unique", commune: "Libreville", mereNationalite: "Gabonaise", lieuNaissance: "Maternité de Libreville" },
    sections: [
      { title: "Naissance", fields: [
        { name: "dateNaissance", label: "Date de naissance", type: "date", required: true },
        { name: "heure", label: "Heure", type: "time", required: true },
        { name: "sexe", label: "Sexe", type: "select", required: true, options: [{ value: "M", label: "Masculin" }, { value: "F", label: "Féminin" }] },
        { name: "accouchement", label: "Type d'accouchement", type: "select", options: ["Voie basse", "Césarienne"] },
        { name: "poids", label: "Poids (kg)", placeholder: "Ex. : 3,20" },
        { name: "taille", label: "Taille (cm)" },
        { name: "nes", label: "Naissance", type: "select", options: ["Unique", "Gémellaire", "Multiple"] },
        { name: "commune", label: "Commune", type: "select", options: ["Libreville", "Owendo", "Akanda", "Ntoum"] },
        { name: "enfant", label: "Nom provisoire du nouveau-né", placeholder: "Ex. : Bébé NDONG", required: true },
        { name: "prenomsProposes", label: "Prénom(s) proposé(s) par les parents" },
      ] },
      { title: "Mère", fields: [
        { name: "mere", label: "Nom et prénom(s)", required: true, full: true },
        { name: "mereDateNaissance", label: "Date de naissance", type: "date", required: true },
        { name: "mereLieuNaissance", label: "Lieu de naissance" },
        { name: "mereProfession", label: "Profession" },
        { name: "mereNationalite", label: "Nationalité", type: "select", options: NATIONALITES },
        { name: "mereCoutume", label: "Coutume" },
        { name: "mereCni", label: "N° C.N.I.", required: true },
        { name: "mereDomicile", label: "Domicile", full: true, required: true },
      ] },
      { title: "Père", note: "Facultatif : à renseigner si le père est présent ou connu. La reconnaissance se fait au centre d'état civil.", fields: [
        { name: "pere", label: "Nom et prénom(s)", full: true },
        { name: "pereDateNaissance", label: "Date de naissance", type: "date" },
        { name: "pereLieuNaissance", label: "Lieu de naissance" },
        { name: "pereProfession", label: "Profession" },
        { name: "pereNationalite", label: "Nationalité", type: "select", options: NATIONALITES },
        { name: "pereCoutume", label: "Coutume" },
        { name: "pereCni", label: "N° C.N.I." },
      ] },
      { title: "Praticien et transmission", fields: [
        { name: "praticien", label: "Praticien ayant assisté", required: true },
        { name: "qualitePraticien", label: "Qualité", type: "select", options: ["Médecin", "Sage-femme", "Infirmier(ère)"] },
        { name: "statut", label: "Action", type: "select", required: true, full: true, options: ["Brouillon", "Transmis au centre"], hint: "« Transmis au centre » envoie le certificat au centre d'état civil." },
      ] },
    ],
  },
  newRow: (v, rows) => ({ ...v, id: `CN-2026-00${Math.max(...rows.map((r) => +r.id.split("-")[2])) + 1}`, etablissement: "Maternité de Libreville", transmis: v.statut === "Brouillon" ? "" : TODAY, declaration: "" }),
  detail: (r) => ({
    title: r.enfant, tone: r.sexe, subtitle: `Certificat ${r.id} · ${r.etablissement}`, badge: <Badge tone={CERT_TONE[r.statut]}>{r.statut}</Badge>,
    tabs: [
      { key: "cert", label: "Certificat", sections: [
        { title: "Naissance", items: [["Date et heure", `${fmtDate(r.dateNaissance)} à ${r.heure}`], ["Lieu", `${r.etablissement}, ${r.commune ?? "Libreville"}`], ["Sexe", r.sexe === "F" ? "Féminin" : "Masculin"], ["Naissance", r.nes], ["Poids", r.poids && `${r.poids} kg`], ["Taille", r.taille && `${r.taille} cm`], ["Accouchement", r.accouchement], ["Nom provisoire", r.enfant], ["Prénom(s) proposé(s)", r.prenomsProposes]] },
        { title: "Mère", items: [["Nom et prénom(s)", r.mere], ["Date de naissance", fmtDate(r.mereDateNaissance)], ["Lieu de naissance", r.mereLieuNaissance], ["Domicile", r.mereDomicile], ["Profession", r.mereProfession], ["Nationalité", r.mereNationalite], ["Coutume", r.mereCoutume], ["C.N.I. N°", r.mereCni]] },
        { title: "Père", items: [["Nom et prénom(s)", r.pere], ["Date de naissance", r.pereDateNaissance && fmtDate(r.pereDateNaissance)], ["Lieu de naissance", r.pereLieuNaissance], ["Profession", r.pereProfession], ["Nationalité", r.pereNationalite], ["Coutume", r.pereCoutume], ["C.N.I. N°", r.pereCni]] },
        { title: "Praticien", items: [["Nom", r.praticien], ["Qualité", r.qualitePraticien]] },
      ] },
      { key: "suivi", label: "Suivi", sections: [
        { title: "Suivi de la déclaration", type: "timeline", empty: { icon: FileText, title: "Pas encore transmis", text: "Ce certificat est un brouillon : transmettez-le au centre d'état civil." },
          items: r.statut === "Brouillon" ? [] : [
            ...(r.declaration ? [{ action: `Déclaration enregistrée (${r.declaration})`, user: "Centre d'état civil", date: fmtDate(r.transmis) }] : []),
            ...(r.statut === "En attente de déclaration" ? [{ action: "Reçu par le centre : en attente de la famille", user: "Centre d'état civil", date: fmtDate(r.transmis) }] : []),
            { action: "Certificat transmis au centre d'état civil", user: r.etablissement, date: fmtDate(r.transmis) },
          ] },
      ] },
      { key: "doc", label: "Document", sections: [
        { title: "Certificat signé", type: "files", items: r.statut === "Brouillon" ? [] : [{ name: `Certificat ${r.id}.pdf`, meta: "Signé par le praticien · 184 Ko" }], empty: { icon: FolderOpen, title: "Aucun document", text: "Le PDF signé sera généré à la transmission." } },
      ] },
    ],
  }),
};
/* =====================================================================
   DÉCLARATIONS DE NAISSANCE : vue de l'établissement de santé
   (naissances survenues dans l'établissement, transmises au centre d'état civil)
   ===================================================================== */
export const declarationsHopital = {
  ...declarations,
  title: "Déclarations de naissance",
  subtitle: "Naissances survenues dans l'établissement : déclarations transmises au centre d'état civil",
  createLabel: "Nouvelle déclaration",
  kpis: (rows) => [
    { label: "Déclarations", value: rows.length },
    { label: "En cours au centre", value: rows.filter((r) => !["ACTE_SIGNE", "ACTE_ETABLI"].includes(r.statut)).length, tone: "yellow" },
    { label: "Actes établis", value: rows.filter((r) => ["ACTE_SIGNE", "ACTE_ETABLI"].includes(r.statut)).length, tone: "green" },
  ],
  filters: [
    { key: "tous", label: "Toutes" },
    { key: "cours", label: "En cours au centre", test: (r) => !["ACTE_SIGNE", "ACTE_ETABLI"].includes(r.statut) },
    { key: "etablis", label: "Acte établi", test: (r) => ["ACTE_SIGNE", "ACTE_ETABLI"].includes(r.statut) },
  ],
  form: {
    ...declarations.form,
    defaults: { ...declarations.form.defaults, lieu: "Maternité de Libreville", commune: "Libreville", declarantQualite: "Médecin / sage-femme" },
  },
  newRow: (v, rows) => ({ ...declarations.newRow(v, rows), agent: "Hopital01" }),
};
