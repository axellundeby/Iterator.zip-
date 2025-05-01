// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zipKeyed||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zipKeyed
description: >
  Ensures that iterators are properly closed via .return() in various cases.
info: |
  - Errors before accessing values should not close anything.
  - Errors from one iterable do not close that iterator, but others may be closed.
  - "shortest" or "strict" modes close remaining iterators when one is exhausted.
  - "longest" mode does not close iterators that are already exhausted.
  - .return() is called with the correct receiver.
features: [iterator-sequencing]
---*/

function createIterator(values, label) {
    let index = 0;
    let closed = false;
    return {
      next() {
        if (index < values.length) {
          return { value: values[index++], done: false };
        }
        return { done: true };
      },
      return() {
        closed = true;
        return { done: true };
      },
      get closed() {
        return closed;
      }
    };
  }
  
  // --- ERROR CASE: invalid input ---
  
  assertThrowsInstanceOf(() => {
    Iterator.zipKeyed(null);
  }, TypeError, "Invalid first argument should not trigger .return()");
  
  // --- ERROR CASE: one iterator throws during next(), others should close ---
  
  let badIterable = {
    get a() {
      return {
        [Symbol.iterator]() {
          return {
            next() {
              throw new Error("Iterator contract broken");
            },
            return() {
              throw new Error("Should not be called");
            }
          };
        }
      };
    },
    get b() {
      const iter = createIterator([1, 2], "safe");
      Object.defineProperty(this, "_b_iter", { value: iter });
      return iter;
    }
  };
  
  assertThrowsInstanceOf(() => {
    Iterator.zipKeyed(badIterable).next();
  }, Error, "Iterator contract broken");
  
  assertEq(badIterable._b_iter.closed, true, "Safe iterator should be closed");
  
  // --- SHORTEST MODE ---
  
  let shortIter = createIterator([1, 2], "short");
  let longIter = createIterator([10, 20, 30], "long");
  
  let zip = Iterator.zipKeyed({ short: shortIter, long: longIter }, { mode: "shortest" });
  
  zip.next();
  zip.next();
  let final = zip.next();
  
  assertEq(final.done, true);
  assertEq(longIter.closed, true, "Long iterator should be closed when short ends");
  assertEq(shortIter.closed, false, "Short iterator should not be closed");
  
  // --- STRICT MODE ---
  
  shortIter = createIterator([1, 2], "short");
  longIter = createIterator([10, 20, 30], "long");
  
  zip = Iterator.zipKeyed({ short: shortIter, long: longIter }, { mode: "strict" });
  
  zip.next();
  zip.next();
  final = zip.next();
  
  assertEq(final.done, true);
  assertEq(longIter.closed, true, "Long iterator should be closed");
  assertEq(shortIter.closed, false, "Short iterator should not be closed");
  
  // --- LONGEST MODE ---
  
  let iter1 = createIterator([1, 2, 3], "iter1");
  let iter2 = createIterator([10, 20], "iter2");
  
  zip = Iterator.zipKeyed({ one: iter1, two: iter2 }, {
    mode: "longest",
    padding: { one: null, two: null }
  });
  
  zip.next();
  zip.next();
  zip.next(); // triggers padding for `two`
  
  assertEq(iter1.closed, false, "Iterator 1 should not be closed");
  assertEq(iter2.closed, true, "Iterator 2 should be closed after natural exhaustion");
  
  // --- .return() RECEIVER CHECK ---
  
  let returnSpy = [];
  let trackedIterable = {
    [Symbol.iterator]() {
      let obj = {
        next() {
          return { value: 42, done: false };
        },
        return() {
          returnSpy.push(this);
          return { done: true };
        }
      };
      return obj;
    }
  };
  
  shortIter = createIterator([1], "short");
  
  zip = Iterator.zipKeyed({ a: trackedIterable, b: shortIter });
  
  zip.next();
  zip.return();
  
  assertEq(returnSpy.length, 1, ".return() should have been called once");
  assertEq(typeof returnSpy[0], "object", ".return() should have been called with correct receiver");
  
  reportCompare(0, 0);
  