import "../../../styles/analytics.css";

/**
 * Reusable analytics table component
 */
const AnalyticsTable = ({ columns, data, maxHeight = "500px", highlight = false }) => {
  if (!data || data.length === 0) {
    return (
      <div className="table-empty">
        <p>Aucune données disponibles</p>
      </div>
    );
  }

  return (
    <div className="analytics-table-wrapper" style={{ maxHeight }}>
      <table className="analytics-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  width: col.width,
                  textAlign: col.align || "left",
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className={highlight && idx % 2 === 0 ? "highlighted" : ""}>
              {columns.map((col) => (
                <td
                  key={`${idx}-${col.key}`}
                  data-label={col.label}
                  style={{
                    width: col.width,
                    textAlign: col.align || "left",
                  }}
                  className={col.key === "status" ? "status-cell" : ""}
                >
                  {col.key === "status" ? (
                    <span className={`status-badge ${row[col.key]?.includes("Converti") ? "converted" : "visitor"}`}>
                      {row[col.key]}
                    </span>
                  ) : col.key.includes("Time") || col.key === "avgTime" ? (
                    <span className="numeric">{formatTime(row[col.key])}</span>
                  ) : typeof row[col.key] === "number" ? (
                    <span className="numeric">{row[col.key]}</span>
                  ) : (
                    row[col.key]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const formatTime = (seconds) => {
  const num = parseInt(seconds);
  if (num < 60) return `${num}s`;
  if (num < 3600) return `${(num / 60).toFixed(1)}m`;
  return `${(num / 3600).toFixed(1)}h`;
};

export default AnalyticsTable;
