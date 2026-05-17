import { fmt, holdDays } from "../utils/helpers";
import "./Investment.css";

// ── INVESTMENT TAB ────────────────────────────────────────
// Props:
//   investments  – array of investment objects
//   onScripClick – open group detail modal: called with { scrip, investments: [...] }
//
// Grouping logic (mirrors Journal's TSN grouping):
//   • Sort by boughtDate then scrip (stable, unchanged)
//   • Rows with the same scrip name are grouped together visually
//   • SN is shown only on the FIRST row of each group; subsequent rows are blank SN
//   • SCRIP button appears only on the first row; clicking opens the group modal
//   • No 15-day window – ALL entries sharing the same scrip name are one group

export function Investment({ investments, onScripClick }) {
  const holdingCount = investments.filter(i => !i.soldDate).length;
  const soldCount    = investments.filter(i => !!i.soldDate).length;

  // Preserve original sort: date asc, then scrip asc
  const sortedInvestments = [...investments].sort((a, b) => {
    const dateCompare = (a.boughtDate || "").localeCompare(b.boughtDate || "");
    return dateCompare || (a.scrip || "").localeCompare(b.scrip || "");
  });

  // Track scrip-group serial numbers (one SN per unique scrip)
  // We do a single pass to assign a stable group number per scrip
  const scripSnMap = {};
  let snCounter = 0;
  sortedInvestments.forEach(inv => {
    const key = (inv.scrip || "").trim().toUpperCase();
    if (!(key in scripSnMap)) scripSnMap[key] = ++snCounter;
  });

  let lastScrip = null;

  return (
    <div className="card--np">
      <div className="card__header">
        <div>
          <div className="card__title">Investment Portfolio</div>
          <div className="card__sub">Click any SCRIP to view all entries · Edit · Delete</div>
        </div>
        <div className="inv-badges">
          <span className="status-badge sb--holding">⬤ {holdingCount} Holding</span>
          <span className="status-badge sb--sold">✓ {soldCount} Sold</span>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>SN</th>
              <th>SCRIP</th>
              <th>Quantity</th>
              <th>Buy Rate</th>
              <th>Bought Date</th>
              <th>Bought Amount</th>
              <th>Holding Days</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedInvestments.length === 0 && (
              <tr>
                <td colSpan={8} className="td--empty">No investments yet</td>
              </tr>
            )}
            {sortedInvestments.map((inv) => {
              const key        = (inv.scrip || "").trim().toUpperCase();
              const isNewGroup = key !== lastScrip;
              lastScrip        = key;

              const isSold = !!inv.soldDate;
              const d      = holdDays(inv.boughtDate, inv.soldDate);
              const sn     = scripSnMap[key];

              // When clicking the scrip, gather all investments in this group
              const handleScripClick = isNewGroup
                ? () => {
                    const groupInvs = sortedInvestments.filter(
                      i => (i.scrip || "").trim().toUpperCase() === key
                    );
                    onScripClick({ scrip: inv.scrip, investments: groupInvs });
                  }
                : undefined;

              return (
                <tr key={inv.id} className={isNewGroup ? "inv-row--group-start" : "inv-row--group-cont"}>
                  {/* SN: show only on first row of each group */}
                  <td className="td--muted">{isNewGroup ? sn : ""}</td>

                  {/* SCRIP: button only on first row */}
                  <td>
                    {isNewGroup ? (
                      <button className="scrip-btn" onClick={handleScripClick}>
                        {inv.scrip}
                      </button>
                    ) : null}
                  </td>

                  <td>{inv.qty}</td>
                  <td className="td--mono">₹{fmt(inv.buyRate)}</td>
                  <td className="td--mono">{inv.boughtDate}</td>
                  <td className="td--mono">₹{fmt(inv.buyAmt)}</td>
                  <td className="td--mono inv-days">{d}{d !== "—" ? "d" : ""}</td>
                  <td>
                    {isSold
                      ? <span className="status-badge sb--sold">✓ Sold</span>
                      : <span className="status-badge sb--holding">⬤ Holding</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}