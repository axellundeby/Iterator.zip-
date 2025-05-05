// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zipKeyed||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zipKeyed
description: >
  Ensures that Iterator.zipKeyed correctly zips two keys with equal-length iterables.
info: |
  Iterator.zipKeyed ( iterables [, options] )

  - When given two own-enumerable properties with equal-length iterables,
    the iterator should yield objects pairing each key with its corresponding element.
features: [iterator-sequencing]
---*/

let input = {
    nums: [1, 2, 3],
    chars: ['T', 'N', 'M']
  };
  
  let iterator = Iterator.zipKeyed(input);
  
  let result = iterator.next();
  assertEq(result.done, false, "Iterator should not be done after first next()");
  assertEq(result.value.nums, 1, "First value for 'nums' should be 1");
  assertEq(result.value.chars, 'T', "First value for 'chars' should be 'T'");
  
  result = iterator.next();
  assertEq(result.done, false, "Iterator should not be done after second next()");
  assertEq(result.value.nums, 2, "Second value for 'nums' should be 2");
  assertEq(result.value.chars, 'N', "Second value for 'chars' should be 'N'");
  
  result = iterator.next();
  assertEq(result.done, false, "Iterator should not be done after third next()");
  assertEq(result.value.nums, 3, "Third value for 'nums' should be 3");
  assertEq(result.value.chars, 'M', "Third value for 'chars' should be 'M'");
  
  result = iterator.next();
  assertEq(result.value, undefined, "Iterator should return undefined after exhaustion");
  assertEq(result.done, true, "Iterator should be done after all elements are consumed");
  
  reportCompare(0, 0);
  