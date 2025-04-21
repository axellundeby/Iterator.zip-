// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zipKeyed||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zipKeyed
description: >
  Ensures that in "longest" mode, Iterator.zipKeyed correctly applies padding.
info: |
  - When mode is "longest", shorter iterables are padded.
  - Padding defaults to undefined if not provided.
  - If padding is given, it applies only where necessary.
features: [iterator-sequencing]
---*/

// Case 1: Explicit padding for all keys
let input1 = {
    one:   [1, 2],
    two:   ['a'],
    three: [true, false, false, true]
  };
  
  let it1 = Iterator.zipKeyed(input1, {
    mode:    "longest",
    padding: { one: 'X', two: 'Y', three: 'Z' }
  });
  
  let r = it1.next();
  assert.sameValue(r.done, false, "Iterator should not be done after first next()");
  assert.compareArray(
    Object.values(r.value),
    [1, 'a', true],
    "First zipped value should be { one:1, two:'a', three:true }"
  );
  
  r = it1.next();
  assert.sameValue(r.done, false, "Iterator should not be done after second next()");
  assert.compareArray(
    Object.values(r.value),
    [2, 'Y', false],
    "Second zipped value should use explicit padding for 'two'"
  );
  
  r = it1.next();
  assert.sameValue(r.done, false, "Iterator should not be done after third next()");
  assert.compareArray(
    Object.values(r.value),
    ['X', 'Z', false],
    "Third zipped value should pad 'one' and 'two' with 'X'/'Z'"
  );
  
  r = it1.next();
  assert.sameValue(r.done, false, "Iterator should not be done after fourth next()");
  assert.compareArray(
    Object.values(r.value),
    ['X', 'Z', true],
    "Fourth zipped value should continue padding"
  );
  
  r = it1.next();
  assert.sameValue(r.done, true,  "Iterator should be done after all items are exhausted");
  assert.sameValue(r.value, undefined, "Final value should be undefined when done");
  
  // Case 2: Some keys have explicit padding, others default to undefined
  let input2 = {
    one:   [1, 2, 3],
    two:   ['a'],
    three: [true, false]
  };
  
  let it2 = Iterator.zipKeyed(input2, {
    mode:    "longest",
    padding: { two: 'PAD' }
  });
  
  r = it2.next();
  assert.sameValue(r.done, false, "Iterator should not be done after first next()");
  assert.compareArray(
    Object.values(r.value),
    [1, 'a', true],
    "First zipped value should be { one:1, two:'a', three:true }"
  );
  
  r = it2.next();
  assert.sameValue(r.done, false, "Iterator should not be done after second next()");
  assert.compareArray(
    Object.values(r.value),
    [2, 'PAD', false],
    "Second zipped value should pad 'two' with 'PAD'"
  );
  
  r = it2.next();
  assert.sameValue(r.done, false, "Iterator should not be done after third next()");
  assert.compareArray(
    Object.values(r.value),
    [3, 'PAD', undefined],
    "Third zipped value should pad 'three' with undefined"
  );
  
  r = it2.next();
  assert.sameValue(r.done, true,  "Iterator should be done after all items are exhausted");
  assert.sameValue(r.value, undefined, "Final value should be undefined when done");
  
  // Case 3: No explicit padding, default to undefined
  let input3 = {
    one:   [1, 2],
    two:   ['a', 'b', 'c'],
    three: [true]
  };
  
  let it3 = Iterator.zipKeyed(input3, { mode: "longest" });
  
  r = it3.next();
  assert.sameValue(r.done, false, "Iterator should not be done after first next()");
  assert.compareArray(
    Object.values(r.value),
    [1, 'a', true],
    "First zipped value should be { one:1, two:'a', three:true }"
  );
  
  r = it3.next();
  assert.sameValue(r.done, false, "Iterator should not be done after second next()");
  assert.compareArray(
    Object.values(r.value),
    [2, 'b', undefined],
    "Second zipped value should pad 'three' with undefined"
  );
  
  r = it3.next();
  assert.sameValue(r.done, false, "Iterator should not be done after third next()");
  assert.compareArray(
    Object.values(r.value),
    [undefined, 'c', undefined],
    "Third zipped value should pad 'one' and 'three' with undefined"
  );
  
  r = it3.next();
  assert.sameValue(r.done, true,  "Iterator should be done after all items are exhausted");
  assert.sameValue(r.value, undefined, "Final value should be undefined when done");
  
  reportCompare(0, 0);
  