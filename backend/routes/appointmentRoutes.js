const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createAppointment,
    getAppointmentsForUser,
    cancelAppointment
} = require('../controllers/appointmentController');

// Create new appointment (Patient)
router.post('/', protect, createAppointment);

// Get logged in user’s appointments
router.get('/', protect, getAppointmentsForUser);

// Cancel an appointment
router.delete('/:id', protect, cancelAppointment);

module.exports = router;
