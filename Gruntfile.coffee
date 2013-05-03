module.exports = (grunt) ->
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

    jasmine_node:
      specNameMatcher: '_spec'
      projectRoot: '.'
      requirejs: false
      extensions: 'js|coffee'
      forceExit: true
      jUnit:
        report: false
        savePath : './build/reports/jasmine/'
        useDotNotation: true
        consolidate: true

    browserify:
      compile:
        src: 'lib/index.js'
        dest: 'field-kit.js'
        options:
          standalone: 'FieldKit'

    uglify:
      'field-kit.min.js': [ 'field-kit.js' ]

  grunt.loadNpmTasks 'grunt-jasmine-node'
  grunt.loadNpmTasks 'grunt-coffeelint'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-browserify'
  grunt.registerTask 'default', ['coffeelint', 'coffee', 'jasmine_node', 'browserify', 'uglify']
