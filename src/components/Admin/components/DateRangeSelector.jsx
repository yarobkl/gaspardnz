import "../../../styles/analytics.css";

const DateRangeSelector = ({ value, onChange }) => {
  const options = [
    { value: "7d", label: "7 jours" },
    { value: "30d", label: "30 jours" },
    { value: "6m", label: "6 mois" },
    { value: "all", label: "Tous les temps" },
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
