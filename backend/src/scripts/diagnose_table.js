const db = require('../config/db');

const checkTable = () => {
    console.log("Checking students table columns...");
    db.query("SHOW COLUMNS FROM students", (err, results) => {
        if (err) {
            console.error("Error showing columns:", err);
        } else {
            console.log("Columns in students table:");
            console.table(results);
        }
        console.log("Check complete.");
        process.exit(0);
    });
};

checkTable();
