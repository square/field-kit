(function() {
  var CEILING, DOWN, FLOOR, HALF_DOWN, HALF_EVEN, HALF_UP, UP, ceiling, floor, halfEven;

  CEILING = 0;

  FLOOR = 1;

  DOWN = 2;

  HALF_EVEN = 3;

  UP = 4;

  HALF_DOWN = 5;

  HALF_UP = 6;

  ceiling = function(number, maximumFractionDigits) {
    var multiplier;
    multiplier = Math.pow(10, maximumFractionDigits);
    return Math.ceil(number * multiplier) / multiplier;
  };

  floor = function(number, maximumFractionDigits) {
    var multiplier;
    multiplier = Math.pow(10, maximumFractionDigits);
    return Math.floor(number * multiplier) / multiplier;
  };

  halfEven = function(number, maximumFractionDigits) {
    var lastDigit, multiplier, percentFromFloor;
    if (number < 0) {
      return -halfEven(-number, maximumFractionDigits);
    }
    multiplier = Math.pow(10, maximumFractionDigits);
    percentFromFloor = Math.abs((number * (multiplier * 100)) % 100);
    if (percentFromFloor < 50) {
      return floor(number, maximumFractionDigits);
    } else if (percentFromFloor > 50) {
      return ceiling(number, maximumFractionDigits);
    } else {
      lastDigit = ~~Math.abs(number * multiplier) % 10;
      if ((lastDigit % 2 === 0) ^ (number < 0)) {
        return floor(number, maximumFractionDigits);
      } else {
        return ceiling(number, maximumFractionDigits);
      }
    }
  };

  module.exports = {
    Modes: {
      CEILING: CEILING,
      FLOOR: FLOOR,
      DOWN: DOWN,
      HALF_EVEN: HALF_EVEN,
      UP: UP,
      HALF_DOWN: HALF_DOWN,
      HALF_UP: HALF_UP
    },
    ceiling: ceiling,
    floor: floor,
    halfEven: halfEven
  };

}).call(this);
