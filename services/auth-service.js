const jwt = require('jsonwebtoken');
const User = require('../models/seed/User');
const config = require('config');
const { OK, BAD_REQUEST, UNAUTHORIZED } = require('http-status-codes');

const doLogin = (req, res) => {
  if (!req.body.username) {
    return res.status(BAD_REQUEST).send({ message: 'Username not provided' });
  }
  if (!req.body.password) {
    return res.status(BAD_REQUEST).send({ message: 'Password not provided' });
  }

  const { username, password } = req.body;

  return User.findOne({ username })
    .then((user) => {
      user.comparePassword(password, (err, matched) => {
        if (matched) {
          const details = { id: user.id };
          const token = jwt.sign(details, config.get('secret'), {
            expiresIn: config.get('tokenExpiry'),
            algorithm: config.get('algorithm'),
          });

          return res.status(OK)
            .send({
              success: true,
              token,
            });
        }

        return res.status(UNAUTHORIZED).send({
          message: 'Credentials provided do not match',
        });
      });
    })
    .catch(err => res.status(UNAUTHORIZED).send({
      message: 'User not authorised', name: err.name,
    }));
};

module.exports = { doLogin };
