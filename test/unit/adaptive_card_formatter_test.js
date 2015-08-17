/* jshint esnext:true, unused:true, undef:true */
/* global FieldKit, describe, beforeEach, it, expect */
/* global expectThatTyping, buildField */

import { buildField } from './helpers/builders';
import { expectThatTyping } from './helpers/expectations';

testsWithAllKeyboards('FieldKit.AdaptiveCardFormatter', function() {
  var field = null;
  var formatter = null;

  beforeEach(function() {
    field = buildField();
    formatter = new FieldKit.AdaptiveCardFormatter();
    field.setFormatter(formatter);
  });

  describe('typing', function() {
    it('formats as Visa once it can tell it is a Visa card', function() {
      expectThatTyping('4111111').into(field).willChange('|').to('4111 111|');
    });

    it('formats as Amex once it can tell it is an Amex card', function() {
      expectThatTyping('372512345678901').into(field).willChange('|').to('3725 123456 78901|');
    });

    it('formats it as the default if it cannot tell what it is', function() {
      expectThatTyping('1111111').into(field).willChange('|').to('1111 111|');
    });
  });

  describe('#format', function() {
    it('chooses the right formatter', function() {
      expect(formatter.format('4111111111111111')).to.equal('4111 1111 1111 1111');
      expect(formatter.format('371111111111111')).to.equal('3711 111111 11111');
    });
  });
});
