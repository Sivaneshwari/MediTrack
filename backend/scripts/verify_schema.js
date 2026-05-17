const db = require('../src/config/db');

async function checkSchema() {
    try {
        const [columns] = await db.promise().query("SHOW COLUMNS FROM blood_donation_requests");
        console.log("Columns in blood_donation_requests:", columns.map(c => c.Field));

        const [dismissal] = await db.promise().query("SHOW TABLES LIKE 'notification_dismissals'");
        console.log("notification_dismissals table exists:", dismissal.length > 0);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkSchema();
