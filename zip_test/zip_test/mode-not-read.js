// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zip||!xulRuntime.shell)
// Copyright (C) 2025 Axel Martinius Lundeby. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Ensures that mode is not read if the first argument is not an object.
info: |
  Iterator.zip ( iterables [, options] )

  - If the first argument (iterables) is not an object, a TypeError is thrown.
  - `mode` must not be accessed if the first argument is invalid.
features: [iterator-sequencing]
---*/

// Step 1: Verify zip works for valid input
assertEq(typeof Iterator.zip([[]]).next, "function", "Expected a valid iterator from Iterator.zip([[]])");

// Step 2: Ensure TypeError for invalid first arguments
let invalidInputs = [null, undefined, 1, true, Symbol("test"), () => {}, "notAnObject"];
for (let input of invalidInputs) {
  assertThrowsInstanceOf(
    () => Iterator.zip(input),
    TypeError,
    `Expected TypeError for non-object input: ${String(input)}`
  );
}

// Step 3: Verify `mode` is not accessed when first argument is invalid
let modeAccessed = false;
let options = {
  get mode() {
    modeAccessed = true;
    return "shortest";
  }
};

for (let input of invalidInputs) {
  modeAccessed = false;
  assertThrowsInstanceOf(
    () => Iterator.zip(input, options),
    TypeError,
    `Expected TypeError for non-object input with options: ${String(input)}`
  );
  assertEq(modeAccessed, false, "mode should not be accessed if first argument is invalid");
}

// Step 4: Confirm `mode` is accessed for valid input
modeAccessed = false;
Iterator.zip([[]], options);
assertEq(modeAccessed, true, "mode should be accessed when input is valid");

reportCompare(0, 0);
