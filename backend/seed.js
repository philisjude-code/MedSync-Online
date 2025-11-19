const mongoose = require('mongoose');
require('dotenv').config(); 
const bcrypt = require('bcryptjs'); // Needed to hash the admin password

// Import your Mongoose models (Assuming you have a 'User.js' model now)
const User = require('./models/user'); 
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');
const MedicalRecord = require('./models/MedicalRecord');
const Doctor = require('./models/Doctor');

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/healthsync';

// Self-invoking async function to handle connection and seeding
(async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`✅ MongoDB Connected: ${mongoURI}`);

        // --- Start Seeding Logic ---

        // Clear existing data (Add User to the list to clear old test accounts)
        await User.deleteMany({}); 
        await Patient.deleteMany({});
        await Appointment.deleteMany({});
        await MedicalRecord.deleteMany({});
        await Doctor.deleteMany({});
        console.log('🗑️ Cleared old data');

        // 1. Seed the Admin User for Login (CRUCIAL FIX)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: hashedPassword, // Store the hashed password
            role: 'admin' // Essential for authorize('admin')
        });
        console.log('👑 Admin User seeded');


        // 2. Seed other Patients (These might be linked to the User model later)
        const patients = await Patient.insertMany([
            { name: "Raje", age: 25, ailment: "Flu" },
            { name: "Anita", age: 30, ailment: "Headache" },
            { name: "Vikram", age: 40, ailment: "Diabetes" },
        ]);
        console.log('👨‍👩‍👧‍👦 Patients seeded');

        // 3. Insert sample doctors
        const doctors = await Doctor.insertMany([
            { name: "Dr. Smith", specialty: "General" },
            { name: "Dr. Khan", specialty: "Cardiology" },
        ]);
        console.log('👨‍⚕️ Doctors seeded');

        // 4. Insert sample appointments (Uses the Admin user's ID as the 'user' field)
        await Appointment.insertMany([
            // Link to the Admin User (since only a User can create an appointment)
            { user: adminUser._id, doctor: doctors[0]._id, date: "2025-11-06", reason: "General checkup" },
            { user: patients[1]._id, doctor: doctors[1]._id, date: "2025-11-07", reason: "Headache assessment" },
        ]);
        console.log('📅 Appointments seeded');

        // 5. Insert sample medical records
        await MedicalRecord.insertMany([
            { patient: patients[0]._id, record: "Blood Test - Normal", date: "2025-11-05" },
            { patient: patients[1]._id, record: "X-Ray - Clear", date: "2025-11-05" },
        ]);
        console.log('📝 Medical Records seeded');

        console.log('✅ Database seeding completed!');
        process.exit();

    } catch (err) {
        console.error('❌ Seeding error:', err.message);
        process.exit(1);
    }
})();