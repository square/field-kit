// var webdriver = require('selenium-webdriver');
// var chrome = require('selenium-webdriver/chrome');
// var path = require('chromedriver').path;

// var service = new chrome.ServiceBuilder(path).build();
// chrome.setDefaultService(service);

// var driver = new webdriver.Builder()
//     .withCapabilities(webdriver.Capabilities.chrome())
//     .build();

// driver.get('http://www.google.com');
// driver.findElement(webdriver.By.name('q')).sendKeys('webdriver');
// driver.findElement(webdriver.By.name('btnG')).click();
// driver.wait(function() {
//  return driver.getTitle().then(function(title) {
//    return title === 'webdriver - Google Search';
//  });
// }, 1000);

// driver.quit();

// var By = require('selenium-webdriver').By,
//     assert = require('selenium-webdriver/testing/assert'),
//     test = require('selenium-webdriver/lib/test');

// var server = ('./test/server');

// test.suite(function(env) {
//   describe('testing this', function() {
//     var driver;
//     test.before(function() { server.start(); });
//     test.after(function() { driver.quit(); });

//     test.it('should return lower case tag name', function() {
//       driver = env.builder().build();
//       driver.get('http://localhost:3000');
//       assert(driver.findElement(By.id('cheese')).getTagName()).equalTo('input');
//     });
//   });
// });


 var By = require('selenium-webdriver').By,
     until = require('selenium-webdriver').until,
     firefox = require('selenium-webdriver/firefox'),
     test = require('selenium-webdriver/testing');

 test.describe('Google Search', function() {
   var driver;

   test.before(function() {
     var webdriver = require('selenium-webdriver');
     var chrome = require('selenium-webdriver/chrome');
     var path = require('chromedriver').path;

     var service = new chrome.ServiceBuilder(path).build();
     chrome.setDefaultService(service);

     driver = new webdriver.Builder()
       .withCapabilities(webdriver.Capabilities.chrome())
       .build();
   });

   test.after(function() {
     driver.quit();
   });

   test.it('should append query to title', function() {
     driver.get('http://www.google.com/ncr');
     driver.findElement(By.name('q')).sendKeys('webdriver');
     driver.findElement(By.name('btnG')).click();
     driver.wait(until.titleIs('webdriver - Google Search'), 1000);
   });
 });
