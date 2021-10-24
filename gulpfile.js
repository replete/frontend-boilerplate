import gulp from 'gulp'
import gulpSass from 'gulp-sass'
import dartSass from 'sass'
import del from 'del'
import browserSync from 'browser-sync'
import imagemin from 'gulp-imagemin'
import imageminOptipng from 'imagemin-optipng'
import imageminSvgo from 'imagemin-svgo'
import imageminMozjpeg from 'imagemin-svgo'
import terser from 'gulp-terser'
import rename from 'gulp-rename'
import sourcemaps from 'gulp-sourcemaps'

const sass = gulpSass(dartSass)
const browserSyncServer = browserSync.create('LocalDevServer')

const paths = {
	distributables: 'dist',
	documents: {
		source: 'src/**/*.html',
		destination: 'dist',
	},
	styles: {
		source: 'src/styles/**/*.scss',
		destination: 'dist/styles/',
	},
	scripts: {
		source: 'src/scripts/**/*.js',
		destination: 'dist/scripts',
	},
	images: {
		source: 'src/images/**/*.{png,jpg,jpeg,webp,gif}',
		destination: 'dist/images',
	},
}

function clean() {
	return del([paths.distributables])
}

function documents() {
	return gulp
		.src(paths.documents.source, { since: gulp.lastRun(documents) })
		.pipe(gulp.dest(paths.documents.destination))
}

function styles() {
	return (
		gulp
			.src(paths.styles.source)
			.pipe(sass.sync().on('error', sass.logError))
			// sass.sync() is faster than sass(): https://github.com/dlmanning/gulp-sass
			.pipe(gulp.dest(paths.styles.destination))
			.pipe(browserSyncServer.stream())
	)
}

function scripts() {
	return gulp
		.src(paths.scripts.source)
		.pipe(sourcemaps.init())
		.pipe(gulp.dest(paths.scripts.destination))
		.pipe(terser({ keep_fnames: false, mangle: true }))
		.pipe(sourcemaps.write())
		.pipe(rename({ extname: '.min.js' }))
		.pipe(gulp.dest(paths.scripts.destination))
}

function images() {
	return gulp
		.src(paths.images.source, { since: gulp.lastRun(images) })
		.pipe(
			imagemin([
				imageminOptipng({ optimizationLevel: 5 }),
				imageminSvgo({
					plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
				}),
				imageminMozjpeg({ quality: 75, progressive: false }),
			]),
		)
		.pipe(gulp.dest(paths.images.destination))
}

function watchFiles(done) {
	gulp.watch(paths.documents.source, gulp.series(documents, browserSyncReload))
	gulp.watch(paths.styles.source, styles)
	gulp.watch(paths.scripts.source, gulp.series(scripts, browserSyncReload))
	gulp.watch(paths.images.source, images)
	done()
}

function serve(done) {
	browserSyncServer.init({
		server: {
			baseDir: `${paths.distributables}`,
		},
		open: false,
	})
	done()
}

function browserSyncReload(done) {
	browserSyncServer.reload()
	done()
}

const build = gulp.series(clean, gulp.parallel(documents, styles, scripts, images))

const dev = gulp.series(clean, build, gulp.parallel(watchFiles, serve))

export { clean, documents, styles, scripts, images, watchFiles as watch, serve, build, dev }
export default build
