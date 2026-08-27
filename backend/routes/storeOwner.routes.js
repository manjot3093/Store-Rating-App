const express = require('express');
const { getOwnerDashboard } = require('../controllers/storeOwner.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('store_owner'));

router.get('/dashboard', getOwnerDashboard);

module.exports = router;
