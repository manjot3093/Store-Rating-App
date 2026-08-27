const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const { User, Store, Rating } = require('../models');
const { generateToken } = require('../utils/jwt');

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  address: user.address,
  role: user.role,
  createdAt: user.createdAt,
});

// @route POST /api/auth/signup
// Public self-registration -> always creates a role: 'user' account
const signup = asyncHandler(async (req, res) => {
  const { name, email, password, address } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, address, role: 'user' });

  const token = generateToken({ id: user.id, role: user.role });
  res.status(201).json({ token, user: sanitizeUser(user) });
});

// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = generateToken({ id: user.id, role: user.role });
  res.json({ token, user: sanitizeUser(user) });
});

// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  let extra = {};

  if (req.user.role === 'store_owner') {
    const store = await Store.findOne({ where: { ownerId: req.user.id } });
    if (store) {
      const ratings = await Rating.findAll({ where: { storeId: store.id } });
      const avg = ratings.length
        ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
        : 0;
      extra = { store: { id: store.id, name: store.name }, averageRating: Number(avg.toFixed(2)) };
    }
  }

  res.json({ user: sanitizeUser(req.user), ...extra });
});

// @route PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findByPk(req.user.id);
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: 'Password updated successfully' });
});

module.exports = { signup, login, getMe, changePassword, sanitizeUser };
