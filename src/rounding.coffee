CEILING    = 0
FLOOR      = 1
DOWN       = 2
HALF_EVEN  = 3
UP         = 4
HALF_DOWN  = 5
HALF_UP    = 6

ceiling = (number, maximumFractionDigits) ->
  multiplier = Math.pow(10, maximumFractionDigits)
  Math.ceil(number * multiplier) / multiplier

floor = (number, maximumFractionDigits) ->
  multiplier = Math.pow(10, maximumFractionDigits)
  Math.floor(number * multiplier) / multiplier

halfEven = (number, maximumFractionDigits) ->
  return -halfEven(-number, maximumFractionDigits) if number < 0

  multiplier = Math.pow(10, maximumFractionDigits)
  percentFromFloor = Math.abs((number * (multiplier * 100)) % 100)

  if percentFromFloor < 50
    floor number, maximumFractionDigits
  else if percentFromFloor > 50
    ceiling number, maximumFractionDigits
  else
    lastDigit = ~~Math.abs(number * multiplier) % 10
    if (lastDigit % 2 is 0) ^ (number < 0)
      floor number, maximumFractionDigits
    else
      ceiling number, maximumFractionDigits

module.exports = {
  Modes: {
    CEILING
    FLOOR
    DOWN
    HALF_EVEN
    UP
    HALF_DOWN
    HALF_UP
  }

  ceiling
  floor
  halfEven
}
