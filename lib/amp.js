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

/**
  Generate an `<amp-instagram/>` element configure to load the given blockquote's instagram post

  @function ampInsta
  @param {HTMLQuoteElement} blockquote blockquote surrounding an embedded post
  @return {HTMLUnknownElement} the generated `<amp-instgram/>` element
*/
function ampInsta(blockquote) {
  const AMP_INSTA = makeElement('<amp-instagram layout="responsive"/>');
  if (!blockquote) {
    return AMP_INSTA;
  }

  const permalink = blockquote.dataset.instgrmPermalink;

  if (permalink) {
    AMP_INSTA.dataset.shortcode = permalink.split('/').filter(s => s).slice(-1);
  }
  AMP_INSTA.setAttribute('width', '400');
  AMP_INSTA.setAttribute('height', '400');

  return AMP_INSTA;
}

/**
  Generate an `<amp-youtube/>` element configure to load the given iframe's youtube video

  @function ampYoutube
  @param {HTMLIFrameElement} iframe youtube iframe
  @return {HTMLUnknownElement} the generated `<amp-youtube/>` element
*/
function ampYoutube(iframe) {
  const AMP_YT = makeElement('<amp-youtube layout="responsive"/>');
  if (!iframe) {
    return AMP_YT;
  }

  AMP_YT.dataset.videoid = iframe.src.split('/').filter(x => x).slice(-1);
  AMP_YT.setAttribute('width', '640');
  AMP_YT.setAttribute('height', '360');

  return AMP_YT;
}


/**
  Generate an `<amp-iframe/>` element configure to load the given iframe's src

  @function ampIframe
  @param {HTMLIFrameElement} iframe iframe element
  @return {HTMLUnknownElement} the generated `<amp-iframe/>` element
*/
function ampIframe(iframe) {
  const AMP_IFRAME = makeElement('<amp-iframe layout="responsive"/>');
  if (!iframe) {
    return AMP_IFRAME;
  }

  AMP_IFRAME.setAttribute('src', iframe.getAttribute('src'));
  AMP_IFRAME.setAttribute('width', '480');
  AMP_IFRAME.setAttribute('height', '480');
  AMP_IFRAME.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');

  return AMP_IFRAME;

}

module.exports = {
  ampImg,
  amplify,
  ampTweet,
  ampInsta,
  ampYoutube,
  ampIframe,
  makeElement,
};
