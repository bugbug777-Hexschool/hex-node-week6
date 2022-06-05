const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const asyncErrorHandler = require('../service/asyncErrorHandler');
const appError = require('../service/appError');

const generateToken = (user) => {
  return jwt.sign(
    {id:user._id},
    process.env.JWT_SECRET,
    {expiresIn: process.env.JWT_EXPIRATION}
  );
}

const verifyToken = (token) => {
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

const checkAuth = asyncErrorHandler(async (req, res, next) => {
  let token;
  const authorization = req.headers.authorization;
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  }
  if (!token) return appError(401, '您尚未登入！', next);
  const payload = await verifyToken(token);
  const user = await User.findById(payload.id);

  req.user = user;

  next();
});

module.exports = {
  generateToken,
  verifyToken,
  checkAuth
};