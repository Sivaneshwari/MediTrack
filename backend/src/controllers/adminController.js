const db = require("../config/db");
const bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  const { admin_id, full_name, email, phone, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO admins VALUES (NULL,?,?,?,?,?)",
    [admin_id, full_name, email, phone, hashed],
    err => {
      if (err) return res.status(400).json({ message: "Admin exists" });
      res.json({ message: "Admin registered" });
    }
  );
};

exports.login = (req, res) => {
  const { identifier, password } = req.body;

  db.query(
    "SELECT * FROM admins WHERE email=? OR admin_id=?",
    [identifier, identifier],
    async (err, result) => {
      if (!result.length)
        return res.status(401).json({ message: "Invalid credentials" });

      const match = await bcrypt.compare(password, result[0].password);
      if (!match)
        return res.status(401).json({ message: "Invalid credentials" });

      res.json({
        message: "Admin login successful",
        admin: {
          name: result[0].full_name,
          id: result[0].admin_id
        }
      });
    }
  );
};
