var express = require('express');
var router = express.Router();
const Post = require('../models/PostModel');
const appError = require('../service/appError');
const asyncErrorHandler = require('../service/asyncErrorHandler');
const auth = require('../service/auth');

// 取得所有貼文
router.get('/', auth.checkAuth, asyncErrorHandler(async (req, res) => {
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
router.get('/:id', auth.checkAuth, asyncErrorHandler(async (req, res, next) => {
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
router.post('/', auth.checkAuth, asyncErrorHandler(async (req, res, next) => {
  const { id } = req.user;
  const { content, photo } = req.body;

  const newPost = await Post.create({
    user: id,
    content,
    photo
  });
  res.json({
    status: 'success',
    data: newPost
  });
}));

// 編輯單筆貼文
router.patch('/:id', auth.checkAuth, asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body

  if (!content) return appError(400, '貼文修改能容不能為空！');
  const post = await Post.findById(id);

  if (!post) return appError(400, '該貼文不存在！', next);
  if (req.user.id !== post.user._id) return appError(400, '非該貼文作者不能修改該貼文！', next);
  const editedPost = await Post.findByIdAndUpdate(
    id,
    { content },
    { new: true }
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