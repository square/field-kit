/* jshint esnext:true, unused:true, undef:true */
/* global describe, beforeEach, it */

import { buildField } from './helpers/builders';
import { expectThatTyping } from './helpers/expectations';
import FieldKit from '../../src';

testsWithAllKeyboards('FieldKit.AmexCardFormatter', function() {
  var field = null;

  beforeEach(function() {
    field = buildField();
    field.setFormatter(new FieldKit.AmexCardFormatter());
  });

  it('formats Amex card numbers correctly', function() {
    expectThatTyping('37251111112000').into(field).willChange('|').to('3725 111111 2000|');
  });

  it('prevents entering more digits than are allowed', function() {
    expectThatTyping('1').into(field).willNotChange('3725 123456 81000|');
  });
});
