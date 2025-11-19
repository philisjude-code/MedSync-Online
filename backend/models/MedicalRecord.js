const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  record: { type: String, required: true },
  date: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
