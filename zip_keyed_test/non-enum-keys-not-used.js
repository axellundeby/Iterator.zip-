// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zipKeyed||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator-zipKeyed
description: >
  Confirm non-enumerable keys are not used by Iterator.zipKeyed.
info: |
  When an object with non-enumerable own keys is passed to Iterator.zipKeyed,
  those keys should be ignored, and the resulting iterator should be finished.
features: [iterator-sequencing]
---*/

let obj = {};
Object.defineProperty(obj, "nonEnumKey", {
  value: [1, 2, 3],
  enumerable: false
});

let iter = Iterator.zipKeyed(obj);

let result = iter.next();
assertEq(result.done, true, "Iterator.zipKeyed should ignore non-enumerable keys and finish immediately");

// Confirm subsequent next() calls remain finished.
result = iter.next();
assertEq(result.done, true, "Subsequent next() calls on a finished iterator should remain finished");

reportCompare(0, 0);
