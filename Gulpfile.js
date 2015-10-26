var Gulp = require('gulp'),
    BrowserSync = require('browser-sync');

Gulp.task('server:start', function (cb) {
  return BrowserSync({
    port: 666,
    server: {
      baseDir: 'src'
    }
  }, cb);
});
Gulp.task('server:stop', function () {
  return BrowserSync.exit();
});
