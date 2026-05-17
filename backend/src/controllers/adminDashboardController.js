const db = require('../config/db');
const nodemailer = require("nodemailer");
const { encryptData, decryptData } = require('../utils/encryption');

// Configure Transporter (Same as forgotController)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "chilluelango@gmail.com",
        pass: "pofz rahp trqm cziv",
    },
});

// Safe imports for export libraries
let xlsx, jsPDF;
try {
    xlsx = require('xlsx');
    const jspdfModule = require('jspdf');
    jsPDF = jspdfModule.jsPDF;
    require('jspdf-autotable');
} catch (e) {
    console.warn("Export libraries (xlsx, jspdf) not fully installed. Exports may fail.");
}

/* ===========================
   USER MANAGEMENT
=========================== */
exports.getAllStudents = (req, res) => {
    db.query("SELECT * FROM students ORDER BY full_name", (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        const decryptedResults = results.map(row => {
            if (row.blood_group) {
                row.blood_group = decryptData(row.blood_group);
            }
            return row;
        });
        res.json(decryptedResults);
    });
};

exports.getAllStaff = (req, res) => {
    db.query("SELECT * FROM staff ORDER BY full_name", (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        const decryptedResults = results.map(row => {
            if (row.blood_group) {
                row.blood_group = decryptData(row.blood_group);
            }
            return row;
        });
        res.json(decryptedResults);
    });
};

// Generic Delete User
exports.deleteUser = (req, res) => {
    const { type, id } = req.params; // type: 'student' or 'staff'
    const table = type === 'student' ? 'students' : 'staff';
    const idColumn = type === 'student' ? 'student_id' : 'staff_id';

    // Also delete appointments associated with them? 
    // Foreign keys might handle it or we might want to keep history.
    // For now, simple delete.
    const query = `DELETE FROM ${table} WHERE ${idColumn} = ?`;

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Delete failed" });
        }
        res.json({ message: "User deleted" });
    });
};

exports.updateUser = (req, res) => {
    const { type, id } = req.params;
    const { full_name, department, shift, blood_group, dob } = req.body;
    let secureBloodGroup = blood_group;

    if (secureBloodGroup) {
       secureBloodGroup = encryptData(secureBloodGroup);
    }

    console.log(`Update User Request [${type}/${id}]`);
    console.log("Body:", req.body);

    const table = type === 'student' ? 'students' : 'staff';
    const idColumn = type === 'student' ? 'student_id' : 'staff_id';

    const query = `UPDATE ${table} SET full_name = ?, department = ?, shift = ?, blood_group = ?, dob = ? WHERE ${idColumn} = ?`;

    db.query(query, [full_name, department, shift, secureBloodGroup, dob, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Update failed" });
        }
        res.json({ message: "User updated successfully" });
    });
};

