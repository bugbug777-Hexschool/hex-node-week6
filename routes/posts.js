var express = require('express');
var router = express.Router();
const { checkAuth } = require('../service/auth');
const PostController = require('../controllers/posts');

router.get('/', checkAuth, PostController.getPosts);
router.get('/:id', checkAuth, PostController.getPost);
router.post('/', checkAuth, PostController.addPost);
router.patch('/:id', checkAuth, PostController.editPost);
router.delete('/', PostController.deletePosts);

module.exports = router;