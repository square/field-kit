var By = require('selenium-webdriver').By;
var Key = require('selenium-webdriver').Key;
var until = require('selenium-webdriver').until;
var test = require('selenium-webdriver/testing');
var expect = require('chai').expect;
var server = require('./server');
var helpers = require('./helpers');

test.describe('FieldKit.TextField', function() {
  var input;
  test.beforeEach(function() {
    server.goTo('text_field.html');
    input = driver.findElement(By.tagName('input'));
  });

  test.it('should return the correct value', function() {
    helpers.setInput('OUTATIME', input);

    return helpers.getFieldKitValues()
      .then(function(values) {
        expect(values.fieldKit).to.equal('OUTATIME');
        expect(values.raw).to.equal('OUTATIME');
      });
  });

  test.it('should work with deleting selected text', function() {
    helpers.setInput('1.21 gig|awatt>s', input);

    input.sendKeys(Key.DELETE);

    return helpers.getFieldKitValues()
      .then(function(values) {
        expect(values.fieldKit).to.equal('1.21 gigs');
        expect(values.raw).to.equal('1.21 gigs');
      });
  });

  test.it('should work with backspacing selected text', function() {
    helpers.setInput('1.21 gig|awatt>s', input);

    input.sendKeys(Key.BACK_SPACE);

    return helpers.getFieldKitValues()
      .then(function(values) {
        expect(values.fieldKit).to.equal('1.21 gigs');
        expect(values.raw).to.equal('1.21 gigs');
      });
  });

  test.it('should allow placeholders', function() {
    helpers.runJSMethod('setPlaceholder("Doc")');
    return input.getAttribute('placeholder')
      .then(function(placeholder) {
        expect(placeholder).to.equal('Doc');
      });
  });

  test.describe('textDidChange', function() {
    beforeEach(function() {
      return helpers.runJSMethod(
        "setDelegate({" +
          "textDidChange: function(field) {" +
            "window.currentValue = field.value();" +
          "}" +
        "});"
      );
    });

    test.it('should have current value', function() {
      helpers.setInput('B', input);

      return driver.executeScript('return window.currentValue')
        .then(function(currentValue) {
          expect(currentValue).to.equal('B');
        });
    });
  });
});

