// PhantomJS 1.9 does not have Function#bind.
exports.bind = function(fn, context) {
  if (typeof fn.bind === 'function') {
    return fn.bind(context);
  } else {
    return function() {
      return fn.apply(context, arguments);
    };
  }
};
