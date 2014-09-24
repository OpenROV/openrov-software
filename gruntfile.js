module.exports = function(grunt) {
  var banner = '/*\n<%= pkg.name %> <%= pkg.version %>';
  banner += '- <%= pkg.description %>\n<%= pkg.repository.url %>\n';
  banner += 'Built on <%= grunt.template.today("yyyy-mm-dd") %>\n*/\n';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['gruntfile.js', 'src/*.js'],
      options: {
        maxlen: 120,
        quotmark: 'single'
      }
    },
    simplemocha: { // server side tests
      options: {
        globals: ['should'],
        timeout: 3000,
        ignoreLeaks: false,
        ui: 'bdd',
        reporter: 'tap'
      },
      all: { src: [
        'src/*plugins/**/tests/*.js',
        'src/tests/**/*.js'
      ]}
    },
    mocha: { // client side
      test: {
        src: ['src/*plugins/**/public/tests/*.html']
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-mocha');

  grunt.registerTask('default',
    ['jshint', 'simplemocha', 'mocha']);
};