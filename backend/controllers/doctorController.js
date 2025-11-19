const Doctor = require('../models/Doctor'); // <--- CHECK PATH

exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({}); 
        res.json(doctors);
    } catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(500).json({ message: "Error fetching doctor list" });
    }
};