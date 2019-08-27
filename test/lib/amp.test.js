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
  ampVimeo,
  ampReddit,
  makeElement,
} = require('../../src/lib/amp');


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

    it('handles embeds without data attrs', function() {
      const IG_SHORTCODE = '0JdenQkoP4';
      const BLOCKQUOTE = makeElement(`
        <blockquote class="instagram-media" data-instgrm-captioned="" data-instgrm-version="4" style="">
          <div style="padding:8px;">
            <div style="">
              <div style=""></div>
            </div>
            <p style="">
              <a href="https://instagram.com/p/${IG_SHORTCODE}/" style="" target="_blank" rel="noopener">I died tonight. This is what heaven looks like, in case anyone was wondering #cheese #eeeeats #wine #williamsburg #brooklyn #thecamlin</a>
            </p>
            <p style="">
              A photo posted by @nellcasey on <time style=" font-family:Arial,sans-serif; font-size:14px; line-height:17px;" datetime="2015-03-13T00:30:16+00:00">Mar 12, 2015 at 5:30pm PDT</time>
            </p>
          </div>
        </blockquote>
      `);

      const AMP_IG = ampInsta(BLOCKQUOTE);

      expect(AMP_IG.outerHTML).to.match(/<amp-instagram.*><\/amp-instagram>/);
      expect(AMP_IG.getAttribute('data-shortcode')).to.equal(IG_SHORTCODE);
    })
  });

  describe('reddit', function() {
    it('converts a blockquote to an amp-reddit node', function() {
      const POST_URL = 'http://reddit.com/';
      const BLOCKQUOTE = makeElement(`
        <blockquote>
          <a href="${POST_URL}" target="_blank" rel="noopener">Falcon/hawk? I saw on 86th and 3rd eating what looks to be a pigeon. He did not care at all about all the people around him taking pictures</a>
          <p>
            from <a href="http://www.reddit.com/r/nyc" target="_blank" rel="noopener">r/nyc</a>
          </p>
        </blockquote>
      `);

      const AMP_REDDIT = ampReddit(BLOCKQUOTE);

      expect(AMP_REDDIT.outerHTML).to.match(/<amp-reddit.*><\/amp-reddit>/);
      expect(AMP_REDDIT.getAttribute('data-src')).to.equal(POST_URL);
      expect(AMP_REDDIT.getAttribute('data-embedtype')).to.equal('post');
    });
  });


  describe('youtube', function() {
    it('converts a youtube iframe into an amp-youtube node', function() {
      const YOUTUBE_ID = 'abcd1234';
      const IFRAME = makeElement(`<iframe src="https://www.youtube.com/embed/${YOUTUBE_ID}?feature=oembed" />`);

      const AMP_YT = ampYoutube(IFRAME);

      expect(AMP_YT.outerHTML).to.match(/<amp-youtube.*><\/amp-youtube>/);
      expect(AMP_YT.getAttribute('data-videoid')).to.equal(YOUTUBE_ID);
    });
  });

  describe('vimeo', function() {
    it('converts a vimeo iframe into an amp-iframe node', function() {
      const VIMEO_ID = 'abcd1234';
      const IFRAME = makeElement(`<iframe src="https://player.vimeo.com/video/${VIMEO_ID}?app_id=122963" />`);

      const AMP_VIMEO = ampVimeo(IFRAME);

      expect(AMP_VIMEO.outerHTML).to.match(/<amp-vimeo.*><\/amp-vimeo>/);
      expect(AMP_VIMEO.getAttribute('data-videoid')).to.equal(VIMEO_ID);
    });
  });

  describe('generic iframes', function() {
    it('converts any iframe to an amp-iframe node', function() {
      const SRC = 'http://google.com';
      const IFRAME = makeElement(`<iframe src="${SRC}" />`);

      const AMP_IFRAME = ampIframe(IFRAME);

      expect(AMP_IFRAME.outerHTML).to.match(/<amp-iframe.*><\/amp-iframe>/);
      expect(AMP_IFRAME.getAttribute('src')).to.equal(SRC);
    });
  });

  describe.skip('galleries', function() {
    it('creates an amp carousel', function() {

    });
  });
});
