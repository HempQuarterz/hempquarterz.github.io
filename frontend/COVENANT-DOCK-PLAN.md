# Covenant Navigation System: Refined Implementation Plan

## Executive Summary

This plan merges the proposed **GenesisDock** with the existing **SpatialSidebar** into a unified **CovenantDock** component. The dock becomes the primary navigation system across all pages, with context-aware items that adapt based on the current route.

---

## Current State Analysis

### Existing Navigation Components

| Component | Used On | Features |
|-----------|---------|----------|
| **ModernHeader** | All pages | Hamburger menu → BibleNavigator, nav links, theme toggle |
| **SpatialSidebar** | ManuscriptsPage only | Floating dock with panels (Library, Chapters, Settings), BibleNavigator |

### Pain Points Identified
1. **Inconsistent UX**: SpatialSidebar only on manuscripts page, header nav elsewhere
2. **Duplicate navigation**: Header hamburger AND SpatialSidebar both open BibleNavigator
3. **Context confusion**: Users lose the dock when navigating away from manuscripts
4. **Mobile overlap**: Fixed header + SpatialSidebar bottom dock compete for space

---

## Proposed Architecture

### CovenantDock: Unified Navigation

```
┌─────────────────────────────────────────────────────────┐
│                    CovenantDock                          │
├─────────────────────────────────────────────────────────┤
│  GLOBAL ITEMS (always visible):                         │
│  • Home (/) - Navigate to homepage                      │
│  • Navigate - Opens BibleNavigator modal                │
│  • Manuscripts (/manuscripts) - Main scripture viewer   │
│  • Spirit AI (/lsi) - LSI prayer analysis               │
│  • About (/about) - Project information                 │
│                                                         │
│  CONTEXT ITEMS (route-aware):                           │
│  • [/manuscripts] Library, Chapters, Settings panels    │
│  • [/lsi] Audio, Journal toggles (future)               │
├─────────────────────────────────────────────────────────┤
│  LAYOUT:                                                │
│  • Desktop: Left vertical dock (like macOS Dock)        │
│  • Mobile: Bottom horizontal dock (like iOS tab bar)    │
└─────────────────────────────────────────────────────────┘
```

### BreadcrumbRibbon: Contextual Header

The header transforms from navigation hub to contextual breadcrumb:

```
┌─────────────────────────────────────────────────────────┐
│ [Logo]  Home > Manuscripts > Genesis > Chapter 1    [🌓]│
└─────────────────────────────────────────────────────────┘
```

Features:
- Minimal height (48px vs current ~80px)
- Clickable breadcrumb segments
- Theme toggle remains
- No hamburger menu (navigation moved to dock)

---

## Component Hierarchy

```
App.jsx
├── ParchmentFilters
├── NebulaBackground
├── FloatingLetters
├── InkRipple
├── BreadcrumbRibbon (NEW - replaces ModernHeader)
├── CovenantDock (NEW - global, route-aware)
│   ├── GlobalDockItems (Home, Navigate, Manuscripts, Spirit AI, About)
│   └── ContextDockItems (varies by route)
│       ├── [manuscripts] LibraryPanel, ChaptersPanel, SettingsPanel
│       └── [lsi] (future: AudioPanel, JournalPanel)
└── Router
    └── Routes (with bottom padding for dock)
```

---

## Implementation Phases

### Phase 1: Create CovenantDock Component
**Files to create:**
- `src/components/navigation/CovenantDock.jsx` - Main dock component
- `src/components/navigation/DockItem.jsx` - Individual dock button (extracted from SpatialSidebar)
- `src/components/navigation/DockPanel.jsx` - Slide-out panel (extracted from SpatialSidebar)
- `src/components/navigation/index.js` - Barrel export

