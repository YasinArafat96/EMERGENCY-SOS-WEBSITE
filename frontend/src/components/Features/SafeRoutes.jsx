import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const SafeRoutes = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const circleRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const routePolylineRef = useRef(null);

  const [zones, setZones] = useState([]);
  const [currentPos, setCurrentPos] = useState(null);
  const [addingMarker, setAddingMarker] = useState(null); // {lat,lng}

  const MAX_ZONES = 10;

  const loadScript = (src) => new Promise((resolve, reject) => {
    if (window.google) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

  const fetchZones = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/features/safezones`);
      setZones(res.data.safeZones || []);
    } catch (err) {
      console.error(err);
    }
  };

  const initMap = async () => {
    try {
      const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      if (!key) {
        console.warn('No Google Maps API key set (REACT_APP_GOOGLE_MAPS_API_KEY)');
      }

      await loadScript(`https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`);

      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentPos({ lat: latitude, lng: longitude });

        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: 14,
        });

        const userMarker = new window.google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: mapInstance.current,
          title: 'You are here',
          icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#fff', fillOpacity: 1, strokeColor: '#1f2937' }
        });

        mapInstance.current.addListener('click', (e) => {
          if ((zones.length + markersRef.current.length) >= MAX_ZONES) {
            alert('Maximum of 10 safe zones allowed');
            return;
          }
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          setAddingMarker({ lat, lng });
        });

        renderZones();
      }, (err) => {
        console.error('Geolocation error:', err.message);
        // fallback center
        mapInstance.current = new window.google.maps.Map(mapRef.current, { center: { lat: 23.8103, lng: 90.4125 }, zoom: 12 });
        renderZones();
      });
    } catch (err) {
      console.error('Map init error:', err);
    }
  };

  const renderZones = () => {
    // clear existing markers/circles
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    if (circleRef.current) { circleRef.current.setMap(null); circleRef.current = null; }
    if (!mapInstance.current) return;

    const gm = window.google;
    zones.forEach(z => {
      const marker = new gm.maps.Marker({ position: { lat: z.location.lat, lng: z.location.lng }, map: mapInstance.current, title: z.name });
      const circle = new gm.maps.Circle({ strokeColor: '#10b981', strokeOpacity: 0.6, strokeWeight: 1, fillColor: '#10b981', fillOpacity: 0.15, map: mapInstance.current, center: { lat: z.location.lat, lng: z.location.lng }, radius: z.radius || 100 });
      markersRef.current.push(marker);
    });

    if (currentPos) {
      // compute nearest zone
      let nearest = null;
      let minDist = Infinity;
      zones.forEach(z => {
        const d = haversineDistance(currentPos, z.location);
        if (d < minDist) { minDist = d; nearest = z; }
      });

      if (nearest) {
        // show circle highlight and route
        circleRef.current = new gm.maps.Circle({ strokeColor: '#059669', strokeOpacity: 0.9, strokeWeight: 2, fillColor: '#10b981', fillOpacity: 0.18, map: mapInstance.current, center: { lat: nearest.location.lat, lng: nearest.location.lng }, radius: nearest.radius || 100 });

        // draw route: prefer server-side road routing (OSRM) for realistic road-based path
        (async () => {
          try {
            // clear previous route
            if (routePolylineRef.current) { routePolylineRef.current.setMap(null); routePolylineRef.current = null; }

            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${currentPos.lng},${currentPos.lat};${nearest.location.lng},${nearest.location.lat}?overview=full&geometries=geojson`;
            const resp = await fetch(osrmUrl);
            if (resp.ok) {
              const data = await resp.json();
              if (data.routes && data.routes.length > 0 && data.routes[0].geometry && data.routes[0].geometry.coordinates) {
                const coords = data.routes[0].geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] }));
                routePolylineRef.current = new gm.maps.Polyline({ path: coords, geodesic: true, strokeColor: '#f97316', strokeOpacity: 1.0, strokeWeight: 4 });
                routePolylineRef.current.setMap(mapInstance.current);
                // done
                return;
              }
            }

            // Fallback: try Google DirectionsService if available
            if (gm.maps.DirectionsService && gm.maps.DirectionsRenderer) {
              const directionsService = new gm.maps.DirectionsService();
              if (!directionsRendererRef.current) directionsRendererRef.current = new gm.maps.DirectionsRenderer({ map: mapInstance.current, suppressMarkers: true, polylineOptions: { strokeColor: '#f97316' } });
              directionsService.route({ origin: currentPos, destination: { lat: nearest.location.lat, lng: nearest.location.lng }, travelMode: 'WALKING' }, (result, status) => {
                if (status === 'OK') { directionsRendererRef.current.setDirections(result); }
                else { // final fallback to straight line
                  drawPolyline([currentPos, nearest.location]);
                }
              });
            } else {
              // final fallback to straight line
              drawPolyline([currentPos, nearest.location]);
            }
          } catch (err) {
            console.warn('Routing error, falling back to straight line:', err);
            drawPolyline([currentPos, nearest.location]);
          }
        })();
      }
    }
  };

  const drawPolyline = (points) => {
    // remove existing renderer and polyline
    if (directionsRendererRef.current) { directionsRendererRef.current.setMap(null); directionsRendererRef.current = null; }
    if (routePolylineRef.current) { routePolylineRef.current.setMap(null); routePolylineRef.current = null; }
    if (!mapInstance.current) return;
    const gm = window.google;
    const path = points.map(p => new gm.maps.LatLng(p.lat, p.lng));
    const poly = new gm.maps.Polyline({ path, geodesic: true, strokeColor: '#f97316', strokeOpacity: 1.0, strokeWeight: 3 });
    poly.setMap(mapInstance.current);
    // remove after 60s
    setTimeout(() => { poly.setMap(null); }, 60000);
  };

  const haversineDistance = (a, b) => {
    const toRad = (x) => x * Math.PI / 180;
    const R = 6371e3; // meters
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinDLat = Math.sin(dLat/2);
    const sinDLon = Math.sin(dLon/2);
    const aa = sinDLat*sinDLat + Math.cos(lat1)*Math.cos(lat2)*sinDLon*sinDLon;
    const c = 2*Math.atan2(Math.sqrt(aa), Math.sqrt(1-aa));
    return R * c;
  };

  const saveZone = async (zone) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/features/safezones`, zone);
      setAddingMarker(null);
      fetchZones();
    } catch (err) { console.error(err); }
  };

  const removeZone = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/features/safezones/${id}`);
      fetchZones();
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchZones(); }, []);
  useEffect(() => { if (zones.length > 0 && mapInstance.current) renderZones(); }, [zones, currentPos]);
  useEffect(() => { initMap(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-white text-2xl font-bold mb-4">Safe Routes & Safe Zones</h2>
      <p className="text-gray-300 mb-4">Click on the map to add a safe zone (max 10). Each safe zone shows a 100m radius by default. The map will highlight the nearest safe zone and guide you there.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div ref={mapRef} style={{ width: '100%', height: '500px', borderRadius: 8 }} />
          {addingMarker && (
            <div className="mt-2 p-3 bg-sos-gray rounded">
              <div className="text-white font-semibold">New Safe Zone</div>
              <div className="text-gray-300 text-sm">Lat: {addingMarker.lat.toFixed(6)}, Lng: {addingMarker.lng.toFixed(6)}</div>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input placeholder="Name" id="sz-name" className="p-2 rounded bg-sos-dark text-white" />
                <input placeholder="Radius (meters)" id="sz-radius" defaultValue={100} className="p-2 rounded bg-sos-dark text-white" />
              </div>
              <div className="mt-2 space-x-2">
                <button onClick={() => {
                  const name = document.getElementById('sz-name').value || 'Safe Zone';
                  const radius = parseInt(document.getElementById('sz-radius').value || 100, 10);
                  saveZone({ name, description: '', location: addingMarker, radius, createdBy: null });
                }} className="px-3 py-1 bg-sos-red text-white rounded">Save</button>
                <button onClick={() => setAddingMarker(null)} className="px-3 py-1 bg-gray-600 text-white rounded">Cancel</button>
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-1">
          <div className="bg-sos-gray p-3 rounded">
            <h3 className="text-white font-semibold mb-2">Safe Zones ({zones.length})</h3>
            {zones.length === 0 && <div className="text-gray-400">No safe zones yet</div>}
            <div className="space-y-2 max-h-80 overflow-auto">
              {zones.map(z => (
                <div key={z._id} className="p-2 bg-sos-dark rounded flex justify-between items-center">
                  <div>
                    <div className="text-white font-medium">{z.name}</div>
                    <div className="text-gray-300 text-sm">{z.location.lat.toFixed(4)}, {z.location.lng.toFixed(4)} — {z.radius}m</div>
                  </div>
                  <div className="space-x-2">
                    <button onClick={() => {
                      // center map
                      if (mapInstance.current) mapInstance.current.panTo({ lat: z.location.lat, lng: z.location.lng });
                    }} className="px-2 py-1 bg-blue-600 text-white rounded text-sm">Go</button>
                    <button onClick={() => removeZone(z._id)} className="px-2 py-1 bg-red-600 text-white rounded text-sm">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SafeRoutes;
