// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zipKeyed||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zipKeyed
description: >
  Iterator.zipKeyed returns a finished iterator immediately when all property values are empty.
info: |
  - If all values are valid iterables, but empty, then .next() returns { done: true } immediately.
features: [iterator-sequencing]
---*/

let obj = {
    a: [],
    b: [],
    c: []
  };
  
  let iter = Iterator.zipKeyed(obj);
  
  let result = iter.next();
  assertEq(result.done, true, "Iterator should be done immediately if all values are empty");
  assertEq(result.value, undefined, "Value should be undefined when done is true");
  
  result = iter.next();
  assertEq(result.done, true, "Iterator should remain done on subsequent calls");
  assertEq(result.value, undefined, "Subsequent value should remain undefined");
  
  reportCompare(0, 0);
  