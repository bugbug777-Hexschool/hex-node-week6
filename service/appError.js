const appError = (statusCode, errMsg, next) => {
  const err = new Error(errMsg);
  err.statusCode = statusCode;
  err.isOperational = true;
  next(err);
}

module.exports = appError;