# Frontend Boilerplate

Frontend tooling scaffolding suited to new website template builds with sass and hot-reloading by default.

-   `gulp dev` runs development server with hot reloading via [browserSync](https://browsersync.io)
-   `npm run dev` runs `gulp dev` while nodemon reloads gulp after `gulpfile.js` changes. (`npm -g nodemon`)
-   `gulp` | `gulp build` - full build of assets
-   Tested with `Gulp 4.0.2` and `Node 16.10.0`

## TODO

-   [x] Gulp4 with ES module syntax
-   [x] browsersync server with hot-reloading of assets
-   [x] CSS Framework basic (normalize, helpers etc)
-   [x] Image asset optimization
-   [x] SVG optimization
-   [x] JS optimization
-   [x] Watch gulpfile.js for changes and reload
-   [x] JS Sourcemaps
-   [ ] JS concatenation
-   [ ] CSS optimization (autoprefixer, sourcemaps, minifier, combinemq, csso, ...)
-   [ ] Split off JS optimization
-   [ ] CSS Framework: modern sass conventions / standards
-   [ ] CSS / Scss linting (?)
-   [ ] SVG to Iconfont generation, w/ styles
-   [ ] SVG bundling (?)
-   [ ] Default browsersync proxy config
-   [ ] JS linting (out of scope?)
