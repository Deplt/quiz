require('dotenv').config();
const { getSequelize } = require('../src/config/database');
const { Admin } = require('../src/models');

async function seed() {
  const sequelize = getSequelize();
  await sequelize.sync();
  const existing = await Admin.findOne({ where: { username: 'admin' } });
  if (!existing) {
    await Admin.create({
      username: 'admin',
      password_hash: Admin.hashPassword('admin123'),
    });
    console.log('Admin account created: admin / admin123');
  } else {
    console.log('Admin account already exists');
  }
  await sequelize.close();
}

seed().catch(console.error);
