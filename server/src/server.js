const app = require('./app');
const { getSequelize } = require('./config/database');

const PORT = process.env.PORT || 3000;

async function start() {
  const sequelize = getSequelize();
  await sequelize.authenticate();
  console.log('Database connected');
  await sequelize.sync();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch(console.error);
