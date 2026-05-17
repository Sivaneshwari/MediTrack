const express = require("express");
const controller = require("../controllers/staffController");

const router = express.Router();

router.post("/signup", controller.signup);
router.post("/login", controller.login);

// Dashboard
router.post("/appointment", controller.createAppointment);
router.get("/appointments/:staff_id", controller.getAppointments);
router.get("/visits/:staff_id", controller.getVisits);
router.get("/notifications/:staff_id", controller.getNotifications);
router.post("/notifications/:staff_id/dismiss", controller.dismissNotification);
router.get("/prescriptions/:staff_id", controller.getPrescriptions);
router.get("/profile/:staff_id", controller.getProfile);
router.put("/profile/:staff_id", controller.updateProfile);
router.get("/booked-slots", controller.getBookedSlots);

module.exports = router;
