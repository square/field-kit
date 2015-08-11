module.exports = function(config) {
  config.set({
    basePath   : '',
    frameworks : ['browserify', 'mocha', 'chai'],
    reporters  : ['mocha'],
    port       : process.env.KARMA_PORT || 2000,
    browsers   : ['Chrome'],

    files: [
      'src/index.js',
      'test/unit/**/*_test.js'
    ],

    preprocessors: {
      'src/**/*.js': ['eslint', 'browserify'],
      'test/unit/**/*.js': ['browserify']
    },

    eslint: {
      stopOnError: true
    },

    browserify: {
      debug: true
    }
  });
};
