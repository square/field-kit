var test = require('selenium-webdriver/testing');
var server = require('./server');
global.driver = null;

function setUpDriverFor(test) {
  test.before(function() {
    var webdriver = require('selenium-webdriver');
    var chrome = require('selenium-webdriver/chrome');
    var path = require('chromedriver').path;

    var service = new chrome.ServiceBuilder(path).build();
    chrome.setDefaultService(service);

    driver = new webdriver.Builder()
      .withCapabilities(webdriver.Capabilities.chrome())
      .build();

    server.start();
  });

  test.after(function() {
    driver.quit();
    server.stop();
  });
}

test.describe('FieldKit Selenium Test', function() {
  setUpDriverFor(test);

  require('./adaptive_card_formatter_test');
  require('./amex_card_formatter_test');
  require('./card_text_field_test');
  require('./default_card_formatter_test');
  require('./delimited_text_formatter_test');
  require('./expiry_date_formatter_test');
  require('./phone_formatter_test');
  require('./social_security_number_formatter_test');
  require('./text_field_test');
});
