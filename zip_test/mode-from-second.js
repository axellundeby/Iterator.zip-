// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zip||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Ensures that the mode is correctly read from the second argument (options).
info: |
  Iterator.zip ( iterables [, options] )

  - The mode should be read from options.mode.
  - If mode is not provided, it defaults to "shortest".
features: [iterator-sequencing]
---*/

let iter1 = Iterator.zip([[1, 2], [3, 4]], { mode: "longest" });
let iter2 = Iterator.zip([[1, 2], [3, 4]], { mode: "shortest" });
let iter3 = Iterator.zip([[1, 2], [3, 4]]); 

assertEq(iter1.mode, "longest", "Mode should be 'longest' when explicitly set.");
assertEq(iter2.mode, "shortest", "Mode should be 'shortest' when explicitly set.");
assertEq(iter3.mode, "shortest", "Mode should default to 'shortest' when not provided.");

reportCompare(0, 0);