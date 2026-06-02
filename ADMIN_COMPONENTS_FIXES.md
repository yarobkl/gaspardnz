# Admin Dashboard - Component-Specific Fixes

## Overview
Detailed guide for components that need inline style adjustments or element wrapper changes to work properly with the new CSS constraints.

## AdminLayout.jsx

### Current Status: ✅ GOOD
The layout component already works well with the CSS changes. No modifications needed.

### Best Practices Applied:
- Sidebar and main are flex children (automatic)
- Navigation buttons are properly flex items
- Header title uses flex grow

### No Changes Required
All styling is handled by CSS classes.

---

## AdminDashboard.jsx

### Current Issues to Fix

#### Issue 1: Grid Wrapper Width
**Problem**: Inline styles on div might set explicit widths
**Fix**: Ensure all wrapper divs use CSS classes

```jsx
// Current (potentially problematic):
<div style={{ marginTop: "2rem" }}>

// Verify: Use only padding/margin, no width constraints
<div style={{ marginTop: "2rem" }} className="admin-full-width">
```

#### Issue 2: StatCard Component
**Fix**: Ensure StatCard renders with proper width

```jsx
// Add wrapper to ensure KPI cards stack properly on mobile
const StatCard = ({ label, value, subtext }) => (
  <div className="admin-kpi">
    <div className="admin-kpi-label">{label}</div>
    <div className="admin-kpi-value">{value}</div>
    {subtext && <div className="admin-kpi-change">{subtext}</div>}
  </div>
);
```

✅ Already correct - no changes needed

#### Issue 3: Table Container
**Problem**: Table needs wrapper for horizontal scroll

**Required Change**:
```jsx
// Current:
<table className="admin-table">

// Fix: Wrap in table wrapper
<div className="admin-table-wrapper">
  <table className="admin-table">
    {/* table content */}
  </table>
</div>
```

**Location**: Line 81 (in admin-card)

**Updated Code**:
```jsx
<div className="admin-card">
  {(analytics?.topPages || []).length > 0 ? (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Page</th>
            <th style={{ textAlign: "right" }}>Vues</th>
          </tr>
        </thead>
        <tbody>
          {(analytics?.topPages || []).map((p) => (
            <tr key={p.page}>
              <td>{p.page}</td>
              <td style={{ textAlign: "right", color: "var(--gnz-gold)" }}>{p.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div style={{ padding: "2rem", textAlign: "center", color: "var(--gnz-text-secondary)" }}>
      Pas de données disponibles
    </div>
  )}
</div>
```

---

## AdminAnalytics.jsx

### Issue 1: Tab Buttons Container
**Problem**: Buttons might overflow on small screens

**Fix**: Add flex-wrap support
```jsx
// Current:
<div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>

// This is correct already ✅
```

### Issue 2: RecentVisitors Table
**Problem**: Large table needs proper scrolling container

**Required Change** (Line 74):
```jsx
// Current:
<table className="admin-table">

// Fix:
<div className="admin-table-wrapper">
  <table className="admin-table">
```

**Updated Section**:
```jsx
const renderRecentVisitors = () => {
  const visitors = analytics?.recentVisitors || [];
  return (
    <div style={{ marginTop: "2rem" }}>
      <h3 className="admin-h3" style={{ marginBottom: "1.5rem" }}>Visiteurs Récents</h3>
      <div className="admin-card" style={{ maxHeight: "60vh", overflow: "auto", overflowX: "hidden" }}>
        {visitors.length > 0 ? (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Visiteur</th>
                  <th>Device</th>
                  <th>Pays</th>
                  <th style={{ textAlign: "right" }}>Événements</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => (
                  <tr key={v.id}>
                    <td>{v.id.slice(0, 12)}...</td>
                    <td>{v.device}</td>
                    <td>{v.country}</td>
                    <td style={{ textAlign: "right", color: "var(--gnz-gold)" }}>{v.eventCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--gnz-text-secondary)" }}>
            Pas de visiteurs
          </div>
        )}
      </div>
    </div>
  );
};
```

