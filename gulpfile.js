"use strict";

var gulp = require("gulp");
var browserSync = require("browser-sync").create();
var sass = require("gulp-sass");
var del = require("del");
var replace = require("gulp-replace");
var injectPartials = require("gulp-inject-partials");
var inject = require("gulp-inject");
var sourcemaps = require("gulp-sourcemaps");
var concat = require("gulp-concat");
var merge = require("merge-stream");

gulp.task("sass", function() {
  return gulp
    .src("./static/scss/style.scss")
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
    .pipe(sourcemaps.write("./maps"))
    .pipe(gulp.dest("./static/css"))
    .pipe(browserSync.stream());
});

// Static Server + watching scss/html files
gulp.task(
  "serve",
  gulp.series("sass", function() {
    browserSync.init({
      port: 3001,
      server: "./",
      ghostMode: false,
      notify: false
    });

    gulp.watch("**/scss/**/*.scss", gulp.series("sass"));
    gulp.watch("**/*.html").on("change", browserSync.reload);
    gulp.watch("**/js/**/*.js").on("change", browserSync.reload);
  })
);

/* inject partials like navbar and footer */
gulp.task("injectPartial", function() {
  return gulp
    .src("./**/*.html", { base: "./" })
    .pipe(injectPartials())
    .pipe(gulp.dest("."));
});

/* inject Js and CCS static into HTML */
gulp.task("injectCommonstatic", function() {
  return gulp
    .src("./**/*.html")
    .pipe(
      inject(
        gulp.src(
          ["static/css/style.css", "static/vendors/js/vendor.bundle.base.js"],
          { read: false }
        ),
        { relative: true }
      )
    )
    .pipe(gulp.dest("."));
});

/*replace image path and linking after injection*/
gulp.task("replacePath", function() {
  return gulp
    .src(["./pages/*.html"], { base: "./" })
    .pipe(replace('src="static/images', 'src="../static/images'))
    .pipe(replace('href="pages/', 'href="./'))
    .pipe(replace('href="index.html"', 'href="../index.html"'))
    .pipe(gulp.dest("."));
});

/*sequence for injecting partials and replacing paths*/
gulp.task(
  "inject",
  gulp.series("injectPartial", "injectCommonstatic", "replacePath")
);

gulp.task("clean:vendors", function() {
  return del(["vendors/**/*"]);
});

/*Building vendor scripts needed for basic template rendering*/
gulp.task("buildBaseVendorScripts", function() {
  return gulp
    .src([
      "./node_modules/jquery/dist/jquery.min.js",
      "./node_modules/popper.js/dist/umd/popper.min.js",
      "./node_modules/bootstrap/dist/js/bootstrap.min.js"
    ])
    .pipe(concat("vendor.bundle.base.js"))
    .pipe(gulp.dest("./static/vendors/js"));
});

/*Scripts for addons*/
gulp.task("copyAddonsScripts", function() {
  var aScript1 = gulp
    .src(["./node_modules/aos/dist/aos.js"])
    .pipe(gulp.dest("./static/vendors/aos/dist/aos.js"));
  return merge(aScript1);
});

/*Styles for addons*/
gulp.task("copyAddonsStyles", function() {
  var aStyle1 = gulp
    .src(["./node_modules/@mdi/font/css/materialdesignicons.min.css"])
    .pipe(gulp.dest("./static/vendors/mdi/css"));
  var aStyle2 = gulp
    .src(["./node_modules/@mdi/font/fonts/*"])
    .pipe(gulp.dest("./static/vendors/mdi/fonts"));
  var aStyle3 = gulp
    .src(["./node_modules/aos/dist/aos.css"])
    .pipe(gulp.dest("./static/vendors/aos/dist/aos.css"));
  return merge(aStyle1, aStyle2, aStyle3);
});

/*sequence for building vendor scripts and styles*/
gulp.task(
  "bundleVendors",
  gulp.series(
    "clean:vendors",
    "buildBaseVendorScripts",
    "copyAddonsStyles"
    // "copyAddonsScripts"
  )
);

gulp.task("default", gulp.series("serve"));
