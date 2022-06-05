const jwt = require('jsonwebtoken');

const auth = {
  generateToken: (user) => {
    return jwt.sign(
      {id:user._id},
      process.env.JWT_SECRET,
      {expiresIn: process.env.JWT_EXPIRATION}
    );
  },
  verifyToken: (token) => {
    return new Promise((resolve, reject) => {
      jwt.verify(
          token,
          process.env.JWT_SECRET,
          (err, payload) => {
            if (err) {
              reject(err);
            } else {
              resolve(payload);
            }
          }
      );
    })
  }
};

module.exports = auth;