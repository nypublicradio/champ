const { expect } = require('chai');
const jsdom = require('jsdom');

const { ampImg } = require('../lib/amp');


const { JSDOM: { fragment } } = jsdom;
const makeElement = html => fragment(html).firstChild;

describe('amp conversions', function() {
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
