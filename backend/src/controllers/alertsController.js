const { getIO } = require('../config/socket');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

// POST /api/alerts/sos-push
// body: { useGemini: boolean } - will trigger an immediate SOS push notification and optionally ask Gemini to craft message
exports.pushSOS = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const { location, useGemini } = req.body || {};

    // Build default message
    let message = `SOS! Immediate help needed.`;
    if (location && location.lat && location.lng) {
      message += ` Location: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}.`;
    }

    // If Gemini configured and requested, try to generate an urgent short message
    if (useGemini && process.env.GEMINI_API_URL && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `Create a short urgent SOS message (one line) including location ${location ? `${location.lat}, ${location.lng}` : ''} and clear instruction to seek immediate help.`;
        const resp = await fetch(process.env.GEMINI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': process.env.GEMINI_API_KEY,
          },
          body: JSON.stringify({ contents: [ { parts: [ { text: prompt } ] } ] }),
        });

        if (resp.ok) {
          const body = await resp.json();
          // Try common shapes from Generative Language responses
          let candidateText = null;
          if (body?.candidates && Array.isArray(body.candidates) && body.candidates[0]) {
            const cand = body.candidates[0];
            if (cand?.content?.parts && Array.isArray(cand.content.parts)) {
              candidateText = cand.content.parts.map(p => p.text || '').join('');
            } else if (cand?.content && typeof cand.content === 'string') {
              candidateText = cand.content;
            } else if (cand?.outputText) {
              candidateText = cand.outputText;
            }
          }
          message = candidateText || (body?.candidates && Array.isArray(body.candidates) && body.candidates[0]?.outputText) || body?.output?.text || body?.text || JSON.stringify(body).slice(0, 500);
        }
      } catch (err) {
        console.warn('Gemini call failed:', err.message);
      }
    }

    // Emit via Socket.IO to emergency-channel and to primary helpers of the user (if available)
    try {
      const io = getIO();
      const payload = { message, userId, location, timestamp: new Date() };
      io.to('emergency-channel').emit('sos-push', payload);

      if (userId) {
        const user = await User.findById(userId).select('primaryHelpers');
        if (user && user.primaryHelpers && user.primaryHelpers.length > 0) {
          user.primaryHelpers.forEach(helperId => {
            io.to(`user-${helperId}`).emit('sos-push', payload);
          });
        }
      }
    } catch (socketErr) {
      console.warn('Socket emit failed for SOS push:', socketErr.message);
    }

    // Log activity
    try {
      if (userId) {
        await ActivityLog.create({ user: userId, action: 'User sent SOS push', details: { location } });
      }
    } catch (logErr) {
      console.warn('Failed to log SOS push:', logErr.message);
    }

    res.json({ message: 'SOS push sent', body: message });
  } catch (error) {
    console.error('pushSOS error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/alerts/disaster?lat=..&lng=..
// Uses OpenWeatherMap alerts (One Call) and USGS earthquakes to provide nearby alerts
exports.getDisasterAlerts = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'lat and lng required' });
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    const results = { weatherAlerts: [], earthquakes: [] };

    // 1) OpenWeatherMap One Call (alerts) if API key provided
    if (process.env.OPENWEATHERMAP_API_KEY) {
      try {
        const owmUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${latNum}&lon=${lngNum}&exclude=minutely,hourly,daily&appid=${process.env.OPENWEATHERMAP_API_KEY}`;
        const resp = await fetch(owmUrl);
        if (resp.ok) {
          const body = await resp.json();
          if (body.alerts && Array.isArray(body.alerts)) {
            results.weatherAlerts = body.alerts.map(a => ({ sender: a.sender_name, event: a.event, start: a.start, end: a.end, description: a.description }));
          }
        }
      } catch (err) {
        console.warn('OpenWeatherMap call failed:', err.message);
      }
    }

    // 2) USGS Earthquake API: recent quakes within 300km radius in last 7 days
    try {
      const now = new Date();
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const usgsUrl = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${start}&latitude=${latNum}&longitude=${lngNum}&maxradiuskm=300`;
      const resp2 = await fetch(usgsUrl);
      if (resp2.ok) {
        const body2 = await resp2.json();
        if (body2.features && Array.isArray(body2.features)) {
          results.earthquakes = body2.features.map(f => ({ id: f.id, place: f.properties.place, mag: f.properties.mag, time: f.properties.time, url: f.properties.url }));
        }
      }
    } catch (err) {
      console.warn('USGS call failed:', err.message);
    }

    res.json(results);
  } catch (error) {
    console.error('getDisasterAlerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// GET /api/alerts/weather?lat=..&lng=..
// Returns current weather for the given coordinates using OpenWeatherMap Current Weather API
exports.getCurrentWeather = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng required' });

    if (!process.env.OPENWEATHERMAP_API_KEY) {
      return res.status(400).json({ message: 'OPENWEATHERMAP_API_KEY not configured on server' });
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latNum}&lon=${lngNum}&units=metric&appid=${process.env.OPENWEATHERMAP_API_KEY}`;
    const resp = await fetch(url);
    if (!resp.ok) return res.status(502).json({ message: 'Failed to fetch weather' });
    const body = await resp.json();

    const result = {
      temp: body.main?.temp,
      feels_like: body.main?.feels_like,
      humidity: body.main?.humidity,
      wind: body.wind,
      weather: body.weather,
      name: body.name,
    };

    res.json(result);
  } catch (err) {
    console.error('getCurrentWeather error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// POST /api/alerts/gemini-chat
// Proxy chat messages to configured Gemini API and return the response
exports.chatGemini = async (req, res) => {
  try {
    const { message, history } = req.body || {};
    if (!message) return res.status(400).json({ message: 'message is required' });

    if (!process.env.GEMINI_API_URL || !process.env.GEMINI_API_KEY) {
      return res.status(400).json({ message: 'Gemini not configured on server' });
    }

    const GeminiConversation = require('../models/GeminiConversation');

    // Build conversation text including history so Gemini has context (multi-turn)
    const hist = Array.isArray(history) ? history : [];
    const convLines = hist.map(h => `${h.from === 'user' ? 'User' : 'Assistant'}: ${h.text}`);
    convLines.push(`User: ${message}`);
    const convText = convLines.join('\n');

    const glPayload = { contents: [ { parts: [ { text: convText } ] } ] };

    const resp = await fetch(process.env.GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify(glPayload),
    });

    // Save conversation messages to DB (if user authenticated)
    try {
      if (req.user && req.user._id) {
        let conv = await GeminiConversation.findOne({ user: req.user._id });
        if (!conv) {
          conv = new GeminiConversation({ user: req.user._id, messages: [] });
        }
        // append history (only new entries not already present)
        hist.forEach(h => {
          conv.messages.push({ from: h.from === 'user' ? 'user' : 'gemini', text: h.text });
        });
        // append current user message
        conv.messages.push({ from: 'user', text: message });
        // append reply later after we get it
        await conv.save();
      }
    } catch (saveErr) {
      console.warn('Failed to save Gemini conversation (pre-reply):', saveErr.message);
    }

    if (!resp.ok) {
      const txt = await resp.text();
      console.warn('Gemini response not ok:', resp.status, txt);
      // Provide clearer client-facing error for quota/rate issues
      if (resp.status === 429 || resp.status === 403) {
        return res.status(503).json({ message: 'Gemini service temporarily unavailable (quota or access issue)', details: txt });
      }
      return res.status(502).json({ message: 'Gemini call failed', details: txt });
    }

    const body = await resp.json();

    // Attempt to extract reply text from common candidate/content shapes
    let reply = null;
    if (body?.candidates && Array.isArray(body.candidates) && body.candidates[0]) {
      const cand = body.candidates[0];
      if (cand?.content?.parts && Array.isArray(cand.content.parts)) {
        reply = cand.content.parts.map(p => p.text || '').join('');
      } else if (cand?.content && typeof cand.content === 'string') {
        reply = cand.content;
      }
      if (!reply && cand?.outputText) reply = cand.outputText;
    }
    reply = reply || body?.output?.text || body?.text || JSON.stringify(body);

    // Save reply to conversation and log chat activity
    try {
      if (req.user && req.user._id) {
        // append reply to stored conversation
        try {
          const GeminiConversation = require('../models/GeminiConversation');
          let conv = await GeminiConversation.findOne({ user: req.user._id });
          if (!conv) {
            conv = new GeminiConversation({ user: req.user._id, messages: [] });
          }
          conv.messages.push({ from: 'gemini', text: reply });
          await conv.save();
        } catch (convErr) {
          console.warn('Failed to append reply to GeminiConversation:', convErr.message);
        }

        await ActivityLog.create({ user: req.user._id, action: 'User chatted with Gemini', details: { message, reply } });
      }
    } catch (logErr) {
      console.warn('Failed to log Gemini chat:', logErr.message);
    }

    res.json({ reply });
  } catch (err) {
    try {
      const fs = require('fs');
      const entry = `${new Date().toISOString()} - chatGemini error: ${err && err.stack ? err.stack : JSON.stringify(err)}\n`;
      fs.appendFileSync('gemini-error.log', entry);
    } catch (logErr) {
      console.error('Failed to write gemini error log:', logErr && logErr.stack ? logErr.stack : logErr);
    }
    console.error('chatGemini error:', err && err.stack ? err.stack : err);
    res.status(500).json({ message: 'Server error' });
  }
};
