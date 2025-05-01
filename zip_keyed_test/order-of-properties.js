// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zipKeyed||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator-zipKeyed
description: >
  The order of properties reported by Object.keys() on the output object is the same as
  that of the own enumerable properties on the input object.
info: |
  The keys are collected using a method like Reflect.ownKeys() in the order defined
  on the input object, and the output object preserves that order.
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
    first: [1, 2],
    second: [3, 4],
    third: [5, 6]
  };
  
  let expectedOrder = Object.keys(input);  // e.g., ["first", "second", "third"]
  
  let iter = Iterator.zipKeyed(input);
  let result = iter.next();
  assertEq(result.done, false, "Iterator.zipKeyed should yield a result");
  
  let outObj = result.value;
  assertDeepEq(Object.keys(outObj), expectedOrder,
    "The order of keys on the output object should match the order on the input");
  
  reportCompare(0, 0);
  