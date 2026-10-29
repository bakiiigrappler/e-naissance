import { Routes, Route, Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Verify from "./pages/Verify.jsx";
import Documents from "./pages/Documents.jsx";
import Placeholder from "./pages/Placeholder.jsx";
import ResourcePage from "./components/ResourcePage.jsx";
import EmptyState from "./components/EmptyState.jsx";
import { allMenuItems } from "./data/menu.js";
import { RequireAuth, canAccess, canWrite, useAuth } from "./auth.jsx";
import {
  declarations, declarationsHopital, actes, jugements, rectifications, mentions, registres, utilisateurs, journal, certificats,
} from "./data/resources.jsx";
import { DOCUMENTS } from "./documents/registry.jsx";
import { rowScope, docScope } from "./data/scope.js";

// Écrans branchés sur une liste complète (tableau + panneaux latéraux)
const PAGES = {
  "/certificats": { config: certificats, documents: DOCUMENTS.certificats },
  "/naissances": { config: declarations, documents: DOCUMENTS.declarations },
  "/naissances/nouvelle": { config: declarations, initialCreate: true, documents: DOCUMENTS.declarations },
  "/naissances/en-attente": { config: declarations, presetFilter: "attente", documents: DOCUMENTS.declarations },
  "/naissances/hors-delai": { config: declarations, presetFilter: "horsdelai", documents: DOCUMENTS.declarations },
  "/actes": { config: actes, documents: DOCUMENTS.actes },
  "/jugements": { config: jugements, documents: DOCUMENTS.jugements },
  "/rectifications": { config: rectifications, documents: DOCUMENTS.rectifications },
  "/mentions": { config: mentions, documents: DOCUMENTS.mentions },
  "/registres": { config: registres, documents: DOCUMENTS.registres },
  "/utilisateurs": { config: utilisateurs, documents: DOCUMENTS.utilisateurs },
  "/journal": { config: journal },
};

function Forbidden() {
  return (
    <div className="page">
      <div className="panel">
        <EmptyState icon={ShieldAlert} title="Accès non autorisé"
          text="Votre rôle ne permet pas d'accéder à cet écran. Contactez l'administrateur si vous pensez qu'il s'agit d'une erreur."
          action={<Link to="/" className="btn btn--primary"><ArrowLeft size={16} /> Retour au tableau de bord</Link>} />
      </div>
    </div>
  );
}

// Copie intégrale et extrait avec filiation : délivrance réservée (art. 175 du Code civil)
const docsCache = new Map();
function docsForRole(fn, role) {
  if (!fn) return undefined;
  const k = `${role}`;
  if (!docsCache.has(fn)) docsCache.set(fn, {});
  const byRole = docsCache.get(fn);
  if (!byRole[k]) byRole[k] = (row) => fn(row).filter(docScope({ role }));
  return byRole[k];
}

function Guarded({ path, label }) {
  const { user } = useAuth();
  if (!canAccess(path, user.role)) return <Forbidden />;
  if (path === "/documents") return <Documents />;
  const page = PAGES[path];
  if (!page) return <Placeholder title={label} />;
  // L'établissement de santé a sa propre vue des déclarations (ses naissances uniquement)
  const view = user.role === "hopital" && path.startsWith("/naissances") ? { ...page, config: declarationsHopital } : page;
  const source = path.startsWith("/naissances") ? "declarations" : path.slice(1);
  return <ResourcePage key={path} {...view} rowFilter={rowScope(source, user)} documents={docsForRole(view.documents, user.role)} readOnly={!canWrite(path, user.role)} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Login />} />
      <Route path="/verifier" element={<Verify />} />
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        {allMenuItems
          .filter((item) => item.path !== "/")
          .map((item) => <Route key={item.path} path={item.path} element={<Guarded path={item.path} label={item.label} />} />)}
        <Route path="*" element={<Placeholder title="Page introuvable" />} />
      </Route>
    </Routes>
  );
}
