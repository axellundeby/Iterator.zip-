/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function IteratorIdentity() {
  return this;
}

/* ECMA262 7.2.7 */
function IteratorNext(iteratorRecord, value) {
  // Steps 1-2.
  var result =
    ArgumentsLength() < 2
      ? callContentFunction(iteratorRecord.nextMethod, iteratorRecord.iterator)
      : callContentFunction(
        iteratorRecord.nextMethod,
        iteratorRecord.iterator,
        value
      );
  // Step 3.
  if (!IsObject(result)) {
    ThrowTypeError(JSMSG_OBJECT_REQUIRED, result);
  }

  // Step 4.
  return result;
}

// https://tc39.es/ecma262/#sec-getiterator
function GetIterator(obj, isAsync, method) {
  // Step 1. If hint is not present, set hint to sync.
  // Step 2. If method is not present, then
  if (!method) {
    // Step 2.a. If hint is async, then
    if (isAsync) {
      // Step 2.a.i. Set method to ? GetMethod(obj, @@asyncIterator).
      method = GetMethod(obj, GetBuiltinSymbol("asyncIterator"));

      // Step 2.a.ii. If method is undefined, then
      if (!method) {
        // Step 2.a.ii.1. Let syncMethod be ? GetMethod(obj, @@iterator).
        var syncMethod = GetMethod(obj, GetBuiltinSymbol("iterator"));

        // Step 2.a.ii.2. Let syncIteratorRecord be ? GetIterator(obj, sync, syncMethod).
        var syncIteratorRecord = GetIterator(obj, false, syncMethod);

        // Step 2.a.ii.2. Return CreateAsyncFromSyncIterator(syncIteratorRecord).
        return CreateAsyncFromSyncIterator(syncIteratorRecord.iterator, syncIteratorRecord.nextMethod);
      }
    } else {
      // Step 2.b. Otherwise, set method to ? GetMethod(obj, @@iterator).
      method = GetMethod(obj, GetBuiltinSymbol("iterator"));
    }
  }

  // Step 3. Let iterator be ? Call(method, obj).
  var iterator = callContentFunction(method, obj);

  // Step 4. If Type(iterator) is not Object, throw a TypeError exception.
  if (!IsObject(iterator)) {
    ThrowTypeError(JSMSG_NOT_ITERABLE, obj === null ? "null" : typeof obj);
  }

  // Step 5. Let nextMethod be ? GetV(iterator, "next").
  var nextMethod = iterator.next;

  // Step 6. Let iteratorRecord be the Record { [[Iterator]]: iterator, [[NextMethod]]: nextMethod, [[Done]]: false }.
  var iteratorRecord = {
    __proto__: null,
    iterator,
    nextMethod,
    done: false,
  };

  // Step 7. Return iteratorRecord.
  return iteratorRecord;
}

/**
 * GetIteratorFlattenable ( obj, stringHandling )
 *
 * https://tc39.es/proposal-iterator-helpers/#sec-getiteratorflattenable
 */
function GetIteratorFlattenable(obj, rejectStrings) {
  assert(typeof rejectStrings === "boolean", "rejectStrings is a boolean");

  // Step 1.
  if (!IsObject(obj)) {
    // Step 1.a.
    if (rejectStrings || typeof obj !== "string") {
      ThrowTypeError(JSMSG_OBJECT_REQUIRED, obj === null ? "null" : typeof obj);
    }
  }

  // Step 2.
  var method = obj[GetBuiltinSymbol("iterator")];

  // Steps 3-4.
  var iterator;
  if (IsNullOrUndefined(method)) {
    iterator = obj;
  } else {
    iterator = callContentFunction(method, obj);
  }

  // Step 5.
  if (!IsObject(iterator)) {
    ThrowTypeError(JSMSG_OBJECT_REQUIRED, iterator === null ? "null" : typeof iterator);
  }

  // Step 6. (Caller must call GetIteratorDirect.)
  return iterator;
}

/**
 * Iterator.from ( O )
 *
 * https://tc39.es/proposal-iterator-helpers/#sec-iterator.from
 */
function IteratorFrom(O) {
  // Step 1. (Inlined call to GetIteratorDirect.)
  var iterator = GetIteratorFlattenable(O, /* rejectStrings= */ false);
  var nextMethod = iterator.next;

  // Step 2.
  //
  // Calls |isPrototypeOf| instead of |instanceof| to avoid looking up the
  // `@@hasInstance` property.
  var hasInstance = callFunction(
    std_Object_isPrototypeOf,
    GetBuiltinPrototype("Iterator"),
    iterator
  );

  // Step 3.
  if (hasInstance) {
    return iterator;
  }

  // Step 4.
  var wrapper = NewWrapForValidIterator();

  // Step 5.
  UnsafeSetReservedSlot(
    wrapper,
    WRAP_FOR_VALID_ITERATOR_ITERATOR_SLOT,
    iterator
  );
  UnsafeSetReservedSlot(
    wrapper,
    WRAP_FOR_VALID_ITERATOR_NEXT_METHOD_SLOT,
    nextMethod
  );

  // Step 6.
  return wrapper;
}

/**
 * %WrapForValidIteratorPrototype%.next ( )
 *
 * https://tc39.es/proposal-iterator-helpers/#sec-wrapforvaliditeratorprototype.next
 */
function WrapForValidIteratorNext() {
  // Steps 1-2.
  var O = this;
  if (!IsObject(O) || (O = GuardToWrapForValidIterator(O)) === null) {
    return callFunction(
      CallWrapForValidIteratorMethodIfWrapped,
      this,
      "WrapForValidIteratorNext"
    );
  }

  // Step 3.
  var iterator = UnsafeGetReservedSlot(O, WRAP_FOR_VALID_ITERATOR_ITERATOR_SLOT);
  var nextMethod = UnsafeGetReservedSlot(O, WRAP_FOR_VALID_ITERATOR_NEXT_METHOD_SLOT);

  // Step 4.
  return callContentFunction(nextMethod, iterator);
}

/**
 * %WrapForValidIteratorPrototype%.return ( )
 *
 * https://tc39.es/proposal-iterator-helpers/#sec-wrapforvaliditeratorprototype.return
 */
function WrapForValidIteratorReturn() {
  // Steps 1-2.
  var O = this;
  if (!IsObject(O) || (O = GuardToWrapForValidIterator(O)) === null) {
    return callFunction(
      CallWrapForValidIteratorMethodIfWrapped,
      this,
      "WrapForValidIteratorReturn"
    );
  }

  // Step 3.
  var iterator = UnsafeGetReservedSlot(O, WRAP_FOR_VALID_ITERATOR_ITERATOR_SLOT);

  // Step 4.
  assert(IsObject(iterator), "iterator is an object");

  // Step 5.
  var returnMethod = iterator.return;

  // Step 6.
  if (IsNullOrUndefined(returnMethod)) {
    return {
      value: undefined,
      done: true,
    };
  }

  // Step 7.
  return callContentFunction(returnMethod, iterator);
}

#ifdef ENABLE_EXPLICIT_RESOURCE_MANAGEMENT;
/**
 * Explicit Resource Management Proposal
 * 27.1.2.1 %IteratorPrototype% [ @@dispose ] ( )
 * https://arai-a.github.io/ecma262-compare/?pr=3000&id=sec-%25iteratorprototype%25-%40%40dispose
 */
