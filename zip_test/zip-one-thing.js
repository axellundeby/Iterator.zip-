// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zip||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Ensures that Iterator.zip can handle exactly one iterable.
info: |
  Iterator.zip ( iterables [, options] )

  - When given a single iterable, it should yield single-element arrays.
features: [iterator-sequencing]
---*/

let input = [1, 2, 3];

let iterator = Iterator.zip([input]);

let result = iterator.next();
assertDeepEq(result.value, [1], "First value should be [1]");
assertEq(result.done, false, "Iterator should not be done after first next()");

result = iterator.next();
assertDeepEq(result.value, [2], "Second value should be [2]");
assertEq(result.done, false, "Iterator should not be done after second next()");

result = iterator.next();
assertDeepEq(result.value, [3], "Third value should be [3]");
assertEq(result.done, false, "Iterator should not be done after third next()");

result = iterator.next();
assertEq(result.value, undefined, "Iterator should return undefined after exhaustion");
assertEq(result.done, true, "Iterator should be done after all elements are consumed");

reportCompare(0, 0);
