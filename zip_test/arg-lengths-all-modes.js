// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zip||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Tests Iterator.zip argument behavior across modes with arrays of different lengths.
features: [iterator-sequencing]
---*/

function assertDeepEq(a, b) {
  assertEq(typeof a, typeof b, "Types should match");
  if (Array.isArray(a) && Array.isArray(b)) {
    assertEq(a.length, b.length, "Array lengths should match");
    for (var i = 0; i < a.length; i++) {
      assertDeepEq(a[i], b[i]);
    }
  } else {
    assertEq(a, b, "Values should match");
  }
}

// shortest mode (default)
{
  const iter = Iterator.zip([[1, 2], ['a']]); // shortest wins
  const r1 = iter.next();
  assertDeepEq(r1.value, [1, 'a']);
  assertEq(r1.done, false);

  const r2 = iter.next();
  assertEq(r2.value, undefined);
  assertEq(r2.done, true);
}

// longest mode
{
  const iter = Iterator.zip([[1], ['a', 'b']], { mode: "longest", padding: [null] });
  const r1 = iter.next();
  assertDeepEq(r1.value, [1, 'a']);
  assertEq(r1.done, false);

  const r2 = iter.next();
  assertDeepEq(r2.value, [null, 'b']);
  assertEq(r2.done, false);

  const r3 = iter.next();
  assertEq(r3.value, undefined);
  assertEq(r3.done, true);
}

// strict mode — lengths must match
{
  assertThrowsInstanceOf(() => {
    const iter = Iterator.zip([[1], ['a', 'b']], { mode: "strict" });
    iter.next();
  }, TypeError, "strict mode should throw when lengths differ");

  // also valid when lengths match
  const iter = Iterator.zip([[1, 2], ['a', 'b']], { mode: "strict" });
  const r1 = iter.next();
  assertDeepEq(r1.value, [1, 'a']);
  assertEq(r1.done, false);

  const r2 = iter.next();
  assertDeepEq(r2.value, [2, 'b']);
  assertEq(r2.done, false);

  const r3 = iter.next();
  assertEq(r3.value, undefined);
  assertEq(r3.done, true);
}

if (typeof reportCompare === 'function')
  reportCompare(0, 0);
