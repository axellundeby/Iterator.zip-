// |reftest| shell-option(--enable-joint-iteration) skip-if(!Iterator.zip||!xulRuntime.shell)
/*---
esid: sec-iterator.zip
description: >
  Empty iterable as an argument produces an iterator that is immediately done.
features: [iterator-sequencing]
---*/

// Case 1: One of the iterables is empty
{
  const empty = [];
  const nonEmpty = [1, 2, 3];
  
  const zip = Iterator.zip([empty, nonEmpty]);
  const result = zip.next();
  
  assertEq(result.done, true);
  assertEq(result.value, undefined);
}

// Case 2: Both iterables are empty
{
  const empty1 = [];
  const empty2 = [];
  
  const zip = Iterator.zip([empty1, empty2]);
  const result = zip.next();
  
  assertEq(result.done, true);
  assertEq(result.value, undefined);
}

// Case 3: Single empty iterable
{
  const empty = [];
  
  const zip = Iterator.zip([empty]);
  const result = zip.next();
  
  assertEq(result.done, true);
  assertEq(result.value, undefined);
}

// Case 4: No iterables at all (empty outer array)
{
  const zip = Iterator.zip([]);
  const result = zip.next();
  
  assertEq(result.done, true);
  assertEq(result.value, undefined);
}

if (typeof reportCompare === 'function')
  reportCompare(0, 0);
