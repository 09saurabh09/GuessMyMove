var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var forever = require('forever-monitor');

gulp.task('default', function() {
    nodemon({
        script: 'app.js',
        ext: 'js',
        ignore: ['./node_modules/**']
    })
    .on('restart', function() {
        console.log('restarting...');
    });
});

gulp.task('server', function () {
    new forever.Monitor('app.js').start();
});

