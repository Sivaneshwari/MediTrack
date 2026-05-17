const express = require("express");
const controller = require("../controllers/studentController");

const router = express.Router();

router.post("/signup", controller.signup);
router.post("/login", controller.login);

// Dashboard
router.post("/appointment", controller.createAppointment);
router.get("/appointments/:student_id", controller.getAppointments);
router.get("/visits/:student_id", controller.getVisits);
router.get("/notifications/:student_id", controller.getNotifications);
router.post("/notifications/:student_id/dismiss", controller.dismissNotification);
router.get("/prescriptions/:student_id", controller.getPrescriptions);
router.get("/profile/:student_id", controller.getProfile);
router.put("/profile/:student_id", controller.updateProfile);
router.get("/booked-slots", controller.getBookedSlots);

module.exports = router;
