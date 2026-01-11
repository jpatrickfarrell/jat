/**
 * Signal Card Components
 *
 * Export barrel file for rich signal card components.
 * Each component renders a specific signal type with interactive UI.
 *
 * @see shared/rich-signals-plan.md for design documentation
 * @see src/lib/types/richSignals.ts for type definitions
 */

// Core signal cards
export { default as WorkingSignalCard } from './WorkingSignalCard.svelte';
export { default as ReviewSignalCard } from './ReviewSignalCard.svelte';
export { default as NeedsInputSignalCard } from './NeedsInputSignalCard.svelte';
export { default as CompletingSignalCard } from './CompletingSignalCard.svelte';
// CompletedSignalCard removed - completion info now rendered via EventStack
export { default as IdleSignalCard } from './IdleSignalCard.svelte';

// Additional signal cards
export { default as StartingSignalCard } from './StartingSignalCard.svelte';
export { default as CompactingSignalCard } from './CompactingSignalCard.svelte';
