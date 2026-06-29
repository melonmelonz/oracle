// Shared reactive state for the command palette, so the nav trigger and the
// global keyboard shortcut can both open it.
export const palette = $state({ open: false });
