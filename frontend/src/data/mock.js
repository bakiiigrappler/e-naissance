// Données FICTIVES de démonstration — aucune donnée réelle de citoyen.

export const utilisateur = { nom: "Officier01", role: "Officier d'état civil", initiales: "OE" };
export const centreCourant = "Libreville — 1er arrondissement";

export const indicateurs = [
  { key: "today", label: "Déclarations du jour", value: 14, trend: +27, note: "vs hier", spark: [6, 9, 7, 11, 8, 12, 11, 14] },
  { key: "pending", label: "En attente de validation", value: 23, trend: +8, note: "5 depuis + de 48 h", spark: [15, 17, 16, 19, 21, 20, 22, 23], invert: true },
  { key: "validated", label: "Actes validés (mois)", value: 312, trend: +12, note: "vs septembre", spark: [210, 240, 228, 265, 280, 270, 298, 312] },
  { key: "delivered", label: "Copies et extraits délivrés", value: 486, trend: +5, note: "vs septembre", spark: [380, 410, 395, 430, 455, 440, 470, 486] },
  { key: "incomplete", label: "Dossiers incomplets", value: 9, trend: -18, note: "pièces manquantes", spark: [14, 13, 12, 13, 11, 10, 11, 9], invert: true },
  { key: "late", label: "Déclarations hors délai", value: 6, trend: -25, note: "orientées tribunal", spark: [10, 9, 9, 8, 8, 7, 8, 6], alert: true, invert: true },
];

export const naissancesParMois = [
  { mois: "Jan", y2026: 284, y2025: 262 }, { mois: "Fév", y2026: 261, y2025: 249 },
  { mois: "Mar", y2026: 297, y2025: 270 }, { mois: "Avr", y2026: 276, y2025: 268 },
  { mois: "Mai", y2026: 305, y2025: 281 }, { mois: "Juin", y2026: 289, y2025: 290 },
  { mois: "Juil", y2026: 318, y2025: 296 }, { mois: "Août", y2026: 331, y2025: 302 },
  { mois: "Sep", y2026: 302, y2025: 287 }, { mois: "Oct", y2026: 247, y2025: 293 },
];

export const repartitionSexe = { garcons: 1489, filles: 1421 };

export const naissancesParCentre = [
  { centre: "Libreville 1er arr.", total: 912 },
  { centre: "Libreville 3e arr.", total: 744 },
  { centre: "Owendo", total: 521 },
  { centre: "Akanda", total: 398 },
  { centre: "Ntoum", total: 187 },
];

// Circuit des dossiers (cahier des charges, section 20)
export const circuitNormal = [
  { statut: "DOSSIER_DEPOSE", label: "Déposés", value: 18 },
  { statut: "EN_VERIFICATION", label: "En vérification", value: 12 },
  { statut: "DOSSIER_COMPLET", label: "Complets", value: 9 },
  { statut: "EN_ATTENTE_VALIDATION", label: "À valider", value: 23 },
  { statut: "ACTE_ETABLI", label: "Établis", value: 7 },
  { statut: "ACTE_SIGNE", label: "Signés", value: 14 },
  { statut: "ACTE_ARCHIVE", label: "Archivés", value: 2841 },
];
export const circuitHorsDelai = [
  { statut: "HORS_DELAI", label: "Hors délai", value: 6 },
  { statut: "PROCEDURE_JUDICIAIRE", label: "Procédure judiciaire", value: 11 },
  { statut: "JUGEMENT_RENDU", label: "Jugement rendu", value: 5 },
  { statut: "JUGEMENT_DEFINITIF", label: "Jugement définitif", value: 4 },
  { statut: "TRANSCRIPTION", label: "À transcrire", value: 4 },
];

// Statuts : cahier des charges, section 20
export const STATUTS = {
  BROUILLON: { label: "Brouillon", tone: "muted" },
  DOSSIER_DEPOSE: { label: "Dossier déposé", tone: "outline" },
  EN_VERIFICATION: { label: "En vérification", tone: "blue" },
  DOSSIER_COMPLET: { label: "Dossier complet", tone: "outline" },
  EN_ATTENTE_VALIDATION: { label: "À valider", tone: "yellow" },
  VALIDE: { label: "Validé", tone: "green" },
  ACTE_ETABLI: { label: "Acte établi", tone: "navy" },
  ACTE_SIGNE: { label: "Acte signé", tone: "dark" },
  ACTE_ARCHIVE: { label: "Archivé", tone: "muted" },
  HORS_DELAI: { label: "Hors délai", tone: "alert" },
  PROCEDURE_JUDICIAIRE: { label: "Procédure judiciaire", tone: "alert" },
  JUGEMENT_RENDU: { label: "Jugement rendu", tone: "soft" },
  TRANSCRIPTION: { label: "Transcription", tone: "soft" },
  JUGEMENT_SUPPLETIF_EN_ATTENTE: { label: "En attente de jugement", tone: "yellow" },
  JUGEMENT_DEFINITIF: { label: "Jugement définitif", tone: "blue" },
  TRANSCRIPTION_EFFECTUEE: { label: "Transcrit", tone: "green" },
};

export const FILTRES = [
  { key: "tous", label: "Tous" },
  { key: "cours", label: "En cours", statuts: ["DOSSIER_DEPOSE", "EN_VERIFICATION", "DOSSIER_COMPLET", "EN_ATTENTE_VALIDATION"] },
  { key: "etablis", label: "Établis / signés", statuts: ["VALIDE", "ACTE_ETABLI", "ACTE_SIGNE"] },
  { key: "horsdelai", label: "Hors délai", statuts: ["HORS_DELAI", "PROCEDURE_JUDICIAIRE"] },
];

