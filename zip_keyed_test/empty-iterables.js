// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zipKeyed||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
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
  assert.sameValue(result.done, true, "Iterator should be done immediately if all values are empty");
  assert.sameValue(result.value, undefined, "Value should be undefined when done is true");
  
  result = iter.next();
  assert.sameValue(result.done, true, "Iterator should remain done on subsequent calls");
  assert.sameValue(result.value, undefined, "Subsequent value should remain undefined");
  
  reportCompare(0, 0);
  