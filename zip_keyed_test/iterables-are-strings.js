// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zipKeyed||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zipKeyed
description: >
  Ensures that Iterator.zipKeyed throws if any value is a string, but only after reading padding.
info: |
  Iterator.zipKeyed ( iterables [, options] )

  - String values should not be considered valid flattenable iterables.
  - When mode is "longest", padding must be read before throwing for invalid values.
features: [iterator-sequencing]
---*/

let paddingAccessed = false;
let options = {
  mode: "longest",
  get padding() {
    paddingAccessed = true;
    return { a: "PAD", b: "PAD" };
  }
};

// Strings should cause a TypeError, but padding should be read first
let invalidInput = {
  a: [],
  b: "not an iterable"
};

assert.throws(TypeError, () => Iterator.zipKeyed(invalidInput, options),
  "Expected TypeError when a string is passed as a value");

assert.sameValue(paddingAccessed, true, "Padding should be accessed before throwing for invalid values");

// Valid cases should not throw
Iterator.zipKeyed({ a: [], b: [] }, { mode: "longest", padding: { a: 0, b: 0 } });
Iterator.zipKeyed({ a: [], b: [] }, { mode: "shortest" }); // No padding read in shortest mode

reportCompare(0, 0);