function IteratorDispose() {
  // Step 1. Let O be the this value.
  var O = this;

  // Step 2. Let return be ? GetMethod(O, "return").
  var returnMethod = GetMethod(O, "return");

  // Step 3. If return is not undefined, then
  if (returnMethod !== undefined) {
    // Step 3.a. Perform ? Call(return, O, « »).
    callContentFunction(returnMethod, O);
  }

  // Step 4. Return NormalCompletion(empty). (implicit)
}
#endif

/**
 * %IteratorHelperPrototype%.next ( )
 *
 * https://tc39.es/proposal-iterator-helpers/#sec-%iteratorhelperprototype%.next
 */
function IteratorHelperNext() {
  // Step 1.
  var O = this;
  if (!IsObject(O) || (O = GuardToIteratorHelper(O)) === null) {
    return callFunction(
      CallIteratorHelperMethodIfWrapped,
      this,
      "IteratorHelperNext"
    );
  }
  var generator = UnsafeGetReservedSlot(O, ITERATOR_HELPER_GENERATOR_SLOT);
  return callFunction(GeneratorNext, generator, undefined);
}

/**
 * %IteratorHelperPrototype%.return ( )
 *
 * https://tc39.es/proposal-iterator-helpers/#sec-%iteratorhelperprototype%.return
 */
function IteratorHelperReturn() {
  // Step 1.
  var O = this;

  // Step 2.
  if (!IsObject(O) || (O = GuardToIteratorHelper(O)) === null) {
    return callFunction(
      CallIteratorHelperMethodIfWrapped,
      this,
      "IteratorHelperReturn"
    );
  }

  // Step 3. (Implicit)

  // Steps 4-6.
  var generator = UnsafeGetReservedSlot(O, ITERATOR_HELPER_GENERATOR_SLOT);
  return callFunction(GeneratorReturn, generator, undefined);
}

// Lazy %Iterator.prototype% methods
//
// In order to match the semantics of the built-in generator objects used in
// the proposal, we use a reserved slot on the IteratorHelper objects to store
// a regular generator that is called from the %IteratorHelper.prototype%
// methods.
//
// Each of the lazy methods is divided into a prelude and a body, with the
// eager prelude steps being contained in the corresponding IteratorX method
// and the lazy body steps inside the IteratorXGenerator generator functions.
//
// Each prelude method initializes and returns a new IteratorHelper object.
// As part of this initialization process, the appropriate generator function
// is called, followed by GeneratorNext being called on returned generator
// instance in order to move it to its first yield point. This is done so that
// if the `return` method is called on the IteratorHelper before `next` has been
// called, we can catch them in the try and use the finally block to close the
// underlying iterator.

/**
 * Iterator.prototype.map ( mapper )
 *
 * https://tc39.es/proposal-iterator-helpers/#sec-iteratorprototype.map
 */
function IteratorMap(mapper) {
  // Step 1.
  var iterator = this;

  // Step 2.
  if (!IsObject(iterator)) {
    ThrowTypeError(JSMSG_OBJECT_REQUIRED, iterator === null ? "null" : typeof iterator);
  }

  // Step 3.
  if (!IsCallable(mapper)) {
    ThrowTypeError(JSMSG_NOT_FUNCTION, DecompileArg(0, mapper));
  }

  // Step 4. (Inlined call to GetIteratorDirect.)
  var nextMethod = iterator.next;

  // Steps 5-7.
  var result = NewIteratorHelper();
  var generator = IteratorMapGenerator(iterator, nextMethod, mapper);
  UnsafeSetReservedSlot(
    result,
    ITERATOR_HELPER_GENERATOR_SLOT,
    generator
  );

  // Stop at the initial yield point.
  callFunction(GeneratorNext, generator);

  // Step 8.
  return result;
}

/**
 * Iterator.prototype.map ( mapper )
 *
 * Abstract closure definition.
 *
 * https://tc39.es/proposal-iterator-helpers/#sec-iteratorprototype.map
 */
function* IteratorMapGenerator(iterator, nextMethod, mapper) {
  var isReturnCompletion = true;
  try {
    // Initial yield point to handle closing the iterator before the for-of
    // loop has been entered for the first time.
    yield;

    // Not a Return completion when execution continues normally after |yield|.
    isReturnCompletion = false;
  } finally {
    // Call IteratorClose on a Return completion.
    if (isReturnCompletion) {
      IteratorClose(iterator);
    }
  }

  // Step 5.a.
  var counter = 0;

  // Step 5.b.
  for (var value of allowContentIterWithNext(iterator, nextMethod)) {
    // Steps 5.b.i-iii. (Implicit through for-of loop)

    // Step 5.b.iv.
    var mapped = callContentFunction(mapper, undefined, value, counter);

    // Step 5.b.v. (Implicit through for-of loop)

    // Step 5.b.vi.
    yield mapped;

    // Step 5.b.vii. (Implicit through for-of loop)

    // Step 5.b.viii.
    counter += 1;
  }
}

/**
 * Iterator.prototype.filter ( predicate )
 *
 * https://tc39.es/proposal-iterator-helpers/#sec-iteratorprototype.filter
 */
function IteratorFilter(predicate) {
  // Step 1.
  var iterator = this;

  // Step 2.
  if (!IsObject(iterator)) {
    ThrowTypeError(JSMSG_OBJECT_REQUIRED, iterator === null ? "null" : typeof iterator);
  }

  // Step 3.
  if (!IsCallable(predicate)) {
    ThrowTypeError(JSMSG_NOT_FUNCTION, DecompileArg(0, predicate));
  }

  // Step 4. (Inlined call to GetIteratorDirect.)
  var nextMethod = iterator.next;

  // Steps 5-7.
  var result = NewIteratorHelper();
  var generator = IteratorFilterGenerator(iterator, nextMethod, predicate);
  UnsafeSetReservedSlot(
    result,
    ITERATOR_HELPER_GENERATOR_SLOT,
    generator
  );

  // Stop at the initial yield point.
  callFunction(GeneratorNext, generator);

  // Step 8.
  return result;
}

/**
 * Iterator.prototype.filter ( predicate )
 *
 * Abstract closure definition.
 *
 * https://tc39.es/proposal-iterator-helpers/#sec-iteratorprototype.filter
 */
function* IteratorFilterGenerator(iterator, nextMethod, predicate) {
  var isReturnCompletion = true;
  try {
    // Initial yield point to handle closing the iterator before the for-of
    // loop has been entered for the first time.
    yield;

    // Not a Return completion when execution continues normally after |yield|.
    isReturnCompletion = false;
  } finally {
    // Call IteratorClose on a Return completion.
    if (isReturnCompletion) {
      IteratorClose(iterator);
    }
  }

  // Step 5.a.
  var counter = 0;

  // Step 5.b.
  for (var value of allowContentIterWithNext(iterator, nextMethod)) {
    // Steps 5.b.i-iii. (Implicit through for-of loop)

    // Step 5.b.iv.
    var selected = callContentFunction(predicate, undefined, value, counter);

    // Step 5.b.v. (Implicit through for-of loop)

    // Step 5.b.vi.
    if (selected) {
      // Step 5.b.vi.1.
      yield value;

      // Step 5.b.vi.2. (Implicit through for-of loop)
    }

    // Step 5.b.vii.
    counter += 1;
  }
}

/**
 * Iterator.prototype.take ( limit )
 *
 * https://tc39.es/proposal-iterator-helpers/#sec-iteratorprototype.take
 */
