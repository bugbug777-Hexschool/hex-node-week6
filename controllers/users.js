const bcrypt = require('bcrypt');
const validator = require('validator');
const User = require('../models/UserModel');
const appError = require('../service/appError');
const asyncErrorHandler = require('../service/asyncErrorHandler');
const successHandler = require('../service/successHandler');
const { generateToken } = require('../service/auth');

// 取得所有使用者
const getUsers = asyncErrorHandler(async (req, res, next) => {
  const users = await User.find();
  successHandler(res, users);
});

// 新增使用者，使用者註冊
const signUp = asyncErrorHandler(async (req, res, next) => {
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

  const token = await generateToken(newUser);

  successHandler(res, {
    name: newUser.name,
    token
  }, 201);
});

// 使用者登入
const signIn = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) return appError(400, '帳號密碼不能為空！', next);
  const user = await User.findOne({email}).select('+password');
  const confirmed = await bcrypt.compare(password, user.password);

  if (!confirmed) return appError(400, '帳號密碼錯誤！', next);
  const token = await generateToken(user);

  successHandler(res, {
    name: user.name,
    token
  });
});

// 更新密碼
const updatePassword = asyncErrorHandler(async (req, res, next) => {
  const user = req.user;
  let { password, confirmedPassword } = req.body;

  if (!validator.isLength(password, {min: 8, max: 16})) return appError(400, '密碼長度只能介於 8 到 16 碼！', next);
  if (password !== confirmedPassword) return appError(400, '密碼不一致！', next);

  password = await bcrypt.hash(password, 12);
  const editedUser = await User.findByIdAndUpdate(user._id, {password}, {new:true});

  const token = await generateToken(editedUser);

  successHandler(res, {
    name: editedUser.name,
    token
  });
});

// 取得使用者個人資料
const getProfile = asyncErrorHandler(async (req, res, next) => {
  const user = req.user;
  successHandler(res, user);
});

// 更新使用者個人資訊
const updateProfile = asyncErrorHandler(async (req, res, next) => {
  const user = req.user;
  const { name, gender, avatar } = req.body;

  if (!name || !gender) return  appError(400, '欄位資訊不能為空！', next);

  const editedUser = await User.findByIdAndUpdate(
    {_id: user._id},
    {name, gender, avatar},
    {new: true}
  );
  successHandler(res, editedUser);
});

// 刪除所有使用者
const deleteUsers = asyncErrorHandler(async (req, res, next) => {
  await User.deleteMany({});
  successHandler(res, []);
});

module.exports = {
  getUsers,
  signUp,
  signIn,
  updatePassword,
  getProfile,
  updateProfile,
  deleteUsers
}