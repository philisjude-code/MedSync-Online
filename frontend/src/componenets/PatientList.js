import React, { useState, useEffect } from 'react';
import LiveMap from "./LiveMap";


const API_BASE_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'password123';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
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

        // --- STEP B: FETCH PROTECTED PATIENTS ---
        const fetchResponse = await fetch(`${API_BASE_URL}/patients`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Sending the JWT token
          },
        });

        if (!fetchResponse.ok) {
          throw new Error('Failed to fetch patients.');
        }

        const patientData = await fetchResponse.json();
        setPatients(patientData);

      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  if (loading) return <p>Loading patients...</p>;
  if (error) return <p style={{color: 'red'}}>Error: {error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>🧍 Secure Patients List ({patients.length})</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Age</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Ailment</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient._id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{patient.name}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{patient.age}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{patient.ailment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientList;