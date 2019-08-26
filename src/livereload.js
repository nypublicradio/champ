const path = require('path');

const livereload = require('easy-livereload');


const DIRS = [
  path.join(__dirname, './src'),
  path.join(__dirname, './test'),
  path.join(__dirname, './index.dev.js'),
];

module.exports = function(app) {
  app.use(livereload({
    watchDirs: DIRS,
    port: process.env.LIVERELOAD_PORT || 35729,

    checkFunc: () => true,

    renameFunc: () => '/', // always reload from the root down
  }))
}
