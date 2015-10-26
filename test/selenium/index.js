var test = require('selenium-webdriver/testing');
var helpers = require('./helpers');
var server = require('./server');
global.driver = null;

function setUpDriverFor(test) {
  test.before(function() {
    var webdriver = require('selenium-webdriver');
    var builder = new webdriver.Builder();

    if (process.env.CONTINUOUS_INTEGRATION) {
      builder.forBrowser('firefox');
    } else {
      var chrome = require('selenium-webdriver/chrome');
      var path = require('chromedriver').path;

      var service = new chrome.ServiceBuilder(path).build();
      chrome.setDefaultService(service);

      builder.withCapabilities(webdriver.Capabilities.chrome())
    }

    driver = builder.build();

    server.start();
  });

  test.after(function() {
    driver.quit();
    server.stop();
  });
}

test.describe('FieldKit Selenium Test', function() {
  setUpDriverFor(test);

  ['DEFAULT', 'android'].forEach(function(ua) {
    var adaptiveCardFormatterTest = require('./adaptive_card_formatter_test');
    var amexCardFormatterTest = require('./amex_card_formatter_test');
    var cardTextFieldTest = require('./card_text_field_test');
    var defaultCardFormatterTest = require('./default_card_formatter_test');
    var delimitedTextFormatterTest = require('./delimited_text_formatter_test');
    var expiryDateFormatterTest = require('./expiry_date_formatter_test');
    var phoneFormatterTest = require('./phone_formatter_test');
    var socialSecurityNumberFormatterTest = require('./social_security_number_formatter_test');
    var textFieldTest = require('./text_field_test');

    test.describe('testing with UA: ' + ua, function() {
      test.beforeEach(function() {
        if (ua !== 'DEFAULT') return global.ua = ua;
      });

      adaptiveCardFormatterTest();
      amexCardFormatterTest();
      cardTextFieldTest();
      defaultCardFormatterTest();
      delimitedTextFormatterTest();
      expiryDateFormatterTest(ua);
      phoneFormatterTest();
      socialSecurityNumberFormatterTest();
      textFieldTest();
    });
  });
});
