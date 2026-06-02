# Professional Analytics Dashboard Guide

## Overview

A luxury, professional analytics dashboard designed for wedding planner admin spaces. Real-time visitor tracking, KPIs, geographic analytics, behavioral insights, and session management with a premium gold & cream aesthetic.

## Features Implemented

### 1. Real-time KPIs Dashboard
- **Total Visitors** (all-time + today)
- **Total Page Views** (all-time + today)
- **Bounce Rate** (with trend indicator)
- **Average Session Duration** (formatted in h/m/s)
- **Conversion Rate** (with conversion count)
- **Top Referral Sources**

### 2. Geographic Analytics
- **Device Breakdown** (Mobile, Tablet, Desktop) - Pie Chart
- **Browser Breakdown** (Chrome, Safari, Firefox, etc.) - Pie Chart
- **Top 10 Cities** with visitor counts - Table
- **Visitors by Country** - Table with sorting

### 3. Time-based Analytics
- **Visitor Timeline** (line chart - 7d, 30d, 6m, all-time)
- **Peak Hours** (bar chart showing hourly traffic)
- **Day of Week Analysis** (activity by day)
- **Date Range Filters** (7d, 30d, 6m, all-time)
- **Real-time updates** (every 4 seconds)

### 4. User Behavior & Click Analytics
- **Most Clicked Sections/Pages** (bar chart)
- **Average Time on Page** (by section) - Table
- **User Flow/Funnel** (page transitions) - Table
- **Pages with Highest Engagement**

### 5. Session Management
- **Recent Visitor Sessions** (detailed table)
- **Visitor ID Tracking**
- **Session ID Tracking**
- **Device, Location, Duration Info**
- **Conversion Status**

## File Structure

```
src/
├── components/Admin/
│   ├── AdminAnalytics.jsx (Main component - FULLY REBUILT)
│   └── components/
│       ├── KPICard.jsx (Individual KPI card display)
│       ├── AnalyticsChart.jsx (SVG-based charts: line, bar, pie)
│       ├── AnalyticsTable.jsx (Reusable data table)
│       └── DateRangeSelector.jsx (Date range filter buttons)
├── services/
│   └── adminAnalytics.js (Data collection & aggregation - EXISTING)
├── utils/
│   └── analyticsHelpers.js (NEW - Formatting & calculation utilities)
└── styles/
    ├── analytics.css (NEW - Complete analytics styling)
    └── admin.css (EXISTING - Admin panel styles)
```

## Component Details

### AdminAnalytics.jsx (Main Dashboard)
The central hub that coordinates all analytics display. Features:
- Tab navigation (KPI, Geographic, Time-based, Behavior, Sessions)
- Date range selector with real-time filtering
- Refresh status indicator
- Auto-refresh every 4 seconds
- Clear data functionality

**Props:** None (uses local state)

**State Management:**
```javascript
- analytics: Object containing all analytics data
- activeTab: Current viewing tab
- dateRange: Selected time range (7d, 30d, 6m, all)
- refreshing: Loading state indicator
```

