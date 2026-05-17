const db = require('./src/config/db');

const id = 'BP241045';

db.query('SELECT * FROM students WHERE student_id = ?', [id], (err, results) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Results:', results);
    }
    process.exit();
});
