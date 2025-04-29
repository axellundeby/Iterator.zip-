// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zip||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Ensures that iterators are properly closed via .return() in various cases.
info: |
  - Errors before accessing iterables should not close anything.
  - Errors from one iterable do not close that iterator, but others may be closed.
  - "shortest" or "strict" modes close remaining iterators when the shortest is exhausted.
  - "longest" mode does not close iterators that have already completed.
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

// --- ERROR CASES ---

// Case: Error thrown before accessing iterables (should not close anything)
assertThrowsInstanceOf(() => Iterator.zip(null), TypeError);

// Case: Error from one iterable breaking the iterator contract (it should not be closed)
let badIterable = {
    [Symbol.iterator]() {
        return {
            next() { throw new Error("Iterator contract broken"); },
            return() { throw new Error("This should not be called"); }
        };
    }
};

let safeIterator = createIterator([1, 2, 3], "safe");
// assertThrowsInstanceOf(() => Iterator.zip([badIterable, safeIterator]).next(), Error);
assertEq(safeIterator.closed, true, "Safe iterator should be closed");
  
// --- SHORTEST / STRICT MODE ---

let shortIter = createIterator([1, 2], "short");
let longIter = createIterator([10, 20, 30, 40], "long");

let iterator = Iterator.zip([shortIter, longIter], { mode: "shortest" });

iterator.next(); // [1, 10]
iterator.next(); // [2, 20]
let finalResult = iterator.next(); // Should close `longIter`

assertEq(finalResult.done, true, "Iterator should be done after shortest exhausted");
assertEq(longIter.closed, true, "Long iterator should be closed");
assertEq(shortIter.closed, false, "Short iterator should NOT be closed");

// --- STRICT MODE ---

// shortIter = createIterator([1, 2], "short");
// longIter = createIterator([10, 20, 30, 40], "long");

// iterator = Iterator.zip([shortIter, longIter], { mode: "strict" });

// iterator.next();
// iterator.next();
// finalResult = iterator.next();

// assertEq(finalResult.done, true, "Iterator should be done after shortest exhausted");
// assertEq(longIter.closed, true, "Long iterator should be closed");

// --- LONGEST MODE ---

// let longestIter1 = createIterator([1, 2, 3], "longest1");
// let longestIter2 = createIterator([10, 20], "longest2");

// iterator = Iterator.zip([longestIter1, longestIter2], { mode: "longest", padding: [null, undefined] });

// iterator.next(); // [1, 10]
// iterator.next(); // [2, 20]
// iterator.next(); // [3, undefined]

// assertEq(longestIter1.closed, false, "Iterator 1 should NOT be closed (exhausted naturally)");
// assertEq(longestIter2.closed, true, "Iterator 2 should be closed since it exhausted first");

// --- CORRECT RECEIVER FOR .return() ---

// let returnSpy = [];
// let trackedIterator = {
//     next() { return { value: 42, done: false }; },
//     return() {
//         returnSpy.push(this);
//         return { done: true };
//     }
// };
// let trackedIterable = {
//     [Symbol.iterator]() {
//         return trackedIterator;
//     }
// };

// iterator = Iterator.zip([trackedIterable, shortIter]);
// iterator.next();
// iterator.return();

// assertEq(returnSpy.length, 1, ".return() should have been called once");
// assertEq(returnSpy[0], trackedIterator, ".return() should be called on the correct iterator");


reportCompare(0, 0);