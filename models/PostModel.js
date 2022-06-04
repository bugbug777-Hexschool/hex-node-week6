const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    tags: [
      {
        type: String,
        required: [true, '貼文標籤不能為空 ']
      }
    ],
    type: {
      type: String,
      enum: ['person', 'group']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, '貼文者 id 為必要欄位']
    },
    content: {
      type: String,
      required: [true, '貼文內容為必填']
    },
    photo: {
      type: String,
      default: ''
    },
    likes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false
  }
);

const PostModel = mongoose.model('Post', postSchema);

module.exports = PostModel;