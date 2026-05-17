const db = require("../src/config/db");

const queries = [
    "ALTER TABLE students ADD COLUMN email VARCHAR(100);",
    "ALTER TABLE staff ADD COLUMN email VARCHAR(100);",
    `CREATE TABLE IF NOT EXISTS password_resets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(100) NOT NULL,
      otp VARCHAR(10) NOT NULL,
      role VARCHAR(20) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
];

async function runConfig() {
    console.log("Running DB Updates...");
    for (const q of queries) {
        try {
            await new Promise((resolve, reject) => {
                db.query(q, (err, res) => {
                    // Ignore "Duplicate column name" error
                    if (err && err.code !== 'ER_DUP_FIELDNAME') reject(err);
                    else resolve(res);
                });
            });
            console.log("✅ Executed:", q);
        } catch (e) {
            console.error("❌ Error:", e.message);
        }
    }
    process.exit();
}

runConfig();
