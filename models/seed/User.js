const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },

}, {
  versionKey: false,
});

/*eslint-disable */
UserSchema.pre('save', function (next) {
    const user = this;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, (errHash, hash) => {
            if (errHash) return next(errHash);

            user.password = hash;
            return next();
        });
    });
});

UserSchema.methods.comparePassword = function (passwordIn, cb) {
    bcrypt.compare(passwordIn, this.password, (err, matched) => {
        if (err) return cb(err);

        cb(null, matched);
    });
};

/* eslint-enable */

module.exports = mongoose.model('User', UserSchema, 'User');
