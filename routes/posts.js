var express = require('express');
var router = express.Router();
const Post = require('../models/PostModel');
const User = require('../models/UserModel');
const appError = require('../service/appError');
const asyncErrorHandler = require('../service/asyncErrorHandler');

// 取得所有貼文
router.get('/', asyncErrorHandler(async (req, res) => {
  const { sort=-1, keyword } = req.query;
  const regex = new RegExp(keyword);
  const posts = await Post.find({ content: regex}).populate(
    {
      path: 'user',
      select: 'name'
    }).sort({ createdAt: sort });
    res.json({
      status: 'success',
      data: posts
    });
}));

// 取得單筆貼文
router.get('/:id', asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findById(id).populate(
    {
      path: 'user',
      select: 'name'
    });
  if (!post) return appError(400, '該貼文不存在！', next);
  res.json({
    status: 'success',
    data: post
  });
}));

// 新增單筆貼文
router.post('/', asyncErrorHandler(async (req, res, next) => {
  const { user, content, photo } = req.body;
  const isFound = await User.findById(user).exec();

  if (!isFound) return appError(400, '此用戶不存在！', next);
  const newPost = await Post.create({
    user,
    content,
    photo
  });
  res.json({
    status: 'success',
    data: newPost
  });
}));

// 編輯單筆貼文
router.patch('/:id', asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body
  
  if (!content) return appError(400, '貼文修改能容不能為空！');
  const post = await Post.findById(id);

  if (!post) return appError(400, '該貼文不存在！', next);
  const editedPost = await Post.findOneAndUpdate(
    id,
    { content },
    {new: true}
  )

  res.json({
    status: 'success',
    data: editedPost
  });
}));

// 刪除所有貼文
router.delete('/', asyncErrorHandler(async (req, res) => {
  await Post.deleteMany({});
  res.json({
    status: 'success',
    data: []
  })
  
}));

module.exports = router;