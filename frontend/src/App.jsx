// src/App.jsx
import React, { useEffect, useState } from "react";
import LiveMap from "./componenets/LiveMap.jsx";
import Chatbot from "./componenets/Chatbot";
import {
  Calendar,
  MapPin,
  Activity,
  FileText,
  AlertCircle,
  BarChart3,
  User,
  Clock,
  Phone,
  Star,
  Search,
  Bell,
  Menu,
  X,
  ChevronRight,
  Heart,
  Stethoscope,
  Ambulance,
  TrendingUp,
  Shield,
} from "lucide-react";
import "./App.css";

/* === Configuration === */
const API_BASE_URL = "http://localhost:5000/api";
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "password123";
/* ===================== */

/* ---------- Mock / Helpers ---------- */
const generateMockClinics = () => [
  { id: 1, name: "Apollo Clinic", specialty: "General Medicine", distance: 1.2, cost: 500, rating: 4.5, reviews: 234, available: true },
  { id: 2, name: "Max Healthcare", specialty: "Cardiology", distance: 2.5, cost: 800, rating: 4.7, reviews: 456, available: true },
  { id: 3, name: "Fortis Hospital", specialty: "Orthopedics", distance: 3.1, cost: 1200, rating: 4.3, reviews: 189, available: false },
  { id: 4, name: "CARE Hospital", specialty: "Pediatrics", distance: 1.8, cost: 600, rating: 4.6, reviews: 312, available: true },
  { id: 5, name: "Yashoda Hospital", specialty: "Neurology", distance: 4.2, cost: 1500, rating: 4.8, reviews: 523, available: true },
];

const prioritizeCase = (symptoms, age, severity) => {
  let score = 0;
  const criticalSymptoms = ["chest pain", "difficulty breathing", "severe bleeding", "unconscious", "stroke symptoms"];
  const moderateSymptoms = ["high fever", "severe pain", "persistent vomiting", "dizziness"];

  if (criticalSymptoms.some((s) => symptoms.toLowerCase().includes(s))) score += 10;
  if (moderateSymptoms.some((s) => symptoms.toLowerCase().includes(s))) score += 5;
  if (age > 65 || age < 2) score += 3;
  if (severity === "high") score += 7;
  else if (severity === "medium") score += 4;

  if (score >= 10) return { priority: "CRITICAL", color: "red", waitTime: "< 15 mins" };
  if (score >= 5) return { priority: "MODERATE", color: "orange", waitTime: "30-60 mins" };
  return { priority: "MILD", color: "green", waitTime: "1-2 hours" };
};

/* ---------- Reusable UI components ---------- */
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>{children}</div>
);

