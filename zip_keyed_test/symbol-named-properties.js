// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zipKeyed||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator-zipKeyed
description: >
  Iterator.zipKeyed correctly handles own enumerable properties with Symbol names.
info: |
  The algorithm should include symbol-named properties along with string-named properties,
  and the output objects should reflect these keys.
features: [iterator-sequencing]
---*/

let sym1 = Symbol("sym1");
let sym2 = Symbol("sym2");

let input = {};
input[sym1] = [10, 20];
input[sym2] = [30, 40];

let iter = Iterator.zipKeyed(input);
let result = iter.next();
assertEq(result.done, false, "Iterator.zipKeyed should yield a result");

let outObj = result.value;
let symbols = Object.getOwnPropertySymbols(outObj);

assert(symbols.includes(sym1), "Output object should include the symbol sym1");
assert(symbols.includes(sym2), "Output object should include the symbol sym2");
assertEq(outObj[sym1], 10, "Value for symbol sym1 should be 10");
assertEq(outObj[sym2], 30, "Value for symbol sym2 should be 30");

reportCompare(0, 0);
