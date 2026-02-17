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

// Hooks
export { default as useBreadcrumbs } from './hooks/useBreadcrumbs';
