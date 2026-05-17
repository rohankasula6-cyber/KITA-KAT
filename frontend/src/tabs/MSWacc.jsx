// MSWacc.jsx — WACC purchase history from MeroShare
import { useState, useEffect } from "react";
import { useMeroShare } from "../context/MeroShareContext";
import { fmt } from "../utils/helpers";
import "./MeroShare.css";

export function MSWacc() {
  const { fetchWacc, logout } = useMeroShare();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [filter,  setFilter]  = useState("");

  useEffect(() => {
    setLoading(true);
    fetchWacc()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [fetchWacc]);

  if (loading) return <div className="ms-state">⏳ Fetching WACC data (may take a moment)…</div>;
  if (error)   return (
    <div className="ms-state ms-state--err">
      ⚠ {error}
      {error.toLowerCase().includes("token") && (
        <button className="ms-relogin" onClick={logout}>Re-login</button>
      )}
    </div>
  );

  const wacc = (data?.wacc || []).filter(r =>
    !filter || (r.scrip || "").toLowerCase().includes(filter.toLowerCase())
  );

  // Group by scrip to show unique scripts count
  const uniqueScrips = [...new Set((data?.wacc || []).map(r => r.scrip))].filter(Boolean);

  return (
    <div className="ms-wrap">
      {/* Stats */}
      <div className="stat-grid ms-summary">
        <div className="stat-card">
          <div className="stat-card__label">Scripts</div>
          <div className="stat-card__value v--blue">{uniqueScrips.length}</div>
          <div className="stat-card__sub">Unique scripts with WACC</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Total Transactions</div>
          <div className="stat-card__value">{data?.wacc?.length || 0}</div>
          <div className="stat-card__sub">Purchase records</div>
        </div>
      </div>

      {/* Table */}
      <div className="card--np ms-card">
        <div className="card__header">
          <div>
            <div className="card__title">WACC Purchase History</div>
            <div className="card__sub">Weighted Average Cost of Capital per scrip</div>
          </div>
          <input
            className="ms-search"
            placeholder="Filter by scrip…"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Script</th>
                <th>ISIN</th>
                <th>Qty</th>
                <th>Rate (NPR)</th>
                <th>Source</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {wacc.length === 0 && (
                <tr><td colSpan={7} className="td--empty">No WACC records found.</td></tr>
              )}
              {wacc.map((r, i) => {
                const date = r.transactionDate ? r.transactionDate.split("T")[0] : "—";
                return (
                  <tr key={i}>
                    <td className="td--muted">{i + 1}</td>
                    <td><span className="scrip-btn" style={{ cursor: "default" }}>{r.scrip || "—"}</span></td>
                    <td className="td--muted td--mono" style={{ fontSize: 11 }}>{r.isin || "—"}</td>
                    <td className="td--mono">{r.transactionQuantity ?? "—"}</td>
                    <td className="td--mono td--bold">NPR {fmt(r.rate)}</td>
                    <td>
                      <span className="badge badge--default">{r.purchaseSource || "—"}</span>
                    </td>
                    <td className="td--mono">{date}</td>
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
