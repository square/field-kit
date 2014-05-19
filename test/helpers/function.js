// PhantomJS 1.9 does not have Function#bind.
if (!Function.prototype.bind) {
  Function.prototype.bind = function(context) {
    var fn = this;
    return function() {
      return fn.apply(context, arguments);
    };
  };
}
