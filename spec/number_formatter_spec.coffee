NumberFormatter = require '../lib/number_formatter'

describe 'NumberFormatter', ->
  formatter = null

  beforeEach ->
    formatter = new NumberFormatter()

  describe 'by default', ->
    it 'has US-standard number prefixes and suffixes', ->
      expect(formatter.positivePrefix()).toEqual("")
      expect(formatter.positiveSuffix()).toEqual("")
      expect(formatter.negativePrefix()).toEqual("-")
      expect(formatter.negativeSuffix()).toEqual("")

    it 'has no fraction digits', ->
      expect(formatter.minimumFractionDigits()).toEqual(0)
      expect(formatter.maximumFractionDigits()).toEqual(0)

    it 'does not always show the decimal separator', ->
      expect(formatter.alwaysShowsDecimalSeparator()).toBeFalsy()

    it 'has the US-standard decimal separator', ->
      expect(formatter.decimalSeparator()).toEqual('.')

    it 'rounds half even', ->
      expect(formatter.roundingMode()).toEqual(NumberFormatter.Rounding.HALF_EVEN)

  describe '#numberFromString', ->
    it 'is an alias for #parse', ->
      expect(formatter.numberFromString).toBe(formatter.parse)

  describe '#format', ->
    describe 'given a positive number', ->
      describe 'with custom prefix and suffix', ->
        beforeEach ->
          formatter.setPositivePrefix '<POS>'
          formatter.setPositiveSuffix '</POS>'

        it 'adds them', ->
          expect(formatter.format 8).toEqual('<POS>8</POS>')

      describe 'with maximumFractionalDigits = 0', ->
        beforeEach ->
          formatter.setMaximumFractionDigits 0

        it 'formats integers without a fractional part', ->
          expect(formatter.format 50).toEqual('50')

        it 'formats floats without a fractional part', ->
          expect(formatter.format 50.8).toEqual('50')

      describe 'with maximumFractionalDigits = 1', ->
        beforeEach ->
          formatter.setMaximumFractionDigits 1

        it 'formats integers without a fractional part', ->
          expect(formatter.format 50).toEqual('50')

        it 'formats floats truncating the fractional part if needed', ->
          expect(formatter.format 50.8).toEqual('50.8')
          expect(formatter.format 50.87).toEqual('50.8')

      describe 'with maximumFractionalDigits > 1', ->
        beforeEach ->
          formatter.setMaximumFractionDigits 2

        it 'formats integers without a fractional part', ->
          expect(formatter.format 50).toEqual('50')

        it 'formats floats truncating the fractional part if needed', ->
          expect(formatter.format 3.1).toEqual('3.1')
          expect(formatter.format 3.14).toEqual('3.14')
          expect(formatter.format 3.141).toEqual('3.14')

        describe 'with minimumFractionDigits = 1', ->
          beforeEach ->
            formatter.setMinimumFractionDigits 1

          it 'formats integers with a fractional 0', ->
            expect(formatter.format 50).toEqual('50.0')

          it 'formats floats as normal', ->
            expect(formatter.format 50.4).toEqual('50.4')

      describe 'with alwaysShowsDecimalSeparator = true', ->
        beforeEach ->
          formatter.setAlwaysShowsDecimalSeparator yes

        it 'formats integers with a decimal separator', ->
          expect(formatter.format 9).toEqual('9.')

        it 'formats floats as normal', ->
          formatter.setMaximumFractionDigits 1
          expect(formatter.format 8.1).toEqual('8.1')

      describe 'with a custom decimal separator', ->
        beforeEach ->
          formatter.setDecimalSeparator 'SEP'
          formatter.setMaximumFractionDigits 1

        it 'formats integers without the separator', ->
          expect(formatter.format 77).toEqual('77')

        it 'formats floats with the separator', ->
          expect(formatter.format 77.7).toEqual('77SEP7')

      describe 'with ceiling rounding', ->
        beforeEach ->
          formatter.setRoundingMode NumberFormatter.Rounding.CEILING
          formatter.setMaximumFractionDigits 1

        it 'does not round integers', ->
          expect(formatter.format 4).toEqual('4')

        it 'does not round floats with fraction digits less than or the same as the maximum', ->
          expect(formatter.format 3.1).toEqual('3.1')

        it 'rounds floats with non-zero digits past the maximum', ->
          expect(formatter.format 3.14).toEqual('3.2')
          expect(formatter.format 3.01).toEqual('3.1')

        it 'rounds to the next integer if no fraction digits are allowed', ->
          formatter.setMaximumFractionDigits 0
          expect(formatter.format 1.1).toEqual('2')
          expect(formatter.format 1.01).toEqual('2')

      describe 'with floor rounding', ->
        beforeEach ->
          formatter.setRoundingMode NumberFormatter.Rounding.FLOOR
          formatter.setMaximumFractionDigits 1

        it 'does not round integers', ->
          expect(formatter.format 4).toEqual('4')

        it 'does not round floats with fraction digits less than or the same as the maximum', ->
          expect(formatter.format 3.1).toEqual('3.1')

        it 'rounds floats with non-zero digits past the maximum', ->
          expect(formatter.format 1.11).toEqual('1.1')
          expect(formatter.format 1.19).toEqual('1.1')

      describe 'with half-even rounding', ->
        beforeEach ->
          formatter.setRoundingMode NumberFormatter.Rounding.HALF_EVEN
          formatter.setMaximumFractionDigits 1

        it 'does not round integers', ->
          expect(formatter.format 4).toEqual('4')

        it 'does not round floats with fraction digits less than or the same as the maximum', ->
          expect(formatter.format 0.1).toEqual('0.1')

        it 'rounds floats with non-zero digits past the maximum', ->
          expect(formatter.format 0.35).toEqual('0.4')
          expect(formatter.format 0.25).toEqual('0.2')

    describe 'given a negative number', ->
      describe 'with custom prefix and suffix', ->
        beforeEach ->
          formatter.setNegativePrefix '<NEG>'
          formatter.setNegativeSuffix '</NEG>'

        it 'adds them', ->
          expect(formatter.format -8).toEqual('<NEG>8</NEG>')

      describe 'with ceiling rounding', ->
        beforeEach ->
          formatter.setRoundingMode NumberFormatter.Rounding.CEILING
          formatter.setMaximumFractionDigits 1

        it 'does not round integers', ->
          expect(formatter.format -4).toEqual('-4')

        it 'does not round floats with no non-zero fraction digits past the maximum', ->
          expect(formatter.format -3.10).toEqual('-3.1')

        it 'rounds floats with non-zero digits past the maximum', ->
          expect(formatter.format -3.19).toEqual('-3.1')

      describe 'with floor rounding', ->
        beforeEach ->
          formatter.setRoundingMode NumberFormatter.Rounding.FLOOR
          formatter.setMaximumFractionDigits 1

        it 'does not round integers', ->
          expect(formatter.format -4).toEqual('-4')

        it 'does not round floats with no non-zero fraction digits past the maximum', ->
          expect(formatter.format -3.10).toEqual('-3.1')

        it 'rounds floats with non-zero digits past the maximum', ->
          expect(formatter.format -3.11).toEqual('-3.2')

      describe 'with half-even rounding', ->
        beforeEach ->
          formatter.setRoundingMode NumberFormatter.Rounding.HALF_EVEN
          formatter.setMaximumFractionDigits 1

        it 'does not round integers', ->
          expect(formatter.format -4).toEqual('-4')

        it 'does not round floats with fraction digits less than or the same as the maximum', ->
          expect(formatter.format -0.1).toEqual('-0.1')

        it 'rounds floats with non-zero digits past the maximum', ->
          expect(formatter.format -0.35).toEqual('-0.4')
          expect(formatter.format -0.25).toEqual('-0.2')
