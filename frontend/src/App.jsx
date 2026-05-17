import { useState, useMemo, useEffect } from "react";
import "./App.css";



// ── Data & utilities ──────────────────────────────────────
import { INIT_TRADES, INIT_INV, INIT_WATCH } from "./data/initialData";
import { uid, nextTSN, findRecentTSN, loadFromStorage, saveToStorage } from "./utils/helpers";

// ── MeroShare auth ────────────────────────────────────────
import { useMeroShare } from "./context/MeroShareContext";
import { LoginScreen }  from "./components/LoginScreen";

// ── Tab components ────────────────────────────────────────
import { Dashboard }   from "./tabs/Dashboard";
import { Journal }     from "./tabs/Journal";
import { Investment }  from "./tabs/Investment";
import { Watchlist }   from "./tabs/Watchlist";
import { Losing }      from "./tabs/Losing";
import { MSPortfolio } from "./tabs/MSPortfolio";
import { MSIpos }      from "./tabs/MSIpos";
import { MSWacc }      from "./tabs/MSWacc";

// ── Modal components ───────────────────────────────────────
import { TradeDetailModal } from "./components/TradeDetailModal";
import { TradeFormModal }   from "./components/TradeFormModal";
import { InvDetailModal }   from "./components/InvDetailModal";
import { InvestFormModal }  from "./components/InvestFormModal";
import { WatchFormModal }   from "./components/WatchFormModal";

// ── Tab config ─────────────────────────────────────────────
const TABS = [
  { id: "dashboard",    label: "🏠 Dashboard"   },
  { id: "journal",      label: "📝 Journal"     },
  { id: "investment",   label: "💼 Investment"  },
  { id: "watchlist",    label: "👁 Watchlist"   },
  { id: "losing",       label: "📉 Losing"      },
  { id: "ms-portfolio", label: "🏦 MS Portfolio", ms: true },
  { id: "ms-ipos",      label: "📋 Open IPOs",    ms: true },
  { id: "ms-wacc",      label: "⚖ WACC",          ms: true },
];

