const express = require('express');
const request = require('request-promise-native');
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
    ampVimeo,
    ampReddit,
    makeElement,
} = require('../lib/amp');

const wagtail = require('../lib/wagtail');


const { JSDOM } = jsdom;
const router = express.Router();
const GOTH_HOST = process.env.GOTHAMIST_HOST;
const NEWSLETTER_ENDPOINT = `${process.env.API_SERVER}/opt-in/v1/subscribe/mailchimp`;
const NEWSLETTER_ID = '65dbec786b';

const HEADER_SELECTOR = '.c-article__header';
const BODY_SELECTOR = '.c-article__body';
const TAGS_SELECTOR = '.o-tags .o-tag';
const TWEET_SELECTOR = 'blockquote.twitter-tweet';
const IG_SELECTOR = 'blockquote[class*=instagram]';
const YT_SELECTOR = 'iframe[src*=youtube]';
const VIMEO_SELECTOR = 'iframe[src*=vimeo]';
const FB_SELECTOR = '[class^=fb-]';
const FB_ROOT = '#fb-root';
const REDDIT_SELECTOR = '.reddit-card';

const DISALLOWED = 'object, embed, frame, frameset, param';

const DUMMY_SCRIPT = makeElement('<script async />');
const AMP_TWITTER = 'https://cdn.ampproject.org/v0/amp-twitter-0.1.js';
const AMP_IG = 'https://cdn.ampproject.org/v0/amp-instagram-0.1.js';
const AMP_YT = 'https://cdn.ampproject.org/v0/amp-youtube-0.1.js';
const AMP_FB = 'https://cdn.ampproject.org/v0/amp-facebook-0.1.js';
const AMP_IFRAME = 'https://cdn.ampproject.org/v0/amp-iframe-0.1.js';
const AMP_VIMEO = 'https://cdn.ampproject.org/v0/amp-vimeo-0.1.js';
const AMP_REDDIT = 'https://cdn.ampproject.org/v0/amp-reddit-0.1.js';

const IG_LIB = 'instagram.com/embed.js';
const FB_LIB = 'connect.facebook.net';

const THREE_SECONDS = 3000;
const TIMEOUT = THREE_SECONDS;

const dedupe = (needle, haystack) => haystack.filter(item =>
    item.id !== needle.id);

const canonicalizeHost = function(html) {
    return html.replace(new RegExp(`${GOTH_HOST}`, 'gm'), 'https://gothamist.com');
}

