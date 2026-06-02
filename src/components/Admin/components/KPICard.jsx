import "../../../styles/analytics.css";

const KPICard = ({ title, value, secondary, trend, color = "gold" }) => {
  return (
    <div className={`kpi-card kpi-${color}`}>
      <div className="kpi-header">
        <h4 className="kpi-title">{title}</h4>
        {trend && (
          <span className={`kpi-trend kpi-trend-${trend}`}>
            {trend === "up" && "↑"}
            {trend === "down" && "↓"}
            {trend === "neutral" && "→"}
          </span>
        )}
      </div>
      <div className="kpi-value-section">
        <div className="kpi-value">{value}</div>
        {secondary && <div className="kpi-secondary">{secondary}</div>}
      </div>
      <div className="kpi-bar"></div>
    </div>
  );
};

export default KPICard;
