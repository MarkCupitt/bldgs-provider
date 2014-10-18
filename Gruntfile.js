module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        separator: '\n',
        banner: 'var BLDGS = (function(window) { \'use strict\';\n\n',
        footer: '\nreturn BLDGS; }(this));'
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
    grunt.log.writeln('\033[1;36m'+ grunt.template.date(new Date(), 'yyyy-mm-dd HH:MM:ss') +'\033[0m');
    grunt.task.run('concat');
  });

  grunt.registerTask('release', 'Release build', function() {
    grunt.log.writeln('\033[1;36m'+ grunt.template.date(new Date(), 'yyyy-mm-dd HH:MM:ss') +'\033[0m');
    grunt.task.run('concat');
    grunt.task.run('uglify');
  });
};