### Issue 3: Country Stats Table
**Required Change** (Line 50):
```jsx
// Current:
<div className="admin-card">
  <table className="admin-table">

// Fix:
<div className="admin-card">
  <div className="admin-table-wrapper">
    <table className="admin-table">
```

Don't forget closing tag!

**Updated Section**:
```jsx
const renderCountryStats = () => {
  const stats = analytics?.countryStats || {};
  return (
    <div style={{ marginTop: "2rem" }}>
      <h3 className="admin-h3" style={{ marginBottom: "1.5rem" }}>Pays</h3>
      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <tbody>
              {Object.entries(stats)
                .sort((a, b) => b[1] - a[1])
                .map(([country, count]) => (
                  <tr key={country}>
                    <td>{country}</td>
                    <td style={{ textAlign: "right", color: "var(--gnz-gold)" }}>{count}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
```

### Issue 4: Tab Button Width
**Fix**: On mobile, buttons should stack better

**Current** (Line 145):
```jsx
className={activeTab === tab ? "admin-btn" : "admin-btn-secondary"}
style={{ fontSize: "0.75rem" }}
```

**Better** (for mobile):
```jsx
className={`${activeTab === tab ? "admin-btn" : "admin-btn-secondary"}`}
style={{ fontSize: "0.75rem", flex: 1, minWidth: "60px" }}
```

---

## AdminCRM.jsx

### Issue 1: Lead Form Grid
**Problem**: Form grid might overflow on mobile

**Current** (Line 124):
```jsx
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
```

**Fix**: Add responsive wrapper
```jsx
<div className="admin-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", marginBottom: "1rem" }}>
```

Add to admin.css:
```css
@media (min-width: 481px) {
  .admin-form-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (min-width: 768px) {
  .admin-form-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
  }
}
```

### Issue 2: Lead List Table
**Required Change** (Line 188):
```jsx
// Current:
<div className="admin-card">
  <table className="admin-table">

// Fix:
<div className="admin-card">
  <div className="admin-table-wrapper">
    <table className="admin-table">
```

**Updated Section**:
```jsx
<div className="admin-card">
  <div className="admin-table-wrapper">
    <table className="admin-table">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Email</th>
          <th>Statut</th>
          <th>Événement</th>
        </tr>
      </thead>
      <tbody>
        {leads.map((lead) => (
          <tr
            key={lead.id}
            onClick={() => setSelectedLead(lead)}
            style={{
              cursor: "pointer",
              background: selectedLead?.id === lead.id ? "rgba(184,151,62,0.1)" : "transparent",
            }}>
            <td>{lead.name}</td>
            <td style={{ color: "var(--gnz-text-secondary)" }}>{lead.email}</td>
            <td>
              <span
                style={{
                  padding: "0.3rem 0.6rem",
                  background: lead.status === "converti" ? "rgba(92,175,45,0.2)" : "rgba(184,151,62,0.2)",
                  color: lead.status === "converti" ? "#5caf2d" : "var(--gnz-gold)",
                  borderRadius: "3px",
                  fontSize: "0.75rem",
                }}>
                {lead.status}
              </span>
            </td>
            <td>{lead.eventType}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  {leads.length === 0 && (
    <div style={{ padding: "2rem", textAlign: "center", color: "var(--gnz-text-secondary)" }}>
      Aucun lead pour le moment
    </div>
  )}
</div>
```

### Issue 3: Two-Column Layout
**Problem**: On mobile, lead detail panel shouldn't be alongside list

**Current** (Line 111):
```jsx
<div style={{ display: "grid", gridTemplateColumns: selectedLead ? "1fr" : "1fr", gap: "1rem" }}>
```

**Fix**: Make responsive
```jsx
<div style={{ 
  display: "grid", 
  gridTemplateColumns: "1fr",
  gap: "1rem" 
}}>
```

