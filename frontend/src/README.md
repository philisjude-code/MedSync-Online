// README.md content
/*
# ISHMS Backend - Integrated Smart Health Management System

A comprehensive, production-ready backend system for healthcare management with real-time emergency services, smart appointment scheduling, and AI-powered health insights.

## Features

### 🔐 Authentication & Authorization
- JWT-based secure authentication
- Role-based access control (Patient, Doctor, Admin)
- Password encryption with bcrypt

### 👨‍⚕️ Doctor Management
- Doctor profiles with specializations
- Availability scheduling
- Rating and review system
- Auto-assignment based on specialization and availability

### 📅 Appointment System
- Priority-based booking (critical → mild)
- Automated reminders via email and push notifications
- Real-time availability checking
- Prescription management

### 🏥 Clinic Integration
- Location-based clinic search
- Cost and rating filters
- Review and rating system
- Google Maps integration

### 🚑 Emergency Services
- Real-time ambulance tracking
- One-click SOS alert
- Nearest ambulance detection
- Emergency contact notifications

### 📊 Health Records
- Secure encrypted storage
- AWS S3 document upload
- Controlled sharing with doctors
- Prescription and test report management

### 🏃 Preventive Healthcare
- Activity and diet tracking
- Vital signs monitoring
- AI-powered health insights
- Screening reminders

### 📈 Analytics Dashboard
- Admin analytics and insights
- User management
- Doctor approval system
- System logs and monitoring

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **Storage**: AWS S3
- **Maps**: Google Maps API
- **Email**: Nodemailer
- **Push Notifications**: Firebase Cloud Messaging
- **AI/ML**: OpenAI API integration
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Validation**: Joi

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ishms-backend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start MongoDB
```bash
# Ensure MongoDB is running on your system
mongod
```

5. Run the application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Environment Variables

See `.env.example` for all required environment variables including:
- Database connection
- JWT secrets
- AWS credentials
- Google Maps API key
- Email configuration
- Firebase credentials

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:5000/api-docs`
- Health Check: `http://localhost:5000/health`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update profile

### Doctors
- `GET /api/v1/doctors` - Get all doctors
- `GET /api/v1/doctors/available` - Get available doctors
- `GET /api/v1/doctors/:id` - Get doctor by ID
- `PUT /api/v1/doctors/availability` - Update availability (Doctor only)

### Appointments
- `POST /api/v1/appointments/book` - Book appointment (Patient only)
- `GET /api/v1/appointments/patient` - Get patient appointments
- `GET /api/v1/appointments/doctor` - Get doctor appointments
- `PUT /api/v1/appointments/:id/status` - Update status (Doctor only)
- `PUT /api/v1/appointments/:id/cancel` - Cancel appointment

### Clinics
- `GET /api/v1/clinics` - Get all clinics
- `GET /api/v1/clinics/nearby` - Get nearby clinics
- `POST /api/v1/clinics/:id/review` - Add review

### Emergency
- `GET /api/v1/emergency/nearest-ambulance` - Get nearest ambulance
- `POST /api/v1/emergency/sos` - Send SOS alert
- `PUT /api/v1/emergency/ambulance/location` - Update ambulance location

### Health Records
- `POST /api/v1/health-records` - Create health record
- `POST /api/v1/health-records/:id/upload` - Upload document
- `GET /api/v1/health-records` - Get patient records
- `POST /api/v1/health-records/:id/share` - Share with doctor

### Preventive Care
- `GET /api/v1/preventive/metrics` - Get health metrics
- `POST /api/v1/preventive/activity` - Log activity
- `POST /api/v1/preventive/vitals` - Record vital signs
- `GET /api/v1/preventive/insights` - Get AI insights

### Admin
- `GET /api/v1/admin/dashboard` - Dashboard statistics
- `GET /api/v1/admin/analytics` - Analytics data
- `GET /api/v1/admin/users` - Get all users
- `PUT /api/v1/admin/users/:id/status` - Update user status
- `GET /api/v1/admin/doctors/pending` - Pending approvals
- `PUT /api/v1/admin/doctors/:id/approve` - Approve doctor

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

## Cron Jobs

The system includes automated jobs:
- **Appointment Reminders**: Daily at 8 AM
- **Screening Reminders**: Weekly
- **Cleanup Jobs**: Hourly

## Security Features

- Helmet.js for HTTP headers security
- Rate limiting
- CORS configuration
- Input validation with Joi
- Encrypted health records
- JWT token expiration
- Password hashing with bcrypt

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── models/         # Mongoose models
├── routes/         # API routes
├── middleware/     # Custom middleware
├── services/       # Business logic services
├── utils/          # Utility functions
├── jobs/           # Cron jobs
├── app.js          # Express app setup
└── server.js       # Server entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT

## Support

For issues and questions, please open a GitHub issue or contact support@ishms.com
*/