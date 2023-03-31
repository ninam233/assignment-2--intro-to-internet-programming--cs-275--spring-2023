const { src, dest, series, parallel, watch } = require('gulp');
const stylelint = require('gulp-stylelint');
const babel = require('gulp-babel');
const htmlmin = require('gulp-htmlmin');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const eslint = require('gulp-eslint');
const browserSync = require('browser-sync').create();

let browserType = 'chrome';

function compileCssDev() {
  return src('src/styles/*.css')
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(dest('temp/styles'));
}

function lintJs() {
  return src('src/js/*.js')
    .pipe(eslint())
    .pipe(eslint.format('stylish'));
}

function lintCss() {
  return src('styles/main.css')
    .pipe(stylelint({
    failAfterError: false,
      reporters: [
        { formatter: 'string', console: true },
      ]}))
      .pipe(dest('temp/css'));
};

function transpileJsDev() {
  return src('src/js/*.js')
    .pipe(babel())
    .pipe(dest('temp/js'));
}

function compressHtml() {
  return src('src/**/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest('prod'));
}

function compileCssProd() {
  return src('src/styles/*.css')
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(dest('prod/styles'));
}

function transpileJsProd() {
  return src('src/js/*.js')
    .pipe(babel())
    .pipe(uglify())
    .pipe(dest('prod/js'));
}

function copyAssetsDev() {
  return src([
    'src/img/**/*', // Include all images,
    'src/json/**/*.json', // and all JSON files,
    'src/index.html', // index.html
  ], { dot: true })
    .pipe(dest('temp'));
}

function copyAssetsProd() {
  return src([
    'src/img/**/*', // Include all images,
    'src/json/**/*.json', // and all JSON files,
  ], { dot: true })
    .pipe(dest('prod'));
}

function serve() {
  browserSync.init({
    notify: true,
    reloadDelay: 50,
    browser: browserType,
    server: {
      baseDir: 'temp',
    },
  });

  watch('src/js/*.js', series(lintJs, transpileJsDev))
    .on('change', browserSync.reload);

  watch('src/styles/*.css', series(lintCss, compileCssDev))
    .on('change', browserSync.reload);

  watch('src/index.html')
    .on('change', browserSync.reload);
}

exports.dev = series(
  copyAssetsDev,
  parallel(lintCss, lintJs),
  parallel(compileCssDev, transpileJsDev),
  serve,
);

exports.build = series(
  compressHtml,
  parallel(compileCssProd, transpileJsProd),
  copyAssetsProd
);
