const db = require('../config/db');

const checkAppts = async () => {
    db.query("SELECT * FROM appointments LIMIT 0", (err, res, fields) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Columns:", fields.map(f => f.name));
        }
        process.exit(0);
    });
};

checkAppts();
