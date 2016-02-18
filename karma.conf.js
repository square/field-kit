module.exports = function(config) {
  var babelify = require('babelify');

  config.set({
    basePath   : '',
    frameworks : ['browserify', 'mocha', 'chai'],
    reporters  : ['mocha'],
    port       : process.env.KARMA_PORT || 2000,
    browsers   : process.env.CONTINUOUS_INTEGRATION ? ['Firefox'] : ['Chrome'],

    files: [
      'src/index.js',
      'test/unit/**/*_test.js'
    ],

    preprocessors: {
      'src/**/*.js': ['eslint', 'browserify'],
      'test/unit/**/*.js': ['browserify']
    },

    eslint: {
      stopOnError: false
    },

    browserify: {
      debug: true,
      transform: [babelify]
    }
  });
};
