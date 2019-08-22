const request = require('supertest');
const nock = require('nock');
const { expect } = require('chai');
const { JSDOM } = require('jsdom');

const app = require('../../src/app');
const {
  ARTICLE_BODY,
} = require('../fixtures');


const getDocument = text => new JSDOM(text).window.document;

describe('Gothamist route', function() {
  it('returns a 200', function(done) {
    const TITLE = 'FOO BAR - Gothamist';
    const PATH = '/foo/bar';
    nock(process.env.GOTHAMIST_HOST)
      .get(PATH)
      .query(true)
      .reply(200, `<!doctype html>
        <html>
          <head>
            <title>${TITLE}</title>
          </head>
        </html>
      `);

    request(app)
      .get(`/champ/gothamist${PATH}`)
      .expect(200)
      .expect(new RegExp(`<title>${TITLE}</title>`))
      .end(done);
  });

  it('if the upstream returns a 404, so does the app', function(done) {
    const UPSTREAM_PATH = '/foo/bar';

    nock(process.env.GOTHAMIST_HOST)
      .get(UPSTREAM_PATH)
      .query(true) // ignore query strings
      .reply(404);

    request(app)
      .get(`/champ/gothamist${UPSTREAM_PATH}`)
      .expect(404)
      .end(done);
  });
});

