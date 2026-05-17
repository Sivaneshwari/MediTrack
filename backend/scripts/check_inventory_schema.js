const db = require("../src/config/db");

const sql = "DESCRIBE inventory";

db.query(sql, (err, results) => {
    if (err) {
        console.error("Describe Failed:", err);
    } else {
        console.log("Field,Type,Null,Key,Default,Extra");
        results.forEach(row => {
            console.log(`${row.Field},${row.Type},${row.Null},${row.Key},${row.Default},${row.Extra}`);
        });
    }
    process.exit();
});
