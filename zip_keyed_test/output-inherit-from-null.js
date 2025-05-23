// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zipKeyed||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator-zipKeyed
description: >
  Output objects produced by Iterator.zipKeyed inherit from null.
info: |
  The internal finishResults function creates the output object using
  Object.create(null), so it should not have a prototype.
features: [iterator-sequencing]
---*/

let input = { a: [1] };
let iter = Iterator.zipKeyed(input);

let result = iter.next();
assertEq(result.done, false, "Iterator.zipKeyed should yield a result");

let outObj = result.value;
assertEq(Object.getPrototypeOf(outObj), null,
  "Output object should have a null prototype");

reportCompare(0, 0);