function IteratorTake(limit) {
  // Step 1.
  var iterator = this;

  // Step 2.
  if (!IsObject(iterator)) {
    ThrowTypeError(JSMSG_OBJECT_REQUIRED, iterator === null ? "null" : typeof iterator);
  }

  // Steps 3-6.
  var integerLimit = std_Math_trunc(limit);
  if (!(integerLimit >= 0)) {
    ThrowRangeError(JSMSG_NEGATIVE_LIMIT);
  }

  // Step 7. (Inlined call to GetIteratorDirect.)
  var nextMethod = iterator.next;

  // Steps 8-10.
  var result = NewIteratorHelper();
  var generator = IteratorTakeGenerator(iterator, nextMethod, integerLimit);
  UnsafeSetReservedSlot(
    result,
    ITERATOR_HELPER_GENERATOR_SLOT,
    generator
  );

  // Stop at the initial yield point.
  callFunction(GeneratorNext, generator);

  // Step 11.
  return result;
}

/**
 * Iterator.prototype.take ( limit )
 *
 * Abstract closure definition.
 *
 * https://tc39.es/proposal-iterator-helpers/#sec-iteratorprototype.take
 */
function* IteratorTakeGenerator(iterator, nextMethod, remaining) {
  var isReturnCompletion = true;
  try {
    // Initial yield point to handle closing the iterator before the for-of
    // loop has been entered for the first time.
    yield;

    // Not a Return completion when execution continues normally after |yield|.
    isReturnCompletion = false;
  } finally {
    // Call IteratorClose on a Return completion.
    if (isReturnCompletion) {
      IteratorClose(iterator);
    }
  }

  // Step 8.a. (Implicit)

  // Step 8.b.i. (Reordered before for-of loop entry)
  if (remaining === 0) {
    IteratorClose(iterator);
    return;
  }

  // Step 8.b.
  for (var value of allowContentIterWithNext(iterator, nextMethod)) {
    // Steps 8.b.iii-iv. (Implicit through for-of loop)

    // Step 8.b.v.
    yield value;

    // Step 8.b.vi. (Implicit through for-of loop)

    // Steps 8.b.i-ii. (Reordered)
    if (--remaining === 0) {
      // |break| implicitly calls IteratorClose.
      break;
    }
  }
}

/**
 * Iterator.prototype.drop ( limit )
 *
 * https://tc39.es/proposal-iterator-helpers/#sec-iteratorprototype.drop
 */
function IteratorDrop(limit) {
  // Step 1.
  var iterator = this;

  // Step 2.
  if (!IsObject(iterator)) {
    ThrowTypeError(JSMSG_OBJECT_REQUIRED, iterator === null ? "null" : typeof iterator);
  }

  // Steps 3-6.
  var integerLimit = std_Math_trunc(limit);
  if (!(integerLimit >= 0)) {
    ThrowRangeError(JSMSG_NEGATIVE_LIMIT);
  }

  // Step 7. (Inlined call to GetIteratorDirect.)
  var nextMethod = iterator.next;

  // Steps 8-10.
  var result = NewIteratorHelper();
  var generator = IteratorDropGenerator(iterator, nextMethod, integerLimit);
  UnsafeSetReservedSlot(
    result,
    ITERATOR_HELPER_GENERATOR_SLOT,
    generator
  );

  // Stop at the initial yield point.
  callFunction(GeneratorNext, generator);

  // Step 11.
  return result;
}

/**
 * Iterator.prototype.drop ( limit )
 *
 * Abstract closure definition.
 *
 * https://tc39.es/proposal-iterator-helpers/#sec-iteratorprototype.drop
 */
function* IteratorDropGenerator(iterator, nextMethod, remaining) {
  var isReturnCompletion = true;
  try {
    // Initial yield point to handle closing the iterator before the for-of
    // loop has been entered for the first time.
    yield;

    // Not a Return completion when execution continues normally after |yield|.
    isReturnCompletion = false;
  } finally {
    // Call IteratorClose on a Return completion.
    if (isReturnCompletion) {
      IteratorClose(iterator);
    }
  }

  // Step 8.a. (Implicit)

  // Steps 8.b-c.
  for (var value of allowContentIterWithNext(iterator, nextMethod)) {
    // Step 8.b.i.
    if (remaining-- <= 0) {
      // Steps 8.b.ii-iii. (Implicit through for-of loop)
      // Steps 8.c.i-ii. (Implicit through for-of loop)

      // Step 8.c.iii.
      yield value;

      // Step 8.c.iv. (Implicit through for-of loop)
    }
  }
}

/**
 * Iterator.prototype.flatMap ( mapper )
 *
 * https://tc39.es/proposal-iterator-helpers/#sec-iteratorprototype.flatmap
 */
function IteratorFlatMap(mapper) {
  // Step 1.
  var iterator = this;

  // Step 2.
  if (!IsObject(iterator)) {
    ThrowTypeError(JSMSG_OBJECT_REQUIRED, iterator === null ? "null" : typeof iterator);
  }

  // Step 3.
  if (!IsCallable(mapper)) {
    ThrowTypeError(JSMSG_NOT_FUNCTION, DecompileArg(0, mapper));
  }

  // Step 4. (Inlined call to GetIteratorDirect.)
  var nextMethod = iterator.next;

  // Steps 5-7.
  var result = NewIteratorHelper();
  var generator = IteratorFlatMapGenerator(iterator, nextMethod, mapper);
  UnsafeSetReservedSlot(
    result,
    ITERATOR_HELPER_GENERATOR_SLOT,
    generator
  );

  // Stop at the initial yield point.
  callFunction(GeneratorNext, generator);

  // Step 8.
  return result;
}

/**
 * Iterator.prototype.flatMap ( mapper )
 *
 * https://tc39.es/proposal-iterator-helpers/#sec-iteratorprototype.flatmap
 */
function* IteratorFlatMapGenerator(iterator, nextMethod, mapper) {
  var isReturnCompletion = true;
  try {
    // Initial yield point to handle closing the iterator before the for-of
    // loop has been entered for the first time.
    yield;

    // Not a Return completion when execution continues normally after |yield|.
    isReturnCompletion = false;
  } finally {
    // Call IteratorClose on a Return completion.
    if (isReturnCompletion) {
      IteratorClose(iterator);
    }
  }

  // Step 5.a.
  var counter = 0;

  // Step 5.b.
  for (var value of allowContentIterWithNext(iterator, nextMethod)) {
    // Steps 5.b.i-iii. (Implicit through for-of loop)

    // Step 5.b.iv.
    var mapped = callContentFunction(mapper, undefined, value, counter);

    // Step 5.b.v. (Implicit through for-of loop)

    // Steps 5.b.vi.
    var innerIterator = GetIteratorFlattenable(mapped, /* rejectStrings= */ true);
    var innerIteratorNextMethod = innerIterator.next;

    // Step 5.b.vii. (Implicit through for-of loop)

    // Steps 5.b.viii-ix.
    for (var innerValue of allowContentIterWithNext(innerIterator, innerIteratorNextMethod)) {
      // Steps 5.b.ix.1-3 and 5.b.ix.4.a-b. (Implicit through for-of loop)

      // Step 5.b.ix.4.c.
      yield innerValue;

      // Step 5.b.ix.4.d. (Implicit through for-of loop)
    }

    // Step 5.b.x.
    counter += 1;
  }
}

/**
 * Iterator.prototype.reduce ( reducer [ , initialValue ] )
 *
 * https://tc39.es/proposal-iterator-helpers/#sec-iteratorprototype.reduce
 */
