// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zipKeyed||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zipKeyed
description: >
  Iterator.zipKeyed respects JS property key enumeration order:
  integer-like keys in ascending order, then string keys in insertion order.
info: |
  - Property keys "2", "1", "0" should be ordered numerically.
  - Non-integer string keys should follow in insertion order.
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

let obj = {
    "2": ['a'],
    "1": ['b'],
    "0": ['c'],
    x: ['X'],
    y: ['Y']
  };
  
  let expectedOrder = ["0", "1", "2", "x", "y"];
  let seenOrder = [];
  
  let iter = Iterator.zipKeyed(obj);
  let { value, done } = iter.next();
  
  for (let key of Object.keys(value)) {
    seenOrder.push(key);
  }
  
  assertDeepEq(seenOrder, expectedOrder, "Keys should be ordered per JS property enumeration rules");
  
  reportCompare(0, 0);
  