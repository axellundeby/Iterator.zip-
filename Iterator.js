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
  // 1. If iterables is not an Object, throw a TypeError exception.
  if (typeof iterables !== 'object' || iterables === null) {
    ThrowTypeError(JSMSG_OBJECT_REQUIRED, iterables === null ? "null" : typeof iterables);
  }

  // 2. Set options to ? GetOptionsObject(options).
  options = GetOptionsObject(options);

  // 3. Let mode be ? Get(options, "mode").
  var mode = options.mode;

  // 4. If mode is undefined, set mode to "shortest".
  if (mode === undefined) {
    mode = "shortest";
  }

  // 5. If mode is not one of "shortest", "longest", or "strict", throw a TypeError exception.
  if ((mode !== "shortest" && mode !== "longest" && mode !== "strict")) {
    ThrowTypeError(JSMSG_OBJECT_REQUIRED, "Invalid mode option: must be 'shortest', 'longest', or 'strict'");
  }

  // 6. Let paddingOption be undefined.
  var paddingOption;

  // 7. If mode is "longest", then
  if (mode === "longest") {
    // 7.a. Set paddingOption to ? Get(options, "padding").
    paddingOption = options.padding;
  }

  // 7.b. If paddingOption is not undefined and paddingOption is not an Object, throw a TypeError exception.
  if (!IsObject(paddingOption) && paddingOption !== undefined) {
    ThrowTypeError(JSMSG_OBJECT_REQUIRED, "paddingOption must be an object");
  }

  // 7.b continued. If paddingOption is not iterable, throw.
  if (paddingOption !== undefined &&
    !IsCallable(paddingOption[GetBuiltinSymbol("iterator")])) {
    ThrowTypeError(JSMSG_NOT_ITERABLE, "padding");
  }

  // 8. Let iters be a new empty List.
  var iters = [];

  // 9. Let padding be a new empty List.
  var padding = [];

  // 10. Let inputIter be ? GetIterator(iterables, sync).
  var inputIter = GetIterator(iterables, false);

  // 11. Let next be not-started.
  var next = { done: false };

  // 12. Repeat, while next is not done,
  while (!next.done) {
    // 12.a. Set next to Completion(IteratorStepValue(inputIter)).
    next = IteratorNext(inputIter);

    // 12.b. IfAbruptCloseIterators(next, iters).
    IfAbruptCloseIterators(next, iters);

    // 12.c. If next is not done, then
    if (!next.done) {
      // 12.c.i. Let iter be Completion(GetIteratorFlattenable(next, reject-strings)).
      var iter = GetIteratorDirect(GetIteratorFlattenable(next.value, true));

      // 12.c.ii. IfAbruptCloseIterators(iter, the list-concatenation of « inputIter » and iters).
      IfAbruptCloseIterators(iter, concatenateArrays([inputIter], iters));

      // 12.c.iii. Append iter to iters.
      iters[iters.length] = iter;
    }
  }

  // 13. Let iterCount be the number of elements in iters.
  var iterCount = iters.length;

  // 14. If mode is "longest", then
  if (mode === 'longest') {
    // 14.a. If paddingOption is undefined, then
    if (paddingOption === undefined) {
      // 14.a.i. Perform the following steps iterCount times:
      for (var index = 0; index < iterCount; index++) {
        // 14.a.i.1. Append undefined to padding.
        padding[index] = undefined;
      }
    }
    // 14.b. Else
    else {
      // 14.b.i. Let paddingIter be Completion(GetIterator(paddingOption, sync)).
      var paddingIter = GetIterator(paddingOption, false);

      // 14.b.ii. IfAbruptCloseIterators(paddingIter, iters).
      IfAbruptCloseIterators(paddingIter, iters);

      // 14.b.iii. Let usingIterator be true.
      var usingIterator = true;

      // 14.b.iv. Perform the following steps iterCount times:
      for (var k = 0; k < iterCount; k++) {
        // 14.b.iv.1. If usingIterator is true, then
        if (usingIterator) {
          // 14.b.iv.1.a. Set next to Completion(IteratorStepValue(paddingIter)).
          next = IteratorNext(paddingIter);

          // 14.b.iv.1.b. IfAbruptCloseIterators(next, iters).
          IfAbruptCloseIterators(next, iters);

          // 14.b.iv.1.c. If next is done, then
          if (next.done) {
            // 14.b.iv.1.c.i. Set usingIterator to false
            usingIterator = false;
          }
          // 14.b.iv.1.d. Else,
          else {
            // 14.b.iv.1.d.i. Append next to padding.
            padding[padding.length] = next.value;
          }
        }

        // 14.b.iv.2. If usingIterator is false, append undefined to padding.
        if (!usingIterator) {
          padding[padding.length] = undefined;
        }
      }

      // 14.b.v. If usingIterator is true, then
      if (usingIterator) {
        // 14.b.v.1. Let completion be Completion(IteratorClose(paddingIter, NormalCompletion(unused))).
        var completion = IteratorClose(paddingIter);

        // 14.b.v.2. IfAbruptCloseIterators(completion, iters).
        IfAbruptCloseIterators(completion, iters);
      }
    }
  }

  // 15. Let finishResults be a new Abstract Closure...
  function finishResults(results) {
    var copied = [];
    for (var i = 0; i < results.length; i++) {
      copied[i] = results[i];
    }
    return copied;
  }

  // 16. Return IteratorZip(iters, mode, padding, finishResults).
  return zipping(iters, mode, padding, finishResults);
}


