const request = require('request-promise-native');


const API_HOST = process.env.CMS_SERVER;
const API_PATH = 'api/v2/pages';

// const LEAD_GALLERY = 'lead_gallery';
// const LEAD_VIDEO   = 'lead_video';
// const LEAD_AUDIO   = 'lead_audio';
const LEAD_IMAGE   = 'lead_image';
const SECTION_PAGE_TYPE = 'standardpages.IndexPage';

function query(path, params) {
  if (typeof path === 'object' || !path) {
    params = path || {};
    path = API_PATH;
  }

  return request({
    baseUrl: API_HOST,
    uri: path,
    qs: params,
    json: true,
  })
}

function byPath(path) {
  return query(`${API_PATH}/find`, {html_path: path});
}

function byId(id) {
  return request({
    baseUrl: API_HOST,
    url: `${API_PATH}/${id}`,
    json: true,
  });
}

const getResizeRule = function({width, height, fit}) {
  if (width != null && height == null) {
    return `width-${width}`
  }
  if (height != null && width == null) {
    return `height-${height}`
  }
  if (width != null && height != null) {
    switch(fit) {
    case 'cover':
      return `min-${width}x${height}`
    case 'contain':
      return `max-${width}x${height}`
    case 'fill':
    default:
      return `fill-${width}x${height}`
    }
  }
  return 'original';
}

function wagtailImage(image = {}, options = {}) {
  let { id } = image;

  const size = getResizeRule(options);

  return `${API_HOST}/images/${id}/${size}`
}

function getThumb(article) {
  let {
    listing_image,
    lead_asset
  } = article;
  if (listing_image) {
    return listing_image;
  } else if (lead_asset && lead_asset.length) {
    let [ lead ] = lead_asset;

    switch(lead.type) {
    case LEAD_IMAGE:
      return lead.value.image;
    default:
      return lead.value.default_image;
    }
  }
}

function getSection(article) {
  if (!article.ancestry || !article.ancestry.length) {
    return {};
  }
  const NEAREST_SECTION = article.ancestry.find(item => item.meta.type === SECTION_PAGE_TYPE);

  if (NEAREST_SECTION) {
    return {
      title: NEAREST_SECTION.title,
      slug: NEAREST_SECTION.slug,
      id: NEAREST_SECTION.id,
    };
  } else {
    return {};
  }
}

function getAuthors(article) {
  if (!article.related_authors || !article.related_authors.length) {
    return [];
  }
  return article.related_authors.map(author => ({
    name: `${author.first_name} ${author.last_name}`,
  }));
}

module.exports = {
  query,
  byPath,
  byId,
  wagtailImage,
  getThumb,
  getSection,
  getAuthors,

  SECTION_PAGE_TYPE,
}
