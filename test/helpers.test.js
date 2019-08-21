const { expect } = require('chai');

const {
  iif
} = require('../src/views/helpers');


describe('helpers', function() {

  describe('inline if', function() {
    it('returns expected values', function() {
      expect(iif(true, 'foo', {})).to.equal('foo');
      expect(iif(false, 'foo', {})).to.equal(null, "returns null if a falsey isn't supplied");
      expect(iif(false, 'foo', 'bar', {})).to.equal('bar', 'returns the falsey value if condition is false');
    });
  });
});