Or better, add to CSS:
```css
@media (min-width: 768px) {
  .admin-crm-layout {
    grid-template-columns: 2fr 1fr;
  }
}
```

Then update JSX:
```jsx
<div className="admin-crm-layout" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
```

---

## AdminUsers.jsx

### Issue 1: User Creation Form
**Problem**: Form might be too wide on desktop

**Current** (Line 82):
```jsx
<form onSubmit={handleAddUser} className="admin-card" style={{ marginBottom: "2rem", maxWidth: "500px" }}>
```

✅ Good! Already has maxWidth constraint

### Issue 2: User Table
**Required Change** (Line 118):
```jsx
// Current:
<div className="admin-card">
  <table className="admin-table">

// Fix:
<div className="admin-card">
  <div className="admin-table-wrapper">
    <table className="admin-table">
```

**Updated Section**:
```jsx
<div className="admin-card">
  <div className="admin-table-wrapper">
    <table className="admin-table">
      <thead>
        <tr>
          <th>Email</th>
          <th>Permission</th>
          <th>Créé</th>
          <th>Dernière visite</th>
          <th style={{ textAlign: "center" }}>Action</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>
              {user.email}
              {session?.userId === user.id && <span style={{ color: "var(--gnz-gold)", marginLeft: "0.5rem" }}>(Vous)</span>}
            </td>
            <td>{permissionLabels[user.permission]}</td>
            <td style={{ color: "var(--gnz-text-secondary)" }}>
              {new Date(user.createdAt).toLocaleDateString("fr-FR")}
            </td>
            <td style={{ color: "var(--gnz-text-secondary)" }}>
              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("fr-FR") : "-"}
            </td>
            <td style={{ textAlign: "center" }}>
              {session?.userId !== user.id && (
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="admin-btn-danger"
                  style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem" }}>
                  Supprimer
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  {users.length === 0 && (
    <div style={{ padding: "2rem", textAlign: "center", color: "var(--gnz-text-secondary)" }}>
      Aucun administrateur
    </div>
  )}
</div>
```

---

## AdminWeddingInspiration.jsx & AdminSettings.jsx

Check these components follow the same pattern:
- [ ] Tables wrapped in `.admin-table-wrapper`
- [ ] Forms use proper grid layouts
- [ ] No hard-coded widths
- [ ] All buttons min-height: 44px on mobile

---

## Summary of Required Changes

### Files Needing Updates:

1. **AdminDashboard.jsx**
   - Wrap table in `.admin-table-wrapper`

2. **AdminAnalytics.jsx**
   - Wrap 3 tables in `.admin-table-wrapper`
   - Improve tab button layout on mobile

3. **AdminCRM.jsx**
   - Wrap table in `.admin-table-wrapper`
   - Add responsive form grid
   - Consider 2-column layout responsiveness

4. **AdminUsers.jsx**
   - Wrap table in `.admin-table-wrapper`

5. **AdminWeddingInspiration.jsx**
   - Check for tables, wrap if present

6. **AdminSettings.jsx**
   - Check for tables, wrap if present

### Total Changes: ~15 lines across 4-6 files

All changes are minimal and involve wrapping tables with `.admin-table-wrapper` div.

---

## Before & After Example

### Before (Broken on Mobile):
```jsx
<div className="admin-card">
  <table className="admin-table">
    <thead>
      <tr>
        <th>Column 1</th>
        <th>Column 2</th>
      </tr>
    </thead>
    <tbody>
      {/* rows */}
    </tbody>
  </table>
</div>
```

### After (Mobile-Ready):
```jsx
<div className="admin-card">
  <div className="admin-table-wrapper">
    <table className="admin-table">
      <thead>
        <tr>
          <th>Column 1</th>
          <th>Column 2</th>
        </tr>
      </thead>
      <tbody>
        {/* rows */}
      </tbody>
    </table>
  </div>
</div>
```

That's it! Simple but critical for mobile stability.
