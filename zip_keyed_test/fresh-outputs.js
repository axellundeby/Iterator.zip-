// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zipKeyed||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zipKeyed
description: >
  Ensures that each object returned by Iterator.zipKeyed is a fresh object with a different identity.
info: |
  - Each call to `.next()` must return a new result object.
  - The `value` property of each result must also be a unique object (not reused).
features: [iterator-sequencing]
---*/
if (typeof assertNotEq === 'undefined'){

  function assertNotEq(actual, expected, message=''){
    if (actual === expected) {
      throw new Error(message || `Expected values to be different, but both were: ${actual}`);
    }
  }
}
let input = {
    num: [1, 2, 3],
    char: ['a', 'b', 'c']
  };
  
  let iterator = Iterator.zipKeyed(input);
  
  let firstResult = iterator.next();
  let secondResult = iterator.next();
  
  assertNotEq(firstResult, secondResult, "Each result object should be a fresh object");
  assertNotEq(firstResult.value, secondResult.value, "Each value object should be distinct");
  
  let thirdResult = iterator.next();
  
  assertNotEq(secondResult, thirdResult, "Each result object should be a fresh object");
  assertNotEq(secondResult.value, thirdResult.value, "Each value object should be distinct");
  
  reportCompare(0, 0);
  