// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zip||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Ensures the correct order of side effects in Iterator.zip.
info: |
  Iterator.zip ( iterables [, options] )

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
    return [];
  }
};

// Create an iterable with observable side effects
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

// Create multiple tracked iterables
let iter1 = createTrackedIterable("iter1");
let iter2 = createTrackedIterable("iter2");

// Call Iterator.zip and observe side effects
log.push("Calling Iterator.zip");
let iterator = Iterator.zip([iter1, iter2], options);

// Assert immediately after calling .zip
assertDeepEq(log, [
  "Calling Iterator.zip",
  "options.mode accessed",
  "options.padding accessed",
  "iter1 iterator accessed",
  "iter2 iterator accessed"
], "Side effects should occur in the expected order before calling .next");

// Clear log and call .next on the result
log = [];
iterator.next();

// Assert after calling .next
assertDeepEq(log, [
  "iter1 next() called",
  "iter2 next() called"
], "Side effects should occur in the expected order after calling .next");

reportCompare(0, 0);
