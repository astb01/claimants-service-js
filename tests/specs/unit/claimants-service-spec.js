// Added for rewire.js:
/* eslint no-underscore-dangle: 0 */

const chai = require('chai');
const dirtyChai = require('dirty-chai');

const expect = chai.expect; // eslint-disable-line prefer-destructuring
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const Claimant = require('../../../models/Claimant');
const claimantsService = require('../../../services/claimants-service');
const drivingLicenceService = require('../../../services/driving-licence-service');
const rewire = require('rewire');
const {
  BAD_REQUEST, CREATED, NO_CONTENT, NOT_FOUND, SERVICE_UNAVAILABLE,
} = require('http-status-codes');

const successResponse = require('../../data/driving-mock-responses/driving-ok');
const badRequestResponse = require('../../data/driving-mock-responses/driving-licence-invalid');

const claimantsServiceMock = rewire('../../../services/claimants-service');

chai.use(dirtyChai);
chai.use(sinonChai);

const sandbox = sinon.sandbox.create();

describe('Claimants Service', () => {
  const expectedSingleResult = {
    _id: '21321313',
    firstName: 'John',
    lastName: 'Doe',
    street: 'Some street',
    city: 'Some City',
    postCode: 'M12 4RT',
  };

  let joiMock;

  it('Should be defined', () => {
    expect(claimantsService).to.not.be.undefined();
  });

  describe('Get Claimants', () => {
    let findStub;
    const req = {};

    beforeEach(() => {
      findStub = sandbox.stub(Claimant, 'find');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('Should fetch all claimants', async () => {
      const res = {
        send: sandbox.spy(),
      };

      const expectedResult = [expectedSingleResult];

      findStub.resolves(expectedResult);

      await claimantsService.getClaimants(req, res);
      expect(res.send).to.have.been.calledOnce();
    });
  });

  describe('Get Claimant By ID', () => {
    let findByIdStub;
    let req = {};

    beforeEach(() => {
      findByIdStub = sandbox.stub(Claimant, 'findById');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('Should retrieve a claimant by ID', async () => {
      const res = {
        send: sandbox.spy(),
      };

      req = {
        params: {},
      };

      req.params.claimantId = '12345678';

      findByIdStub.resolves(expectedSingleResult);

      await claimantsService.getClaimantById(req, res);
      expect(res.send).to.have.been.calledOnce();
    });

    it('Should return 404 when claimant not found', async () => {
      const res = {
        send: sandbox.spy(),
        status: sandbox.stub(),
      };
      const errorMessage = 'No claimant with ID found';

      findByIdStub.rejects(errorMessage);
      res.status.withArgs(NOT_FOUND).returns(res);

      await claimantsService.getClaimantById(req, res);
      expect(res.send).to.have.been.calledWith(errorMessage);
    });
  });

  describe('Create Claimants', () => {
    let createStub;
    const req = {};
    let drivingLicenceStub;
    const createRequest = (drivingLicenceNo, nino) => ({
      firstName: 'John',
      lastName: 'Doe',
      street: 'Some street',
      city: 'Some City',
      postCode: 'M12 4RT',
      nino,
      drivingLicenceNo,
    });

    beforeEach(() => {
      createStub = sandbox.stub(Claimant, 'create');
      drivingLicenceStub = sandbox.stub(drivingLicenceService, 'validate');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('Should create a claimant when provided all details', async () => {
      const res = {
        send: sandbox.spy(),
        status: sandbox.stub(),
      };

      req.body = createRequest('CAMERON610096DWDXYA', 'JT123456G');

      joiMock = {
        validate: (body, schema, cb) => {
          cb(null, expectedSingleResult);
        },
      };

      claimantsServiceMock.__set__('Joi', joiMock);

      drivingLicenceStub.returns(successResponse);

      createStub.returns(expectedSingleResult);

      res.status.withArgs(CREATED).returns(res);

      await claimantsService.createClaimant(req, res);

      expect(res.send).to.have.been.calledWith(expectedSingleResult);
    });

    it('Should return 400 when validation failed', async () => {
      const res = {
        send: sandbox.spy(),
        status: sandbox.stub(),
      };

      req.body = createRequest('CAMERON610096DWDXYA123131', 'JT123456G');

      joiMock = {
        validate: (body, schema, cb) => {
          cb(null);
        },
      };

      claimantsServiceMock.__set__('Joi', joiMock);

      res.status.withArgs(BAD_REQUEST).returns(res);

      await claimantsService.createClaimant(req, res);

      expect(res.send).to.have.been.calledOnce();
    });

    it('Should create a claimant when valid driving licence provided', async () => {
      const res = {
        send: sandbox.spy(),
        status: sandbox.stub(),
      };

      req.body = createRequest('CAMERON610096DWDXYA', 'JT123456G');

      joiMock = {
        validate: (body, schema, cb) => {
          cb(null, req.body);
        },
      };

      claimantsServiceMock.__set__('Joi', joiMock);

      drivingLicenceStub.returns(successResponse);

      createStub.returns(expectedSingleResult);

      res.status.withArgs(CREATED).returns(res);

      await claimantsService.createClaimant(req, res);

      expect(res.send).to.have.been.calledWith(expectedSingleResult);
    });

    it('Should return 400 when invalid driving licence details provided', async () => {
      const res = {
        send: sandbox.spy(),
        status: sandbox.stub(),
      };

      req.body = createRequest('CAMERON610096DWDXYA', 'JT123456G');

      joiMock = {
        validate: (body, schema, cb) => {
          cb(null, req.body);
        },
      };

      claimantsServiceMock.__set__('Joi', joiMock);

      drivingLicenceStub.rejects(badRequestResponse);

      res.status.withArgs(badRequestResponse.httpStatus).returns(res);

      await claimantsService.createClaimant(req, res);

      expect(res.send).to.have.been.calledWith(badRequestResponse);
    });

    it('Should handle error when driving service returns unexpected error', async () => {
      const res = {
        send: sandbox.spy(),
        status: sandbox.stub(),
      };

      req.body = createRequest('CAMERON610096DWDXYA', 'JT123456G');

      joiMock = {
        validate: (body, schema, cb) => {
          cb(null, req.body);
        },
      };

      claimantsServiceMock.__set__('Joi', joiMock);

      drivingLicenceStub.resolves({ message: 'Something went wrong', statusCode: SERVICE_UNAVAILABLE });

      res.status.withArgs(SERVICE_UNAVAILABLE).returns(res);

      await claimantsService.createClaimant(req, res);

      expect(res.send).to.have.been.calledOnce();
    });

    it('Should create a claimant when driving licence not provided', async () => {
      const res = {
        send: sandbox.spy(),
        status: sandbox.stub(),
      };

      req.body = createRequest(null, 'JT123456G');

      joiMock = {
        validate: (body, schema, cb) => {
          cb(null, req.body);
        },
      };

      createStub.returns(expectedSingleResult);

      res.status.withArgs(CREATED).returns(res);

      await claimantsService.createClaimant(req, res);

      expect(res.send).to.have.been.calledWith(expectedSingleResult);
    });

    it('Should return 400 when NINO is not valid', async () => {
      const res = {
        send: sandbox.spy(),
        status: sandbox.stub(),
      };

      req.body = createRequest('CAMERON610096DWDXYA', '12345');

      joiMock = {
        validate: (body, schema, cb) => {
          cb(null);
        },
      };

      claimantsServiceMock.__set__('Joi', joiMock);

      res.status.withArgs(BAD_REQUEST).returns(res);

      await claimantsService.createClaimant(req, res);

      expect(res.send).to.have.been.calledOnce();
    });
  });

  describe('Update Claimants', () => {
    let updateStub;
    let req = {};
    const createUpdateRequest = claimantId => ({
      params: claimantId,
      body: {
        firstName: 'John',
        lastName: 'Doe',
      },
    });

    beforeEach(() => {
      updateStub = sandbox.stub(Claimant, 'findByIdAndUpdate');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update claimant details', async () => {
      const res = {
        send: sandbox.spy(),
        status: sandbox.stub(),
      };

      req = createUpdateRequest('12345678');

      expectedSingleResult.street = 'New Street';

      res.status.withArgs(NO_CONTENT).returns(res);
      updateStub.resolves(expectedSingleResult);

      await claimantsService.updateClaimant(req, res);

      expect(res.send).to.have.been.calledOnce();
    });

    it('Should return 404 when claimant not found', async () => {
      const res = {
        send: sandbox.spy(),
        status: sandbox.stub(),
      };

      req = {
        body: null,
        params: {},
      };
      req.params.claimantId = '999999999';

      req.body = {
        firstName: 'John',
        lastName: 'Doe',
      };

      const errorMessage = 'Claimant not found matching given ID';

      updateStub.returns(null);
      res.status.withArgs(NOT_FOUND).returns(res);

      await claimantsService.updateClaimant(req, res);

      expect(res.send).to.have.been.calledWith(errorMessage);
    });

    it('Should prevent a claimant\'s NINO from being changed', async () => {
      const res = {
        send: sandbox.spy(),
        status: sandbox.stub(),
      };

      req = createUpdateRequest('12345678');
      req.body.nino = 'JT123456G';

      joiMock = {
        validate: (body, schema, cb) => {
          cb(null);
        },
      };

      claimantsServiceMock.__set__('Joi', joiMock);

      const expectedErrorMessage = 'ValidationError';

      res.status.withArgs(BAD_REQUEST).returns(res);

      await claimantsService.updateClaimant(req, res);

      expect(res.send).to.have.been.calledWith(expectedErrorMessage);
    });
  });

  describe('Delete Claimants', () => {
    let findByIdAndRemoveStub;
    let req = {};

    beforeEach(() => {
      findByIdAndRemoveStub = sandbox.stub(Claimant, 'findByIdAndRemove');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('Should delete a claimant', async () => {
      const res = {
        send: sandbox.spy(),
      };

      req = {
        params: '',
      };

      req.params.claimantId = '12345678';
      findByIdAndRemoveStub.resolves(expectedSingleResult);

      await claimantsService.deleteClaimant(req, res);

      expect(res.send).to.have.been.calledOnce();
    });

    it('Should return 404 when claimant not found', async () => {
      const res = {
        send: sandbox.spy(),
        status: sandbox.stub(),
      };

      req = {
        params: {},
      };

      req.params.claimantId = '999999999';

      const errorMessage = 'Claimant matching ID 999999999 not found';

      findByIdAndRemoveStub.returns(null);
      res.status.withArgs(NOT_FOUND).returns(res);

      await claimantsService.deleteClaimant(req, res);

      expect(res.send).to.have.been.calledWith(errorMessage);
    });
  });

  describe('Retrieve By NINO', () => {
    let findOneStub;
    let req = {};

    beforeEach(() => {
      findOneStub = sandbox.stub(Claimant, 'findOne');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('Should retrieve claimant by NINO', async () => {
      const res = {
        send: sandbox.spy(),
      };

      req = {
        params: '',
      };

      req.params.nino = 'JF123456G';

      findOneStub.resolves(expectedSingleResult);

      await claimantsService.getClaimantByNINO(req, res);

      expect(res.send).to.have.been.calledOnce();
    });

    it('Should return 404 when claimant for given NINO not found', async () => {
      const res = {
        send: sandbox.spy(),
        status: sandbox.stub(),
      };

      req = {
        params: {},
      };

      req.params.nino = 'JF123456X';

      const errorMessage = `Claimant matching NINO ${req.params.nino} not found`;

      findOneStub.returns(null);
      res.status.withArgs(NOT_FOUND).returns(res);

      await claimantsService.getClaimantByNINO(req, res);

      expect(res.send).to.have.been.calledWith(errorMessage);
    });
  });
});
