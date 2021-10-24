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
import concat from 'gulp-concat'
import mergeStream from 'merge-stream'

const sass = gulpSass(dartSass)
const browserSyncServer = browserSync.create('LocalDevServer')

const paths = {
	distributables: 'dist',
	documents: {
		source: 'src',
		destination: 'dist',
	},
	styles: {
		source: 'src/styles',
		destination: 'dist/styles/',
	},
	scripts: {
		source: 'src/scripts',
		destination: 'dist/scripts',
	},
	images: {
		source: 'src/images',
		destination: 'dist/images',
	},
}

function clean() {
	return del([paths.distributables])
}

function documents() {
	return gulp
		.src(`${paths.documents.source}/**/*.html`, {
			since: gulp.lastRun(documents),
		})
		.pipe(gulp.dest(paths.documents.destination))
}

function styles() {
	return (
		gulp
			.src(`${paths.styles.source}/**/*.scss`)
			.pipe(sass.sync().on('error', sass.logError))
			// sass.sync() is faster than sass(): https://github.com/dlmanning/gulp-sass
			.pipe(gulp.dest(paths.styles.destination))
			.pipe(browserSyncServer.stream())
	)
}

function scripts() {
	const copyScripts = gulp
		.src(`${paths.scripts.source}/**/*.js`)
		.pipe(gulp.dest(paths.scripts.destination))

	const bundleHeadScripts = gulp
		.src([`${paths.scripts.source}/app_head.js`])
		.pipe(concat('app_head.bundle.js'))
		.pipe(gulp.dest(paths.scripts.destination))

	const bundleOtherScripts = gulp
		.src([
			`${paths.scripts.source}/app.js`,
			`${paths.scripts.source}/other.js`,
		])
		.pipe(concat('app.bundle.js'))
		.pipe(gulp.dest(paths.scripts.destination))

	return mergeStream(copyScripts, bundleHeadScripts, bundleOtherScripts)
}

function optimizeScripts() {
	return gulp
		.src(`${paths.scripts.destination}/**/!(*.min).js`)
		.pipe(rename({ extname: '.min.js' }))
		.pipe(sourcemaps.init())
		.pipe(terser({ keep_fnames: false, mangle: true }))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(paths.scripts.destination))
}

function images() {
	return gulp
		.src(`${paths.images.source}/**/*.{png,jpg,jpeg,webp,gif}`, {
			since: gulp.lastRun(images),
		})
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
	gulp.watch(
		paths.documents.source,
		gulp.series(documents, browserSyncReload),
	)
	gulp.watch(paths.styles.source, styles)
	gulp.watch(
		paths.scripts.source,
		gulp.series(scripts, optimizeScripts, browserSyncReload),
	)
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

const build = gulp.series(
	clean,
	gulp.parallel(documents, styles, scripts),
	optimizeScripts,
	images,
)

const dev = gulp.series(clean, build, gulp.parallel(watchFiles, serve))

export {
	clean,
	documents,
	styles,
	scripts,
	optimizeScripts,
	images,
	watchFiles as watch,
	serve,
	build,
	dev,
}
export default build
