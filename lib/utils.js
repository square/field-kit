/* jshint esnext:true, undef:true, unused:true */

var DIGITS_PATTERN = /^\d*$/;
var SURROUNDING_SPACE_PATTERN = /(^\s+|\s+$)/;

export function isDigits(string) {
  return DIGITS_PATTERN.test(string);
}

export function startsWith(prefix, string) {
  return string.slice(0, prefix.length) === prefix;
}

export function endsWith(suffix, string) {
  return string.slice(string.length - suffix.length) === suffix;
}

export var trim = (typeof ''.trim === 'function') ?
  function(string) { return string.trim(); } :
  function(string) { return string.replace(SURROUNDING_SPACE_PATTERN, ''); };

export function zpad(length, n) {
  var result = ''+n;
  while (result.length < length) {
    result = '0'+result;
  }
  return result;
}

export function zpad2(n) {
  return zpad(2, n);
}

// PhantomJS 1.9 does not have Function#bind.
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
