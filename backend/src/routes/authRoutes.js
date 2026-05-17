const express = require("express");
const controller = require("../controllers/authController");

const router = express.Router();

// Signup
router.post("/signup", controller.signup);

// Login
router.post("/login", controller.login);

module.exports = router;
