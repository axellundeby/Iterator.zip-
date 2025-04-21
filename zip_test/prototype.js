// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zip||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Iterator.zip result has [[Prototype]] set to %IteratorHelperPrototype%.
info: |
  - The prototype of the resulting iterator should be %IteratorHelperPrototype%.
  - %IteratorHelperPrototype% is the same as Object.getPrototypeOf(Iterator.from([]).take(0)).
features: [iterator-sequencing]
---*/

let proto = Object.getPrototypeOf(Iterator.from([]).take(0));
let zipped = Iterator.zip([[], []]);

assert.sameValue(Object.getPrototypeOf(zipped), proto, "Iterator.zip result should have %IteratorHelperPrototype% as prototype");

reportCompare(0, 0);
