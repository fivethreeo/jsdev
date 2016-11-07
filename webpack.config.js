var webpack = require('webpack');

module.exports = function (opts) {
    'use strict';

    var PROJECT_PATH = opts.PROJECT_PATH;
    var PROJECT_VERSION = opts.PROJECT_VERSION;
    var debug = opts.debug;

    var baseConfig = {
        devtool: false,
        watch: !!opts.watch,
        entry: {
            'main': PROJECT_PATH.js + '/main.js'
        },
        output: {
            path: PROJECT_PATH.js + '/dist/' + PROJECT_VERSION + '/',
            filename: 'bundle.[name].min.js',
            chunkFilename: 'bundle.[name].min.js',
            jsonpFunction: 'webpackJsonp'
        },
        plugins: [
             /*
            // this way admin.pagetree bundle won't
            // include deps already required in admin.base bundle
            new webpack.optimize.CommonsChunkPlugin({
                name: 'admin.base',
                chunks: [
                    'admin.pagetree',
                    'admin.changeform'
                ]
            })
            */
        ],
        resolve: {
            extensions: ['', '.js'],
            alias: {/*
                jquery: PROJECT_PATH.js + '/libs/jquery.min.js',
                classjs: PROJECT_PATH.js + '/libs/class.min.js',
                jstree: PROJECT_PATH.js + '/libs/jstree/jstree.min.js'
            */}
        },
        module: {/*
            loaders: [
                {
                    test: /(modules\/jquery|libs\/pep|select2\/select2)/,
                    loaders: [
                        'imports?jQuery=jquery'
                    ]
                },
                {
                    test: /class.min.js/,
                    loaders: [
                        'exports?Class'
                    ]
                },
                {
                    test: /.html$/,
                    loaders: [
                        'raw'
                    ]
                }
            ]
        */}
    };

    if (debug) {
        baseConfig.devtool = 'inline-source-map';
        baseConfig.plugins = baseConfig.plugins.concat([
            new webpack.NoErrorsPlugin(),
            new webpack.DefinePlugin({
                __DEV__: 'true'
            })
        ]);
    } else {
        baseConfig.plugins = baseConfig.plugins.concat([
            new webpack.DefinePlugin({
                __DEV__: 'false'
            }),
            new webpack.optimize.OccurenceOrderPlugin(),
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin({
                comments: false,
                compressor: {
                    drop_console: true // eslint-disable-line
                }
            })
        ]);
    }

    return baseConfig;
};
