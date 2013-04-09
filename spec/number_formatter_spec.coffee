NumberFormatter = require '../lib/number_formatter'

describe 'NumberFormatter', ->
  formatter = null

  beforeEach ->
    formatter = new NumberFormatter()

  describe 'by default', ->
    it 'has English-standard number prefixes and suffixes', ->
      expect(formatter.positivePrefix()).toEqual("")
      expect(formatter.positiveSuffix()).toEqual("")
      expect(formatter.negativePrefix()).toEqual("-")
      expect(formatter.negativeSuffix()).toEqual("")

    it 'has no fraction digits', ->
      expect(formatter.minimumFractionDigits()).toEqual(0)
      expect(formatter.maximumFractionDigits()).toEqual(0)

    it 'does not always show the decimal separator', ->
      expect(formatter.alwaysShowsDecimalSeparator()).toBeFalsy()

    it 'has the English-standard decimal separator', ->
      expect(formatter.decimalSeparator()).toEqual('.')

    it 'has USD currency code', ->
      expect(formatter.currencyCode()).toEqual('USD')

    it 'rounds half even', ->
      expect(formatter.roundingMode()).toEqual(NumberFormatter.Rounding.HALF_EVEN)

    it 'has no minimum', ->
      expect(formatter.minimum()).toBeNull()

    it 'has no maximum', ->
      expect(formatter.maximum()).toBeNull()

    it 'has no multiplier', ->
      expect(formatter.multiplier()).toBeNull()

    it 'has no maximumIntegerDigits', ->
      expect(formatter.maximumIntegerDigits()).toBeNull()

    it 'has a minimumIntegerDigits', ->
      expect(formatter.minimumIntegerDigits()).toEqual(0)

    it 'does not use a grouping separator', ->
      expect(formatter.usesGroupingSeparator()).toBeFalsy()

    it 'has English-standard grouping separator', ->
      expect(formatter.groupingSeparator()).toEqual(',')

    it 'has English-standard grouping size', ->
      expect(formatter.groupingSize()).toEqual(3)

    it 'has no custom zero symbol', ->
      expect(formatter.zeroSymbol()).toBeNull()

    it 'has empty string as the null symbol', ->
      expect(formatter.nullSymbol()).toEqual('')

    it 'has NaN as the not a number symbol', ->
      expect(formatter.notANumberSymbol()).toEqual('NaN')

    it 'has English-standard symbol for positive infinity', ->
      expect(formatter.positiveInfinitySymbol()).toEqual('+∞')

    it 'has English-standard symbol for negative infinity', ->
      expect(formatter.negativeInfinitySymbol()).toEqual('-∞')

    it 'has English-standard symbol for percent', ->
      expect(formatter.percentSymbol()).toEqual('%')

    it 'has no number style', ->
      expect(formatter.numberStyle()).toEqual(NumberFormatter.Style.NONE)

    it 'has English-standard symbol for currency', ->
      expect(formatter.currencySymbol()).toEqual('$')

  describe '#numberFromString', ->
    it 'is an alias for #parse', ->
      expect(formatter.numberFromString).toBe(formatter.parse)

  describe '#stringFromNumber', ->
    it 'is an alias for #format', ->
      expect(formatter.stringFromNumber).toBe(formatter.format)

  describe '#minusSign', ->
    it 'is an alias for #negativePrefix', ->
      expect(formatter.minusSign).toBe(formatter.negativePrefix)
      expect(formatter.setMinusSign).toBe(formatter.setNegativePrefix)

  describe '#plusSign', ->
    it 'is an alias for #positivePrefix', ->
      expect(formatter.plusSign).toBe(formatter.positivePrefix)
      expect(formatter.setPlusSign).toBe(formatter.setPositivePrefix)

  describe '#format', ->
    describe 'given zero', ->
      describe 'and a custom zero symbol', ->
        beforeEach ->
          formatter.setZeroSymbol '#'

        it 'uses the custom zero symbol', ->
          expect(formatter.format 0).toEqual('#')

    describe 'given null', ->
      describe 'and a custom null symbol', ->
        beforeEach ->
          formatter.setNullSymbol 'NUL'

        it 'uses the custom null symbol', ->
          expect(formatter.format null).toEqual('NUL')

    describe 'given NaN', ->
      describe 'and a custom not a number symbol', ->
        beforeEach ->
          formatter.setNotANumberSymbol 'WHA?'

        it 'uses the custom not a number symbol', ->
          expect(formatter.format NaN).toEqual('WHA?')

    describe 'given infinity', ->
      describe 'and a custom infinity symbol', ->
        beforeEach ->
          formatter.setPositiveInfinitySymbol 'INF'

        it 'uses the custom infinity symbol', ->
          expect(formatter.format Infinity).toEqual('INF')

    describe 'given negative infinity', ->
      describe 'and a custom negative infinity symbol', ->
        beforeEach ->
          formatter.setNegativeInfinitySymbol '-INF'

        it 'uses the custom negative infinity symbol', ->
          expect(formatter.format -Infinity).toEqual('-INF')

    describe 'given a positive number', ->
      describe 'with custom prefix and suffix', ->
        beforeEach ->
          formatter.setPositivePrefix '<POS>'
          formatter.setPositiveSuffix '</POS>'

        it 'adds them', ->
          expect(formatter.format 8).toEqual('<POS>8</POS>')

      describe 'with maximumFractionDigits = 0', ->
        beforeEach ->
          formatter.setMaximumFractionDigits 0

        it 'formats integers without a fractional part', ->
          expect(formatter.format 50).toEqual('50')

        it 'formats floats without a fractional part', ->
          expect(formatter.format 50.8).toEqual('51')

      describe 'with maximumFractionDigits = 1', ->
        beforeEach ->
          formatter.setMaximumFractionDigits 1

        it 'formats integers without a fractional part', ->
          expect(formatter.format 50).toEqual('50')
          expect(formatter.format 50.0).toEqual('50')

        it 'formats floats rounding the fractional part if needed', ->
          expect(formatter.format 50.8).toEqual('50.8')
          expect(formatter.format 50.87).toEqual('50.9')

      describe 'with maximumFractionDigits > 1', ->
        beforeEach ->
          formatter.setMaximumFractionDigits 2

        it 'formats integers without a fractional part', ->
          expect(formatter.format 50).toEqual('50')

        it 'formats floats rounding the fractional part if needed', ->
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
          expect(formatter.format 0.251).toEqual('0.3')

        describe 'rounding to integers', ->
          beforeEach ->
            formatter.setMaximumFractionDigits 0

          it 'rounds toward even integers', ->
            expect(formatter.format 0.5).toEqual('0')
            expect(formatter.format 1.5).toEqual('2')

      describe 'with a multiplier', ->
        beforeEach ->
          formatter.setMultiplier .01

        it 'multiplies numeric values for display', ->
          expect(formatter.format 5000).toEqual('50')

      describe 'with minimumIntegerDigits', ->
        beforeEach ->
          formatter.setMinimumIntegerDigits 2

        it 'left-pads the integer part if necessary', ->
          expect(formatter.format 1).toEqual('01')
          expect(formatter.format 12).toEqual('12')

      describe 'with maximumIntegerDigits', ->
        beforeEach ->
          formatter.setMaximumIntegerDigits 2

        it 'left-truncates the integer part if necessary', ->
          expect(formatter.format 123).toEqual('23')
          expect(formatter.format 23).toEqual('23')

      describe 'using a grouping separator', ->
        beforeEach ->
          formatter.setUsesGroupingSeparator yes

        it 'formats integer parts with fewer digits than the grouping size as normal', ->
          expect(formatter.format 123).toEqual('123')

        it 'formats integer parts with more digits than the grouping size with separators', ->
          expect(formatter.format 1234567).toEqual('1,234,567')

        describe 'with a custom grouping size', ->
          beforeEach ->
            formatter.setGroupingSize 1

          it 'formats integer parts with more digits than the grouping size with separators', ->
            expect(formatter.format 123).toEqual('1,2,3')

        describe 'with a custom grouping separator', ->
          beforeEach ->
            formatter.setGroupingSeparator '**'

          it 'formats integer parts with more digits than the grouping size with separators', ->
            expect(formatter.format 1234567).toEqual('1**234**567')

        describe 'with a locale that customizes grouping', ->
          beforeEach ->
            formatter.setLocale 'fr-CA'

          it 'uses the custom grouping settings for that locale', ->
            expect(formatter.format 1234567).toEqual('1 234 567')

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

        describe 'when rounded to 0', ->
          beforeEach ->
            formatter.setMaximumFractionDigits 0

          # This is up for debate.
          it 'shows zero with a negative sign', ->
            expect(formatter.format -0.1).toEqual('-0')

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

        it 'carries the one', ->
          expect(formatter.format -3.91).toEqual('-4')

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
          expect(formatter.format -0.351).toEqual('-0.3')
          expect(formatter.format -0.25).toEqual('-0.2')

    describe 'with the percent style', ->
      beforeEach ->
        formatter.setNumberStyle NumberFormatter.Style.PERCENT

      it 'formats numbers as percents', ->
        expect(formatter.format 4.21).toEqual('421%')
        expect(formatter.format -4.21).toEqual('-421%')

      describe 'with a custom percent symbol', ->
        beforeEach ->
          formatter.setPercentSymbol 'PER'

        it 'formats using the custom symbol', ->
          expect(formatter.format .2).toEqual('20PER')

      describe 'with a non-English locale', ->
        beforeEach ->
          formatter.setLocale 'fr'

        it 'formats using the custom symbol for that locale', ->
          expect(formatter.format .2).toEqual('20 %')

    describe 'with the currency style', ->
      beforeEach ->
        formatter.setNumberStyle NumberFormatter.Style.CURRENCY

      it 'formats numbers as currencies', ->
        expect(formatter.format 4.21).toEqual('$4.21')
        expect(formatter.format -4.21).toEqual('($4.21)')

      describe 'with a custom currency symbol', ->
        beforeEach ->
          formatter.setCurrencySymbol 'CUR'

        it 'formats using the custom symbol', ->
          expect(formatter.format 1.2).toEqual('CUR1.20')

      describe 'setting the currency code to something else', ->
        it 'uses any overrides for prefix and suffix from the language defaults', ->
          # A person in the US who speaks French looking at US Dollars.
          formatter.setLocale 'fr'
          formatter.setCountryCode 'US'
          formatter.setCurrencyCode 'USD'
          expect(formatter.format 1234.56).toEqual('1 234,56 $')
          expect(formatter.format -1234.56).toEqual('(1 234,56 $)')

        describe 'and the country code matches the currency code', ->
          it 'uses the native currency symbol for the currency code', ->
            # A person in Germany who speaks American English looking at Euros.
            formatter.setLocale 'en-US'
            formatter.setCountryCode 'DE'
            formatter.setCurrencyCode 'EUR'
            expect(formatter.format 1234.56).toEqual('€1,234.56')
            expect(formatter.format -1234.56).toEqual('(€1,234.56)')

          it 'allows implicitly changing the digit settings', ->
            # A person in Japan who speaks Japanese looking at Yen.
            formatter.setLocale 'ja-JP'
            formatter.setCountryCode 'JP'
            formatter.setCurrencyCode 'JPY'
            expect(formatter.format 5840).toEqual('¥5,840')
            expect(formatter.format -5840).toEqual('-¥5,840')

        describe 'and the country code does not match the currency code', ->
          it 'uses the international currency symbol for the currency code', ->
            # A person in Germany who speaks American English looking at US Dollars.
            formatter.setLocale 'en-US'
            formatter.setCountryCode 'DE'
            formatter.setCurrencyCode 'USD'
            expect(formatter.format 1.2).toEqual('US$1.20')
            expect(formatter.format -1.2).toEqual('(US$1.20)')

        describe 'and the full locale string overrides the settings for its base language', ->
          it 'uses the defaults from the full locale string over the base', ->
            # A person in Great Britain who speaks British English looking at British Pounds.
            formatter.setLocale 'en-GB'
            formatter.setCountryCode 'GB'
            formatter.setCurrencyCode 'GBP'
            expect(formatter.format 9189.30).toEqual('£9,189.30')
            expect(formatter.format -9189.30).toEqual('-£9,189.30')

      describe 'setting the currency code to an unknown currency', ->
        beforeEach ->
          formatter.setCurrencyCode 'XXX'

        it 'formats using the currency code as the symbol', ->
          expect(formatter.format 1.2).toEqual('XXX1.20')

    describe 'switching styles', ->
      it 'resets values back to their original defaults', ->
        multiplier = formatter.multiplier()
        formatter.setNumberStyle NumberFormatter.Style.PERCENT
        formatter.setNumberStyle NumberFormatter.Style.NONE
        expect(formatter.multiplier()).toEqual(multiplier)

  describe '#parse', ->
    it 'parses normal positive numbers', ->
      expect(formatter.parse '8').toEqual(8)

    it 'parses normal negative numbers', ->
      expect(formatter.parse '-8').toEqual(-8)

    describe 'with a custom zero symbol', ->
      beforeEach ->
        formatter.setZeroSymbol '#'

      it 'parses that symbol by itself as zero', ->
        expect(formatter.parse '#').toEqual(0)

      it 'fails to parse that symbol preceded by a valid negative suffix', ->
        errorCallback = jasmine.createSpy('errorCallback')
        expect(formatter.parse '-#', errorCallback).toBeNull()
        expect(errorCallback).toHaveBeenCalledWith('number-formatter.invalid-format')

    describe 'with a custom null symbol', ->
      beforeEach ->
        formatter.setNullSymbol 'NUL'

      it 'parses that symbol by itself as null', ->
        errorCallback = jasmine.createSpy('errorCallback')
        expect(formatter.parse 'NUL', errorCallback).toBeNull()
        expect(errorCallback).not.toHaveBeenCalled()

    describe 'with a custom NaN symbol', ->
      beforeEach ->
        formatter.setNotANumberSymbol 'WHA?'

      it 'parses that symbol by itself as not a number', ->
        expect(isNaN(formatter.parse 'WHA?')).toBeTruthy()

    describe 'with a custom infinity symbol', ->
      beforeEach ->
        formatter.setPositiveInfinitySymbol 'INF'

      it 'parses that symbol by itself as infinity', ->
        expect(formatter.parse 'INF').toEqual(Infinity)

    describe 'with a custom negative infinity symbol', ->
      beforeEach ->
        formatter.setNegativeInfinitySymbol '-INF'

      it 'parses that symbol by itself as negative infinity', ->
        expect(formatter.parse '-INF').toEqual(-Infinity)

    describe 'with a minimum value', ->
      beforeEach ->
        formatter.setMinimum 1

      it 'fails to parse the string when below the minimum', ->
        expect(formatter.parse '0').toBeNull()
        expect(formatter.parse formatter.negativeInfinitySymbol()).toBeNull()

      it 'has a specific error type when the string is below the minimum', ->
        errorCallback = jasmine.createSpy('errorCallback')
        formatter.parse '0', errorCallback
        expect(errorCallback).toHaveBeenCalledWith('number-formatter.out-of-bounds.below-minimum')

      it 'parses the string when above the minimum', ->
        expect(formatter.parse '2').toEqual(2)

    describe 'with a maximum value', ->
      beforeEach ->
        formatter.setMaximum 5

      it 'fails to parse the string when above the maximum', ->
        expect(formatter.parse '7').toBeNull()
        expect(formatter.parse formatter.positiveInfinitySymbol()).toBeNull()

      it 'has a specific error type when the string is above the maximum', ->
        errorCallback = jasmine.createSpy('errorCallback')
        formatter.parse '7', errorCallback
        expect(errorCallback).toHaveBeenCalledWith('number-formatter.out-of-bounds.above-maximum')

      it 'parses the string when below the maximum', ->
        expect(formatter.parse '2').toEqual(2)

    describe 'with allowsFloats = true', ->
      beforeEach ->
        formatter.setAllowsFloats yes

      it 'parses integers', ->
        expect(formatter.parse '4').toEqual(4)

      it 'parses floats', ->
        expect(formatter.parse '2.5').toEqual(2.5)

    describe 'with allowsFloats = false', ->
      beforeEach ->
        formatter.setAllowsFloats no

      it 'parses integers', ->
        expect(formatter.parse '4').toEqual(4)

      it 'fails to parse floats', ->
        expect(formatter.parse '2.5').toBeNull()

      it 'has a specific error type when trying to parse floats', ->
        errorCallback = jasmine.createSpy('errorCallback')
        formatter.parse '2.5', errorCallback
        expect(errorCallback).toHaveBeenCalledWith('number-formatter.floats-not-allowed')

    describe 'with a custom decimal separator', ->
      beforeEach ->
        formatter.setDecimalSeparator 'SEP'

      it 'parses floats with the custom decimal separator', ->
        expect(formatter.parse '2SEP5').toEqual(2.5)

      it 'fails to parse strings with multiple decimal separators', ->
        errorCallback = jasmine.createSpy('errorCallback')
        expect(formatter.parse '1SEP3SEP5', errorCallback).toBeNull()
        expect(errorCallback).toHaveBeenCalledWith('number-formatter.invalid-format')

    describe 'with a custom positive prefix and suffix', ->
      beforeEach ->
        formatter.setPositivePrefix('+').setPositiveSuffix('=)')

      it 'fails to parse the "typical" positive format', ->
        errorCallback = jasmine.createSpy('errorCallback')
        expect(formatter.parse '3', errorCallback).toBeNull()
        expect(errorCallback).toHaveBeenCalledWith('number-formatter.invalid-format')

      it 'parses strings with the custom positive prefix and suffix', ->
        expect(formatter.parse '+3=)').toEqual(3)

      it 'fails to parse just the prefix and suffix', ->
        errorCallback = jasmine.createSpy('errorCallback')
        expect(formatter.parse '+=)', errorCallback).toBeNull()
        expect(errorCallback).toHaveBeenCalledWith('number-formatter.invalid-format')

    describe 'with a custom negative prefix and suffix', ->
      beforeEach ->
        formatter.setNegativePrefix('(').setNegativeSuffix(')')

      it 'fails to parse the "typical" negative format', ->
        errorCallback = jasmine.createSpy('errorCallback')
        expect(formatter.parse '-3', errorCallback).toBeNull()
        expect(errorCallback).toHaveBeenCalledWith('number-formatter.invalid-format')

      it 'parses strings with the custom negative prefix and suffix', ->
        expect(formatter.parse '(3)').toEqual(-3)

      it 'fails to parse nested negative separators', ->
        expect(formatter.parse '((3))').toBeNull()

    describe 'with a multiplier', ->
      beforeEach ->
        formatter.setMultiplier .01

      it 'multiplies numeric values for display', ->
        expect(formatter.parse '50').toEqual(5000)
