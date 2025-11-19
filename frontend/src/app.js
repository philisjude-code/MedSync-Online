import React from 'react';
import AppointmentList from './components/AppointmentList';
import DoctorList from './components/DoctorList';
import PatientList from './components/PatientList';

function App() {
  return (
    <div className="App" style={{ fontFamily: 'Arial, sans-serif' }}>
      <h1>🏥 HealthSync Dashboard</h1>
      <hr />
      <DoctorList />
      <hr />
      <PatientList />
      <hr />
      <AppointmentList />
    </div>
  );
}

export default App;