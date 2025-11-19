const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // ⭐ Added GPS Location field
    location: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
        updatedAt: { type: Date, default: null }
    }

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
