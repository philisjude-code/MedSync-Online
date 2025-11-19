const MedicalRecord = require('../models/recordModel');

exports.addMedicalRecord = async (req, res) => {
    try {
        const record = await MedicalRecord.create({
            patient: req.body.patient,
            doctor: req.user.id,
            diagnosis: req.body.diagnosis,
            treatment: req.body.treatment,
            date: req.body.date || new Date()
        });

        res.status(201).json(record);
    } catch (error) {
        res.status(500).json({ message: "Error adding medical record" });
    }
};

exports.getMedicalRecordsForUser = async (req, res) => {
    try {
        const query = req.user.role === 'patient'
            ? { patient: req.user.id }
            : { doctor: req.user.id };

        const records = await MedicalRecord.find(query)
            .populate('patient', 'name email')
            .populate('doctor', 'name email');

        res.json(records);
    } catch (error) {
        res.status(500).json({ message: "Error fetching records" });
    }
};
