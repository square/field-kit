rounding = require '../src/rounding'
ceiling = rounding.ceiling
floor = rounding.floor
halfEven = rounding.halfEven

describe 'rounding', ->
  describe '#ceiling', ->
    it 'rounds round for numbers with no significant digits beyond the specified number', ->
      expect(ceiling 1.9, 1).toEqual(1.9)

    it 'rounds for number with nonzero significant digit beyond specified number', ->
      expect(ceiling 1.9, 0).toEqual(2)
      expect(ceiling 1.9000000000001, 1).toEqual(2)

    it 'rounds "down" for negative numbers', ->
      expect(ceiling -1.9, 0).toEqual(-1)
      expect(ceiling -1.95, 1).toEqual(-1.9)

    it 'rounds properly for numbers with very small nonzero fractional part', ->
      expect(ceiling 7.020000005, 2).toEqual(7.03)

  describe '#floor', ->
    it 'rounds round for numbers with no significant digits beyond the specified number', ->
      expect(floor 1.9, 1).toEqual(1.9)

    it 'rounds for number with nonzero significant digit beyond specified number', ->
      expect(floor 1.9, 0).toEqual(1)
      expect(floor 1.99999999999, 1).toEqual(1.9)

    it 'rounds "up" for negative numbers', ->
      expect(floor -1.9, 0).toEqual(-2)
      expect(floor -1.85, 1).toEqual(-1.9)

    it 'rounds properly for numbers with very large nonzero fractional part', ->
      expect(floor 7.029999999999, 2).toEqual(7.02)

  describe '#halfEven', ->
    it 'rounds down for trailing digits less than 50', ->
      expect(halfEven 7.02499, 2).toEqual(7.02)

    it 'rounds toward even for trailing digits equal 50', ->
      expect(halfEven 7.0250, 2).toEqual(7.02)
      expect(halfEven 7.0350, 2).toEqual(7.04)

    it 'rounds up for trailing digits greater than 50', ->
      expect(halfEven 7.02501, 2).toEqual(7.03)
