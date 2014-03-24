/* jshint undef:true */
/* global FieldKit, describe, context, before, it, expect, sinon */
/* global expectThatTyping, buildField */

describe('FieldKit.SocialSecurityNumberFormatter', function() {
  var field;

  before(function() {
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
