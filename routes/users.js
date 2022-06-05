var express = require('express');
var router = express.Router();
const validator = require('validator');
const bcrypt = require('bcrypt');
const User = require('../models/UserModel');
const appError = require('../service/appError');
const asyncErrorHandler = require('../service/asyncErrorHandler');
const auth = require('../service/auth');

// Middleware
const isAuth = asyncErrorHandler(async (req, res, next) => {
  let token;
  const authorization = req.headers.authorization;
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  }
  if (!token) return appError(401, '您尚未登入！', next);
  const payload = await auth.verifyToken(token);
  const user = await User.findById(payload.id);

  req.user = user;
  next()
});

/* GET users listing. */
// 取得所有使用者
router.get('/', asyncErrorHandler(async (req, res, next) => {
  const users = await User.find();
  res.json({
    status: 'success',
    data: users
  })
}));

// 新增使用者，使用者註冊
router.post('/sign_up', asyncErrorHandler(async (req, res, next) => {
  let { name, email, password } = req.body;

  if (!name || !email || !password) return appError(400, '欄位資訊不能為空！', next);
  if (!validator.isAlphanumeric(name)) return appError(400, '名稱只能是英數字的組合！', next);
  if (!validator.isEmail(email)) return appError(400, 'Email 格式不符合！', next);
  if (!validator.isLength(password, {min: 8, max: 16})) return appError(400, '密碼長度只能介於 8 到 16 碼！', next);

  const hasEmail = await User.findOne({email: email}).exec();
  if (hasEmail) return appError(400, '該電子信箱已被使用者註冊！', next);

  password = await bcrypt.hash(password, 12);
  const newUser = await User.create({
    name,
    email,
    password
  });

  const token = await auth.generateToken(newUser);

  res.status(201).json({
    status: 'success',
    data: {
      name: newUser.name,
      token
    }
  });
}));

// 使用者登入
router.post('/sign_in', asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) return appError(400, '帳號密碼不能為空！', next);
  const user = await User.findOne({email}).select('+password');
  const confirmed = await bcrypt.compare(password, user.password);

  if (!confirmed) return appError(400, '帳號密碼錯誤！', next);
  console.log(user);
  const token = await auth.generateToken(user);

  res.json({
    status: 'success',
    data: {
      name: user.name,
      token
    }
  });
}))

// 取得使用者個人資訊
router.get('/profile/:id', asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) return appError(400, '找不到該使用者資訊！', next);
  res.json({
    status: 'success',
    data: user
  })
}));

// 更新使用者個人資訊
router.patch('/profile/:id', asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, gender, avatar } = req.body;
  const user = await User.findById(id).exec();

  if (!user) return appError(400, '找不到該名使用者資訊！', next);

  if (!name || !gender) return  appError(400, '欄位資訊不能為空！', next);

  const editedUser = await User.findByIdAndUpdate(
    id,
    {name, gender, avatar},
    {new: true}
  );
  res.json({
    status: 'success',
    data: editedUser
  });
}));

// 刪除所有使用者
router.delete('/', asyncErrorHandler(async (req, res, next) => {
  await User.deleteMany({});
  res.json({
    status: 'success',
    data: []
  })
}));

module.exports = router;
