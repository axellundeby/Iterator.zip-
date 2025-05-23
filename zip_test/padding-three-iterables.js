// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zip||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Ensures that in "longest" mode, Iterator.zip correctly applies padding with three iterables.
info: |
  - When mode is "longest", shorter iterables are padded.
  - Padding defaults to undefined if not provided.
  - If padding is given, it applies only where necessary.
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


// Case 1: Explicit padding for all iterables
let iter1 = [1, 2];
let iter2 = ['a'];
let iter3 = [true, false, false, true];
let iter4 = ['X', 'Y', 'Z'];

let iterator = Iterator.zip([iter1, iter2, iter3, iter4], { mode: "longest", padding: ['P1', 'P2', 'P3', 'P4'] });

let result = iterator.next();
assertDeepEq(result.value, [1, 'a', true, 'X'], "First zipped value should be [1, 'a', true, 'X']");
assertEq(result.done, false, "Iterator should not be done after first next()");

result = iterator.next();
assertDeepEq(result.value, [2, 'P2', false, 'Y'], "Second zipped value should use explicit padding");
assertEq(result.done, false, "Iterator should not be done after second next()");

result = iterator.next();
assertDeepEq(result.value, ['P1', 'P2', false, 'Z'], "Third zipped value should pad shorter iterables");
assertEq(result.done, false, "Iterator should not be done after third next()");

result = iterator.next();
assertDeepEq(result.value, ['P1', 'P2', true, 'P4'], "Fourth zipped value should continue padding");
assertEq(result.done, false, "Iterator should not be done after fourth next()");

result = iterator.next();
assertEq(result.value, undefined, "Iterator should return undefined after full consumption");
assertEq(result.done, true, "Iterator should be done after all iterables are exhausted");

// Case 2: Some iterables have explicit padding, others default to undefined
iter1 = [1, 2, 3];
iter2 = ['a'];
iter3 = [true, false];
iter4 = ['X', 'Y'];

iterator = Iterator.zip([iter1, iter2, iter3, iter4], { mode: "longest", padding: ['PAD1', 'PAD2'] });

result = iterator.next();
assertDeepEq(result.value, [1, 'a', true, 'X'], "First zipped value should be [1, 'a', true, 'X']");
assertEq(result.done, false, "Iterator should not be done after first next()");

result = iterator.next();
assertDeepEq(result.value, [2, 'PAD2', false, 'Y'], "Second zipped value should pad iter2 with 'PAD2'");
assertEq(result.done, false, "Iterator should not be done after second next()");

result = iterator.next();
assertDeepEq(result.value, [3, 'PAD2', undefined, undefined], "Third zipped value should pad iter3 and iter4 with undefined");
assertEq(result.done, false, "Iterator should not be done after third next()");

result = iterator.next();
assertEq(result.value, undefined, "Iterator should return undefined after full consumption");
assertEq(result.done, true, "Iterator should be done after all iterables are exhausted");

// Case 3: No explicit padding, should default to undefined
iter1 = [1, 2];
iter2 = ['a', 'b', 'c'];
iter3 = [true];
iter4 = ['X', 'Y', 'Z', 'W'];

iterator = Iterator.zip([iter1, iter2, iter3, iter4], { mode: "longest" });

result = iterator.next();
assertDeepEq(result.value, [1, 'a', true, 'X'], "First zipped value should be [1, 'a', true, 'X']");
assertEq(result.done, false, "Iterator should not be done after first next()");

result = iterator.next();
assertDeepEq(result.value, [2, 'b', undefined, 'Y'], "Second zipped value should pad iter3 with undefined");
assertEq(result.done, false, "Iterator should not be done after second next()");

result = iterator.next();
assertDeepEq(result.value, [undefined, 'c', undefined, 'Z'], "Third zipped value should pad iter1 and iter3 with undefined");
assertEq(result.done, false, "Iterator should not be done after third next()");

result = iterator.next();
assertDeepEq(result.value, [undefined, undefined, undefined, 'W'], "Fourth zipped value should pad iter1, iter2, iter3 with undefined");
assertEq(result.done, false, "Iterator should not be done after fourth next()");

result = iterator.next();
assertEq(result.value, undefined, "Iterator should return undefined after full consumption");
assertEq(result.done, true, "Iterator should be done after all iterables are exhausted");

reportCompare(0, 0);
