import concat from 'gulp-concat';
import ghPages from 'gulp-gh-pages';
import gulp from 'gulp';
import print from 'gulp-print';
import rimraf from 'rimraf';
import uglify from 'gulp-uglify';
import { rollup } from 'rollup-babel';

function dist() {
  return rollup({
    entry: 'src/index.js',
    babel: { loose: ['es6.spread', 'es6.parameters', 'es6.destructuring'] }
  }).then(result =>
    result.write({
      dest: 'dist/field-kit.js',
      format: 'umd',
      moduleName: 'FieldKit'
    })
  );
}

function minify() {
  return gulp.src('dist/field-kit.js')
    .pipe(concat('field-kit.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
}

gulp.task('clean:lib', done => rimraf('./lib', done));
gulp.task('clean:dist', done => rimraf('./dist', done));

gulp.task('dist', ['dist:not-minified', 'dist:minified']);
gulp.task('dist:not-minified', ['clean:dist'], dist);
gulp.task('dist:minified', ['dist:not-minified'], minify);

gulp.task('gh-pages', function () {
  return gulp.src(['**/*', '!node_modules/**'])
    .pipe(print())
    .pipe(ghPages());
});

gulp.task('build', ['dist']);
gulp.task('default', ['build']);
