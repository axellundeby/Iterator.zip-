// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zipKeyed||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zipKeyed
description: >
  Ensures that Iterator.zipKeyed respects the different modes: shortest, longest, and strict.
info: |
  - In "shortest" mode (default), the iterator stops when the shortest iterable is exhausted.
  - In "longest" mode, padding is used when shorter iterables are exhausted.
  - In "strict" mode, an error is thrown if the iterables do not have the same length.
features: [iterator-sequencing]
---*/

let input = {
    long: [1, 2, 3, 4],
    short: ['a', 'b']
  };
  
  // Default mode: "shortest"
  let iterator = Iterator.zipKeyed(input);
  
  let result = iterator.next();
  assertEq(result.done, false, "Iterator should not be done after first next()");
  assertEq(result.value.long, 1, "First value for 'long' should be 1");
  assertEq(result.value.short, 'a', "First value for 'short' should be 'a'");
  
  result = iterator.next();
  assertEq(result.done, false, "Iterator should not be done after second next()");
  assertEq(result.value.long, 2, "Second value for 'long' should be 2");
  assertEq(result.value.short, 'b', "Second value for 'short' should be 'b'");
  
  // Stops at shortest iterable
  result = iterator.next();
  assertEq(result.value, undefined, "Iterator should return undefined after exhaustion");
  assertEq(result.done, true, "Iterator should be done after shortest iterable ends");
  
  // Longest mode with padding
  iterator = Iterator.zipKeyed(input, {
    mode: "longest",
    padding: { short: null, long: null }
  });
  
  result = iterator.next();
  assertEq(result.value.long, 1);
  assertEq(result.value.short, 'a');
  
  result = iterator.next();
  assertEq(result.value.long, 2);
  assertEq(result.value.short, 'b');
  
  result = iterator.next();
  assertEq(result.value.long, 3, "Longer continues; shorter padded");
  assertEq(result.value.short, null);
  
  result = iterator.next();
  assertEq(result.value.long, 4);
  assertEq(result.value.short, null);
  
  result = iterator.next();
  assertEq(result.done, true, "Longest iterable exhausted");
  assertEq(result.value, undefined);
  
  // Strict mode: throws if lengths differ
  assertThrowsInstanceOf(() => {
    iterator = Iterator.zipKeyed(input, { mode: "strict" });
    iterator.next();
  }, TypeError, "Strict mode should throw if property iterables have different lengths");
  
  reportCompare(0, 0);
  