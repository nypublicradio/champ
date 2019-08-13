const express = require('express');
const rp = require('request-promise-native');
const jsdom = require('jsdom');
const get = require('just-safe-get');

const {
  amplify,
  ampImg,
  ampTweet,
} = require('../lib/amp');


const { JSDOM } = jsdom;
const router = express.Router();
const GOTH_HOST = process.env.GOTHAMIST_HOST;

const HEADER_SELECTOR = '.c-article__header';
const BODY_SELECTOR = '.c-article__body';
const TAGS_SELECTOR = '.o-tags .o-tag';
const TWEET_SELECTOR = 'blockquote.twitter-tweet';

const AMP_TWITTER = '<script async custom-element="amp-twitter" src="https://cdn.ampproject.org/v0/amp-twitter-0.1.js"></script>'

router.get(`/:section/:slug`, async (req, res, next) => {
  const { section, slug } = req.params;
  const URL = `${GOTH_HOST}/${section}/${slug}`;

  let html
  try {
    html = await rp(URL);
  } catch(e) {
    return next(e);
  }

  const { document } = (new JSDOM(html)).window;

  const header = document.querySelector(HEADER_SELECTOR);
  const body = document.querySelector(BODY_SELECTOR);
  const tags = document.querySelectorAll(TAGS_SELECTOR);

  const meta = {
    headerScripts: [],
  };

  amplify(header, 'img', ampImg);
  amplify(body, 'img', ampImg);

  if (body && body.querySelector(TWEET_SELECTOR)) {
    amplify(body, TWEET_SELECTOR,  ampTweet);
    meta.headerScripts.push(AMP_TWITTER);
  }

  const locals = {
    meta,
    title: document.title,
    header: get(header, 'outerHTML'),
    body: get(body, 'outerHTML'),
    tags: Array.from(tags).map(anchor => ({
      url: anchor.getAttribute('href'),
      name: anchor.textContent.trim(),
    })),
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