function IteratorReduce(reducer /*, initialValue*/) {
  // Step 1.
  var iterator = this;

  // Step 2.
  if (!IsObject(iterator)) {
    ThrowTypeError(JSMSG_OBJECT_REQUIRED, iterator === null ? "null" : typeof iterator);
  }

  // Step 3.
  if (!IsCallable(reducer)) {
    ThrowTypeError(JSMSG_NOT_FUNCTION, DecompileArg(0, reducer));
  }

  // Step 4. (Inlined call to GetIteratorDirect.)
  var nextMethod = iterator.next;

  // Steps 5-6.
  var accumulator;
  var counter;
  if (ArgumentsLength() === 1) {
    // Steps 5.a-d. (Moved below.)
    counter = -1;
  } else {
    // Step 6.a.
    accumulator = GetArgument(1);

    // Step 6.b.
    counter = 0;
  }

  // Step 7.
  for (var value of allowContentIterWithNext(iterator, nextMethod)) {
    if (counter < 0) {
      // Step 5. (Reordered steps to compute initial accumulator.)

      // Step 5.c.
      accumulator = value;

      // Step 5.d.
      counter = 1;
    } else {
      // Steps 7.a-c and 7.e. (Implicit through for-of loop)

      // Steps 7.d and 7.f-g.
      accumulator = callContentFunction(reducer, undefined, accumulator, value, counter++);
    }
  }

  // Step 5.b.
  if (counter < 0) {
    ThrowTypeError(JSMSG_EMPTY_ITERATOR_REDUCE);
  }

  // Step 7.b.
  return accumulator;
}

/**
 * Iterator.prototype.toArray ( )
 *
 * https://tc39.es/proposal-iterator-helpers/#sec-iteratorprototype.toarray
 */
function IteratorToArray() {
  // Step 1.
  var iterator = this;

  // Step 2.
  if (!IsObject(iterator)) {
    ThrowTypeError(JSMSG_OBJECT_REQUIRED, iterator === null ? "null" : typeof iterator);
  }

  // Step 3. (Inlined call to GetIteratorDirect.)
  var nextMethod = iterator.next;

  // Steps 4-5.
  return [...allowContentIterWithNext(iterator, nextMethod)];
}

/**
 * Iterator.prototype.forEach ( fn )
 *
 * https://tc39.es/proposal-iterator-helpers/#sec-iteratorprototype.foreach
 */
function IteratorForEach(fn) {
  // Step 1.
  var iterator = this;

  // Step 2.
  if (!IsObject(iterator)) {
    ThrowTypeError(JSMSG_OBJECT_REQUIRED, iterator === null ? "null" : typeof iterator);
  }

  // Step 3.
  if (!IsCallable(fn)) {
    ThrowTypeError(JSMSG_NOT_FUNCTION, DecompileArg(0, fn));
  }

  // Step 4. (Inlined call to GetIteratorDirect.)
  var nextMethod = iterator.next;

  // Step 5.
  var counter = 0;

  // Step 6.
  for (var value of allowContentIterWithNext(iterator, nextMethod)) {
    // Steps 6.a-c. (Implicit through for-of loop)

    // Steps 6.d and 6.f.
    callContentFunction(fn, undefined, value, counter++);

    // Step 6.e. (Implicit through for-of loop)
  }
}

/**
 * Iterator.prototype.some ( predicate )
 *
 * https://tc39.es/proposal-iterator-helpers/#sec-iteratorprototype.some
 */
function IteratorSome(predicate) {
  // Step 1.
  var iterator = this;

  // Step 2.
  if (!IsObject(iterator)) {
    ThrowTypeError(JSMSG_OBJECT_REQUIRED, iterator === null ? "null" : typeof iterator);
  }

  // Step 3.
  if (!IsCallable(predicate)) {
    ThrowTypeError(JSMSG_NOT_FUNCTION, DecompileArg(0, predicate));
  }

  // Step 4. (Inlined call to GetIteratorDirect.)
  var nextMethod = iterator.next;

  // Step 5.
  var counter = 0;

  // Step 6.
  for (var value of allowContentIterWithNext(iterator, nextMethod)) {
    // Steps 6.a-c. (Implicit through for-of loop)

    // Steps 6.d-g.
    if (callContentFunction(predicate, undefined, value, counter++)) {
      return true;
    }
  }

  // Step 6.b.
  return false;
}

/**
 * Iterator.prototype.every ( predicate )
 *
 * https://tc39.es/proposal-iterator-helpers/#sec-iteratorprototype.every
 */
function IteratorEvery(predicate) {
  // Step 1.
  var iterator = this;

  // Step 2.
  if (!IsObject(iterator)) {
    ThrowTypeError(JSMSG_OBJECT_REQUIRED, iterator === null ? "null" : typeof iterator);
  }

  // Step 3.
  if (!IsCallable(predicate)) {
    ThrowTypeError(JSMSG_NOT_FUNCTION, DecompileArg(0, predicate));
  }

  // Step 4. (Inlined call to GetIteratorDirect.)
  var nextMethod = iterator.next;

  // Step 5.
  var counter = 0;

  // Step 6.
  for (var value of allowContentIterWithNext(iterator, nextMethod)) {
    // Steps 6.a-c. (Implicit through for-of loop)

    // Steps 6.d-g.
    if (!callContentFunction(predicate, undefined, value, counter++)) {
      return false;
    }
  }

  // Step 6.b.
  return true;
}

/**
 * Iterator.prototype.find ( predicate )
 *
 * https://tc39.es/proposal-iterator-helpers/#sec-iteratorprototype.find
 */
function IteratorFind(predicate) {
  // Step 1.
  var iterator = this;

  // Step 2.
  if (!IsObject(iterator)) {
    ThrowTypeError(JSMSG_OBJECT_REQUIRED, iterator === null ? "null" : typeof iterator);
  }

  // Step 3.
  if (!IsCallable(predicate)) {
    ThrowTypeError(JSMSG_NOT_FUNCTION, DecompileArg(0, predicate));
  }

  // Step 4. (Inlined call to GetIteratorDirect.)
  var nextMethod = iterator.next;

  // Step 5.
  var counter = 0;

  // Step 6.
  for (var value of allowContentIterWithNext(iterator, nextMethod)) {
    // Steps 6.a-c. (Implicit through for-of loop)

    // Steps 6.d-g.
    if (callContentFunction(predicate, undefined, value, counter++)) {
      return value;
    }
  }
}


/**
 * Iterator.zip (iterables [, options])
 *
 * https://tc39.es/proposal-joint-iteration/#sec-iterator.zip
 */
