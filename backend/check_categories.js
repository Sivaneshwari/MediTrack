const db = require('./src/config/db');

db.query("SELECT item_name, item_type FROM inventory", (err, results) => {
    if (err) {
        console.error(err);
    } else {
        console.log(JSON.stringify(results, null, 2));
    }
    process.exit();
});
