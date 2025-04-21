// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zipKeyed||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator-zipKeyed
description: >
  Confirm inherited keys are not used by Iterator.zipKeyed.
info: |
  When an object with only inherited enumerable keys is passed to
  Iterator.zipKeyed, the algorithm should ignore those keys and produce
  an iterator that is already done.
features: [iterator-sequencing]
---*/

let proto = { inheritedKey: [1, 2, 3] }; // inherited enumerable key
let obj = Object.create(proto);          // obj has no own enumerable keys

let iter = Iterator.zipKeyed(obj);

// The first call to next() should immediately indicate that the iterator is finished.
let result = iter.next();
assert.sameValue(result.done, true, "Iterator.zipKeyed should ignore inherited keys and finish immediately");

// Confirm subsequent next() calls remain finished.
result = iter.next();
assert.sameValue(result.done, true, "Subsequent next() calls on a finished iterator should remain finished");

reportCompare(0, 0);
