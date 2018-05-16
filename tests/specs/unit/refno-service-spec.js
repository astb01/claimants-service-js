const chai = require('chai');
const dirtyChai = require('dirty-chai');

const expect = chai.expect; // eslint-disable-line prefer-destructuring
const nock = require('nock');
const config = require('config');
const { OK, BAD_REQUEST } = require('http-status-codes');

const ninoService = require('../../../services/refno-service');

const serviceUrl = config.get('refNoServiceUrl');
const servicePath = config.get('refNoServicePath');

chai.use(dirtyChai);

describe('Ref No Service', () => {
  it('Should be defined', () => {
    expect(ninoService).to.not.be.undefined();
  });

  describe('Positive Tests', () => {
    const requestBody = {
      dob: '1980/09/20',
      refno: 'HT234567R',
    };

    beforeEach(() => {
      nock(`${serviceUrl}`)
        .post(`/${servicePath}`, requestBody)
        .reply(OK, {
          status: OK,
          internalStatus: 1,
          message: 'Details are valid',
        });
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it(`Should return with status ${OK} when valid details provided`, async () => {
      const result = await ninoService.validate(requestBody);

      expect(result).to.not.be.undefined();
      expect(result.status).to.equal(OK);
      expect(typeof result).to.equal('object');
    });
  });

  describe('Negative Tests', () => {
    const requestBody = {
      dob: '1980/09/20',
    };

    beforeEach(() => {
      nock(`${serviceUrl}`)
        .post(`/${servicePath}`, requestBody)
        .reply(BAD_REQUEST, {
          status: BAD_REQUEST,
          internalStatus: 2,
          message: 'Invalid details provided',
        });
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it(`Should return ${BAD_REQUEST} when invalid request used`, async () => {
      const result = await ninoService.validate(requestBody);

      expect(result).to.not.be.undefined();

      // NOCK returns response as error property:
      expect(result.error.status).to.equal(BAD_REQUEST);
    });
  });
});
