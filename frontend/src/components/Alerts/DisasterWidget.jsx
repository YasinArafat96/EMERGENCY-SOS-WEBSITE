import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FaCloudShowersHeavy, FaBolt, FaFire, FaSnowflake, FaExclamationTriangle, FaMapMarkerAlt, FaGlobe } from 'react-icons/fa';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const DisasterWidget = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState(null);
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [disasters, setDisasters] = useState([]);
  const [newsPosts, setNewsPosts] = useState([]);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((p) => {
        setCoords({ lat: p.coords.latitude, lng: p.coords.longitude });
      }, () => {
        setCoords({ lat: 23.8103, lng: 90.4125 });
      });
    } else {
      setCoords({ lat: 23.8103, lng: 90.4125 });
    }
  }, []);

  useEffect(() => {
    const fetch = async () => {
      if (!coords) return;
      setLoading(true);
      try {
        const [alertsRes, weatherRes, disastersRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/alerts/disaster?lat=${coords.lat}&lng=${coords.lng}`),
          axios.get(`${process.env.REACT_APP_API_URL}/alerts/weather?lat=${coords.lat}&lng=${coords.lng}`).catch(() => null),
          axios.get(`${process.env.REACT_APP_API_URL}/features/disasters`).catch(() => ({ data: { disasters: [] } })),
        ]);
        setAlerts(alertsRes.data);
        if (weatherRes && weatherRes.data) setWeather(weatherRes.data);
        if (disastersRes && disastersRes.data && disastersRes.data.disasters) setDisasters(disastersRes.data.disasters);

        // try to fetch community posts tagged 'disaster' (may require auth)
        try {
          const posts = await axios.get(`${process.env.REACT_APP_API_URL}/community?tag=disaster&limit=8`);
          setNewsPosts(posts.data || []);
        } catch (e) {
          // ignore if protected
          setNewsPosts([]);
        }

      } catch (err) {
        console.error('Fetch disaster alerts failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [coords]);

  useEffect(() => {
    // init small map for incidents (earthquakes)
    const initMap = async () => {
      try {
        if (!window.google) {
          const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
          if (key) {
            const s = document.createElement('script');
            s.src = `https://maps.googleapis.com/maps/api/js?key=${key}`;
            s.async = true;
            s.onload = () => {};
            document.head.appendChild(s);
            // wait until loaded
            await new Promise((res) => { s.onload = res; s.onerror = res; });
          }
        }

        if (!mapRef.current) return;
        if (!mapInstance.current) {
          mapInstance.current = new window.google.maps.Map(mapRef.current, { center: { lat: coords?.lat || 23.81, lng: coords?.lng || 90.41 }, zoom: 6, disableDefaultUI: true });
        }

        // render markers from alerts.earthquakes
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];
        if (alerts && alerts.earthquakes && Array.isArray(alerts.earthquakes)) {
          alerts.earthquakes.slice(0,20).forEach(eq => {
            // some earthquake features have coordinates in properties or geometry
            const coordsArr = eq?.geometry?.coordinates || eq?.location ? [eq.location.lng, eq.location.lat] : null;
            const lat = coordsArr ? coordsArr[1] : (eq?.latitude || null);
            const lng = coordsArr ? coordsArr[0] : (eq?.longitude || null);
            if (lat && lng) {
              const m = new window.google.maps.Marker({ position: { lat, lng }, map: mapInstance.current, title: `M ${eq.mag} • ${eq.place}` });
              markersRef.current.push(m);
            }
          });
        }
      } catch (err) {
        // ignore map init errors
      }
    };
    initMap();
  }, [alerts, coords]);

  // helpers for styling
  const getWeatherCategory = (event) => {
    const e = (event || '').toLowerCase();
    if (e.includes('flood')) return 'flood';
    if (e.includes('storm') || e.includes('thunder') || e.includes('tornado') || e.includes('hurricane') || e.includes('wind')) return 'storm';
    if (e.includes('heat') || e.includes('heatwave')) return 'heat';
    if (e.includes('snow') || e.includes('ice') || e.includes('cold')) return 'cold';
    return 'general';
  };

  const weatherCategoryColor = (cat) => {
    switch(cat) {
      case 'flood': return 'border-blue-500';
      case 'storm': return 'border-indigo-500';
      case 'heat': return 'border-red-500';
      case 'cold': return 'border-cyan-400';
      default: return 'border-yellow-500';
    }
  };

  const weatherCategoryIcon = (cat, props) => {
    switch(cat) {
      case 'flood': return <FaCloudShowersHeavy {...props} />;
      case 'storm': return <FaBolt {...props} />;
      case 'heat': return <FaFire {...props} />;
      case 'cold': return <FaSnowflake {...props} />;
      default: return <FaExclamationTriangle {...props} />;
    }
  };

  const quakeSeverityColor = (mag) => {
    if (mag >= 6) return 'border-red-600';
    if (mag >= 5) return 'border-orange-500';
    if (mag >= 4) return 'border-yellow-400';
    return 'border-green-500';
  };

  const disasterSeverityColor = (sev) => {
    const s = (sev || '').toLowerCase();
    if (s.includes('high') || s.includes('critical')) return 'border-red-600';
    if (s.includes('medium') || s.includes('moderate')) return 'border-orange-500';
    if (s.includes('low') || s.includes('info')) return 'border-green-500';
    return 'border-gray-400';
  };

  // Modal state for details
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const openModal = (data) => { setModalData(data); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setModalData(null); };

  const getRecommendedActions = (payload) => {
    if (!payload) return [];
    const { type } = payload;
    if (type === 'weather') {
      const cat = getWeatherCategory(payload.event?.event || payload.event?.title || payload.category || '');
      switch (cat) {
        case 'flood':
          return ['Move to higher ground immediately', 'Avoid walking or driving through flood waters', 'Turn off utilities if safe to do so', 'Follow official evacuation orders'];
        case 'storm':
          return ['Seek shelter indoors away from windows', 'Avoid outdoor activities and driving', 'Secure loose outdoor items', 'Monitor local emergency broadcasts'];
        case 'heat':
          return ['Stay hydrated and avoid strenuous activity', 'Move to cool/shaded areas', 'Check on vulnerable people', 'Use cooling centers if available'];
        case 'cold':
          return ['Stay warm and limit time outdoors', 'Dress in layers and cover extremities', 'Keep heaters safe and maintain ventilation', 'Check on at-risk neighbors'];
        default:
          return ['Follow official guidance from local authorities', 'Monitor weather updates', 'Prepare emergency supplies and a plan'];
      }
    }

    if (type === 'quake') {
      const mag = payload.event?.mag || payload.event?.magnitude || 0;
      return ['Drop to the ground', 'Take cover under sturdy furniture', 'Hold on until shaking stops', 'When safe, move to open areas away from buildings and power lines'];
    }

    if (type === 'notice') {
      const sev = (payload.event && payload.event.severity) || payload.event?.severity || 'info';
      if ((sev || '').toLowerCase().includes('high') || (sev || '').toLowerCase().includes('critical')) {
        return ['Follow official evacuation or shelter-in-place instructions', 'Keep emergency kit and documents ready', 'Stay tuned to emergency channels for updates'];
      }
      if ((sev || '').toLowerCase().includes('medium')) {
        return ['Be prepared to act if the situation worsens', 'Review evacuation routes and assemble supplies'];
      }
      return ['Monitor the situation and follow official guidance'];
    }

    if (type === 'news') {
      return ['Verify information with official sources', 'Share helpful updates with your network', 'Report confirmed emergencies using SOS feature'];
    }

    return ['Follow official guidance and stay safe'];
  };

  return (
    <div className="mt-6 bg-white/5 rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Disaster & Environmental Alerts</h3>
          <div className="text-sm text-gray-400">Live alerts, recent incidents and community updates near you</div>
        </div>
        <div className="text-sm text-gray-300">Location: {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Loading...'}</div>
      </div>

      {loading && <div className="text-gray-300 mt-4">Checking latest alerts...</div>}

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-sos-dark rounded p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-300">Weather Alerts</div>
                <div className="text-white font-semibold">{alerts?.weatherAlerts && alerts.weatherAlerts.length > 0 ? `${alerts.weatherAlerts.length} active` : 'No active weather alerts'}</div>
              </div>
              <div className="text-sm text-gray-400">Source: OpenWeatherMap</div>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {alerts?.weatherAlerts && alerts.weatherAlerts.length > 0 ? (
                alerts.weatherAlerts.map((a, idx) => {
                  const cat = getWeatherCategory(a.event);
                  const colorClass = weatherCategoryColor(cat);
                  return (
                    <div key={idx} onClick={() => openModal({ type: 'weather', event: a, category: cat })} className={`p-3 bg-white/5 rounded ${colorClass} border-l-4 cursor-pointer`}>
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl text-white">{weatherCategoryIcon(cat, { className: 'text-white' })}</div>
                        <div>
                          <div className="text-white font-bold">{a.event}</div>
                          <div className="text-xs text-gray-300">{a.sender} • {new Date(a.start*1000).toLocaleString()}</div>
                          <p className="mt-2 text-gray-300 text-sm">{a.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-400">No weather alerts nearby.</div>
              )}
            </div>
          </div>

          <div className="bg-sos-dark rounded p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-300">Recent Earthquakes</div>
                <div className="text-white font-semibold">{alerts?.earthquakes && alerts.earthquakes.length > 0 ? alerts.earthquakes.length : '0'}</div>
              </div>
              <div className="text-sm text-gray-400">Source: USGS</div>
            </div>

            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
              {alerts?.earthquakes && alerts.earthquakes.length > 0 ? (
                alerts.earthquakes.slice(0,8).map((q) => {
                  const colorClass = quakeSeverityColor(q.mag);
                  const severityLabel = q.mag >= 6 ? 'Critical' : q.mag >= 5 ? 'Severe' : q.mag >= 4 ? 'Moderate' : 'Minor';
                  return (
                    <div key={q.id} onClick={() => openModal({ type: 'quake', event: q })} className={`p-3 bg-white/5 rounded border-l-4 ${colorClass} flex justify-between items-start cursor-pointer`}>
                      <div>
                        <div className="text-white font-semibold flex items-center space-x-2"><FaMapMarkerAlt className="text-yellow-300" /> <span>M {q.mag} • {q.place}</span></div>
                        <div className="text-xs text-gray-400">{new Date(q.time).toLocaleString()}</div>
                        <a className="text-xs text-blue-300" href={q.url} target="_blank" rel="noreferrer">Details</a>
                      </div>
                      <div className="text-sm font-semibold" style={{minWidth:80}}>{severityLabel}</div>
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-400">No recent earthquakes nearby.</div>
              )}
            </div>
          </div>

          <div className="bg-sos-dark rounded p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-300">Disaster Notices</div>
                <div className="text-white font-semibold">Community & Official Notices</div>
              </div>
              <div className="text-sm text-gray-400">{disasters.length} active</div>
            </div>

            <div className="mt-3 space-y-3">
              {disasters && disasters.length > 0 ? (
                disasters.slice(0,6).map(d => (
                  <div key={d._id} onClick={() => openModal({ type: 'notice', event: d })} className={`p-3 bg-white/5 rounded border-l-4 ${disasterSeverityColor(d.severity)} cursor-pointer`}>
                    <div className="flex items-center justify-between">
                      <div className="text-white font-bold">{d.title}</div>
                      <div className="text-xs text-gray-300">{new Date(d.startsAt).toLocaleString()}</div>
                    </div>
                    <p className="mt-2 text-gray-300 text-sm">{d.message}</p>
                  </div>
                ))
              ) : (
                <div className="text-gray-400">No official disaster notices.</div>
              )}
            </div>
          </div>

        </div>

        <div className="space-y-4">
          <div className="bg-sos-dark rounded p-4 h-full">
            <div className="text-sm text-gray-300">Current Weather</div>
            {weather ? (
              <div className="mt-2 flex items-center space-x-3">
                <img alt="w" src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} />
                <div>
                  <div className="text-white font-semibold text-lg">{weather.temp}°C</div>
                  <div className="text-gray-300 text-sm">Feels like {weather.feels_like}°C • Humidity {weather.humidity}%</div>
                </div>
              </div>
            ) : (
              <div className="text-gray-400 mt-2">Current weather not available.</div>
            )}

            <div className="mt-4">
              <div className="text-sm text-gray-300">Disaster Map</div>
              <div ref={mapRef} className="w-full h-48 mt-2 rounded bg-black/10" />
            </div>
          </div>

          <div className="bg-sos-dark rounded p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-300">Disaster News</div>
                <div className="text-white font-semibold">From the community</div>
              </div>
              <div className="text-sm text-gray-400">{newsPosts.length} items</div>
            </div>

            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {newsPosts && newsPosts.length > 0 ? (
                newsPosts.map(p => (
                  <div key={p._id} onClick={() => openModal({ type: 'news', event: p })} className="p-2 bg-white/5 rounded cursor-pointer">
                    <div className="text-white font-semibold">{p.title || (p.userId && p.userId.name)}</div>
                    <div className="text-xs text-gray-300">{new Date(p.createdAt).toLocaleString()}</div>
                    <div className="text-gray-300 text-sm mt-1">{p.content && p.content.slice(0,120)}{p.content && p.content.length>120 ? '...' : ''}</div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400">No community posts available (login to see more).</div>
              )}
            </div>
          </div>

        </div>

        {/* Detail modal */}
        <Modal open={modalOpen} onClose={closeModal} ariaLabel="Disaster details">
          {modalData && (
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-sos-dark">{modalData.type === 'weather' ? modalData.event.event : modalData.type === 'quake' ? `Earthquake M ${modalData.event.mag}` : modalData.type === 'notice' ? modalData.event.title : modalData.event.title || 'Detail'}</h4>
                  <div className="text-xs text-gray-500">{modalData.type === 'weather' ? new Date(modalData.event.start * 1000).toLocaleString() : modalData.type === 'quake' ? new Date(modalData.event.time).toLocaleString() : modalData.event.createdAt ? new Date(modalData.event.createdAt).toLocaleString() : ''}</div>
                </div>
                <Button variant="ghost" onClick={closeModal}>Close</Button>
              </div>

              <div className="mt-4 text-gray-700">
                {modalData.type === 'weather' && (
                  <div>
                    <p className="whitespace-pre-line">{modalData.event.description}</p>
                    <div className="mt-3">
                      <div className="text-sm font-semibold">Recommended actions</div>
                      <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
                        {getRecommendedActions(modalData).map((a, i) => <li key={i}>{a}</li>)}
                      </ul>
                    </div>
                  </div>
                )}

                {modalData.type === 'quake' && (
                  <div>
                    <p className="text-sm">Location: {modalData.event.place}</p>
                    <p className="text-sm">Magnitude: M {modalData.event.mag}</p>
                    <p className="text-sm">Time: {new Date(modalData.event.time).toLocaleString()}</p>
                    <a className="text-blue-600 text-sm" href={modalData.event.url} target="_blank" rel="noreferrer">USGS Details</a>
                    <div className="mt-3">
                      <div className="text-sm font-semibold">What to do</div>
                      <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
                        {getRecommendedActions(modalData).map((a, i) => <li key={i}>{a}</li>)}
                      </ul>
                    </div>
                  </div>
                )}

                {modalData.type === 'notice' && (
                  <div>
                    <p className="whitespace-pre-line">{modalData.event.message}</p>
                    <div className="mt-3">
                      <div className="text-sm font-semibold">Recommended</div>
                      <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
                        {getRecommendedActions(modalData).map((a, i) => <li key={i}>{a}</li>)}
                      </ul>
                    </div>
                    {modalData.event.link && <div className="mt-3"><a className="text-blue-600" href={modalData.event.link} target="_blank" rel="noreferrer">More info</a></div>}
                  </div>
                )}

                {modalData.type === 'news' && (
                  <div>
                    <p className="text-sm">{modalData.event.content || modalData.event.title}</p>
                    <div className="mt-3">
                      <div className="text-sm font-semibold">Suggested</div>
                      <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
                        {getRecommendedActions(modalData).map((a, i) => <li key={i}>{a}</li>)}
                      </ul>
                    </div>
                    {modalData.event.url && <div className="mt-3"><a className="text-blue-600" href={modalData.event.url} target="_blank" rel="noreferrer">Source</a></div>}
                  </div>
                )}

              </div>
            </div>
          )}
        </Modal>

      </div>
    </div>
  );
};

export default DisasterWidget;