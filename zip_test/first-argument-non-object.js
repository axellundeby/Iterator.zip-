  // |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zip||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
  // Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
  // This code is governed by the BSD license found in the LICENSE file.

  /*---
  esid: sec-iterator.zip
  description: >
    Throws a TypeError if the first argument to Iterator.zip is not an object.
  info: |
    Iterator.zip ( iterables [, options] )

    - If the first argument is not an object, a TypeError must be thrown.
  features: [iterator-sequencing]
  ---*/

  let nonObjects = [
    null,
    undefined,
    42,
    true,
    "Hello World!",
    Symbol("test")
  ];

  for (let value of nonObjects) {
    assert.throws(TypeError, () => Iterator.zip(value), `Expected TypeError for value: ${String(value)}`);
  }

  reportCompare(0, 0);