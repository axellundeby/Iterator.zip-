// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zipKeyed||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
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
  assert.sameValue(result.done, false, "Iterator should not be done after first next()");
  assert.sameValue(result.value.nums, 1, "First value for 'nums' should be 1");
  assert.sameValue(result.value.chars, 'T', "First value for 'chars' should be 'T'");
  
  result = iterator.next();
  assert.sameValue(result.done, false, "Iterator should not be done after second next()");
  assert.sameValue(result.value.nums, 2, "Second value for 'nums' should be 2");
  assert.sameValue(result.value.chars, 'N', "Second value for 'chars' should be 'N'");
  
  result = iterator.next();
  assert.sameValue(result.done, false, "Iterator should not be done after third next()");
  assert.sameValue(result.value.nums, 3, "Third value for 'nums' should be 3");
  assert.sameValue(result.value.chars, 'M', "Third value for 'chars' should be 'M'");
  
  result = iterator.next();
  assert.sameValue(result.value, undefined, "Iterator should return undefined after exhaustion");
  assert.sameValue(result.done, true, "Iterator should be done after all elements are consumed");
  
  reportCompare(0, 0);
  