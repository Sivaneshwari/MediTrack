const nodemailer = require("nodemailer");
const db = require("../config/db");
const bcrypt = require("bcryptjs"); // For admin password hash

// Configure Transporter
// Ideally use environment variables: process.env.EMAIL_USER, process.env.EMAIL_PASS
// For now, we'll log if credentials aren't found.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "chilluelango@gmail.com", // Updated based on previous screenshot context
    pass: "pofz rahp trqm cziv",    // App Password provided by user
  },
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Request OTP
 * POST /forgot-password
 * Body: { identifier (email), userType (role) }
 */
exports.forgot = (req, res) => {
  const { identifier, userType } = req.body; // userType = 'student' | 'staff' | 'admin'
  const email = identifier; // Assuming identifier is email for simplicity in this flow

  if (!email || !userType) {
    return res.status(400).json({ message: "Email and User Type required" });
  }

  const table =
    userType === "student" ? "students" :
      userType === "staff" ? "staff" :
        "admins";

  // Check if user exists
  db.query(
    `SELECT * FROM ${table} WHERE email = ?`,
    [email],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Database Error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Email not registered" });
      }

      // Generate OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      // Store in password_resets
      db.query(
        "INSERT INTO password_resets (email, otp, role, expires_at) VALUES (?, ?, ?, ?)",
        [email, otp, userType, expiresAt],
        (insErr) => {
          if (insErr) {
            console.error("OTP Store Error:", insErr);
            return res.status(500).json({ message: "Failed to generate OTP" });
          }

          console.log(`[OTP DEBUG] OTP for ${email}: ${otp}`);

          // Send Email
          const mailOptions = {
            from: "MediTrack <meditrack.system@gmail.com>",
            to: email,
            subject: "Password Reset OTP - MediTrack",
            text: `Your OTP for password reset is: ${otp}. It expires in 15 minutes.`,
          };

          // Try sending email, but don't block response on it (or handle error gracefully)
          transporter.sendMail(mailOptions, (mailErr, info) => {
            if (mailErr) {
              console.error("Email Send Error:", mailErr);
              // Fallback for demo: return OTP in response if email fails (NOT SECURE for prod, but good for dev)
              return res.json({ message: "OTP generated (Email failed, check console)", devOtp: otp });
            }
            res.json({ message: "Verification code sent to your email" });
          });
        }
      );
    }
  );
};

/**
 * Verify OTP
 * POST /forgot-password/verify (or similar)
 * But we might just jump to reset if the client passes otp + new password.
 * Actually, let's keep separate verify if UI needs it, but usually standard flow is:
 * 1. Request OTP -> UI shows OTP input
 * 2. Submit OTP + New Password -> Server verifies and updates.
 *
 * However, the user said "entered in email it should send code... and allow them create new password".
 * This implies a flow: Request -> Verify/Reset.
 *
 * Let's implement a Reset function that takes OTP and New Password (DOB).
 */
exports.resetPassword = async (req, res) => {
  const { code, newPassword, email, userType } = req.body;

  if (!code || !newPassword || !email || !userType) {
    return res.status(400).json({ message: "Missing fields" });
  }

  // Check OTP
  db.query(
    "SELECT * FROM password_resets WHERE email = ? AND otp = ? AND role = ? AND expires_at > NOW() ORDER BY id DESC LIMIT 1",
    [email, code, userType],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "Database Error" });

      if (results.length === 0) {
        return res.status(400).json({ message: "Invalid or Expired OTP" });
      }

      // OTP Valid - Update User
      const table =
        userType === "student" ? "students" :
          userType === "staff" ? "staff" :
            "admins";

      let updateQuery = "";
      let params = [];

      if (userType === "admin") {
        const hashed = await bcrypt.hash(newPassword, 10);
        updateQuery = `UPDATE admins SET password = ? WHERE email = ?`;
        params = [hashed, email];
      } else {
        // Update DOB
        // Ensure newPassword is in correct format or raw string
        // Assuming user sends YYYY-MM-DD or DD/MM/YYYY, we store as string (based on schema)
        updateQuery = `UPDATE ${table} SET dob = ? WHERE email = ?`;
        params = [newPassword, email];
      }

      db.query(updateQuery, params, (updErr, updResult) => {
        if (updErr) {
          console.error("Update Error:", updErr);
          return res.status(500).json({ message: "Failed to reset password" });
        }

        // Delete used OTP
        db.query("DELETE FROM password_resets WHERE email = ?", [email]);

        res.json({ message: "Password reset successfully" });
      });
    }
  );
};
