// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zipKeyed||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zipKeyed
description: >
  Ensures that in strict mode, Iterator.zipKeyed consumes all iterators fully when lengths match.
info: |
  - In "strict" mode, all property iterables must have the same length.
  - .next() must still be called on all iterators to confirm full completion.
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

let input = {
    one: [1, 2, 3],
    two: ['a', 'b', 'c'],
    three: [true, false, null]
  };
  
  let iterator = Iterator.zipKeyed(input, { mode: "strict" });
  
  let result = iterator.next();
  assertEq(result.done, false, "Iterator should not be done after first next()");
  assertDeepEq(Object.values(result.value), [1, 'a', true], "First zipped object values should be correct");
  
  result = iterator.next();
  assertEq(result.done, false, "Iterator should not be done after second next()");
  assertDeepEq(Object.values(result.value), [2, 'b', false], "Second zipped object values should be correct");
  
  result = iterator.next();
  assertEq(result.done, false, "Iterator should not be done after third next()");
  assertDeepEq(Object.values(result.value), [3, 'c', null], "Third zipped object values should be correct");
  
  // Ensure all iterators are fully consumed
  result = iterator.next();
  assertEq(result.value, undefined, "Iterator should return undefined after full consumption");
  assertEq(result.done, true, "Iterator should be done after all values are consumed");
  
  reportCompare(0, 0);
  