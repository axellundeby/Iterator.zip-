// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zip||!xulRuntime.shell)
// Copyright (C) 2025 Axel Martinius Lundeby. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Ensures that Iterator.zip accepts IteratorHelper instances as input iterables.
info: |
  - Zipping IteratorHelpers like those created by .map, .filter, etc., should work like normal.
features: [iterator-sequencing]
---*/

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


let iter1 = Iterator.from([1, 2, 3]).map(x => x * 2); // [2, 4, 6]
let iter2 = Iterator.from(['a', 'b', 'c']).filter(x => x !== 'z'); // ['a', 'b', 'c']

let zipped = Iterator.zip([iter1, iter2]);

let result = zipped.next();
assertDeepEq(result.value, [2, 'a']);
assertEq(result.done, false);

result = zipped.next();
assertDeepEq(result.value, [4, 'b']);
assertEq(result.done, false);

result = zipped.next();
assertDeepEq(result.value, [6, 'c']);
assertEq(result.done, false);

result = zipped.next();
assertEq(result.done, true);
assertEq(result.value, undefined);

reportCompare(0, 0);
