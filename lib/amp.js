const jsdom = require('jsdom');


const { JSDOM: { fragment } } = jsdom;

/**
  Update nodes that match the given selector based on the output of the given `amper` function.

  @function amplify
  @param {Document|DocumentFragment} tree document tree to operate upon
  @param {String} selector CSS selector to target nodes
  @param {Function} amper Mapping function to run against selected nodes
  @return {Document|DocumentFragment} updated tree
*/
function amplify(tree, selector, amper) {
  const DEEP_COPY = true;

  const targets = tree.querySelectorAll(selector);

  targets.forEach(target => {
    const ampped = amper(target.cloneNode(DEEP_COPY));
    tree.insertBefore(ampped, target);
    tree.removeChild(target);
  });

  return tree;
}

function ampImg(node) {
  const AMP_IMG = fragment('<amp-img layout="responsive" />').firstChild;
  AMP_IMG.setAttribute('src', node.getAttribute('src'));
  AMP_IMG.setAttribute('width', node.getAttribute('width'));
  AMP_IMG.setAttribute('height', node.getAttribute('height'));

  return AMP_IMG;
}

module.exports = {
  ampImg,
  amplify,
};
