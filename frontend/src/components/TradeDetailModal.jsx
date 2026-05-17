import { fmt, pctRet, holdDays, tradePL } from "../utils/helpers";
import "./modals.css";

// -- TRADE DETAIL MODAL ------------------------------------------------
// Props:
//   trade    – trade object to display
//   onEdit   – called with the trade to open edit form
//   onDelete – called with trade.id
//   onClose  – dismiss the modal

export function TradeDetailModal({ trade, onEdit, onDelete, onClose }) {
  const isGroup = Array.isArray(trade?.trades);
  const trades = isGroup ? trade.trades : [trade];
  const totalPL = trades.reduce((sum, t) => sum + (tradePL(t) || 0), 0);
  const pos = totalPL >= 0;
  const firstTrade = trades[0] || {};
  const hd = !isGroup ? holdDays(firstTrade.boughtDate, firstTrade.soldDate) : null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <div>
            <div className="modal__scrip">{firstTrade.scrip || trade.scrip}</div>
            <div className="modal__tid">{isGroup ? `Trade Group · ${trade.tsn}` : `Trade ID · ${trade.tsn}`}</div>
          </div>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="modal__divider" />

                {isGroup ? (
          <>
            <div className={`pl-footer ${pos ? "pl-footer--profit" : "pl-footer--loss"}`}>
              <span className="pl-footer__emoji">📊</span>
              <div>
                <div className={`pl-footer__label pl-footer__label--${pos ? "profit" : "loss"}`}>
                  {trades.length} trades under the same TSN
                </div>
                <div className="pl-footer__sub">
                  Total P&L: {pos ? "+" : "-"}₹{fmt(Math.abs(totalPL))}
                </div>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {['Quantity','Bought Date','Sold Date','R-R','Remarks','Holding Days','P&L'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trades.map(t => {
                    const plRow = tradePL(t);
                    const posRow = plRow != null ? plRow >= 0 : null;
                    const hdRow = holdDays(t.boughtDate, t.soldDate);
                    return (
                      <tr key={t.id}>
                        <td>{t.qty}</td>
                        <td className="td--mono">{t.boughtDate || "—"}</td>
                        <td className="td--mono">{t.soldDate || "—"}</td>
                        <td><span className="rr-badge">{t.rr || "—"}</span></td>
                        <td className="td--subtle">{t.remarks || "—"}</td>
                        <td className="td--mono">{hdRow}{hdRow !== "—" ? " days" : ""}</td>
                        <td className={plRow != null ? (posRow ? "td--profit" : "td--loss") : "td--empty"}>
                          {plRow != null ? `${posRow ? "+" : "-"}₹${fmt(Math.abs(plRow))}` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {['Quantity','Bought Date','Sold Date','R-R','Remarks','Holding Days','P&L'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{firstTrade.qty}</td>
                  <td className="td--mono">{firstTrade.boughtDate || "—"}</td>
                  <td className="td--mono">{firstTrade.soldDate || "—"}</td>
                  <td><span className="rr-badge">{firstTrade.rr || "—"}</span></td>
                  <td className="td--subtle">{firstTrade.remarks || "—"}</td>
                  <td className="td--mono">{hd}{hd !== "—" ? " days" : ""}</td>
                  <td className={totalPL != null ? (pos ? "td--profit" : "td--loss") : "td--empty"}>
                    {totalPL != null ? `${pos ? "+" : "-"}₹${fmt(Math.abs(totalPL))}` : "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {!isGroup && totalPL != null && (
          <div className={`pl-footer ${pos ? "pl-footer--profit" : "pl-footer--loss"}`}>
            <span className="pl-footer__emoji">{pos ? "📈" : "📉"}</span>
            <div>
              <div className={`pl-footer__label pl-footer__label--${pos ? "profit" : "loss"}`}>
                {pos ? "Profitable Trade" : "Loss Trade"}
              </div>
              <div className="pl-footer__sub">
                Return: {pctRet(totalPL, firstTrade.buyAmt)} · Invested ₹{fmt(firstTrade.buyAmt)}
              </div>
            </div>
          </div>
        )}

        <div className="modal__actions">
          {!isGroup && (
            <button className="btn btn--danger" onClick={() => { onDelete(firstTrade.id); onClose(); }}>
              🗑 Delete
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button className="btn btn--ghost" onClick={onClose}>Close</button>
          {!isGroup && (
            <button className="btn btn--edit" onClick={() => { onClose(); onEdit(firstTrade); }}>✏ Edit</button>
          )}
        </div>
      </div>
    </div>
  );
}
