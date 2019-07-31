const express = require('express');
const rp = require('request-promise-native');
const jsdom = require('jsdom');


const GOTH_HOST = process.env.GOTHAMIST_HOST;
const { JSDOM } = jsdom;
const router = express.Router();

router.get('/:section/articles/:slug', async (req, res, next) => {
  const { section, slug } = req.params;
  let html
  try {
    html = rp(`${GOTH_HOST}/${section}/articles/${slug}?build=brian/cms-545`);
  } catch(e) {
    next(e);
  }

  const { document } = (new JSDOM(html)).window;

  try {
    const articleHeader = document.querySelector('.c-article__header');
    const articleBody = document.querySelector('.c-article__body');

    res.render('gothamist/article', {
      header: articleHeader.outerHTML,
      body: articleBody.outerHTML,
      layout: false,
    });
  } catch(e) {
    next(e);
  }
});

module.exports = router;
