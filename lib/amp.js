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

/**
  Generate an `<amp-twitter/>` element configured to load the given blockquote's tweet.

  @function ampTweet
  @param {HTMLQuoteElement} blockquote blockquote surrounding an embedded tweet
  @return {HTMLUnknownElement} the generated `<amp-twitter/>` element
*/
function ampTweet(blockquote) {
  const AMP_TWEET = makeElement('<amp-twitter layout="responsive"/>');
  if (!blockquote) {
    AMP_TWEET;
  }

  const tweetLink = blockquote.querySelector('a[href*=status]');

  if (tweetLink) {
    // tweet ID is the final segment of the tweet link url
    AMP_TWEET.dataset.tweetid = tweetLink.pathname.split('/').filter(s => s).slice(-1);
  }
  AMP_TWEET.setAttribute('width', '486');
  AMP_TWEET.setAttribute('height', '657');

  return AMP_TWEET;
}

module.exports = {
  ampImg,
  amplify,
  ampTweet,
  makeElement,
};
