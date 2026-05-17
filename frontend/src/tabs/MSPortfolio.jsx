// MSPortfolio.jsx — MeroShare live portfolio tab
import { useState, useEffect } from "react";
import { useMeroShare } from "../context/MeroShareContext";
import { fmt } from "../utils/helpers";
import "./MeroShare.css";

export function MSPortfolio() {
  const { fetchPortfolio, logout } = useMeroShare();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchPortfolio()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [fetchPortfolio]);

  if (loading) return <div className="ms-state">⏳ Loading portfolio…</div>;
  if (error)   return (
    <div className="ms-state ms-state--err">
      ⚠ {error}
      {error.toLowerCase().includes("token") && (
        <button className="ms-relogin" onClick={logout}>Re-login</button>
      )}
    </div>
  );

  const { holdings = [], totalCostPrice = 0, totalValueOfLastTransPrice = 0 } = data || {};
  const gain = totalValueOfLastTransPrice - totalCostPrice;

  return (
    <div className="ms-wrap">
      {/* Summary cards */}
      <div className="stat-grid ms-summary">
        <div className="stat-card">
          <div className="stat-card__label">Total Cost</div>
          <div className="stat-card__value v--blue">NPR {fmt(totalCostPrice)}</div>
          <div className="stat-card__sub">Amount invested</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Market Value</div>
          <div className="stat-card__value">{fmt(totalValueOfLastTransPrice)}</div>
          <div className="stat-card__sub">Current valuation</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Unrealized P&amp;L</div>
          <div className={`stat-card__value ${gain >= 0 ? "v--profit" : "v--loss"}`}>
            {gain >= 0 ? "+" : ""}NPR {fmt(gain)}
          </div>
          <div className="stat-card__sub">Market − Cost</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Holdings</div>
          <div className="stat-card__value v--purple">{holdings.length}</div>
          <div className="stat-card__sub">Unique scripts</div>
        </div>
      </div>

      {/* Table */}
      <div className="card--np ms-card">
        <div className="card__header">
          <div>
            <div className="card__title">MeroShare Portfolio</div>
            <div className="card__sub">Live data from your CDSC demat account</div>
          </div>
          <div className="card__count">{holdings.length} scripts</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Script</th>
                <th>Qty</th>
                <th>LTP (NPR)</th>
                <th>Total Value (NPR)</th>
                <th>Free Balance</th>
              </tr>
            </thead>
            <tbody>
              {holdings.length === 0 && (
                <tr><td colSpan={6} className="td--empty">No holdings found.</td></tr>
              )}
              {holdings.map((h, i) => {
                const scrip = h.script || h.scrip;
                const val   = h.valueOfLastTransPrice || 0;
                return (
                  <tr key={i}>
                    <td className="td--muted">{i + 1}</td>
                    <td><span className="scrip-btn" style={{ cursor: "default" }}>{scrip}</span></td>
                    <td className="td--mono">{h.currentBalance}</td>
                    <td className="td--mono">{fmt(h.lastTransactionPrice)}</td>
                    <td className="td--mono td--bold">NPR {fmt(val)}</td>
                    <td className="td--mono td--muted">{h.freeBalance ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
