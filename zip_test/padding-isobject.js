// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zip||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Ensures that when mode is "longest", padding must be either undefined or an object.
info: |
  Iterator.zip ( iterables [, options] )

  - If mode is "longest", padding is read from options.padding.
  - If padding is neither undefined nor an object, a TypeError must be thrown.
features: [iterator-sequencing]
---*/

let invalidPaddings = [
    0,
    1,
    true,
    false,
    "string",  // Strings should not be allowed as padding
    Symbol("test"),
    () => {},  // Functions should not be allowed as padding
  ];
  
  // Test invalid padding values
  for (let value of invalidPaddings) {
    assertThrowsInstanceOf(() => Iterator.zip([[]], { mode: "longest", padding: value }), 
      TypeError,
      `Expected TypeError for padding: ${String(value)}`);
  }
  
  // Valid cases should not throw
  Iterator.zip([[]], { mode: "longest", padding: undefined });
  Iterator.zip([[]], { mode: "longest", padding: {} }); // Empty object is valid
  Iterator.zip([[]], { mode: "longest", padding: [] }); // Arrays are valid objects
  
  reportCompare(0, 0);
  