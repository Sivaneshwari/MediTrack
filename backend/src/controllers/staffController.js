const db = require("../config/db");
const bcrypt = require("bcryptjs");
const { encryptData, decryptData } = require("../utils/encryption");

exports.signup = async (req, res) => {
  const { staff_id, full_name, department, shift, blood_group, dob } = req.body;

  if (!staff_id || !full_name || !dob) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const sql = `
      INSERT INTO staff
      (staff_id, full_name, department, shift, blood_group, dob)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [staff_id, full_name, department, shift, blood_group, dob],
      err => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ message: "Staff already exists" });
          }
          return res.status(500).json({ message: "Database error" });
        }
        res.status(201).json({ message: "Staff registered successfully" });
      }
    );
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  const sql = "SELECT * FROM staff WHERE staff_id = ?";

  db.query(sql, [identifier], async (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (!result.length) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result[0];

    // Check DOB
    let dbDob = user.dob;
    let formattedDob = "";

    if (dbDob) {
      if (dbDob instanceof Date) {
        const day = dbDob.getDate().toString().padStart(2, '0');
        const month = (dbDob.getMonth() + 1).toString().padStart(2, '0');
        const year = dbDob.getFullYear();
        formattedDob = `${day}/${month}/${year}`;
      } else if (typeof dbDob === 'string') {
        // Assume format "YYYY-MM-DD" inside database or already formatted
        if (dbDob.includes('-')) {
          const parts = dbDob.split('-');
          if (parts.length === 3) {
            // parts is [YYYY, MM, DD]
            formattedDob = `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
        } else {
          formattedDob = dbDob;
        }
      }
    }

    if (password.trim() !== formattedDob) {
      return res.status(401).json({ message: "Invalid Date of Birth (Use DD/MM/YYYY)" });
    }

    res.json({
      message: "Staff login successful",
      staff_id: user.staff_id,
      full_name: user.full_name,
    });
  });
};

/* ===========================
   DASHBOARD FEATURES
=========================== */

