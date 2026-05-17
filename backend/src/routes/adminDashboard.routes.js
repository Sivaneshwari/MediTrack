const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminDashboardController');

// Dashboard Stats
router.get('/stats', controller.getDashboardStats);

// Appointments
router.get('/appointments/all', controller.getAllAppointments);
router.get('/appointments/students', controller.getStudentAppointments);
router.get('/appointments/staff', controller.getStaffAppointments);
router.post('/appointments', controller.createAppointment);
router.put('/appointments/:id', controller.updateAppointment);
router.delete('/appointments/:id', controller.deleteAppointment);

// User Management
router.get('/users/students', controller.getAllStudents);
router.get('/users/staff', controller.getAllStaff);
router.delete('/users/:type/:id', controller.deleteUser);
router.put('/users/:type/:id', controller.updateUser);
router.post('/users/:type', controller.createUser);

// Prescriptions
router.get('/prescriptions/:appointmentId', controller.getPrescriptionsByAppointment);
router.post('/prescriptions', controller.createPrescription);

// Inventory
router.get('/inventory', controller.getInventory);
router.get('/inventory/low-stock', controller.getLowStockItems);
router.post('/inventory', controller.createInventoryItem);
router.put('/inventory/:id', controller.updateInventoryItem);
router.delete('/inventory/:id', controller.deleteInventoryItem);

// Blood Groups & Notifications
router.get('/blood-groups/students', controller.getStudentsByBloodGroup);
router.get('/blood-groups/staff', controller.getStaffByBloodGroup);
router.post('/blood-groups/notify', controller.sendBloodDonationRequest);
router.get('/blood-bank/history', controller.getBloodDonationHistory);
router.put('/blood-bank/request/:id', controller.updateBloodDonationRequest);

// Exports
router.get('/export/appointments/excel', controller.exportAppointmentsExcel);
router.get('/export/appointments/pdf', controller.exportAppointmentsPDF);
router.get('/export/inventory/excel', controller.exportInventoryExcel);
router.get('/export/inventory/pdf', controller.exportInventoryPDF);
router.get('/export/blood-groups/excel', controller.exportBloodGroupsExcel);
router.get('/export/blood-groups/pdf', controller.exportBloodGroupsPDF);

module.exports = router;