const StatCard = ({ icon, title, value, color = "blue" }) => (
  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
    <div className={`bg-${color}-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
      {React.cloneElement(icon, { className: `text-${color}-600`, size: 24 })}
    </div>
    <p className="text-gray-600 text-sm mb-1">{title}</p>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </div>
);

const InsightCard = ({ text, type }) => {
  const colors = {
    positive: "bg-green-50 border-green-200 text-green-800",
    reminder: "bg-yellow-50 border-yellow-200 text-yellow-800",
    suggestion: "bg-blue-50 border-blue-200 text-blue-800",
  };
  return (
    <div className={`p-4 rounded-lg border ${colors[type]}`}>
      <p className="text-sm">{text}</p>
    </div>
  );
};

const GoalCard = ({ icon, title, current, goal, unit = "", color = "blue" }) => {
  const percentage = Math.min((current / goal) * 100, 100);
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-3">
        <div className={`bg-${color}-100 p-2 rounded-lg`}>
          {React.cloneElement(icon, { className: `text-${color}-600`, size: 20 })}
        </div>
        <span className="text-sm text-gray-600">{Math.round(percentage)}%</span>
      </div>
      <p className="text-gray-600 text-sm mb-1">{title}</p>
      <p className="text-xl font-bold text-gray-800">
        {typeof current === "number" ? current.toLocaleString() : current} {unit}
      </p>
      <div className="mt-3 bg-gray-200 rounded-full h-2">
        <div className={`bg-${color}-600 h-2 rounded-full transition-all`} style={{ width: `${percentage}%` }} />
      </div>
      <p className="text-xs text-gray-500 mt-1">Goal: {goal.toLocaleString()} {unit}</p>
    </div>
  );
};

/* ---------- Main App ---------- */
const App = () => {
  // UI & Auth state
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("ishms_token"));
  const [userToken, setUserToken] = useState(localStorage.getItem("ishms_token") || null);

  // data
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [records, setRecords] = useState([]);

  // ui/mocks
  const [clinics, setClinics] = useState(generateMockClinics());
  const [healthData, setHealthData] = useState({ steps: 6847, heartRate: 72, sleep: 7.5, calories: 1850 });

  /* ---------- API helpers ---------- */
  const safeFetch = async (url, options = {}) => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        const bodyText = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText}${bodyText ? ` - ${bodyText}` : ""}`);
      }
      return await res.json();
    } catch (err) {
      throw err;
    }
  };

  const fetchResource = async (endpoint, setter) => {
    try {
      const data = await safeFetch(`${API_BASE_URL}/${endpoint}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setter(data);
    } catch (err) {
      console.error(`fetchResource ${endpoint} error:`, err);
      setFetchError(`Failed to load ${endpoint}`);
    }
  };

  const fetchAllProtectedData = async (token) => {
    if (!token) return;
    setIsLoadingData(true);
    setFetchError(null);
    try {
      await Promise.all([
        fetchResource("appointments", setAppointments),
        fetchResource("patients", setPatients),
        fetchResource("doctors", setDoctors),
        fetchResource("records", setRecords),
      ]);
    } catch (err) {
      // errors handled by fetchResource
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && userToken) {
      fetchAllProtectedData(userToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, userToken]);

  /* ---------- Auth (Login) ---------- */
  const handleLogin = async (email, password, setLoading, setError) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("ishms_token", data.token);
        setUserToken(data.token);
        setIsLoggedIn(true);
        setActiveTab("dashboard");
      } else {
        setError(data.message || "Login failed.");
      }
    } catch (err) {
      setError("Network error. Is backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ishms_token");
    setUserToken(null);
    setIsLoggedIn(false);
    setAppointments([]);
    setPatients([]);
    setDoctors([]);
    setRecords([]);
  };

  /* ---------- Login Screen ---------- */
  const LoginScreen = () => {
    const [email, setEmail] = useState(ADMIN_EMAIL);
    const [password, setPassword] = useState(ADMIN_PASSWORD);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Medsync</h1>
            <p className="text-gray-600 mt-2">Integrated Smart Health Management System</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin(email, password, setLoading, setError);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="patient@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-blue-600 hover:underline">Forgot password?</a>
            </div>

            {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "Logging In..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  };

  /* ---------- Dashboard ---------- */
  const Dashboard = () => {
    const currentPatient = patients[0] || { name: "Rahul", age: 32 };

    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Welcome back, {currentPatient.name}</h2>
            <p className="text-gray-600 mt-1">Here's your health overview for today</p>
          </div>
          {/* Live Location Map */}
          <button className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all">
            <Ambulance size={20} />
            Emergency SOS
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Activity />} title="Steps Today" value={healthData.steps.toLocaleString()} color="blue" />
          <StatCard icon={<Stethoscope />} title="Heart Rate" value={`${healthData.heartRate} bpm`} color="red" />
          <StatCard icon={<Clock />} title="Sleep" value={`${healthData.sleep} hrs`} color="purple" />
          <StatCard icon={<TrendingUp />} title="Calories" value={healthData.calories} color="green" />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div onClick={() => setActiveTab("appointments")} className="cursor-pointer">
            <Card><div className="flex items-center gap-4"><Calendar size={20} /><div><h3 className="font-bold">Book Appointment</h3><p className="text-sm text-gray-600">Schedule with specialists</p></div></div></Card>
          </div>
          <div onClick={() => setActiveTab("clinics")} className="cursor-pointer">
            <Card><div className="flex items-center gap-4"><MapPin size={20} /><div><h3 className="font-bold">Find Clinics</h3><p className="text-sm text-gray-600">Nearby healthcare facilities</p></div></div></Card>
          </div>
          <div onClick={() => setActiveTab("records")} className="cursor-pointer">
            <Card><div className="flex items-center gap-4"><FileText size={20} /><div><h3 className="font-bold">Medical Records</h3><p className="text-sm text-gray-600">View health history</p></div></div></Card>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <Card>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Upcoming Appointments</h3>
          <div className="space-y-3">
            {isLoadingData ? (
              <p className="text-gray-500">Loading secure data...</p>
            ) : appointments.length === 0 ? (
              <p className="text-gray-500">No upcoming appointments found.</p>
            ) : (
              appointments.slice(0, 3).map((apt) => {
                const doctorDetail = doctors.find((d) => d._id === apt.doctor) || {};
                const doctorName = doctorDetail.name || "Unknown Doctor";
                return (
                  <div key={apt._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Stethoscope className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{doctorName}</p>
                        <p className="text-sm text-gray-600">{doctorDetail.specialty || "Specialist"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">{apt.date}</p>
                      <p className="text-sm text-gray-600">Reason: {apt.reason || "N/A"}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* AI Insights */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Shield className="text-blue-600" size={20} /> AI Health Insights</h3>
          <div className="space-y-3">
            <InsightCard text="Your step count is 15% higher than last week. Keep it up!" type="positive" />
            <InsightCard text="Schedule your annual health screening. It's been 11 months since your last checkup." type="reminder" />
            <InsightCard text="Consider increasing water intake to 3L per day based on your activity." type="suggestion" />
          </div>
        </div>
      </div>
    );
  };

  /* ---------- Appointments Page ---------- */
  const AppointmentsPage = () => {
    const [showBooking, setShowBooking] = useState(false);
    const [formData, setFormData] = useState({ specialty: "", date: "", time: "", symptoms: "", age: "", severity: "low" });
    const [priorityResult, setPriorityResult] = useState(null);

    const handleSubmit = (e) => {
      e.preventDefault();
      const priority = prioritizeCase(formData.symptoms, parseInt(formData.age || "0", 10), formData.severity);
      setPriorityResult(priority);
      setTimeout(() => {
        setShowBooking(false);
        setPriorityResult(null);
        setFormData({ specialty: "", date: "", time: "", symptoms: "", age: "", severity: "low" });
        fetchAllProtectedData(userToken);
      }, 1500);
    };

    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">Appointments</h2>
          <button onClick={() => setShowBooking(true)} className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all">
            <Calendar size={18} /> Book New Appointment
          </button>
        </div>

        {showBooking && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Schedule Appointment</h3>
              <button onClick={() => setShowBooking(false)} className="text-gray-500 hover:text-gray-700"><X size={22} /></button>
            </div>

            {priorityResult ? (
              <div className={`bg-${priorityResult.color}-50 border-l-4 border-${priorityResult.color}-500 p-6 rounded-lg`}>
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle className={`text-${priorityResult.color}-600`} size={28} />
                  <div>
                    <h4 className={`text-xl font-bold text-${priorityResult.color}-800`}>Priority: {priorityResult.priority}</h4>
                    <p className={`text-${priorityResult.color}-700`}>Expected wait time: {priorityResult.waitTime}</p>
                  </div>
                </div>
                <p className="text-gray-700">Your appointment has been prioritized and confirmed!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select value={formData.specialty} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} className="px-4 py-3 border rounded">
                    <option value="">Select specialty</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Neurology">Neurology</option>
                  </select>

                  <input type="number" placeholder="Age" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} className="px-4 py-3 border rounded" required />

                  <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="px-4 py-3 border rounded" required />
                  <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="px-4 py-3 border rounded" required />
                </div>

                <textarea value={formData.symptoms} onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })} rows={3} className="w-full px-4 py-3 border rounded" placeholder="Describe your symptoms..." required />

                <div className="flex gap-4">
                  {["low", "medium", "high"].map((level) => (
                    <label key={level} className="flex items-center gap-2">
                      <input type="radio" value={level} checked={formData.severity === level} onChange={(e) => setFormData({ ...formData, severity: e.target.value })} />
                      <span className="capitalize">{level}</span>
                    </label>
                  ))}
                </div>

                <button className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded">Book Appointment</button>
              </form>
            )}
          </div>
        )}

        <Card>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Your Appointments</h3>
          <div className="space-y-3">
            {appointments.length === 0 && !isLoadingData ? (
              <p className="text-gray-500">No appointments scheduled.</p>
            ) : isLoadingData ? (
              <p>Loading appointment history...</p>
            ) : (
              appointments.map((apt) => {
                const doctorDetail = doctors.find((d) => d._id === apt.doctor) || {};
                return (
                  <div key={apt._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Stethoscope className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{doctorDetail.name || "Doctor ID Missing"}</p>
                        <p className="text-sm text-gray-600">{doctorDetail.specialty || "Specialist"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">{apt.date}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">Confirmed</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    );
  };

  /* ---------- Clinic Finder ---------- */
  const ClinicFinder = () => {
    const [filterBy, setFilterBy] = useState("distance");
    const [searchTerm, setSearchTerm] = useState("");

    const filteredClinics = clinics
      .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (filterBy === "distance") return a.distance - b.distance;
        if (filterBy === "cost") return a.cost - b.cost;
        if (filterBy === "rating") return b.rating - a.rating;
        return 0;
      });

    return (
      <div className="p-6 space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">Find Nearby Clinics</h2>

        <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-xl shadow-md p-8 h-64 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="mx-auto text-blue-600 mb-4" size={48} />
            <p className="text-gray-700 font-semibold">Interactive Map View</p>
            <p className="text-sm text-gray-600 mt-2">Showing clinics within 5km radius</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name or specialty..." className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setFilterBy("distance")} className={`px-4 py-2 rounded-lg ${filterBy === "distance" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}><MapPin size={16} /> Distance</button>
              <button onClick={() => setFilterBy("cost")} className={`px-4 py-2 rounded-lg ${filterBy === "cost" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}>Cost</button>
              <button onClick={() => setFilterBy("rating")} className={`px-4 py-2 rounded-lg ${filterBy === "rating" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}><Star size={16} /> Rating</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredClinics.map((clinic) => (
            <div key={clinic.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{clinic.name}</h3>
                  <p className="text-gray-600">{clinic.specialty}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${clinic.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{clinic.available ? "Available" : "Busy"}</span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin size={16} className="text-blue-600" />
                  <span>{clinic.distance} km away</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Star size={16} className="text-yellow-500" fill="currentColor" />
                  <span>{clinic.rating} ({clinic.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="font-semibold">Consultation: ₹{clinic.cost}</span>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-2 rounded-lg hover:shadow-lg transition-all">Book Appointment</button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ---------- Preventive Tracker ---------- */
  const PreventiveTracker = () => {
    const [goals, setGoals] = useState({ steps: 10000, water: 3, exercise: 30, sleep: 8 });

    return (
      <div className="p-6 space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">Preventive Healthcare</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <GoalCard icon={<Activity />} title="Steps" current={healthData.steps} goal={goals.steps} unit="" color="blue" />
          <GoalCard icon={<Stethoscope />} title="Heart Rate" current={healthData.heartRate} goal={80} unit="bpm" color="red" />
          <GoalCard icon={<Clock />} title="Sleep" current={healthData.sleep} goal={goals.sleep} unit="hrs" color="purple" />
          <GoalCard icon={<TrendingUp />} title="Calories" current={healthData.calories} goal={2000} unit="kcal" color="green" />
        </div>

        <Card>
          <h3 className="text-xl font-bold text-gray-800 mb-4">AI Health Recommendations</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0"><Activity size={20} /></div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Exercise Routine</h4>
                <p className="text-sm text-gray-600">30 minutes of cardio, 3 times per week recommended.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-green-100 p-3 rounded-lg flex-shrink-0"><Heart size={20} /></div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Dietary Suggestions</h4>
                <p className="text-sm text-gray-600">Increase fiber intake. Add leafy greens and whole grains.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-orange-100 p-3 rounded-lg flex-shrink-0"><AlertCircle size={20} /></div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Health Screening</h4>
                <p className="text-sm text-gray-600">Annual checkup due in 4 weeks. Book appointment with general physician.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  /* ---------- Medical Records ---------- */
  const MedicalRecords = () => {
    const currentPatient = patients[0] || { name: "Rahul", age: 32 };

    return (
      <div className="p-6 space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">Medical Records</h2>

        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl shadow-md p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
              {currentPatient.name.substring(0, 2)}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{currentPatient.name}</h3>
              <p className="text-gray-600">Age: {currentPatient.age} | Ailment: {currentPatient.ailment || "N/A"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div><p className="text-gray-600 text-sm">Height</p><p className="font-bold">175 cm</p></div>
            <div><p className="text-gray-600 text-sm">Weight</p><p className="font-bold">72 kg</p></div>
            <div><p className="text-gray-600 text-sm">Allergies</p><p className="font-bold">Penicillin</p></div>
            <div><p className="text-gray-600 text-sm">Emergency Contact</p><p className="font-bold">+91 98765 43210</p></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Medical History</h3>
          <div className="space-y-4">
            {records.length === 0 && !isLoadingData ? (
              <p className="text-gray-500">No medical records found.</p>
            ) : isLoadingData ? (
              <p>Loading records...</p>
            ) : (
              records.map((record) => {
                const patientDetail = patients.find((p) => p._id === record.patient) || {};
                return (
                  <div key={record._id} className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded-r-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{record.record || "Untitled Record"}</p>
                        <p className="text-sm text-gray-600">Patient: {patientDetail.name || "N/A"}</p>
                      </div>
                      <span className="text-sm text-gray-500">{record.date}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ---------- Emergency Network ---------- */
  const EmergencyNetwork = () => {
    const [emergencyActive, setEmergencyActive] = useState(false);
    const ambulances = [
      { id: 1, name: "Apollo Ambulance", distance: 1.8, eta: "5 mins", available: true },
      { id: 2, name: "Red Cross Emergency", distance: 2.3, eta: "7 mins", available: true },
      { id: 3, name: "City Hospital Ambulance", distance: 3.1, eta: "10 mins", available: false },
    ];

    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">Emergency Services</h2>
          {!emergencyActive ? (
            <button onClick={() => setEmergencyActive(true)} className="bg-red-600 text-white px-8 py-4 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg animate-pulse">
              <Ambulance size={20} /> ACTIVATE SOS
            </button>
          ) : (
            <button onClick={() => setEmergencyActive(false)} className="bg-gray-600 text-white px-8 py-4 rounded-lg">Cancel Emergency</button>
          )}
        </div>

    {emergencyActive && (
  <div className="space-y-6">

    {/* Emergency Active Banner */}
    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
      <h3 className="text-xl font-bold text-red-800 mb-2">Emergency Activated</h3>
      <p className="text-red-700">Tracking your live location...</p>
    </div>

    {/* Map Box */}
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-3">Live Ambulance Tracking</h2>

      {/* LIVE MAP (your OSRM-based version) */}
      <LiveMap />
    </div>

  </div>
)}





        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Emergency Hotlines</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 p-4 rounded-lg text-center"><Phone className="mx-auto text-red-600 mb-2" size={24} /><p className="text-2xl font-bold text-red-600">108</p><p className="text-sm text-gray-700 mt-1">Ambulance</p></div>
            <div className="bg-red-50 p-4 rounded-lg text-center"><Phone className="mx-auto text-red-600 mb-2" size={24} /><p className="text-2xl font-bold text-red-600">102</p><p className="text-sm text-gray-700 mt-1">Disaster</p></div>
            <div className="bg-red-50 p-4 rounded-lg text-center"><Phone className="mx-auto text-red-600 mb-2" size={24} /><p className="text-2xl font-bold text-red-600">1066</p><p className="text-sm text-gray-700 mt-1">Women Helpline</p></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Nearby Ambulances</h3>
          <div className="space-y-3">
            {ambulances.map((ambulance) => (
              <div key={ambulance.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`${ambulance.available ? "bg-green-100" : "bg-red-100"} p-3 rounded-lg`}>
                    <Ambulance className={ambulance.available ? "text-green-600" : "text-red-600"} size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{ambulance.name}</p>
                    <p className="text-sm text-gray-600">{ambulance.distance} km away • ETA: {ambulance.eta}</p>
                  </div>
                </div>
                <button disabled={!ambulance.available} className={`px-4 py-2 rounded-lg ${ambulance.available ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>{ambulance.available ? "Call Now" : "Busy"}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* ---------- Analytics ---------- */
  const Analytics = () => {
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">Health Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><p className="text-gray-600 text-sm mb-2">Appointments This Month</p><div className="flex items-end justify-between"><p className="text-3xl font-bold">{appointments.length}</p><span className="text-sm font-semibold text-green-600">+25%</span></div></Card>
          <Card><p className="text-gray-600 text-sm mb-2">Patients Registered</p><div className="flex items-end justify-between"><p className="text-3xl font-bold">{patients.length}</p><span className="text-sm font-semibold text-green-600">+12%</span></div></Card>
          <Card><p className="text-gray-600 text-sm mb-2">Doctors Available</p><div className="flex items-end justify-between"><p className="text-3xl font-bold">{doctors.length}</p><span className="text-sm font-semibold text-green-600">+5</span></div></Card>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Weekly Activity Overview</h3>
          <div className="bg-gradient-to-br from-blue-50 to-green-50 h-64 rounded-lg flex items-center justify-center">
            <BarChart3 className="mx-auto text-blue-600 mb-4" size={48} />
            <div className="ml-4 text-center">
              <p className="text-gray-700 font-semibold">Activity Chart</p>
              <p className="text-sm text-gray-600 mt-2">7-day activity and health trends</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ---------- Sidebar & Layout ---------- */
  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  if (fetchError) {
    return (
      <div className="flex h-screen items-center justify-center bg-red-50 text-red-700 p-6">
        <div>
          <h2 className="text-lg font-bold">Error Loading Data</h2>
          <p>{fetchError}</p>
          <p className="mt-4 text-sm text-gray-700">Make sure the backend is running and reachable at <code>{API_BASE_URL}</code></p>
          <button onClick={() => fetchAllProtectedData(userToken)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Retry</button>
          <button onClick={handleLogout} className="mt-4 ml-3 px-4 py-2 bg-gray-200 rounded">Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-64" : "w-20"} bg-gradient-to-b from-blue-600 to-green-600 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          {sidebarOpen ? <div className="flex items-center gap-2"><Heart size={24} /> <span className="font-bold text-xl">ISHMS</span></div> : null}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">{sidebarOpen ? <X size={18} /> : <Menu size={18} />}</button>
        </div>

        <nav className="flex-1 px-3">
          {[
            { id: "dashboard", icon: <BarChart3 />, label: "Dashboard" },
            { id: "appointments", icon: <Calendar />, label: "Appointments" },
            { id: "clinics", icon: <MapPin />, label: "Find Clinics" },
            { id: "preventive", icon: <Activity />, label: "Preventive Care" },
            { id: "records", icon: <FileText />, label: "Medical Records" },
            { id: "emergency", icon: <Ambulance />, label: "Emergency" },
            { id: "analytics", icon: <TrendingUp />, label: "Analytics" },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${activeTab === item.id ? "bg-white/20 shadow-lg" : "hover:bg-white/10"}`}>
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/20">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
            <User size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell size={18} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                {patients.length > 0 ? patients[0].name.substring(0, 2) : "RK"}
              </div>
              <div className="hidden md:block">
                <p className="font-semibold text-gray-800">{patients.length > 0 ? patients[0].name : "Rahul Kumar"}</p>
                <p className="text-xs text-gray-600">Patient ID: #12345</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "appointments" && <AppointmentsPage />}
          {activeTab === "clinics" && <ClinicFinder />}
          {activeTab === "preventive" && <PreventiveTracker />}
          {activeTab === "records" && <MedicalRecords />}
          {activeTab === "emergency" && <EmergencyNetwork />}
          {activeTab === "analytics" && <Analytics />}
        </main>
         </div>
         <div className="fixed bottom-6 right-6 z-50">
        <Chatbot />
      </div>
    </div>
  );
};

export default App;
