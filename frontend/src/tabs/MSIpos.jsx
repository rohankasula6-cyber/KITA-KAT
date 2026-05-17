// MSIpos.jsx — Open IPO / FPO issues from MeroShare
import { useState, useEffect } from "react";
import { useMeroShare } from "../context/MeroShareContext";
import "./MeroShare.css";

export function MSIpos() {
  const { fetchIpos, logout } = useMeroShare();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchIpos()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [fetchIpos]);

  if (loading) return <div className="ms-state">⏳ Loading open issues…</div>;
  if (error)   return (
    <div className="ms-state ms-state--err">
      ⚠ {error}
      {error.toLowerCase().includes("token") && (
        <button className="ms-relogin" onClick={logout}>Re-login</button>
      )}
    </div>
  );

  const issues = data?.issues || [];

  const typeColor = t => {
    if (!t) return "badge--default";
    const l = t.toLowerCase();
    if (l.includes("ipo"))    return "badge--banking";
    if (l.includes("fpo"))    return "badge--finance";
    if (l.includes("rights")) return "badge--it";
    if (l.includes("mutual")) return "badge--gold";
    return "badge--default";
  };

  return (
    <div className="ms-wrap">
      {/* Stats */}
      <div className="stat-grid ms-summary">
        <div className="stat-card">
          <div className="stat-card__label">Open Issues</div>
          <div className="stat-card__value v--blue">{issues.length}</div>
          <div className="stat-card__sub">Currently applicable</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">IPO</div>
          <div className="stat-card__value">
            {issues.filter(i => (i.shareTypeName || i.issueType || "").toLowerCase().includes("ipo")).length}
          </div>
          <div className="stat-card__sub">Initial Public Offers</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">FPO / Rights</div>
          <div className="stat-card__value v--purple">
            {issues.filter(i => {
              const t = (i.shareTypeName || i.issueType || "").toLowerCase();
              return t.includes("fpo") || t.includes("rights");
            }).length}
          </div>
          <div className="stat-card__sub">Further offerings</div>
        </div>
      </div>

      {/* Table */}
      <div className="card--np ms-card">
        <div className="card__header">
          <div>
            <div className="card__title">Open IPO / FPO Issues</div>
            <div className="card__sub">Currently applicable issues on MeroShare</div>
          </div>
          <div className="card__count">{issues.length} total</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Script</th>
                <th>Company</th>
                <th>Type</th>
                <th>Group</th>
                <th>Open Date</th>
                <th>Close Date</th>
              </tr>
            </thead>
            <tbody>
              {issues.length === 0 && (
                <tr><td colSpan={7} className="td--empty">No open issues right now.</td></tr>
              )}
              {issues.map((iss, i) => {
                const scrip   = iss.scrip || iss.script || "—";
                const name    = iss.companyName || iss.name || "—";
                const type    = iss.shareTypeName || iss.issueType || "—";
                const group   = iss.shareGroupName || "—";
                return (
                  <tr key={i}>
                    <td className="td--muted">{i + 1}</td>
                    <td><span className="scrip-btn" style={{ cursor: "default" }}>{scrip}</span></td>
                    <td className="td--bold">{name}</td>
                    <td><span className={`badge ${typeColor(type)}`}>{type}</span></td>
                    <td className="td--muted">{group}</td>
                    <td className="td--mono">{iss.issueOpenDate  || "—"}</td>
                    <td className="td--mono">{iss.issueCloseDate || "—"}</td>
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