// ══════════════════════════════════════════════════════════
export default function App() {
  const { isLoggedIn, profile, logout, hydrateProfile } = useMeroShare();

  // Restore profile from session token on mount
  useEffect(() => { hydrateProfile(); }, [hydrateProfile]);

  // ── State ────────────────────────────────────────────────
  const [tab,         setTab]         = useState("dashboard");
  const [trades,      setTrades]      = useState(() => loadFromStorage("trades",      INIT_TRADES));
  const [investments, setInvestments] = useState(() => loadFromStorage("investments", INIT_INV));
  const [watchlist,   setWatchlist]   = useState(() => loadFromStorage("watchlist",   INIT_WATCH));

  // MeroShare login overlay (only for MS tabs when not logged in)
  const [showLogin, setShowLogin] = useState(false);

  // Modal state
  const [tradeDetail, setTradeDetail] = useState(null);
  const [tradeForm,   setTradeForm]   = useState(null);
  const [invDetail,   setInvDetail]   = useState(null);
  const [invForm,     setInvForm]     = useState(null);
  const [watchForm,   setWatchForm]   = useState(null);

  // ── Auto-save ────────────────────────────────────────────
  useMemo(() => { saveToStorage("trades",      trades);      }, [trades]);
  useMemo(() => { saveToStorage("investments", investments); }, [investments]);
  useMemo(() => { saveToStorage("watchlist",   watchlist);   }, [watchlist]);

  // ── Trades CRUD ──────────────────────────────────────────
  const addTrade = d => setTrades(p => {
    const reuseTsn = findRecentTSN(p, d.scrip, d.boughtDate, 15);
    return [...p, { ...d, id: uid(), tsn: reuseTsn || nextTSN(p) }];
  });
  const updTrade = (id, d) => setTrades(p => p.map(t => t.id === id ? { ...t, ...d, tsn: t.tsn } : t));
  const delTrade = id      => setTrades(p => p.filter(t => t.id !== id));

  // ── Investments CRUD ─────────────────────────────────────
  const addInv   = d       => setInvestments(p => [...p, { ...d, id: uid() }]);
  const updInv   = (id, d) => setInvestments(p => p.map(i => i.id === id ? { ...i, ...d } : i));
  const delInv   = id      => setInvestments(p => p.filter(i => i.id !== id));

  // ── Watchlist CRUD ───────────────────────────────────────
  const addWatch  = d       => setWatchlist(p => [...p, { ...d, id: uid() }]);
  const updWatch  = (id, d) => setWatchlist(p => p.map(w => w.id === id ? { ...w, ...d } : w));
  const delWatch  = id      => setWatchlist(p => p.filter(w => w.id !== id));

  // ── Tab click: guard MS tabs behind login ─────────────────
  const handleTabClick = id => {
    const t = TABS.find(t => t.id === id);
    if (t?.ms && !isLoggedIn) { setShowLogin(true); return; }
    setShowLogin(false);
    setTab(id);
  };

  // After login succeeds, auto-navigate to the MS tab that triggered it
  const [pendingTab, setPendingTab] = useState(null);
  const handleTabClickGuarded = id => {
    const t = TABS.find(t => t.id === id);
    if (t?.ms && !isLoggedIn) { setPendingTab(id); setShowLogin(true); return; }
    setShowLogin(false);
    setTab(id);
  };

  useEffect(() => {
    if (isLoggedIn && pendingTab) {
      setTab(pendingTab);
      setPendingTab(null);
      setShowLogin(false);
    }
  }, [isLoggedIn, pendingTab]);

  // ── FAB handler ──────────────────────────────────────────
  const handleFAB = () => {
    if (tab === "journal" || tab === "losing") setTradeForm({ mode: "add", data: {} });
    else if (tab === "investment")             setInvForm({ mode: "add", data: {} });
    else if (tab === "watchlist")              setWatchForm({ mode: "add", data: {} });
  };

  const isMsTab     = tab.startsWith("ms-");
  const showFAB     = !isMsTab && tab !== "dashboard" && tab !== "losing";

  // ── Show login screen overlay ──────────────────────────────
  if (showLogin && !isLoggedIn) return <LoginScreen />;

  // ──────────────────────────────────────────────────────────
  return (
    <>
      {/* ── TOPBAR ── */}
      <header className="topbar">
        <div className="topbar__logo">
          <div className="topbar__icon">📊</div>
          <div>
            <div className="topbar__title">TradeLog</div>
            <div className="topbar__subtitle">Investment Journal &amp; Tracker</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isLoggedIn && (
            <button
              className="ms-profile-pill"
              onClick={logout}
              title="Click to logout from MeroShare"
            >
              <span className="ms-profile-dot" />
              {profile?.name || "MeroShare"}
              <span style={{ fontSize: 10, opacity: 0.7, marginLeft: 2 }}>✕</span>
            </button>
          )}
          <div className="topbar__date">
            {new Date().toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
          </div>
        </div>
      </header>

      {/* ── TABBAR ── */}
      <nav className="tabbar">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn${tab === t.id ? " tab-btn--active" : ""}${t.ms && !isLoggedIn ? " tab-btn--ms" : ""}`}
            onClick={() => handleTabClickGuarded(t.id)}
          >
            {t.label}
            {t.ms && !isLoggedIn && <span className="tab-lock">🔒</span>}
          </button>
        ))}
      </nav>

      {/* ── PAGE CONTENT ── */}
      <main className="page">
        {tab === "dashboard"    && <Dashboard   trades={trades} />}
        {tab === "journal"      && <Journal     trades={trades} onScripClick={setTradeDetail} />}
        {tab === "investment"   && <Investment  investments={investments} onScripClick={setInvDetail} />}
        {tab === "watchlist"    && <Watchlist   watchlist={watchlist} onEdit={w => setWatchForm({ mode: "edit", data: w })} onDelete={delWatch} />}
        {tab === "losing"       && <Losing      trades={trades} onScripClick={setTradeDetail} />}
        {tab === "ms-portfolio" && <MSPortfolio />}
        {tab === "ms-ipos"      && <MSIpos />}
        {tab === "ms-wacc"      && <MSWacc />}
      </main>

      {/* ── FAB ── */}
      {showFAB && (
        <button className="fab" onClick={handleFAB}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
          {tab === "investment" ? "Add Investment" : tab === "watchlist" ? "Add to Watchlist" : "Log Trade"}
        </button>
      )}

      {/* ── MODALS ── */}
      {tradeDetail && (
        <TradeDetailModal
          trade={tradeDetail}
          onEdit={t => { setTradeDetail(null); setTradeForm({ mode: "edit", data: t }); }}
          onDelete={id => { delTrade(id); setTradeDetail(null); }}
          onClose={() => setTradeDetail(null)}
        />
      )}
      {tradeForm && (
        <TradeFormModal
          mode={tradeForm.mode}
          init={tradeForm.data}
          onSave={d => { tradeForm.mode === "add" ? addTrade(d) : updTrade(tradeForm.data.id, d); setTradeForm(null); }}
          onClose={() => setTradeForm(null)}
        />
      )}
      {invDetail && (
        <InvDetailModal
          inv={invDetail}
          onEdit={i => { setInvDetail(null); setInvForm({ mode: "edit", data: i }); }}
          onDelete={id => { delInv(id); setInvDetail(null); }}
          onClose={() => setInvDetail(null)}
        />
      )}
      {invForm && (
        <InvestFormModal
          mode={invForm.mode}
          init={invForm.data}
          onSave={d => { invForm.mode === "add" ? addInv(d) : updInv(invForm.data.id, d); setInvForm(null); }}
          onClose={() => setInvForm(null)}
        />
      )}
      {watchForm && (
        <WatchFormModal
          mode={watchForm.mode}
          init={watchForm.data}
          onSave={d => { watchForm.mode === "add" ? addWatch(d) : updWatch(watchForm.data.id, d); setWatchForm(null); }}
          onClose={() => setWatchForm(null)}
        />
      )}
    </>
  );
}