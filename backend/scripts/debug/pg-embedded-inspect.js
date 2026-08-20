const { getPackageVersion, getPostgreSqlVersion, getVersionInfo, initLogger, logInfo, logError } = require('pg-embedded');

(async () => {
  try {
    console.log('pg-embedded package version:', getPackageVersion());
    console.log('PostgreSQL version info:', getPostgreSqlVersion());
    console.log('Version info raw:', getVersionInfo());
    try {
      initLogger();
      logInfo('Logger initialized from binding');
    } catch (e) {
      console.error('initLogger failed:', e && e.stack ? e.stack : e);
    }
  } catch (err) {
    console.error('Failed to inspect pg-embedded binding:');
    console.error(err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
