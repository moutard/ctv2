module.exports = function(grunt) {
    'use strict';

    // We build the app in the dist folder.
    var DESTINATION_PATH = './dist';

    // We minify the app if prod env.
    var IS_PROD = (grunt.option('env') === 'prod' ? true : false);

    var compilerPackage = require('google-closure-compiler');
    compilerPackage.grunt(grunt);

    var webpack = require("webpack");
    var webpack_plugins = [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            '_': 'underscore',
            Cotton: 'cotton'
        }),
        new webpack.DefinePlugin({
            'DEBUG': true
        })
    ];
    if (IS_PROD) {
        webpack_plugins.append(new webpack.optimize.UglifyJsPlugin({minimize: true}))
    }
    grunt.initConfig({
        'pkg': grunt.file.readJSON('package.json'),
        'copy': {
            html: {
                files: [{
                    expand: true,
                    src: ['app/woody.html', 'app/lightyear.html', 'app/manifest.json', 'app/media/images/**', 'app/media/fonts/**', 'app/_locales/**'],
                    dest: DESTINATION_PATH
                }]
            },
            media: {
                files: [{
                    expand: true,
                    //cwd: 'node_modules/',
                    src: ['node_modules/font-awesome/fonts/**'],
                    dest: DESTINATION_PATH + '/app/media'
                }]
            }
        },
        'webpack': {
            options: {
                failOnError: true,
                stats: {
                    colors: true,
                    modules: true,
                    reasons: true
                },
                watch: false,
                keepalive: false,
                resolve: {
                    modulesDirectories: ['node_modules', 'app/js'],
                    alias: {
                        cotton: 'cotton.js'
                    }
                },
                plugins: webpack_plugins,
                module: {
                    loaders: [
                        // https://github.com/webpack/html-loader - Bundle HTML templates with the app
                        // :: ATTENTION :: DO NOT USE ng-include anywhere in the templates because it will not work.
                        // :: Just create a custom directive and use that!
                        { test: /\.html$/, loader: 'html'},
                        { test: /\.scss$/, loaders: ['style', 'css', 'sass']}
                    ]
                },
            },
            woody: {
              // webpack options
              entry: './app/js/woody.js',
              output: {
                  path: DESTINATION_PATH + '/app',
                  filename: 'woody.min.js'
              }
            },
            background: {
               // webpack options
               entry: './app/js/background.js',
               output: {
                   path: DESTINATION_PATH + '/app',
                   filename: 'background.min.js'
               }
            },
            content_scripts: {
                // webpack options
                entry: './app/js/content_scripts.js',
                output: {
                    path: DESTINATION_PATH + '/app',
                    filename: 'content_scripts.min.js'
                }
            },
            worker_dbscan2: {
              // webpack options
              entry: './app/js/algo/dbscan2/worker_dbscan2.js',
              output: {
                  path: DESTINATION_PATH + '/app',
                  filename: 'worker_dbscan2.min.js'
              }
            },
            worker_dbscan3: {
              // webpack options
              entry: './app/js/algo/dbscan3/worker_dbscan3.js',
              output: {
                  path: DESTINATION_PATH + '/app',
                  filename: 'worker_dbscan3.min.js'
              }
            }
        },
        'sass': {
          options : {
              includePaths: ['node_modules'],
              style: 'expanded',
              trace: true
          },
          dist: {
            files: {
              './dist/app/main.min.css': './app/media/main.scss'
            }
          }
        }
    });


    grunt.loadNpmTasks('grunt-chrome-manifest');
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-sass');

    grunt.registerTask('compile-sass', ['sass']);
    grunt.registerTask('install', ['bower-install-simple']);
    grunt.registerTask('build', ['copy:html', 'copy:media', 'webpack:woody', 'webpack:background', 'webpack:content_scripts', 'webpack:worker_dbscan2', 'webpack:worker_dbscan3', 'compile-sass']);

};