function IteratorZip(iterables, options = {}) {
  //1. 1. If iterables is not an Object, throw a TypeError exception.
  if (typeof iterables !== 'object' || iterables === null) {
    throw new TypeError('iterables must be an object');
  }

  //2. Set options to ? GetOptionsObject(options).
  options = GetOptionsObject(options);

  //3. Let mode be ? Get(options, "mode").
  var mode = options.mode;

  //4.If mode is undefined, set mode to "shortest".
  if (mode == undefined) {
    mode = 'shortest';
  }

  //.5 If mode is not one of "shortest", "longest", or "strict", throw a TypeError exception.
  if ("shortest" !== mode && "longest" !== mode && "strict" !== mode) {
    throw new TypeError('Not valid type');
  }

  //6. Let paddingOption be undefined.
  var paddingOption;

  //7. If mode is "longest", then
  if (mode === "longest") {
    //a. Set paddingOption to ? Get(options, "padding").
    paddingOption = options.padding;

    //b. If paddingOption is not undefined and paddingOption is not an Object, throw a TypeError exception.
    if (paddingOption !== undefined && (typeof paddingOption !== 'object' || paddingOption === null)) {
      throw new TypeError("paddingOption must be an object");
    }
  }

  //8. Let iters be a new empty List.
  var iters = [];
  //9. Let padding be a new empty List.
  var padding = [];
  //Let inputIter be ? GetIterator(iterables, sync).
  var inputIter = GetIterator(iterables, false);
  //11. Let next be not-started.
  var next = { done: false };

  //12. Repeat, while next is not done, 
  while (!next.done) {
    //a. Set next to Completion(IteratorStepValue(inputIter)).
    next = IteratorNext(inputIter);

    //b. IfAbruptCloseIterators(next, iters).
    IfAbruptCloseIterators(next, iters);

    //c. If next is not done, then
    if (!next.done) {
      //Let iter be Completion(GetIteratorFlattenable(next, reject-strings)).
      var iter = GetIteratorDirect(GetIteratorFlattenable(next.value, true));

      //ii. IfAbruptCloseIterators(iter, the list-concatenation of « inputIter » and iters).
      IfAbruptCloseIterators(iter, concatenateArrays([inputIter], iters));

      //iii. Append iter to iters.
      iters[iters.length] = iter;
    }
  }

  //13. Let iterCount be the number of elements in iters.
  var iterCount = iters.length;
  //14. If mode is "longest", then
  if (mode === 'longest') {
    //a. If paddingOption is undefined, then
    if (paddingOption === undefined) {
      //i. Perform the following steps iterCount times:
      for (var index = 0; index < iterCount; index++) {
        //1. Append undefined to padding.
        padding[index] = undefined;
      }
    }
    //b. Else
    else {
      //i. Let paddingIter be Completion(GetIterator(paddingOption, sync)).
      var paddingIter = GetIterator(paddingOption, false);
      //ii. IfAbruptCloseIterators(paddingIter, iters).
      IfAbruptCloseIterators(paddingIter, iters);
      //iii. Let usingIterator be true.
      var usingIterator = true;
      //iv. Perform the following steps iterCount times:
      for (var k = 0; k < iterCount; k++) {
        //1. If usingIterator is true, then
        if (usingIterator) {
          //a. Set next to Completion(IteratorStepValue(paddingIter)).
          next = IteratorNext(paddingIter);
          //b. IfAbruptCloseIterators(next, iters).
          IfAbruptCloseIterators(next, iters);
          //c. If next is done, then
          if (next.done) {
            //i. Set usingIterator to false
            usingIterator = false;
          }
          //d. Else,
          else {
            //i. Append next to padding.
            padding[padding.length] = next.value;
          }
        }
        //2. If usingIterator is false, append undefined to padding.
        if (!usingIterator) {
          padding[padding.length] = undefined;

        }
      }
      //If usingIterator is true, then
      if (usingIterator) {
        //1. Let completion be Completion(IteratorClose(paddingIter, NormalCompletion(unused))).
        IteratorClose(paddingIter);
        var completion = NormalCompletion(undefined);
        //2. IfAbruptCloseIterators(completion, iters).
        IfAbruptCloseIterators(completion, iters);
      }
    }
  }
  function finishResults(results) {
    return std_ArrayCreate(results);
  }

  return zipping(iters, mode, padding, finishResults);

}



function zipping(iters, mode, padding, finishResults) {
  //1. Let iterCount be the number of elements in iters.
  var iterCount = iters.length;
  //2. Let openIters be a copy of iters.
  var openIters = iters;
  //3. Let closure be a new Abstract Closure with no parameters that captures iters, iterCount, openIters, mode, padding, and finishResults, 
  function closure() {
    // 3.a. If iterCount = 0, return ReturnCompletion(undefined).
    if (iterCount === 0) {
      return CreateIteratorResultObject(undefined, true);
    }

    // 3.b. Repeat:
    var results = [];

    // 3.b.ii. Assert: openIters is not empty.

    // 3.b.iii: For each integer i such that 0 ≤ i < iterCount, in ascending order, do
    var i = 0;
    while (i < iterCount) {

      // 3.b.iii.1: Let iter be iters[i].
      var iter = iters[i];

      // 3.b.iii.2: If iter is null, then
      if (iter === null) {
        // 3.b.iii.2.a: Assert: mode is "longest"
        // (This is a spec assertion — no runtime check needed.)

        // 3.b.iii.2.b: Let result be padding[i]
        results[i] = padding[i];
      } else {
        // 3.b.iii.3.a: Let result be Completion(IteratorStepValue(iter))
        var result;
        try {
          result = IteratorNext(iter); // This is IteratorStepValue
        } catch (e) {
          // 3.b.iii.3.b.i: Remove iter from openIters
          openIters[i] = null;

          // 3.b.iii.3.b.ii: Return ? IteratorCloseAll(openIters, result)
          return IteratorCloseAll(openIters, ThrowCompletion(e));
        }

        //d. If result is done, then
        if (result.done) {

          //i: Remove iter from openIters.
          openIters[i] = null;

          //ii: If mode is "shortest", then
          if (mode === "shortest") {
           //i: Return ? IteratorCloseAll(openIters, ReturnCompletion(undefined))
            return IteratorCloseAll(
              openIters,
              CreateIteratorResultObject(undefined, true)
            );
          }

          // 3.b.iii.3.d.iii: Else if mode is "strict", then
          if (mode === "strict") {

            // 3.b.iii.3.d.iii.i: If i ≠ 0, then
            if (i !== 0) {
              // 3.b.iii.3.d.iii.i.i: Return ? IteratorCloseAll(openIters, Throw(TypeError))
              return IteratorCloseAll(
                openIters,
                ThrowCompletion(NewTypeError("Strict mode: iterators ended at different times"))
              );
            }

            // 3.b.iii.3.d.iii.ii: For each integer k such that 1 ≤ k < iterCount
            var k = 1;
            while (k < iterCount) {

              // 3.b.iii.3.d.iii.ii.i: Assert: iters[k] is not null
              // (This is an assertion — no runtime check needed.)

              var other = iters[k];

              if (other !== null) {
                var step;

                // 3.b.iii.3.d.iii.ii.ii: Let open be Completion(IteratorStep(iters[k]))
                try {
                  step = IteratorNext(other); // IteratorStep = same as IteratorNext
                } catch (e) {
                  // 3.b.iii.3.d.iii.ii.iii: If abrupt, remove and return IteratorCloseAll
                  openIters[k] = null;
                  return IteratorCloseAll(openIters, ThrowCompletion(e));
                }

                // 3.b.iii.3.d.iii.ii.iv: Set open to !open (unwrap normal result)
                // (Handled implicitly in JS)

                // 3.b.iii.3.d.iii.ii.v: If open is DONE, remove from openIters
                if (step.done) {
                  openIters[k] = null;
                }
                // 3.b.iii.3.d.iii.ii.vi: Else, throw TypeError
                else {
                  return IteratorCloseAll(
                    openIters,
                    ThrowCompletion(NewTypeError("Strict mode: iterators ended at different times"))
                  );
                }
              }

              k = k + 1;
            }

            // 3.b.iii.3.d.iii.iii: Return ReturnCompletion(undefined)
            return CreateIteratorResultObject(undefined, true);

          }

          // 3.b.iii.3.d.iv: Else (mode is "longest")
          iters[i] = null;               // 3.b.iii.3.d.iv.iii: Set iters[i] to null
          results[i] = padding[i];       // 3.b.iii.3.d.iv.iv: Set result to padding[i]

          // 3.b.iii.3.d.iv.ii: If openIters is empty, return ReturnCompletion(undefined)
          var allClosed = true;
          var j = 0;
          while (j < iterCount) {
            if (openIters[j] !== null) {
              allClosed = false;
              break;
            }
            j = j + 1;
          }
          if (allClosed) {
            return CreateIteratorResultObject(undefined, true);
          }

        } else {
          // 3.b.iii.4: Append result to results
          results[i] = result.value;
        }
      }
      // End of 3.b.iii loop
      i = i + 1;
    }
    // 3.b.iv: Set results = finishResults(results)
    var zipped = finishResults(results);

    // 3.b.v: Let completion be Completion(Yield(results))
    // (Handled by returning a result object here)
    return CreateIteratorResultObject(zipped, false);

    // 3.b.vi: If completion is an abrupt completion, then
    //This is handled in the .next() wrapper outside the closure.
  }



  var obj = {};
  var IteratorHelperPrototype = {};

  obj["[[Closure]]"] = closure;
  obj["[[GeneratorState]]"] = "suspended-start";
  obj["[[UnderlyingIterators]]"] = openIters;
  obj.__proto__ = IteratorHelperPrototype;

  obj.next = function () {
    var state = obj["[[GeneratorState]]"];

    if (state === "completed") {
      return CreateIteratorResultObject(undefined, true);
    }

    obj["[[GeneratorState]]"] = "executing";

    var fn = obj["[[Closure]]"];
    var result = fn();
    if (!IsObject(result)) {
      return CreateIteratorResultObject(undefined, true);
    }

    if (result.done) {
      obj["[[GeneratorState]]"] = "completed";
    } else {
      obj["[[GeneratorState]]"] = "suspended-start";
    }

    return result;
  };
  obj[GetBuiltinSymbol("iterator")] = function () { return this; };

  return obj;
}


