import concat from 'gulp-concat';
import ghPages from 'gulp-gh-pages';
import gulp from 'gulp';
import print from 'gulp-print';
import rimraf from 'rimraf';
import uglify from 'gulp-uglify';
import { rollup } from 'rollup-babel';

gulp.task('clean:lib', done => rimraf('./lib', done));
gulp.task('clean:dist', done => rimraf('./dist', done));

gulp.task('dist', ['dist:not-minified', 'dist:minified']);
gulp.task('dist:not-minified', ['clean:dist'], () =>
  rollup({
    entry: 'src/index.js',
    babel: { loose: ['es6.spread', 'es6.parameters', 'es6.destructuring'] }
  }).then(result =>
    result.write({
      dest: 'dist/field-kit.js',
      format: 'umd',
      moduleName: 'FieldKit'
    })
  ));
gulp.task('dist:minified', ['dist:not-minified'], () =>
  gulp.src('dist/field-kit.js')
    .pipe(concat('field-kit.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist')));

gulp.task('gh-pages', () =>
  gulp.src(['**/*', '!node_modules/**'])
    .pipe(print())
    .pipe(ghPages()));

gulp.task('build', ['dist']);
gulp.task('default', ['build']);
