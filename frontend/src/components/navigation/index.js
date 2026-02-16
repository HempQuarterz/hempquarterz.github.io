/**
 * Navigation Components - Barrel Export
 * Note: BibleNavigator is in ../Navigation (capital N) - import separately
 */

// Main components
export { default as CovenantDock } from './CovenantDock';
export { ManuscriptDockContext, useManuscriptDock } from './CovenantDock';
export { default as BreadcrumbRibbon } from './BreadcrumbRibbon';
export { default as GlobalDockProvider } from './GlobalDockProvider';

// Sub-components
export { default as DockItem } from './DockItem';
export { default as DockPanel, panelContentVariants, panelItemVariants } from './DockPanel';

// Panels
export { default as LibraryPanel } from './panels/LibraryPanel';
export { default as ChaptersPanel } from './panels/ChaptersPanel';
export { default as SettingsPanel } from './panels/SettingsPanel';

// Hooks
export { default as useBreadcrumbs } from './hooks/useBreadcrumbs';
