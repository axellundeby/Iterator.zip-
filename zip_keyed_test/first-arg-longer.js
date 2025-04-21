// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zipKeyed||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
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
    longer: [1, 2, 3, 4],
    shorter: ['a', 'b']
  };
  
  let iterator = Iterator.zipKeyed(input);
  
  let result = iterator.next();
  assert.sameValue(result.done, false, "Iterator should not be done after first next()");
  assert.sameValue(result.value.longer, 1, "First value for 'longer' should be 1");
  assert.sameValue(result.value.shorter, 'a', "First value for 'shorter' should be 'a'");
  
  result = iterator.next();
  assert.sameValue(result.done, false, "Iterator should not be done after second next()");
  assert.sameValue(result.value.longer, 2, "Second value for 'longer' should be 2");
  assert.sameValue(result.value.shorter, 'b', "Second value for 'shorter' should be 'b'");
  
  // Should stop because 'shorter' is exhausted
  result = iterator.next();
  assert.sameValue(result.value, undefined, "Iterator should return undefined after exhaustion");
  assert.sameValue(result.done, true, "Iterator should be done after shortest iterable is exhausted");
  
  reportCompare(0, 0);
  