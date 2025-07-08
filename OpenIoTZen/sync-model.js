import { sequelize } from './src/db/database.js';
import invernaderomonitor from './src/models/data/invernaderomonitor.js';

(async () => {
  try {
    await invernaderomonitor.sync({ alter: true });
    console.log('Model synced successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing model:', error);
    process.exit(1);
  }
})();
