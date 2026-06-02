# Admin Dashboard - Responsive Design Quick Reference

## One-Liner Rules

1. **All width constraints**: Use `width: 100%` + `max-width: 100%`
2. **No horizontal scroll**: Add `overflow-x: hidden` to containers
3. **Tables on mobile**: Wrap in `.admin-table-wrapper` for internal scroll
4. **Forms on mobile**: Stack vertically (CSS handles this)
5. **Buttons on mobile**: Will be full-width automatically (CSS)
6. **Mobile first**: Write CSS for mobile, then enhance for larger screens

---

## Viewport Breakpoints

```css
320px - 375px    → Extra small phones
376px - 480px    → Small phones
481px - 767px    → Large phones/small tablets
768px - 1023px   → Tablets
1024px - 1279px  → Large tablets/small desktops
1280px+          → Desktops and up
```

---

## CSS Classes - When to Use

### Layout & Sizing
- `.admin-layout` → Main wrapper (already applied)
- `.admin-sidebar` → Top bar on mobile, left sidebar on desktop
- `.admin-main` → Main content area
- `.admin-full-width` → Force 100% width with constraints

### Content Organization
- `.admin-grid` → KPI/card grid (1→2→3→4 columns)
- `.admin-grid-2` → Alternative grid (usually 2 columns)
- `.admin-card` → Card/section wrapper
- `.admin-table-wrapper` → Wrap tables for horizontal scroll

### Forms
- `.admin-form-group` → Label + input wrapper
- `.admin-input` → Text input
- `.admin-select` → Dropdown
- `.admin-textarea` → Multi-line text
- `.admin-label` → Form label

### Buttons
- `.admin-btn` → Primary (gold) button
- `.admin-btn-secondary` → Secondary button
- `.admin-btn-danger` → Destructive action
- `.admin-btn-success` → Positive action

### Typography
- `.admin-h1` → Largest heading
- `.admin-h2` → Section title
- `.admin-h3` → Subsection title
- `.admin-body` → Regular text
- `.admin-small` → Small/secondary text
- `.admin-label` → Form label (small caps)

### Utilities
- `.admin-safe-padding` → Safe area padding (notched devices)
- `.admin-scrollbar-gutter` → Prevent scroll-induced shift
- `.admin-overflow-container` → Container with internal scroll
- `.admin-flex-full-mobile` → Flex column, full width

---

## Common Patterns

### Pattern 1: Simple List/Grid
```jsx
<div className="admin-grid">
  {items.map((item) => (
    <div key={item.id} className="admin-card">
      {/* content */}
    </div>
  ))}
</div>
```

### Pattern 2: Form
```jsx
<form onSubmit={handleSubmit}>
  <div className="admin-form-group">
    <label className="admin-label">Label</label>
    <input className="admin-input" />
  </div>
  <button type="submit" className="admin-btn">Submit</button>
</form>
```

### Pattern 3: Table
```jsx
<div className="admin-card">
  <div className="admin-table-wrapper">
    <table className="admin-table">
      <thead>
        <tr>
          <th>Header 1</th>
          <th>Header 2</th>
        </tr>
      </thead>
      <tbody>
        {/* rows */}
      </tbody>
    </table>
  </div>
</div>
```

### Pattern 4: Two-Column on Desktop, Single on Mobile
```jsx
<div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
  <div className="admin-card">{/* left */}</div>
  <div className="admin-card">{/* right */}</div>
</div>
```

CSS adds:
```css
@media (min-width: 768px) {
  /* parent */ {
    grid-template-columns: 2fr 1fr;
  }
}
```

---

## Spacing System

```css
--spacing-xs   = 0.25rem (4px)
--spacing-sm   = 0.5rem  (8px)
--spacing-md   = 1rem    (16px)
--spacing-lg   = 1.5rem  (24px)
--spacing-xl   = 2rem    (32px)
--spacing-2xl  = 2.5rem  (40px)
```

Usage:
```jsx
<div style={{ padding: "var(--spacing-lg)" }}>
<div style={{ marginBottom: "var(--spacing-md)" }}>
<div style={{ gap: "var(--spacing-sm)" }}>
```

---

## Colors

```css
--gnz-dark              = #0a0602 (main background)
--gnz-darker            = #131008 (darker background)
--gnz-gold              = #b8973e (primary accent)
--gnz-gold-light        = #d4ae5a (light accent)
--gnz-cream             = #faf7f2 (text color)
--gnz-text-secondary    = rgba(250, 247, 242, 0.7) (secondary text)
--gnz-border            = rgba(184, 151, 62, 0.15) (borders)
--gnz-border-light      = rgba(184, 151, 62, 0.1) (light borders)
--gnz-surface           = rgba(0, 0, 0, 0.3) (backgrounds)
--gnz-error             = #ff6b6b (red)
--gnz-error-bg          = rgba(200, 50, 50, 0.08)
--gnz-error-border      = rgba(200, 50, 50, 0.2)
--gnz-success           = #5caf2d (green)
--gnz-success-bg        = rgba(92, 175, 45, 0.08)
--gnz-success-border    = rgba(92, 175, 45, 0.2)
```