function zipping(iters, mode, padding, finishResults) {
  // 1. Let iterCount be the number of elements in iters.
  var iterCount = iters.length;

  // 2. Let openIters be a copy of iters.
  var openIters = [];
  for (var i = 0; i < iters.length; i++) {
    openIters[i] = iters[i];
  }

  // 3. Let closure be a new Abstract Closure...
  function closure() {
    // 3.a. If iterCount = 0, return ReturnCompletion(undefined).
    if (iterCount === 0) {
      return CreateIteratorResultObject(undefined, true);
    }

    var results = []; // 3.b.i. Let results be a new empty List.

    // 3.b.iii. For each integer i such that 0 ≤ i < iterCount
    for (var i = 0; i < iterCount; i++) {
      var iter = iters[i]; // 3.b.iii.1. Let iter be iters[i].

      // 3.b.iii.2. If iter is null
      if (iter === null) {
        // 3.b.iii.2.b. Let result be padding[i].
        results[i] = padding[i];
        continue;
      }

      // 3.b.iii.3. Else,
      var result;
      try {
        // 3.b.iii.3.a. Let result be Completion(IteratorStepValue(iter)).
        result = IteratorNext(iter);
      } catch (e) {
        // 3.b.iii.3.b.i. Remove iter from openIters and close all.
        openIters[i] = null;
        IteratorCloseAll(openIters);
        throw e;
      }

      // 3.b.iii.3.d. If result is done
      if (result.done) {
        openIters[i] = null; // Remove iter from openIters.

        if (mode === "shortest") {
          // 3.b.iii.3.d.ii. If mode is "shortest", return.
          return IteratorCloseAll(openIters, CreateIteratorResultObject(undefined, true));
        }

        if (mode === "strict") {
          // 3.b.iii.3.d.iii.1. If i ≠ 0
          if (i !== 0) {
            IteratorCloseAll(openIters);
            ThrowTypeError(JSMSG_OBJECT_REQUIRED, "object");
          }

          // 3.b.iii.3.d.iii.2. For each k ≥ 1, check rest
          for (var k = 1; k < iterCount; k++) {
            var other = iters[k];
            if (other !== null) {
              var step;
              try {
                // 3.b.iii.3.d.iii.2.ii. Let open = Completion(IteratorStep(other)).
                step = IteratorNext(other);
              } catch (e) {
                openIters[k] = null; // 3.b.iii.3.d.iii.2.iii.i
                IteratorCloseAll(openIters);
                throw e;
              }

              // 3.b.iii.3.d.iii.2.v. If open is done
              if (step.done) {
                openIters[k] = null;
              } else {
                // 3.b.iii.3.d.iii.2.vi. Else: throw
                return IteratorCloseAll(openIters, ThrowTypeError(JSMSG_OBJECT_REQUIRED, "object"));
              }
            }
          }

          // 3.b.iii.3.d.iii.3. Return undefined
          return CreateIteratorResultObject(undefined, true);
        }

        else if (mode === "longest") {
          // 3.b.iii.3.d.iv. Assert mode is "longest"
          iters[i] = null;                 // 3.b.iii.3.d.iv.iii
          results[i] = padding[i];         // 3.b.iii.3.d.iv.iv

          var allClosed = true;           // 3.b.iii.3.d.iv.ii
          for (var j = 0; j < iterCount; j++) {
            if (openIters[j] !== null) {
              allClosed = false;
              break;
            }
          }

          // 3.b.iii.3.d.iv.ii. If all iterators are closed, return done
          if (allClosed) {
            return CreateIteratorResultObject(undefined, true);
          }

          continue;
        }
      }

      // 3.b.iii.4. Append result.value to results.
      results[i] = result.value;
    }

    // 3.b.iv. Set results to finishResults(results).
    var zipped = finishResults(results);

    // 3.b.v. Return Yield(zipped)
    return CreateIteratorResultObject(zipped, false);
  }
  //correct way of doing protptype chaining:
  // var helper = NewIteratorHelper();
  // var generator = closure();

  // UnsafeSetReservedSlot(helper, 0, generator);

  // callFunction(GeneratorNext, generator);
  // helper.mode = mode;
  // helper.padding = padding;
  // return helper;


  // 4. Let gen be CreateIteratorFromClosure(...)
  var obj = {};
  var IteratorHelperPrototype = {};

  obj["[[Closure]]"] = closure;               // internal slot
  obj["[[GeneratorState]]"] = "suspended-start";
  obj["[[UnderlyingIterators]]"] = openIters; // 5. Set gen.[[UnderlyingIterators]] to openIters.
  obj.__proto__ = IteratorHelperPrototype;
  obj.mode = mode;

  // Custom .next() method
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

  // 6. Iterator prototype hookup
  obj[GetBuiltinSymbol("iterator")] = function () { return this; };

  // 6. Return gen.
  return obj;
}