### KPICard.jsx
Displays individual KPI metrics with:
- Title and value
- Secondary metric (e.g., today's count)
- Trend indicator (up/down/neutral)
- Color-coded styling (gold/cream)
- Hover animations

**Props:**
```javascript
{
  title: string,
  value: string,
  secondary?: string,
  trend?: 'up' | 'down' | 'neutral',
  color?: 'gold' | 'cream'
}
```

### AnalyticsChart.jsx
SVG-based chart component supporting multiple types:

**Line Charts:** Timeline visualization with gradient fill
- Grid lines for readability
- Point markers
- Responsive sizing
- Auto-scaling Y-axis

**Bar Charts:** Category comparisons
- Auto-scaled bars
- Category labels
- Grid background
- Horizontal label layout

**Pie Charts:** Composition breakdown
- Proportional segments
- Color-coded slices
- Legend display
- Smooth rendering

**Props:**
```javascript
{
  type: 'line' | 'bar' | 'pie',
  data: Array<Object>,
  dataKey: string,
  labelKey?: string,
  xKey?: string,
  color?: string,
  height?: number
}
```

### AnalyticsTable.jsx
Reusable data table for detailed metrics:
- Sticky header for scrolling
- Custom column widths
- Alternating row highlights
- Status badge support
- Responsive table layout
- Auto-formatting for time/numeric values

**Props:**
```javascript
{
  columns: Array<{
    key: string,
    label: string,
    width: string,
    align?: 'left' | 'center' | 'right'
  }>,
  data: Array<Object>,
  maxHeight?: string,
  highlight?: boolean
}
```

### DateRangeSelector.jsx
Date range filter buttons:
- 7 days, 30 days, 6 months, All-time
- Active state styling
- Callback on change

**Props:**
```javascript
{
  value: '7d' | '30d' | '6m' | 'all',
  onChange: (range: string) => void
}
```

## Utility Functions (analyticsHelpers.js)

### Formatting Functions
- `formatNumber(num)` - Converts to K/M notation (1000+ = 1K)
- `formatDuration(seconds)` - Converts to h/m/s format
- `formatDate(dateString)` - Formats to locale date
- `formatTime(dateString)` - Formats to locale time
- `formatPercent(value, decimals)` - Percentage formatting

### Calculation Functions
- `calculateGrowth(current, previous)` - Growth percentage
- `calculateAverageSessionDuration(visitors)` - Avg session time
- `calculateBounceRate(visitors)` - Bounce rate percentage
- `calculateConversionRate(visitors, conversions)` - Conversion %

### Data Aggregation Functions
- `groupByDate(data, dateKey)` - Groups events by date
- `aggregateByProperty(data, property)` - Counts by property
- `getTopN(obj, n)` - Gets top N items from object
- `getDeviceBreakdown(visitors)` - Device statistics
- `getBrowserBreakdown(visitors)` - Browser statistics
- `getGeographicBreakdown(visitors)` - Country/city statistics
- `getHourlyActivity(events)` - Activity by hour
- `getDayOfWeekActivity(events)` - Activity by day

## Data Flow

```
adminAnalytics.js (Data Collection)
    ↓
localStorage/sessionStorage (Storage)
    ↓
getAnalyticsData(dateRange) (Aggregation & Calculation)
    ↓
AdminAnalytics Component (Display)
    ↓
[KPICard, AnalyticsChart, AnalyticsTable] (Render)
```

## Styling System

### Color Scheme (Luxury Wedding Brand)
- **Primary Gold:** `#b8973e` (CNZ-gold)
- **Light Gold:** `#d4ae5a` (CNZ-gold-light)
- **Dark Background:** `#0a0602` (gnz-dark)
- **Darker Background:** `#131008` (gnz-darker)
- **Cream Text:** `#faf7f2` (gnz-cream)
- **Secondary Text:** `rgba(250, 247, 242, 0.7)` (gnz-text-secondary)

### CSS Architecture
- Mobile-first responsive design
- CSS Grid for layouts
- Flexbox for component alignment
- CSS custom properties for consistent theming
- Smooth transitions (300ms cubic-bezier)
- Glass-morphism effects with borders

### Responsive Breakpoints
- **Mobile:** 0-640px (single column)
- **Tablet:** 641px-1024px (2 columns)
- **Desktop:** 1025px-1439px (responsive auto-fit)
- **Large Desktop:** 1440px+ (3 columns)

## Real-time Updates

The dashboard auto-refreshes every 4 seconds:

```javascript
useEffect(() => {
  loadData();
  const interval = setInterval(loadData, 4000);
  return () => clearInterval(interval);
}, [dateRange]);
```

Visual feedback:
- Spinner animation during load
- Status dot indicator (green = live, gold = updating)
- "Mise à jour en cours..." text while loading

## Data Storage

### localStorage Keys
- `gnz_admin_events` - All tracked events (max 10,000)
- `gnz_admin_visitors` - Visitor profiles (max 50,000)

### sessionStorage Keys
- `gnz_admin_sessions` - Current session data
- `gnz_visitor_id` - Persistent visitor identifier
- `gnz_session_id` - Current session identifier

### Data Lifecycle
- Events stored in localStorage for historical analysis
- Sessions stored in sessionStorage (cleared on tab close)
- Automatic pruning when exceeding max capacity
- Data survives page refreshes and browser restarts

## Tracking Implementation

The system automatically tracks:

### Page Views
```javascript
trackPageView() // Called on component mount
```

### Custom Events
```javascript
trackEvent(type, label, metadata)
// Example: trackEvent('click', 'Booking Button', { page: '/formules' })
```

### Conversions
```javascript
trackConversion(type, details)
// Example: trackConversion('booking_request', { formule: 'Premium' })
```

### Collected Data Per Event
- Event ID, type, timestamp
- Visitor ID, Session ID
- Page URL, Referrer
- Device type, OS, Browser
- Country, City (via timezone)
- Custom metadata

## Performance Optimizations

1. **SVG Charts** - Lightweight vector graphics, no external dependencies
2. **Debounced Updates** - 4-second refresh prevents excessive re-renders
3. **Memoization** - useMemo for complex calculations
4. **Lazy Loading** - Components only render when tab is active
5. **Efficient Aggregation** - Single-pass data processing in adminAnalytics.js
6. **CSS Containment** - Scoped styles prevent global conflicts

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 12+)
- Mobile Browsers: Full responsive support

## Accessibility

- Keyboard navigation (tab through tabs and buttons)
- ARIA labels on interactive elements
- Color contrast ratios meet WCAG AA standards
- Reduced motion support (respects prefers-reduced-motion)
- Screen reader compatible tables

## Future Enhancement Options

1. **Export Data** - CSV/PDF export functionality
2. **Advanced Filtering** - Multi-select geographic filters
3. **Custom Date Range** - Calendar picker for exact dates
4. **Alerts** - Email/push notifications on KPI thresholds
5. **Data Visualization** - Heatmap for click patterns
6. **Segmentation** - Visitor cohort analysis
7. **Comparison** - Period-over-period analysis
8. **API Integration** - Connect to external analytics services

## Troubleshooting

### No Data Appearing
- Check browser console for errors
- Verify tracking calls are being made (trackPageView in App.jsx)
- Check localStorage is enabled
- Clear localStorage and refresh

### Charts Not Rendering
- Verify data format in AnalyticsChart props
- Check SVG viewBox calculations
- Ensure data array is not empty

### Slow Performance
- Reduce max stored events (adminAnalytics.js line 155)
- Check browser DevTools for memory usage
- Clear old analytics data with "Réinitialiser" button

## Maintenance

### Regular Tasks
1. Monitor localStorage usage (up to 5-10MB)
2. Clear data monthly to prevent slowdown
3. Review conversion tracking configuration
4. Verify geographic data accuracy

### Updates
- CSS media queries automatically handle new breakpoints
- Add new chart types to AnalyticsChart.jsx
- Extend analytics data collection in adminAnalytics.js
- Update KPI calculations in utils/analyticsHelpers.js

## Support

For issues or questions:
1. Check ANALYTICS_DASHBOARD_GUIDE.md (this file)
2. Review inline component comments
3. Check browser console for specific errors
4. Test with sample data using trackPageView() in browser console
