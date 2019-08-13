const nock = require('nock');
const { expect } = require('chai');
const { JSDOM: { fragment } } = require('jsdom');

// reassign for convenience
let request = require('supertest');

const app = require('../src/app');
const {
  ARTICLE_BODY,
} = require('./fixtures');


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
      .get(`/gothamist${PATH}`)
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
      .get(`/gothamist${UPSTREAM_PATH}`)
      .expect(404)
      .end(done);
  });
});

describe('article template', function() {

  const PATH = '/foo/bar';

  beforeEach(() => {
    nock(process.env.GOTHAMIST_HOST)
      .get(PATH)
      .query(true)
      .reply(200, ARTICLE_BODY);
  });

  it('turns images into amp-images', function(done) {
    request(app)
      .get(`/gothamist${PATH}`)
      .expect(200)
      .expect(/<amp-img/)
      // no regular images
      .expect(res => expect(res.text).not.to.match(/<img/))
      .end(done);
  });

  it('turns embedded tweets into amp-twitter', function(done) {
    request(app)
      .get(`/gothamist${PATH}`)
      .expect(200)
      .expect(({ text }) => {
        const frag = fragment(text);

        expect(frag.querySelector('.twitter-tweet'), 'original tweet should be removed').not.to.be.ok;

        expect(frag.querySelector('script[src*="amp-twitter"]'), 'adds amp twitter script').to.be.ok;
        expect(frag.querySelector('amp-twitter'), 'adds <amp-twitter/> tag').to.be.ok;
        expect(frag.querySelector('amp-twitter').dataset.tweetid).to.equal('12345');
      })
      .end(done);
  });

  it('turns embedded instagram posts into amp-instagram', function(done) {
    request(app)
      .get(`/gothamist${PATH}`)
      .expect(200)
      .expect(({ text }) => {
        const frag = fragment(text);

        expect(frag.querySelector('blockquote[class*="instagram"]'), 'original post should be removed').not.to.be.ok;
        expect(frag.querySelector('script[src*="instagram.com"]'), 'strips embedded instagram library').not.to.be.ok;

        expect(frag.querySelector('script[src*="amp-instagram"]'), 'adds amp instagram script').to.be.ok;
        expect(frag.querySelector('amp-instagram'), 'adds <amp-instagram/> tag').to.be.ok;
        expect(frag.querySelector('amp-instagram').dataset.shortcode).to.equal('12345');
      })
      .end(done);
  });

  it('turns embedded youtube videos into amp-youtube', function(done) {
    request(app)
      .get(`/gothamist${PATH}`)
      .expect(200)
      .expect(({ text }) => {
        const frag = fragment(text);

        expect(frag.querySelector('iframe[src*="youtube"]'), 'original iframe should be removed').not.to.be.ok;

        expect(frag.querySelector('script[src*="amp-youtube"]'), 'adds amp youtube script').to.be.ok;
        expect(frag.querySelector('amp-youtube'), 'adds <amp-youtube/> tag').to.be.ok;
        expect(frag.querySelector('amp-youtube').dataset.videoid).to.equal('abcd-1234');
      })
      .end(done);
  });

  it('swaps in article content', function(done) {
    request(app)
      .get(`/gothamist${PATH}`)
      .expect(200)
      .expect(({ text }) => {
        const frag = fragment(text);
        const headline = frag.querySelector('.c-article__headline');

        expect(headline, 'headline should exist').to.exist;
        expect(headline.textContent.trim()).to.equal('Fixture Article Title');
      })
      .end(done);
  });

  it('parses tags', function(done) {
    request(app)
      .get(`/gothamist${PATH}`)
      .expect(200)
      .expect(({ text }) => {
        const frag = fragment(text);
        const tags = frag.querySelectorAll('#amp-article-tags .o-tag');
        const [ tag ] = tags;

        expect(tags.length).to.equal(4);
        expect(tag.getAttribute('href')).to.equal('/tags/nypd');
        expect(tag.textContent).to.equal('#nypd');
      })
      .end(done);
  })
});
