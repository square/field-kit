/* jshint esnext:true, unused:true, undef:true */
/* global FieldKit, describe, beforeEach, it, expect */

describe.testsWithAllKeyboards('FieldKit.NumberFormatterSettingsFormatter', function() {
  var formatter;

  beforeEach(function() {
    formatter = new FieldKit.NumberFormatterSettingsFormatter();
  });

  var DEFAULT_SETTINGS = /** @type NumberFormatterSettings */ {
    decimalSeparator: '.',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    minimumIntegerDigits: 0,
    prefix: '',
    suffix: '',
    alwaysShowsDecimalSeparator: false,
    groupingSize: 0,
    groupingSeparator: ''
  };

  /**
   * Builds a full settings object from defaults with the given overrides.
   *
   * @param {Object=} overrides
   * @returns {NumberFormatterSettings}
   */
  function buildSettings(overrides) {
    var key;
    var result = /** @type NumberFormatterSettings */ {};

    for (key in DEFAULT_SETTINGS) {
      if (DEFAULT_SETTINGS.hasOwnProperty(key)) {
        result[key] = DEFAULT_SETTINGS[key];
      }
    }

    if (overrides) {
      for (key in overrides) {
        if (overrides.hasOwnProperty(key)) {
          result[key] = overrides[key];
        }
      }
    }

    return result;
  }

  describe('#format', function() {
    it('formats number formatter settings as a number format string', function() {
      expect(formatter.format(buildSettings())).to.equal('#');
    });

    it('pads with zeroes for every required integer digit', function() {
      var settings = buildSettings({ minimumIntegerDigits: 3 });
      expect(formatter.format(settings)).to.equal('#000');
    });

    it('pads with hashes up to the maximum fraction digits', function() {
      var settings = buildSettings({ maximumFractionDigits: 4 });
      expect(formatter.format(settings)).to.equal('#.####');
    });

    it('includes the decimal separator when alwaysShowsDecimalSeparator is true', function() {
      var settings = buildSettings({ alwaysShowsDecimalSeparator: true });
      expect(formatter.format(settings)).to.equal('#.');
    });

    it('pads with zeroes up to the minimum and with hashes past that for maximum fraction digits', function() {
      var settings = buildSettings({ minimumFractionDigits: 2, maximumFractionDigits: 4 });
      expect(formatter.format(settings)).to.equal('#.00##');
    });

    it('prepends whatever prefix is set', function() {
      var settings = buildSettings({ prefix: '¤' });
      expect(formatter.format(settings)).to.equal('¤#');
    });

    it('appends whatever suffix is set', function() {
      var settings = buildSettings({ suffix: '¤' });
      expect(formatter.format(settings)).to.equal('#¤');
    });

    it('pads the integer part with digit placeholders when using grouping separators', function() {
      var settings = buildSettings({ usesGroupingSeparator: true, groupingSize: 4 });
      expect(formatter.format(settings)).to.equal('#,####');

      settings = buildSettings({ usesGroupingSeparator: true, groupingSize: 2, minimumIntegerDigits: 4 });
      expect(formatter.format(settings)).to.equal('#00,00');
    });
  });

  describe('#parse', function() {
    it('expects exactly one integer hash', function() {
      expect(formatter.parse('#')).to.be.defined;
    });

    it('treats every zero after the leading hash as a required digit', function() {
      expect(formatter.parse('#00').minimumIntegerDigits).to.equal(2);
    });

    it('treats a decimal separator with no following zeroes or hashes as requiring the separator', function() {
      expect(formatter.parse('#.').alwaysShowsDecimalSeparator).to.equal(true);
    });

    it('treats every zero after the decimal separator as a required digit', function() {
      expect(formatter.parse('#.000').minimumFractionDigits).to.equal(3);
    });

    it('treats every trailing hash after the decimal separator as an additional allowed digit', function() {
      var settings = formatter.parse('#.00#');
      expect(settings.minimumFractionDigits).to.equal(2);
      expect(settings.maximumFractionDigits).to.equal(3);
    });

    it('can determine the grouping size by looking for the grouping separator', function() {
      var settings = formatter.parse('#,####');
      expect(settings.groupingSize).to.equal(4);
      expect(settings.usesGroupingSeparator).to.equal(true);
    });

    it('treats everything before a recognized character as part of a prefix', function() {
      expect(formatter.parse('prefix#').prefix).to.equal('prefix');
    });

    it('treats everything after a recognized character as part of a suffix', function() {
      expect(formatter.parse('#suffix').suffix).to.equal('suffix');
    });

    it('treats unrecognized characters between recognized characters as an error', function() {
      expect(formatter.parse('0f0')).to.be.null;
    });
  });
});
