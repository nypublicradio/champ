const nock = require('nock');
const { expect } = require('chai');

// reassign for convenience
let request = require('supertest');

const app = require('../src/app');


describe('Gothamist route', function() {
  it('returns a 200', function() {
    const TITLE = 'FOO BAR - Gothamist';
    const PATH = '/foo/bar';
    nock(process.env.GOTHAMIST_HOST)
      .get(PATH)
      .query(true)
      .reply(200, `<!doctype html>
        <html>
          <head>
            <title>${TITLE}</title>
          </head>
        </html>
      `);

    request(app)
      .get(`/gothamist${PATH}`)
      .expect(200, (_err, res) => {
        expect(res.text).to.include(`<title>${TITLE}</title>`);
      });
  });

  it('if the upstream returns a 404, so does the app', function(done) {
    const UPSTREAM_PATH = '/foo/bar';

    nock(process.env.GOTHAMIST_HOST)
      .get(UPSTREAM_PATH)
      .query(true) // ignore query strings
      .reply(404);

    request(app)
      .get(`/gothamist${UPSTREAM_PATH}`)
      .expect(404)
      .end(done);
  });
});
