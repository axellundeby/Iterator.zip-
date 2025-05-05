// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zipKeyed||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zipKeyed
description: >
  Iterator.zipKeyed result has [[Prototype]] set to %IteratorHelperPrototype%.
info: |
  - The prototype of the resulting iterator should be %IteratorHelperPrototype%.
  - %IteratorHelperPrototype% is the same as Object.getPrototypeOf(Iterator.from([]).take(0)).
features: [iterator-sequencing]
---*/

let proto = Object.getPrototypeOf(Iterator.from([]).take(0));
let zipped = Iterator.zipKeyed({ a: [], b: [] });

assertEq(Object.getPrototypeOf(zipped), proto, "Iterator.zipKeyed result should have %IteratorHelperPrototype% as prototype");

reportCompare(0, 0);
