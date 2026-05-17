const db = require('./src/config/db');
const bcrypt = require('bcryptjs');

const createTestStudent = async () => {
    const password = '123456';
    const hashed = await bcrypt.hash(password, 10);

    // Check if 'student' exists
    db.query("SELECT * FROM students WHERE student_id = 'student'", (err, res) => {
        if (res.length > 0) {
            console.log("User 'student' already exists. updating password...");
            db.query("UPDATE students SET password = ? WHERE student_id = 'student'", [hashed], () => {
                console.log("✅ Updated password for 'student' to '123456'");
                process.exit();
            });
        } else {
            console.log("Creating user 'student'...");
            const sql = `INSERT INTO students (student_id, full_name, email, phone, department, password) VALUES (?, ?, ?, ?, ?, ?)`;
            db.query(sql, ['student', 'Test Student', 'student@test.com', '1234567890', 'CS', hashed], (err) => {
                if (err) console.error(err);
                else console.log("✅ Created user 'student' with password '123456'");
                process.exit();
            });
        }
    });
};

createTestStudent();
