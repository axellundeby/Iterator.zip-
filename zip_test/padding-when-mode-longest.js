// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zip||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Ensures that in "longest" mode, Iterator.zip correctly applies padding.
info: |
  - When mode is "longest", shorter iterables are padded.
  - Padding defaults to undefined if not provided.
  - If padding is given, it applies only where necessary.
features: [iterator-sequencing]
---*/

// Case 1: Explicit padding for all iterables
let iter1 = [1, 2];
let iter2 = ['a'];
let iter3 = [true, false, false, true];

let iterator = Iterator.zip([iter1, iter2, iter3], { mode: "longest", padding: ['X', 'Y', 'Z'] });

let result = iterator.next();
assert.compareArray(result.value, [1, 'a', true], "First zipped value should be [1, 'a', true]");
assert.sameValue(result.done, false, "Iterator should not be done after first next()");

result = iterator.next();
assert.compareArray(result.value, [2, 'Y', false], "Second zipped value should use explicit padding");
assert.sameValue(result.done, false, "Iterator should not be done after second next()");

result = iterator.next();
assert.compareArray(result.value, ['X', 'Z', false], "Third zipped value should pad shorter iterables");
assert.sameValue(result.done, false, "Iterator should not be done after third next()");

result = iterator.next();
assert.compareArray(result.value, ['X', 'Z', true], "Fourth zipped value should continue padding");
assert.sameValue(result.done, false, "Iterator should not be done after fourth next()");

result = iterator.next();
assert.sameValue(result.value, undefined, "Iterator should return undefined after full consumption");
assert.sameValue(result.done, true, "Iterator should be done after all iterables are exhausted");

// Case 2: Some iterables have explicit padding, others default to undefined
iter1 = [1, 2, 3];
iter2 = ['a'];
iter3 = [true, false];

iterator = Iterator.zip([iter1, iter2, iter3], { mode: "longest", padding: ['PAD'] });

result = iterator.next();
assert.compareArray(result.value, [1, 'a', true], "First zipped value should be [1, 'a', true]");
assert.sameValue(result.done, false, "Iterator should not be done after first next()");

result = iterator.next();
assert.compareArray(result.value, [2, 'PAD', false], "Second zipped value should pad iter2 with 'PAD'");
assert.sameValue(result.done, false, "Iterator should not be done after second next()");

result = iterator.next();
assert.compareArray(result.value, [3, 'PAD', undefined], "Third zipped value should pad iter3 with undefined");
assert.sameValue(result.done, false, "Iterator should not be done after third next()");

result = iterator.next();
assert.sameValue(result.value, undefined, "Iterator should return undefined after full consumption");
assert.sameValue(result.done, true, "Iterator should be done after all iterables are exhausted");

// Case 3: No explicit padding, should default to undefined
iter1 = [1, 2];
iter2 = ['a', 'b', 'c'];
iter3 = [true];

iterator = Iterator.zip([iter1, iter2, iter3], { mode: "longest" });

result = iterator.next();
assert.compareArray(result.value, [1, 'a', true], "First zipped value should be [1, 'a', true]");
assert.sameValue(result.done, false, "Iterator should not be done after first next()");

result = iterator.next();
assert.compareArray(result.value, [2, 'b', undefined], "Second zipped value should pad iter3 with undefined");
assert.sameValue(result.done, false, "Iterator should not be done after second next()");

result = iterator.next();
assert.compareArray(result.value, [undefined, 'c', undefined], "Third zipped value should pad iter1 and iter3 with undefined");
assert.sameValue(result.done, false, "Iterator should not be done after third next()");

result = iterator.next();
assert.sameValue(result.value, undefined, "Iterator should return undefined after full consumption");
assert.sameValue(result.done, true, "Iterator should be done after all iterables are exhausted");

reportCompare(0, 0);
