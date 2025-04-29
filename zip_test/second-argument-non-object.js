// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zip||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Throws a TypeError if the second argument to Iterator.zip is not an object and not null/undefined.
info: |
  Iterator.zip ( iterables [, options] )

  - If options is provided, it must be either an object or null/undefined.
  - Any other type should result in a TypeError.
features: [iterator-sequencing]
---*/
let arg1 = [1, 2, 3]
let invalids = [
  42,
  false,
  "Hello Mozilla!",
  Symbol("test")
];

for (let value of invalids) {
  assertThrowsInstanceOf(TypeError, () => Iterator.zip(arg1, value), `Expected TypeError for value: ${String(value)}`);
}
// Valids
Iterator.zip([arg1], undefined);
Iterator.zip([arg1], null);
Iterator.zip([arg1], {}); 

reportCompare(0, 0);