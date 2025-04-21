// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zipKeyed||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zipKeyed
description: >
  Ensures that Iterator.zipKeyed can handle exactly one property.
info: |
  Iterator.zipKeyed ( iterables [, options] )

  - When given an object with a single key, it should yield objects with one property.
features: [iterator-sequencing]
---*/

let input = {
    only: [1, 2, 3]
  };
  
  let iterator = Iterator.zipKeyed(input);
  
  let result = iterator.next();
  assert.sameValue(result.done, false, "Iterator should not be done after first next()");
  assert.sameValue(Object.keys(result.value).length, 1, "Result should have one property");
  assert.sameValue(result.value.only, 1, "First value should be { only: 1 }");
  
  result = iterator.next();
  assert.sameValue(result.done, false, "Iterator should not be done after second next()");
  assert.sameValue(result.value.only, 2, "Second value should be { only: 2 }");
  
  result = iterator.next();
  assert.sameValue(result.done, false, "Iterator should not be done after third next()");
  assert.sameValue(result.value.only, 3, "Third value should be { only: 3 }");
  
  result = iterator.next();
  assert.sameValue(result.done, true, "Iterator should be done after all elements are consumed");
  assert.sameValue(result.value, undefined, "Final value should be undefined");
  
  reportCompare(0, 0);
  