const chai = require('chai');
const chaiHtpp = require('chai-http');
const { auth: { user, password } } = require('config');
const dirtyChai = require('dirty-chai');
const { OK, UNAUTHORIZED, BAD_REQUEST } = require('http-status-codes');

const expect = chai.expect; // eslint-disable-line prefer-destructuring

chai.use(chaiHtpp);
chai.use(dirtyChai);

const apiBase = '/login';
const api = require('../../../server');

describe('Authentication', () => {
  it('Should return 200 when successful', async () => {
    const response = await chai.request(api)
      .post(`${apiBase}`)
      .send({
        username: user,
        password,
      });

    const { token } = JSON.parse(response.text);

    expect(response.status).to.equal(OK);
    expect(token).to.not.be.null();
  });

  it('Should return status 400 when username not provided', async () => {
    try {
      await chai.request(api)
        .post(`${apiBase}`)
        .send({ password: '12131' });
    } catch (err) {
      expect(err.status).to.equal(BAD_REQUEST);
    }
  });

  it('Should return status 400 when password not provided', async () => {
    try {
      await chai.request(api).post(`${apiBase}`).send({ username: 'test' });
    } catch (err) {
      expect(err.status).to.equal(BAD_REQUEST);
    }
  });

  it('Should return 401 when password does not match', async () => {
    try {
      await chai.request(api)
        .post(`${apiBase}`)
        .send({
          username: 'test',
          password: '12313',
        });
    } catch (err) {
      expect(err.status).to.equal(UNAUTHORIZED);
    }
  });

  it('Should return 401 when user not authorised', async () => {
    try {
      await chai.request(api)
        .post(`${apiBase}`)
        .send({
          username: 'joe',
          password: '12313',
        });
    } catch (err) {
      expect(err.status).to.equal(UNAUTHORIZED);
    }
  });
});
