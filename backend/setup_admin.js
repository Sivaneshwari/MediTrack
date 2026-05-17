const db = require('./src/config/db');
const bcrypt = require('bcryptjs');

const setupAdmin = async () => {
    // 1. Create admins table
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            admin_id VARCHAR(50) NOT NULL UNIQUE,
            full_name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            phone VARCHAR(20),
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    await new Promise((resolve) => {
        db.query(createTableQuery, (err) => {
            if (err) console.error("❌ Error creating admins table:", err.message);
            else console.log("✅ Admins table ready");
            resolve();
        });
    });

    // 2. Check if default admin exists
    const checkAdminQuery = "SELECT * FROM admins WHERE admin_id = 'ADMIN001'";

    db.query(checkAdminQuery, async (err, result) => {
        if (result && result.length > 0) {
            console.log("ℹ️  Default admin already exists (ADMIN001)");
            process.exit();
        } else {
            // 3. Create default admin
            const hashed = await bcrypt.hash("admin123", 10);
            const insertQuery = `
                INSERT INTO admins (admin_id, full_name, email, phone, password)
                VALUES (?, ?, ?, ?, ?)
            `;

            db.query(insertQuery, ['ADMIN001', 'System Admin', 'admin@meditrack.com', '0000000000', hashed], (err) => {
                if (err) console.error("❌ Error creating default admin:", err.message);
                else {
                    console.log("✅ Default admin created successfully!");
                    console.log("   User ID: ADMIN001");
                    console.log("   Pass:    admin123");
                }
                process.exit();
            });
        }
    });
};

setupAdmin();
