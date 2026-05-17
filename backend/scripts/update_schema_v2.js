const db = require('../src/config/db');

const updateTables = async () => {
    try {
        // 1. Create notification_dismissals table
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS notification_dismissals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(50) NOT NULL,
                user_role ENUM('student', 'staff') NOT NULL,
                notification_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_dismissal (user_id, user_role, notification_id),
                FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE
            )
        `);
        console.log("✅ notification_dismissals table created/verified");

        // 2. Update blood_donation_requests table to add donor details
        // Check if columns exist first or just try to add them (ignoring error if exists is hard in mysql without procedure, 
        // effectively we can use a try-catch block for each column or just run it and ignore duplicates)

        const alterQueries = [
            "ALTER TABLE blood_donation_requests ADD COLUMN donor_name VARCHAR(255)",
            "ALTER TABLE blood_donation_requests ADD COLUMN donor_address TEXT",
            "ALTER TABLE blood_donation_requests ADD COLUMN donor_phone VARCHAR(50)",
            "ALTER TABLE blood_donation_requests ADD COLUMN is_fulfilled BOOLEAN DEFAULT FALSE",
            "ALTER TABLE blood_donation_requests ADD COLUMN fulfilled_at TIMESTAMP NULL"
        ];

        for (const q of alterQueries) {
            try {
                await db.promise().query(q);
                console.log(`Executed: ${q}`);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Skipping (already exists): ${q}`);
                } else {
                    console.error(`Error executing ${q}:`, err);
                }
            }
        }

        console.log("✅ Database schema updated successfully");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error updating schema:", error);
        process.exit(1);
    }
};

updateTables();