exports.createUser = (req, res) => {
    const { type } = req.params; // 'student' or 'staff'
    const { id, full_name, department, shift, blood_group, dob } = req.body;
    
    if (!id || !full_name || !dob) {
        return res.status(400).json({ message: "Missing required fields (ID, Name, DOB)" });
    }

    const table = type === 'student' ? 'students' : 'staff';
    const idColumn = type === 'student' ? 'student_id' : 'staff_id';
    
    let secureBloodGroup = blood_group;
    if (secureBloodGroup) {
        secureBloodGroup = encryptData(secureBloodGroup);
    }

    const query = `
        INSERT INTO ${table} 
        (${idColumn}, full_name, department, shift, blood_group, dob) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [id, full_name, department, shift, secureBloodGroup, dob], (err, result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(400).json({ message: `${type === 'student' ? 'Student' : 'Staff'} with this ID already exists` });
            }
            console.error(err);
            return res.status(500).json({ message: "Failed to create user" });
        }
        res.status(201).json({ message: `${type === 'student' ? 'Student' : 'Staff'} added successfully` });
    });
};

/* ===========================
   DASHBOARD STATS
=========================== */
exports.getDashboardStats = (req, res) => {
    const stats = {};
    const queries = {
        appointmentsToday: "SELECT COUNT(*) as count FROM appointments WHERE DATE(appointment_date) = CURDATE()",
        pendingAppointments: "SELECT COUNT(*) as count FROM appointments WHERE status = 'pending'",
        lowStockItems: "SELECT COUNT(*) as count FROM inventory WHERE stock_quantity <= low_stock_threshold",
        totalStudents: "SELECT COUNT(*) as count FROM students",
        totalStaff: "SELECT COUNT(*) as count FROM staff",
        bloodGroups: `
            SELECT blood_group, COUNT(*) as count 
            FROM (
                SELECT blood_group FROM students 
                UNION ALL 
                SELECT blood_group FROM staff
            ) as all_users 
            GROUP BY blood_group
        `
    };

    const runQuery = (key, sql) => {
        return new Promise((resolve, reject) => {
            db.query(sql, (err, result) => {
                if (err) return reject(err);
                if (key === 'bloodGroups') {
                    // Start with 0 for all groups
                    const counts = { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0 };
                    result.forEach(row => {
                        let bg = row.blood_group;
                        if (bg) {
                            bg = decryptData(bg);
                            counts[bg] = (counts[bg] || 0) + row.count;
                        }
                    });
                    stats[key] = counts;
                } else {
                    stats[key] = result[0].count;
                }
                resolve();
            });
        });
    };

    Promise.all(Object.keys(queries).map(key => runQuery(key, queries[key])))
        .then(() => res.json(stats))
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: "Error fetching stats" });
        });
};

/* ===========================
   APPOINTMENTS
=========================== */
exports.getStudentAppointments = (req, res) => {
    const query = `
    SELECT a.*, s.full_name, s.student_id, s.department, s.blood_group 
    FROM appointments a
    JOIN students s ON a.patient_id = s.student_id
    WHERE a.patient_type = 'student'
    ORDER BY a.appointment_date DESC
  `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: "Database Error" });
        const decryptedResults = results.map(row => {
            if (row.blood_group) {
                row.blood_group = decryptData(row.blood_group);
            }
            return row;
        });
        res.json(decryptedResults);
    });
};

exports.getStaffAppointments = (req, res) => {
    const query = `
    SELECT a.*, s.full_name, s.staff_id, s.department, s.blood_group 
    FROM appointments a
    JOIN staff s ON a.patient_id = s.staff_id
    WHERE a.patient_type = 'staff'
    ORDER BY a.appointment_date DESC
  `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: "Database Error" });
        const decryptedResults = results.map(row => {
            if (row.blood_group) {
                row.blood_group = decryptData(row.blood_group);
            }
            return row;
        });
        res.json(decryptedResults);
    });
};

exports.getAllAppointments = (req, res) => {
    const query = `
        SELECT 
            a.id, a.appointment_date, a.reason, a.status, a.patient_type, a.priority,
            CASE 
                WHEN a.patient_type = 'student' THEN s.full_name 
                WHEN a.patient_type = 'staff' THEN st.full_name 
            END as patient_name,
            CASE 
                WHEN a.patient_type = 'student' THEN s.student_id 
                WHEN a.patient_type = 'staff' THEN st.staff_id 
            END as patient_details
        FROM appointments a
        LEFT JOIN students s ON a.patient_type = 'student' AND a.patient_id = s.student_id
        LEFT JOIN staff st ON a.patient_type = 'staff' AND a.patient_id = st.staff_id
        ORDER BY a.appointment_date ASC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: "Database Error" });
        res.json(results);
    });
};

