const Post = require('../models/PostModel');
const successHandler = require('../service/successHandler')
const appError = require('../service/appError');
const asyncErrorHandler = require('../service/asyncErrorHandler');

// 取得所有貼文
const getPosts = asyncErrorHandler(async (req, res) => {
  const { sort=-1, keyword } = req.query;
  const regex = new RegExp(keyword);
  const posts = await Post.find({ content: regex}).populate(
    {
      path: 'user',
      select: 'name'
    }).sort({ createdAt: sort });
  successHandler(res, posts);
});

// 取得單筆貼文
const getPost = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findById(id).populate(
    {
      path: 'user',
      select: 'name'
    });

  if (!post) return appError(400, '該貼文不存在！', next);
  successHandler(res, post);
});

// 新增單筆貼文
const addPost = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.user;
  const { content, photo } = req.body;

  const newPost = await Post.create({
    user: id,
    content,
    photo
  });

  successHandler(res, newPost);
});

// 編輯單筆貼文
const editPost = asyncErrorHandler(async (req, res, next) => {
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

  successHandler(res, editedPost);
});

// 刪除所有貼文
const deletePosts = asyncErrorHandler(async (req, res) => {
  await Post.deleteMany({});
  successHandler(res, []);
});

module.exports = {
  getPosts,
  getPost,
  addPost,
  editPost,
  deletePosts
}