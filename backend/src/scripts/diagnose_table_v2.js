const db = require('../config/db');

const diagnose = async () => {
    try {
        await new Promise((resolve) => {
            db.query("SHOW COLUMNS FROM students", (err, results) => {
                if (err) console.error("Students Columns Error:", err);
                else {
                    console.log("=== STUDENTS COLUMNS ===");
                    results.forEach(c => console.log(`${c.Field}: ${c.Type} (Key: ${c.Key})`));
                }
                resolve();
            });
        });

        await new Promise((resolve) => {
            db.query("SELECT * FROM students LIMIT 1", (err, results) => {
                if (err) console.error("Students Select Error:", err);
                else {
                    console.log("=== SAMPLE STUDENT ===");
                    console.log(results);
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

diagnose();
