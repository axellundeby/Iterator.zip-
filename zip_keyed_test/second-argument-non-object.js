// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zipKeyed||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zipKeyed
description: >
  Throws a TypeError if the second argument to Iterator.zipKeyed is not an object and not null/undefined.
info: |
  Iterator.zipKeyed( iterables [, options] )

  - If options is provided, it must be either an object or null/undefined.
  - Any other type should result in a TypeError.
features: [iterator-sequencing]
---*/

let validInput = { a: [1, 2, 3] };

let invalidOptions = [
  42,
  false,
  "Hello Mozilla!",
  Symbol("test")
];

for (let value of invalidOptions) {
  assert.throws(TypeError, () => Iterator.zipKeyed(validInput, value),
    `Expected TypeError for options value: ${String(value)}`);
}

// Valid cases.
Iterator.zipKeyed(validInput, undefined);
Iterator.zipKeyed(validInput, null);
Iterator.zipKeyed(validInput, {});

reportCompare(0, 0);
