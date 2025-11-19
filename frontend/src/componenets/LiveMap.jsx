import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-rotatedmarker"; // <-- required for marker rotation
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

function MoveToLocation({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat == null || lng == null) return;
    map.setView([lat, lng], 15, { animate: true });
  }, [lat, lng, map]);
  return null;
}

// haversine distance (meters)
function haversineDistance([lat1, lon1], [lat2, lon2]) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// bearing from p1 to p2 in degrees
function bearing([lat1, lon1], [lat2, lon2]) {
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

const ambulanceIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2967/2967350.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const LiveMap = ({ ambulanceStart = { lat: 17.438, lng: 78.395 }, ambulanceSpeed = 11.11 }) => {
  const [userPos, setUserPos] = useState(null);
  const [ambulancePos, setAmbulancePos] = useState({ lat: ambulanceStart.lat, lng: ambulanceStart.lng });
  const [routeCoords, setRouteCoords] = useState([]); // array of [lat, lng] along roads
  const [error, setError] = useState(null);
  const markerRef = useRef(null);
  const animationRef = useRef(null);

  const routeRef = useRef([]); // keep latest route for animation without stale closures
  const routeIndexRef = useRef(0); // index of current segment
  const segmentProgressRef = useRef(0); // progress along current segment [0..1]

  useEffect(() => {
    // watch user position
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setError(null);
      },
      (err) => {
        setError(err?.message || "Unable to get location");
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // fetch route from OSRM when user position changes (and not equal to ambulance)
  useEffect(() => {
    if (!userPos || !ambulancePos) return;

    // build OSRM URL
    const url = `https://router.project-osrm.org/route/v1/driving/${ambulancePos.lng},${ambulancePos.lat};${userPos.lng},${userPos.lat}?overview=full&geometries=geojson`;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("Routing error");
        return r.json();
      })
      .then((data) => {
        if (!data.routes || data.routes.length === 0) {
          throw new Error("No routes found");
        }
        const coords = data.routes[0].geometry.coordinates; // [lon,lat] pairs
        const latlngs = coords.map(([lon, lat]) => [lat, lon]);
        setRouteCoords(latlngs);
        routeRef.current = latlngs;
        // reset animation state so we animate from ambulance's current position onto route
        routeIndexRef.current = 0;
        segmentProgressRef.current = 0;
      })
      .catch((err) => {
        console.error("OSRM error:", err);
        setError("Unable to get road route (OSRM).");
        // fallback: straight line
        setRouteCoords([[ambulancePos.lat, ambulancePos.lng], [userPos.lat, userPos.lng]]);
        routeRef.current = [[ambulancePos.lat, ambulancePos.lng], [userPos.lat, userPos.lng]];
      });
  }, [userPos, /* note: include ambulancePos if you want to re-route while ambulance moves */ ambulancePos.lat, ambulancePos.lng]);

  // animate ambulance along routeRef.current
  useEffect(() => {
    if (!routeRef.current || routeRef.current.length < 2) return;

    // We'll move the ambulance at 'ambulanceSpeed' meters per second.
    const tickMs = 100; // 10 updates/sec
    const speedMps = ambulanceSpeed; // m/s

    // Helper: get pos along segment index and progress [0..1]
    function getSegmentPos(i, t) {
      const a = routeRef.current[i];
      const b = routeRef.current[i + 1];
      const lat = a[0] + (b[0] - a[0]) * t;
      const lng = a[1] + (b[1] - a[1]) * t;
      return [lat, lng];
    }

    // Precompute segment lengths (meters)
    const segLengths = [];
    for (let i = 0; i < routeRef.current.length - 1; i++) {
      segLengths.push(haversineDistance(routeRef.current[i], routeRef.current[i + 1]));
    }

    function step() {
      if (!routeRef.current || routeRef.current.length < 2) return;

      // current segment index and progress
      let idx = routeIndexRef.current;
      let progress = segmentProgressRef.current;

      // distance to move this tick
      const distThisTick = (speedMps * tickMs) / 1000; // meters

      let remaining = distThisTick;

      // move across segments as necessary
      while (remaining > 0 && idx < segLengths.length) {
        const segLen = segLengths[idx];
        const toEnd = (1 - progress) * segLen;

        if (remaining < toEnd) {
          // advance within current segment
          progress += remaining / segLen;
          remaining = 0;
        } else {
          // jump to next segment
          remaining -= toEnd;
          idx += 1;
          progress = 0;
        }
      }

      // clamp if we reached final point
      if (idx >= segLengths.length) {
        // arrived
        const last = routeRef.current[routeRef.current.length - 1];
        setAmbulancePos({ lat: last[0], lng: last[1] });
        // rotate final heading maybe
        if (markerRef.current && markerRef.current.setRotationAngle) {
          // keep previous rotation
        }
        return;
      }

      // compute new position
      const newPos = getSegmentPos(idx, progress);

      setAmbulancePos({ lat: newPos[0], lng: newPos[1] });
      routeIndexRef.current = idx;
      segmentProgressRef.current = progress;

      // rotate icon to face next point
      const nextPoint =
        progress < 0.999
          ? getSegmentPos(idx, Math.min(1, progress + 0.01))
          : routeRef.current[idx + 2] || routeRef.current[idx + 1];

      if (markerRef.current && markerRef.current.setRotationAngle) {
        const ang = bearing([newPos[0], newPos[1]], [nextPoint[0], nextPoint[1]]);
        try {
          markerRef.current.setRotationAngle(ang);
        } catch (e) {
          // ignore if plugin not present
        }
      }

      animationRef.current = setTimeout(step, tickMs);
    }

    // start animation (clear previous)
    if (animationRef.current) clearTimeout(animationRef.current);
    animationRef.current = setTimeout(step, 0);

    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [/* re-run when route changes */ routeCoords, ambulanceSpeed]);

  // compute derived distance & ETA for display
  let distanceMeters = null;
  let etaMinutes = null;
  if (userPos && ambulancePos) {
    distanceMeters = haversineDistance([ambulancePos.lat, ambulancePos.lng], [userPos.lat, userPos.lng]);
    const etaSec = distanceMeters / ambulanceSpeed;
    etaMinutes = Math.max(0, Math.round(etaSec / 60));
  }

  if (!userPos)
    return (
      <div style={{ textAlign: "center", padding: 20 }}>
        <p>Getting your live location...</p>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </div>
    );

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <div style={{ padding: 8 }}>
        <strong>Distance:</strong>{" "}
        {distanceMeters != null ? `${(distanceMeters / 1000).toFixed(2)} km` : "—"}{" "}
        • <strong>ETA:</strong> {etaMinutes != null ? `${etaMinutes} min` : "—"}
      </div>

      <MapContainer center={[userPos.lat, userPos.lng]} zoom={13} style={{ height: "540px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MoveToLocation lat={userPos.lat} lng={userPos.lng} />

        <Marker position={[userPos.lat, userPos.lng]}>
          <Popup>You (Live)</Popup>
        </Marker>

        <Marker
          ref={markerRef}
          position={[ambulancePos.lat, ambulancePos.lng]}
          icon={ambulanceIcon}
          // rotated marker plugin adds setRotationAngle on the marker instance
        >
          <Popup>Ambulance</Popup>
        </Marker>

        {routeCoords && routeCoords.length > 0 && <Polyline positions={routeCoords} weight={4} color="blue" opacity={0.8} />}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
