const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const migrationPath = path.join(__dirname, '../migrations/remove_email_auth_fields.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

// Split by semicolon to handle multiple statements if needed, 
// though mysql driver usually handles one query at a time unless configured.
// We'll try to run them sequentially or rely on multipleStatements: true config if enabled.
// Looking at db.js, multipleStatements is NOT explicitly enabled.
// So we must split.

const queries = sql.split(';').map(q => q.trim()).filter(q => q.length > 0);

const runQueries = async () => {
    for (const query of queries) {
        console.log(`Running: ${query.substring(0, 50)}...`);
        await new Promise((resolve, reject) => {
            db.query(query, (err, res) => {
                if (err) {
                    // Ignore "check that column/key exists" errors if we are just dropping and it doesn't exist
                    // 1091 = Can't DROP 'x'; check that column/key exists
                    if (err.errno === 1091) {
                        console.warn("Column didn't exist, skipping.");
                        resolve();
                    } else {
                        console.error("Error:", err.message);
                        // We continue even if error, to try other drops
                        resolve();
                    }
                } else {
                    console.log("Success");
                    resolve();
                }
            });
        });
    }
    console.log("Migration completed.");
    process.exit(0);
};

runQueries();
