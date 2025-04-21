// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zip||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Ensures that Iterator.zip respects the different modes: shortest, longest, and strict.
info: |
  - In "shortest" mode (default), the iterator stops when the shortest iterable is exhausted.
  - In "longest" mode, padding is used when shorter iterables are exhausted.
  - In "strict" mode, an error is thrown if the iterables do not have the same length.
features: [iterator-sequencing]
---*/

let longer = [1, 2, 3, 4];
let shorter = ['a', 'b'];

// Default mode ("shortest")
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

// "longest" mode with padding
iterator = Iterator.zip([longer, shorter], { mode: "longest", padding: [null] });

result = iterator.next();
assert.compareArray(result.value, [1, 'a'], "First zipped value should be [1, 'a']");
assert.sameValue(result.done, false, "Iterator should not be done after first next()");

result = iterator.next();
assert.compareArray(result.value, [2, 'b'], "Second zipped value should be [2, 'b']");
assert.sameValue(result.done, false, "Iterator should not be done after second next()");

result = iterator.next();
assert.compareArray(result.value, [3, null], "Padding should be used for longer iterable");
assert.sameValue(result.done, false, "Iterator should continue after using padding");

result = iterator.next();
assert.compareArray(result.value, [4, null], "Padding should be used for longer iterable");
assert.sameValue(result.done, false, "Iterator should continue after using padding");

result = iterator.next();
assert.sameValue(result.value, undefined, "Iterator should return undefined after exhaustion");
assert.sameValue(result.done, true, "Iterator should be done after longest iterable is exhausted");

// "strict" mode (should throw an error)
assert.throws(TypeError, () => {
  iterator = Iterator.zip([longer, shorter], { mode: "strict" });
  iterator.next();
}, "Strict mode should throw if iterables have different lengths");

reportCompare(0, 0);
