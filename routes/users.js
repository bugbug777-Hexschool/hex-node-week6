var express = require('express');
var router = express.Router();
const { checkAuth } = require('../service/auth');
const UserController = require('../controllers/users');

/* GET users listing. */

router.get('/', UserController.getUsers);
router.post('/sign_up', UserController.signUp);
router.post('/sign_in', UserController.signIn);
router.post('/updatePassword', checkAuth, UserController.updatePassword);
router.get('/profile', checkAuth, UserController.getProfile);
router.patch('/profile', checkAuth, UserController.updateProfile);
router.delete('/', UserController.deleteUsers);

module.exports = router;
