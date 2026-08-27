const express = require('express');
const { listStoresForUser } = require('../controllers/store.controller');
const { submitRating } = require('../controllers/rating.controller');
const { ratingRule } = require('../utils/validators');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('user'));

router.get('/', listStoresForUser);
router.post('/:storeId/ratings', [ratingRule()], validate, submitRating);

module.exports = router;
