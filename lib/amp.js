const jsdom = require('jsdom');


const { JSDOM: { fragment } } = jsdom;
const makeElement = html => fragment(html).firstElementChild;

/**
  Update nodes that match the given selector based on the output of the given `amper` function.

  @function amplify
  @param {Document|DocumentFragment} tree document tree to operate upon
  @param {String} selector CSS selector to target nodes
  @param {Function} amper Mapping function to run against selected nodes
  @return {Document|DocumentFragment} updated tree
*/
function amplify(tree, selector, amper) {
  if (!tree) {
    return;
  }
  const DEEP_COPY = true;

  const targets = tree.querySelectorAll(selector);

  targets.forEach(target => {
    const ampped = amper(target.cloneNode(DEEP_COPY));
    target.parentNode.insertBefore(ampped, target);
    target.parentNode.removeChild(target);
  });

  return tree;
}

/**
  Generate an `<amp-img/>` element configured with the given node's `src`, `width`, and `height`.

  @function ampImg
  @param {HTMLImageElement} node image element from which to source attributes
  @return {HTMLUnknownElement} generated `<amp-img/>` element
*/
function ampImg(node) {
  const AMP_IMG = makeElement('<amp-img layout="responsive" />');
  AMP_IMG.setAttribute('src', node.getAttribute('src'));
  AMP_IMG.setAttribute('width', node.getAttribute('width'));
  AMP_IMG.setAttribute('height', node.getAttribute('height'));

  return AMP_IMG;
}

module.exports = {
  ampImg,
  amplify,
  makeElement,
};
