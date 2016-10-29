
var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var spawn = require('cross-spawn-async');
var prompt = require('prompt');
var requirejs = require('requirejs');
var _ = require('lodash');

var rjs = function(opts, cb) {
  return requirejs.optimize(opts, function (res) {
    cb();
  }, function(err) {
    console.log(err);
  });
};

var staticdir = path.join(__dirname, 'django',  'mainapp', 'static');

var paths = {
  'jquery': 'bower_components/jquery/dist/jquery',
  'underscore': 'bower_components/underscore/underscore',
  'backbone': 'bower_components/backbone/backbone',
  'backbone-filter': 'bower_components/backbone-filtered-collection/backbone-filtered-collection',
  'bootstrap': 'bower_components/bootstrap/dist/js/bootstrap',
  'text': 'bower_components/text/text',
  'select2': 'bower_components/select2/dist/js/select2',
  'requireLib': 'bower_components/requirejs/require',
  'datetimepicker': 'bower_components/bootstrap-datetimepicker/src/js/bootstrap-datetimepicker',
  'moment': 'bower_components/moment/min/moment-with-locales',
  'modernizr': 'bower_components/modernizr/modernizr'
};
var shim = {
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
};
var defaultConfig = {
  baseUrl: '',
  optimize: "uglify",
  // The shim config allows us to configure dependencies for
  // scripts that do not call define() to register a module
  shim: shim,
  paths: paths
};

gulp.task('sass', function () {

  gulp.src('sass/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      //style: 'compressed',
      includePaths: [
      path.join(__dirname, 'sass'),
      path.join(__dirname, 'bower_components', 'bootstrap-sass', 'assets', 'stylesheets'),
      path.join(__dirname, 'bower_components')
    ]}).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 3 versions'],
      cascade: false
    }))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest(path.join(staticdir, 'css')));

});

gulp.task('copy', function() {
  gulp.src(['static/**/*' ])
    .pipe(gulp.dest(staticdir));

  gulp.src([path.join(__dirname, 'bower_components', 'bootstrap', 'fonts') + '/**/*' ])
    .pipe(gulp.dest(path.join(staticdir, 'fonts')));
});

gulp.task('js', function (callback) {
  var optimize = "uglify";
  // optimize = "none";
  var config = _.cloneDeep(defaultConfig);
  config.name = 'js/main';
  config.optimize = optimize,
  config.include = [
    'requireLib',
    'text',
    'jquery',
    'underscore',
    'bootstrap',
     //'backbone',
    'select2' // ,
    //'backbone-filter'
  ];
  config.out = path.join(staticdir, 'js', 'main.js');
      
  return rjs(config, callback)
});

gulp.task('modernizr', function (callback) {
  var optimize = "uglify";
  // optimize = "none";
  var config = _.cloneDeep(defaultConfig);
  config.name = paths.modernizr;
  config.optimize = optimize;
  config.out = path.join(staticdir, 'js', 'modernizr.js');

  return rjs(config, callback)
});

gulp.task('build', ['js', 'modernizr', 'sass', 'copy'], function () {
   
});

var python = /^win/.test(process.platform) ? path.join(__dirname, 'env', 'Scripts', 'python.exe') : path.join(__dirname, 'env', 'bin', 'python');
var manage = path.join(__dirname, 'django', 'manage.py');

gulp.task('serve', ['connectdjango'], function () {
   
    require('opn')('http://localhost:9000');
    
    gulp.watch(['./js/**/*'], ['js']);
    gulp.watch(['./sass/**/*'], ['sass']);
});


gulp.task('connectdjango', function () {
    var env = process.env,
        varName,
        envCopy = {DJANGO_DEV:1};

    // Copy process.env into envCopy
    for (varName in env) {
      envCopy[varName] = env[varName];
    }
    return spawn(python, [
       manage, 'runserver', '0.0.0.0:9000'
    ], {stdio: 'inherit', env: envCopy});

});

gulp.task('manage', function (callback) {
  prompt.start();
  prompt.get([{
    name: 'command',
    description: 'Command',
    type: 'string',
    required: true
  }], function(err, result) {
    
  var env = process.env,
        varName,
        envCopy = {DJANGO_DEV:1};

    // Copy process.env into envCopy
    for (varName in env) {
      envCopy[varName] = env[varName];
    }
    return spawn(python,
       [manage].concat(result['command'].split(' '))
    , {stdio: 'inherit', env: envCopy});
    callback();
  });

});
