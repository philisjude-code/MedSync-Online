const mongoose = require('mongoose');
const appointmentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Should link to 'User' collection
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: String, required: true },
    reason: { type: String } // Check if this is required or not
}, { timestamps: true });
module.exports = mongoose.model('Appointment', appointmentSchema);