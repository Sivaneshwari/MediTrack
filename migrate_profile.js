const db = require('./backend/src/config/db');

const sqls = [
    "ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_picture LONGTEXT",
    "ALTER TABLE staff ADD COLUMN IF NOT EXISTS profile_picture LONGTEXT",
    "ALTER TABLE staff ADD COLUMN IF NOT EXISTS height VARCHAR(10)",
    "ALTER TABLE staff ADD COLUMN IF NOT EXISTS weight VARCHAR(10)"
];

async function migrate() {
    for (const sql of sqls) {
        try {
            await new Promise((resolve, reject) => {
                db.query(sql, (err, result) => {
                    if (err) {
                        console.log(`Skipping or Error on: ${sql}`, err.message);
                    } else {
                        console.log(`Executed: ${sql}`);
                    }
                    resolve();
                });
            });
        } catch (err) {
            console.error(err);
        }
    }
    process.exit(0);
}

migrate();
