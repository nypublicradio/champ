const jsdom = require('jsdom');


const { JSDOM: { fragment } } = jsdom;

function ampImg(node) {
  const AMP_IMG = fragment('<amp-img layout="responsive" />').firstChild;
  AMP_IMG.setAttribute('src', node.getAttribute('src'));
  AMP_IMG.setAttribute('width', node.getAttribute('width'));
  AMP_IMG.setAttribute('height', node.getAttribute('height'));

  return AMP_IMG;
}

module.exports = {
  ampImg,
};
