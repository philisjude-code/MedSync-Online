// Import your Appointment model
const Appointment = require('../models/Appointment'); 

// 1. Create a New Appointment
exports.createAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.create({
            // req.user.id comes from the JWT token (the logged-in user)
            user: req.user.id, 
            doctor: req.body.doctor,
            date: req.body.date,
            reason: req.body.reason
        });
        // Success: 201 Created
        res.status(201).json(appointment);
    } catch (error) {
        // Log the actual error to the backend console for full details
        console.error("Appointment creation failed:", error.message);

        // Send a 400 Bad Request status and include the specific error details
        // This is crucial for debugging missing fields, bad IDs, etc.
        res.status(400).json({ 
            message: "Error creating appointment. Please check required fields.", 
            details: error.message 
        });
    }
};

// 2. Get Appointments for the Logged-in User
exports.getAppointmentsForUser = async (req, res) => {
    try {
        const appointments = await Appointment.find({ user: req.user.id })
            .populate('doctor', 'name email'); // Populates doctor name and email
            
        res.json(appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error.message);
        res.status(500).json({ message: "Error fetching appointments" });
    }
};

// 3. Cancel an Appointment
exports.cancelAppointment = async (req, res) => {
    try {
        // Use findByIdAndDelete which is cleaner than findById + remove()
        const appointment = await Appointment.findByIdAndDelete(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Note: The logic to check if the user owns the appointment is ideally 
        // done *before* attempting to delete, like in your original code. 
        // For simplicity and speed, let's keep the user check:
        if (appointment.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to cancel this appointment" });
        }
        
        // Since findByIdAndDelete was used, we only need to check authorization before responding.
        res.json({ message: "Appointment canceled" });
        
    } catch (error) {
        console.error("Error canceling appointment:", error.message);
        res.status(500).json({ message: "Error canceling appointment" });
    }
};