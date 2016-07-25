module.exports = function(grunt) {
    'use strict';

    var DESTINATION_PATH = './dist';
    var IS_PROD = (grunt.option('env') === 'prod' ? true : false);

    var compilerPackage = require('google-closure-compiler');
    compilerPackage.grunt(grunt);

    var webpack = require("webpack");

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        'bower-install-simple': {
            options: {
                color: true,
                directory: 'lib'
            },
            prod: {
                options: {
                    production: true
                }
            },
            dev: {
                options: {
                    production: false
                }
            }
        },
        'copy': {
           dev: {
               files: [
                   {
                       expand: true,
                       cwd: "app",
                       src: ['**/*'],
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
             modulesDirectories: ['./lib']
           },
           plugins: IS_PROD ? [
             new webpack.optimize.UglifyJsPlugin({minimize: true})
           ] : []
         },
         woody: {
              // webpack options
              entry: DESTINATION_PATH + '/src/woody.js',
              output: {
                  path: DESTINATION_PATH,
                  filename: 'woody.min.js'
              }
          },
          background: {
               // webpack options
               entry: DESTINATION_PATH + '/src/background.js',
               output: {
                   path: DESTINATION_PATH,
                   filename: 'background.min.js'
               }
           },
           content_scripts: {
                // webpack options
                entry: DESTINATION_PATH + '/src/content_scripts.js',
                output: {
                    path: DESTINATION_PATH,
                    filename: 'content_scripts.min.js'
                }
            },
        }
      });


      grunt.loadNpmTasks('grunt-bower-install-simple');
      grunt.loadNpmTasks('grunt-chrome-manifest');
      grunt.loadNpmTasks('grunt-webpack');
      grunt.loadNpmTasks('grunt-contrib-copy');

      grunt.registerTask('install', ['bower-install-simple']);
      grunt.registerTask('build', ['copy:dev', 'webpack:woody', 'webpack:background', 'webpack:content_scripts']);


};
