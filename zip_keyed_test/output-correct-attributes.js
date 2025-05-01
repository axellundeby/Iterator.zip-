// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zipKeyed||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator-zipKeyed
description: >
  Ensure that output objects have properties with writable and configurable attributes,
  even if the input properties are not writable/configurable.
info: |
  When Iterator.zipKeyed is called, it creates new output objects via a helper that
  defines each property using DefineDataProperty. As a result, each property on
  the output object should be writable and configurable.
features: [iterator-sequencing]
---*/
if (typeof assertNotEq === 'undefined'){
  function assertNotEq(actual, expected, message=''){
    if (actual === expected) {
      throw new Error(message || `Expected values to be different, but both were: ${actual}`);
    }
  }
}

let input = {};
// Define a non-writable, non-configurable, yet enumerable property "a"
Object.defineProperty(input, "a", {
  value: [1, 2, 3],
  writable: false,
  configurable: false,
  enumerable: true
});

// Create a zipped iterator from the input object.
// For key "a", the iterable is [1, 2, 3], so the zipped iterator will yield
// an object for each element.
let iter = Iterator.zipKeyed(input);

// Get the first result
let result = iter.next();
assertEq(result.done, false, "Iterator.zipKeyed should yield at least one result");

let outObj = result.value;

// The output object should have property "a"
assert("a" in outObj, "Output object should have key 'a'");

// Get the property descriptor for "a" from the output object.
let desc = Object.getOwnPropertyDescriptor(outObj, "a");
assert(desc.writable, "Output property 'a' should be writable");
assert(desc.configurable, "Output property 'a' should be configurable");

// Additionally, test that the property is actually writable and configurable.
// Save the old value (expected to be the first value of the zipped iterator, 1).
let oldValue = outObj.a;

// Modify the property's value.
outObj.a = "new value";
assertNotEq(outObj.a, oldValue, "Output property 'a' is writable");

// Delete the property.
delete outObj.a;
assertEq(outObj.a, undefined, "Output property 'a' is configurable; deletion succeeded");

reportCompare(0, 0);
