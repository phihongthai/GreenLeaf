import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dropTile } from './unscramble.ts';

test('tray tile dropped between two letters is inserted there', () => {
  assert.deepEqual(dropTile([5, 6], 9, { kind: 'tray' }, 1), [5, 9, 6]);
});
test('tray tile dropped before the first / after the last', () => {
  assert.deepEqual(dropTile([5, 6], 9, { kind: 'tray' }, 0), [9, 5, 6]);
  assert.deepEqual(dropTile([5, 6], 9, { kind: 'tray' }, 2), [5, 6, 9]);
});
test('gap beyond the filled letters appends', () => {
  assert.deepEqual(dropTile([5], 9, { kind: 'tray' }, 7), [5, 9]);
});
test('moving a letter later in the row accounts for the gap it leaves', () => {
  // [a b c] move a to after c (gap 3)
  assert.deepEqual(dropTile([1, 2, 3], 1, { kind: 'slot', slot: 0 }, 3), [2, 3, 1]);
});
test('moving a letter earlier in the row', () => {
  assert.deepEqual(dropTile([1, 2, 3], 3, { kind: 'slot', slot: 2 }, 0), [3, 1, 2]);
});
test('dropping a letter beside itself changes nothing', () => {
  assert.deepEqual(dropTile([1, 2, 3], 2, { kind: 'slot', slot: 1 }, 1), [1, 2, 3]);
  assert.deepEqual(dropTile([1, 2, 3], 2, { kind: 'slot', slot: 1 }, 2), [1, 2, 3]);
});
test('letter let go away from the row returns to the tray; tray tile stays put', () => {
  assert.deepEqual(dropTile([1, 2, 3], 2, { kind: 'slot', slot: 1 }, null), [1, 3]);
  assert.deepEqual(dropTile([1, 2], 9, { kind: 'tray' }, null), [1, 2]);
});
