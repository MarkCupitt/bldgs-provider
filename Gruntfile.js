module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        separator: '\n',
//        banner:   '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd hh:ii:ss") %> */\n'+
        banner:
          '(function(window) { \'use strict\'\n',
        footer: '\n  window.BLDGS = BLDGS;\n}(this));'
      },
      dist: {
        src: grunt.file.readJSON('files.json'),
        dest:  'dist/BLDGS.debug.js'
      }
    },

    uglify: {
      options: {},
      build: {
        src: 'dist/BLDGS.debug.js',
        dest: 'dist/BLDGS.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', 'Development build', function() {
    grunt.log.writeln(grunt.template.date(new Date(), 'yyyy-mm-dd HH:MM:ss'));
    grunt.task.run('concat');
  });

  grunt.registerTask('release', 'Development build', function() {
    grunt.log.writeln(grunt.template.date(new Date(), 'yyyy-mm-dd HH:MM:ss'));
    grunt.task.run('concat');
    grunt.task.run('uglify');
  });
};
