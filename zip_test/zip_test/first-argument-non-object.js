// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zip||!xulRuntime.shell)
/*---
esid: sec-iterator.zip
description: >
  Throws if first argument is not an object
features: [iterator-sequencing]
---*/

var obj = [];
var zip = Iterator.zip([obj]);
assertEq(typeof zip.next, "function");

assertThrowsInstanceOf(() => Iterator.zip(null), TypeError);
assertThrowsInstanceOf(() => Iterator.zip(undefined), TypeError);
assertThrowsInstanceOf(() => Iterator.zip(1), TypeError);
assertThrowsInstanceOf(() => Iterator.zip(true), TypeError);
assertThrowsInstanceOf(() => Iterator.zip(Symbol()), TypeError);

reportCompare(0, 0);
