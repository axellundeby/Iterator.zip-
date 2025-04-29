// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zip||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Ensures that Iterator.zip correctly zips two iterables with the same number of elements.
info: |
  Iterator.zip ( iterables [, options] )

  - When given two iterables of the same length, it should pair corresponding elements.
features: [iterator-sequencing]
---*/

let input1 = [1, 2, 3];
let input2 = ['T', 'N', 'M'];

let iterator = Iterator.zip([input1, input2]);

let result = iterator.next();
assertDeepEq(result.value, [1, 'T'], "First zipped value should be [1, 'T']");
assertEq(result.done, false, "Iterator should not be done after first next()");

result = iterator.next();
assertDeepEq(result.value, [2, 'N'], "Second zipped value should be [2, 'N']");
assertEq(result.done, false, "Iterator should not be done after second next()");

result = iterator.next();
assertDeepEq(result.value, [3, 'M'], "Third zipped value should be [3, 'M']");
assertEq(result.done, false, "Iterator should not be done after third next()");

result = iterator.next();
assertEq(result.value, undefined, "Iterator should return undefined after exhaustion");
assertEq(result.done, true, "Iterator should be done after all elements are consumed");

reportCompare(0, 0);
