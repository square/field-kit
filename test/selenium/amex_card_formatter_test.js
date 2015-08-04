var By = require('selenium-webdriver').By;
var Key = require('selenium-webdriver').Key;
var until = require('selenium-webdriver').until;
var test = require('selenium-webdriver/testing');
var expect = require('chai').expect;
var server = require('./server');
var helpers = require('./helpers');

test.describe('FieldKit.AmexCardFormatter', function() {
  var input;
  test.beforeEach(function() {
    server.goTo('amex_card_formatter.html');
    input = driver.findElement(By.tagName('input'));
  });

  describe('typing', function() {
    test.it('formats Amex card numbers correctly', function() {
      helpers.setInput('37251111112000', input);

      return helpers.getFieldKitValues()
        .then(function(values) {
          expect(values.raw).to.equal('3725 111111 2000');
        });
    });

    test.it('prevents entering more digits than are allowed', function() {
      helpers.setInput('372512345681000|', input);

      return helpers.getFieldKitValues()
        .then(function(values) {
          expect(values.fieldKit).to.equal('372512345681000');
        });
    });
  });
});


