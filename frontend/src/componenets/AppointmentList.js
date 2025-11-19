import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'password123';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Function to handle the authentication and data fetch
    const fetchAppointments = async () => {
      try {
        // --- STEP A: LOGIN TO GET TOKEN ---
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
        });

        if (!loginResponse.ok) {
          throw new Error('Login failed. Check credentials.');
        }

        const loginData = await loginResponse.json();
        const token = loginData.token;

        // --- STEP B: FETCH PROTECTED APPOINTMENTS ---
        const fetchResponse = await fetch(`${API_BASE_URL}/appointments`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Sending the JWT token
          },
        });

        if (!fetchResponse.ok) {
          throw new Error('Failed to fetch appointments. Token may be invalid/expired.');
        }

        const appointmentData = await fetchResponse.json();
        setAppointments(appointmentData);

      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []); // Empty dependency array means this runs only once on mount

  if (loading) return <p>Loading appointments...</p>;
  if (error) return <p style={{color: 'red'}}>Error: {error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>📅 Secure Appointments List ({appointments.length})</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Date</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>User ID</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Doctor ID</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Reason</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appt) => (
            <tr key={appt._id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{appt.date}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', fontSize: '10px' }}>{appt.user}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', fontSize: '10px' }}>{appt.doctor}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{appt.reason || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentList;