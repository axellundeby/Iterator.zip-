// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zip||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Behavior of the padding iterator in Iterator.zip.
info: |
  Iterator.zip ( iterables [, options] )

  - If the padding iterator completes before all other iterators, `next` should not be called again.
  - If the padding iterator does not complete early, its `.return()` should be called.
features: [iterator-sequencing]
---*/

let log = [];

let shortPadding = {
  next() {
    log.push("shortPadding.next");
    return { done: true };
  },
  return() {
    log.push("shortPadding.return");
  },
  [Symbol.iterator]() {
    return this;
  }
};

let longPadding = {
  count: 0,
  next() {
    log.push("longPadding.next");
    this.count++;
    return { value: "pad", done: this.count >= 10 }; 
  },
  return() {
    log.push("longPadding.return");
  },
  [Symbol.iterator]() {
    return this;
  }
};

let iteratorShort = Iterator.zip([[1, 2, 3], ["a", "b", "c", "d"]], { mode: "longest", padding: shortPadding });
let resultShort = iteratorShort.next();
assertEq(resultShort.done, false);
assertEq(resultShort.value.length, 2);
assertEq(log.includes("shortPadding.return"), false, "shortPadding.return should not be called");

log = [];

let iteratorLong = Iterator.zip([[1, 2, 3], ["a", "b", "c", "d"]], { mode: "longest", padding: longPadding });
let resultLong = iteratorLong.next();
assertEq(resultLong.done, false);
assertEq(resultLong.value.length, 2);
assertEq(log.includes("longPadding.return"), true, "longPadding.return should be called");

reportCompare(0, 0);
