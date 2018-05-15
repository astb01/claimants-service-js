const chai = require('chai');
const dirtyChai = require('dirty-chai');

const expect = chai.expect; // eslint-disable-line prefer-destructuring
const sinon = require('sinon');
const User = require('../../../models/seed/User');
const { OK, BAD_REQUEST, UNAUTHORIZED } = require('http-status-codes');

const sandbox = sinon.sandbox.create();
const authService = require('../../../services/auth-service');

chai.use(dirtyChai);

describe('Authentication Service', () => {
  it('Should be defined', () => {
    expect(authService).to.not.be.undefined();
  });

  describe('Validation', () => {
    let findOneStub;

    beforeEach(() => {
      findOneStub = sandbox.stub(User, 'findOne');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('Should return 400 when username not provided', async () => {
      const req = {
        body: {
          password: '2131312',
        },
      };

      const res = {
        status: sandbox.stub(),
        send: sandbox.spy(),
      };

      res.status.withArgs(BAD_REQUEST).returns(res);

      await authService.doLogin(req, res);

      sinon.assert.calledWith(res.send, sinon.match({ message: 'Username not provided' }));
    });

    it('Should return 400 when password not provided', async () => {
      const req = {
        body: {
          username: 'tester',
        },
      };

      const res = {
        status: sandbox.stub(),
        send: sandbox.spy(),
      };

      res.status.withArgs(BAD_REQUEST).returns(res);

      await authService.doLogin(req, res);

      sinon.assert.calledWith(res.send, sinon.match({ message: 'Password not provided' }));
    });

    it('Should validate when valid credentials are provided', async () => {
      const res = {
        send: sandbox.spy(),
        status: sandbox.stub(),
      };

      const req = {
        body: {
          username: 'someuser',
          password: 'somepassword',
        },
      };

      const expectedUserResponse = {
        _id: '23123324',
        firstName: 'John',
        lastName: 'Doe',
        comparePassword: (password, cb) => {
          cb(null, true);
        },
      };

      findOneStub.resolves(expectedUserResponse);
      res.status.withArgs(OK).returns(res);

      await authService.doLogin(req, res);

      sinon.assert.calledWith(res.send, sinon.match.has('success', true));
    });

    it('Should return 401 when credentials do not match', async () => {
      const req = {
        body: {
          username: 'tester',
          password: '212342',
        },
      };

      const res = {
        send: sandbox.spy(),
        status: sandbox.stub(),
      };

      const expectedUserResponse = {
        comparePassword: (password, cb) => {
          cb(null, false);
        },
      };

      findOneStub.resolves(expectedUserResponse);
      res.status.withArgs(UNAUTHORIZED).returns(res);

      await authService.doLogin(req, res);

      sinon.assert.calledWith(res.send, sinon.match({ message: 'Credentials provided do not match' }));
    });

    it('Should return 401 when user not found', async () => {
      const req = {
        body: {
          username: 'joe',
          password: 'something',
        },
      };

      const res = {
        send: sandbox.spy(),
        status: sandbox.stub(),
      };

      findOneStub.rejects({ error: 'some error' });

      res.status.withArgs(UNAUTHORIZED).returns(res);

      await authService.doLogin(req, res);

      sinon.assert.calledWith(res.send, sinon.match({ message: 'User not authorised' }));
    });
  });
});
