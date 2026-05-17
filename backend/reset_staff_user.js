const db = require('./src/config/db');
const bcrypt = require('bcryptjs');

const resetStaff = async () => {
    const password = '123456';
    const hashed = await bcrypt.hash(password, 10);

    // Check if 'staff' exists
    db.query("SELECT * FROM staff WHERE staff_id = 'staff'", (err, res) => {
        if (res && res.length > 0) {
            console.log("User 'staff' already exists. updating password...");
            db.query("UPDATE staff SET password = ? WHERE staff_id = 'staff'", [hashed], () => {
                console.log("✅ Updated password for 'staff' to '123456'");
                process.exit();
            });
        } else {
            console.log("Creating user 'staff'...");
            const sql = `INSERT INTO staff (staff_id, full_name, email, phone, department, password) VALUES (?, ?, ?, ?, ?, ?)`;
            db.query(sql, ['staff', 'Test Staff', 'staff@test.com', '1234567890', 'Med', hashed], (err) => {
                if (err) console.error(err);
                else console.log("✅ Created user 'staff' with password '123456'");
                process.exit();
            });
        }
    });
};

resetStaff();
