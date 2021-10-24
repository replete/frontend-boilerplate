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
import postcss from 'gulp-postcss'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import replace from 'gulp-replace'

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
		.src(`${paths.documents.source}/**/*.html`)
		.pipe(replace('?cb=', `?cb=${new Date().getTime()}`)) // cache-busting
		.pipe(gulp.dest(paths.documents.destination))
}

function styles() {
	// sass.sync() is faster than sass(): https://github.com/dlmanning/gulp-sass
	return gulp
		.src(`${paths.styles.source}/**/*.scss`)
		.pipe(sourcemaps.init())
		.pipe(sass.sync().on('error', sass.logError))
		.pipe(postcss([autoprefixer()]))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(paths.styles.destination))
		.pipe(browserSyncServer.stream())
}

function optimizeStyles() {
	return gulp
		.src(`${paths.styles.destination}/**/*.css`)
		.pipe(postcss([cssnano()]))
		.pipe(rename({ extname: '.min.css' }))
		.pipe(gulp.dest(paths.styles.destination))
}

function scripts() {
	const copyScripts = gulp
		.src(`${paths.scripts.source}/**/*.js`)
		.pipe(gulp.dest(paths.scripts.destination))

	const headScriptsBundle = gulp
		.src([`${paths.scripts.source}/app_head.js`])
		.pipe(concat('app_head.bundle.js'))
		.pipe(gulp.dest(paths.scripts.destination))

	const otherScriptsBundle = gulp
		.src([
			`${paths.scripts.source}/app.js`,
			`${paths.scripts.source}/other.js`,
		])
		.pipe(concat('app.bundle.js'))
		.pipe(gulp.dest(paths.scripts.destination))

	return mergeStream(copyScripts, headScriptsBundle, otherScriptsBundle)
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
	gulp.watch(paths.styles.source, gulp.series(styles, optimizeStyles))
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
	gulp.parallel(documents, scripts, styles),
	gulp.parallel(optimizeScripts, optimizeStyles, images),
)

const dev = gulp.series(build, gulp.parallel(watchFiles, serve))

export {
	clean,
	documents,
	styles,
	optimizeStyles,
	scripts,
	optimizeScripts,
	images,
	watchFiles as watch,
	serve,
	build,
	dev,
}
export default build
