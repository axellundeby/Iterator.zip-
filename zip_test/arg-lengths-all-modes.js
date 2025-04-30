// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zip||!xulRuntime.shell)
// Copyright (C) 2025 Theodor Nissen-Meyer. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-iterator.zip
description: >
  Tests Iterator.zip argument behavior across modes with arrays of different lengths.
features: [iterator-sequencing]
---*/

if (typeof assertDeepEq === 'undefined') {
  function assertDeepEq(actual, expected, message = '') {
    if (!isDeepEqual(actual, expected)) {
      throw new Error(`Assertion failed: ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
    }
  }

  function isDeepEqual(a, b) {
    if (a === b) return true;
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((val, i) => isDeepEqual(val, b[i]));
    }
    return false;
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
