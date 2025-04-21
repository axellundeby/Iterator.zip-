// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zip||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Ensures that each value returned by Iterator.zip is an array.
info: |
  Iterator.zip ( iterables [, options] )

  - Each value produced by the iterator should be an array containing elements from each input iterable.
features: [iterator-sequencing]
---*/
let arg1 = ['a', 'b', 'c'];
let arg2 = [1, 2, 3];

let iter = Iterator.zip([arg1, arg2]);

let result1 = iter.next();
assert.sameValue(Array.isArray(result1.value), true, "First result should be an array");

let result2 = iter.next();
assert.sameValue(Array.isArray(result2.value), true, "Second result should be an array");

let result3 = iter.next();
assert.sameValue(Array.isArray(result3.value), true, "Third result should be an array");

let result4 = iter.next();
assert.sameValue(result4.done, true, "Iterator should be finished after three results");

reportCompare(0, 0);