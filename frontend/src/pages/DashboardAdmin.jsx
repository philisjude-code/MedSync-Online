useEffect(() => {
  const fetchCounts = async () => {
    const patients = await API.get("/patients");
    const appointments = await API.get("/appointments");
    const records = await API.get("/records");

    setCounts({
      patients: patients.data.length,
      appointments: appointments.data.length,
      records: records.data.length
    });
  };
  fetchCounts();
}, []);
