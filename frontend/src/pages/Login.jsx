import API from "../api/api";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem("token", res.data.token);

      const role = res.data.user.role;
      if (role === "admin") window.location.href = "/admin";
      else if (role === "doctor") window.location.href = "/doctor";
      else window.location.href = "/patient";
    } catch (err) {
      alert(err.response.data.message || "Login failed");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