function CreateIteratorResultObject(value, done) {
  return { value: value, done: done };
}


// const zip1 = Iterator.zip([[1, 2, 3], ['a', 'b']], { mode: 'shortest' });

// Iterator.zip([[1, 2, 3], [undefined, undefined]], { mode: 'shortest' });

// const zip2 = Iterator.zip([[1, 2, 3], ['a', 'b'],["jump", "run"]], { mode: 'longest', padding: ["meow"] });


//const zipKeyed1 = Iterator.zipKeyed({num:[1,2,3], let:['a','b']}, {mode:'longest', padding:{num: 1, let: 1}});

//const zipKeyed2 = Iterator.zipKeyed({num:[1,2,3], let:['a','b']}, {mode:'shortest'});

// const zipIt1 = Iterator.zip([[1, 2], ["a", "b"]], { mode: 'shortest' });
// for (const zp1 of zipIt) {
//     print(zp1);
//   }
  
  // const zipIt2 = Iterator.zip([[1, 2], ["a", "b"], ["jeg", "liker", "hester"]],  { mode: 'longest', padding: ["zip","cool"] });
  // for (const zp2 of zipIt2) {
  //     print(zp2);
  //   }
    
//const zip3 = Iterator.zip([[1, 2], ["a", "b", "c"]], { mode: "strict" });

function GetOptionsObject(options) {
  if (options === undefined) {
    // Step 1: Create an object with a null prototype using callFunction.
    return std_Object_create(null)
  }
  if (IsObject(options)) {
    // Step 2: If options is an object, return it.
    return options;
  }
  // Step 3: If options is neither undefined nor an object, throw a TypeError.
  throw new TypeError('Options must be an object or undefined');
}


function IteratorHelperPrototypeReturn() {
  var O = this;

  // 3. Perform ? RequireInternalSlot(O, [[UnderlyingIterators]])
  if (!IsObject(O) || !('[[UnderlyingIterators]]' in O)) {
    throw new TypeError('Object does not have [[UnderlyingIterators]]');
  }

  // 4. Assert: O has a [[GeneratorState]] slot
  if (!('[[GeneratorState]]' in O)) {
    throw new TypeError('Object does not have [[GeneratorState]]');
  }

  // 5. If O.[[GeneratorState]] is "suspended-start"
  if (O['[[GeneratorState]]'] === 'suspended-start') {
    O['[[GeneratorState]]'] = 'completed';


    return CreateIteratorResultObject(undefined, true);
  }

  // 6. Let C be Completion { [[Type]]: return, [[Value]]: undefined, [[Target]]: empty }
  var completion = {
    '[[Type]]': 'return',
    '[[Value]]': undefined,
    '[[Target]]': undefined
  };

  // 7. Return ? GeneratorResumeAbrupt(O, C, "Iterator Helper")
  return GeneratorResumeAbrupt(O, completion, 'Iterator Helper');
}

function IfAbruptCloseIterators(value, iteratorRecords) {
  if (value === undefined) return "Error: value is undefined!";
  if (!IsObject(value)) return "Error: value is not an object!";
  if (!('[[Type]]' in value)) return "Error: Missing [[Type]] field!";

  // Step 2: If value is an abrupt completion, return ? IteratorCloseAll(iteratorRecords, value).
  if (value['[[Type]]'] !== 'normal') {
    return IteratorCloseAll(iteratorRecords, value);
  }

  // Step 3: Otherwise, return value.[[Value]].
  return value['[[Value]]'];
}

function concatenateArrays(array1, array2) {
  var result = [];
  for (var i = 0; i < array1.length; i++) {
    result[i] = array1[i];
  }
  for (var j = 0; j < array2.length; j++) {
    result[array1.length + j] = array2[j];
  }
  return result;
}


function IteratorCloseAll(iters, completion) {
  var i = iters.length - 1;
  while (i >= 0) {
    var iter = iters[i];
    if (iter !== null && IsObject(iter)) {
      try {
        IteratorClose(iter);
      } catch (e) {
        throw e; 
      }
    }
    i = i - 1;
  }
  return completion;
}





/**
 * Iterator.zipKeyed (iterables [, options])
 *
 * IteratorZipKeyed(iterables, options = {}) 
 * https://tc39.es/proposal-joint-iteration/#sec-iterator.zipKeyed
 */
