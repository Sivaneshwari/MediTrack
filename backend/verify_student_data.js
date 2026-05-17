const mysql = require("mysql2");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "meditrack",
    port: '3306',
});

async function run() {
    const query = (sql, params) => new Promise((resolve, reject) => {
        db.query(sql, params, (err, res) => err ? reject(err) : resolve(res));
    });

    try {
        const studentId = 'BP241045';
        console.log(`Checking appointments for ${studentId}...`);

        // Check all appointments
        const appts = await query("SELECT id, appointment_date, reason, status FROM appointments WHERE patient_id = ? ORDER BY appointment_date DESC", [studentId]);
        console.log("Appointments:", JSON.stringify(appts, null, 2));

        // Check prescriptions
        const prescs = await query(`
        SELECT p.*, a.appointment_date, a.reason 
        FROM appointments a
        LEFT JOIN prescriptions p ON p.appointment_id = a.id
        WHERE a.patient_id = ?
        ORDER BY a.appointment_date DESC
    `, [studentId]);
        console.log("Prescriptions (Joined):", JSON.stringify(prescs, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        db.end();
    }
}

run();
