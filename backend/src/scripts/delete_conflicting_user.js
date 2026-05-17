const db = require('../config/db');

const studentId = 'BP241039';

const deleteUser = async () => {
    console.log(`Deleting student with ID: ${studentId}...`);
    try {
        await new Promise((resolve, reject) => {
            db.query("DELETE FROM students WHERE student_id = ?", [studentId], (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });
        console.log("Deletion successful.");
        process.exit(0);
    } catch (err) {
        console.error("Error deleting user:", err);
        process.exit(1);
    }
};

deleteUser();
