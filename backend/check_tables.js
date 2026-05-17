const db = require('./src/config/db');

db.query("SHOW TABLES", (err, results) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log("Tables:", results.map(r => Object.values(r)[0]));
    process.exit(0);
});
