var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var cors = require('cors');
var dotenv = require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var postsRouter = require('./routes/posts');

// Connect to mongoDB
const uri = process.env.DB_PATH.replace(
  '<password>',
  process.env.DB_TOKEN
)
mongoose.connect(uri).then((res) => {
  console.log('資料庫連線成功！');
});
var app = express();

// Uncaught Exceptions
process.on('uncaughtException', (err, origin) => {
  console.error('Uncaught Exception!');
  console.error(err);
  process.exit(1);
});
// Unhandled Rejection
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled reason：', err);
  console.error('Unhandled rejection：', promise);
});

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);

// No matched path
app.use((req, res, next) => {
  res.status(404).json({
    status: 'false',
    message: '該頁面不存在！'
  })
});
// Express programming error
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500

  // Development
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      errorName: err.name,
      statusCode: err.statusCode,
      message: err.message,
      stacks: err.stack,
      error: err
    });
  }

  // Production
  if (process.env.NODE_ENV === 'production') {
    // 針對 Mongoose validator errors 進行客製化
    if (err.name === 'ValidationError') {
      err.message = '欄位未填寫正確，請重新輸入！';
      err.isOperational = true;
    }
    if (err.name === 'CastError') {
      err.message = '找不到該筆資料！';
      err.isOperational = true;
    }
    if (err.name === 'SyntaxError') {
      err.message = '請輸入正確的資料格式！';
      err.isOperational = true;
    }
    if (err.isOperational) {
      res.status(400).json({
        status: 'false',
        message: err.message
      })
    } else {
      console.error('重大系統錯誤！！', err);
      res.status(500).json({
        status: 'error',
        message: '系統發生問題，請聯繫管理員！'
      })
    }
  }
})

module.exports = app;
