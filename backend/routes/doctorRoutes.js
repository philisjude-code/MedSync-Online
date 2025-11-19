const express = require('express');
const router = express.Router();

// Import middleware for protection
const { protect, authorize } = require('../middleware/authMiddleware'); 

// --- Import the controller function ---
const { 
    getAllDoctors, 
    // You would add more functions here like getDoctorById, createDoctor, etc.
} = require('../controllers/doctorController'); 

// ✅ Route: GET /api/doctors
// Access: Must be logged in (protect) and have the 'admin' role (authorize)
router.get('/', protect, authorize('admin'), getAllDoctors);

module.exports = router;