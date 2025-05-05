// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zip||!xulRuntime.shell)

/*---
esid: sec-iterator.zip
description: >
  Ensures that each object returned by Iterator.zip is a fresh object with a different identity.
info: |
  - Each call to `.next()` must return a new object, rather than reusing a single object.
features: [iterator-sequencing]
---*/

function assertNotEq(actual, expected, message=''){
  if (actual === expected) {
    throw new Error(message || `Expected values to be different, but both were: ${actual}`);
  }
}

let iter1 = [1, 2, 3];
let iter2 = ['a', 'b', 'c'];

let iterator = Iterator.zip([iter1, iter2]);

let firstResult = iterator.next();
let secondResult = iterator.next();

assertNotEq(firstResult, secondResult, "Each result object should have a unique identity");
assertNotEq(firstResult.value, secondResult.value, "Each result's `value` array should be a new object");

let thirdResult = iterator.next();
assertNotEq(secondResult, thirdResult, "Each result object should have a unique identity");
assertNotEq(secondResult.value, thirdResult.value, "Each result's `value` array should be a new object");

reportCompare(0, 0);
