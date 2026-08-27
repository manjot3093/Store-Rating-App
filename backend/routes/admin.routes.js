const express = require('express');
const {
  getDashboard,
  createUser,
  listUsers,
  getUserDetail,
  createStore,
  listStores,
} = require('../controllers/admin.controller');
const {
  nameRule,
  emailRule,
  addressRule,
  passwordRule,
  body,
} = require('../utils/validators');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);

router.get('/users', listUsers);
router.get('/users/:id', getUserDetail);
router.post(
  '/users',
  [
    nameRule(),
    emailRule(),
    addressRule(),
    passwordRule(),
    body('role').isIn(['admin', 'user', 'store_owner']).withMessage('Invalid role'),
  ],
  validate,
  createUser
);

router.get('/stores', listStores);
router.post(
  '/stores',
  [
    body('name').trim().notEmpty().withMessage('Store name is required').isLength({ max: 60 }),
    emailRule(),
    addressRule(),
  ],
  validate,
  createStore
);

module.exports = router;
