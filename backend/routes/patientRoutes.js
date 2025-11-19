const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
    getAllPatients, 
    getPatientById, 
    updatePatientProfile 
} = require('../controllers/patientController');

// ✅ Admin: View all patients
router.get('/', protect, authorize('admin'), getAllPatients);

// ✅ Patient: View own profile
router.get('/me', protect, getPatientById);

// ✅ Patient: Update own profile
router.put('/me', protect, updatePatientProfile);

module.exports = router;
