// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zip||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Ensures that padding is read if and only if mode is "longest".
info: |
  Iterator.zip ( iterables [, options] )

  - If mode is "longest", padding is read from options.padding.
  - If mode is not "longest", padding must not be accessed.
features: [iterator-sequencing]
---*/

// Padding should be read when mode is "longest"
let paddingAccessed = false;
let paddingObject = {
  [Symbol.iterator]() {
    paddingAccessed = true;
    return [].values();
  }
};

Iterator.zip([[]], { mode: "longest", padding: paddingObject });
assert.sameValue(paddingAccessed, true, "Padding should be accessed when mode is 'longest'");

// Padding should not be read when mode is "shortest" or "strict":
paddingAccessed = false;
Iterator.zip([[]], { mode: "shortest", padding: paddingObject });
assert.sameValue(paddingAccessed, false, "Padding should not be accessed when mode is 'shortest'");


paddingAccessed = false;
Iterator.zip([[]], { mode: "strict", padding: paddingObject });
assert.sameValue(paddingAccessed, false, "Padding should not be accessed when mode is 'strict'");

reportCompare(0, 0);
