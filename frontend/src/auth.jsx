import { createContext, useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { allMenuItems } from "./data/menu.js";

/** Comptes de démonstration (affichés sur la page de connexion). */
export const ACCOUNTS = [
  { role: "admin", identifiant: "Admin01", motDePasse: "admin123", nom: "MOUNGUENGUI Alice", initiales: "MA", centre: "Tous les centres" },
  { role: "officier", identifiant: "Officier01", motDePasse: "officier123", nom: "OBAME Christian", initiales: "OC", centre: "Libreville — 1er arrondissement" },
  { role: "agent", identifiant: "Agent01", motDePasse: "agent123", nom: "NZIENGUI Béatrice", initiales: "NB", centre: "Libreville — 1er arrondissement" },
  { role: "hopital", identifiant: "Hopital01", motDePasse: "hopital123", nom: "Maternité de Libreville", initiales: "ML", centre: "Maternité de Libreville" },
  { role: "consultation", identifiant: "Consult01", motDePasse: "consult123", nom: "LEYAMA Corinne", initiales: "LC", centre: "Akanda" },
];

export const ROLE_INFO = {
  admin: { label: "Administrateur", desc: "Utilisateurs, rôles, centres, paramètres, sauvegardes et journal" },
  officier: { label: "Officier d'état civil", desc: "Validation, signature, transcription, mentions et délivrance" },
  agent: { label: "Agent d'état civil", desc: "Réception, saisie, contrôle des pièces, numérisation et recherche" },
  hopital: { label: "Établissement de santé", desc: "Certificats de naissance transmis au centre d'état civil" },
  consultation: { label: "Consultation", desc: "Recherche et consultation des informations autorisées" },
};

const item = (path) => allMenuItems.find((i) => i.path === path);
export const canAccess = (path, role) => !!role && (item(path)?.roles ?? []).includes(role);
export const canWrite = (path, role) => !!role && (item(path)?.write ?? []).includes(role);

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function readSession() {
  try { return JSON.parse(sessionStorage.getItem("session") ?? "null"); } catch { return null; }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession);
  const login = (identifiant, motDePasse) => {
    const acc = ACCOUNTS.find((a) => a.identifiant.toLowerCase() === identifiant.trim().toLowerCase() && a.motDePasse === motDePasse);
    if (!acc) return null;
    const u = { ...acc, motDePasse: undefined, roleLabel: ROLE_INFO[acc.role].label };
    try { sessionStorage.setItem("session", JSON.stringify(u)); } catch { /* indisponible */ }
    setUser(u);
    return u;
  };
  const logout = () => {
    try { sessionStorage.removeItem("session"); } catch { /* indisponible */ }
    setUser(null);
  };
  // Changement de centre (administrateur : supervision de plusieurs centres)
  const setCentre = (centre) => {
    setUser((u) => {
      const next = { ...u, centre };
      try { sessionStorage.setItem("session", JSON.stringify(next)); } catch { /* indisponible */ }
      return next;
    });
  };
  return <AuthContext.Provider value={{ user, login, logout, setCentre }}>{children}</AuthContext.Provider>;
}

export function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/connexion" replace />;
}
