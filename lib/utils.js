/*! jshint esnext:true, undef:true, unused:true */

var DIGITS_PATTERN = /^\d*$/;
var SURROUNDING_SPACE_PATTERN = /(^\s+|\s+$)/;

/**
 * @function isDigits
 *
 * @param {String} string
 * @return {Boolean}
 * @public
 */
export function isDigits(string) {
  return DIGITS_PATTERN.test(string);
}

/**
 * @function startsWith
 *
 * @param {String} prefix
 * @param {String} string
 * @return {Boolean}
 * @public
 */
export function startsWith(prefix, string) {
  return string.slice(0, prefix.length) === prefix;
}

/**
 * @function endsWith
 *
 * @param {String} suffix
 * @param {String} string
 * @return {Boolean}
 * @public
 */
export function endsWith(suffix, string) {
  return string.slice(string.length - suffix.length) === suffix;
}

/**
 * @function trim
 *
 * @param {String} string
 * @return {String}
 * @public
 */
export var trim = (typeof ''.trim === 'function') ?
  function(string) { return string.trim(); } :
  function(string) { return string.replace(SURROUNDING_SPACE_PATTERN, ''); };

/**
 * @function zpad
 *
 * Will pad n with `0` up until length.
 *
 * ### Example
 *     zpad(16, '1234');
 *     // => 0000000000001234
 *
 * @param {Number} length
 * @param {(String|Number)} n
 * @return {String}
 * @public
 */
export function zpad(length, n) {
  var result = ''+n;
  while (result.length < length) {
    result = '0'+result;
  }
  return result;
}

/**
 * @function zpad2
 *
 * Will pad n with `0` up until length is 2.
 *
 * ### Example
 *     zpad2('2');
 *     // => 02
 *
 * @param {(String|Number)} n
 * @return {String}
 * @public
 */
export function zpad2(n) {
  return zpad(2, n);
}

/**
 * @function bind
 *
 * PhantomJS 1.9 does not have Function.bind.
 *
 * @param {Function} fn
 * @param {*} context
 * @return {*}
 * @public
 */
export function bind(fn, context) {
  return fn.bind(context);
}

if (!Function.prototype.bind) {
  /* jshint freeze:false */
  Function.prototype.bind = function(context, ...prependedArgs) {
    var self = this;
    return function(...args) {
      return self.apply(context, prependedArgs.concat(args));
    };
  };
}

var hasOwnProp = Object.prototype.hasOwnProperty;
/**
 * @function forEach
 *
 * @param {*} iterable
 * @param {Function} iterator
 * @public
 */
export function forEach(iterable, iterator) {
  if (iterable && typeof iterable.forEach === 'function') {
    iterable.forEach(iterator);
  } else if ({}.toString.call(iterable) === '[object Array]') {
    for (var i = 0, l = iterable.length; i < l; i++) {
      iterator.call(null, iterable[i], i, iterable);
    }
  } else {
    for (var key in iterable) {
      if (hasOwnProp.call(iterable, key)) {
        iterator.call(null, iterable[key], key, iterable);
      }
    }
  }
}

var getOwnPropertyNames = (function() {
  var getOwnPropertyNames = Object.getOwnPropertyNames;

  try {
    Object.getOwnPropertyNames({}, 'sq');
  } catch (e) {
    // IE 8
    getOwnPropertyNames = function(object) {
      var result = [];
      for (var key in object) {
        if (hasOwnProp.call(object, key)) {
          result.push(key);
        }
      }
      return result;
    };
  }

  return getOwnPropertyNames;
})();

/* jshint proto:true */
var getPrototypeOf = Object.getPrototypeOf || (object => object.__proto__);
/* jshint proto:false */

/**
 * @function hasGetter
 *
 * @param {Object} object
 * @param {String} property
 * @return {Boolean}
 * @public
 */
export function hasGetter(object, property) {
  // Skip if getOwnPropertyDescriptor throws (IE8)
  try {
    Object.getOwnPropertyDescriptor({}, 'sq');
  } catch (e) {
    return false;
  }

  var descriptor;

  if (object && object.constructor && object.constructor.prototype) {
    descriptor = Object.getOwnPropertyDescriptor(object.constructor.prototype, property);
  }

  if (!descriptor) {
    descriptor = Object.getOwnPropertyDescriptor(object, property);
  }

  if (descriptor && descriptor.get) {
    return true;
  } else {
    return false;
  }
}

/**
 * @function getAllPropertyNames
 *
 * @param {Object} object
 * @return {Array<?String>}
 * @public
 */
export function getAllPropertyNames(object) {
  if (object === null || object === undefined) {
    return [];
  }

  var result = getOwnPropertyNames(object);

  var prototype = object.constructor && object.constructor.prototype;
  while (prototype) {
    result.push(...getOwnPropertyNames(prototype));
    prototype = getPrototypeOf(prototype);
  }

  return result;
}
