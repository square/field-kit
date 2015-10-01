import babel from 'gulp-babel';
import babelify from 'babelify';
import browserify from 'browserify';
import buffer from 'vinyl-buffer';
import ghPages from 'gulp-gh-pages';
import gulp from 'gulp';
import derequire from 'gulp-derequire';
import gutil from 'gulp-util';
import ifElse from 'gulp-if-else';
import print from 'gulp-print';
import rimraf from 'rimraf';
import source from 'vinyl-source-stream';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';

function dist(minified) {
  return browserify({entries: 'src/index.js', standalone: 'FieldKit'})
    .transform(babelify)
    .bundle()
    .pipe(source(minified ? 'field-kit.min.js' : 'field-kit.js'))
    .pipe(derequire())
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(ifElse(minified, uglify))
      .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist'));
}

gulp.task('clean:lib', done => rimraf('./lib', done));
gulp.task('clean:dist', done => rimraf('./dist', done));

gulp.task('dist:not-minified', ['clean:dist'], () => dist(false));
gulp.task('dist:minified', ['clean:dist'], () => dist(true));
gulp.task('dist', ['dist:not-minified', 'dist:minified']);

gulp.task('gh-pages', ['build'], function () {
  return gulp.src(['public/**/*'])
    .pipe(print())
    .pipe(ghPages());
});

gulp.task('move-fk-to-public', function() {
  return gulp.src('dist/field-kit.js')
    .pipe(gulp.dest('public/javascript'));
});

gulp.task('lib', ['clean:lib'], function () {
  return gulp.src(['src/**/*.js', '!src/index.js'])
    .pipe(babel())
    .pipe(gulp.dest('lib'));
});

gulp.task('build', ['lib', 'dist', 'move-fk-to-public']);
gulp.task('default', ['build']);
