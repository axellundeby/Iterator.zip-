// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zipKeyed||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zipKeyed
description: >
  Ensures that padding is read if and only if mode is "longest".
info: |
  Iterator.zipKeyed( iterables [, options] )

  - If mode is "longest", padding is read from options.padding.
  - If mode is not "longest", padding must not be accessed.
features: [iterator-sequencing]
---*/

let paddingAccessed = false;

// Mode "longest" should read padding
let opts1 = {
  mode: "longest",
  get padding() {
    paddingAccessed = true;
    return { a: 0 };
  }
};
Iterator.zipKeyed({ a: [] }, opts1);
assertEq(paddingAccessed, true, "Padding should be accessed when mode is 'longest'");

// Mode "shortest" should not read padding
paddingAccessed = false;
let opts2 = {
  mode: "shortest",
  get padding() {
    paddingAccessed = true;
    return { a: 0 };
  }
};
Iterator.zipKeyed({ a: [] }, opts2);
assertEq(paddingAccessed, false, "Padding should not be accessed when mode is 'shortest'");

// Mode "strict" should not read padding
paddingAccessed = false;
let opts3 = {
  mode: "strict",
  get padding() {
    paddingAccessed = true;
    return { a: 0 };
  }
};
Iterator.zipKeyed({ a: [] }, opts3);
assertEq(paddingAccessed, false, "Padding should not be accessed when mode is 'strict'");

reportCompare(0, 0);
