useEffect(() => {
  const fetchRecords = async () => {
    const res = await API.get("/records");
    setRecords(res.data);
  };
  fetchRecords();
}, []);
