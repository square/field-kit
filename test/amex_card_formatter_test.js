/* jshint undef:true */
/* global FieldKit, describe, context, before, it, expect, sinon */
/* global expectThatTyping, buildField */

describe('FieldKit.AmexCardFormatter', function() {
  var field = null;

  before(function() {
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
