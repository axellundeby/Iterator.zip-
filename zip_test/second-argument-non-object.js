// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zip||!xulRuntime.shell)
// Copyright (C) 2025 Axel Martinius Lundeby. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Throws a TypeError if the second argument (options) is not an object.
info: |
  Iterator.zip ( iterables [, options] )

  - If options is provided, it must be an object.
  - Primitive values should throw a TypeError and not be coerced.
features: [iterator-sequencing]
---*/

// Step 1: Valid baseline to ensure zip itself works
var zip = Iterator.zip([[]]);
assertEq(typeof zip.next, "function", "zip() should return a valid iterator");

// Step 2: Values that should throw TypeError as invalid options
let invalidOptions = [
  0,
  1,
  true,
  false,
  "string",
  Symbol("sym"),
  () => {},
];

for (let value of invalidOptions) {
  assertThrowsInstanceOf(() => Iterator.zip([[]], value), TypeError,
    `Expected TypeError for value: ${String(value)}`);
}


// Step 3: Allowed values that must NOT throw
Iterator.zip([[]], undefined);
Iterator.zip([[]], null);
Iterator.zip([[]], {});
Iterator.zip([[]], { mode: "shortest" });

reportCompare(0, 0);
