useEffect(() => {
  const fetchAppointments = async () => {
    const res = await API.get("/appointments");
    setAppointments(res.data);
  };
  fetchAppointments();
}, []);
