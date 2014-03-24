/* jshint undef:true */
/* global FieldKit, describe, context, before, it, expect, sinon */
/* global expectThatTyping, expectThatPasting, buildField */

describe('FieldKit.Formatter', function() {
  var field;

  before(function() {
    field = buildField();
    field.setFormatter(new FieldKit.Formatter());
  });

  describe('when #maximumLength is set', function() {
    before(function() {
      field.formatter().maximumLength = 3;
    });

    it('allows input that would not make the text longer than the maximum', function() {
      expectThatTyping('c').into(field).willChange('ab|').to('abc|');
      expectThatTyping('b').into(field).willChange('a|c').to('ab|c');
      expectThatTyping('c').into(field).willChange('ab|d|').to('abc|');
    });

    it('prevents input that would make the text longer than the maximum', function() {
      expectThatTyping('d').into(field).willNotChange('abc|');
      expectThatTyping('b').into(field).willNotChange('a|cd');
      expectThatTyping('b').into(field).willNotChange('a|cd');
    });

    it('allows pasted characters up until the maximum', function() {
      expectThatPasting('12345').into(field).willChange('a|').to('a12|');
      expectThatPasting('12345').into(field).willChange('a|b|c').to('a1|c');
    });
  });
});
