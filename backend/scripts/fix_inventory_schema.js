const db = require("../src/config/db");

const alterTable = `
    ALTER TABLE inventory 
    MODIFY COLUMN expiry_date VARCHAR(20) NULL;
`;

// Also ensure the column exists if it wasn't there
const checkCol = `SELECT * FROM inventory LIMIT 1`;

db.query(checkCol, (err, res) => {
    if (err) {
        // Table probably doesn't exist, create it
        const createTable = `
            CREATE TABLE IF NOT EXISTS inventory (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100),
                stock_quantity INT DEFAULT 0,
                unit VARCHAR(50),
                low_stock_threshold INT DEFAULT 10,
                barcode VARCHAR(255),
                expiry_date VARCHAR(20)
            )
        `;
        db.query(createTable, (err) => {
            if (err) console.error("Create failed", err);
            else console.log("Table created");
            process.exit();
        });
    } else {
        // Table exists, modify column
        db.query(alterTable, (err) => {
            if (err) console.error("Alter failed", err);
            else console.log("Column type updated to VARCHAR(20)");
            process.exit();
        });
    }
});