// Create Appointment
// Create Appointment
// Create Appointment
// Create Appointment
exports.createAppointment = (req, res) => {
  const { staff_id, patient_id, role, date, time, reason, priority } = req.body;

  console.log(`\n[Staff createAppointment] Request received:`);
  console.log(`  Staff ID: ${staff_id}`);
  console.log(`  Patient ID: ${patient_id}`);
  console.log(`  Role: ${role}`);
  console.log(`  Date: ${date}`);
  console.log(`  Time: ${time}`);
  console.log(`  Reason: ${reason}`);
  console.log(`  Priority: ${priority}`);

  if (!staff_id || !date || !time) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // If patient_id is provided, book for that user (student or other staff). Otherwise, book for self.
  const targetId = patient_id || staff_id;
  const targetRole = role || 'staff';
  const apptPriority = priority || 'Casual';

  // Combine date and time
  const appointment_date = `${date} ${time}:00`;

  console.log(`  Target ID: ${targetId}, Target Role: ${targetRole}`);
  console.log(`  Appointment Date: ${appointment_date}`);

  // Check for slot availability with tight range
  const checkStart = `${date} ${time}:00`;
  const checkEnd = `${date} ${time}:59`;

  console.log(`  Checking slot availability between ${checkStart} and ${checkEnd}`);

  const checkSql = "SELECT id FROM appointments WHERE appointment_date BETWEEN ? AND ? AND status != 'cancelled'";

  db.query(checkSql, [checkStart, checkEnd], (checkErr, checkResults) => {
    if (checkErr) {
      console.error("[Staff createAppointment] DB Error:", checkErr);
      return res.status(500).json({ message: "Database error checking slot" });
    }

    console.log(`  Found ${checkResults.length} existing appointments in this slot`);

    if (checkResults.length > 0) {
      console.log(`  ❌ BLOCKED - Slot already taken!`);
      return res.status(400).json({ message: "Slot already booked. Please choose another time." });
    }

    console.log(`  ✅ Slot is available, proceeding with booking...`);

    const sql = `
        INSERT INTO appointments (patient_id, patient_type, appointment_date, reason, status, priority)
        VALUES (?, ?, ?, ?, 'pending', ?)
    `;

    db.query(sql, [targetId, targetRole, appointment_date, reason, apptPriority], (err, result) => {
      if (err) {
        console.error("[Staff createAppointment] Insert Error:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      console.log(`  ✅ Appointment created successfully! ID: ${result.insertId}`);
      res.status(201).json({ message: "Appointment booked successfully" });
    });
  });
};

// Get Booked Slots
exports.getBookedSlots = (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: "Date is required" });

  const start = `${date} 00:00:00`;
  const end = `${date} 23:59:59`;

  const query = "SELECT appointment_date FROM appointments WHERE appointment_date BETWEEN ? AND ? AND status != 'cancelled'";

  db.query(query, [start, end], (err, results) => {
    if (err) {
      console.error("Staff getBookedSlots DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    console.log(`[Staff getBookedSlots] Date: ${date}, Found ${results.length} appointments`);

    const times = results.map(row => {
      const d = new Date(row.appointment_date);
      const hours = d.getUTCHours().toString().padStart(2, '0');
      const minutes = d.getUTCMinutes().toString().padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;
      console.log(`  - Raw: ${row.appointment_date}, Parsed: ${timeStr}`);
      return timeStr;
    });

    console.log(`[Staff getBookedSlots] Returning times:`, times);
    res.json(times);
  });
};

// Get Appointments (For Self)
exports.getAppointments = (req, res) => {
  const { staff_id } = req.params;

  db.query(
    "SELECT * FROM appointments WHERE patient_id = ? AND patient_type = 'staff' ORDER BY appointment_date DESC",
    [staff_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(results);
    }
  );
};

// Get Visit History
exports.getVisits = (req, res) => {
  const { staff_id } = req.params;

  db.query(
    "SELECT * FROM visits WHERE user_id = ? AND user_role = 'staff' ORDER BY visit_date DESC",
    [staff_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(results);
    }
  );
};

// Get Notifications
exports.getNotifications = (req, res) => {
  const { staff_id } = req.params;

  // First get staff's blood group
  db.query("SELECT blood_group FROM staff WHERE staff_id = ?", [staff_id], (err, users) => {
    if (err) return res.status(500).json({ message: "Database error" });

    let bloodGroup = null;
    if (users.length > 0) {
      bloodGroup = decryptData(users[0].blood_group); // Decrypt to match explicit targets like "O+"
    }

    // Now fetch notifications: targeted at 'all', 'staff', or the specific blood group
    const criteria = ['all', 'staff'];
    if (bloodGroup) criteria.push(bloodGroup);

    const placeholders = criteria.map(() => '?').join(',');

    const query = `
      SELECT n.* 
      FROM notifications n
      LEFT JOIN notification_dismissals nd 
        ON n.id = nd.notification_id 
        AND nd.user_id = ? 
        AND nd.user_role = 'staff'
      WHERE n.target_audience IN (${placeholders})
        AND nd.id IS NULL
      ORDER BY n.created_at DESC 
      LIMIT 10
    `;

    const params = [staff_id, ...criteria];

    db.query(query, params, (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(results);
    });
  });
};

// Dismiss Notification
exports.dismissNotification = (req, res) => {
  const { staff_id } = req.params;
  const { notification_id } = req.body;

  if (!notification_id) return res.status(400).json({ message: "Notification ID required" });

  const query = `
    INSERT IGNORE INTO notification_dismissals (user_id, user_role, notification_id)
    VALUES (?, 'staff', ?)
  `;

  db.query(query, [staff_id, notification_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({ message: "Notification dismissed" });
  });
};


// Get Prescriptions
exports.getPrescriptions = (req, res) => {
  const { staff_id } = req.params;

  const query = `
    SELECT p.*, a.id as appointment_id, a.appointment_date, a.reason, a.nurse_notes
    FROM appointments a
    LEFT JOIN prescriptions p ON p.appointment_id = a.id
    WHERE a.patient_type = 'staff' AND a.patient_id = ?
    ORDER BY a.appointment_date DESC
  `;

  db.query(query, [staff_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
};

// Get Profile
exports.getProfile = (req, res) => {
  const { staff_id } = req.params;
  db.query("SELECT * FROM staff WHERE staff_id = ?", [staff_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(404).json({ message: "Staff not found" });

    // Decrypt the blood group before sending to client
    const userProfile = results[0];
    if (userProfile.blood_group) {
        userProfile.blood_group = decryptData(userProfile.blood_group);
    }

    res.json(userProfile);
  });
};

// Update Profile
exports.updateProfile = (req, res) => {
  const { staff_id } = req.params;
  const { height, weight, profile_picture } = req.body;
  let { blood_group } = req.body;

  // Encrypt the blood group before saving
  if (blood_group) {
      blood_group = encryptData(blood_group);
  }

  const sql = "UPDATE staff SET height = ?, weight = ?, blood_group = ?, profile_picture = ? WHERE staff_id = ?";

  db.query(sql, [height, weight, blood_group, profile_picture, staff_id], (err, result) => {
    if (err) {
      console.error("Error updating profile:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json({ message: "Profile updated successfully" });
  });
};


