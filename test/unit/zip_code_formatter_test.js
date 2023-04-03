import { expectThatTyping } from './helpers/expectations';
import { buildField } from './helpers/builders';
import FieldKit from '../../src';

testsWithAllKeyboards('FieldKit.ZipCodeFormatter', function() {
  var field;

  beforeEach(function() {
    field = buildField();
    field.setFormatter(new FieldKit.ZipCodeFormatter());
  });

  it('places dashes in the right places', function() {
    expectThatTyping('123456789').into(field).willChange('|').to('12345-6789|');
  });

  it('prevents extra digits from being entered', function() {
    expectThatTyping('0').into(field).willNotChange('12345-6789|');
  });

  it('prevents entering non-digit characters', function() {
    expectThatTyping('f').into(field).willNotChange('|');
  });

  it('backspaces words correctly', function() {
    expectThatTyping('alt+backspace').into(field).willChange('12345-6789|').to('12345-|');
  });
});
