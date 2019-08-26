const path = require('path');

const livereload = require('easy-livereload');


const DIRS = [
  path.join(__dirname, './lib'),
  path.join(__dirname, './routes'),
  path.join(__dirname, './static'),
  path.join(__dirname, './views'),
  path.join(__dirname, './app'),
];

module.exports = function(app) {
  app.use(livereload({
    watchDirs: DIRS,
    port: process.env.LIVERELOAD_PORT || 35729,

    checkFunc: () => true,

    renameFunc: () => '/', // always reload from the root down
  }))
}
