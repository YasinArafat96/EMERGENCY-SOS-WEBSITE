import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const DHAKA = { lat: 23.8103, lng: 90.4125 };

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

const loadLeaflet = () =>
  new Promise((resolve) => {
    if (window.L) {
      resolve(window.L);
      return;
    }
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });

const DisasterMap = () => {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const weatherLayerRef = useRef(null);
  const [mapType, setMapType] = useState('loading');
  const [activeLayer, setActiveLayer] = useState('precipitation_new');
  const [owmKey, setOwmKey] = useState('');

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/alerts/weather-map-config`)
      .then((res) => setOwmKey(res.data.apiKey || ''))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    let cancelled = false;

    const initGoogleMap = async () => {
      const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      if (!key) return false;
      try {
        await loadScript(`https://maps.googleapis.com/maps/api/js?key=${key}`);
        if (cancelled || !window.google?.maps || !mapRef.current) return false;

        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          center: DHAKA,
          zoom: 10,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        });

        setTimeout(async () => {
          if (cancelled || !googleMapRef.current) return;

          const mapEl = mapRef.current;
          const hasError = mapEl?.innerText?.includes('Sorry') || mapEl?.innerText?.includes("can't load");
          const hasCanvas = mapEl?.querySelector('canvas');

          if (hasError || !hasCanvas) {
            googleMapRef.current = null;
            if (mapRef.current) mapRef.current.innerHTML = '';
            const weatherOk = await initWeatherMap();
            if (!cancelled) setMapType(weatherOk ? 'weather' : 'iframe');
            return;
          }

          window.google.maps.event.trigger(googleMapRef.current, 'resize');
          googleMapRef.current.setCenter(DHAKA);
        }, 2500);

        return true;
      } catch {
        return false;
      }
    };

    const initWeatherMap = async () => {
      const L = await loadLeaflet();
      if (cancelled || !L || !mapRef.current) return false;

      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
      }

      leafletMapRef.current = L.map(mapRef.current).setView([DHAKA.lat, DHAKA.lng], 8);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap',
      }).addTo(leafletMapRef.current);

      if (owmKey) {
        weatherLayerRef.current = L.tileLayer(
          `https://tile.openweathermap.org/map/${activeLayer}/{z}/{x}/{y}.png?appid=${owmKey}`,
          { opacity: 0.75, maxZoom: 18 }
        ).addTo(leafletMapRef.current);
      }

      L.marker([DHAKA.lat, DHAKA.lng]).addTo(leafletMapRef.current).bindPopup('Dhaka').openPopup();

      setTimeout(() => leafletMapRef.current?.invalidateSize(), 400);
      return true;
    };

    const start = async () => {
      setMapType('loading');

      const googleOk = await initGoogleMap();
      if (cancelled) return;

      if (googleOk) {
        setMapType('google');
        return;
      }

      googleMapRef.current = null;
      if (mapRef.current) mapRef.current.innerHTML = '';

      const weatherOk = await initWeatherMap();
      if (cancelled) return;

      setMapType(weatherOk ? 'weather' : 'iframe');
    };

    start();

    return () => {
      cancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [owmKey]);

  useEffect(() => {
    if (mapType !== 'weather' || !leafletMapRef.current || !owmKey || !window.L) return;

    if (weatherLayerRef.current) {
      leafletMapRef.current.removeLayer(weatherLayerRef.current);
    }

    weatherLayerRef.current = window.L.tileLayer(
      `https://tile.openweathermap.org/map/${activeLayer}/{z}/{x}/{y}.png?appid=${owmKey}`,
      { opacity: 0.75, maxZoom: 18 }
    ).addTo(leafletMapRef.current);
  }, [activeLayer, mapType, owmKey]);


  const layers = [
    { id: 'precipitation_new', label: 'Rain' },
    { id: 'clouds_new', label: 'Clouds' },
    { id: 'wind_new', label: 'Wind' },
    { id: 'temp_new', label: 'Temp' },
  ];

  if (mapType === 'iframe') {
    return (
      <iframe
        title="Weather Map"
        src={`https://openweathermap.org/weathermap?basemap=map&cities=true&layer=precipitation&lat=${DHAKA.lat}&lon=${DHAKA.lng}&zoom=8`}
        className="w-full h-80 rounded-lg border-0"
        allowFullScreen
      />
    );
  }

  return (
    <div>
      {mapType === 'weather' && (
        <div className="flex flex-wrap gap-2 mb-3">
          {layers.map((layer) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => setActiveLayer(layer.id)}
              className={`px-3 py-1 text-xs rounded-lg ${
                activeLayer === layer.id ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-300'
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>
      )}

      {mapType === 'loading' && (
        <div className="text-gray-400 text-sm mb-2">Loading map...</div>
      )}

      <div ref={mapRef} className="w-full h-80 rounded-lg bg-[#1a1a2e] relative z-0" />

      {mapType === 'google' && (
        <p className="mt-2 text-xs text-gray-400">Interactive Google Map — zoom & pan to explore.</p>
      )}
      {mapType === 'weather' && (
        <p className="mt-2 text-xs text-gray-400">Live weather map — zoom, pan & switch layers.</p>
      )}
    </div>
  );
};

export default DisasterMap;
