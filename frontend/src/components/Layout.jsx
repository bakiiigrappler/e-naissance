import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu, X, Search, Bell, LogOut, ChevronLeft, ChevronRight, ChevronsUpDown, Moon, Sun, CornerDownLeft,
  MapPin, FilePlus2, Clock3, ShieldCheck, Home, CalendarDays, ChevronDown, UserRound,
} from "lucide-react";
import Logo from "./Logo.jsx";
import { FlagStripe } from "./Brand.jsx";
import ConfirmModal from "./ConfirmModal.jsx";
import CentreCard from "./CentreCard.jsx";
import { allMenuItems, menuForRole, menuGroups } from "../data/menu.js";
import { notifications } from "../data/mock.js";
import { useAuth, canAccess } from "../auth.jsx";

function readPref(key, fallback) {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
function writePref(key, value) {
  try { localStorage.setItem(key, value); } catch { /* stockage indisponible */ }
}

const ROLE_TONE = { admin: "dark", officier: "navy", agent: "blue", consultation: "muted", hopital: "green" };

function Sidebar({ user, open, collapsed, onClose, onToggleCollapse, onLogout, onCentreChange }) {
  const groups = menuForRole(user.role);
  return (
    <>
      <aside className={`sidebar ${open ? "is-open" : ""} ${collapsed ? "is-collapsed" : ""}`}>
        <div className="sidebar__card">
          <FlagStripe className="sidebar__stripe" />

          <div className="sidebar__brand">
            <Logo collapsed={collapsed} />
            <button className="icon-btn sidebar__close" onClick={onClose} aria-label="Fermer le menu"><X size={20} /></button>
          </div>

          <button className="sidebar__toggle" onClick={onToggleCollapse} aria-label={collapsed ? "Déplier le menu" : "Réduire le menu"}>
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          <CentreCard user={user} collapsed={collapsed} onChange={onCentreChange} />

          <nav className="sidebar__nav">
            {groups.map((group, i) => (
              <div key={i} className="sidebar__group">
                {group.title && (collapsed ? <div className="sidebar__sep" /> : <div className="sidebar__group-title">{group.title}</div>)}
                {group.items.map(({ path, label, icon: Icon, badge, badgeTone }) => (
                  <NavLink key={path} to={path} end onClick={onClose} title={collapsed ? label : undefined}
                    className={({ isActive }) => `sidebar__link ${isActive ? "is-active" : ""}`}>
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span layoutId="nav-active" className="sidebar__active"
                            transition={{ type: "spring", stiffness: 420, damping: 34 }}>
                            <span className="sidebar__active-flag"><i /><i /><i /></span>
                          </motion.span>
                        )}
                        <span className="sidebar__icon"><Icon size={18} /></span>
                        {!collapsed && <span className="sidebar__label">{label}</span>}
                        {badge ? <span className={`sidebar__badge sidebar__badge--${badgeTone ?? "default"}`}>{badge}</span> : null}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          <div className="sidebar__user">
            <div className="avatar">{user.initiales}<span className="avatar__online" /></div>
            {!collapsed && (
              <div className="sidebar__user-text">
                <div className="sidebar__user-name">{user.identifiant}</div>
                <div className="sidebar__user-role">{user.roleLabel}</div>
              </div>
            )}
            <button className="icon-btn sidebar__logout" title="Déconnexion" aria-label="Déconnexion" onClick={onLogout}>
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      <AnimatePresence>
        {open && (
          <motion.div className="overlay" onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
        )}
      </AnimatePresence>
    </>
  );
}

function CommandPalette({ role, open, onClose }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const results = allMenuItems.filter((i) => i.roles.includes(role) && i.label.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => {
    if (open) { setQ(""); setTimeout(() => inputRef.current?.focus(), 30); }
  }, [open]);

  const go = (path) => { navigate(path); onClose(); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="palette-backdrop" onClick={onClose}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="palette" onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: -16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.18 }}>
            <div className="palette__search">
              <Search size={18} />
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Aller à un écran…"
                onKeyDown={(e) => { if (e.key === "Enter" && results[0]) go(results[0].path); if (e.key === "Escape") onClose(); }} />
              <kbd>Échap</kbd>
            </div>
            <ul className="palette__list">
              {results.map(({ path, label, icon: Icon }, i) => (
                <li key={path}>
                  <button className={`palette__item ${i === 0 ? "is-first" : ""}`} onClick={() => go(path)}>
                    <Icon size={17} /> <span>{label}</span>
                    {i === 0 && <CornerDownLeft size={15} className="palette__enter" />}
                  </button>
                </li>
              ))}
              {results.length === 0 && <li className="palette__empty">Aucun résultat pour « {q} »</li>}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function useClickOutside(ref, onOutside, active) {
  useEffect(() => {
    if (!active) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) onOutside(); };
    const onKey = (e) => { if (e.key === "Escape") onOutside(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [ref, onOutside, active]);
}

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  return now;
}

function Topbar({ user, onMenu, onSearch, theme, onTheme, onLogout }) {
  const [menu, setMenu] = useState(null); // null | "notif" | "user"
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const location = useLocation();
  const now = useClock();
  const close = () => setMenu(null);
  useClickOutside(notifRef, close, menu === "notif");
  useClickOutside(userRef, close, menu === "user");

  const group = menuGroups.find((g) => g.items.some((i) => i.path === location.pathname));
  const current = allMenuItems.find((i) => i.path === location.pathname);
  const date = now.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
  const time = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <header className="topbar">
      <button className="icon-btn topbar__menu" onClick={onMenu} aria-label="Ouvrir le menu"><Menu size={22} /></button>

      <div className="topbar__heading">
        <div className="topbar__crumbs">
          <Home size={13} />
          <ChevronRight size={12} className="topbar__sep" />
          <span>{group?.title ?? "Accueil"}</span>
        </div>
        <motion.div key={location.pathname} className="topbar__page" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          {current?.label ?? "Page"}
        </motion.div>
      </div>

      <button className="topbar__search" onClick={onSearch}>
        <Search size={17} />
        <span>Rechercher un écran, une action…</span>
        <kbd>Ctrl</kbd><kbd>K</kbd>
      </button>

      <div className="topbar__right">
        {canAccess("/naissances/nouvelle", user.role) && (
          <Link to="/naissances/nouvelle" className="btn btn--primary topbar__cta"><FilePlus2 size={16} /> <span>Nouvelle déclaration</span></Link>
        )}

        <div className="topbar__tools">
          <span className="topbar__clock" title="Date et heure"><CalendarDays size={15} /> <span className="topbar__date">{date}</span> <strong>{time}</strong></span>
          <span className="topbar__divider" />
          <button className="tool-btn" onClick={onTheme} aria-label="Changer de thème" title={theme === "dark" ? "Thème clair" : "Thème sombre"}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }} style={{ display: "grid" }}>
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </motion.span>
            </AnimatePresence>
          </button>
          <div className="topbar__pop" ref={notifRef}>
            <button className={`tool-btn ${menu === "notif" ? "is-open" : ""}`} onClick={() => setMenu(menu === "notif" ? null : "notif")} aria-label="Notifications" aria-expanded={menu === "notif"}>
              <Bell size={18} />
              <span className="tool-btn__count">{notifications.length}</span>
            </button>
            <AnimatePresence>
              {menu === "notif" && (
                <motion.div className="dropdown" initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16 }}>
                  <div className="dropdown__head">Notifications <span className="dropdown__badge">{notifications.length} nouvelles</span></div>
                  {notifications.map((n, i) => (
                    <motion.div key={n.titre} className="dropdown__item" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <span className={`dropdown__dot dropdown__dot--${["yellow", "alert", "green"][i % 3]}`} />
                      <div>
                        <div className="dropdown__title">{n.titre}</div>
                        <div className="dropdown__time">{n.temps}</div>
                      </div>
                    </motion.div>
                  ))}
                  <button className="dropdown__foot" onClick={close}>Tout marquer comme lu</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="topbar__pop" ref={userRef}>
          <button className={`user-chip ${menu === "user" ? "is-open" : ""}`} onClick={() => setMenu(menu === "user" ? null : "user")} aria-expanded={menu === "user"}>
            <span className="avatar avatar--sm">{user.initiales}<span className="avatar__online" /></span>
            <span className="user-chip__text">
              <span className="user-chip__name">{user.identifiant}</span>
              <span className="user-chip__role">{user.roleLabel}</span>
            </span>
            <ChevronDown size={16} className="user-chip__chev" />
          </button>
          <AnimatePresence>
            {menu === "user" && (
              <motion.div className="dropdown umenu" initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16 }}>
                <div className="umenu__head">
                  <span className="avatar avatar--lg">{user.initiales}</span>
                  <div className="umenu__who">
                    <strong>{user.nom}</strong>
                    <span>{user.centre}</span>
                    <span className={`badge badge--${ROLE_TONE[user.role]}`}><ShieldCheck size={12} /> {user.roleLabel}</span>
                  </div>
                </div>
                <FlagStripe className="umenu__stripe" />
                <button className="umenu__item" onClick={close}><UserRound size={16} /> Mon profil</button>
                <button className="umenu__item" onClick={() => { onTheme(); }}>{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />} Thème {theme === "dark" ? "clair" : "sombre"}</button>
                <button className="umenu__item" onClick={() => { close(); onSearch(); }}><Search size={16} /> Recherche rapide <kbd>Ctrl K</kbd></button>
                <button className="umenu__item umenu__item--danger" onClick={() => { close(); onLogout(); }}><LogOut size={16} /> Déconnexion</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

export default function Layout() {
  const { user, logout, setCentre } = useAuth();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => readPref("sidebar", "open") === "collapsed");
  const [theme, setTheme] = useState(() => readPref("theme", "light"));
  const [palette, setPalette] = useState(false);
  const [logoutState, setLogoutState] = useState("closed"); // closed | open | loading
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    writePref("theme", theme);
  }, [theme]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((v) => !v); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleCollapse = () => {
    setCollapsed((c) => { writePref("sidebar", c ? "open" : "collapsed"); return !c; });
  };

  const confirmLogout = () => {
    setLogoutState("loading");
    // Démonstration : ici on invalidera la session côté serveur.
    setTimeout(() => { logout(); navigate("/connexion"); }, 1300);
  };

  if (!user) return null;

  return (
    <div className={`app ${collapsed ? "app--collapsed" : ""}`}>
      <Sidebar user={user} open={open} collapsed={collapsed} onClose={() => setOpen(false)} onToggleCollapse={toggleCollapse}
        onLogout={() => { setOpen(false); setLogoutState("open"); }} onCentreChange={setCentre} />
      <div className="main">
        <Topbar user={user} onMenu={() => setOpen(true)} onSearch={() => setPalette(true)}
          theme={theme} onTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          onLogout={() => setLogoutState("open")} />
        <AnimatePresence mode="wait">
          <motion.main key={location.pathname} className="content"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: "easeOut" }}>
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
      <CommandPalette role={user.role} open={palette} onClose={() => setPalette(false)} />
      <ConfirmModal
        open={logoutState !== "closed"} loading={logoutState === "loading"} danger icon={LogOut}
        title="Se déconnecter ?" subtitle="Fin de la session en cours"
        message="Les saisies non enregistrées seront perdues. Vous devrez vous identifier à nouveau pour accéder à l'application."
        loadingLabel="Fermeture de la session…"
        confirmLabel="Se déconnecter" cancelLabel="Rester connecté"
        onConfirm={confirmLogout} onCancel={() => setLogoutState("closed")}>
        <div className="session-card">
          <div className="avatar">{user.initiales}</div>
          <div className="session-card__text">
            <strong>{user.nom}</strong>
            <span>{user.roleLabel} · {user.centre}</span>
          </div>
          <span className="session-card__time"><Clock3 size={13} /> Connecté</span>
        </div>
      </ConfirmModal>
    </div>
  );
}
