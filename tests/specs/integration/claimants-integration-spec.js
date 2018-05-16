const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiJson = require('chai-json');
const config = require('config');
const nock = require('nock');
const {
  CREATED, OK, BAD_REQUEST, NO_CONTENT, NOT_FOUND, SERVICE_UNAVAILABLE,
} = require('http-status-codes');

const expect = chai.expect; // eslint-disable-line prefer-destructuring
const Claimant = require('../../../models/Claimant');

const api = require('../../../server');

const apiBase = '/api/claimants';
const drivingLicenceServiceUrl = config.get('drivingLicenceServiceUrl');
const drivingLicenceServiceEndPoint = config.get('drivingLicenceServiceEndPoint');
const drivingLicenceSuccessResponse = require('../../data/driving-mock-responses/driving-ok');

chai.use(chaiHttp);
chai.use(chaiJson);

describe('Claimants API:', () => {
  let newClaimant;
  let authToken;

  beforeEach(async () => {
    newClaimant = new Claimant();
    newClaimant.firstName = 'John';
    newClaimant.lastName = 'Doe';
    newClaimant.street = 'Test Street';
    newClaimant.city = 'Manchester';
    newClaimant.postCode = 'M3 4RF';
    newClaimant.dob = '2011-10-31';
    newClaimant.refNo = 'AS234567H';

    await Claimant.remove({}, (err) => {}); // eslint-disable-line no-unused-vars
  });

  it('Should be defined', () => {
    expect(api).to.not.be.undefined();
  });

  describe(`GET ${apiBase}`, () => {
    beforeEach(async () => {
      const response = await chai.request(api)
        .post('/login')
        .send({
          username: config.get('auth.user'),
          password: config.get('auth.password'),
        });

      const parsedDetails = JSON.parse(response.text);
      authToken = parsedDetails.token;
    });

    it('Should return a list of claimants', async () => {
      const createdClaimant = await Claimant.create(newClaimant);
      const response = await chai.request(api)
        .get(apiBase)
        .set('Authorization', `bearer ${authToken}`);

      expect(response).to.have.status(OK);
      expect(response.body).to.be.a('array');
      expect(response.body).to.have.length(1);

      const item = response.body[0];
      expect(item).to.have.property('firstName').eql(createdClaimant.firstName);
    });
  });

  describe(`GET ${apiBase}/:id claimants`, () => {
    beforeEach(async () => {
      const response = await chai.request(api)
        .post('/login')
        .send({
          username: config.get('auth.user'),
          password: config.get('auth.password'),
        });

      const details = JSON.parse(response.text);
      authToken = details.token;
    });

    it('Should return a claimant by ID', async () => {
      const createdClaimant = await Claimant.create(newClaimant);
      const claimantId = createdClaimant.id;

      const response = await chai.request(api)
        .get(`${apiBase}/${claimantId}`)
        .set('Authorization', `bearer ${authToken}`);

      expect(response).to.have.status(OK);
      expect(typeof response.body).to.equal('object');
      expect(response.body).to.have.property('firstName');
      expect(response.body).to.have.property('lastName');
      expect(response.body).to.have.property('street');
      expect(response.body).to.have.property('city');
      expect(response.body).to.have.property('postCode');
      expect(response.body).to.have.property('refNo');
      expect(response.body).to.have.property('drivingLicenceNo');
      expect(response.body).to.have.property('dob');
    });

    it('Should return 404 when claimant not found', async () => {
      const claimantId = 9999999;

      try {
        await chai.request(api)
          .get(`${apiBase}/${claimantId}`)
          .set('Authorization', `bearer ${authToken}`);
      } catch (err) {
        expect(err.status).to.equal(NOT_FOUND);
      }
    });
  });

  describe(`POST ${apiBase}`, () => {
    beforeEach(async () => {
      const response = await chai.request(api)
        .post('/login')
        .send({
          username: config.get('auth.user'),
          password: config.get('auth.password'),
        });

      const details = JSON.parse(response.text);
      authToken = details.token;
    });

    it('Should allow claimant to be added', async () => {
      const response = await chai.request(api)
        .post(apiBase)
        .send(newClaimant)
        .set('Authorization', `bearer ${authToken}`);

      expect(response).to.have.status(CREATED);
      expect(typeof response.body).to.equal('object');
      expect(response.body).to.have.property('firstName').eql(newClaimant.firstName);
      expect(response.body).to.have.property('lastName').eql(newClaimant.lastName);
      expect(response.body).to.have.property('street').eql(newClaimant.street);
      expect(response.body).to.have.property('city').eql(newClaimant.city);
      expect(response.body).to.have.property('postCode').eql(newClaimant.postCode);
      expect(response.body).to.have.property('refNo').eql(newClaimant.refNo);
      expect(response.body).to.have.property('drivingLicenceNo').eql(newClaimant.drivingLicenceNo);
      expect(response.body).to.have.property('dob').eql(newClaimant.dob);
    });
  });

  describe(`PUT ${apiBase}/:id`, () => {
    beforeEach(async () => {
      const response = await chai.request(api)
        .post('/login')
        .send({
          username: config.get('auth.user'),
          password: config.get('auth.password'),
        });

      const details = JSON.parse(response.text);
      authToken = details.token;
    });

    it('Should update claimants details', async () => {
      const createdClaimant = await Claimant.create(newClaimant);
      const updateRequest = {
        street: 'New Street',
        city: 'Liverpool',
        postCode: 'L3 5TG',
      };

      const response = await chai.request(api)
        .put(`${apiBase}/${createdClaimant.id}`)
        .set('Authorization', `bearer ${authToken}`)
        .send(updateRequest);

      expect(response).to.have.status(NO_CONTENT);
    });

    it('Should return 404 when claimant not found', async () => {
      const claimantId = '507f1f77bcf86cd799439011';
      const updateRequest = {
        street: 'New Street',
        city: 'Liverpool',
        postCode: 'L3 5TG',
      };

      try {
        await chai.request(api)
          .put(`${apiBase}/${claimantId}`)
          .set('Authorization', `bearer ${authToken}`)
          .send(updateRequest);
      } catch (err) {
        expect(err).to.exist();
        expect(err.status).to.equal(NOT_FOUND);
      }
    });

    it('Should reject update when Ref No provided in body', async () => {
      const claimantId = '5a8ea050fe07b60eda004c6e';
      const updateRequest = { refNo: 'JT321345G' };

      try {
        await chai.request(api)
          .put(`${apiBase}/${claimantId}`)
          .set('Authorization', `bearer ${authToken}`)
          .send(updateRequest);
      } catch (err) {
        expect(err.response.status).to.equal(BAD_REQUEST);
        expect(err.response.text).to.equal('ValidationError');
      }
    });
  });

  describe(`DELETE ${apiBase}`, () => {
    beforeEach(async () => {
      const response = await chai.request(api)
        .post('/login')
        .send({
          username: config.get('auth.user'),
          password: config.get('auth.password'),
        });

      const details = JSON.parse(response.text);
      authToken = details.token;
    });

    it('Should delete a claimant by ID', async () => {
      const createdClaimant = await Claimant.create(newClaimant);

      const response = await chai.request(api)
        .del(`${apiBase}/${createdClaimant.id}`)
        .set('Authorization', `bearer ${authToken}`);

      expect(response.status).to.equal(OK);
    });

    it('Should return 404 when claimant not found', async () => {
      const claimantId = '5a8ea050fe07b60eda004c6e';

      try {
        await chai.request(api)
          .del(`${apiBase}/${claimantId}`)
          .set('Authorization', `bearer ${authToken}`);
      } catch (err) {
        expect(err.status).to.equal(NOT_FOUND);
      }
    });
  });

  describe(`GET ${apiBase}/:ref`, () => {
    beforeEach(async () => {
      const response = await chai.request(api)
        .post('/login')
        .send({
          username: config.get('auth.user'),
          password: config.get('auth.password'),
        });


      const details = JSON.parse(response.text);
      authToken = details.token;
    });

    it('Should find claimant by Ref No', async () => {
      const createdClaimant = await Claimant.create(newClaimant);
      const response = await chai.request(api)
        .get(`${apiBase}/ref/${createdClaimant.refNo}`)
        .set('Authorization', `bearer ${authToken}`);

      expect(response).to.have.status(OK);
      expect(typeof response.body).to.equal('object');
      expect(response.body).to.have.property('firstName').eql(createdClaimant.firstName);
      expect(response.body).to.have.property('lastName').eql(createdClaimant.lastName);
      expect(response.body).to.have.property('street').eql(createdClaimant.street);
      expect(response.body).to.have.property('city').eql(createdClaimant.city);
      expect(response.body).to.have.property('postCode').eql(createdClaimant.postCode);
      expect(response.body).to.have.property('refNo').eql(createdClaimant.refNo);
      expect(response.body).to.have.property('drivingLicenceNo').eql(createdClaimant.drivingLicenceNo);
      expect(response.body).to.have.property('dob').eql(createdClaimant.dob);
    });

    it('Should return 404 when claimant not found by Ref No', async () => {
      const refNo = 'BG123456T';

      try {
        await chai.request(api)
          .get(`${apiBase}/ref/${refNo}`)
          .set('Authorization', `bearer ${authToken}`);
      } catch (err) {
        expect(err.status).to.equal(NOT_FOUND);
      }
    });
  });

  describe('Validation', () => {
    beforeEach(async () => {
      nock(drivingLicenceServiceUrl)
        .post(`/${drivingLicenceServiceEndPoint}`, {
          firstName: /.*/i,
          lastName: /.*/i,
          drivingLicenceNo: /.*/i,
        })
        .reply(200, drivingLicenceSuccessResponse);

      const response = await chai.request(api)
        .post('/login')
        .send({
          username: config.get('auth.user'),
          password: config.get('auth.password'),
        });

      const details = JSON.parse(response.text);
      authToken = details.token;
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it('Should return 400 when Ref No not provided on POST', async () => {
      newClaimant.refNo = '';

      try {
        await chai.request(api)
          .post(apiBase)
          .set('Authorization', `bearer ${authToken}`)
          .send(newClaimant);
      } catch (err) {
        expect(err).to.have.status(BAD_REQUEST);
      }
    });

    it('Should return 400 when Ref No is not the correct format', async () => {
      newClaimant.refNo = 'ASDF';

      try {
        await chai.request(api)
          .post(apiBase)
          .set('Authorization', `bearer ${authToken}`)
          .send(newClaimant);
      } catch (err) {
        expect(err).to.have.status(BAD_REQUEST);
      }
    });

    it('Should return 400 when required fields are missing', async () => {
      try {
        await chai.request(api)
          .post(apiBase)
          .set('Authorization', `bearer ${authToken}`)
          .send({});
      } catch (err) {
        expect(err).to.have.status(BAD_REQUEST);
      }
    });
  });

  describe('Driving Licence', () => {
    describe('Validation', () => {
      beforeEach(async () => {
        nock(drivingLicenceServiceUrl)
          .post(`/${drivingLicenceServiceEndPoint}`, {
            firstName: /.*/i,
            lastName: /.*/i,
            drivingLicenceNo: /.*/i,
            dob: /.*/i,
          })
          .reply(200, drivingLicenceSuccessResponse);

        const response = await chai.request(api)
          .post('/login')
          .send({
            username: config.get('auth.user'),
            password: config.get('auth.password'),
          });

        const details = JSON.parse(response.text);
        authToken = details.token;
      });

      afterEach(() => {
        nock.cleanAll();
      });

      it('Should return 400 if invalid', async () => {
        newClaimant.drivingLicenceNo = 'CAMERON610096DWDXY';

        try {
          await chai.request(api)
            .post(apiBase)
            .send(newClaimant)
            .set('Authorization', `bearer ${authToken}`);
        } catch (err) {
          expect(err).to.have.status(BAD_REQUEST);
        }
      });

      it('Should allow user with driving licence to be created', async () => {
        newClaimant.drivingLicenceNo = 'CAMERON610096DWDXYA';

        const response = await chai.request(api)
          .post(`${apiBase}`)
          .send(newClaimant)
          .set('Authorization', `bearer ${authToken}`);

        expect(response).to.have.status(CREATED);
        expect(typeof response.body).to.equal('object');
        expect(response.body).to.have.property('firstName').eql(newClaimant.firstName);
        expect(response.body).to.have.property('lastName').eql(newClaimant.lastName);
        expect(response.body).to.have.property('street').eql(newClaimant.street);
        expect(response.body).to.have.property('city').eql(newClaimant.city);
        expect(response.body).to.have.property('postCode').eql(newClaimant.postCode);
        expect(response.body).to.have.property('refNo').eql(newClaimant.refNo);
        expect(response.body).to.have.property('drivingLicenceNo').eql(newClaimant.drivingLicenceNo);
        expect(response.body).to.have.property('dob').eql(newClaimant.dob);
      });
    });
  });

  describe('Negative Scenario', () => {
    beforeEach(async () => {
      nock(drivingLicenceServiceUrl)
        .post(`/${drivingLicenceServiceEndPoint}`, {
          firstName: /.*/i,
          lastName: /.*/i,
          drivingLicenceNo: /.*/i,
          dob: /.*/i,
        })
        .replyWithError({ code: 'ETIMEDOUT' });

      const response = await chai.request(api)
        .post('/login')
        .send({
          username: config.get('auth.user'),
          password: config.get('auth.password'),
        });

      const details = JSON.parse(response.text);
      authToken = details.token;
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it('Should handle when service not available', async () => {
      newClaimant.drivingLicenceNo = 'CAMERON610096DWDXYA';

      try {
        await chai.request(api)
          .post(`${apiBase}`)
          .send(newClaimant)
          .set('Authorization', `bearer ${authToken}`);
      } catch (err) {
        expect(err).to.have.status(SERVICE_UNAVAILABLE);
      }
    });
  });
});
