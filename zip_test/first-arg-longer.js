// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zip||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Ensures that Iterator.zip stops when the shortest iterable is exhausted.
info: |
  - When given two iterables of different lengths with no options,
    the iterator stops when the shorter iterable is exhausted.
features: [iterator-sequencing]
---*/

let longer = [1, 2, 3, 4];
let shorter = ['a', 'b'];

let iterator = Iterator.zip([longer, shorter]);

let result = iterator.next();
assert.compareArray(result.value, [1, 'a'], "First zipped value should be [1, 'a']");
assert.sameValue(result.done, false, "Iterator should not be done after first next()");

result = iterator.next();
assert.compareArray(result.value, [2, 'b'], "Second zipped value should be [2, 'b']");
assert.sameValue(result.done, false, "Iterator should not be done after second next()");

// Should stop because `shorter` is exhausted
result = iterator.next();
assert.sameValue(result.value, undefined, "Iterator should return undefined after exhaustion");
assert.sameValue(result.done, true, "Iterator should be done after shortest iterable is exhausted");

reportCompare(0, 0);
