const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient'); // make sure the path is correct

// Fetch all patients
router.get('/patients', async (req, res) => {
    try {
        const patients = await Patient.find();
        res.json(patients);
    } catch (err) {
        res.status(500).json({ message: 'Cannot fetch patients' });
    }
});

module.exports = router;