function CreateIteratorResultObject(value, done) {
  return { value: value, done: done };
}



function GetOptionsObject(options) {
  // 1. If options is undefined, then
  //    a. Return OrdinaryObjectCreate(null).
  if (options === undefined || options === null) {
    return std_Object_create(null);
  }

  // 2. If options is an Object, then
  //    a. Return options.
  if (IsObject(options) && !IsCallable(options)) {
    return options;
  }

  // 3. Throw a TypeError exception.
  ThrowTypeError(JSMSG_OBJECT_REQUIRED, typeof options);
}




function IfAbruptCloseIterators(value, iteratorRecords) {
  // Step 1: Assert: value is a Completion Record.
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



function IteratorCloseAll(iters, completion) {
  // 1. For each element iter of iters, in reverse List order, do
  for (var i = iters.length - 1; i >= 0; i--) {
    var iter = iters[i];
    if (iter !== null && IsObject(iter)) {
      try {
        // 1.a. Set completion to Completion(IteratorClose(iter, completion)).
        var result = IteratorClose(iter);
      } catch (e) {
        // Convert exception into throw completion
        completion = ThrowCompletion(e);
      }
    }
  }
  // 2. Return ? completion.
  return completion;
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






/**
 * Iterator.zipKeyed (iterables [, options])
 *
 * IteratorZipKeyed(iterables, options = {}) 
 * https://tc39.es/proposal-joint-iteration/#sec-iterator.zipKeyed
 */
function IteratorZipKeyed(iterables, options = {}) {
  // 1. Hvis iterables ikke er et objekt, kast en TypeError.
  // if (iterables === null) {

  if (typeof iterables !== 'object' || iterables === null) {
    ThrowTypeError(JSMSG_OBJECT_REQUIRED, iterables === null ? "null" : typeof iterables);
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
  var allKeys = ObjectGetOwnPropertyDescriptor(iterables);


  // 11. La keys være en ny tom liste.
  var keys = [];

  // 12. For hver key i allKeys, gjør:
  for (var i = 0; i < allKeys.length; i++) {
    var key = allKeys[i];

    // a. La desc være Completion(iterables.[[GetOwnProperty]](key)).
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