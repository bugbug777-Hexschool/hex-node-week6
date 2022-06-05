const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '使用者名稱為必填']
    },
    password: {
      type: String,
      required: [true, '使用者密碼為必填'],
      select: false
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      default: 'male'
    },
    avatar: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      required: [true, '電子信箱為必填']
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false
    }
  },
  {
    versionKey: false
  }
)

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;