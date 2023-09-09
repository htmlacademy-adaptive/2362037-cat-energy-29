import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import { deleteAsync } from 'del';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';

// Styles

export const styles = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

//Images

// Images

const optimizeImages = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
  .pipe(squoosh())
  .pipe(gulp.dest('build/img'))
}

const copyImages = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
  .pipe(gulp.dest('build/img'))
}

// WebP

const createWebp = () => {
  return gulp.src('source/img/**/*.{png,jpg}', '!source/img/favicons/*.png')
  .pipe(squoosh({
  webp: {}
  }))
  .pipe(gulp.dest('build/img'))
}

//SVG

const svg = () =>
gulp.src(['source/img/*.svg', '!source/img/icons/*.svg'])
.pipe(svgo())
.pipe(gulp.dest('build/img'));

//Copy

const copy = (done) => {
  gulp.src([
    'source/fonts/**/*.{woff2,woff}',
    'source/img/favicons/*.png',
    'source/img/favicons/favicon.svg',
    'source/img/favicons/manifest.json',
    'source/*.ico',
    'source/js/*.js',
    'source/*.html',
    'source/img/sprite.svg'
  ], {
    base: 'source'
  })
  .pipe(gulp.dest('build'))
  done();
}

//Clean

export const clean = () => {
  return deleteAsync('build');
};

// Server

export const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Reload

const reload = (done) => {
  browser.reload();
  done();
  }

// Watcher

export const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/*.html').on('change', browser.reload);
}

//Build

export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    createWebp,
    svg
  )
);

//Default

export default gulp.series(
  clean,
  copy,
  gulp.parallel(
    styles,
    createWebp,
    svg
  ),
  gulp.series(
    server,
    watcher
));
