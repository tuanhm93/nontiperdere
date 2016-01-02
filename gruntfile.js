module.exports = function(grunt) {
 grunt.initConfig({
     concat: {
        gopcss: {
           src: [
              'css/bootstrap.css',
              'css/style.css',
           ],
           dest: 'css/nam.css'
        },
        
        gopjs: {
           src: [
              './index.js',
              './accountmanagement.js',
              
           ],
           dest: './app.js'
        },
     },
     cssmin: {
        nencss: {
           src: 'css/nam.css',
           dest: 'css/nam.min.css'
        },
        
     },
     uglify: {
        nenjs: {
           src: 'js/nam.js',
           dest: 'js/nam.min.js',
        }
     }
 });

 grunt.loadNpmTasks('grunt-contrib-concat');
 grunt.loadNpmTasks('grunt-contrib-cssmin');
 grunt.loadNpmTasks('grunt-contrib-uglify');

 grunt.registerTask('default', ['concat', 'cssmin', 'uglify']);
};