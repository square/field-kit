/**
 * @const
 * @private
 */
const DIGITS_PATTERN = /^\d*$/;

/**
 * @const
 * @private
 */
const SURROUNDING_SPACE_PATTERN = /(^\s+|\s+$)/;

/**
 * @param {string} string
 * @returns {boolean}
 */
export function isDigits(string) {
  return DIGITS_PATTERN.test(string);
}

/**
 * @param {string} prefix
 * @param {string} string
 * @returns {boolean}
 */
export function startsWith(prefix, string) {
  return string.slice(0, prefix.length) === prefix;
}

/**
 * @param {string} suffix
 * @param {string} string
 * @returns {boolean}
 */
export function endsWith(suffix, string) {
  return string.slice(string.length - suffix.length) === suffix;
}

/**
 * @param {string} string
 * @returns {string}
 */
export const trim = (typeof ''.trim === 'function') ?
  function(string) { return string.trim(); } :
  function(string) { return string.replace(SURROUNDING_SPACE_PATTERN, ''); };

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
export function zpad(length, n) {
  let result = ''+n;
  while (result.length < length) {
    result = '0'+result;
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
export function zpad2(n) {
  return zpad(2, n);
}

/**
 * PhantomJS 1.9 does not have Function.bind.
 *
 * @param {Function} fn
 * @param {*} context
 * @returns {*}
 */
export function bind(fn, context) {
  return fn.bind(context);
}

if (!Function.prototype.bind) {
    Function.prototype.bind = function(context, ...prependedArgs) {
    const self = this;
    return function(...args) {
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
export function replaceStringSelection(replacement, text, range) {
  const end = range.start + range.length;
  return text.substring(0, range.start) + replacement + text.substring(end);
}

const hasOwnProp = Object.prototype.hasOwnProperty;
/**
 * @param {*} iterable
 * @param {Function} iterator
 */
export function forEach(iterable, iterator) {
  if (iterable && typeof iterable.forEach === 'function') {
    iterable.forEach(iterator);
  } else if ({}.toString.call(iterable) === '[object Array]') {
    for (let i = 0, l = iterable.length; i < l; i++) {
      iterator.call(null, iterable[i], i, iterable);
    }
  } else {
    for (let key in iterable) {
      if (hasOwnProp.call(iterable, key)) {
        iterator.call(null, iterable[key], key, iterable);
      }
    }
  }
}

const getOwnPropertyNames = (function() {
  let getOwnPropertyNames = Object.getOwnPropertyNames;

  try {
    Object.getOwnPropertyNames({}, 'sq');
  } catch (e) {
    // IE 8
    getOwnPropertyNames = function(object) {
      const result = [];
      for (let key in object) {
        if (hasOwnProp.call(object, key)) {
          result.push(key);
        }
      }
      return result;
    };
  }

  return getOwnPropertyNames;
})();

const getPrototypeOf = Object.getPrototypeOf || (object => object.__proto__);
/**
 * @param {Object} object
 * @param {string} property
 * @returns {boolean}
 */
export function hasGetter(object, property) {
  // Skip if getOwnPropertyDescriptor throws (IE8)
  try {
    Object.getOwnPropertyDescriptor({}, 'sq');
  } catch (e) {
    return false;
  }

  let descriptor;

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
export function getAllPropertyNames(object) {
  if (object === null || object === undefined) {
    return [];
  }

  const result = getOwnPropertyNames(object);

  let prototype = object.constructor && object.constructor.prototype;
  while (prototype) {
    result.push(...getOwnPropertyNames(prototype));
    prototype = getPrototypeOf(prototype);
  }

  return result;
}
