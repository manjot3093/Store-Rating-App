const asyncHandler = require('express-async-handler');
const { sequelize } = require('../models');

const ALLOWED_SORT = ['name', 'address', 'rating', 'userRating'];

// @route GET /api/stores?name=&address=&sortBy=&order=
// Lists all stores with overall average rating and the current user's own rating
const listStoresForUser = asyncHandler(async (req, res) => {
  const { name, address, sortBy, order } = req.query;
  const field = ALLOWED_SORT.includes(sortBy) ? sortBy : 'name';
  const dir = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  const orderColumn =
    field === 'rating' ? 'rating' : field === 'userRating' ? '"userRating"' : `s.${field}`;

  const stores = await sequelize.query(
    `
    SELECT s.id, s.name, s.address, s.email,
           COALESCE(AVG(r.rating), 0)::float AS rating,
           COUNT(r.id)::int AS "ratingCount",
           MAX(CASE WHEN r.user_id = :userId THEN r.rating END) AS "userRating"
    FROM stores s
    LEFT JOIN ratings r ON r.store_id = s.id
    WHERE s.name ILIKE :name AND s.address ILIKE :address
    GROUP BY s.id
    ORDER BY ${orderColumn} ${dir} NULLS LAST
    `,
    {
      replacements: {
        userId: req.user.id,
        name: `%${name || ''}%`,
        address: `%${address || ''}%`,
      },
      type: sequelize.QueryTypes.SELECT,
    }
  );

  res.json({
    count: stores.length,
    stores: stores.map((s) => ({
      ...s,
      rating: Number(Number(s.rating).toFixed(2)),
      userRating: s.userRating ? Number(s.userRating) : null,
    })),
  });
});

module.exports = { listStoresForUser };
