import { expectThatTyping } from './helpers/expectations';
import { buildField } from './helpers/builders';
import FieldKit from '../../src';
import {expect} from 'chai';
import sinon from 'sinon';

testsWithAllKeyboards('FieldKit.ExpiryDateFormatter', function() {
  var field;
  var formatter;

  beforeEach(function() {
    field = buildField();
    formatter = new FieldKit.ExpiryDateFormatter();
    field.setFormatter(formatter);
  });

  it('adds a preceding zero and a succeeding slash if an unambiguous month is typed', function() {
    expectThatTyping('4').into(field).willChange('|').to('04/|');
  });

  it('does not add anything when the typed first character is an ambiguous month', function() {
    expectThatTyping('1').into(field).willChange('|').to('1|');
  });

  it('adds a slash after a two-digit month is typed', function() {
    expectThatTyping('0').into(field).willChange('1|').to('10/|');
    expectThatTyping('7').into(field).willChange('0|').to('07/|');
  });

  it('adds a preceding zero when a slash is typed after an ambiguous month', function() {
    expectThatTyping('/').into(field).willChange('1|').to('01/|');
  });

  it('prevents 00 as a month', function() {
    expectThatTyping('0').into(field).willNotChange('0|').withError('expiry-date-formatter.invalid-month');
  });

  it('prevents entry of an invalid two-digit month', function() {
    expectThatTyping('3').into(field).willNotChange('1|');
  });

  it('prevents entry of an additional slash', function() {
    expectThatTyping('/').into(field).willNotChange('11/|');
  });

  it('allows any two digits for the year', function() {
    expectThatTyping('0', '9', '8').into(field).willChange('11/|').to('11/09|');
  });

  it('allows backspacing ignoring the slash', function() {
    expectThatTyping('backspace').into(field).willChange('11/|').to('1|');
  });

  it('allows backspacing words to delete just the year', function() {
    expectThatTyping('alt+backspace').into(field).willChange('11/14|').to('11/|');
  });

  it('backspaces to the beginning if the last character after backspacing is 0', function() {
    expectThatTyping('backspace').into(field).willChange('01/|').to('|');
  });

  it('allows typing a character matching the suffix that hits the end of the allowed input', function() {
    expectThatTyping('1').into(field).willChange('12/1|').to('12/11|');
  });

  it('calls its delegate when parsing the text fails', function() {
    var textFieldDidFailToParseString = sinon.spy();
    field.setDelegate({ textFieldDidFailToParseString: textFieldDidFailToParseString });
    field.setText('abc');
    expect(field.value()).to.be.null;
    expect(textFieldDidFailToParseString.firstCall.args).to.eql([field, 'abc', 'expiry-date-formatter.invalid-date']);
  });

  describe('#format', function() {
    describe('formats object into string date', function() {
      it('with one digit month', function() {
        expect(formatter.format({month: 9, year: 1999})).to.eql('09/99');
      });

      it('with two digit month', function() {
        expect(formatter.format({month: 11, year: 1999})).to.eql('11/99');
      });

      it('with two digit year', function() {
        expect(formatter.format({month: 9, year: 99})).to.eql('09/99');
      });

      it('with one digit year', function() {
        expect(formatter.format({month: 9, year: 9})).to.eql('09/09');
      });
    });

    describe('formats string into string date', function() {
      it('with one digit month', function() {
        expect(formatter.format('9/99')).to.eql('09/99');
      });

      it('with two digit month', function() {
        expect(formatter.format('11/99')).to.eql('11/99');
      });

      it('with three digit month', function() {
        expect(formatter.format('119/9')).to.eql('11/99');
      });

      it('with no delimiter', function() {
        expect(formatter.format('1199')).to.eql('11/99');
      });

      it('with no year', function() {
        expect(formatter.format('11')).to.eql('11/');
      });

      it('with four digit year', function() {
        expect(formatter.format('11/2018')).to.eql('11/18');
      });
    });
  });

  describe('#parse', function() {
    var clock;

    it('parses high two digit years as happening in the 20th century', function() {
      clock = sinon.useFakeTimers(new Date(2013, 0).getTime());
      expect(formatter.parse('04/99')).to.eql({month: 4, year: 1999});
    });

    it('parses low two digit years as happening in the 21st century', function() {
      clock = sinon.useFakeTimers(new Date(2013, 0).getTime());
      expect(formatter.parse('04/04')).to.eql({month: 4, year: 2004});
    });

    it('when near the end of a century, parses low numbers as the beginning of the next century', function() {
      clock = sinon.useFakeTimers(new Date(2099, 0).getTime());
      expect(formatter.parse('04/04')).to.eql({month: 4, year: 2104});
    });

    it('parses incomplete dates as formatted', function() {
      clock = sinon.useFakeTimers(new Date(2013, 0).getTime());
      expect(formatter.parse('12/3')).to.eql({month: 12, year: 2003});
    });

    afterEach(function() {
      clock.restore();
    });
  });
});
