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
let iter3 = Iterator.zip([[1, 2], [3, 4]], { mode: "strict" });
let iter4 = Iterator.zip([[1, 2], [3, 4]]); 

assertEq(iter1.mode, "longest", "Mode should be 'longest' but was" + iter1.mode);
assertEq(iter2.mode, "shortest", "Mode should be 'shortest' but was" + iter2.mode);
assertEq(iter3.mode, "strict", "Mode should default to 'shortest' but was" + iter3.mode);
assertEq(iter2.mode, "shortest", "Mode should be 'shortest' but was" + iter4.mode);

reportCompare(0, 0);