// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zipKeyed||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zipKeyed
description: >
  Ensures that Iterator.zipKeyed stops when the shortest iterable is exhausted.
info: |
  - When values have different lengths and no options are given,
    the iterator stops when the shortest is exhausted (default "shortest" mode).
features: [iterator-sequencing]
---*/

let input = {
    shorter: [1, 2],
    longer: ['a', 'b', 'c', 'd']
  };
  
  let iterator = Iterator.zipKeyed(input);
  
  let result = iterator.next();
  assertEq(result.done, false, "Iterator should not be done after first next()");
  assertEq(result.value.shorter, 1, "First value for 'shorter' should be 1");
  assertEq(result.value.longer, 'a', "First value for 'longer' should be 'a'");
  
  result = iterator.next();
  assertEq(result.done, false, "Iterator should not be done after second next()");
  assertEq(result.value.shorter, 2, "Second value for 'shorter' should be 2");
  assertEq(result.value.longer, 'b', "Second value for 'longer' should be 'b'");
  
  // Should stop because 'shorter' is exhausted
  result = iterator.next();
  assertEq(result.value, undefined, "Iterator should return undefined after exhaustion");
  assertEq(result.done, true, "Iterator should be done after shortest iterable is exhausted");
  
  reportCompare(0, 0);
  