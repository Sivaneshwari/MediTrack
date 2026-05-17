const db = require('../config/db');

const checkVisits = async () => {
    db.query("SELECT * FROM visits LIMIT 0", (err, res, fields) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Columns:", fields.map(f => f.name));
        }
        process.exit(0);
    });
};

checkVisits();
