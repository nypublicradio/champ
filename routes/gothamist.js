const express = require('express');
const rp = require('request-promise-native');
const jsdom = require('jsdom');
const get = require('just-safe-get');

const {
  amplify,
  ampImg,
  ampTweet,
  ampInsta,
  ampYoutube,
  ampIframe,
  ampFacebook,
  makeElement,
} = require('../lib/amp');


const { JSDOM } = jsdom;
const router = express.Router();
const GOTH_HOST = process.env.GOTHAMIST_HOST;

const HEADER_SELECTOR = '.c-article__header';
const BODY_SELECTOR = '.c-article__body';
const TAGS_SELECTOR = '.o-tags .o-tag';
const TWEET_SELECTOR = 'blockquote.twitter-tweet';
const IG_SELECTOR = 'blockquote[class*=instagram]';
const YT_SELECTOR = 'iframe[src*=youtube]';
const FB_SELECTOR = '[class^=fb-]';
const FB_ROOT = '#fb-root';

const DUMMY_SCRIPT = makeElement('<script async />');
const AMP_TWITTER = 'https://cdn.ampproject.org/v0/amp-twitter-0.1.js';
const AMP_IG = 'https://cdn.ampproject.org/v0/amp-instagram-0.1.js';
const AMP_YT = 'https://cdn.ampproject.org/v0/amp-youtube-0.1.js';
const AMP_FB = 'https://cdn.ampproject.org/v0/amp-facebook-0.1.js';
const AMP_IFRAME = 'https://cdn.ampproject.org/v0/amp-iframe-0.1.js';

const IG_LIB = 'instagram.com/embed.js';
const FB_LIB = 'connect.facebook.net';

router.get(`/:section/:slug`, async (req, res, next) => {
  const { section, slug } = req.params;
  const URL = `${GOTH_HOST}/${section}/${slug}`;

  let html
  try {
    const OPTIONS = {
      headers: {
        Accept: 'text/html', // helps with local fastboot requests
      }
    }
    html = await rp(URL, OPTIONS);
  } catch(e) {
    return next(e);
  }

  const { document } = (new JSDOM(html)).window;

  const header = document.querySelector(HEADER_SELECTOR);
  const body = document.querySelector(BODY_SELECTOR);
  const tags = document.querySelectorAll(TAGS_SELECTOR);

  const meta = {
    canonical: URL,
    headerScripts: [],
  };

  amplify(header, 'img', ampImg);
  amplify(body, 'img', ampImg);

  if (document.querySelector(TWEET_SELECTOR)) {
    amplify(body, TWEET_SELECTOR,  ampTweet);

    DUMMY_SCRIPT.setAttribute('src', AMP_TWITTER);
    DUMMY_SCRIPT.setAttribute('custom-element', 'amp-twitter');
    meta.headerScripts.push(DUMMY_SCRIPT.outerHTML);
  }

  if (document.querySelector(FB_SELECTOR)) {
    amplify(body, FB_SELECTOR, ampFacebook);

    DUMMY_SCRIPT.setAttribute('src', AMP_FB);
    DUMMY_SCRIPT.setAttribute('custom-element', 'amp-facebook');
    meta.headerScripts.push(DUMMY_SCRIPT.outerHTML);

    // get rid of embedded facebook scripts
    document.querySelectorAll(`script[src*="${FB_LIB}"]`).forEach(node => node.remove());

    // get rid of other cruft
    document.querySelectorAll(FB_ROOT).forEach(node => node.remove());
  }

  if (document.querySelector(IG_SELECTOR)) {
    amplify(body, IG_SELECTOR, ampInsta);

    DUMMY_SCRIPT.setAttribute('src', AMP_IG);
    DUMMY_SCRIPT.setAttribute('custom-element', 'amp-instagram');
    meta.headerScripts.push(DUMMY_SCRIPT.outerHTML);

    // get rid of any embedded IG libs
    document.querySelectorAll(`script[src*="${IG_LIB}"]`).forEach(node => node.remove());
  }

  if (document.querySelector(YT_SELECTOR)) {
    amplify(body, YT_SELECTOR,  ampYoutube);

    DUMMY_SCRIPT.setAttribute('src', AMP_YT);
    DUMMY_SCRIPT.setAttribute('custom-element', 'amp-youtube');
    meta.headerScripts.push(DUMMY_SCRIPT.outerHTML);
  }

  // replace any remaining iframes
  if (document.querySelector('iframe')) {
    amplify(body, 'iframe', ampIframe);
    DUMMY_SCRIPT.setAttribute('src', AMP_IFRAME);
    DUMMY_SCRIPT.setAttribute('custom-element', 'amp-iframe');

    meta.headerScripts.push(DUMMY_SCRIPT.outerHTML);
  }

  // strip any errant script tags
  document.querySelectorAll('body script').forEach(node => node.remove());
  // strip inline styles from "responsive objects"
  document.querySelectorAll('.responsive-object').forEach(node => node.removeAttribute('style'));

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
