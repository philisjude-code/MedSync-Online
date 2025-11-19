const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialty: { type: String, required: true },
}, { 
    timestamps: true,
    // CRITICAL FIX: Tell Mongoose the exact collection name to use
    collection: 'doctors' // Use the exact name you see in mongosh 
});

module.exports = mongoose.model('Doctor', doctorSchema);