exports.createAppointment = (req, res) => {
    const { patient_type, patient_id, appointment_date, reason, nurse_notes, status } = req.body;
    const query = `
    INSERT INTO appointments (patient_type, patient_id, appointment_date, reason, nurse_notes, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
    db.query(query, [patient_type, patient_id, appointment_date, reason, nurse_notes, status || 'pending'], (err, result) => {
        if (err) return res.status(500).json({ message: "Error creating appointment" });
        res.status(201).json({ message: "Appointment created", id: result.insertId });
    });
};

exports.updateAppointment = (req, res) => {
    const { id } = req.params;
    const { status, nurse_notes } = req.body;
    const query = "UPDATE appointments SET status = ?, nurse_notes = ? WHERE id = ?";
    db.query(query, [status, nurse_notes, id], (err, result) => {
        if (err) return res.status(500).json({ message: "Update failed" });
        res.json({ message: "Appointment updated" });
    });
};

exports.deleteAppointment = (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM appointments WHERE id = ?";
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Delete failed" });
        res.json({ message: "Appointment deleted" });
    });
};

/* ===========================
   PRESCRIPTIONS
=========================== */
exports.getPrescriptionsByAppointment = (req, res) => {
    const { appointmentId } = req.params;
    const query = "SELECT * FROM prescriptions WHERE appointment_id = ?";
    db.query(query, [appointmentId], (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching prescriptions" });
        res.json(results);
    });
};

exports.createPrescription = (req, res) => {
    const { appointment_id, medicine_name, dosage, frequency, duration, notes } = req.body;
    const query = `
    INSERT INTO prescriptions (appointment_id, medicine_name, dosage, frequency, duration, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
    db.query(query, [appointment_id, medicine_name, dosage, frequency, duration, notes], (err, result) => {
        if (err) return res.status(500).json({ message: "Error adding prescription" });
        res.status(201).json({ message: "Prescription added", id: result.insertId });
    });
};

/* ===========================
   INVENTORY
=========================== */
exports.getInventory = (req, res) => {
    db.query("SELECT * FROM inventory ORDER BY item_name", (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
};

exports.getLowStockItems = (req, res) => {
    db.query("SELECT * FROM inventory WHERE stock_quantity <= low_stock_threshold", (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
};

exports.createInventoryItem = (req, res) => {
    const { item_name, item_type, stock_quantity, unit, expiry_date, low_stock_threshold } = req.body;
    const query = `
    INSERT INTO inventory (item_name, item_type, stock_quantity, unit, expiry_date, low_stock_threshold)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
    db.query(query, [item_name, item_type, stock_quantity, unit, expiry_date, low_stock_threshold], (err, result) => {
        if (err) return res.status(500).json({ message: "Error creating item" });
        res.status(201).json({ message: "Item added", id: result.insertId });
    });
};

exports.updateInventoryItem = (req, res) => {
    const { id } = req.params;
    const { stock_quantity, low_stock_threshold } = req.body;
    const query = "UPDATE inventory SET stock_quantity = ?, low_stock_threshold = ? WHERE id = ?";
    db.query(query, [stock_quantity, low_stock_threshold, id], (err, result) => {
        if (err) return res.status(500).json({ message: "Update failed" });
        res.json({ message: "Inventory updated" });
    });
};

exports.deleteInventoryItem = (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM inventory WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Delete failed" });
        res.json({ message: "Item deleted" });
    });
};

/* ===========================
   BLOOD GROUPS & NOTIFICATIONS
=========================== */
exports.getStudentsByBloodGroup = (req, res) => {
    let { bloodGroup } = req.query;
    let query = "SELECT full_name, student_id, blood_group, department, dob FROM students";
    
    db.query(query, [], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        // Decrypt the results before filtering
        let decryptedResults = results.map(row => {
            if (row.blood_group) {
                row.blood_group = decryptData(row.blood_group);
            }
            return row;
        });
        
        if (bloodGroup) {
            decryptedResults = decryptedResults.filter(row => row.blood_group === bloodGroup);
        }
        res.json(decryptedResults);
    });
};

exports.getStaffByBloodGroup = (req, res) => {
    let { bloodGroup } = req.query;
    let query = "SELECT full_name, staff_id, blood_group, department, dob FROM staff";
    
    db.query(query, [], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        
        // Decrypt the results before filtering
        let decryptedResults = results.map(row => {
           if (row.blood_group) {
               row.blood_group = decryptData(row.blood_group);
           }
           return row;
        });

        if (bloodGroup) {
            decryptedResults = decryptedResults.filter(row => row.blood_group === bloodGroup);
        }
        res.json(decryptedResults);
    });
};

exports.sendBloodDonationRequest = (req, res) => {
    const { blood_group, urgency, contact_person, contact_phone, message } = req.body;

    const requestQuery = `
    INSERT INTO blood_donation_requests (blood_group, urgency, contact_person, contact_phone, message)
    VALUES (?, ?, ?, ?, ?)
  `;

    db.query(requestQuery, [blood_group, urgency, contact_person, contact_phone, message], (err, result) => {
        if (err) {
            console.error("Error creating blood request:", err);
            return res.status(500).json({ message: "Error sending request" });
        }

        // 1. Create Notification
        const notifTitle = `URGENT: ${blood_group} Blood Needed!`;
        const notifMessage = `${message}\nContact: ${contact_person} (${contact_phone})`;

        const notifQuery = `
            INSERT INTO notifications (title, message, type, target_audience)
            VALUES (?, ?, 'blood_bank', 'all')
        `;

        db.query(notifQuery, [notifTitle, notifMessage], (notifErr) => {
            if (notifErr) console.error("Error creating notification:", notifErr);
        });

        // 2. Send Emails
        // Fetch all student and staff emails
        const emailQuery = `
            SELECT email FROM students WHERE email IS NOT NULL AND email != ''
            UNION
            SELECT email FROM staff WHERE email IS NOT NULL AND email != ''
        `;

        db.query(emailQuery, (emailErr, emailResults) => {
            if (emailErr) {
                console.error("Error fetching emails for broadcast:", emailErr);
                // Don't fail the request just because email failed, but log it
            } else {
                const emails = emailResults.map(row => row.email);

                if (emails.length > 0) {
                    const mailOptions = {
                        from: "MediTrack <meditrack.system@gmail.com>",
                        bcc: emails, // Use BCC to send to everyone efficiently and privately
                        subject: `URGENT: ${blood_group} Blood Required`,
                        text: `
URGENT BLOOD REQUIREMENT

Blood Group: ${blood_group}
Urgency: ${urgency}

Message:
${message}

Contact Person: ${contact_person}
Contact Phone: ${contact_phone}

Please contact immediately if you are able to donate.

- MediTrack System
                        `
                    };

                    transporter.sendMail(mailOptions, (mailSendErr, info) => {
                        if (mailSendErr) console.error("Broadcast Email Error:", mailSendErr);
                        else console.log("Broadcast email sent to " + emails.length + " recipients");
                    });
                }
            }
        });

        res.status(201).json({ message: "Blood donation request broadcasted and emails sent", id: result.insertId });
    });
};

exports.getBloodDonationHistory = (req, res) => {
    const query = "SELECT * FROM blood_donation_requests ORDER BY created_at DESC";
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching blood requests:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results);
    });
};

exports.updateBloodDonationRequest = (req, res) => {
    const { id } = req.params;
    const { donor_name, donor_address, donor_phone } = req.body;

    // We mark it as fulfilled when donor details are added
    const query = `
        UPDATE blood_donation_requests 
        SET donor_name = ?, donor_address = ?, donor_phone = ?, is_fulfilled = TRUE, fulfilled_at = NOW()
        WHERE id = ?
    `;

    db.query(query, [donor_name, donor_address, donor_phone, id], (err, result) => {
        if (err) {
            console.error("Error updating blood request:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json({ message: "Donor details updated successfully" });
    });
};

/* ===========================
   EXPORTS (Excel / PDF)
=========================== */
// 1. APPOINTMENTS
exports.exportAppointmentsExcel = (req, res) => {
    if (!xlsx) return res.status(500).send("Export library (xlsx) missing");
    const query = `
    SELECT a.id, a.patient_type, a.patient_id, a.appointment_date, a.reason, a.status, 
           CASE WHEN a.patient_type='student' THEN s.full_name ELSE st.full_name END as name
    FROM appointments a
    LEFT JOIN students s ON a.patient_id = s.student_id AND a.patient_type = 'student'
    LEFT JOIN staff st ON a.patient_id = st.staff_id AND a.patient_type = 'staff'
  `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).send("Database error");
        const ws = xlsx.utils.json_to_sheet(results);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Appointments");
        const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Disposition', 'attachment; filename="appointments.xlsx"');
        res.send(buf);
    });
};

exports.exportAppointmentsPDF = (req, res) => {
    if (!jsPDF) return res.status(500).send("Export library (jspdf) missing");
    const query = `
    SELECT a.appointment_date, a.patient_type, a.patient_id, a.reason, a.status,
           CASE WHEN a.patient_type='student' THEN s.full_name ELSE st.full_name END as name
    FROM appointments a
    LEFT JOIN students s ON a.patient_id = s.student_id AND a.patient_type = 'student'
    LEFT JOIN staff st ON a.patient_id = st.staff_id AND a.patient_type = 'staff'
    ORDER BY a.appointment_date DESC
  `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).send("Database error");
        const doc = new jsPDF();
        doc.text("Meditrack - Appointments Report", 14, 15);
        doc.autoTable({
            startY: 20,
            head: [['Date', 'Type', 'ID', 'Name', 'Reason', 'Status']],
            body: results.map(r => [new Date(r.appointment_date).toLocaleDateString('en-GB'), r.patient_type, r.patient_id, r.name, r.reason, r.status])
        });
        const buf = doc.output('arraybuffer');
        res.setHeader('Content-Disposition', 'attachment; filename="appointments.pdf"');
        res.send(Buffer.from(buf));
    });
};

// 2. INVENTORY
exports.exportInventoryExcel = (req, res) => {
    if (!xlsx) return res.status(500).send("Export library (xlsx) missing");
    db.query("SELECT * FROM inventory", (err, results) => {
        if (err) return res.status(500).send("Database error");
        const ws = xlsx.utils.json_to_sheet(results);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Inventory");
        const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Disposition', 'attachment; filename="inventory.xlsx"');
        res.send(buf);
    });
};

exports.exportInventoryPDF = (req, res) => {
    if (!jsPDF) return res.status(500).send("Export library (jspdf) missing");
    db.query("SELECT * FROM inventory", (err, results) => {
        if (err) return res.status(500).send("Database error");
        const doc = new jsPDF();
        doc.text("Meditrack - Inventory Report", 14, 15);
        doc.autoTable({
            startY: 20,
            head: [['Item Name', 'Type', 'Stock', 'Unit', 'Threshold']],
            body: results.map(r => [r.item_name, r.item_type, r.stock_quantity, r.unit, r.low_stock_threshold])
        });
        const buf = doc.output('arraybuffer');
        res.setHeader('Content-Disposition', 'attachment; filename="inventory.pdf"');
        res.send(Buffer.from(buf));
    });
};

// 3. BLOOD GROUPS
exports.exportBloodGroupsExcel = (req, res) => {
    if (!xlsx) return res.status(500).send("Export library (xlsx) missing");
    const { type } = req.query; // 'student' or 'staff'
    let query = "";
    if (type === 'student') query = "SELECT full_name, student_id as id, blood_group, dob FROM students";
    else query = "SELECT full_name, staff_id as id, blood_group, dob FROM staff";

    db.query(query, (err, results) => {
        if (err) return res.status(500).send("Database error");

        const decryptedResults = results.map(row => {
            if (row.blood_group) row.blood_group = decryptData(row.blood_group);
            return row;
        });

        const ws = xlsx.utils.json_to_sheet(decryptedResults);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Blood Donors");
        const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Disposition', `attachment; filename="blood_groups_${type}.xlsx"`);
        res.send(buf);
    });
};

exports.exportBloodGroupsPDF = (req, res) => {
    if (!jsPDF) return res.status(500).send("Export library (jspdf) missing");
    const { type } = req.query;
    let query = "";
    let idLabel = "";
    if (type === 'student') { query = "SELECT full_name, student_id as id, blood_group, dob FROM students"; idLabel = "Student ID"; }
    else { query = "SELECT full_name, staff_id as id, blood_group, dob FROM staff"; idLabel = "Staff ID"; }

    db.query(query, (err, results) => {
        if (err) return res.status(500).send("Database error");

        const doc = new jsPDF();
        doc.text(`Meditrack - Blood Donors (${type})`, 14, 15);
        
        const decryptedBody = results.map(r => [
             r.full_name, 
             r.id, 
             r.blood_group ? decryptData(r.blood_group) : 'N/A', 
             r.dob
        ]);

        doc.autoTable({
            startY: 20,
            head: [['Name', idLabel, 'Blood Group', 'DOB']],
            body: decryptedBody
        });
        const buf = doc.output('arraybuffer');
        res.setHeader('Content-Disposition', `attachment; filename="blood_groups_${type}.pdf"`);
        res.send(Buffer.from(buf));
    });
};
