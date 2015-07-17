import { lsr, readdir, readFile, writeFile, Promise } from 'sander';
import { transform } from 'babel';
import { FileResolver, Container, formatters } from 'es6-module-transpiler';

convert('lib', 'build/lib')
  .then(() => console.log(`[es6→es5] lib → build/lib`))
  .then(() => bundle('index', ['build/lib', 'build', 'node_modules/input-sim/lib', 'node_modules/stround/lib'], 'dist/field-kit.js'))
  .then(() => console.log(`[bundle] build/lib → dist/field-kit.js`))
  .catch(error => {
    console.error(error.stack);
    throw error;
  });

convert('test', 'build/test')
  .then(() => console.log(`[es6→es5] test → build/test`))
  .then(() => findMatching('test', /_test\.js$/))
  .then(testFiles => bundle(testFiles, ['build/test', 'node_modules/input-sim/lib'], 'build/test/all.js'))
  .then(() => console.log(`[bundle] build/test → build/test/all.js`))
  .catch(error => {
    console.error(error.stack);
    throw error;
  });

/**
 * Finds all files recursively in path whose relative path matches pattern.
 *
 * @param {string} path
 * @param {RegExp} pattern
 * @returns {Promise<string[]>}
 */
function findMatching(path, pattern) {
  return lsr(path).then(all => all.filter(file => pattern.test(file)));
}

/**
 * Bundles one or more entry paths by searching paths and writing the bundle to
 * destination.
 *
 * @param {string|string[]} entry
 * @param {string[]} paths
 * @param {string} destination
 */
function bundle(entry, paths, destination) {
  const container = new Container({
    formatter: new formatters.bundle(),
    resolvers: [new FileResolver(paths)]
  });
  if (Array.isArray(entry)) {
    entry.forEach(item => container.getModule(item));
  } else {
    container.getModule(entry);
  }
  container.write(destination);
}

/**
 * Converts files in source path from ES6 to ES5, writing to destination.
 *
 * @param {string} source
 * @param {string} destination
 * @returns {Promise}
 */
function convert(source, destination) {
  return lsr(source)
    .then(files =>
      Promise.all(
        files.map(file =>
          convertES6File(
            file,
            fileReaderWithPrefix(source),
            fileWriterWithPrefix(destination)
          )
        )
      )
    ).catch(error => {
      console.error(error.stack);
      throw error;
    });
}

/**
 * Convert a single ES6 file to ES5, reading and writing as specified.
 *
 * @param {string} file
 * @param {function(string): Promise<string>} readFile
 * @param {function(string, string): Promise} writeFile
 * @returns {Promise}
 */
function convertES6File(file, readFile, writeFile) {
  return readFile(file)
    .then(compileES6)
    .then(code => writeFile(file, code));
}

/**
 * Gets a file reader which prefixes all files.
 *
 * @param {string} prefix
 * @returns {function(string): Promise<string>}
 */
function fileReaderWithPrefix(prefix) {
  return file => readFile(prefix, file);
}

/**
 * Gets a file writer which prefixes all files.
 *
 * @param {string} prefix
 * @returns {function(string, string): Promise}
 */
function fileWriterWithPrefix(prefix) {
  return (file, content) => writeFile(prefix, file, content);
}

/**
 * Compiles ES6 code to ES5 code.
 *
 * @param {string} code
 * @returns {string}
 */
function compileES6(code) {
  return transform(code, { blacklist: ['es6.modules', 'useStrict'] }).code;
}
