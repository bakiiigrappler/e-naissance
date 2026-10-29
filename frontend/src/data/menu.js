import {
  LayoutDashboard, FilePlus2, ListChecks, Clock, AlertTriangle, FileText, Gavel,
  PenLine, BookMarked, Library, BarChart3, Users, History, Settings, Stethoscope, FolderOpen,
} from "lucide-react";

// Rôles : admin, officier, agent, consultation (cahier des charges, sections 4 et 21)
// roles = qui voit l'écran ; write = qui peut créer / modifier
const ALL = ["admin", "officier", "agent", "consultation", "hopital"];
const TERRAIN = ["officier", "agent"];

// Menus de l'application (cahier des charges, section 26)
export const menuGroups = [
  {
    title: null,
    items: [
      { path: "/", label: "Tableau de bord", icon: LayoutDashboard, roles: ALL },
      { path: "/documents", label: "Documents", icon: FolderOpen, roles: ALL },
    ],
  },
  {
    title: "Naissances",
    items: [
      { path: "/certificats", label: "Certificats de naissance", icon: Stethoscope, badge: 2, badgeTone: "yellow", roles: ["hopital", "officier", "agent"], write: ["hopital"] },
      // hiddenFor : écran accessible (bouton « Nouvelle déclaration ») mais absent du menu pour ces rôles
      { path: "/naissances/nouvelle", label: "Nouvelle déclaration", icon: FilePlus2, roles: [...TERRAIN, "hopital"], write: [...TERRAIN, "hopital"], hiddenFor: ["hopital"] },
      { path: "/naissances", label: "Liste des déclarations", labelFor: { hopital: "Déclarations de naissance" }, icon: ListChecks, roles: [...TERRAIN, "hopital"], write: [...TERRAIN, "hopital"] },
      { path: "/naissances/en-attente", label: "Dossiers en attente", icon: Clock, badge: 3, badgeTone: "yellow", roles: TERRAIN, write: TERRAIN },
      { path: "/naissances/hors-delai", label: "Dossiers hors délai", icon: AlertTriangle, badge: 2, badgeTone: "alert", roles: TERRAIN, write: TERRAIN },
    ],
  },
  {
    title: "Actes et procédures",
    items: [
      { path: "/actes", label: "Actes de naissance", icon: FileText, roles: ["officier", "agent", "consultation"] },
      { path: "/jugements", label: "Jugements", icon: Gavel, roles: TERRAIN, write: TERRAIN },
      { path: "/rectifications", label: "Rectifications", icon: PenLine, roles: TERRAIN, write: ["officier"] },
      { path: "/mentions", label: "Mentions marginales", icon: BookMarked, roles: TERRAIN, write: ["officier"] },
      { path: "/registres", label: "Registres", icon: Library, roles: ["admin", "officier", "agent"], write: ["admin"] },
    ],
  },
  {
    title: "Administration",
    items: [
      { path: "/statistiques", label: "Statistiques", icon: BarChart3, roles: ["admin", "officier"] },
      { path: "/utilisateurs", label: "Utilisateurs", icon: Users, roles: ["admin"], write: ["admin"] },
      { path: "/journal", label: "Journal d'activité", icon: History, roles: ["admin", "officier"] },
      { path: "/parametres", label: "Paramètres", icon: Settings, roles: ["admin"] },
    ],
  },
];

export const allMenuItems = menuGroups.flatMap((g) => g.items);

export const menuForRole = (role) =>
  menuGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => i.roles.includes(role) && !i.hiddenFor?.includes(role)).map((i) => ({ ...i, label: i.labelFor?.[role] ?? i.label })) }))
    .filter((g) => g.items.length > 0);
