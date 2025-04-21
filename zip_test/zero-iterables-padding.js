// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zip||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  In longest mode, Iterator.zip([]) with a non-empty padding iterable should yield no values.
info: |
  - Even if padding is provided, no zipping occurs when input iterable list is empty.
features: [iterator-sequencing]
---*/

let callCount = 0;
let padding = {
  [Symbol.iterator]() {
    return {
      next() {
        callCount++;
        return { value: "pad", done: callCount > 5 }; // Emit some padding
      },
      return() {
        throw new Error("Should not be called");
      }
    };
  }
};

let zipped = Iterator.zip([], { mode: "longest", padding });

let result = zipped.next();
assert.sameValue(result.done, true);
assert.sameValue(result.value, undefined);
assert.sameValue(callCount, 0, "Padding should not be read at all when no iterables are zipped");

reportCompare(0, 0);
