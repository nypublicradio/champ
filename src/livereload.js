const path = require('path');

const livereload = require('easy-livereload');


const DIRS = [
  path.join(__dirname),
  path.join(__dirname, './lib'),
  path.join(__dirname, './routes'),
  path.join(__dirname, './views'),
];

module.exports = function(app) {
  app.use(livereload({
    watchDirs: DIRS,
    port: process.env.LIVERELOAD_PORT || 35729,

    checkFunc: () => true,

    renameFunc: () => '/', // always reload from the root down
  }))
}
