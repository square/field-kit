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

  describe '#numberFromString', ->
    it 'is an alias for #parse', ->
      expect(formatter.numberFromString).toBe(formatter.parse)

  describe '#format', ->
    describe 'given a positive number', ->
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
          formatter.setMaximumFractionDigits 3

        it 'formats integers without a fractional part', ->
          expect(formatter.format 50).toEqual('50')

        it 'formats floats truncating the fractional part if needed', ->
          expect(formatter.format 3.1).toEqual('3.1')
          expect(formatter.format 3.14).toEqual('3.14')
          expect(formatter.format 3.141).toEqual('3.141')
          expect(formatter.format 3.1415).toEqual('3.141')

        describe 'with minimumFractionDigits = 1', ->
          beforeEach ->
            formatter.setMinimumFractionDigits 1

          it 'formats integers with a fractional 0', ->
            expect(formatter.format 50).toEqual('50.0')

          it 'formats floats as normal', ->
            expect(formatter.format 50.4).toEqual('50.4')

    describe 'given a negative number', ->
      describe 'with custom prefix and suffix', ->
        beforeEach ->
          formatter.setNegativePrefix '<NEG>'
          formatter.setNegativeSuffix '</NEG>'

        it 'adds them', ->
          expect(formatter.format -8).toEqual('<NEG>8</NEG>')
