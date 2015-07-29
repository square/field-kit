var By = require('selenium-webdriver').By,
    expect = require('chai').expect,
    seleniumAssert = require('selenium-webdriver/testing/assert'),
    test = require('selenium-webdriver/lib/test');

var buildField = require('./test/helpers/builders').buildField;
var buildInput = require('./test/helpers/builders').buildInput;
var PassthroughFormatter = require('./test/helpers/passthrough_formatter');

var ENVS = ['js', 'firefox'];

global.Caret = require('./node_modules/jquery-caret/jquery.caret');
global.FieldKit = require('./dist/field-kit');


ENVS.forEach(function(env) {
  console.log('tests for ' + env);
  if(env === 'js') {
    describe('my js test', function() {
      it('allows setting the formatter', function() {
        var formatter = new PassthroughFormatter();
        var field = buildField({ formatter: formatter });
        expect(field.formatter()).to.equal(formatter);
      });
    });
  } else {
    test.suite(function(env) {
      var driver;
      test.after(function() { driver.quit(); });

      test.it('should return lower case tag name', function() {
        driver = env.builder().build();
        driver.get(test.Pages.formPage);
        seleniumAssert(driver.findElement(By.id('cheese')).getTagName()).equalTo('input');
      });
    });
  }
});

// test.suite(function(env) {
//   describe('testing this', function() {
//     var driver;
//     test.after(function() { driver.quit(); });

//     test.it('should return lower case tag name', function() {
//       driver = env.builder().build();
//       driver.get(test.Pages.formPage);
//       assert(driver.findElement(By.id('cheese')).getTagName()).equalTo('input');
//     });
//   });
// });
