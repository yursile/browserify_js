var gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    uglyfly = require('gulp-uglyfly'),
    cssmin = require('gulp-cssmin'),
    htmlmin = require('gulp-htmlmin'),
    less = require('gulp-less'),
    concat = require('gulp-concat'),
    path = require('path'),
    rename = require('gulp-rename'),
    LessPluginCleanCSS = require('less-plugin-clean-css'),
    LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    connect = require('gulp-connect'),
    cleancss = new LessPluginCleanCSS({
      advanced: true
    }),
    autoprefix = new LessPluginAutoPrefix({
      browsers: ["ie >= 8", "ie_mob >= 10", "ff >= 26", "chrome >= 30", "safari >= 6", "opera >= 23", "ios >= 5", "android >= 2.3", "bb >= 10"]
    }),
    browserify = require('browserify'),
    buffer = require("vinyl-buffer");

gulp.task('less', function() {
  gulp.src('./app/less/*.less')
    .pipe(less({
      plugins: [autoprefix, cleancss],
      paths: [path.join(__dirname, 'less', 'includes')]
    }))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('js',function(){
  gulp.src('./public/js/bundle.min.js')
  .pipe( connect.reload() )
})
gulp.task('html',function(){
  gulp.src('./index.html')
  .pipe( connect.reload() )
});
gulp.task('css',function(){
  gulp.src('./public/css/*.css')
  .pipe( connect.reload() )
});

gulp.task("reload",function(){
   gulp.src(['./public/css/*.css','./public/index.html','./public/js/bundle.min.js'])
   .pipe(connect.reload());
});

gulp.task('connect',function(){
  connect.server({
    port: 5000,
    livereload: true
  });
});

gulp.task('browserify', function() {
  browserify('./app/js/index.js')
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest('./public/js/'))
    
});


gulp.task('concat',function(){
  gulp.src(['app/js/*.js'])
  .pipe(concat("bundle.js"))
  .pipe(gulp.dest("public/js"))
});

gulp.task('watch', function() {
  gulp.watch('./app/less/*.less', ['less']);
  gulp.watch('./app/js/**/*.js',['browserify']);
  gulp.watch(['./public/css/*.css','./public/js/bundle.min.js','./public/index.html'],['reload']);
});

gulp.task("htmlmin",function(){
  gulp.src('./index.html').
  pipe(htmlmin({collapseWhitespace: true})).
  pipe(rename({suffix:'.min'})).
  pipe(gulp.dest('./public'))
});

gulp.task("cssmin",function(){
  gulp.src(['./public/css/*.css','!./public/css/*.min.css']).
  pipe(cssmin()).
  pipe(rename({suffix: '.min'})).
  pipe(gulp.dest('./public/css'))
});

gulp.task("uglyfly",function(){
  gulp.src(['./public/js/bundle.js']).
  pipe(uglyfly()).
  pipe(rename({suffix: '.min'})).
  pipe(gulp.dest('./public/js'))
});



gulp.task("online",['htmlmin','cssmin','uglyfly']);

gulp.task('serve',['less','browserify','connect','online','watch']);

gulp.task('default', ['less','browserify','watch']);
