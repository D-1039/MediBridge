const path = require('path');
const { PostgresInstance } = require('pg-embedded');

(async function () {
  try {
    const DATA_DIR = path.join(__dirname, '..', '.pg-data');
    const PORT = 5433;
    const postgres = new PostgresInstance({
      port: PORT,
      username: 'postgres',
      password: 'postgres',
      persistent: true,
      dataDir: DATA_DIR,
      setupTimeout: 300,
    });

    console.log('Starting embedded Postgres (debug)...');
    await postgres.start();
    console.log('Embedded Postgres started (debug)');
  } catch (err) {
    console.error('Embedded Postgres debug error:');
    if (err && err.cause) {
      console.error('Cause:', err.cause);
    }
    console.error(err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
