module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        manifest: grunt.file.readJSON('app/manifest.json'),
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
        copy: {
           dev: {
               files: [
                   {
                       expand: true,
                       cwd: "app",
                       src: ['**/*'],
                       dest: 'tmp/'
                   }
               ]
           }
       },
      chromeManifest: {
        dist: {
          options: {
            buildnumber: 'both',
            background: {
              target: 'src/background.js',
              exclude: []
            }
          },
          src: 'tmp',
          dest: 'dist',
          manifest: 'tmp/manifest.json'
        }
      },
       webpack: {
         woody: {
              // webpack options
              entry: './tmp/src/woody.js',
              output: {
                  path: './tmp',
                  filename: 'woody.min.js'
              },
              failOnError: true,
              stats: {
                  colors: true,
                  modules: true,
                  reasons: true
              },
              watch: false,
              keepalive: false
          },
          background: {
               // webpack options
               entry: './tmp/src/background.js',
               output: {
                   path: './tmp',
                   filename: 'background.min.js'
               },
               failOnError: true,
               stats: {
                   colors: true,
                   modules: true,
                   reasons: true
               },
               watch: false,
               keepalive: false
           },
           content_scripts: {
                // webpack options
                entry: './tmp/src/content_scripts.js',
                output: {
                    path: './tmp',
                    filename: 'content_scripts.min.js'
                },
                failOnError: true,
                stats: {
                    colors: true,
                    modules: true,
                    reasons: true
                },
                watch: false,
                keepalive: false
            },
        }
      });


      grunt.loadNpmTasks('grunt-bower-install-simple');
      grunt.loadNpmTasks('grunt-chrome-manifest');
      grunt.loadNpmTasks('grunt-webpack');
      grunt.loadNpmTasks('grunt-contrib-copy');



      grunt.registerTask('install', ['bower-install-simple']);
      grunt.registerTask('build', ['copy:dev', 'chromeManifest:dist', 'webpack:woody', 'webpack:background', 'webpack:content_scripts']);


};
