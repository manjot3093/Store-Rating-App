const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const { Op, fn, col, literal } = require('sequelize');
const { User, Store, Rating, sequelize } = require('../models');

const ALLOWED_SORT_FIELDS_USERS = ['name', 'email', 'address', 'role', 'createdAt'];
const ALLOWED_SORT_FIELDS_STORES = ['name', 'email', 'address', 'rating', 'createdAt'];

const parseSort = (sortBy, order, allowed, fallback) => {
  const field = allowed.includes(sortBy) ? sortBy : fallback;
  const dir = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return { field, dir };
};

// @route GET /api/admin/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const [totalUsers, totalStores, totalRatings] = await Promise.all([
    User.count(),
    Store.count(),
    Rating.count(),
  ]);

  const [usersByRole] = await Promise.all([
    User.findAll({ attributes: ['role', [fn('COUNT', col('id')), 'count']], group: ['role'] }),
  ]);

  res.json({
    totalUsers,
    totalStores,
    totalRatings,
    usersByRole: usersByRole.map((r) => ({ role: r.role, count: Number(r.get('count')) })),
  });
});

// @route POST /api/admin/users  (creates a user with role: admin | user | store_owner)
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, address, role, storeId } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashed,
    address,
    role: role || 'user',
  });

  // Optionally link a newly created store_owner to an existing, unowned store
  if (role === 'store_owner' && storeId) {
    const store = await Store.findByPk(storeId);
    if (store && !store.ownerId) {
      store.ownerId = user.id;
      await store.save();
    }
  }

  res.status(201).json({
    id: user.id,
    name: user.name,
    email: user.email,
    address: user.address,
    role: user.role,
  });
});

// @route GET /api/admin/users?name=&email=&address=&role=&sortBy=&order=
const listUsers = asyncHandler(async (req, res) => {
  const { name, email, address, role, sortBy, order } = req.query;
  const where = {};
  if (name) where.name = { [Op.iLike]: `%${name}%` };
  if (email) where.email = { [Op.iLike]: `%${email}%` };
  if (address) where.address = { [Op.iLike]: `%${address}%` };
  if (role) where.role = role;

  const { field, dir } = parseSort(sortBy, order, ALLOWED_SORT_FIELDS_USERS, 'name');

  const users = await User.findAll({
    where,
    attributes: { exclude: ['password'] },
    order: [[field, dir]],
  });

  // For store owners, attach their store's average rating
  const results = await Promise.all(
    users.map(async (u) => {
      const plain = u.toJSON();
      if (u.role === 'store_owner') {
        const store = await Store.findOne({ where: { ownerId: u.id } });
        if (store) {
          const agg = await Rating.findOne({
            where: { storeId: store.id },
            attributes: [[fn('AVG', col('rating')), 'avg']],
            raw: true,
          });
          plain.rating = agg?.avg ? Number(Number(agg.avg).toFixed(2)) : null;
          plain.storeName = store.name;
        }
      }
      return plain;
    })
  );

  res.json({ count: results.length, users: results });
});

// @route GET /api/admin/users/:id
const getUserDetail = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const plain = user.toJSON();

  if (user.role === 'store_owner') {
    const store = await Store.findOne({ where: { ownerId: user.id } });
    if (store) {
      const agg = await Rating.findOne({
        where: { storeId: store.id },
        attributes: [[fn('AVG', col('rating')), 'avg'], [fn('COUNT', col('id')), 'count']],
        raw: true,
      });
      plain.rating = agg?.avg ? Number(Number(agg.avg).toFixed(2)) : null;
      plain.ratingCount = Number(agg?.count || 0);
      plain.store = { id: store.id, name: store.name };
    }
  }

  res.json(plain);
});

// @route POST /api/admin/stores
const createStore = asyncHandler(async (req, res) => {
  const { name, email, address, ownerId } = req.body;

  const existing = await Store.findOne({ where: { email } });
  if (existing) {
    res.status(409);
    throw new Error('A store with this email already exists');
  }

  if (ownerId) {
    const owner = await User.findByPk(ownerId);
    if (!owner || owner.role !== 'store_owner') {
      res.status(400);
      throw new Error('ownerId must reference an existing user with role store_owner');
    }
    const alreadyOwns = await Store.findOne({ where: { ownerId } });
    if (alreadyOwns) {
      res.status(409);
      throw new Error('This store owner is already linked to another store');
    }
  }

  const store = await Store.create({ name, email, address, ownerId: ownerId || null });
  res.status(201).json(store);
});

// @route GET /api/admin/stores?name=&email=&address=&sortBy=&order=
const listStores = asyncHandler(async (req, res) => {
  const { name, email, address, sortBy, order } = req.query;
  const where = {};
  if (name) where.name = { [Op.iLike]: `%${name}%` };
  if (email) where.email = { [Op.iLike]: `%${email}%` };
  if (address) where.address = { [Op.iLike]: `%${address}%` };

  const { field, dir } = parseSort(sortBy, order, ALLOWED_SORT_FIELDS_STORES, 'name');

  const orderClause =
    field === 'rating' ? [[literal('"rating"'), dir]] : [[field, dir]];

  const stores = await sequelize.query(
    `
    SELECT s.id, s.name, s.email, s.address, s.owner_id AS "ownerId", s.created_at AS "createdAt",
           COALESCE(AVG(r.rating), 0)::float AS rating,
           COUNT(r.id)::int AS "ratingCount"
    FROM stores s
    LEFT JOIN ratings r ON r.store_id = s.id
    WHERE s.name ILIKE :name AND s.email ILIKE :email AND s.address ILIKE :address
    GROUP BY s.id
    ORDER BY ${field === 'rating' ? 'rating' : `s.${field === 'createdAt' ? 'created_at' : field}`} ${dir}
    `,
    {
      replacements: {
        name: `%${name || ''}%`,
        email: `%${email || ''}%`,
        address: `%${address || ''}%`,
      },
      type: sequelize.QueryTypes.SELECT,
    }
  );

  res.json({ count: stores.length, stores: stores.map((s) => ({ ...s, rating: Number(Number(s.rating).toFixed(2)) })) });
});

module.exports = { getDashboard, createUser, listUsers, getUserDetail, createStore, listStores };
