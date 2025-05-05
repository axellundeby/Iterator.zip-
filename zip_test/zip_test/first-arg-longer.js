// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zip||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.

/*---
esid: sec-iterator.zip
description: >
  Ensures that Iterator.zip stops when the shortest iterable is exhausted.
info: |
  - When given two iterables of different lengths with no options,
    the iterator stops when the shorter iterable is exhausted.
features: [iterator-sequencing]
---*/

let longer = [1, 2, 3, 4];
let shorter = ['a', 'b'];

let iterator = Iterator.zip([longer, shorter]);

let result = iterator.next();
assertEq(result.done, false, "Iterator should not be done after first next()");
assertEq(Array.isArray(result.value), true, "Result value should be an array");
assertEq(result.value.length, 2);
assertEq(result.value[0], 1);
assertEq(result.value[1], 'a');

result = iterator.next();
assertEq(result.done, false, "Iterator should not be done after second next()");
assertEq(Array.isArray(result.value), true, "Result value should be an array");
assertEq(result.value.length, 2);
assertEq(result.value[0], 2);
assertEq(result.value[1], 'b');

// Should stop because `shorter` is exhausted
result = iterator.next();
assertEq(result.value, undefined, "Iterator should return undefined after exhaustion");
assertEq(result.done, true, "Iterator should be done after shortest iterable is exhausted");

reportCompare(0, 0);
