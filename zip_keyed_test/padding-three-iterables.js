// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zipKeyed||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
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
  assert.compareArray(Object.values(result.value), [1, 'a', true, 'X'], "First zipped value");
  assert.sameValue(result.done, false);
  
  result = iterator.next();
  assert.compareArray(Object.values(result.value), [2, 'P2', false, 'Y'], "Second zipped value with padding");
  assert.sameValue(result.done, false);
  
  result = iterator.next();
  assert.compareArray(Object.values(result.value), ['P1', 'P2', false, 'Z'], "Third zipped value with more padding");
  assert.sameValue(result.done, false);
  
  result = iterator.next();
  assert.compareArray(Object.values(result.value), ['P1', 'P2', true, 'P4'], "Fourth zipped value with continued padding");
  assert.sameValue(result.done, false);
  
  result = iterator.next();
  assert.sameValue(result.value, undefined);
  assert.sameValue(result.done, true);
  
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
  assert.compareArray(Object.values(result.value), [1, 'a', true, 'X']);
  result = iterator.next();
  assert.compareArray(Object.values(result.value), [2, 'PAD2', false, 'Y']);
  result = iterator.next();
  assert.compareArray(Object.values(result.value), [3, 'PAD2', undefined, undefined]);
  
  result = iterator.next();
  assert.sameValue(result.value, undefined);
  assert.sameValue(result.done, true);
  
  // Case 3: No padding provided, default to undefined
  input = {
    a: [1, 2],
    b: ['a', 'b', 'c'],
    c: [true],
    d: ['X', 'Y', 'Z', 'W']
  };
  
  iterator = Iterator.zipKeyed(input, { mode: "longest" });
  
  result = iterator.next();
  assert.compareArray(Object.values(result.value), [1, 'a', true, 'X']);
  result = iterator.next();
  assert.compareArray(Object.values(result.value), [2, 'b', undefined, 'Y']);
  result = iterator.next();
  assert.compareArray(Object.values(result.value), [undefined, 'c', undefined, 'Z']);
  result = iterator.next();
  assert.compareArray(Object.values(result.value), [undefined, undefined, undefined, 'W']);
  
  result = iterator.next();
  assert.sameValue(result.value, undefined);
  assert.sameValue(result.done, true);
  
  reportCompare(0, 0);
  