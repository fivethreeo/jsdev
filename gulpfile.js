
var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var spawn = require('cross-spawn-async');
var prompt = require('prompt');

gulp.task('sass', function () {

  gulp.src('sass/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      style: 'compressed',
      includePaths: [ 
      path.join(__dirname, 'bower_components', 'bootstrap-sass', 'assets', 'stylesheets'),
      path.join(__dirname, 'bower_components'),
      path.join(__dirname, 'sass')
    ]}).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 3 versions'],
      cascade: false
    }))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest(path.join(__dirname, 'django',  'levangersundet', 'static')));

});

gulp.task('copy', function() {
  gulp.src(['static/**/*' ])
    .pipe(gulp.dest(path.join(__dirname, 'django',  'levangersundet', 'static')));

  gulp.src([path.join(__dirname, 'bower_components', 'bootstrap', 'fonts') + '/**/*' ])
    .pipe(gulp.dest(path.join(__dirname, 'django',  'levangersundet', 'static', 'fonts')));
});

var python = /^win/.test(process.platform) ? path.join(__dirname, 'env', 'Scripts', 'python.exe') : path.join(__dirname, 'env', 'bin', 'python');
var manage = path.join(__dirname, 'django', 'manage.py');

gulp.task('connectdjango', function () {
    var env = process.env,
        varName,
        envCopy = {DJANGO_DEV:1};

    // Copy process.env into envCopy
    for (varName in env) {
      envCopy[varName] = env[varName];
    }
    return spawn(python, [
       manage, 'runserver', 'localhost:9000'
    ], {stdio: 'inherit', env: envCopy});

});

gulp.task('manage', function () {
    var env = process.env,
        varName,
        envCopy = {DJANGO_DEV:1};

    // Copy process.env into envCopy
    for (varName in env) {
      envCopy[varName] = env[varName];
    }
    return spawn(python,
       [manage].concat(process.argv.slice(3))
    , {stdio: 'inherit', env: envCopy});

});

gulp.task('js', function (callback) {

  var requirejs = require('requirejs');

  var config = {
      baseUrl: '',
      name: 'js/main',
      include: [
        'requireLib',
        'text',
        'jquery',
        'underscore',
        'bootstrap',
        //'backbone',
        'select2'
        //,
        //'backbone-filter'
      ],
      optimize: "uglify",
      out: path.join(__dirname, 'django',  'levangersundet', 'static', 'main.js'),
      // The shim config allows us to configure dependencies for
      // scripts that do not call define() to register a module
      'shim': {
          'underscore': {
              'exports': '_'
          },
          'backbone': {
              'deps': [
                  'underscore',
                  'jquery'
              ],
              'exports': 'Backbone'
          }
      },
      'paths': {
          'jquery': 'bower_components/jquery/dist/jquery',
          'underscore': 'bower_components/underscore/underscore',
          'backbone': 'bower_components/backbone/backbone',
          'backbone-filter': 'bower_components/backbone-filtered-collection/backbone-filtered-collection',
          'bootstrap': 'bower_components/bootstrap/dist/js/bootstrap',
          'text': 'bower_components/text/text',
          'select2': 'bower_components/select2/dist/js/select2',
          'requireLib': 'bower_components/requirejs/require',
          'datetimepicker': 'bower_components/bootstrap-datetimepicker/src/js/bootstrap-datetimepicker',
          'moment': 'bower_components/moment/moment',
          'moment-nb': 'bower_components/moment/locale/nb'
      }
  };

  return requirejs.optimize(config, function (res) {
    callback();
  }, function(err) {
    console.log(err);
  });

});
gulp.task('serve', ['connectdjango'], function () {
   
    require('opn')('http://localhost:9000');
    
    gulp.watch(['./js/**/*'], ['js']);
    gulp.watch(['./less/**/*'], ['less']);
});


gulp.task('build', ['js', 'less', 'copy'], function () {
   
});

gulp.task('deploy_lambda_resource', function () {

    var config = require('./config.json');
    var format = require('string-format');
    var deploy = require(path.join(
      __dirname,
      'tools',
      'deploy'));

    return deploy(
      config.region, [config.region], function (res) {
          console.log(format(res, config.region));
      }
    );
});

gulp.task('configure', function (callback) {
  
  prompt.start();
  prompt.get([{
    name: 'project_name',
    description: 'Project name',
    type: 'string',
    required: true
  }, {
    name: 'region',
    description: 'Deploy to region',
    type: 'string',
    required: true
  }, {
    name: 'keyname',
    description: 'EC2 keypair for instance',
    type: 'string',
    required: true
  }], function(err, result) {
    fs.writeFile('./config.json', JSON.stringify(result), function(err) {
      if (err) throw err;
      console.log('config.json saved!');
      return callback();
    });
  });

});

gulp.task('deploy_full_stack', function (callback) {

    var config = require('./config.json');
    var full_deploy = require(path.join(__dirname, 'tools', 'deploy_full_stack'));
    full_deploy(config, function () {
      return callback();
    });
});
