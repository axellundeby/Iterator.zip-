// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zipKeyed||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator-zipKeyed
description: >
  Object with no own-enumerable keys as argument produces iterator which is finished
info: |
  When an object with no own-enumerable keys is passed to Iterator.zipKeyed,
  it should produce an iterator that is already done.
features: [iterator-sequencing]
---*/

let iter = Iterator.zipKeyed({});

// First call to next() must yield a result with done:true.
let result = iter.next();
assert.sameValue(result.done, true, "Iterator.zipKeyed on an object with no own-enumerable keys should be finished");

// Even subsequent calls should return done:true.
result = iter.next();
assert.sameValue(result.done, true, "Subsequent next() calls on a finished iterator should still be finished");

reportCompare(0, 0);
