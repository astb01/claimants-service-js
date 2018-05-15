const chai = require('chai');
const dirtyChai = require('dirty-chai');

const expect = chai.expect; // eslint-disable-line prefer-destructuring
const config = require('config');
const nock = require('nock');

const service = require('../../../services/driving-licence-service');

const drivingLicenceServiceUrl = config.get('drivingLicenceServiceUrl');
const drivingLicenceServiceEndPoint = config.get('drivingLicenceServiceEndPoint');
const drivingLicenseSuccessResponse = require('../../data/driving-mock-responses/driving-ok');
const drivingLicense400Response = require('../../data/driving-mock-responses/driving-licence-invalid');

chai.use(dirtyChai); // to allow for expectations to be functions

describe('Driving Licence Service', () => {
  const request = {
    firstName: 'John',
    lastName: 'Doe',
    drivingLicenceNo: 'ADADSADADADAD',
    dob: '12-09-1980',
  };

  it('Should be defined', () => {
    expect(service).to.not.be.undefined();
  });

  describe('Validate Success:', () => {
    beforeEach(() => {
      nock(drivingLicenceServiceUrl)
        .post(`/${drivingLicenceServiceEndPoint}`, request)
        .reply(200, drivingLicenseSuccessResponse);
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it('Should return a successful response given credentials', async () => {
      const response = await service.validate(request);

      expect(typeof response).to.equal('object');

      expect(response.httpStatus).to.equal(200);
      expect(response.message).to.equal('Driving Licence is valid');
      expect(response.status).to.equal(0);
    });
  });

  describe('Validate Unsuccessful:', () => {
    beforeEach(() => {
      nock(drivingLicenceServiceUrl)
        .post(`/${drivingLicenceServiceEndPoint}`, request)
        .reply(400, drivingLicense400Response);
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it('Should return error when unsuccessful when given invalid credentials', async () => {
      try {
        await service.validate(request);
      } catch (err) {
        expect(typeof err).to.equal('object');
        expect(err.message).to.equal('Driving Licence is not valid');
        expect(err.reason).to.exist();
        expect(err.reason).to.equal('Driver details do not match licence number');
        expect(err.status).to.equal(1);
      }
    });
  });

  describe('Unxpected Scenarios', () => {
    beforeEach(() => {
      nock(drivingLicenceServiceUrl)
        .post(`/${drivingLicenceServiceEndPoint}`, request)
        .replyWithError({ message: 'Unexpected Error', statusCode: 503 });
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it('Should handle unexpected errors', async () => {
      try {
        await service.validate(request);
      } catch (err) {
        expect(typeof err).to.equal('object');
      }
    });
  });
});