function IteratorZipKeyed(iterables, options = {}) {
  // 1. Hvis iterables ikke er et objekt, kast en TypeError.
  // if (iterables === null) {
  if (iterables === null || typeof iterables !== 'object') {
    throw new TypeError('iterables must be an object');
  }


  // 2. Sett options til ? GetOptionsObject(options).
  options = GetOptionsObject(options);
  // print("kommet forbi biffen baba")

  //3. Let mode be ? Get(options, "mode").
  var mode = options.mode;

  //4.If mode is undefined, set mode to "shortest".
  if (mode == undefined) {
    mode = 'shortest';
  }

  // 5. Hvis mode ikke er en av "shortest", "longest" eller "strict", kast en TypeError.
  if (mode !== 'shortest' && mode !== 'longest' && mode !== 'strict') {
    // return "mode not valid"
    throw TypeError("Mode not valid")
  }



  // 6. La paddingOption være undefined.
  var paddingOption;

  // 7. Hvis mode er "longest", så:
  if (mode === 'longest') {

    // a. Sett paddingOption til ? Get(options, "padding").
    paddingOption = options.padding;

    //b. If paddingOption is not undefined and paddingOption is not an Object, throw a TypeError exception.
    // if (paddingOption !== undefined && typeof paddingOption === null) {
    //   return "paddingOption must be an object";
    // }
    if (paddingOption !== undefined && (typeof paddingOption !== "object" || paddingOption === null)) {
      throw new TypeError("paddingOption must be an object");
    }
  }

  // 8. La iters være en ny tom liste.
  var iters = [];
  // 9. La padding være en ny tom liste.
  var padding = [];

  //10. La allKeys være ? iterables.[[OwnPropertyKeys]]().
  var allKeys = std_Reflect_ownKeys(iterables);


  // 11. La keys være en ny tom liste.
  var keys = [];

  // 12. For hver key i allKeys, gjør:
  for (var i = 0; i < allKeys.length; i++) {
    var key = allKeys[i];

    // a. La desc være Completion(iterables.[[GetOwnProperty]](key)).
    //var desc = getOwnPropDescriptor(iterables, key);
    var desc = ObjectGetOwnPropertyDescriptor(iterables, key);

    // b. ifAbruptCloseIterators(desc, iters)
    IfAbruptCloseIterators(desc, iters);

    //   // c. Hvis desc ikke er undefined og desc.[[Enumerable]] er true, så:
    if (desc !== undefined && desc.enumerable) {
      var value;
      //     // i. La value være undefined.
      //     // ii. Hvis IsDataDescriptor(desc) er true, så:
      if ("value" in desc) {
        value = desc.value;
      } else {
        //       // iii. Ellers, for accessor descriptors:
        var getter = desc.get;
        if (getter !== undefined) {
          var getterResult = callContentFunction(getter, iterables); //Her må det gjøres noe(?)
          IfAbruptCloseIterators(getterResult, iters);
          value = getterResult;
          // }
        }
      }

      // iv. Hvis value ikke er undefined, så:
      if (value !== undefined) {
        //  1. Append key til keys.
        callFunction(keys.push, keys, key);
        // 2. La iter være Completion(GetIteratorFlattenable(value, REJECT-STRINGS)).
        //var iter = GetIteratorFlattenable(value, "REJECT-STRINGS"); // getIterator(next.value, false)
        var iter = GetIteratorDirect(GetIteratorFlattenable(value, true));//DEnne er nok ikke helt riktig nei

        // 3. ifAbruptCloseIterators(iter, iters).
        IfAbruptCloseIterators(iter, iters);
        // 4. Append iter til iters.
        callFunction(iters.push, iters, iter); //Stemmer disse da?
      }
    }
  }


  // // 13. La iterCount være antallet elementer i iters.
  var iterCount = iters.length;
  // // 14. Hvis mode er "longest", så:
  if (mode === 'longest') {
    //   // a. Hvis paddingOption er undefined, så:
    if (paddingOption === undefined) {
      //     // i. Utfør følgende steg iterCount ganger:
      for (var index = 0; index < iterCount; index++) {
        //       // 1. Append undefined til padding.
        padding[index] = undefined;
      }

    } else {
      //    i. For hver key i keys, gjør:
      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        // 1. La value være Completion(Get(paddingOption, key)).
        var value = paddingOption[key];
        //       // 2. ifAbruptCloseIterators(value, iters).
        IfAbruptCloseIterators(value, iters);
        //       // 3. Append value til padding.
        callFunction(padding.push, padding, value);
      }
    }
  }

  // Inside the Iterator.zipKeyed implementation, after computing `keys` and `iterCount`
  function finishResults(results) {
    var obj = std_Object_create(null);
    for (var i = 0; i < iterCount; i++) {
      DefineDataProperty(obj, keys[i], results[i]);
    }
    return obj;
  }


  return zipping(iters, mode, padding, finishResults);
}


#ifdef NIGHTLY_BUILD;
/**
 * Iterator.concat ( ...items )
 *
 * https://tc39.es/proposal-iterator-sequencing/
 */
function IteratorConcat() {
  // Step 1.
  //
  // Stored in reversed order to simplify removing processed items.
  var index = ArgumentsLength() * 2;
  var iterables = std_Array(index);

  // Step 2.
  for (var i = 0; i < ArgumentsLength(); i++) {
    var item = GetArgument(i);

    // Step 2.a.
    if (!IsObject(item)) {
      ThrowTypeError(JSMSG_OBJECT_REQUIRED, typeof item);
    }

    // Step 2.b. (Inlined GetMethod)
    var method = item[GetBuiltinSymbol("iterator")];

    // Step 2.c.
    if (!IsCallable(method)) {
      ThrowTypeError(JSMSG_NOT_ITERABLE, ToSource(item));
    }

    // Step 2.d.
    DefineDataProperty(iterables, --index, item);
    DefineDataProperty(iterables, --index, method);
  }
  assert(index === 0, "all items stored");

  // Steps 3-5.
  var result = NewIteratorHelper();
  var generator = IteratorConcatGenerator(iterables);
  UnsafeSetReservedSlot(
    result,
    ITERATOR_HELPER_GENERATOR_SLOT,
    generator
  );

  // Step 6.
  return result;
}

/**
 * Iterator.concat ( ...items )
 *
 * https://tc39.es/proposal-iterator-sequencing/
 */
function* IteratorConcatGenerator(iterables) {
  assert(IsArray(iterables), "iterables is an array");
  assert(iterables.length % 2 === 0, "iterables contains pairs (item, method)");

  // Step 3.a.
  for (var i = iterables.length; i > 0;) {
    var item = iterables[--i];
    var method = iterables[--i];

    // Remove processed items to avoid keeping them alive.
    iterables.length -= 2;

    // Steps 3.a.i-v.
    for (var innerValue of allowContentIterWith(item, method)) {
      // Steps 3.a.v.1-3. (Implicit through for-of loop)

      yield innerValue;
    }
  }
}


/**
 * Iterator.range (start, end, step, inclusiveEnd, zero, one)
 * 
 * https://tc39.es/proposal-iterator.range/#sec-create-numeric-range-iterator
 */
