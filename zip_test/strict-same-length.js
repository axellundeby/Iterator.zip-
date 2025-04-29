// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zip||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Ensures that in strict mode, Iterator.zip consumes all iterators fully when lengths match.
info: |
  - In "strict" mode, all iterators must have the same length.
  - When one iterator completes, .next() must still be called on the rest to check for completion.
features: [iterator-sequencing]
---*/

let first = [1, 2, 3];
let second = ['a', 'b', 'c'];
let third = [true, false, null];

let iterator = Iterator.zip([first, second, third], { mode: "strict" });

let result = iterator.next();
assertDeepEq(result.value, [1, 'a', true], "First zipped value should be [1, 'a', true]");
assertEq(result.done, false, "Iterator should not be done after first next()");

result = iterator.next();
assertDeepEq(result.value, [2, 'b', false], "Second zipped value should be [2, 'b', false]");
assertEq(result.done, false, "Iterator should not be done after second next()");

result = iterator.next();
assertDeepEq(result.value, [3, 'c', null], "Third zipped value should be [3, 'c', null]");
assertEq(result.done, false, "Iterator should not be done after third next()");

// Ensure all iterators are fully consumed
result = iterator.next();
assertEq(result.value, undefined, "Iterator should return undefined after full consumption");
assertEq(result.done, true, "Iterator should be done after all iterables are exhausted");

reportCompare(0, 0);
