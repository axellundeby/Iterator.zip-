// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zipKeyed||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zipKeyed
description: >
  Ensures that in strict mode, Iterator.zipKeyed consumes all iterators fully when lengths match.
info: |
  - In "strict" mode, all property iterables must have the same length.
  - .next() must still be called on all iterators to confirm full completion.
features: [iterator-sequencing]
---*/

let input = {
    one: [1, 2, 3],
    two: ['a', 'b', 'c'],
    three: [true, false, null]
  };
  
  let iterator = Iterator.zipKeyed(input, { mode: "strict" });
  
  let result = iterator.next();
  assert.sameValue(result.done, false, "Iterator should not be done after first next()");
  assert.compareArray(Object.values(result.value), [1, 'a', true], "First zipped object values should be correct");
  
  result = iterator.next();
  assert.sameValue(result.done, false, "Iterator should not be done after second next()");
  assert.compareArray(Object.values(result.value), [2, 'b', false], "Second zipped object values should be correct");
  
  result = iterator.next();
  assert.sameValue(result.done, false, "Iterator should not be done after third next()");
  assert.compareArray(Object.values(result.value), [3, 'c', null], "Third zipped object values should be correct");
  
  // Ensure all iterators are fully consumed
  result = iterator.next();
  assert.sameValue(result.value, undefined, "Iterator should return undefined after full consumption");
  assert.sameValue(result.done, true, "Iterator should be done after all values are consumed");
  
  reportCompare(0, 0);
  