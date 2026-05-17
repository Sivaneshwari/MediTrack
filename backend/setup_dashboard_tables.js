const db = require('./src/config/db');

const setupDashboardTables = async () => {
    const queries = [
        // Appointments Table
        `CREATE TABLE IF NOT EXISTS appointments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(50) NOT NULL,
            user_role ENUM('student', 'staff') NOT NULL,
            date DATE NOT NULL,
            time VARCHAR(20) NOT NULL,
            reason TEXT,
            status ENUM('pending', 'approved', 'completed', 'cancelled') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,

        // Visits/History Table (For completed visits with notes)
        `CREATE TABLE IF NOT EXISTS visits (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(50) NOT NULL,
            user_role ENUM('student', 'staff') NOT NULL,
            visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            diagnosis TEXT,
            treatment TEXT,
            notes TEXT
        )`,

        // Notifications Table (For Blood Bank Broadcasts etc)
        `CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(100) NOT NULL,
            message TEXT NOT NULL,
            type VARCHAR(50) DEFAULT 'general',
            target_audience ENUM('all', 'student', 'staff') DEFAULT 'all',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    ];

    console.log("🔄 Setting up dashboard tables...");

    for (const query of queries) {
        await new Promise((resolve) => {
            db.query(query, (err) => {
                if (err) console.error("❌ Error running query:", err.message);
                resolve();
            });
        });
    }

    console.log("✅ Dashboard tables confirmed!");
    process.exit();
};

setupDashboardTables();
