// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zip||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Ensures that the mode option is not coerced to a string and throws for invalid types.
info: |
  Iterator.zip ( iterables [, options] )

  - The mode option must be exactly "shortest", "longest", or "strict".
  - If mode is not a valid string, a TypeError must be thrown.
  - Non-string values should not be coerced.
features: [iterator-sequencing]
---*/

let invalidModes = [
    0,
    1,
    true,
    false,
    "short",
    "FooBar",
    {},
    [],
    null,
    undefined,
    Symbol("test")
  ];
  
  for (let value of invalidModes) {
    assertThrowsInstanceOf(TypeError, () => Iterator.zip([[]], { mode: value }), `Expected TypeError for mode: ${String(value)}`);
  }
  
  Iterator.zip([[]], { mode: "shortest" });
  Iterator.zip([[]], { mode: "longest" });
  Iterator.zip([[]], { mode: "strict" });
  
  reportCompare(0, 0);