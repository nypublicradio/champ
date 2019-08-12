const express = require('express');
const rp = require('request-promise-native');
const jsdom = require('jsdom');


const { JSDOM } = jsdom;
const router = express.Router();
const GOTH_HOST = process.env.GOTHAMIST_HOST;

router.get(`/:section/:slug`, async (req, res, next) => {
  const { section, slug } = req.params;
  const URL = `${GOTH_HOST}/${section}/${slug}?build=brian/cms-545`;

  let html
  try {
    html = await rp(URL);
  } catch(e) {
    return next(e);
  }

  const { document } = (new JSDOM(html)).window;
  const locals = {
    title: document.title,
  };

  try {
    res.render('gothamist/article', {
      ...locals,
      layout: false,
    });
  } catch(e) {
    next(e);
  }
});

module.exports = router;