router.get(`/:section_slug/:slug`, async(req, res, next) => {
    const { section_slug, slug } = req.params;
    const URL = `${GOTH_HOST}/${section_slug}/${slug}`;

    let html, articleJSON;
    try {
        const OPTIONS = {
            headers: {
                Accept: 'text/html', // helps with local fastboot requests
            },
            timeout: TIMEOUT,
        };
        [html, articleJSON] = await Promise.all([
            request(URL, OPTIONS),
            wagtail.byPath(`${section_slug}/${slug}`),
        ]);
    } catch (e) {
        return next(e);
    }

    const { document } = (new JSDOM(html)).window;
    const qs = selector => document.querySelector(selector);
    const qsa = selector => document.querySelectorAll(selector);

    const header = qs(HEADER_SELECTOR);
    const body = qs(BODY_SELECTOR);
    const tags = qsa(TAGS_SELECTOR);

    const meta = {
        canonical: `https://gothamist.com/${section_slug}/${slug}`,
        description: articleJSON.description,
        headerScripts: [
            get(qs('#structured-data'), 'outerHTML'),
        ],
    };

    amplify(header, 'img', ampImg);
    amplify(body, 'img', ampImg);

    // picture elements are disallowed in amp
    qsa('picture').forEach(picture => {
        while (picture.firstChild) {
            picture.parentNode.insertBefore(picture.firstChild, picture);
        }
        picture.parentNode.removeChild(picture);
    });

    // root relative links should point at gothamist
    qsa('a[href^="/"]').forEach(node =>
        node.href = `${process.env.GOTHAMIST_HOST}${node.href}`);

    // amp gallery leads
    //   - no thumbs
    //   - link to gallery
    if (qs('.c-lead-gallery')) {
        let { url } = await wagtail.byId(articleJSON.lead_asset[0].value.gallery);

        const link = document.createElement('a');
        const gallery = qs('.c-lead-gallery');
        const viewAllButton = gallery.querySelector('.c-lead-gallery__thumbs button:last-of-type');

        qsa('.c-lead-gallery__thumbs-thumb').forEach(node => node.remove());

        link.href = url;
        link.className = viewAllButton.className;
        link.innerHTML = viewAllButton.innerHTML;
        link.append(document.createTextNode('photos'));

        qs('.c-lead-gallery__thumbs').appendChild(link);
    }

    if (qs(TWEET_SELECTOR)) {
        amplify(body, TWEET_SELECTOR, ampTweet);

        DUMMY_SCRIPT.setAttribute('src', AMP_TWITTER);
        DUMMY_SCRIPT.setAttribute('custom-element', 'amp-twitter');
        meta.headerScripts.push(DUMMY_SCRIPT.outerHTML);
    }

    if (qs(REDDIT_SELECTOR)) {
        amplify(body, REDDIT_SELECTOR, ampReddit);

        DUMMY_SCRIPT.setAttribute('src', AMP_REDDIT);
        DUMMY_SCRIPT.setAttribute('custom-element', 'amp-reddit');
        meta.headerScripts.push(DUMMY_SCRIPT.outerHTML);
    }

    if (qs(FB_SELECTOR)) {
        amplify(body, FB_SELECTOR, ampFacebook);

        DUMMY_SCRIPT.setAttribute('src', AMP_FB);
        DUMMY_SCRIPT.setAttribute('custom-element', 'amp-facebook');
        meta.headerScripts.push(DUMMY_SCRIPT.outerHTML);

        // get rid of embedded facebook scripts
        qsa(`script[src*="${FB_LIB}"]`).forEach(node => node.remove());

        // get rid of other cruft
        qsa(FB_ROOT).forEach(node => node.remove());
    }

    if (qs(IG_SELECTOR)) {
        amplify(body, IG_SELECTOR, ampInsta);

        DUMMY_SCRIPT.setAttribute('src', AMP_IG);
        DUMMY_SCRIPT.setAttribute('custom-element', 'amp-instagram');
        meta.headerScripts.push(DUMMY_SCRIPT.outerHTML);

        // get rid of any embedded IG libs
        qsa(`script[src*="${IG_LIB}"]`).forEach(node => node.remove());
    }

    if (qs(YT_SELECTOR)) {
        amplify(body, YT_SELECTOR, ampYoutube);

        DUMMY_SCRIPT.setAttribute('src', AMP_YT);
        DUMMY_SCRIPT.setAttribute('custom-element', 'amp-youtube');
        meta.headerScripts.push(DUMMY_SCRIPT.outerHTML);
    }

    if (qs(VIMEO_SELECTOR)) {
        amplify(body, VIMEO_SELECTOR, ampVimeo);

        DUMMY_SCRIPT.setAttribute('src', AMP_VIMEO);
        DUMMY_SCRIPT.setAttribute('custom-element', 'amp-vimeo');
        meta.headerScripts.push(DUMMY_SCRIPT.outerHTML);
    }

    // replace any remaining iframes
    if (qs('iframe')) {
        amplify(body, 'iframe', ampIframe);
        DUMMY_SCRIPT.setAttribute('src', AMP_IFRAME);
        DUMMY_SCRIPT.setAttribute('custom-element', 'amp-iframe');

        meta.headerScripts.push(DUMMY_SCRIPT.outerHTML);
    }

    // strip any errant script tags
    qsa('body script').forEach(node => node.remove());
    // strip inline styles
    qsa('[style]').forEach(node => node.removeAttribute('style'));
    // strip other disallowed elements
    qsa(DISALLOWED).forEach(node => node.remove());

    const section = wagtail.getSection(articleJSON);
    const PARAMS = {
        type: 'news.ArticlePage',
        fields: '*',
        order: '-publication_date',
        show_on_index_listing: true,
        descendant_of: section.id,
    };
    let [{ items: recent = [] }, { items: featured = [] }] = await Promise.all([
        wagtail.query({...PARAMS, limit: 4 }),
        wagtail.query({...PARAMS, limit: 5, show_as_feature: true }),
    ]);

    recent = dedupe(articleJSON, recent);
    featured = dedupe(articleJSON, featured);
    recent.forEach(a => featured = dedupe(a, featured));

    // query returns an array
    // only need the first featured item
    [featured] = featured;
    if (featured) {
        featured.thumbnail = wagtail.getThumb(featured);
        featured.section = wagtail.getSection(featured);
        featured.authors = wagtail.getAuthors(featured);
    }
    recent.forEach(recent => {
        recent.thumbnail = wagtail.getThumb(recent)
        recent.section = wagtail.getSection(recent)
        recent.authors = wagtail.getAuthors(recent);
    });

    const locals = {
        meta,
        title: document.title,
        header: canonicalizeHost(get(header, 'outerHTML')),
        body: get(body, 'outerHTML'),
        tags: Array.from(tags).map(anchor => ({
            url: canonicalizeHost(anchor.getAttribute('href')),
            name: anchor.textContent.trim(),
        })),
        authors: canonicalizeHost(Array.from(qsa('.o-byline a')).map(a => a.textContent.trim()).join(', ')),

        section,

        NEWSLETTER_ENDPOINT,
        NEWSLETTER_ID,

        year: new Date().getFullYear(), // for copyright

        recent: recent.slice(0, 3),
        featured,

        DFP_PREFIX: process.env.NODE_ENV === 'development' ? '/_demo_test' : '',
        DFP_NETWORK: "6483581",
    };

    try {
        res.render('gothamist/article', {
            ...locals,
            layout: false,
        });
    } catch (e) {
        next(e);
    }
});

module.exports = router;