import "../../../styles/analytics.css";

/**
 * Simple analytics chart component using SVG
 * Types: line, bar, pie
 */
const AnalyticsChart = ({ type, data, dataKey, labelKey, xKey, color, height = 250, horizontal = false }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty">
        <p>Aucune données disponibles</p>
      </div>
    );
  }

  if (type === "line") {
    return <LineChart data={data} dataKey={dataKey} xKey={xKey} color={color} height={height} />;
  }

  if (type === "bar") {
    return <BarChart data={data} dataKey={dataKey} labelKey={labelKey} color={color} height={height} />;
  }

  if (type === "pie") {
    return <PieChart data={data} color={color} />;
  }

  return null;
};

const LineChart = ({ data, dataKey, xKey, color = "#b8973e", height = 250 }) => {
  if (data.length === 0) return null;

  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = typeof window !== "undefined" ? Math.min(window.innerWidth - 40, 600) : 600;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Get min and max values
  const values = data.map((d) => d[dataKey] || 0);
  const maxValue = Math.max(...values, 0) || 1;
  const minValue = Math.min(...values, 0);

  // Scale functions
  const scaleX = (index) => (index / Math.max(data.length - 1, 1)) * chartWidth;
  const scaleY = (value) => chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;

  // Create path
  const points = data.map((d, i) => ({
    x: padding.left + scaleX(i),
    y: padding.top + scaleY(d[dataKey] || 0),
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg width={width} height={height} className="chart-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {Array.from({ length: 5 }).map((_, i) => {
        const y = padding.top + (chartHeight * i) / 4;
        return (
          <line key={`grid-${i}`} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(184, 151, 62, 0.1)" strokeWidth="1" />
        );
      })}

      {/* Axis */}
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke={color} strokeWidth="2" opacity="0.3" />
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke={color} strokeWidth="2" opacity="0.3" />

      {/* Path */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" opacity="0.8" />

      {/* Gradient fill under path */}
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={`${pathD} L ${width - padding.right} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`} fill="url(#lineGradient)" />

      {/* Points */}
      {points.map((p, i) => (
        <circle key={`point-${i}`} cx={p.x} cy={p.y} r="3" fill={color} opacity="0.8" />
      ))}

      {/* X-axis labels */}
      {data.map((d, i) => {
        if (i % Math.ceil(data.length / 5) !== 0 && i !== data.length - 1) return null;
        const x = padding.left + scaleX(i);
        const label = d[Object.keys(d).find((k) => k !== dataKey)];
        return (
          <text
            key={`label-${i}`}
            x={x}
            y={height - padding.bottom + 20}
            textAnchor="middle"
            fontSize="12"
            fill="rgba(250, 247, 242, 0.6)"
          >
            {String(label).substring(0, 10)}
          </text>
        );
      })}

      {/* Y-axis labels */}
      {Array.from({ length: 5 }).map((_, i) => {
        const value = minValue + ((maxValue - minValue) * i) / 4;
        const y = padding.top + (chartHeight * i) / 4;
        return (
          <text
            key={`y-label-${i}`}
            x={padding.left - 10}
            y={y + 4}
            textAnchor="end"
            fontSize="11"
            fill="rgba(250, 247, 242, 0.5)"
          >
            {Math.round(value)}
          </text>
        );
      })}
    </svg>
  );
};

const BarChart = ({ data, dataKey, labelKey, color = "#b8973e", height = 250 }) => {
  if (data.length === 0) return null;

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const width = typeof window !== "undefined" ? Math.min(window.innerWidth - 40, 600) : 600;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map((d) => d[dataKey] || 0);
  const maxValue = Math.max(...values, 0) || 1;

  const barWidth = chartWidth / data.length * 0.8;
  const barSpacing = chartWidth / data.length;

  return (
    <svg width={width} height={height} className="chart-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {Array.from({ length: 5 }).map((_, i) => {
        const y = padding.top + (chartHeight * i) / 4;
        return (
          <line key={`grid-${i}`} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(184, 151, 62, 0.1)" strokeWidth="1" />
        );
      })}

      {/* Axis */}
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke={color} strokeWidth="2" opacity="0.3" />
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke={color} strokeWidth="2" opacity="0.3" />

      {/* Bars */}
      {data.map((d, i) => {
        const value = d[dataKey] || 0;
        const x = padding.left + i * barSpacing + (barSpacing - barWidth) / 2;
        const barHeight = (value / maxValue) * chartHeight;
        const y = padding.top + chartHeight - barHeight;
        const label = d[labelKey];

        return (
          <g key={`bar-${i}`}>
            <rect x={x} y={y} width={barWidth} height={barHeight} fill={color} opacity="0.8" rx="2" />
            <text
              x={x + barWidth / 2}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              fontSize="11"
              fill="rgba(250, 247, 242, 0.6)"
            >
              {String(label).substring(0, 12)}
            </text>
          </g>
        );
      })}

      {/* Y-axis labels */}
      {Array.from({ length: 5 }).map((_, i) => {
        const value = (maxValue * i) / 4;
        const y = padding.top + (chartHeight * i) / 4;
        return (
          <text
            key={`y-label-${i}`}
            x={padding.left - 10}
            y={y + 4}
            textAnchor="end"
            fontSize="11"
            fill="rgba(250, 247, 242, 0.5)"
          >
            {Math.round(value)}
          </text>
        );
      })}
    </svg>
  );
};

const PieChart = ({ data, color = "#b8973e" }) => {
  if (data.length === 0) return null;

  const size = 250;
  const radius = 80;
  const centerX = size / 2;
  const centerY = size / 2;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const colors = ["#b8973e", "#d4ae5a", "#916f2f", "#8b6f47", "#a78a3d", "#c9a960"];

  let currentAngle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const sliceAngle = (d.value / total) * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    const labelAngle = startAngle + sliceAngle / 2;
    const labelRadius = radius * 0.65;
    const labelX = centerX + labelRadius * Math.cos(labelAngle);
    const labelY = centerY + labelRadius * Math.sin(labelAngle);

    currentAngle = endAngle;

    return { pathData, labelX, labelY, name: d.name, value: d.value, color: colors[i % colors.length] };
  });

  return (
    <svg width={size} height={size} className="chart-svg pie-chart" viewBox={`0 0 ${size} ${size}`}>
      {slices.map((slice, i) => (
        <g key={`slice-${i}`}>
          <path d={slice.pathData} fill={slice.color} opacity="0.8" stroke="rgba(10, 6, 2, 0.5)" strokeWidth="1" />
          <text
            x={slice.labelX}
            y={slice.labelY}
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fill="#faf7f2"
            pointerEvents="none"
          >
            {slice.name.substring(0, 8)}
          </text>
        </g>
      ))}
      {/* Legend */}
      <g transform="translate(0, 170)">
        {data.slice(0, 4).map((d, i) => (
          <g key={`legend-${i}`} transform={`translate(${(i % 2) * 120}, ${Math.floor(i / 2) * 20})`}>
            <rect x="0" y="0" width="12" height="12" fill={colors[i % colors.length]} opacity="0.8" rx="1" />
            <text x="18" y="10" fontSize="11" fill="rgba(250, 247, 242, 0.7)">
              {d.name.substring(0, 10)}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
};

export default AnalyticsChart;
