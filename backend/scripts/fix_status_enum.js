const db = require('../src/config/db');

const fixStatusEnum = async () => {
    // We strictly define the ENUM to include 'approved'
    const query = `
        ALTER TABLE appointments
        MODIFY COLUMN status ENUM('pending', 'approved', 'completed', 'cancelled') DEFAULT 'pending';
    `;

    console.log("🔄 Updating status column ENUM definition...");

    db.query(query, (err, result) => {
        if (err) {
            console.error("❌ Error updating status column:", err);
        } else {
            console.log("✅ Status column updated successfully to include 'approved'!");
        }
        process.exit();
    });
};

fixStatusEnum();
