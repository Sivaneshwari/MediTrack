const db = require('../src/config/db');

const addPriorityColumn = async () => {
    const query = `
        ALTER TABLE appointments
        ADD COLUMN priority ENUM('Casual', 'High', 'Emergency') DEFAULT 'Casual';
    `;

    console.log("🔄 Adding priority column to appointments table...");

    db.query(query, (err, result) => {
        if (err) {
            // content of getting 'Duplicate column name' error which meant it already exists
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log("⚠️ Priority column already exists.");
            } else {
                console.error("❌ Error adding column:", err);
            }
        } else {
            console.log("✅ Priority column added successfully!");
        }
        process.exit();
    });
};

addPriorityColumn();
