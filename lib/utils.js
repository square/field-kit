(function() {
  var endsWith, isDigits, startsWith, trim, zpad, zpad2;

  isDigits = function(string) {
    return /^\d*$/.test(string);
  };

  startsWith = function(prefix, string) {
    return string.slice(0, prefix.length) === prefix;
  };

  endsWith = function(suffix, string) {
    return string.slice(string.length - suffix.length) === suffix;
  };

  if (''.trim) {
    trim = function(string) {
      return string.trim();
    };
  } else {
    trim = function(string) {
      return string.replace(/(^\s+|\s+$)/, '');
    };
  }

  zpad = function(length, n) {
    var result;
    result = "" + n;
    while (result.length < length) {
      result = "0" + result;
    }
    return result;
  };

  zpad2 = function(n) {
    return zpad(2, n);
  };

  module.exports = {
    isDigits: isDigits,
    startsWith: startsWith,
    endsWith: endsWith,
    trim: trim,
    zpad: zpad,
    zpad2: zpad2
  };

}).call(this);
