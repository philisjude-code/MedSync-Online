const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    addMedicalRecord,
    getMedicalRecordsForUser
} = require('../controllers/recordController');

// ✅ Add record (Doctor only)
router.post('/', protect, authorize('doctor'), addMedicalRecord);

// ✅ View records (Patient sees only own)
router.get('/', protect, getMedicalRecordsForUser);

module.exports = router;
