const db = require('../config/db');

const studentId = 'BP241039';

const checkUser = async () => {
    console.log(`Checking existence of student with ID: ${studentId}...`);
    try {
        await new Promise((resolve, reject) => {
            db.query("SELECT * FROM students WHERE student_id = ?", [studentId], (err, res) => {
                if (err) reject(err);
                else {
                    if (res.length > 0) {
                        console.log("User FOUND:", res[0]);
                    } else {
                        console.log("User NOT FOUND.");
                    }
                    resolve(res);
                }
            });
        });
        process.exit(0);
    } catch (err) {
        console.error("Error checking user:", err);
        process.exit(1);
    }
};

checkUser();
