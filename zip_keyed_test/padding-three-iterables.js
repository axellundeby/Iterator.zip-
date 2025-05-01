// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zipKeyed||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zipKeyed
description: >
  Ensures that in "longest" mode, Iterator.zipKeyed correctly applies padding with four properties.
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

// Case 1: Explicit padding for all properties
let input = {
    a: [1, 2],
    b: ['a'],
    c: [true, false, false, true],
    d: ['X', 'Y', 'Z']
  };
  
  let iterator = Iterator.zipKeyed(input, {
    mode: "longest",
    padding: { a: 'P1', b: 'P2', c: 'P3', d: 'P4' }
  });
  
  let result = iterator.next();
  assertDeepEq(Object.values(result.value), [1, 'a', true, 'X'], "First zipped value");
  assertEq(result.done, false);
  
  result = iterator.next();
  assertDeepEq(Object.values(result.value), [2, 'P2', false, 'Y'], "Second zipped value with padding");
  assertEq(result.done, false);
  
  result = iterator.next();
  assertDeepEq(Object.values(result.value), ['P1', 'P2', false, 'Z'], "Third zipped value with more padding");
  assertEq(result.done, false);
  
  result = iterator.next();
  assertDeepEq(Object.values(result.value), ['P1', 'P2', true, 'P4'], "Fourth zipped value with continued padding");
  assertEq(result.done, false);
  
  result = iterator.next();
  assertEq(result.value, undefined);
  assertEq(result.done, true);
  
  // Case 2: Partial padding, rest default to undefined
  input = {
    a: [1, 2, 3],
    b: ['a'],
    c: [true, false],
    d: ['X', 'Y']
  };
  
  iterator = Iterator.zipKeyed(input, {
    mode: "longest",
    padding: { a: 'PAD1', b: 'PAD2' }
  });
  
  result = iterator.next();
  assertDeepEq(Object.values(result.value), [1, 'a', true, 'X']);
  result = iterator.next();
  assertDeepEq(Object.values(result.value), [2, 'PAD2', false, 'Y']);
  result = iterator.next();
  assertDeepEq(Object.values(result.value), [3, 'PAD2', undefined, undefined]);
  
  result = iterator.next();
  assertEq(result.value, undefined);
  assertEq(result.done, true);
  
  // Case 3: No padding provided, default to undefined
  input = {
    a: [1, 2],
    b: ['a', 'b', 'c'],
    c: [true],
    d: ['X', 'Y', 'Z', 'W']
  };
  
  iterator = Iterator.zipKeyed(input, { mode: "longest" });
  
  result = iterator.next();
  assertDeepEq(Object.values(result.value), [1, 'a', true, 'X']);
  result = iterator.next();
  assertDeepEq(Object.values(result.value), [2, 'b', undefined, 'Y']);
  result = iterator.next();
  assertDeepEq(Object.values(result.value), [undefined, 'c', undefined, 'Z']);
  result = iterator.next();
  assertDeepEq(Object.values(result.value), [undefined, undefined, undefined, 'W']);
  
  result = iterator.next();
  assertEq(result.value, undefined);
  assertEq(result.done, true);
  
  reportCompare(0, 0);
  