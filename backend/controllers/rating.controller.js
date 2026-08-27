const asyncHandler = require('express-async-handler');
const { Rating: RatingModel, Store: StoreModel } = require('../models');

// @route POST /api/ratings/:storeId
// Creates a rating if none exists for this user+store, otherwise updates it (upsert).
const submitRating = asyncHandler(async (req, res) => {
  const { storeId } = req.params;
  const { rating } = req.body;

  const store = await StoreModel.findByPk(storeId);
  if (!store) {
    res.status(404);
    throw new Error('Store not found');
  }

  const [record, created] = await RatingModel.findOrCreate({
    where: { userId: req.user.id, storeId },
    defaults: { rating },
  });

  if (!created) {
    record.rating = rating;
    await record.save();
  }

  res.status(created ? 201 : 200).json({
    message: created ? 'Rating submitted' : 'Rating updated',
    rating: record,
  });
});

module.exports = { submitRating };
