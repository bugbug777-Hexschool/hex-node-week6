var express = require('express');
var router = express.Router();
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const appError = require('../service/appError');
const asyncErrorHandler = require('../service/asyncErrorHandler');

/* GET users listing. */
// 取得所有使用者
router.get('/', asyncErrorHandler(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
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

  password = undefined; // clean password in ram

  // generate JWT
  const token = jwt.sign(
    {id: newUser._id},
    process.env.JWT_SECRET,
    {expiresIn: process.env.JWT_EXPIRATION}
  );

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
      token
    }
  });
}));

// 更新使用者資訊
router.patch('/:id', asyncErrorHandler(async (req, res, next) => {
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
    status: 'sucess',
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
