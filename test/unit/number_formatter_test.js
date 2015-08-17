/* jshint esnext:true, unused:true, undef:true */
/* global FieldKit, describe, context, beforeEach, it, expect, sinon */

testsWithAllKeyboards('FieldKit.NumberFormatter', function() {
  var formatter = null;

  beforeEach(function() {
    formatter = new FieldKit.NumberFormatter();
  });

  describe('by default', function() {
    it('has US English-standard number prefixes and suffixes', function() {
      expect(formatter.positivePrefix()).to.equal('');
      expect(formatter.positiveSuffix()).to.equal('');
      expect(formatter.negativePrefix()).to.equal('-');
      expect(formatter.negativeSuffix()).to.equal('');
    });

    it('has no fraction digits', function() {
      expect(formatter.minimumFractionDigits()).to.equal(0);
      expect(formatter.maximumFractionDigits()).to.equal(0);
    });

    it('does not always show the decimal separator', function() {
      expect(formatter.alwaysShowsDecimalSeparator()).to.be.false;
    });

    it('has the US English-standard decimal separator', function() {
      expect(formatter.decimalSeparator()).to.equal('.');
    });

    it('has USD currency code', function() {
      expect(formatter.currencyCode()).to.equal('USD');
    });

    it('rounds half even', function() {
      expect(formatter.roundingMode()).to.equal(FieldKit.NumberFormatter.Rounding.HALF_EVEN);
    });

    it('has no minimum', function() {
      expect(formatter.minimum()).to.be.null;
    });

    it('has no maximum', function() {
      expect(formatter.maximum()).to.be.null;
    });

    it('has no exponent', function() {
      expect(formatter.exponent()).to.be.null;
    });

    it('has no maximumIntegerDigits', function() {
      expect(formatter.maximumIntegerDigits()).to.be.null;
    });

    it('has a minimumIntegerDigits', function() {
      expect(formatter.minimumIntegerDigits()).to.equal(0);
    });

    it('does not use a grouping separator', function() {
      expect(formatter.usesGroupingSeparator()).to.be.false;
    });

    it('has US English-standard grouping separator', function() {
      expect(formatter.groupingSeparator()).to.equal(',');
    });

    it('has US English-standard grouping size', function() {
      expect(formatter.groupingSize()).to.equal(3);
    });

    it('has no custom zero symbol', function() {
      expect(formatter.zeroSymbol()).to.be.null;
    });

    it('has empty string as the null symbol', function() {
      expect(formatter.nullSymbol()).to.equal('');
    });

    it('has NaN as the not a number symbol', function() {
      expect(formatter.notANumberSymbol()).to.equal('NaN');
    });

    it('has US English-standard symbol for positive infinity', function() {
      expect(formatter.positiveInfinitySymbol()).to.equal('+∞');
    });

    it('has US English-standard symbol for negative infinity', function() {
      expect(formatter.negativeInfinitySymbol()).to.equal('-∞');
    });

    it('has US English-standard symbol for percent', function() {
      expect(formatter.percentSymbol()).to.equal('%');
    });

    it('has no number style', function() {
      expect(formatter.numberStyle()).to.equal(FieldKit.NumberFormatter.Style.NONE);
    });

    it('has US English-standard symbol for currency', function() {
      expect(formatter.currencySymbol()).to.equal('$');
    });

    it('has a positive number format for US English', function() {
      expect(formatter.positiveFormat()).to.equal('#');
    });

    it('has a negative number format for US English', function() {
      expect(formatter.negativeFormat()).to.equal('-#');
    });
  });

  describe('#numberFromString', function() {
    it('is an alias for #parse', function() {
      expect(formatter.numberFromString).to.equal(formatter.parse);
    });
  });

  describe('#stringFromNumber', function() {
    it('is an alias for #format', function() {
      expect(formatter.stringFromNumber).to.equal(formatter.format);
    });
  });

  describe('#minusSign', function() {
    it('controls the minus sign used in formatting negative numbers in some locales', function() {
      formatter.setMinusSign('*');
      expect(formatter.format(-8)).to.equal('*8');
    });
  });

  describe('#maximumFractionDigits', function() {
    it('uses minimumFractionDigits if it is configured higher', function() {
      // set minimum > maximum
      formatter.setMinimumFractionDigits(9);
      formatter.setMaximumFractionDigits(3);
      expect(formatter.maximumFractionDigits()).to.equal(9);

      // bring minimum < maximum
      formatter.setMinimumFractionDigits(2);
      expect(formatter.maximumFractionDigits()).to.equal(3);
    });
  });

  describe('#minimumFractionDigits', function() {
    it('uses maximumFractionDigits if it is lower', function() {
      // set minimum > maximum
      formatter.setMinimumFractionDigits(9);
      formatter.setMaximumFractionDigits(3);
      expect(formatter.minimumFractionDigits()).to.equal(3);

      // bring minimum < maximum
      formatter.setMaximumFractionDigits(10);
      expect(formatter.minimumFractionDigits()).to.equal(9);
    });

    it('stays at the default when a maximumFractionDigits is set', function() {
      formatter.setMinimumFractionDigits(null);
      formatter.setMaximumFractionDigits(20);
      expect(formatter.minimumFractionDigits())
        .to.equal(new FieldKit.NumberFormatter().minimumFractionDigits());
    });
  });

  describe('#maximumIntegerDigits', function() {
    it('does not use minimumIntegerDigits by default', function() {
      formatter.setMinimumIntegerDigits(1);
      expect(formatter.maximumIntegerDigits()).to.equal(new FieldKit.NumberFormatter().maximumIntegerDigits());
    });
  });

  describe('#minimumIntegerDigits', function() {
    it('changes when a lower maximumIntegerDigits value is set', function() {
      formatter.setMinimumIntegerDigits(20);
      formatter.setMaximumIntegerDigits(2);
      expect(formatter.minimumIntegerDigits()).to.equal(2);
    });
  });

  describe('#format', function() {
    it('works with 702', function() {
      formatter.setNumberStyle(FieldKit.NumberFormatter.Style.CURRENCY);
      formatter.setExponent(-2);
      expect(formatter.format(-702)).to.equal('($7.02)');
    });

    describe('given zero', function() {
      describe('and a custom zero symbol', function() {
        beforeEach(function() {
          formatter.setZeroSymbol('#');
        });

        it('uses the custom zero symbol', function() {
          expect(formatter.format(0)).to.equal('#');
        });
      });
    });

    describe('given empty string', function() {
      it('returns empty string', function() {
        expect(formatter.format('')).to.equal('');
      });
    });

    context('given null', function() {
      context('and a custom null symbol', function() {
        beforeEach(function() {
          formatter.setNullSymbol('NUL');
        });

        it('uses the custom null symbol', function() {
          expect(formatter.format(null)).to.equal('NUL');
        });
      });
    });

    describe('given NaN', function() {
      describe('and a custom not a number symbol', function() {
        beforeEach(function() {
          formatter.setNotANumberSymbol('WHA?');
        });

        it('uses the custom not a number symbol', function() {
          expect(formatter.format(NaN)).to.equal('WHA?');
        });
      });
    });

    describe('given infinity', function() {
      describe('and a custom infinity symbol', function() {
        beforeEach(function() {
          formatter.setPositiveInfinitySymbol('INF');
        });

        it('uses the custom infinity symbol', function() {
          expect(formatter.format(Infinity)).to.equal('INF');
        });
      });
    });

    describe('given negative infinity', function() {
      describe('and a custom negative infinity symbol', function() {
        beforeEach(function() {
          formatter.setNegativeInfinitySymbol('-INF');
        });

        it('uses the custom negative infinity symbol', function() {
          expect(formatter.format(-Infinity)).to.equal('-INF');
        });
      });
    });


    describe('given a positive number', function() {
      describe('with custom prefix and suffix', function() {
        beforeEach(function() {
          formatter.setPositivePrefix('<POS>');
          formatter.setPositiveSuffix('</POS>');
        });

        it('adds them', function() {
          expect(formatter.format(8)).to.equal('<POS>8</POS>');
        });
      });

      describe('with maximumFractionDigits = 0', function() {
        beforeEach(function() {
          formatter.setMaximumFractionDigits(0);
        });

        it('formats integers without a fractional part', function() {
          expect(formatter.format(50)).to.equal('50');
        });

        it('formats floats without a fractional part', function() {
          expect(formatter.format(50.8)).to.equal('51');
        });
      });

      describe('with maximumFractionDigits = 1', function() {
        beforeEach(function() {
          formatter.setMaximumFractionDigits(1);
        });

        it('formats integers without a fractional part', function() {
          expect(formatter.format(50)).to.equal('50');
          expect(formatter.format(50.0)).to.equal('50');
        });

        it('formats floats rounding the fractional part if needed', function() {
          expect(formatter.format(50.8)).to.equal('50.8');
          expect(formatter.format(50.87)).to.equal('50.9');
        });
      });

      describe('with maximumFractionDigits > 1', function() {
        beforeEach(function() {
          formatter.setMaximumFractionDigits(2);
        });

        it('formats integers without a fractional part', function() {
          expect(formatter.format(50)).to.equal('50');
        });

        it('formats floats rounding the fractional part if needed', function() {
          expect(formatter.format(3.1)).to.equal('3.1');
          expect(formatter.format(3.14)).to.equal('3.14');
          expect(formatter.format(3.141)).to.equal('3.14');
        });

        describe('with minimumFractionDigits = 1', function() {
          beforeEach(function() {
            formatter.setMinimumFractionDigits(1);
          });

          it('formats integers with a fractional 0', function() {
            expect(formatter.format(50)).to.equal('50.0');
          });

          it('formats floats as normal', function() {
            expect(formatter.format(50.4)).to.equal('50.4');
          });
        });
      });

      describe('with alwaysShowsDecimalSeparator = true', function() {
        beforeEach(function() {
          formatter.setAlwaysShowsDecimalSeparator(true);
        });

        it('formats integers with a decimal separator', function() {
          expect(formatter.format(9)).to.equal('9.');
        });

        it('formats floats as normal', function() {
          formatter.setMaximumFractionDigits(1);
          expect(formatter.format(8.1)).to.equal('8.1');
        });
      });

      describe('with a custom decimal separator', function() {
        beforeEach(function() {
          formatter.setDecimalSeparator('SEP');
          formatter.setMaximumFractionDigits(1);
        });

        it('formats integers without the separator', function() {
          expect(formatter.format(77)).to.equal('77');
        });

        it('formats floats with the separator', function() {
          expect(formatter.format(77.7)).to.equal('77SEP7');
        });
      });

      describe('with ceiling rounding', function() {
        beforeEach(function() {
          formatter.setRoundingMode(FieldKit.NumberFormatter.Rounding.CEILING);
          formatter.setMaximumFractionDigits(1);
        });

        it('does not round integers', function() {
          expect(formatter.format(4)).to.equal('4');
        });

        it('does not round floats with fraction digits less than or the same as the maximum', function() {
          expect(formatter.format(3.1)).to.equal('3.1');
        });

        it('rounds floats with non-zero digits past the maximum', function() {
          expect(formatter.format(3.14)).to.equal('3.2');
          expect(formatter.format(3.01)).to.equal('3.1');
        });

        it('rounds to the next integer if no fraction digits are allowed', function() {
          formatter.setMaximumFractionDigits(0);
          expect(formatter.format(1.1)).to.equal('2');
          expect(formatter.format(1.01)).to.equal('2');
        });
      });

      describe('with floor rounding', function() {
        beforeEach(function() {
          formatter.setRoundingMode(FieldKit.NumberFormatter.Rounding.FLOOR);
          formatter.setMaximumFractionDigits(1);
        });

        it('does not round integers', function() {
          expect(formatter.format(4)).to.equal('4');
        });

        it('does not round floats with fraction digits less than or the same as the maximum', function() {
          expect(formatter.format(3.1)).to.equal('3.1');
        });

        it('rounds floats with non-zero digits past the maximum', function() {
          expect(formatter.format(1.11)).to.equal('1.1');
          expect(formatter.format(1.19)).to.equal('1.1');
        });
      });

      describe('with half-even rounding', function() {
        beforeEach(function() {
          formatter.setRoundingMode(FieldKit.NumberFormatter.Rounding.HALF_EVEN);
          formatter.setMaximumFractionDigits(1);
        });

        it('does not round integers', function() {
          expect(formatter.format(4)).to.equal('4');
        });

        it('does not round floats with fraction digits less than or the same as the maximum', function() {
          expect(formatter.format(0.1)).to.equal('0.1');
        });

        it('rounds floats with non-zero digits past the maximum', function() {
          expect(formatter.format(0.35)).to.equal('0.4');
          expect(formatter.format(0.25)).to.equal('0.2');
          expect(formatter.format(0.251)).to.equal('0.3');
        });

        describe('rounding to integers', function() {
          beforeEach(function() {
            formatter.setMaximumFractionDigits(0);
          });

          it('rounds toward even integers', function() {
            expect(formatter.format(0.5)).to.equal('0');
            expect(formatter.format(1.5)).to.equal('2');
          });
        });
      });

      describe('with an exponent', function() {
        beforeEach(function() {
          formatter.setExponent(-2);
        });

        it('multiplies numeric values for display', function() {
          expect(formatter.format(5000)).to.equal('50');
        });
      });

      describe('with minimumIntegerDigits', function() {
        beforeEach(function() {
          formatter.setMinimumIntegerDigits(2);
        });

        it('left-pads the integer part if necessary', function() {
          expect(formatter.format(1)).to.equal('01');
          expect(formatter.format(12)).to.equal('12');
        });
      });

      describe('with maximumIntegerDigits', function() {
        beforeEach(function() {
          formatter.setMaximumIntegerDigits(2);
        });

        it('left-truncates the integer part if necessary', function() {
          expect(formatter.format(123)).to.equal('23');
          expect(formatter.format(23)).to.equal('23');
        });
      });

      describe('using a grouping separator', function() {
        beforeEach(function() {
          formatter.setUsesGroupingSeparator(true);
        });

        it('formats integer parts with fewer digits than the grouping size as normal', function() {
          expect(formatter.format(123)).to.equal('123');
        });

        it('formats integer parts with more digits than the grouping size with separators', function() {
          expect(formatter.format(1234567)).to.equal('1,234,567');
        });

        describe('with a custom grouping size', function() {
          beforeEach(function() {
            formatter.setGroupingSize(1);
          });

          it('formats integer parts with more digits than the grouping size with separators', function() {
            expect(formatter.format(123)).to.equal('1,2,3');
          });
        });

        describe('with a custom grouping separator', function() {
          beforeEach(function() {
            formatter.setGroupingSeparator('**');
          });

          it('formats integer parts with more digits than the grouping size with separators', function() {
            expect(formatter.format(1234567)).to.equal('1**234**567');
          });
        });

        describe('with a locale that customizes grouping', function() {
          beforeEach(function() {
            formatter.setLocale('fr-CA');
          });

          it('uses the custom grouping settings for that locale', function() {
            expect(formatter.format(1234567)).to.equal('1 234 567');
          });
        });
      });
    });

    describe('given a negative number', function() {
      describe('with custom prefix and suffix', function() {
        beforeEach(function() {
          formatter.setNegativePrefix('<NEG>');
          formatter.setNegativeSuffix('</NEG>');
        });

        it('adds them', function() {
          expect(formatter.format(-8)).to.equal('<NEG>8</NEG>');
        });
      });

      describe('with ceiling rounding', function() {
        beforeEach(function() {
          formatter.setRoundingMode(FieldKit.NumberFormatter.Rounding.CEILING);
          formatter.setMaximumFractionDigits(1);
        });

        it('does not round integers', function() {
          expect(formatter.format(-4)).to.equal('-4');
        });

        it('does not round floats with no non-zero fraction digits past the maximum', function() {
          expect(formatter.format(-3.10)).to.equal('-3.1');
        });

        it('rounds floats with non-zero digits past the maximum', function() {
          expect(formatter.format(-3.19)).to.equal('-3.1');
        });

        describe('when rounded to 0', function() {
          beforeEach(function() {
            formatter.setMaximumFractionDigits(0);
          });

          // This is up for debate.
          it('shows zero with a negative sign', function() {
            expect(formatter.format(-0.1)).to.equal('-0');
          });
        });
      });

      describe('with floor rounding', function() {
        beforeEach(function() {
          formatter.setRoundingMode(FieldKit.NumberFormatter.Rounding.FLOOR);
          formatter.setMaximumFractionDigits(1);
        });

        it('does not round integers', function() {
          expect(formatter.format(-4)).to.equal('-4');
        });

        it('does not round floats with no non-zero fraction digits past the maximum', function() {
          expect(formatter.format(-3.10)).to.equal('-3.1');
        });

        it('rounds floats with non-zero digits past the maximum', function() {
          expect(formatter.format(-3.11)).to.equal('-3.2');
        });

        it('carries the one', function() {
          expect(formatter.format(-3.91)).to.equal('-4');
        });
      });

      describe('with half-even rounding', function() {
        beforeEach(function() {
          formatter.setRoundingMode(FieldKit.NumberFormatter.Rounding.HALF_EVEN);
          formatter.setMaximumFractionDigits(1);
        });

        it('does not round integers', function() {
          expect(formatter.format(-4)).to.equal('-4');
        });

        it('does not round floats with fraction digits less than or the same as the maximum', function() {
          expect(formatter.format(-0.1)).to.equal('-0.1');
        });

        it('rounds floats with non-zero digits past the maximum', function() {
          expect(formatter.format(-0.35)).to.equal('-0.4');
          expect(formatter.format(-0.349)).to.equal('-0.3');
          expect(formatter.format(-0.351)).to.equal('-0.4');
          expect(formatter.format(-0.25)).to.equal('-0.2');
        });
      });
    });

    describe('with the percent style', function() {
      beforeEach(function() {
        formatter.setNumberStyle(FieldKit.NumberFormatter.Style.PERCENT);
      });

      it('formats numbers as percents', function() {
        expect(formatter.format(4.21)).to.equal('421%');
        expect(formatter.format(-4.21)).to.equal('-421%');
      });

      it('formats zero as a percent', function() {
        expect(formatter.format(0)).to.equal('0%');
      });

      describe('with a custom percent symbol', function() {
        beforeEach(function() {
          formatter.setPercentSymbol('PER');
        });

        it('formats using the custom symbol', function() {
          expect(formatter.format(0.2)).to.equal('20PER');
        });
      });

      describe('with a non-US English locale', function() {
        beforeEach(function() {
          formatter.setLocale('fr');
        });

        it('formats using the custom symbol for that locale', function() {
          expect(formatter.format(0.2)).to.equal('20 %');
        });
      });
    });

    describe('with the currency style', function() {
      beforeEach(function() {
        formatter.setNumberStyle(FieldKit.NumberFormatter.Style.CURRENCY);
      });

      it('formats numbers as currencies', function() {
        expect(formatter.format(4.21)).to.equal('$4.21');
        expect(formatter.format(-4.21)).to.equal('($4.21)');
      });

      describe('with a custom currency symbol', function() {
        beforeEach(function() {
          formatter.setCurrencySymbol('CUR');
        });

        it('formats using the custom symbol', function() {
          expect(formatter.format(1.2)).to.equal('CUR1.20');
        });
      });

      describe('setting the currency code to something else', function() {
        it('uses any overrides for prefix and suffix from the language defaults', function() {
          // A person in the US who speaks French looking at US Dollars.
          formatter.setLocale('fr');
          formatter.setCountryCode('US');
          formatter.setCurrencyCode('USD');
          expect(formatter.format(1234.56)).to.equal('1 234,56 $');
          expect(formatter.format(-1234.56)).to.equal('(1 234,56 $)');
        });

        describe('and the country code matches the currency code', function() {
          it('uses the native currency symbol for the currency code', function() {
            // A person in Germany who speaks American English looking at Euros.
            formatter.setLocale('en-US');
            formatter.setCountryCode('DE');
            formatter.setCurrencyCode('EUR');
            expect(formatter.format(1234.56)).to.equal('€1,234.56');
            expect(formatter.format(-1234.56)).to.equal('(€1,234.56)');

            // A person in Israel who speaks Hebrew looking at Shekel.
            formatter.setLocale('he-IL');
            formatter.setCountryCode('IL');
            formatter.setCurrencyCode('ILS');
            expect(formatter.format(1234.56)).to.equal('₪1,234.56');
            expect(formatter.format(-1234.56)).to.equal('(₪1,234.56)');
          });

          it('allows implicitly changing the digit settings', function() {
            // A person in Japan who speaks Japanese looking at Yen.
            formatter.setLocale('ja-JP');
            formatter.setCountryCode('JP');
            formatter.setCurrencyCode('JPY');
            expect(formatter.format(5840)).to.equal('¥5,840');
            expect(formatter.format(-5840)).to.equal('-¥5,840');
          });
        });

        describe('and the country code does not match the currency code', function() {
          it('uses the international currency symbol for the currency code', function() {
            // A person in Germany who speaks American English looking at US Dollars.
            formatter.setLocale('en-US');
            formatter.setCountryCode('DE');
            formatter.setCurrencyCode('USD');
            expect(formatter.format(1.2)).to.equal('US$1.20');
            expect(formatter.format(-1.2)).to.equal('(US$1.20)');
          });
        });

        describe('and the full locale string overrides the settings for its base language', function() {
          it('uses the defaults from the full locale string over the base', function() {
            // A person in Great Britain who speaks British English looking at British Pounds.
            formatter.setLocale('en-GB');
            formatter.setCountryCode('GB');
            formatter.setCurrencyCode('GBP');
            expect(formatter.format(9189.30)).to.equal('£9,189.30');
            expect(formatter.format(-9189.30)).to.equal('-£9,189.30');
          });
        });
      });

      describe('setting the currency code to an unknown currency', function() {
        beforeEach(function() {
          formatter.setCurrencyCode('XXX');
        });

        it('formats using the currency code as the symbol', function() {
          expect(formatter.format(1.2)).to.equal('XXX1.20');
        });
      });
    });

    describe('switching styles', function() {
      it('resets values back to their original defaults', function() {
        var exponent = formatter.exponent();
        formatter.setNumberStyle(FieldKit.NumberFormatter.Style.PERCENT);
        formatter.setNumberStyle(FieldKit.NumberFormatter.Style.NONE);
        expect(formatter.exponent()).to.equal(exponent);
      });
    });
  });

  describe('#parse', function() {
    it('parses normal positive numbers', function() {
      expect(formatter.parse('8')).to.equal(8);
    });

    it('parses normal negative numbers', function() {
      expect(formatter.parse('-8')).to.equal(-8);
    });

    describe('with a custom zero symbol', function() {
      beforeEach(function() {
        formatter.setZeroSymbol('#');
      });

      it('parses that symbol by itself as zero', function() {
        expect(formatter.parse('#')).to.equal(0);
      });

      it('fails to parse that symbol preceded by a valid negative suffix', function() {
        var errorCallback = sinon.spy();
        expect(formatter.parse('-#', errorCallback)).to.be.null;
        expect(errorCallback.firstCall.args).to.eql(['number-formatter.invalid-format']);
      });
    });

    describe('with a custom null symbol', function() {
      beforeEach(function() {
        formatter.setNullSymbol('NUL');
      });

      it('parses that symbol by itself as null', function() {
        var errorCallback = sinon.spy();
        expect(formatter.parse('NUL', errorCallback)).to.be.null;
        expect(errorCallback.callCount).to.equal(0);
      });
    });

    describe('with a custom NaN symbol', function() {
      beforeEach(function() {
        formatter.setNotANumberSymbol('WHA?');
      });

      it('parses that symbol by itself as not a number', function() {
        expect(isNaN(formatter.parse('WHA?'))).to.be.true;
      });
    });

    describe('with a custom infinity symbol', function() {
      beforeEach(function() {
        formatter.setPositiveInfinitySymbol('INF');
      });

      it('parses that symbol by itself as infinity', function() {
        expect(formatter.parse('INF')).to.equal(Infinity);
      });
    });

    describe('with a custom negative infinity symbol', function() {
      beforeEach(function() {
        formatter.setNegativeInfinitySymbol('-INF');
      });

      it('parses that symbol by itself as negative infinity', function() {
        expect(formatter.parse('-INF')).to.equal(-Infinity);
      });
    });

    describe('with a minimum value', function() {
      beforeEach(function() {
        formatter.setMinimum(1);
      });

      it('fails to parse the string when below the minimum', function() {
        expect(formatter.parse('0')).to.be.null;
        expect(formatter.parse(formatter.negativeInfinitySymbol())).to.be.null;
      });

      it('has a specific error type when the string is below the minimum', function() {
        var errorCallback = sinon.spy();
        formatter.parse('0', errorCallback);
        expect(errorCallback.firstCall.args).to.eql(['number-formatter.out-of-bounds.below-minimum']);
      });

      it('parses the string when above the minimum', function() {
        expect(formatter.parse('2')).to.equal(2);
      });
    });

    describe('with a maximum value', function() {
      beforeEach(function() {
        formatter.setMaximum(5);
      });

      it('fails to parse the string when above the maximum', function() {
        expect(formatter.parse('7')).to.be.null;
        expect(formatter.parse(formatter.positiveInfinitySymbol())).to.be.null;
      });

      it('has a specific error type when the string is above the maximum', function() {
        var errorCallback = sinon.spy();
        formatter.parse('7', errorCallback);
        expect(errorCallback.firstCall.args).to.eql(['number-formatter.out-of-bounds.above-maximum']);
      });

      it('parses the string when below the maximum', function() {
        expect(formatter.parse('2')).to.equal(2);
      });
    });

    describe('with a grouping separator', function() {
      beforeEach(function() {
        formatter.setUsesGroupingSeparator(true);
        formatter.setGroupingSeparator('SEP');
      });

      it('parses numbers with the grouping separator', function() {
        expect(formatter.parse('1SEP000')).to.equal(1000);
      });

      it('parses numbers without a grouping separator', function() {
        expect(formatter.parse('1000')).to.equal(1000);
      });

      it('parses numbers with multiple grouping separators', function() {
        expect(formatter.parse('1SEP000SEP000')).to.equal(1000000);
      });

      it('fails to parse a string with bad group sizes', function() {
        var errorCallback = sinon.spy();
        expect(formatter.parse('1SEP00', errorCallback)).to.be.null;
        expect(errorCallback.firstCall.args).to.eql(['number-formatter.invalid-format.grouping-size']);
      });

      it('fails to parse a string which includes the grouping separator sometimes', function() {
        var errorCallback = sinon.spy();
        expect(formatter.parse('1000SEP000', errorCallback)).to.be.null;
        expect(errorCallback.firstCall.args).to.eql(['number-formatter.invalid-format.grouping-size']);
      });

      describe('in lenient mode', function() {
        beforeEach(function() {
          formatter.setLenient(true);
        });

        it('parses strings ignoring grouping separators and grouping size', function() {
          expect(formatter.parse('1000SEP00')).to.equal(100000);
          expect(formatter.parse('SEP10SEP00SEP00SEP')).to.equal(100000);
        });
      });
    });

    describe('with allowsFloats = true', function() {
      beforeEach(function() {
        formatter.setAllowsFloats(true);
      });

      it('parses integers', function() {
        expect(formatter.parse('4')).to.equal(4);
      });

      it('parses floats', function() {
        expect(formatter.parse('2.5')).to.equal(2.5);
      });
    });

    describe('with allowsFloats = false', function() {
      beforeEach(function() {
        formatter.setAllowsFloats(false);
      });

      it('parses integers', function() {
        expect(formatter.parse('4')).to.equal(4);
      });

      it('fails to parse floats', function() {
        expect(formatter.parse('2.5')).to.be.null;
      });

      it('has a specific error type when trying to parse floats', function() {
        var errorCallback = sinon.spy();
        formatter.parse('2.5', errorCallback);
        expect(errorCallback.firstCall.args).to.eql(['number-formatter.floats-not-allowed']);
      });
    });

    describe('with a custom decimal separator', function() {
      beforeEach(function() {
        formatter.setDecimalSeparator('SEP');
      });

      it('parses floats with the custom decimal separator', function() {
        expect(formatter.parse('2SEP5')).to.equal(2.5);
      });

      it('fails to parse strings with multiple decimal separators', function() {
        var errorCallback = sinon.spy();
        expect(formatter.parse('1SEP3SEP5', errorCallback)).to.be.null;
        expect(errorCallback.firstCall.args).to.eql(['number-formatter.invalid-format']);
      });
    });

    describe('with a custom positive prefix and suffix', function() {
      beforeEach(function() {
        formatter.setPositivePrefix('+').setPositiveSuffix('=)');
      });

      it('fails to parse the "typical" positive format', function() {
        var errorCallback = sinon.spy();
        expect(formatter.parse('3', errorCallback)).to.be.null;
        expect(errorCallback.firstCall.args).to.eql(['number-formatter.invalid-format']);
      });

      it('parses strings with the custom positive prefix and suffix', function() {
        expect(formatter.parse('+3=)')).to.equal(3);
      });

      it('fails to parse just the prefix and suffix', function() {
        var errorCallback = sinon.spy();
        expect(formatter.parse('+=)', errorCallback)).to.be.null;
        expect(errorCallback.firstCall.args).to.eql(['number-formatter.invalid-format']);
      });
    });

    describe('with a custom negative prefix and suffix', function() {
      beforeEach(function() {
        formatter.setNegativePrefix('(').setNegativeSuffix(')');
      });

      it('fails to parse the "typical" negative format', function() {
        var errorCallback = sinon.spy();
        expect(formatter.parse('-3', errorCallback)).to.be.null;
        expect(errorCallback.firstCall.args).to.eql(['number-formatter.invalid-format']);
      });

      it('parses strings with the custom negative prefix and suffix', function() {
        expect(formatter.parse('(3)')).to.equal(-3);
      });

      it('fails to parse nested negative separators', function() {
        expect(formatter.parse('((3))')).to.be.null;
      });
    });

    describe('with an exponent', function() {
      beforeEach(function() {
        formatter.setExponent(-2);
      });

      it('multiplies numeric values for display', function() {
        expect(formatter.parse('50')).to.equal(5000);
      });
    });

    describe('when isLenient is set', function() {
      beforeEach(function() {
        formatter.setLenient(true);
      });

      it('ignores whitespace in the input value', function() {
        expect(formatter.parse('  5  0. 7')).to.equal(50.7);
      });

      it('ignores whitespace in suffixes', function() {
        formatter.setPositiveSuffix(' %');
        expect(formatter.parse('5%')).to.equal(5);
      });

      it('ignores missing suffixes', function() {
        formatter.setPositiveSuffix('(%');
        expect(formatter.parse('5')).to.equal(5);
        expect(formatter.parse('-5')).to.equal(-5);
      });

      it('correctly interprets negative prefixes', function() {
        formatter.setNegativePrefix('-');
        expect(formatter.parse('5')).to.equal(5);
        expect(formatter.parse('-5')).to.equal(-5);
      });

      it('ignores missing positive prefixes', function() {
        formatter.setPositivePrefix('!');
        expect(formatter.parse('5')).to.equal(5);
      });

      it('does not allow complete garbage', function() {
        expect(formatter.parse('4##@238420@(!)@*)#!')).to.be.null;
      });
    });
  });

  describe('#positiveFormat', function() {
    it('updates when changing the settings that affect it', function() {
      formatter.setPositivePrefix('USD');
      expect(formatter.positiveFormat()).to.equal('USD#');
    });

    it('leaves the currency symbol intact', function() {
      formatter.setNumberStyle(FieldKit.NumberFormatter.Style.CURRENCY);
      expect(formatter.positiveFormat()).to.equal('¤#,##0.00');
    });

    it('updates the settings that affect it when set', function() {
      formatter.setPositiveFormat('pfix#,##00.0##suf');
      expect(formatter.alwaysShowsDecimalSeparator()).to.equal(false);
      expect(formatter.groupingSize()).to.equal(4);
      expect(formatter.positivePrefix()).to.equal('pfix');
      expect(formatter.positiveSuffix()).to.equal('suf');
      expect(formatter.usesGroupingSeparator()).to.equal(true);
      expect(formatter.maximumFractionDigits()).to.equal(3);
      expect(formatter.minimumFractionDigits()).to.equal(1);
      expect(formatter.minimumIntegerDigits()).to.equal(2);
    });
  });

  describe('#negativeFormat', function() {
    it('updates when changing the settings that affect it', function() {
      formatter.setNegativeSuffix('USD');
      expect(formatter.negativeFormat()).to.equal('-#USD');
    });

    it('updates the settings that affect it when set', function() {
      formatter.setNegativeFormat('pfix#,##00.0##suf');
      expect(formatter.alwaysShowsDecimalSeparator()).to.equal(false);
      expect(formatter.groupingSize()).to.equal(4);
      expect(formatter.negativePrefix()).to.equal('pfix');
      expect(formatter.negativeSuffix()).to.equal('suf');
      expect(formatter.usesGroupingSeparator()).to.equal(true);
      expect(formatter.maximumFractionDigits()).to.equal(3);
      expect(formatter.minimumFractionDigits()).to.equal(1);
      expect(formatter.minimumIntegerDigits()).to.equal(2);
    });
  });
});
