/**
 * @const
 * @private
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.isDigits = isDigits;
exports.startsWith = startsWith;
exports.endsWith = endsWith;
exports.zpad = zpad;
exports.zpad2 = zpad2;
exports.bind = bind;
exports.replaceStringSelection = replaceStringSelection;
exports.forEach = forEach;
exports.hasGetter = hasGetter;
exports.getAllPropertyNames = getAllPropertyNames;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var DIGITS_PATTERN = /^\d*$/;

/**
 * @const
 * @private
 */
var SURROUNDING_SPACE_PATTERN = /(^\s+|\s+$)/;

/**
 * @param {string} string
 * @returns {boolean}
 */

function isDigits(string) {
  return DIGITS_PATTERN.test(string);
}

/**
 * @param {string} prefix
 * @param {string} string
 * @returns {boolean}
 */

function startsWith(prefix, string) {
  return string.slice(0, prefix.length) === prefix;
}

/**
 * @param {string} suffix
 * @param {string} string
 * @returns {boolean}
 */

function endsWith(suffix, string) {
  return string.slice(string.length - suffix.length) === suffix;
}

/**
 * @param {string} string
 * @returns {string}
 */
var trim = typeof ''.trim === 'function' ? function (string) {
  return string.trim();
} : function (string) {
  return string.replace(SURROUNDING_SPACE_PATTERN, '');
};

exports.trim = trim;
/**
 * Will pad n with `0` up until length.
 *
 * @example
 *     zpad(16, '1234');
 *     // => 0000000000001234
 *
 * @param {number} length
 * @param {(string|number)} n
 * @returns {string}
 */

function zpad(length, n) {
  var result = '' + n;
  while (result.length < length) {
    result = '0' + result;
  }
  return result;
}

/**
 * Will pad n with `0` up until length is 2.
 *
 * @example
 *     zpad2('2');
 *     // => 02
 *
 * @param {(string|number)} n
 * @returns {string}
 */

function zpad2(n) {
  return zpad(2, n);
}

/**
 * PhantomJS 1.9 does not have Function.bind.
 *
 * @param {Function} fn
 * @param {*} context
 * @returns {*}
 */

function bind(fn, context) {
  return fn.bind(context);
}

if (!Function.prototype.bind) {
  Function.prototype.bind = function (context) {
    for (var _len = arguments.length, prependedArgs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      prependedArgs[_key - 1] = arguments[_key];
    }

    var self = this;
    return function () {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return self.apply(context, prependedArgs.concat(args));
    };
  };
}

/**
 * Replaces the characters within the selection with given text.
 *
 * @example
 *     // 12|34567|8
 *     replaceStringSelection('12345678', '00', { start: 2, length: 5 });
 *     // 12|00|8
 *
 * @param   {string} replacement
 * @param   {string} text
 * @param   {object} {start: number, length: number}
 * @returns {string}
 */

function replaceStringSelection(replacement, text, range) {
  var end = range.start + range.length;
  return text.substring(0, range.start) + replacement + text.substring(end);
}

var hasOwnProp = Object.prototype.hasOwnProperty;
/**
 * @param {*} iterable
 * @param {Function} iterator
 */

function forEach(iterable, iterator) {
  if (iterable && typeof iterable.forEach === 'function') {
    iterable.forEach(iterator);
  } else if (({}).toString.call(iterable) === '[object Array]') {
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

var getOwnPropertyNames = (function () {
  var getOwnPropertyNames = Object.getOwnPropertyNames;

  try {
    Object.getOwnPropertyNames({}, 'sq');
  } catch (e) {
    // IE 8
    getOwnPropertyNames = function (object) {
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

var getPrototypeOf = Object.getPrototypeOf || function (object) {
  return object.__proto__;
};
/**
 * @param {Object} object
 * @param {string} property
 * @returns {boolean}
 */

function hasGetter(object, property) {
  // Skip if getOwnPropertyDescriptor throws (IE8)
  try {
    Object.getOwnPropertyDescriptor({}, 'sq');
  } catch (e) {
    return false;
  }

  var descriptor = undefined;

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
 * @param {Object} object
 * @returns {?string[]}
 */

function getAllPropertyNames(object) {
  if (object === null || object === undefined) {
    return [];
  }

  var result = getOwnPropertyNames(object);

  var prototype = object.constructor && object.constructor.prototype;
  while (prototype) {
    result.push.apply(result, _toConsumableArray(getOwnPropertyNames(prototype)));
    prototype = getPrototypeOf(prototype);
  }

  return result;
}