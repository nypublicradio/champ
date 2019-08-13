const { expect } = require('chai');
const jsdom = require('jsdom');

const {
  ampImg,
  amplify,
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

  // describe('galleries', function() {
  //   it('creates an amp carousel', function() {
  //
  //   });
  // })
});
