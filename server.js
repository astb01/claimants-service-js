const express = require('express');

const server = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('config');
const logger = require('morgan');

// Need to require models to they can be created:
require('./models/Claimant');
const User = require('./models/seed/User');

async function setUpDb() {
  const dbUrl = config.get('db.url');

  // Connect to the database:
  mongoose.Promise = Promise;
  mongoose.connect(dbUrl);

  if (process.env.NODE_ENV === 'development') {
    try {
      try {
        await User.collection.drop();
      } catch (e) {
        if (e.code !== 26) {
          throw e;
        }
      }

      await User.create([{ username: config.get('auth.user'), password: config.get('auth.password') }]);
    } catch (e) {
      throw (e);
    }
  }
}

if (process.env.NODE_ENV === 'production') {
  server.use(logger('combined'));
}

/** Connect to database and set up any seeds */
setUpDb();

/** JWT Set Up */
const passport = require('passport');
const passportJWT = require('passport-jwt');

const ExtractJWT = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const jwtOpts = {};

jwtOpts.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
jwtOpts.secretOrKey = config.get('secret');

const strategy = new JwtStrategy(jwtOpts, (jwtPayload, next) => {
  User.findById(jwtPayload.id)
    .then((user) => {
      next(null, user);
    });
});

passport.use(strategy);
server.use(passport.initialize());
/** --------------- END JWT -------------- */

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(cors());

server.use('/api', passport.authenticate('jwt', { session: false }), require('./routes/claimant-routes'));

server.use('/login', require('./routes/login'));

const port = config.get('port') || 3000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`); // eslint-disable-line no-console
});

module.exports = server;
