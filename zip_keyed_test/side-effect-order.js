// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zipKeyed||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zipKeyed
description: >
  Ensures the correct order of side effects in Iterator.zipKeyed.
info: |
  Iterator.zipKeyed ( iterables [, options] )

  - Side effects should occur in a well-defined order.
  - This test makes all side effects observable and checks the totality.
features: [iterator-sequencing]
---*/

let log = [];

// Create a getter-tracked options object
let options = {
  get mode() {
    log.push("options.mode accessed");
    return "longest";
  },
  get padding() {
    log.push("options.padding accessed");
    return { a: 0, b: 0 };
  }
};

// Create a tracked getter that logs when the property is accessed
function createTrackedIterable(name) {
  return {
    [Symbol.iterator]() {
      log.push(`${name} iterator accessed`);
      return {
        next() {
          log.push(`${name} next() called`);
          return { done: true };
        },
        return() {
          log.push(`${name} return() called`);
          return { done: true };
        }
      };
    }
  };
}

// Define input object with tracked properties
let input = {
  get a() {
    log.push("property 'a' accessed");
    return createTrackedIterable("a");
  },
  get b() {
    log.push("property 'b' accessed");
    return createTrackedIterable("b");
  }
};

// Call Iterator.zipKeyed and observe side effects
log.push("Calling Iterator.zipKeyed");
let iterator = Iterator.zipKeyed(input, options);

// Assert immediately after calling .zipKeyed
assert.compareArray(log, [
  "Calling Iterator.zipKeyed",
  "options.mode accessed",
  "options.padding accessed",
  "property 'a' accessed",
  "a iterator accessed",
  "property 'b' accessed",
  "b iterator accessed"
], "Side effects should occur in the expected order before calling .next");

// Clear log and call .next on the result
log = [];
iterator.next();

// Assert after calling .next
assert.compareArray(log, [
  "a next() called",
  "b next() called"
], "Side effects should occur in the expected order after calling .next");

reportCompare(0, 0);
