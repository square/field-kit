/* jshint esnext:true, unused:true, undef:true */
/* global FieldKit, describe, beforeEach, it */
/* global expectThatTyping, buildField */

import { expectThatTyping } from './helpers/expectations';
import { buildField } from './helpers/builders';

testsWithAllKeyboards('FieldKit.SocialSecurityNumberFormatter', function() {
  var field;

  beforeEach(function() {
    field = buildField();
    field.setFormatter(new FieldKit.SocialSecurityNumberFormatter());
  });

  it('places dashes in the right places', function() {
    expectThatTyping('123456789').into(field).willChange('|').to('123-45-6789|');
  });

  it('prevents extra digits from being entered', function() {
    expectThatTyping('0').into(field).willNotChange('123-45-6789|');
  });

  it('prevents entering non-digit characters', function() {
    expectThatTyping('f').into(field).willNotChange('|');
  });

  it('backspaces words correctly', function() {
    expectThatTyping('alt+backspace').into(field).willChange('123-45-|').to('123-|');
  });
});
