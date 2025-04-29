// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zip||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Ensures that Iterator.zip stops when the shortest iterable is exhausted.
info: |
  - When given two iterables of different lengths with no options,
    the iterator stops when the shorter iterable is exhausted.
features: [iterator-sequencing]
---*/

let shorter = [1, 2];
let longer = ['a', 'b', 'c', 'd'];

let iterator = Iterator.zip([shorter, longer]);

let result = iterator.next();
assertDeepEq(result.value, [1, 'a'], "First zipped value should be [1, 'a']");
assertEq(result.done, false, "Iterator should not be done after first next()");

result = iterator.next();
assertDeepEq(result.value, [2, 'b'], "Second zipped value should be [2, 'b']");
assertEq(result.done, false, "Iterator should not be done after second next()");

// Should stop because `shorter` is exhausted
result = iterator.next();
assertEq(result.value, undefined, "Iterator should return undefined after exhaustion");
assertEq(result.done, true, "Iterator should be done after shortest iterable is exhausted");

reportCompare(0, 0);
