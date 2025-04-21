// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zip||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
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

let invalidIterables = [
    null,
    undefined,
    420,
    "notAnObject",
    true,
    Symbol("test"),
    () => {}
  ];
  
  let optionsGetterCalled = false;
  let options = {
    get mode() {
      optionsGetterCalled = true;
      return "shortest";
    }
  };
  
  // Ensure TypeError is thrown before mode is accessed
  for (let value of invalidIterables) {
    optionsGetterCalled = false;
    assert.throws(TypeError, () => Iterator.zip(value, options), 
      `Expected TypeError for first argument: ${String(value)}`);
    assert.sameValue(optionsGetterCalled, false, "Mode should not be accessed if first argument is invalid");
  }
  
  // Valid case: mode should be read
  optionsGetterCalled = false;
  Iterator.zip([[]], options);
  assert.sameValue(optionsGetterCalled, true, "Mode should be accessed when first argument is valid");
  
  reportCompare(0, 0);
  