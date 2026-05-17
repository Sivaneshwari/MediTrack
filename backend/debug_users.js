const db = require('./src/config/db');
const bcrypt = require('bcryptjs');

const checkUsers = async () => {
    console.log("🔍 Checking Students table...");

    const query = "SELECT student_id, full_name, email, password FROM students";

    db.query(query, async (err, results) => {
        if (err) {
            console.error("❌ Error fetching students:", err.message);
            process.exit(1);
        }

        if (results.length === 0) {
            console.log("⚠️ No students found in the database.");
        } else {
            console.log(`✅ Found ${results.length} students:`);
            for (const user of results) {
                console.log(`- ID: ${user.student_id}, Email: ${user.email}, Name: ${user.full_name}, HashedPassword: ${user.password.substring(0, 20)}...`);
                // Test the password '123456' against the hash
                const isMatch = await bcrypt.compare('123456', user.password);
                console.log(`  --> Password '123456' match? ${isMatch}`);
            }
        }
        process.exit();
    });
};

checkUsers();
