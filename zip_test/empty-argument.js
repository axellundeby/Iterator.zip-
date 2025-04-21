// |reftest| shell-option(--enable-iterator-sequencing) skip-if(!Iterator.zip||!xulRuntime.shell) -- iterator-sequencing is not enabled unconditionally, requires shell-options
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Empty iterable as an argument produces an iterator that is immediately done.
info: |
  Iterator.zip ( iterables [, options] )

  - In "shortest" mode (default), the resulting iterator stops as soon as any iterable is exhausted.
features: [iterator-sequencing]
---*/

// empty iterable as argument produces iterator which is finished
let arg1 = [];
let arg2 = [1, 2, 3];

let zipResult = Iterator.zip([arg1, arg2])

let iterResult = zipIterator.next();

assert.sameValue(iterResult.done, true);

reportCompare(0, 0);

