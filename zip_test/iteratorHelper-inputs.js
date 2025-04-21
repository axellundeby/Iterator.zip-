// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zip||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Ensures that Iterator.zip accepts IteratorHelper instances as input iterables.
info: |
  - Zipping IteratorHelpers like those created by .map, .filter, etc., should work like normal.
features: [iterator-sequencing]
---*/

let iter1 = Iterator.from([1, 2, 3]).map(x => x * 2); // [2, 4, 6]
let iter2 = Iterator.from(['a', 'b', 'c']).filter(x => x !== 'z'); // ['a', 'b', 'c']

let zipped = Iterator.zip([iter1, iter2]);

let result = zipped.next();
assert.compareArray(result.value, [2, 'a']);
assert.sameValue(result.done, false);

result = zipped.next();
assert.compareArray(result.value, [4, 'b']);
assert.sameValue(result.done, false);

result = zipped.next();
assert.compareArray(result.value, [6, 'c']);
assert.sameValue(result.done, false);

result = zipped.next();
assert.sameValue(result.done, true);
assert.sameValue(result.value, undefined);

reportCompare(0, 0);
