// frontend/src/api/api.js
import axios from 'axios';

const API = axios.create({
   baseURL: "http://localhost:5001/api",
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('ishms_token') || localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});


// --------- GPS helper (returns a Promise) ----------
export function getUserLocation(options = {}) {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      return reject(new Error("Geolocation not supported by this browser."));
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        resolve({ latitude, longitude });
      },
      (err) => {
        reject(err);
      },
      options
    );
  });
}

// Optional: helper to send location to backend (adjust endpoint as needed)
export async function sendLocationToServer(userId, { latitude, longitude }) {
  // Example endpoint: POST /location/update
  // Payload can include userId or backend can use token to identify user
  const body = { userId, lat: latitude, lng: longitude };
  return API.post('/location/update', body); // returns axios promise
}

export default API;
