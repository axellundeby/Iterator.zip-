// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zip||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Ensures that Iterator.zip throws if any iterable is a string, but only after reading padding.
info: |
  Iterator.zip ( iterables [, options] )

  - Strings should not be considered valid iterables.
  - When mode is "longest", padding must be read before throwing for invalid iterables.
features: [iterator-sequencing]
---*/

let optionsGetterCalled = false;
let options = {
  mode: "longest",
  get padding() {
    optionsGetterCalled = true;
    return [];
  }
};

// Strings should cause a TypeError, but padding should be read first
assert.throws(TypeError, () => Iterator.zip([[], "string"], options), 
  "Expected TypeError when a string is passed as an iterable");

assert.sameValue(optionsGetterCalled, true, "Padding should be accessed before throwing for invalid iterables");

// Valid cases should not throw
Iterator.zip([[], []], { mode: "longest", padding: [] });
Iterator.zip([[], []], { mode: "shortest" }); // No padding read in shortest mode

reportCompare(0, 0);
