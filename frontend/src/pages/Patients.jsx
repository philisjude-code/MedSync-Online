import API from "../api/api";
import { useEffect, useState } from "react";

export default function Patients() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const getPatients = async () => {
      const res = await API.get("/patients");
      setPatients(res.data);
    };
    getPatients();
  }, []);

  return (
    <div>
      <h2>Patients</h2>
      {patients.map(p => (
        <div key={p._id}>{p.name} — {p.age}</div>
      ))}
    </div>
  );
}
