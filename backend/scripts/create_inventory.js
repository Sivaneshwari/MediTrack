const db = require("../src/config/db");

const queries = [
    `CREATE TABLE IF NOT EXISTS inventory (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      category VARCHAR(50) DEFAULT 'Medicine',
      stock_quantity INT DEFAULT 0,
      unit VARCHAR(20) DEFAULT 'units',
      low_stock_threshold INT DEFAULT 10,
      barcode VARCHAR(100) UNIQUE,
      expiry_date VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );`,

    // Seed some initial First Aid items if table is empty
    `INSERT IGNORE INTO inventory (name, category, stock_quantity, unit, low_stock_threshold) VALUES 
    ('Cotton Roll', 'First Aid', 20, 'rolls', 5),
    ('Bandages', 'First Aid', 50, 'units', 10),
    ('Antiseptic Solution (Betadine)', 'First Aid', 10, 'bottles', 2),
    ('Ointment (Burnol)', 'First Aid', 15, 'tubes', 3),
    ('Paracetamol 500mg', 'Medicine', 100, 'tablets', 20),
    ('Pain Relief Spray', 'First Aid', 5, 'cans', 2);`
];

async function runConfig() {
    console.log("Running Inventory DB Updates...");
    for (const q of queries) {
        try {
            await new Promise((resolve, reject) => {
                db.query(q, (err, res) => {
                    if (err) reject(err);
                    else resolve(res);
                });
            });
            console.log("✅ Executed query.");
        } catch (e) {
            console.error("❌ Error:", e.message);
        }
    }
    process.exit();
}

runConfig();
