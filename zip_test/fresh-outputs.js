// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zip||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Ensures that each object returned by Iterator.zip is a fresh object with a different identity.
info: |
  - Each call to `.next()` must return a new object, rather than reusing a single object.
features: [iterator-sequencing]
---*/

let iter1 = [1, 2, 3];
let iter2 = ['a', 'b', 'c'];

let iterator = Iterator.zip([iter1, iter2]);

let firstResult = iterator.next();
let secondResult = iterator.next();

assert.notSameValue(firstResult, secondResult, "Each result object should have a unique identity");
assert.notSameValue(firstResult.value, secondResult.value, "Each result's `value` array should be a new object");

let thirdResult = iterator.next();
assert.notSameValue(secondResult, thirdResult, "Each result object should have a unique identity");
assert.notSameValue(secondResult.value, thirdResult.value, "Each result's `value` array should be a new object");

reportCompare(0, 0);
