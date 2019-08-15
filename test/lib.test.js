const { expect } = require('chai');
const jsdom = require('jsdom');

const {
  ampImg,
  amplify,
  ampTweet,
  ampInsta,
  ampYoutube,
  ampIframe,
  ampFacebook,
  makeElement,
} = require('../lib/amp');


const { JSDOM: { fragment } } = jsdom;

describe('amp conversions', function() {
  describe('amplify', function() {
    it('takes a tree, a selector, and an amping function', function() {
      const HTML = `
        <div>
          <p>foo</p>
        </div>
        <span>bar</span>
        <p>baz</p>
      `;
      const tree = fragment(HTML);
      // comma operator returns right-most value
      const amper = node => (node.textContent = node.textContent.toUpperCase(), node);

      amplify(tree, 'p', amper);

      let text = tree.textContent
        .trim()
        .split('\n')
        .map(s => s.trim())
        .filter(s => s)
        .join(' ');
      expect(text).to.equal('FOO bar BAZ');
      expect(tree.childElementCount).to.equal(3);
    });

    it('can handle null inputs', function() {
      // these should run without throwing
      amplify(null, null, null);
      amplify(fragment(), null, null);
    })
  });

  describe('images', function() {
    it('converts an img node to an amp-img node', function() {
      const SRC = 'foo.jpg';
      const WIDTH = '100';
      const HEIGHT = '100';

      const IMAGE = makeElement(`<img src="${SRC}" width="${WIDTH}" height="${HEIGHT}" />`);

      const AMP_IMAGE = ampImg(IMAGE);

      expect(AMP_IMAGE.outerHTML).to.match(/<amp-img.*><\/amp-img>/);

      expect(AMP_IMAGE.getAttribute('src')).to.equal(SRC);
      expect(AMP_IMAGE.getAttribute('width')).to.equal(WIDTH);
      expect(AMP_IMAGE.getAttribute('height')).to.equal(HEIGHT);
    });
  });

  describe('facebook posts', function() {
    it('converts a facebook post into amp-facebook nodes', function() {
      const URL = 'https://www.facebook.com/OcasioCortez/posts/2329093933847944';
      const EMBED = makeElement(`
        <div class="fb-post" data-href="${URL}" data-width="552">
          <blockquote cite="${URL}" class="fb-xfbml-parse-ignore">
            <p>
              “Boys will be boys.”

              Is that also the reason why you’ve chosen to block the Violence Against Women act too, Mitch...
            </p>
            Posted by <a href="https://www.facebook.com/OcasioCortez/">Alexandria Ocasio-Cortez</a> on&nbsp;<a href="https://www.facebook.com/OcasioCortez/posts/2328176200606384">Wednesday, August 7, 2019</a>
          </blockquote>
        </div>
      `);

      const AMP_FB_POST = ampFacebook(EMBED);

      expect(AMP_FB_POST.outerHTML).to.match(/<amp-facebook.*><\/amp-facebook>/);
      expect(AMP_FB_POST.getAttribute('data-href')).to.equal(URL);
      expect(AMP_FB_POST.getAttribute('data-embed-as')).to.equal('post');
    });

    it('converts a facebook video into amp-facebook nodes', function() {
      const URL = 'https://www.facebook.com/NowThisNews/videos/374689146762745/';
      const EMBED = makeElement(`
        <div class="fb-video" data-href="${URL}">
          <blockquote cite="${URL}" class="fb-xfbml-parse-ignore">
            <a href="${URL}">Alexandria Ocasio-Cortez Calls Trump a &#039;Racist&#039; at Shooting Vigil</a>
            <p>
              ‘Whether it’s from misogyny or whether it’s from racism, you’re not more of a man with a gun.’ — AOC called Trump a racist, before speaking directly to young people being radicalized by violent and hateful ideologies (via NowThis Politics)
            </p>
            Posted by <a href="https://www.facebook.com/NowThisNews/">NowThis</a> on Tuesday, August 6, 2019
          </blockquote>
        </div>
      `);

      const AMP_FB_POST = ampFacebook(EMBED);

      expect(AMP_FB_POST.outerHTML).to.match(/<amp-facebook.*><\/amp-facebook>/);
      expect(AMP_FB_POST.getAttribute('data-href')).to.equal(URL);
      expect(AMP_FB_POST.getAttribute('data-embed-as')).to.equal('video');
    })
  });

  describe('tweets', function() {
    it('converts a blockquote to an amp-twitter node', function() {
      const TWEET_ID = '12345';
      const BLOCKQUOTE = makeElement(`
        <blockquote>
          <p lang="en" dir="ltr">foo bar</p>
          <a href="https://twitter.com/username/status/${TWEET_ID}?some=param">date</a>
        </blockquote>
      `);

      const AMP_TWEET = ampTweet(BLOCKQUOTE);

      expect(AMP_TWEET.outerHTML).to.match(/<amp-twitter.*><\/amp-twitter>/);
      expect(AMP_TWEET.getAttribute('data-tweetid')).to.equal(TWEET_ID);
    });
  });

  describe('instagram', function() {
    it('converts a blockquote to an amp-instagram node', function() {
      const IG_SHORTCODE = '12345';
      const BLOCKQUOTE = makeElement(`
        <blockquote data-instgrm-permalink="https://www.instagram.com/p/${IG_SHORTCODE}/">
          <a href="instagram.com">intagram link</a>
        </blockquote>
      `);

      const AMP_IG = ampInsta(BLOCKQUOTE);

      expect(AMP_IG.outerHTML).to.match(/<amp-instagram.*><\/amp-instagram>/);
      expect(AMP_IG.getAttribute('data-shortcode')).to.equal(IG_SHORTCODE);
    });
  });

  describe('youtube', function() {
    it('converts a youtube iframe into an amp-youtube node', function() {
      const YOUTUBE_ID = 'abcd1234';
      const IFRAME = makeElement(`<iframe src="${YOUTUBE_ID}" />`);

      const AMP_YT = ampYoutube(IFRAME);

      expect(AMP_YT.outerHTML).to.match(/<amp-youtube.*><\/amp-youtube>/);
      expect(AMP_YT.getAttribute('data-videoid')).to.equal(YOUTUBE_ID);
    });
  });

  describe('generic iframes', function() {
    it('converts any iframe to an amp-iframe node', function() {
      const SRC = 'http://google.com';
      const IFRAME = makeElement(`<iframe src="${SRC}" />`);

      const AMP_IFRAME = ampIframe(IFRAME);

      expect(AMP_IFRAME.outerHTML).to.match(/<amp-iframe.*><\/amp-iframe>/);
      expect(AMP_IFRAME.getAttribute('src')).to.equal(SRC);
    })

  })

  describe.skip('galleries', function() {
    it('creates an amp carousel', function() {

    });
  });
});
