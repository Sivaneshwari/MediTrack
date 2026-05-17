const db = require("../config/db");
const bcrypt = require("bcryptjs");
const { encryptData } = require("../utils/encryption");

/* ===========================
   SIGNUP
=========================== */
exports.signup = async (req, res) => {
  console.log("📥 Signup body:", req.body);

  try {
    const { role, name, email, id, department, shift, bloodGroup, dob } = req.body;

    // Validation
    if (!role || !name || !id || !email) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // Force Uppercase
    const upperId = id.toUpperCase();
    const upperName = name.toUpperCase();
    const upperDept = department ? department.toUpperCase() : null;
    const upperShift = shift ? shift.toUpperCase() : null;
    let upperBlood = bloodGroup ? bloodGroup.toUpperCase() : null;
    
    // ENCRYPT SENSITIVE DATA (Encryption at Rest)
    if (upperBlood) {
      upperBlood = encryptData(upperBlood);
    }
    const lowerEmail = email.toLowerCase();

    // Check availability first
    const checkTable = role === "student" ? "students" : "staff";
    const checkIdCol = role === "student" ? "student_id" : "staff_id";

    const checkQuery = `SELECT * FROM ${checkTable} WHERE ${checkIdCol} = ? OR email = ?`;

    db.query(checkQuery, [upperId, lowerEmail], (checkErr, checkResults) => {
      if (checkErr) {
        console.error("❌ Check Error:", checkErr);
        return res.status(500).json({ message: "Database error checking user" });
      }

      if (checkResults.length > 0) {
        return res.status(400).json({ message: "User or Email already registered" });
      }

      // Proceed to insert
      let insertQuery = "";
      let values = [];

      if (role === "student") {
        insertQuery = `
            INSERT INTO students 
            (student_id, full_name, email, department, shift, blood_group, dob)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
        values = [upperId, upperName, lowerEmail, upperDept, upperShift, upperBlood, dob];
      } else {
        insertQuery = `
            INSERT INTO staff
            (staff_id, full_name, email, department, shift, blood_group, dob)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
        values = [upperId, upperName, lowerEmail, upperDept, upperShift, upperBlood, dob];
      }

      db.query(insertQuery, values, (err, result) => {
        if (err) {
          console.error("❌ MySQL Error:", err);
          return res.status(500).json({
            message: "Database error",
            error: err.sqlMessage,
          });
        }
        res.status(201).json({
          message: "Signup successful",
          userId: result.insertId,
        });
      });
    });

  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   LOGIN
=========================== */
exports.login = async (req, res) => {
  try {
    const { role, identifier, password } = req.body;

    let query = "";
    let params = [];

    if (role === "admin") {
      query = "SELECT * FROM admins WHERE email=? OR admin_id=?";
      params = [identifier, identifier];
    } else if (role === "student") {
      query = "SELECT * FROM students WHERE student_id = ?";
      params = [identifier];
    } else if (role === "staff") {
      query = "SELECT * FROM staff WHERE staff_id = ?";
      params = [identifier];
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    db.query(query, params, async (err, results) => {
      if (err || results.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = results[0];

      if (role === "admin") {
        // Admin: Check Password using Bcrypt
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
      } else {
        // Student/Staff: Check Date of Birth (DOB)
        let dbDob = user.dob;
        let formattedDob = "";

        if (dbDob) {
          if (dbDob instanceof Date) {
            const day = dbDob.getDate().toString().padStart(2, "0");
            const month = (dbDob.getMonth() + 1).toString().padStart(2, "0");
            const year = dbDob.getFullYear();
            formattedDob = `${day}/${month}/${year}`;
          } else if (typeof dbDob === "string") {
            // Assume format "YYYY-MM-DD" inside database
            if (dbDob.includes("-")) {
              const parts = dbDob.split("-");
              if (parts.length === 3) {
                // parts is [YYYY, MM, DD]
                formattedDob = `${parts[2]}/${parts[1]}/${parts[0]}`;
              }
            } else {
              formattedDob = dbDob;
            }
          }
        }

        console.log(`🔍 Verifying DOB. Input: '${password}', DB: '${formattedDob}'`);

        if (password.trim() !== formattedDob) {
          return res.status(401).json({
            message: "Invalid Date of Birth (Use DD/MM/YYYY)",
          });
        }
      }

      // Success
      res.json({
        message: "Login successful",
        role,
        user: {
          id: user.student_id || user.staff_id || user.admin_id,
          name: user.full_name,
          email: user.email || null // Admin has email
        }
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
