require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Store, Rating } = require('../models');

const run = async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@storeratings.com';
  const existingAdmin = await User.findOne({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@1234', 10);
    await User.create({
      name: process.env.ADMIN_NAME || 'System Administrator Account',
      email: adminEmail,
      password: hashed,
      address: process.env.ADMIN_ADDRESS || 'Head Office, Platform HQ, City Center, Country',
      role: 'admin',
    });
    console.log(`Created default admin account: ${adminEmail}`);
  } else {
    console.log('Default admin already exists, skipping.');
  }

  // Optional: a couple of demo store owners + stores + a normal user, useful for
  // quickly demoing the app to a recruiter without manual data entry.
  const demoOwnerEmail = 'owner.greenleaf@storeratings.com';
  let owner = await User.findOne({ where: { email: demoOwnerEmail } });
  if (!owner) {
    const hashed = await bcrypt.hash('Owner@1234', 10);
    owner = await User.create({
      name: 'Greenleaf Grocery Store Owner Account',
      email: demoOwnerEmail,
      password: hashed,
      address: '12 Market Street, Riverside District, Springfield',
      role: 'store_owner',
    });
    console.log(`Created demo store owner: ${demoOwnerEmail} / Owner@1234`);
  }

  let store = await Store.findOne({ where: { email: 'contact@greenleafgrocery.com' } });
  if (!store) {
    store = await Store.create({
      name: 'Greenleaf Grocery',
      email: 'contact@greenleafgrocery.com',
      address: '12 Market Street, Riverside District, Springfield',
      ownerId: owner.id,
    });
    console.log('Created demo store: Greenleaf Grocery');
  }

  const demoUserEmail = 'demo.user@storeratings.com';
  let demoUser = await User.findOne({ where: { email: demoUserEmail } });
  if (!demoUser) {
    const hashed = await bcrypt.hash('DemoUser@1234', 10);
    demoUser = await User.create({
      name: 'Demonstration Normal User Account',
      email: demoUserEmail,
      password: hashed,
      address: '45 Oak Avenue, Lakeside, Springfield',
      role: 'user',
    });
    console.log(`Created demo normal user: ${demoUserEmail} / DemoUser@1234`);
  }

  const existingRating = await Rating.findOne({ where: { userId: demoUser.id, storeId: store.id } });
  if (!existingRating) {
    await Rating.create({ userId: demoUser.id, storeId: store.id, rating: 4 });
    console.log('Created a demo rating (4 stars).');
  }

  console.log('\nSeeding complete. You can log in with:');
  console.log(`  Admin:       ${adminEmail} / ${process.env.ADMIN_PASSWORD || 'Admin@1234'}`);
  console.log(`  Store Owner: ${demoOwnerEmail} / Owner@1234`);
  console.log(`  Normal User: ${demoUserEmail} / DemoUser@1234`);

  process.exit(0);
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
