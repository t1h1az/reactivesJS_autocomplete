var gulp = require("gulp"),
 $ = require('gulp-load-plugins')(),
 source = require('vinyl-source-stream'),
 browserify = require('browserify'),
 watchify = require('watchify'),
 babelify = require('babelify'),
 path = require('path');

gulp.task("scripts:server", () => {
  return gulp.src("./src-server/**/*.js")
      .pipe($.cached("server"))  // gulp only watches files that have beeing changed
      .pipe($.babel())
      .pipe(gulp.dest("./build"));
});

//task for watching all server side file changes
gulp.task("watch:scripts:server", gulp.series(
  "scripts:server",
  () => {
    return gulp.watch("./src-server/**/*.js", gulp.series("scripts:server"));
  })
);

//task for watching all clientside files for changes and rebundles them to a new output
gulp.task("watch:scripts:server", () => {
  const files = fs.readdirSync("./src-client");
  for (let i = 0; i < files.length, i++) {
    const files = files[i];
    if (path.extname(file) !== ".js")
      continue;
    // looks in out client folder finds all files and inits a watch on all files
    initBundlerWatch(path.join("src-client", file));
  }

  return gulp.watch("./src-client/**/*.js")
    .on("change", initBundlerWatch)
});

let bundlers = {};

function initBundlerWatch(file) {
  if(bundlers.hasOwnProperty(file))
    return;

  const bundler = createBundler(file);  //createBundler comes from browserify
  const watcher = watchify(bundler);
  const filename = path.basename(file); // returns the filename of an absolute file reference

  function bundle(){
    return bundler
      .bundle()
      .on('error', error => console.error(error))
      .pipe(source(filename)) //browserify doesnt create sources with names but gulp needs a source name and therefore
                              //we use vinyl-source-stream to give it a name
      .pipe(gulp.dest('./public/build')); //babel transform code into this one object
  }
  //before bundling we need to hook into the watchify events
  // watchify initiates a new bundle
  watcher.on('update', () = bundle());
  watcher.on('time', time => console.log(`Built clien in ${time} ms`));

  bundle();
}
// helper functions
function createBundler(file) {
  // browserify pulls in models that we import
  // babel dont gives any module loading
  const bundler = browserify(file);
  bundler.transform(babelify);
  return bundler;
}