**Features:**
```jsx
// CovenantDock.jsx structure
const CovenantDock = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState(null);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Determine context items based on route
  const isManuscriptsPage = location.pathname.startsWith('/manuscripts');
  const isLSIPage = location.pathname.startsWith('/lsi');

  return (
    <>
      <DockContainer isMobile={isMobile}>
        {/* Global Items */}
        <DockItem icon={Home} to="/" label="Home" />
        <DockItem icon={Navigation} onClick={openNavigator} label="Navigate" />
        <DockItem icon={BookOpen} to="/manuscripts" label="Manuscripts" />
        <DockItem icon={Mic} to="/lsi" label="Spirit AI" />
        <DockItem icon={Info} to="/about" label="About" />

        {/* Context Items - Manuscripts */}
        {isManuscriptsPage && (
          <>
            <DockDivider />
            <DockItem icon={Library} onClick={() => togglePanel('books')} label="Library" />
            <DockItem icon={FileText} onClick={() => togglePanel('chapters')} label="Chapters" />
            <DockItem icon={Settings} onClick={() => togglePanel('settings')} label="Settings" />
          </>
        )}
      </DockContainer>

      {/* Panels */}
      <AnimatePresence>
        {activePanel && <DockPanel type={activePanel} onClose={closePanel} />}
      </AnimatePresence>

      {/* BibleNavigator Modal */}
      <BibleNavigator isOpen={isNavigatorOpen} onClose={() => setIsNavigatorOpen(false)} />
    </>
  );
};
```

### Phase 2: Create BreadcrumbRibbon Component
**Files to create:**
- `src/components/navigation/BreadcrumbRibbon.jsx` - Minimal contextual header

**Features:**
```jsx
// BreadcrumbRibbon.jsx
const BreadcrumbRibbon = () => {
  const location = useLocation();
  const breadcrumbs = useBreadcrumbs(); // Custom hook to parse route

  return (
    <header className="breadcrumb-ribbon">
      <Link to="/" className="ribbon-logo">
        <img src="/logo-brand.svg" alt="All4Yah" />
      </Link>

      <nav className="breadcrumb-trail">
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={crumb.path}>
            {i > 0 && <span className="breadcrumb-separator">›</span>}
            <Link to={crumb.path} className="breadcrumb-item">
              {crumb.label}
            </Link>
          </React.Fragment>
        ))}
      </nav>

      <ThemeToggle />
    </header>
  );
};
```

### Phase 3: Integrate Globally
**Files to modify:**
- `src/App.jsx` - Add CovenantDock and BreadcrumbRibbon at root level
- `src/pages/HomePage.jsx` - Remove ModernHeader, add bottom padding
- `src/pages/ManuscriptsPage.jsx` - Remove SpatialSidebar usage from ManuscriptViewer
- `src/pages/LSIPage.jsx` - Remove ModernHeader, add bottom padding
- `src/pages/AboutPage.jsx` - Remove ModernHeader, add bottom padding
- `src/components/ManuscriptViewer.jsx` - Remove SpatialSidebar integration

### Phase 4: State Management for Context Items
**Approach:** Use React Context for manuscript-specific state that dock panels need.

```jsx
// ManuscriptsContext.jsx
const ManuscriptsContext = createContext();

export const ManuscriptsProvider = ({ children }) => {
  const [currentBook, setCurrentBook] = useState('GEN');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [viewMode, setViewMode] = useState('chapter');
  const [showRestored, setShowRestored] = useState(true);

  return (
    <ManuscriptsContext.Provider value={{
      currentBook, setCurrentBook,
      currentChapter, setCurrentChapter,
      viewMode, setViewMode,
      showRestored, setShowRestored
    }}>
      {children}
    </ManuscriptsContext.Provider>
  );
};
```

---

## File Structure After Implementation

```
src/components/navigation/
├── index.js                    # Barrel exports
├── CovenantDock.jsx            # Main dock component
├── DockItem.jsx                # Individual dock button
├── DockPanel.jsx               # Slide-out panel base
├── BreadcrumbRibbon.jsx        # Minimal header
├── panels/
│   ├── LibraryPanel.jsx        # Book selection panel
│   ├── ChaptersPanel.jsx       # Chapter selection panel
│   └── SettingsPanel.jsx       # View settings panel
└── hooks/
    ├── useBreadcrumbs.js       # Parse route to breadcrumbs
    └── useMediaQuery.js        # Responsive breakpoint hook
```

