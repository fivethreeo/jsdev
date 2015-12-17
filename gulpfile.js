var gulp = require('gulp');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var ghPages = require('gulp-gh-pages');
var jade = require('gulp-jade');
var path = require('path');

gulp.task('less', function () {
  var LessPluginCleanCSS = require("less-plugin-clean-css"),
      cleancss = new LessPluginCleanCSS({advanced: true});
  
  var LessPluginAutoPrefix = require('less-plugin-autoprefix'),
      autoprefix= new LessPluginAutoPrefix({browsers: ["last 3 versions"]});
  
  
  gulp.src('./less/*.less')
    .pipe(sourcemaps.init())
    .pipe(less({
      paths: [ path.join(__dirname, 'bower_components') ],
      plugins: [autoprefix, cleancss]
     }))
    .pipe(sourcemaps.write('./django/static/css/maps'))
    .pipe(gulp.dest('./django/static/css'));

});

gulp.task('copy', function() {
  gulp.src(['./CNAME', './static/**/*' ])
    .pipe(gulp.dest('./django/static/img/'))
  gulp.src([path.join(__dirname, 'bower_components', 'video.js') + '/**/*' ])
    .pipe(gulp.dest('./django/static/video.js'))
});
 

var python = /^win/.test(process.platform) ? './env/Scripts/python.exe' :  './env/bin/python';
var sep = /^win/.test(process.platform) ? '/' :  '\\';
gulp.task('connectdjango', function () {

    return spawn(python, [
      'django' + sep + 'manage.py',
      'runserver',
      'localhost:9000',
      '--insecure'
    ], {stdio: 'inherit'})

});
gulp.task('js', function () {
    return spawn('node', [
      'tools' + sep + 'r.js',
      '-o',
      'tools' + sep + 'build.js'
    ], {stdio: 'inherit'})

});
gulp.task('serve', ['connectdjango'], function () {
   
    require('opn')('http://localhost:9000');
    
    gulp.watch(['./js/**/*'], ['js']);
    gulp.watch(['./less/**/*'], ['less']);
});


gulp.task('build', ['js', 'less'], function () {
   
});