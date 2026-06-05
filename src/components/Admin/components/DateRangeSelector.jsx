import { useTr } from "../../../context.jsx";
import "../../../styles/analytics.css";

const DateRangeSelector = ({ value, onChange }) => {
  const t = useTr();
  const options = [
    { value: "7d", label: t("admin_range_7d") },
    { value: "30d", label: t("admin_range_30d") },
    { value: "6m", label: t("admin_range_6m") },
    { value: "all", label: t("admin_range_all") },
  ];

  return (
    <div className="date-range-selector">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`date-range-btn ${value === opt.value ? "active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default DateRangeSelector;
