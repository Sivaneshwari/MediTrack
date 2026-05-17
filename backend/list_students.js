const db = require('./src/config/db');

db.query('SELECT student_id, email, password FROM students', (err, results) => {
    if (err) throw err;
    console.log("--- START USER LIST ---");
    console.log(JSON.stringify(results, null, 2));
    console.log("--- END USER LIST ---");
    process.exit();
});