export const dossiersRecents = [
  { id: "DN-2026-04821", enfant: "NDONG Élise Marie", sexe: "F", naissance: "26/10/2026", declaration: "29/10/2026", statut: "EN_VERIFICATION", agent: "Agent01" },
  { id: "DN-2026-04820", enfant: "MBA Kevin Olivier", sexe: "M", naissance: "24/10/2026", declaration: "29/10/2026", statut: "EN_ATTENTE_VALIDATION", agent: "Agent03" },
  { id: "DN-2026-04819", enfant: "OBIANG Sarah", sexe: "F", naissance: "21/10/2026", declaration: "28/10/2026", statut: "VALIDE", agent: "Agent01" },
  { id: "DN-2026-04818", enfant: "MOUSSAVOU Grâce", sexe: "F", naissance: "02/09/2026", declaration: "28/10/2026", statut: "HORS_DELAI", agent: "Agent02" },
  { id: "DN-2026-04817", enfant: "NZÉ Junior Patrick", sexe: "M", naissance: "19/10/2026", declaration: "28/10/2026", statut: "ACTE_SIGNE", agent: "Agent03" },
  { id: "DN-2026-04816", enfant: "BOUSSOUGOU Ethan", sexe: "M", naissance: "18/10/2026", declaration: "27/10/2026", statut: "DOSSIER_DEPOSE", agent: "Agent02" },
  { id: "DN-2026-04815", enfant: "MINTSA Laure", sexe: "F", naissance: "15/10/2026", declaration: "27/10/2026", statut: "ACTE_ETABLI", agent: "Agent01" },
  { id: "DN-2026-04814", enfant: "ELLA Prince", sexe: "M", naissance: "11/08/2026", declaration: "27/10/2026", statut: "PROCEDURE_JUDICIAIRE", agent: "Agent02" },
];

export const aTraiter = [
  { label: "Actes à valider et signer", value: 23, path: "/naissances/en-attente", urgent: true },
  { label: "Jugements supplétifs à transcrire", value: 4, path: "/jugements" },
  { label: "Demandes de rectification", value: 3, path: "/rectifications" },
  { label: "Demandes de copie / extrait", value: 11, path: "/actes" },
  { label: "Alertes de doublon potentiel", value: 2, path: "/naissances", urgent: true },
];

export const activiteRecente = [
  { heure: "10:42", user: "Officier01", action: "a signé l'acte", ref: "N°2026-1254", type: "sign" },
  { heure: "10:31", user: "Agent03", action: "a transmis pour validation", ref: "DN-2026-04820", type: "send" },
  { heure: "10:15", user: "Agent01", action: "a créé la déclaration", ref: "DN-2026-04821", type: "create" },
  { heure: "09:58", user: "Officier01", action: "a transcrit le jugement", ref: "JS-2026-0087", type: "judge" },
  { heure: "09:40", user: "Agent02", action: "a délivré un extrait", ref: "N°2025-3310", type: "deliver" },
];

export const notifications = [
  { titre: "5 actes en attente depuis plus de 48 h", temps: "Il y a 10 min" },
  { titre: "Doublon potentiel : MBA Kevin Olivier", temps: "Il y a 32 min" },
  { titre: "Jugement JS-2026-0091 devenu définitif", temps: "Il y a 2 h" },
];

// Fiches des centres (section « Centre d'état civil » de la barre latérale)
export const CENTRES_INFO = {
  "Libreville — 1er arrondissement": { type: "Centre d'état civil", nom: "Libreville", sous: "1er arrondissement", province: "Estuaire", commune: "Libreville", code: "LBV1", registre: "REG-LBV1-N-2026", responsable: "OBAME Christian", actes: 1255, agents: 4 },
  "Libreville — 3e arrondissement": { type: "Centre d'état civil", nom: "Libreville", sous: "3e arrondissement", province: "Estuaire", commune: "Libreville", code: "LBV3", registre: "REG-LBV3-N-2026", responsable: "MBOUMBA Gisèle", actes: 744, agents: 3 },
  "Owendo": { type: "Centre d'état civil", nom: "Owendo", sous: "Commune d'Owendo", province: "Estuaire", commune: "Owendo", code: "OWE", registre: "REG-OWE-N-2026", responsable: "EYEGHE Patrice", actes: 521, agents: 2 },
  "Akanda": { type: "Centre d'état civil", nom: "Akanda", sous: "Commune d'Akanda", province: "Estuaire", commune: "Akanda", code: "AKA", registre: "REG-AKA-N-2026", responsable: "NDONG Bertrand", actes: 398, agents: 2 },
  "Ntoum": { type: "Centre d'état civil", nom: "Ntoum", sous: "Commune de Ntoum", province: "Estuaire", commune: "Ntoum", code: "NTO", registre: "REG-NTO-N-2026", responsable: "OSSA Line", actes: 187, agents: 1 },
  "Tous les centres": { type: "Supervision", nom: "Tous les centres", sous: "Province de l'Estuaire", province: "Estuaire", commune: "5 communes", code: "ALL", registre: "5 registres ouverts", responsable: "MOUNGUENGUI Alice", actes: 3105, agents: 12 },
  "Maternité de Libreville": { type: "Établissement de santé", nom: "Maternité de Libreville", sous: "Service de maternité", province: "Estuaire", commune: "Libreville", code: "MATLBV", registre: "Rattachée au centre LBV1", responsable: "Dr MBOUMBA Hélène", actes: 7, agents: 3, hopital: true },
};
