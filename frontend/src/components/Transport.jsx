import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const Transport = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const [coords, setCoords] = useState(null);
  const [tab, setTab] = useState('book'); // 'sos' or 'book'
  const [vehiclesVisible, setVehiclesVisible] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [booking, setBooking] = useState({ name: '', phone: '', pickup: '' });
  const [bookingResp, setBookingResp] = useState(null);

  const loadScript = (src) => new Promise((resolve, reject) => {
    if (window.google) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

  useEffect(() => {
    const init = async () => {
      const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      if (!key) {
        console.warn('No Google Maps API key set');
      }
      await loadScript(`https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`);

      navigator.geolocation.getCurrentPosition((p) => {
        const lat = p.coords.latitude; const lng = p.coords.longitude;
        setCoords({ lat, lng });
        mapInstance.current = new window.google.maps.Map(mapRef.current, { center: { lat, lng }, zoom: 13 });
        new window.google.maps.Marker({ position: { lat, lng }, map: mapInstance.current, title: 'Your location' });
      }, () => {
        const lat = 23.8103; const lng = 90.4125;
        setCoords({ lat, lng });
        mapInstance.current = new window.google.maps.Map(mapRef.current, { center: { lat, lng }, zoom: 13 });
      });
    };
    init();
  }, []);

  useEffect(() => {
    let iv;
    if (vehiclesVisible && coords) {
      // fetch vehicles and start updating positions every 5s
      const fetchAndRender = async () => {
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/transport/vehicles?lat=${coords.lat}&lng=${coords.lng}`);
          setVehicles(res.data.vehicles || []);
        } catch (err) { console.error('Failed to fetch demo vehicles', err); }
      };
      fetchAndRender();
      iv = setInterval(async () => {
        // simulate movement by small random delta
        setVehicles(prev => prev.map(v => ({ ...v, lat: v.lat + (Math.random()-0.5)*0.0005, lng: v.lng + (Math.random()-0.5)*0.0005 })));
      }, 4000);
    }
    return () => { if (iv) clearInterval(iv); }
  }, [vehiclesVisible, coords]);

  useEffect(() => { renderVehicles(); }, [vehicles]);

  const renderVehicles = () => {
    if (!mapInstance.current) return;
    const gm = window.google;
    // clear old markers
    Object.values(markersRef.current).forEach(m => m.setMap(null));
    markersRef.current = {};

    vehicles.forEach(v => {
      const icon = v.type === 'ambulance' ? '🚑' : '🚒';
      const marker = new gm.maps.Marker({ position: { lat: v.lat, lng: v.lng }, map: mapInstance.current, title: `${v.type} ${v.id}`, label: { text: icon, fontSize: '16px' } });
      markersRef.current[v.id] = marker;
    });

    // fit bounds
    const bounds = new gm.maps.LatLngBounds();
    if (coords) bounds.extend(new gm.maps.LatLng(coords.lat, coords.lng));
    vehicles.forEach(v => bounds.extend(new gm.maps.LatLng(v.lat, v.lng)));
    if (!bounds.isEmpty()) mapInstance.current.fitBounds(bounds);
  };

  const haversine = (a, b) => {
    const toRad = x => x * Math.PI/180;
    const R = 6371e3;
    const dLat = toRad(b.lat - a.lat); const dLon = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat); const lat2 = toRad(b.lat);
    const aa = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
    const c = 2*Math.atan2(Math.sqrt(aa), Math.sqrt(1-aa));
    return R*c; // meters
  };

  const book = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/transport/book`, booking, { headers });
      setBookingResp(res.data);
    } catch (err) {
      console.error('Booking failed', err);
      alert('Booking failed (login required)');
    }
  };

  const sosActive = !!localStorage.getItem('sos_active');

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto bg-white/5 p-4 rounded-xl">
        <h2 className="text-xl text-white font-semibold">Transport — Ambulance & Fire Tracker</h2>
        <div className="mt-3">
          <div className="flex space-x-2 mb-3">
            <button onClick={() => setTab('sos')} className={`px-3 py-1 rounded ${tab==='sos' ? 'bg-sos-red' : 'bg-gray-700'}`}>SOS Vehicles</button>
            <button onClick={() => setTab('book')} className={`px-3 py-1 rounded ${tab==='book' ? 'bg-sos-red' : 'bg-gray-700'}`}>Book Ambulance</button>
            {sosActive && <div className="ml-3 text-sm text-gray-300">SOS is active</div>}
          </div>

          <div className="h-72 rounded overflow-hidden" ref={mapRef}></div>

          {tab === 'sos' && (
            <div className="mt-3">
              <div className="flex items-center space-x-2 mb-2">
                <button onClick={() => setVehiclesVisible(!vehiclesVisible)} className="px-3 py-1 bg-sos-red rounded text-white">{vehiclesVisible ? 'Hide Vehicles' : 'Show Vehicles'}</button>
                <div className="text-sm text-gray-300">Click to show nearby ambulances and fire vehicles coming to the SOS (demo)</div>
              </div>

              {vehiclesVisible && (
                <div className="mt-2 bg-sos-dark p-3 rounded">
                  <h4 className="text-white font-semibold mb-2">Incoming Vehicles</h4>
                  {vehicles.map(v => (
                    <div key={v.id} className="text-gray-200 p-2 border-b border-white/5 flex justify-between">
                      <div>{v.type.toUpperCase()} - {v.id}</div>
                      <div>{coords ? Math.round(haversine(coords, { lat: v.lat, lng: v.lng })/1000*10)/10 + ' km' : '—'}</div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {tab === 'book' && (
            <div className="mt-3 bg-sos-dark p-4 rounded">
              <h4 className="text-white font-semibold">Book an Ambulance</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                <input placeholder="Your name" value={booking.name} onChange={(e)=>setBooking({...booking, name:e.target.value})} className="p-2 bg-gray-800 text-white rounded col-span-1" />
                <input placeholder="Phone" value={booking.phone} onChange={(e)=>setBooking({...booking, phone:e.target.value})} className="p-2 bg-gray-800 text-white rounded col-span-1" />
                <input placeholder="Pickup location" value={booking.pickup} onChange={(e)=>setBooking({...booking, pickup:e.target.value})} className="p-2 bg-gray-800 text-white rounded col-span-1" />
              </div>
              <div className="mt-3">
                <button onClick={book} className="px-4 py-2 bg-sos-red text-white rounded">Book Ambulance</button>
                {bookingResp && <div className="mt-2 text-sm text-gray-300">Booking confirmed: {bookingResp.booking?.id} ETA: {bookingResp.booking?.eta_minutes} mins</div>}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Transport;