function* IteratorRangeGenerator(start, end, step, inclusiveEnd, zero, one) {
  //TODO: Handle setting prototype for generators returned from Iterator.range

  // Step 18. Let closure be a new Abstract Closure with no parameters that captures start, end, step, inclusiveEnd, zero, one and performs the following steps when called:
  // Step 18.a: If end > start, let ifIncrease be true
  // Step 18.b: Else let ifIncrease be false
  var ifIncrease = end > start;

  // Step 18.c: If step > zero, let ifStepIncrease be true
  // Step 18.d: Else let ifStepIncrease be false
  var ifStepIncrease = step > zero;

  // Step 18.e: If ifIncrease is not ifStepIncrease, return undefined
  if (ifIncrease !== ifStepIncrease) {
    return undefined;
  }

  // Step 18.f: Let hitsEnd be false
  var hitsEnd = false;

  // Step 18.g: Let currentCount be zero
  var currentCount = zero;

  // Step 18.i: Iterate while hitsEnd is false
  while (hitsEnd === false) {
    // Step 18.i.i: Let currentYieldingValue be start + (step × currentCount)
    var currentYieldingValue = start + (step * currentCount);

    // Step 18.i.ii: If currentYieldingValue is end, set hitsEnd to true
    if (currentYieldingValue === end) {
      hitsEnd = true;
    }

    // Step 18.i.iii: Set currentCount to currentCount + one
    currentCount = currentCount + one;

    // Step 18.i.iv: If ifIncrease is true, then
    if (ifIncrease === true) {
      // Step 18.i.iv.1: If inclusiveEnd is true, then
      if (inclusiveEnd === true) {
        // Step 18.i.iv.1.a: If currentYieldingValue > end, return undefined
        if (currentYieldingValue > end) {
          return undefined;
        }
      } else {
        // Step 18.i.iv.2.a: If currentYieldingValue ≥ end, return undefined
        if (currentYieldingValue >= end) {
          return undefined;
        }
      }
    }
    // Step 18.i.v: Else
    else {
      // Step 18.i.v.1: If inclusiveEnd is true, then
      if (inclusiveEnd === true) {
        // Step 18.i.v.1.a: If end > currentYieldingValue, return undefined
        if (end > currentYieldingValue) {
          return undefined;
        }
      } else {
        // Step 18.i.v.2.a: If end ≥ currentYieldingValue, return undefined
        if (end >= currentYieldingValue) {
          return undefined;
        }
      }
    }

    // Step 18.i.vi: Yield currentYieldingValue
    yield currentYieldingValue;
  }

  // Step 18.j: Return undefined
  return undefined;
}


/**
 * Iterator.range ( start, end, optionOrStep, type )
 * 
 * https://tc39.es/proposal-iterator.range/#sec-iterator.range
 */
function CreateNumericRangeIterator(start, end, optionOrStep, isNumberRange) {
  // Step 1: If start is NaN, throw a RangeError exception.
  if (isNumberRange && Number_isNaN(start)) {
    ThrowRangeError(JSMSG_ITERATOR_RANGE_INVALID_START_RANGEERR);
  }

  // Step 2: If end is NaN, throw a RangeError exception.
  if (isNumberRange && Number_isNaN(end)) {
    ThrowRangeError(JSMSG_ITERATOR_RANGE_INVALID_END_RANGEERR);
  }

  // Step 3: If type is NUMBER-RANGE, then
  if (isNumberRange) {
    // Step 3.a. Assert: start is a Number.
    assert(typeof start === 'number', "The 'start' argument must be a number");

    // Step 3.b. If end is not a Number, throw a TypeError exception.
    if (typeof end !== 'number') {
      ThrowTypeError(JSMSG_ITERATOR_RANGE_INVALID_END);
    }

    // Step 3.c. Let zero be 0ℤ.
    var zero = 0;

    // Step 3.d. Let one be 1ℤ.
    var one = 1;
    // 4: Else,
  } else {
    // 4.a. Assert: start is a BigInt.
    assert(typeof start === 'bigint', "The 'start' argument must be a bigint");

    // 4.b. If end is not +∞𝔽 or -∞𝔽 and end is not a BigInt, throw a TypeError exception.
    if (typeof end !== 'bigint' && !(Number_isFinite(end))) {
      ThrowTypeError(JSMSG_ITERATOR_RANGE_INVALID_END);
    }

    // 4.c. Let zero be 0𝔽.
    var zero = 0n;

    // 4.d. Let one be 1𝔽.
    var one = 1n;
  }
  // Step 5: If start is +∞ or -∞, throw a RangeError exception.
  if (typeof start === 'number' && !Number_isFinite(start)) {
    ThrowRangeError(JSMSG_ITERATOR_RANGE_START_INFINITY);
  }
  // Step 6: Let inclusiveEnd be false.
  var inclusiveEnd = false;

  // Step 7: If optionOrStep is undefined or null, then
  // Step 7.a. Let step be undefined.
  var step;

  // Step 8: Else if optionOrStep is an Object, then
  if (optionOrStep !== null && typeof optionOrStep === 'object') {
    // Step 8.a. Let step be ? Get(optionOrStep, "step").
    step = optionOrStep.step;

    // Step 8.b. Set inclusiveEnd to ToBoolean(? Get(optionOrStep, "inclusive")).
    // eslint-disable-next-line no-unused-vars
    inclusiveEnd = ToBoolean(optionOrStep.inclusiveEnd);
  }
  // Step 9: Else if type is NUMBER-RANGE and optionOrStep is a Number, then
  else if (isNumberRange && typeof optionOrStep === 'number') {
    // Step 9.a. Let step be optionOrStep.
    step = optionOrStep;
  }

  // Step 10: Else if type is BIGINT-RANGE and optionOrStep is a BigInt, then
  // Step 10.a. Let step be optionOrStep.
  else if (!isNumberRange && typeof optionOrStep === 'bigint') {
    step = optionOrStep;
  }
  // Step 11: Else, throw a TypeError exception.
  else if (optionOrStep !== undefined && optionOrStep !== null) {
    ThrowTypeError(JSMSG_ITERATOR_RANGE_INVALID_STEP);
  }

  // Step 12: If step is undefined or null, then
  if (step === undefined || step === null) {
    // Step 12.a. If end > start, let step be one.
    // Step 12.b. Else let step be -one.
    step = end > start ? one : -one;
  }

  // Step 13: If step is NaN, throw a RangeError exception.
  if (typeof step === "number" && Number_isNaN(step)) {
    ThrowRangeError(JSMSG_ITERATOR_RANGE_STEP_NAN);
  }

  // Step 14: If type is NUMBER-RANGE and step is not a Number, throw a TypeError exception.
  if (isNumberRange && typeof step !== 'number') {
    ThrowTypeError(JSMSG_ITERATOR_RANGE_STEP_NOT_NUMBER);
  }

  // Step 15: Else if type is BIGINT-RANGE and step is not a BigInt, throw a TypeError exception
  else if (!isNumberRange && typeof step !== 'bigint') {
    ThrowTypeError(JSMSG_ITERATOR_RANGE_STEP_NOT_BIGINT);
  }

  // Step 16: If step is +∞ or -∞, throw a RangeError exception.
  if (typeof step === 'number' && !Number_isFinite(step)) {
    ThrowRangeError(JSMSG_ITERATOR_RANGE_STEP_NOT_FINITE);
  }

  // Step 17: If step is zero and start is not end, throw a RangeError exception.
  if (step === zero && start !== end) {
    ThrowRangeError(JSMSG_ITERATOR_RANGE_STEP_ZERO);
  }
  // Step 19: Return CreateIteratorFromClosure(closure, "%NumericRangeIteratorPrototype%", %NumericRangeIteratorPrototype%).
  return IteratorRangeGenerator(start, end, step, inclusiveEnd, zero, one);
}



/**
 *  Iterator.range ( start, end, optionOrStep )
 *
 * https://tc39.es/proposal-iterator.range/#sec-iterator.range
 */
function IteratorRange(start, end, optionOrStep) {

  // Step 1. If start is a Number, return ? CreateNumericRangeIterator(start, end, optionOrStep, NUMBER-RANGE)
  if (typeof start === 'number') {
    return CreateNumericRangeIterator(start, end, optionOrStep, true);
  }

  // Step 2. If start is a BigInt, return ? CreateNumericRangeIterator(start, end, optionOrStep, BIGINT-RANGE)
  if (typeof start === 'bigint') {
    return CreateNumericRangeIterator(start, end, optionOrStep, false);
  }

  // Step 3. Throw a TypeError exception.
  ThrowTypeError(JSMSG_ITERATOR_RANGE_INVALID_START);

}
#endif