---

## Do's and Don'ts

### DO:
- ✅ Use CSS classes for styling
- ✅ Use responsive grid layouts
- ✅ Use `gap` for spacing
- ✅ Use `flex` for flexible layouts
- ✅ Use `clamp()` for font sizes
- ✅ Use `min-height` instead of `height`
- ✅ Wrap tables in `.admin-table-wrapper`
- ✅ Test on 320px, 480px, 768px, 1024px

### DON'T:
- ❌ Use hard-coded pixel widths (except for sidebar)
- ❌ Use `position: fixed` for main content
- ❌ Use `width: calc(100% - Xpx)` (too fragile)
- ❌ Use `overflow: scroll` (use `overflow: auto`)
- ❌ Use `white-space: nowrap` without plan for overflow
- ❌ Forget safe area padding on notched devices
- ❌ Set explicit heights on buttons/inputs
- ❌ Use `height: 100vh` (causes overflow)

---

## Testing Mobile Responsiveness

### Browser DevTools:
1. Open DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Test these devices:
   - iPhone SE (375x667)
   - iPhone 12 (390x844)
   - iPhone 14 Pro (393x852) - notched
   - Galaxy S21 (360x800)
   - iPad (768x1024)
   - iPad Pro (1024x1366)

### Real Device Testing:
1. Deploy to staging
2. Open on actual phones/tablets
3. Test:
   - Portrait orientation
   - Landscape orientation
   - Notched devices (iPhone)
   - Different browsers (Chrome, Safari, Firefox)

### Checklist:
- [ ] No horizontal scrolling
- [ ] All buttons clickable (44x44px)
- [ ] Text readable without zoom
- [ ] Forms easy to fill on mobile
- [ ] Tables scroll horizontally only
- [ ] No layout shifts on scroll
- [ ] Safe areas respected

---

## Common Fixes

### Problem: Content Overflowing
```jsx
// DON'T:
<div style={{ width: "500px" }}>

// DO:
<div style={{ maxWidth: "100%" }}>
  or add class="admin-full-width"
```

### Problem: Table Horizontal Scroll
```jsx
// DON'T:
<table className="admin-table">

// DO:
<div className="admin-table-wrapper">
  <table className="admin-table">
  </table>
</div>
```

### Problem: Button Too Small on Mobile
```jsx
// DON'T:
<button className="admin-btn">Submit</button>

// DO:
<button className="admin-btn" style={{ minHeight: "44px" }}>
  // CSS already handles this!
</button>
```

### Problem: Form Grid Breaks on Mobile
```jsx
// DON'T:
<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>

// DO:
<div style={{ display: "grid", gridTemplateColumns: "1fr" }}>
  {/* CSS media queries handle larger screens */}
</div>
```

### Problem: Safe Area Not Respected
```jsx
// DON'T:
<div style={{ padding: "1rem" }}>

// DO:
<div style={{ padding: "max(1rem, env(safe-area-inset-left))" }}>
  or add class="admin-safe-padding"
```

---

## Performance Tips

1. **Avoid Layout Shifts**
   - Use `scrollbar-gutter: stable`
   - Reserve space for dynamic content
   - Don't change widths on interactions

2. **Optimize Repaints**
   - Minimize inline styles
   - Use CSS classes for state changes
   - Batch DOM updates

3. **Smooth Animations**
   - Use `transition` (already in CSS)
   - Avoid `transform` on expensive properties
   - Keep animations under 300ms

---

## Debugging Tips

### Check CLS (Cumulative Layout Shift):
1. Open DevTools → Performance
2. Click "Measure"
3. Interact with page (scroll, click)
4. Stop recording
5. Look for "Layout Shifts" - should be 0

### Check Responsive Breakpoints:
```javascript
// In browser console:
window.innerWidth // Check current width
window.matchMedia('(max-width: 480px)').matches // Check breakpoint
```

### Check Safe Areas:
```javascript
// In browser console (on notched device):
console.log({
  top: getComputedStyle(document.body).getPropertyValue('env(safe-area-inset-top)'),
  right: getComputedStyle(document.body).getPropertyValue('env(safe-area-inset-right)'),
  bottom: getComputedStyle(document.body).getPropertyValue('env(safe-area-inset-bottom)'),
  left: getComputedStyle(document.body).getPropertyValue('env(safe-area-inset-left)')
})
```

---

## Need Help?

1. Check the layout looks correct at these widths: 320, 375, 480, 768, 1024, 1280
2. Verify tables have `.admin-table-wrapper`
3. Make sure no inline `width` styles conflict with CSS
4. Test on real mobile devices
5. Check Chrome DevTools Performance tab for layout shifts

---

## Quick Links

- Main CSS: `/src/styles/admin.css`
- Layout Component: `/src/components/Admin/AdminLayout.jsx`
- Fixes Document: `ADMIN_LAYOUT_STABILITY_FIXES.md`
- Component Fixes: `ADMIN_COMPONENTS_FIXES.md`
