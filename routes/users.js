var express = require('express');
var router = express.Router();
const validator = require('validator');
const bcrypt = require('bcrypt');
const User = require('../models/UserModel');
const appError = require('../service/appError');
const asyncErrorHandler = require('../service/asyncErrorHandler');
const auth = require('../service/auth');

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
  const token = await auth.generateToken(user);

  res.json({
    status: 'success',
    data: {
      name: user.name,
      token
    }
  });
}))

// 更新密碼
router.post('/updatePassword', auth.checkAuth, asyncErrorHandler(async (req, res, next) => {
  const user = req.user;
  let { password, confirmedPassword } = req.body;

  if (!validator.isLength(password, {min: 8, max: 16})) return appError(400, '密碼長度只能介於 8 到 16 碼！', next);
  if (password !== confirmedPassword) return appError(400, '密碼不一致！', next);

  password = await bcrypt.hash(password, 12);
  const editedUser = await User.findByIdAndUpdate(user._id, {password}, {new:true});

  const token = await auth.generateToken(editedUser);

  res.json({
    status: 'success',
    data: {
      name: editedUser.name,
      token
    }
  });
}));

// 取得使用者個人資訊
router.get('/profile', auth.checkAuth, asyncErrorHandler(async (req, res, next) => {
  const user = req.user;
  res.json({
    status: 'success',
    data: user
  })
}));

// 更新使用者個人資訊
router.patch('/profile', auth.checkAuth, asyncErrorHandler(async (req, res, next) => {
  const user = req.user;
  const { name, gender, avatar } = req.body;

  if (!name || !gender) return  appError(400, '欄位資訊不能為空！', next);

  const editedUser = await User.findByIdAndUpdate(
    {_id: user._id},
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
