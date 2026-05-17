const db = require('./backend/src/config/db');

async function checkColumns() {
    db.query('DESCRIBE students', (err, results) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log('--- students columns ---');
        results.forEach(col => console.log(col.Field));

        db.query('DESCRIBE staff', (err, results) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            console.log('--- staff columns ---');
            results.forEach(col => console.log(col.Field));
            process.exit(0);
        });
    });
}

checkColumns();
