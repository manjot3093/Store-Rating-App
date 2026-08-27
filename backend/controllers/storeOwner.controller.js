const asyncHandler = require('express-async-handler');
const { fn, col } = require('sequelize');
const { Store, Rating, User } = require('../models');

// @route GET /api/store-owner/dashboard
const getOwnerDashboard = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ where: { ownerId: req.user.id } });

  if (!store) {
    res.status(404);
    throw new Error('No store is currently linked to this account. Contact an administrator.');
  }

  const ratings = await Rating.findAll({
    where: { storeId: store.id },
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'address'] }],
    order: [['updatedAt', 'DESC']],
  });

  const agg = await Rating.findOne({
    where: { storeId: store.id },
    attributes: [[fn('AVG', col('rating')), 'avg']],
    raw: true,
  });

  res.json({
    store: { id: store.id, name: store.name, email: store.email, address: store.address },
    averageRating: agg?.avg ? Number(Number(agg.avg).toFixed(2)) : 0,
    totalRatings: ratings.length,
    raters: ratings.map((r) => ({
      ratingId: r.id,
      rating: r.rating,
      submittedAt: r.updatedAt,
      user: r.user,
    })),
  });
});

module.exports = { getOwnerDashboard };
