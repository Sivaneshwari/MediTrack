const express = require("express");
const controller = require("../controllers/forgotController");

const router = express.Router();

// Request OTP
router.post("/", controller.forgot);

// Reset Password
router.post("/reset", controller.resetPassword);

module.exports = router;
