const db = require('../config/db');

const checkAppointmentsTable = async () => {
    try {
        await new Promise((resolve) => {
            db.query("SHOW COLUMNS FROM appointments", (err, results) => {
                if (err) console.error("Appointments Columns Error:", err);
                else {
                    console.log("=== APPOINTMENTS COLUMNS ===");
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

checkAppointmentsTable();
