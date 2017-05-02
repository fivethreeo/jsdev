/* eslint strict: [2, "global"] */
'use strict';

// #####################################################################################################################
// #IMPORTS#
var gulp = require('gulp');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var fs = require('fs');
var path = require('path');
var prompt = require('prompt');
var autoprefixer = require('autoprefixer');
var postcss = require('gulp-postcss');
var gulpif = require('gulp-if');
//var iconfont = require('gulp-iconfont');
//var iconfontCss = require('gulp-iconfont-css');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var minifyCss = require('gulp-clean-css');
var eslint = require('gulp-eslint');
var webpack = require('webpack');
var KarmaServer = require('karma').Server;
var integrationTests = require('djangocms-casper-helpers/gulp');

var child_process = require('child_process');
var spawn = require('child_process').spawn;

var argv = require('minimist')(process.argv.slice(2)); // eslint-disable-line

// #####################################################################################################################
// #SETTINGS#
var options = {
    debug: argv.debug
};
var PROJECT_ROOT = __dirname + '/mainapp/static';
var PROJECT_PATH = {
    js: PROJECT_ROOT + '/js',
    sass: PROJECT_ROOT + '/sass',
    css: PROJECT_ROOT + '/css',
    icons: PROJECT_ROOT + '/fonts',
    tests: __dirname + '/mainapp/tests/frontend'
};

var PROJECT_PATTERNS = {
    js: [
        PROJECT_PATH.js + '/*.js',
        PROJECT_PATH.js + '/gulpfile.js',
        PROJECT_PATH.tests + '/**/*.js',
        '!' + PROJECT_PATH.tests + '/unit/helpers/**/*.js',
        '!' + PROJECT_PATH.tests + '/coverage/**/*.js',
        '!' + PROJECT_PATH.js + '/dist/*.js'
    ],
    sass: [
        PROJECT_PATH.sass + '/**/*.{scss,sass}'
    ],
    icons: [
        PROJECT_PATH.icons + '/src/*.svg'
    ]
};

var INTEGRATION_TESTS = [
    [
        
    ],
    [
        
    ],
    [
        
    ]
];

var PROJECT_VERSION = fs.readFileSync('mainapp/__init__.py', { encoding: 'utf-8' })
    .match(/__version__ = '(.*?)'/)[1];

// #####################################################################################################################
// #TASKS#
gulp.task('sass', function () {
    gulp.src(PROJECT_PATTERNS.sass)
        .pipe(gulpif(options.debug, sourcemaps.init()))
        .pipe(sass({
          includePaths: [
            path.join(__dirname, 'node_modules', 'bootstrap-sass', 'assets', 'stylesheets'),
        ]}))
        .on('error', function (error) {
            gutil.log(gutil.colors.red('Error (' + error.plugin + '): ' + error.messageFormatted));
        })
        .pipe(postcss([
            autoprefixer({
                cascade: false
            })
        ]))
        .pipe(minifyCss({
            rebase: false
        }))
        .pipe(gulpif(options.debug, sourcemaps.write()))
        .pipe(gulp.dest(PROJECT_PATH.css + '/' + PROJECT_VERSION + '/'));
});

gulp.task('icons', function () {
    gulp.src(PROJECT_PATTERNS.icons)
    .pipe(iconfontCss({
        fontName: 'django-cms-iconfont',
        fontPath: '../../fonts/' + PROJECT_VERSION + '/',
        path: PROJECT_PATH.sass + '/libs/_iconfont.scss',
        targetPath: '../../sass/components/_iconography.scss'
    }))
    .pipe(iconfont({
        fontName: 'django-cms-iconfont',
        normalize: true
    }))
    .on('glyphs', function (glyphs, opts) {
        gutil.log.bind(glyphs, opts);
    })
    .pipe(gulp.dest(PROJECT_PATH.icons + '/' + PROJECT_VERSION + '/'));
});

gulp.task('lint', ['lint:javascript']);
gulp.task('lint:javascript', function () {
    // DOCS: http://eslint.org
    return gulp.src(PROJECT_PATTERNS.js)
        .pipe(gulpif(!process.env.CI, plumber()))
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(gulpif(process.env.CI, eslint.failAfterError()))
        .pipe(gulpif(!process.env.CI, plumber.stop()))
});

gulp.task('tests', ['tests:unit', 'tests:integration']);

// gulp tests:unit --tests=cms.base,cms.modal
gulp.task('tests:unit', function (done) {
    var server = new KarmaServer({
        configFile: PROJECT_PATH.tests + '/karma.conf.js',
        singleRun: true
    }, done);

    server.start();
});

gulp.task('tests:unit:watch', function () {
    var server = new KarmaServer({
        configFile: PROJECT_PATH.tests + '/karma.conf.js'
    });

    server.start();
});

// gulp tests:integration [--clean] [--screenshots] [--tests=loginAdmin,toolbar]
gulp.task('tests:integration', integrationTests({
    tests: INTEGRATION_TESTS,
    pathToTests: PROJECT_PATH.tests,
    argv: argv,
    dbPath: 'testdb.sqlite',
    serverCommand: 'testserver.py',
    logger: gutil.log.bind(gutil)
}));

var webpackBundle = function (opts) {
    var webpackOptions = opts || {};

    webpackOptions.PROJECT_PATH = PROJECT_PATH;
    webpackOptions.debug = options.debug;
    webpackOptions.PROJECT_VERSION = PROJECT_VERSION;

    return function (done) {
        var config = require('./webpack.config')(webpackOptions);

        webpack(config, function (err, stats) {
            if (err) {
                throw new gutil.PluginError('webpack', err);
            }
            gutil.log('[webpack]', stats.toString({ colors: true }));
            if (typeof done !== 'undefined' && (!opts || !opts.watch)) {
                done();
            }
        });
    };
};

gulp.task('bundle:watch', webpackBundle({ watch: true }));
gulp.task('bundle', webpackBundle());

gulp.task('watch', function () {
    gulp.start('bundle:watch');
    gulp.watch(PROJECT_PATTERNS.sass, ['sass']);
    gulp.watch(PROJECT_PATTERNS.js, ['lint']);
});

gulp.task('default', ['sass', 'lint', 'watch']);

gulp.task('fonts', function() {
  gulp.src([path.join(__dirname, 'bower_components', 'bootstrap', 'fonts') + '/**/*' ])
    .pipe(gulp.dest(PROJECT_PATH.icons + '/' + PROJECT_VERSION + '/'));
});

var python = /^win/.test(process.platform) ? path.join(__dirname, 'env', 'Scripts', 'python.exe') : path.join(__dirname, 'env', 'bin', 'python');
var manage = path.join(__dirname, 'manage.py');

gulp.task('serve', ['connectdjango'], function () {
  require('opn')('http://localhost:9000');
  gulp.start('watch');
});

gulp.task('connectdjango', function () {
  var command = [manage, 'runserver', '0.0.0.0:9000'];
  return spawn(python, command, {stdio: 'inherit'});
});

gulp.task('manage', function (callback) {
  prompt.start();
  prompt.get([{
    name: 'command',
    description: 'Command',
    type: 'string',
    required: true
  }], function(err, result) {
    var command = [manage].concat(result['command'].split(' '));
    return spawn(python, command, {stdio: 'inherit'});
    callback();
  });

});