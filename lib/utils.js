var DIGITS_PATTERN = /^\d*$/;
var SURROUNDING_SPACE_PATTERN = /(^\s+|\s+$)/;

function isDigits(string) {
  return DIGITS_PATTERN.test(string);
}

function startsWith(prefix, string) {
  return string.slice(0, prefix.length) === prefix;
}

function endsWith(suffix, string) {
  return string.slice(string.length - suffix.length) === suffix;
}

var trim;
if (typeof ''.trim === 'function') {
  trim = function(string) {
    return string.trim();
  };
} else {
  trim = function(string) {
    return string.replace(SURROUNDING_SPACE_PATTERN, '');
  };
}

function zpad(length, n) {
  var result = ''+n;
  while (result.length < length) {
    result = '0'+result;
  }
  return result;
}

function zpad2(n) {
  return zpad(2, n);
}

// PhantomJS 1.9 does not have Function#bind.
function bind(fn, context) {
  if (typeof fn.bind === 'function') {
    return fn.bind(context);
  } else {
    return function() {
      return fn.apply(context, arguments);
    };
  }
}

var hasOwnProp = Object.prototype.hasOwnProperty;
function forEach(iterable, iterator) {
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

module.exports = {
  isDigits: isDigits,
  startsWith: startsWith,
  endsWith: endsWith,
  trim: trim,
  zpad: zpad,
  zpad2: zpad2,
  bind: bind,
  forEach: forEach
};
