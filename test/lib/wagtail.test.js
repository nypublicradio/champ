const nock = require('nock');
const { expect } = require('chai');

const wagtail = require('../../src/lib/wagtail');


describe('wagtail utilities', function() {
  it('query', async function() {
    const API_PATH = '/api/v2/pages';

    nock(process.env.CMS_SERVER)
      .get(API_PATH)
      .reply(200, 'ok');

    let response = await wagtail.query();

    expect(response).to.be.equal('ok');
  });

  it('byPath', async function() {
    const PATH = 'foo';
    const FIND_PATH = '/api/v2/pages/find';

    nock(process.env.CMS_SERVER)
      .get(FIND_PATH)
      .query({html_path: PATH})
      .reply(200, 'ok');

    let response = await wagtail.byPath('foo');

    expect(response).to.be.equal('ok');
  });

  describe('thumbnail picker', function() {
    it('picks the lead asset if it is an image', function() {
      const ARTICLE = {
        lead_asset: [{
          type: 'lead_image',
          value: {
            image: {
              id: 'foo',
            }
          }
        }]
      };

      expect(wagtail.getThumb(ARTICLE)).to.be.deep.equal({id: 'foo'});
    });

    it('picks the lead asset default if it is a gallery', function() {
      const ARTICLE = {
        lead_asset: [{
          type: 'lead_gallery',
          value: {
            default_image: {
              id: 'foo',
            }
          }
        }]
      };

      expect(wagtail.getThumb(ARTICLE)).to.be.deep.equal({id: 'foo'});
    });

    it('picks the listing image if there is one', function() {
      const ARTICLE = {
        lead_asset: [{
          type: 'lead_image',
          value: {
            image: {
              id: 'foo',
            }
          }
        }],
        listing_image: {
          id: 'bar',
        }
      };

      expect(wagtail.getThumb(ARTICLE)).to.be.deep.equal({id: 'bar'});
    });
  });

  describe('getSection', function() {
    it('extracts a section object based on ancestry', function() {
      const ARTICLE = {
        ancestry: [{
          id: 5,
          meta: {
            type: "standardpages.IndexPage",
          },
          slug: 'news',
          title: 'News'
        }, {
          id: 10,
          meta: {
            type: "home.HomePage",
          },
          slug: 'home',
          title: 'Home'
        }, {
          id: 15,
          meta: {
            type: "wagtailcore.Page",
          },
          slug: 'root',
          title: 'Root',
        }]
      };

      expect(wagtail.getSection(ARTICLE)).to.be.deep.equal({
        title: 'News',
        slug: 'news',
        id: 5,
      })
    });
  });
});
