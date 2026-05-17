const db = require('../config/db');

const checkVisitsTable = async () => {
    try {
        await new Promise((resolve) => {
            db.query("SHOW COLUMNS FROM visits", (err, results) => {
                if (err) console.error("Visits Columns Error:", err);
                else {
                    console.log("=== VISITS COLUMNS ===");
                    results.forEach(c => console.log(`${c.Field}: ${c.Type} (Key: ${c.Key})`));
                }
                resolve();
            });
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

checkVisitsTable();
