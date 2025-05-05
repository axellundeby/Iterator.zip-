// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zip||!xulRuntime.shell)

/*---
description: Iterator.zip should throw TypeError if iterable includes a string
features: [iterator-sequencing]
---*/

assertThrowsInstanceOf(() => {
  Iterator.zip([[], "string"]).next();
}, TypeError, "string in second position");

assertThrowsInstanceOf(() => {
  Iterator.zip(["string", []]).next();
}, TypeError, "string in first position");

assertThrowsInstanceOf(() => {
  Iterator.zip([[], [], "string"]).next();
}, TypeError, "string in third position");

assertThrowsInstanceOf(() => {
  Iterator.zip(["", []]).next();
}, TypeError, "empty string");

assertThrowsInstanceOf(() => {
  Iterator.zip(["abc", "def"]).next();
}, TypeError, "multiple strings");

if (typeof reportCompare === 'function')
  reportCompare(0, 0);
