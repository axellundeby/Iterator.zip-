// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zipKeyed||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zipKeyed
description: >
  Throws a TypeError if the first argument to Iterator.zipKeyed is not an object.
info: |
  Iterator.zipKeyed( iterables [, options] )
  
  - If the first argument is not an object (including if it is a string), a TypeError must be thrown.
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
    assertThrowsInstanceOf(() => Iterator.zipKeyed(value),
      TypeError,
      `Expected TypeError for iterables value: ${String(value)}`);
  }
  
  reportCompare(0, 0);
  