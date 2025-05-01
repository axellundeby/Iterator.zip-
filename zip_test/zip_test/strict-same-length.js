// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zip||!xulRuntime.shell)
// Copyright (C) 2025 Axel Martinius Lundeby. All rights reserved.
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

if (typeof assertDeepEq === 'undefined') {
  function assertDeepEq(actual, expected, message) {
    if (!Array.isArray(actual) || !Array.isArray(expected) || actual.length !== expected.length) {
      throw new Error(`Assertion failed: ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
    }
    for (let i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) {
        throw new Error(`Assertion failed at index ${i}: ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
      }
    }
  }
}

let first = [1, 2, 3];
let second = ['a', 'b', 'c'];
let third = [true, false, null];

let iterator = Iterator.zip([first, second, third], { mode: "strict" });

// First value
let result = iterator.next();
assertDeepEq(result.value, [1, 'a', true], "First zipped value should be [1, 'a', true]");
assertEq(result.done, false, "Iterator should not be done after first next()");

// Second value
result = iterator.next();
assertDeepEq(result.value, [2, 'b', false], "Second zipped value should be [2, 'b', false]");
assertEq(result.done, false, "Iterator should not be done after second next()");

// Third value
result = iterator.next();
assertDeepEq(result.value, [3, 'c', null], "Third zipped value should be [3, 'c', null]");
assertEq(result.done, false, "Iterator should not be done after third next()");

// Exhaustion
result = iterator.next();
assertEq(result.value, undefined, "Iterator should return undefined after full consumption");
assertEq(result.done, true, "Iterator should be done after all iterables are exhausted");

reportCompare(0, 0);
