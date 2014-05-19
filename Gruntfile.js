module.exports = function(grunt) {
  grunt.initConfig({
    // Tell QUnit where to find the page with field-kit.js and tests.
    qunit: {
      all: {
        options: {
          urls: [
            'http://0.0.0.0:<%= connect.test.options.port %>/test'
          ]
        }
      }
    },

    // Serve assets built by broccoli for the QUnit runner.
    connect: {
      test: {
        options: {
          port: process.env.PORT || 8000,
          base: '.'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('default', ['test']);
  grunt.registerTask('test', ['connect:test', 'qunit']);
};
