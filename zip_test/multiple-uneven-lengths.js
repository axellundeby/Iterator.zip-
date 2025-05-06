// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zip||!xulRuntime.shell)
// Copyright (C) 2025 Axel Martinius Lundeby. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Ensures that Iterator.zip works with more than two iterables of different lengths in all modes.
info: |
  - Tests shortest, longest, and strict modes with 4 iterables of varying lengths.
features: [iterator-sequencing]
---*/

// Polyfill assertDeepEq if not available
if (typeof assertDeepEq === 'undefined') {
  function assertDeepEq(actual, expected, message = '') {
    if (!isDeepEqual(actual, expected)) {
      throw new Error(`Assertion failed: ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
    }
  }

  function isDeepEqual(a, b) {
    if (a === b) return true;
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((val, i) => isDeepEqual(val, b[i]));
    }
    return false;
  }
}

// Inputs of length: 4, 3, 2, 1
let A = ['a1', 'a2', 'a3', 'a4'];
let B = ['b1', 'b2', 'b3'];
let C = ['c1', 'c2'];
let D = ['d1'];

// --- Shortest mode (default) ---
let iter = Iterator.zip([A, B, C, D]);

let result = iter.next();
assertDeepEq(result.value, ['a1', 'b1', 'c1', 'd1']);
result = iter.next();
assertEq(result.done, true);

// --- Longest mode with explicit padding ---
iter = Iterator.zip([A, B, C, D], { mode: "longest", padding: ['xA', 'xB', 'xC', 'xD'] });

let expected = [
  ['a1', 'b1', 'c1', 'd1'],
  ['a2', 'b2', 'c2', 'xD'],
  ['a3', 'b3', 'xC', 'xD'],
  ['a4', 'xB', 'xC', 'xD']
];

for (let i = 0; i < expected.length; i++) {
  result = iter.next();
  assertDeepEq(result.value, expected[i], `Zipped value at index ${i} should match`);
}
assertEq(iter.next().done, true);

// --- Strict mode should throw ---

assertThrowsInstanceOf(
  () => Iterator.zip([['a1'], [], ['c1']], { mode: "strict" }).next(),
  TypeError,
  "Strict mode: iterators ended at different times"
);


reportCompare(0, 0);
