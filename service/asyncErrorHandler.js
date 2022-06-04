const asyncErrorHandler = (func) => {
  // 將傳入的非同步函式使用 .catch 將錯誤統一使用 next(err) 回傳管理
  return (req, res, next) => {
    func(req, res, next).catch((err) => {
      next(err);
    })
  }
}

module.exports = asyncErrorHandler;