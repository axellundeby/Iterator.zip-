// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zipKeyed||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zipKeyed
description: >
  Ensures that in "longest" mode, Iterator.zipKeyed correctly applies padding.
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

// Case 1: Explicit padding for all keys
let input1 = {
    one:   [1, 2],
    two:   ['a'],
    three: [true, false, false, true]
  };
  
  let it1 = Iterator.zipKeyed(input1, {
    mode:    "longest",
    padding: { one: 'X', two: 'Y', three: 'Z' }
  });
  
  let r = it1.next();
  assertEq(r.done, false, "Iterator should not be done after first next()");
  assertDeepEq(
    Object.values(r.value),
    [1, 'a', true],
    "First zipped value should be { one:1, two:'a', three:true }"
  );
  
  r = it1.next();
  assertEq(r.done, false, "Iterator should not be done after second next()");
  assertDeepEq(
    Object.values(r.value),
    [2, 'Y', false],
    "Second zipped value should use explicit padding for 'two'"
  );
  
  r = it1.next();
  assertEq(r.done, false, "Iterator should not be done after third next()");
  assertDeepEq(
    Object.values(r.value),
    ['X', 'Z', false],
    "Third zipped value should pad 'one' and 'two' with 'X'/'Z'"
  );
  
  r = it1.next();
  assertEq(r.done, false, "Iterator should not be done after fourth next()");
  assertDeepEq(
    Object.values(r.value),
    ['X', 'Z', true],
    "Fourth zipped value should continue padding"
  );
  
  r = it1.next();
  assertEq(r.done, true,  "Iterator should be done after all items are exhausted");
  assertEq(r.value, undefined, "Final value should be undefined when done");
  
  // Case 2: Some keys have explicit padding, others default to undefined
  let input2 = {
    one:   [1, 2, 3],
    two:   ['a'],
    three: [true, false]
  };
  
  let it2 = Iterator.zipKeyed(input2, {
    mode:    "longest",
    padding: { two: 'PAD' }
  });
  
  r = it2.next();
  assertEq(r.done, false, "Iterator should not be done after first next()");
  assertDeepEq(
    Object.values(r.value),
    [1, 'a', true],
    "First zipped value should be { one:1, two:'a', three:true }"
  );
  
  r = it2.next();
  assertEq(r.done, false, "Iterator should not be done after second next()");
  assertDeepEq(
    Object.values(r.value),
    [2, 'PAD', false],
    "Second zipped value should pad 'two' with 'PAD'"
  );
  
  r = it2.next();
  assertEq(r.done, false, "Iterator should not be done after third next()");
  assertDeepEq(
    Object.values(r.value),
    [3, 'PAD', undefined],
    "Third zipped value should pad 'three' with undefined"
  );
  
  r = it2.next();
  assertEq(r.done, true,  "Iterator should be done after all items are exhausted");
  assertEq(r.value, undefined, "Final value should be undefined when done");
  
  // Case 3: No explicit padding, default to undefined
  let input3 = {
    one:   [1, 2],
    two:   ['a', 'b', 'c'],
    three: [true]
  };
  
  let it3 = Iterator.zipKeyed(input3, { mode: "longest" });
  
  r = it3.next();
  assertEq(r.done, false, "Iterator should not be done after first next()");
  assertDeepEq(
    Object.values(r.value),
    [1, 'a', true],
    "First zipped value should be { one:1, two:'a', three:true }"
  );
  
  r = it3.next();
  assertEq(r.done, false, "Iterator should not be done after second next()");
  assertDeepEq(
    Object.values(r.value),
    [2, 'b', undefined],
    "Second zipped value should pad 'three' with undefined"
  );
  
  r = it3.next();
  assertEq(r.done, false, "Iterator should not be done after third next()");
  assertDeepEq(
    Object.values(r.value),
    [undefined, 'c', undefined],
    "Third zipped value should pad 'one' and 'three' with undefined"
  );
  
  r = it3.next();
  assertEq(r.done, true,  "Iterator should be done after all items are exhausted");
  assertEq(r.value, undefined, "Final value should be undefined when done");
  
  reportCompare(0, 0);
  