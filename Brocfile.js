var browserify = require('broccoli-browserify');
var concat = require('broccoli-concat');
var ENV = process.env.ENVIRONMENT || 'development';

module.exports = function(broccoli) {
  var lib = broccoli.makeTree('lib');
  var test = broccoli.makeTree('test');
  var qunit = broccoli.makeTree('node_modules/qunit/support/qunit/qunit');

  var fieldKit = browserify(lib, {
    entries: ['./index'],
    outputFile: '/field-kit.js',
    bundle: { debug: false, standalone: 'FieldKit' }
  });

  var testSetup = browserify(test, {
    entries: ['./test_helper'],
    outputFile: '/test/setup.js'
  });

  var allTests = concat(test, {
    inputFiles: ['**/*_test.js'],
    outputFile: '/test/all.js'
  });

  switch (ENV) {
    case 'development':
      return [fieldKit, testSetup, allTests, test, qunit];

    case 'production':
      return [fieldKit];
  }
};
