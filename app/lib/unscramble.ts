// Pure helpers for the Unscramble answer row (no React), so the drag-and-drop rules can be tested.

export type DragFrom = { kind: 'tray' } | { kind: 'slot'; slot: number };

/**
 * `picked` is the ordered list of tile indices in the answer row. Dropping `tile` at `gap`
 * (0 = before the first letter, picked.length+ = after the last) inserts it there. A tile that
 * is already in the row is first lifted out, so dragging a letter right past itself is a no-op
 * and dragging it elsewhere is a reorder.
 */
export function dropTile(picked: number[], tile: number, from: DragFrom, gap: number | null): number[] {
  if (gap === null) {
    // let go away from the row: a letter that was in it goes back to the tray
    return from.kind === 'slot' ? picked.filter((t) => t !== tile) : picked;
  }
  const without = picked.filter((t) => t !== tile);
  let at = gap;
  if (from.kind === 'slot' && from.slot < gap) at = gap - 1;
  at = Math.max(0, Math.min(at, without.length));
  return [...without.slice(0, at), tile, ...without.slice(at)];
}
