const db = require('../src/config/db');

async function checkData() {
    try {
        const [presc] = await db.promise().query("SELECT * FROM prescriptions LIMIT 5");
        console.log("Prescriptions count:", presc.length);
        if (presc.length > 0) console.log(presc[0]);

        const [requests] = await db.promise().query("SELECT * FROM blood_donation_requests LIMIT 5");
        console.log("Blood requests count:", requests.length);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkData();
