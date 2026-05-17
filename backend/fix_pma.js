const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    // We do not specify a database so we can access system tables if needed, 
    // or we can select one later. Permissions are global or db-specific.
});

db.connect((err) => {
    if (err) {
        console.error("❌ Connection failed:", err.message);
        process.exit(1);
    }
    console.log("✅ Connected to MySQL as root");

    const query = "GRANT ALL PRIVILEGES ON `phpmyadmin`.* TO 'pma'@'localhost';";

    // Also flushing privileges
    const flush = "FLUSH PRIVILEGES;";

    db.query(query, (err, result) => {
        if (err) {
            console.error("❌ Failed to grant privileges:", err.message);
        } else {
            console.log("✅ Successfully granted privileges to 'pma'@'localhost' on phpmyadmin database.");
        }

        db.query(flush, (err, result) => {
            if (err) console.error("❌ Failed to flush privileges:", err.message);
            else console.log("✅ Privileges flushed.");

            db.end();
        });
    });
});
