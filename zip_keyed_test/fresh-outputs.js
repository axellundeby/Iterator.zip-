// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zipKeyed||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
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

let input = {
    num: [1, 2, 3],
    char: ['a', 'b', 'c']
  };
  
  let iterator = Iterator.zipKeyed(input);
  
  let firstResult = iterator.next();
  let secondResult = iterator.next();
  
  assert.notSameValue(firstResult, secondResult, "Each result object should be a fresh object");
  assert.notSameValue(firstResult.value, secondResult.value, "Each value object should be distinct");
  
  let thirdResult = iterator.next();
  
  assert.notSameValue(secondResult, thirdResult, "Each result object should be a fresh object");
  assert.notSameValue(secondResult.value, thirdResult.value, "Each value object should be distinct");
  
  reportCompare(0, 0);
  