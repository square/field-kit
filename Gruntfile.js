module.exports = function(grunt) {
  var browserify = require('browserify-middleware');

  grunt.initConfig({
    browserify: {
      compile: {
        src: 'lib/index.js',
        dest: 'field-kit.js',
        options: {
          standalone: 'FieldKit',
          debug: false
        }
      }
    },

    uglify: {
      'field-kit.min.js': [ 'field-kit.js' ]
    },

    qunit: {
      all: {
        options: {
          urls: [
            'http://localhost:<%= connect.test.options.port %>/test'
          ]
        }
      }
    },

    connect: {
      test: {
        options: {
          port: process.env.PORT || 8000,
          base: '.',
          middleware: function(connect, options, middlewares) {
            var lib = browserify('./lib/index.js', grunt.config.get('browserify.compile.options'));
            var setup = browserify('./test/test_helper.js', { debug: false });

            middlewares.push(function(req, res, next) {
              switch (req.url) {
                case '/test/setup.js':
                  setup(req, res, next);
                  break;

                case '/test/all.js':
                  res.writeHead(200, { 'Content-Type': 'application/javascript' });
                  grunt.file.expand('test/**/*_test.js').forEach(function(path) {
                    res.write(grunt.file.read(path));
                  });
                  res.end();
                  break;

                case '/lib/field-kit.js':
                  lib(req, res, next);
                  break;

                default:
                  next();
                  break;
              }
            });

            return middlewares;
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.registerTask('default', ['test']);
  grunt.registerTask('test', ['browserify', 'connect:test', 'qunit', 'uglify']);
  grunt.registerTask('develop', ['connect:test:keepalive']);
};