describe('amp conversions', function() {

  const PATH = '/foo/bar';

  beforeEach(() => {
    nock(process.env.GOTHAMIST_HOST)
      .get(PATH)
      .query(true)
      .reply(200, ARTICLE_BODY);
  });

  it('turns images into amp-images', function(done) {
    request(app)
      .get(`/champ/gothamist${PATH}`)
      .expect(200)
      .expect(/<amp-img/)
      // no regular images
      .expect(res => expect(res.text).not.to.match(/<img/))
      .end(done);
  });

  it('turns embedded tweets into amp-twitter', function(done) {
    request(app)
      .get(`/champ/gothamist${PATH}`)
      .expect(200)
      .expect(({ text }) => {
        const document = getDocument(text);

        expect(document.querySelector('.twitter-tweet'), 'original tweet should be removed').not.to.be.ok;
        expect(document.querySelector('script[src*="twitter.com/widgets.js"]'), 'original twitter library should be removed').not.to.be.ok;

        expect(document.querySelector('script[src*="amp-twitter"]'), 'adds amp twitter script').to.be.ok;
        expect(document.querySelector('amp-twitter'), 'adds <amp-twitter/> tag').to.be.ok;
        expect(document.querySelector('amp-twitter').dataset.tweetid).to.equal('12345');
      })
      .end(done);
  });

  it('turns embedded reddit posts into amp-reddit', function(done) {
    request(app)
      .get(`/champ/gothamist${PATH}`)
      .expect(200)
      .expect(({ text }) => {
        const document = getDocument(text);

        expect(document.querySelector('.reddit-card'), 'original post should be removed').not.to.be.ok;
        expect(document.querySelector('script[src*="redditmedia.com/widgets/platform.js"]'), 'original reddit library should be removed').not.to.be.ok;

        expect(document.querySelector('script[src*="amp-reddit"]'), 'adds amp reddit script').to.be.ok;
        expect(document.querySelector('amp-reddit'), 'adds <amp-reddit/> tag').to.be.ok;
        expect(document.querySelector('amp-reddit').dataset.src).to.equal('http://reddit.com/post');
      })
      .end(done);
  });


  it('turns embedded facebook posts and videos into amp-facebook', function(done) {
    request(app)
      .get(`/champ/gothamist${PATH}`)
      .expect(200)
      .expect(({ text }) => {
        const document = getDocument(text);

        expect(document.querySelector('[class^=fb]'), 'original facebook embeds should be removed').not.to.be.ok;
        expect(document.querySelector('#fb-root'), 'original facebook tags should be removed').not.to.be.ok;
        expect(document.querySelector('script[src*="facebook.net"]'), 'strips embedded facebook library').not.to.be.ok;
        expect(
          document.querySelector('.responsive-object').hasAttribute('style'),
          'should strip responsive object inline styles'
        ).not.to.be.ok;

        expect(document.querySelector('script[src*="amp-facebook"]'), 'adds amp twitter script').to.be.ok;
        expect(document.querySelector('amp-facebook'), 'adds <amp-facebook/> tag').to.be.ok;
        expect(document.querySelector('amp-facebook[data-embed-as="post"]').dataset.href)
          .to.equal('post-12345');
        expect(document.querySelector('amp-facebook[data-embed-as="video"]').dataset.href)
          .to.equal('video-12345');
      })
      .end(done);
  });

  it('turns embedded instagram posts into amp-instagram', function(done) {
    request(app)
      .get(`/champ/gothamist${PATH}`)
      .expect(200)
      .expect(({ text }) => {
        const document = getDocument(text);

        expect(document.querySelector('blockquote[class*="instagram"]'), 'original post should be removed').not.to.be.ok;
        expect(document.querySelector('script[src*="instagram.com"]'), 'strips embedded instagram library').not.to.be.ok;

        expect(document.querySelector('script[src*="amp-instagram"]'), 'adds amp instagram script').to.be.ok;
        expect(document.querySelector('amp-instagram'), 'adds <amp-instagram/> tag').to.be.ok;
        expect(document.querySelector('amp-instagram').dataset.shortcode).to.equal('12345');
      })
      .end(done);
  });

  it('turns embedded youtube videos into amp-youtube', function(done) {
    request(app)
      .get(`/champ/gothamist${PATH}`)
      .expect(200)
      .expect(({ text }) => {
        const document = getDocument(text);

        expect(document.querySelector('iframe[src*="youtube"]'), 'original iframe should be removed').not.to.be.ok;

        expect(document.querySelector('script[src*="amp-youtube"]'), 'adds amp youtube script').to.be.ok;
        expect(document.querySelector('amp-youtube'), 'adds <amp-youtube/> tag').to.be.ok;
        expect(document.querySelector('amp-youtube').dataset.videoid).to.equal('abcd-1234');

        // wagtail-style embed
        expect(document.querySelectorAll('amp-youtube')[1].dataset.videoid).to.equal('YOUTUBEID');
      })
      .end(done);
  });

  it('turns embedded vimeo videos into amp-vimeo', function(done) {
    request(app)
      .get(`/champ/gothamist${PATH}`)
      .expect(200)
      .expect(({ text }) => {
        const document = getDocument(text);

        expect(document.querySelector('iframe[src*="vimeo"]'), 'original iframe should be removed').not.to.be.ok;

        expect(document.querySelector('script[src*="amp-vimeo"]'), 'adds amp vimeo script').to.be.ok;
        expect(document.querySelector('amp-vimeo'), 'adds <amp-vimeo/> tag').to.be.ok;
        expect(document.querySelector('amp-vimeo').dataset.videoid).to.equal('VIMEOID');
      })
      .end(done);
  });

  it('it strips iframes and errant script tags', function(done) {
    request(app)
      .get(`/champ/gothamist${PATH}`)
      .expect(200)
      .expect(({ text }) => {
        const document = getDocument(text);

        expect(document.querySelector('iframe'), 'no iframes at all should remain').not.to.be.ok;
        expect(document.querySelector('body script'), 'no script tags in the body should remain').not.to.be.ok;

        expect(document.querySelector('script[src*="amp-iframe"]'), 'adds amp iframe script').to.be.ok;
        expect(document.querySelector('amp-iframe'), 'adds <amp-iframe/> tag').to.be.ok;
        expect(document.querySelector('amp-iframe').getAttribute('src')).to.equal('http://example.com');
      })
      .end(done);
  })

  it('swaps in article content', function(done) {
    request(app)
      .get(`/champ/gothamist${PATH}`)
      .expect(200)
      .expect(({ text }) => {
        const document = getDocument(text);
        const headline = document.querySelector('.c-article__headline');

        expect(headline, 'headline should exist').to.exist;
        expect(headline.textContent.trim()).to.equal('Fixture Article Title');
      })
      .end(done);
  });

  it('parses tags', function(done) {
    request(app)
      .get(`/champ/gothamist${PATH}`)
      .expect(200)
      .expect(({ text }) => {
        const document = getDocument(text);
        const tags = document.querySelectorAll('#amp-article-tags .o-tag');
        const [ tag ] = tags;

        expect(tags.length).to.equal(4);
        expect(tag.getAttribute('href')).to.equal('/tags/nypd');
        expect(tag.textContent).to.equal('#nypd');
      })
      .end(done);
  });

  it('strips `picture` tags', function(done) {
    request(app)
      .get(`/champ/gothamist${PATH}`)
      .expect(200)
      .expect(({ text }) => {
        const document = getDocument(text);
        const tags = document.querySelectorAll('picture');
        expect(tags.length).to.equal(0);
      })
      .end(done);
  });
});
