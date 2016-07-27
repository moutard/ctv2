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
        Cotton: 'cotton'
      })
    ];
    if (IS_PROD) {
      webpack_plugins.append(new webpack.optimize.UglifyJsPlugin({minimize: true}))
    }
    grunt.initConfig({
        'pkg': grunt.file.readJSON('package.json'),
        'copy': {
           dev: {
               files: [
                   {
                       expand: true,
                       src: ['app/**'],
                       dest: DESTINATION_PATH
                   }
               ]
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
             modulesDirectories: ['node_modules', 'app'],
             alias: {
               cotton: 'js/cotton.js'
             }
           },
           plugins: webpack_plugins
         },
         woody: {
              // webpack options
              entry: DESTINATION_PATH + '/app/js/woody.js',
              output: {
                  path: DESTINATION_PATH + '/app',
                  filename: 'woody.min.js'
              }
          },
          background: {
               // webpack options
               entry: DESTINATION_PATH + '/app/js/background.js',
               output: {
                   path: DESTINATION_PATH + '/app',
                   filename: 'background.min.js'
               }
           },
           content_scripts: {
                // webpack options
                entry: DESTINATION_PATH + '/app/js/content_scripts.js',
                output: {
                    path: DESTINATION_PATH + '/app',
                    filename: 'content_scripts.min.js'
                }
            },
        }
      });


      grunt.loadNpmTasks('grunt-chrome-manifest');
      grunt.loadNpmTasks('grunt-webpack');
      grunt.loadNpmTasks('grunt-contrib-copy');

      grunt.registerTask('install', ['bower-install-simple']);
      grunt.registerTask('build', ['copy:dev', 'webpack:woody', 'webpack:background', 'webpack:content_scripts']);


};
