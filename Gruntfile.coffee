module.exports = (grunt) ->
  browserify = require 'browserify-middleware'

  grunt.initConfig
    coffeelint:
      app: ['src/**/*.coffee']
      specs: ['spec/**/*.coffee']
      options: grunt.file.readJSON('.coffeelint.json')

    coffee:
      compile:
        expand: yes
        cwd: 'src'
        src: ['**/*.coffee']
        dest: 'lib'
        ext: '.js'

    browserify:
      compile:
        src: 'lib/index.js'
        dest: 'field-kit.js'
        options:
          standalone: 'FieldKit'
          debug: false

    uglify:
      'field-kit.min.js': [ 'field-kit.js' ]

    qunit:
      all:
        options:
          urls: [
            'http://localhost:<%= connect.test.options.port %>/test'
          ]

    connect:
      test:
        options:
          port: process.env.PORT || 8000
          base: '.'
          middleware: (connect, options, middlewares) ->
            lib = browserify './lib/index.js', grunt.config.get('browserify.compile.options')
            setup = browserify './test/test_helper.js', debug: false

            middlewares.push (req, res, next) ->
              switch req.url
                when '/test/setup.js'
                  setup(req, res, next)

                when '/test/all.js'
                  res.writeHead(200, { 'Content-Type': 'application/javascript' })
                  grunt.file.expand('test/**/*_test.js').forEach (path) ->
                    res.write(grunt.file.read(path))
                  res.end()

                when '/lib/field-kit.js'
                  lib(req, res, next)

                else
                  next()

            return middlewares

  grunt.loadNpmTasks 'grunt-coffeelint'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-connect'
  grunt.loadNpmTasks 'grunt-contrib-qunit'
  grunt.loadNpmTasks 'grunt-browserify'
  grunt.registerTask 'default', ['test']
  grunt.registerTask 'test', ['coffeelint', 'coffee', 'browserify', 'connect:test', 'qunit', 'uglify']
  grunt.registerTask 'develop', ['connect:test:keepalive']
