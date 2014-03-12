var gulp = require('gulp'),
    less = require('gulp-less'),
    jshint = require('gulp-jshint'),
    bower = require('gulp-bower');

var paths = {
  less: [ 'sandglass/public/css/less/**/*.less' ],
  lessOut: 'sandglass/public/css',
  js: [ 'sandglass/public/js/**/*.js',
        'sandglass/public/js/*.js' ]
};

gulp.task( 'less', function() {
  gulp.src( paths.less )
    .pipe( less({
      dumpLineNumbers: 'all'
    }) )
    .pipe( gulp.dest( paths.lessOut ) );
});

gulp.task( 'jshint', function() {
  gulp.src( paths.js )
    .pipe( jshint({
      strict: true,
      indent: 2,
      latedef: true,
      newcap: true,
      noempty: true,
      plusplus: true,
      quotmark: 'single',
      undef: true,
      unused: true,
      maxlen: 80
    }) )
    .pipe( jshint.reporter( 'default' ) );
});

gulp.task( 'bower', function() {
  bower()
    .pipe( gulp.dest('sandglass/public/bower_components/') )
});

gulp.task( 'watch', function() {
  gulp.watch( paths.less, [ 'less' ] );
  gulp.watch( paths.js, [ 'jshint' ] );
});

gulp.task( 'default', [ 'watch' ] );
gulp.task( 'init', [ 'less',
                     'bower' ] );