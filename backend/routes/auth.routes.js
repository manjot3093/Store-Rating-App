const express = require('express');
const { signup, login, getMe, changePassword } = require('../controllers/auth.controller');
const { nameRule, emailRule, addressRule, passwordRule, body } = require('../utils/validators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/signup',
  [nameRule(), emailRule(), addressRule(), passwordRule()],
  validate,
  signup
);

router.post(
  '/login',
  [emailRule(), body('password').notEmpty().withMessage('Password is required')],
  validate,
  login
);

router.get('/me', protect, getMe);

router.put(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    passwordRule('newPassword'),
  ],
  validate,
  changePassword
);

module.exports = router;
