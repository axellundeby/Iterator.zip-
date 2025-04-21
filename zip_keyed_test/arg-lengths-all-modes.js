// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zipKeyed||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
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
  assert.sameValue(result.done, false, "Iterator should not be done after first next()");
  assert.sameValue(result.value.long, 1, "First value for 'long' should be 1");
  assert.sameValue(result.value.short, 'a', "First value for 'short' should be 'a'");
  
  result = iterator.next();
  assert.sameValue(result.done, false, "Iterator should not be done after second next()");
  assert.sameValue(result.value.long, 2, "Second value for 'long' should be 2");
  assert.sameValue(result.value.short, 'b', "Second value for 'short' should be 'b'");
  
  // Stops at shortest iterable
  result = iterator.next();
  assert.sameValue(result.value, undefined, "Iterator should return undefined after exhaustion");
  assert.sameValue(result.done, true, "Iterator should be done after shortest iterable ends");
  
  // Longest mode with padding
  iterator = Iterator.zipKeyed(input, {
    mode: "longest",
    padding: { short: null, long: null }
  });
  
  result = iterator.next();
  assert.sameValue(result.value.long, 1);
  assert.sameValue(result.value.short, 'a');
  
  result = iterator.next();
  assert.sameValue(result.value.long, 2);
  assert.sameValue(result.value.short, 'b');
  
  result = iterator.next();
  assert.sameValue(result.value.long, 3, "Longer continues; shorter padded");
  assert.sameValue(result.value.short, null);
  
  result = iterator.next();
  assert.sameValue(result.value.long, 4);
  assert.sameValue(result.value.short, null);
  
  result = iterator.next();
  assert.sameValue(result.done, true, "Longest iterable exhausted");
  assert.sameValue(result.value, undefined);
  
  // Strict mode: throws if lengths differ
  assert.throws(TypeError, () => {
    iterator = Iterator.zipKeyed(input, { mode: "strict" });
    iterator.next();
  }, "Strict mode should throw if property iterables have different lengths");
  
  reportCompare(0, 0);
  