---

## CSS/Styling Updates

### New Styles Required

```css
/* covenant-dock.css */
.covenant-dock {
  position: fixed;
  z-index: 50;
  display: flex;
  align-items: center;
  background: rgba(14, 35, 59, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Desktop: Left vertical dock */
@media (min-width: 769px) {
  .covenant-dock {
    left: 1.5rem;
    top: 50%;
    transform: translateY(-50%);
    flex-direction: column;
    width: 4.5rem;
    padding: 1.5rem 0.5rem;
    border-radius: 2.5rem;
    gap: 0.5rem;
  }
}

/* Mobile: Bottom horizontal dock */
@media (max-width: 768px) {
  .covenant-dock {
    bottom: 1.5rem;
    left: 1.5rem;
    right: 1.5rem;
    height: 4rem;
    border-radius: 2rem;
    justify-content: space-around;
    padding: 0.5rem 1rem;
  }
}

/* Breadcrumb Ribbon */
.breadcrumb-ribbon {
  position: sticky;
  top: 0;
  z-index: 40;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  background: rgba(14, 35, 59, 0.6);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* Content padding to avoid dock overlap */
.page-content {
  padding-bottom: calc(5rem + env(safe-area-inset-bottom));
}

@media (min-width: 769px) {
  .page-content {
    padding-left: 6rem;
    padding-bottom: 0;
  }
}
```

---

## Animation & Accessibility

### Reduced Motion Support
All animations will respect `prefers-reduced-motion`:
```jsx
const prefersReducedMotion = useReducedMotion();

const dockVariants = prefersReducedMotion ? {
  initial: { opacity: 1 },
  animate: { opacity: 1 }
} : {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 }
};
```

### Keyboard Navigation
- Arrow keys to move between dock items
- Enter/Space to activate
- Escape to close panels

---

## Migration Path

### Deprecation Strategy
1. Create CovenantDock alongside existing components
2. Integrate on one page at a time (start with ManuscriptsPage)
3. Once verified, roll out to all pages
4. Delete deprecated components:
   - `ModernHeader.jsx` → Replaced by `BreadcrumbRibbon.jsx`
   - `SpatialSidebar.jsx` → Merged into `CovenantDock.jsx`

---

## Verification Checklist

### Functionality
- [ ] All global navigation links work (Home, Manuscripts, Spirit AI, About)
- [ ] BibleNavigator opens from dock
- [ ] Context panels work on manuscripts page (Library, Chapters, Settings)
- [ ] Breadcrumb navigation is clickable and correct
- [ ] Theme toggle works

### Responsiveness
- [ ] Desktop: Left dock, panels slide right
- [ ] Mobile: Bottom dock, panels slide up
- [ ] Tablet: Appropriate breakpoint handling

### Accessibility
- [ ] Keyboard navigation works
- [ ] Reduced motion respected
- [ ] Focus management correct
- [ ] ARIA labels on dock items

### Performance
- [ ] No layout shift on page load
- [ ] Animations GPU-accelerated (willChange hints)
- [ ] Panels lazy-load content

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Breaking existing manuscript navigation | Create alongside existing, test thoroughly before removing |
| Mobile dock too crowded (5 global + 3 context = 8 items) | Use icon-only on mobile, reduce context items |
| State management complexity | Use React Context, sync with Redux for manuscripts |
| CSS specificity conflicts | Namespace all new classes with `covenant-` prefix |

---

## Approval Required

Before implementation, please confirm:

1. **Global items**: Home, Navigate, Manuscripts, Spirit AI, About - correct set?
2. **Context items visibility**: Should manuscript tools (Library/Chapters/Settings) be visible but disabled on other pages, or hidden entirely?
3. **Breadcrumb depth**: How deep should breadcrumbs go? (e.g., Manuscripts > Genesis > Chapter 1 > Verse 12)
4. **Icon set**: Continue using Lucide icons or switch to custom icons?

---

*Plan prepared for user review. Ready to implement upon approval.*
