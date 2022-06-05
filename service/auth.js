const jwt = require('jsonwebtoken');

const auth = {
  generateToken: (user) => {
    return jwt.sign(
      {id:user._id},
      process.env.JWT_SECRET,
      {expiresIn: process.env.JWT_EXPIRATION}
    );
  }
};

module.exports = auth;