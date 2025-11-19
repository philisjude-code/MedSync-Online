exports.getAllPatients = async (req, res) => {
    try {
        const patients = await User.find({ role: 'patient' }).select('-password');
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching patients' });
    }
};

exports.getPatientById = async (req, res) => {
    try {
        const patient = await User.findById(req.user.id).select('-password');
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching patient' });
    }
};

exports.updatePatientProfile = async (req, res) => {
    try {
        const updated = await User.findByIdAndUpdate(
            req.user.id,
            req.body,
            { new: true }
        ).select('-password');

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error updating patient profile' });
    }
};
const User = require('../models/user');