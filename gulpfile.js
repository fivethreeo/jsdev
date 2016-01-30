var gulp = require('gulp');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var path = require('path');
var spawn = require('cross-spawn-async');

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
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./django/testproject/static/css'));

});

gulp.task('copy', function() {
  gulp.src(['./static/**/*' ])
    .pipe(gulp.dest('./django/testproject/static/'));

  gulp.src([path.join(__dirname, 'bower_components', 'bootstrap', 'fonts') + '/**/*' ])
    .pipe(gulp.dest('./django/testproject/static/fonts'));
});

var python = /^win/.test(process.platform) ? './env/Scripts/python.exe' :  './env/bin/python';

gulp.task('connectdjango', function () {
    var env = process.env,
        varName,
        envCopy = {DJANGO_DEV:1};

    // Copy process.env into envCopy
    for (varName in env) {
      envCopy[varName] = env[varName];
    }
    return spawn(python, [
      path.join('django', 'manage.py'), 'runserver', 'localhost:9000'
    ], {stdio: 'inherit', env: envCopy});

});

gulp.task('js', function () {
    return spawn('node', [
      path.join('tools', 'r.js'), '-o', path.join('tools', 'build.js')
    ], {stdio: 'inherit'});
});

gulp.task('serve', ['connectdjango'], function () {
   
    require('opn')('http://localhost:9000');
    
    gulp.watch(['./js/**/*'], ['js']);
    gulp.watch(['./less/**/*'], ['less']);
});


gulp.task('build', ['js', 'less', 'copy'], function () {
   
});

gulp.task('deploy_resource', function () {

    var format = require('string-format');
    var deploy = require(path.join(
      __dirname,
      'node_modules',
      'cfn-elasticsearch-domain',
      'node_modules',
      'cfn-lambda',
      'deploy'));

    return deploy(
      'eu-west-1', ['eu-west-1'], function (res) {
          console.log(format(res, 'eu-west-1'));
      }
    );
});