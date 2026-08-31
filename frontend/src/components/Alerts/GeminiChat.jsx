import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'gemini_conversation_v2';
// expire after 7 days of inactivity
const EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000;

const GeminiChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj && obj.createdAt && Date.now() - obj.createdAt < EXPIRATION_MS && Array.isArray(obj.messages)) {
          return obj.messages;
        }
      }
    } catch (e) {}
    return [{ from: 'system', text: 'Gemini chat ready. Send an emergency message or ask for instructions.' }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const boxRef = useRef();

  // persist helper
  const persist = (msgs) => {
    try {
      const payload = { createdAt: Date.now(), messages: msgs };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) { console.warn('Failed to save gemini conversation', e); }
  };

  useEffect(() => {
    // whenever messages change, persist
    persist(messages);
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };

    // append locally first (optimistic)
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const historyToSend = nextMessages.filter(m => m.from !== 'system');
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/alerts/gemini-chat`, { message: userMsg.text, history: historyToSend });
      const reply = (res.data && res.data.reply) ? res.data.reply : 'No reply';

      const withReply = [...nextMessages, { from: 'gemini', text: reply }];
      setMessages(withReply);

      // scroll to bottom after render
      setTimeout(()=> { if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight; }, 50);
    } catch (err) {
      console.error(err);
      const serverMsg = err?.response?.data?.message || err?.message || 'Gemini chat failed';
      const details = err?.response?.data?.details;
      toast.error(serverMsg);
      const replyText = serverMsg + (details ? `: ${typeof details === 'string' ? details.slice(0,200) : JSON.stringify(details).slice(0,200)}` : '');
      setMessages(prev => [...prev, { from: 'gemini', text: replyText }]);
    } finally {
      setLoading(false);
    }
  };

  // optional: clear expired on mount (cleanup older than expiration)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const obj = JSON.parse(raw);
        if (!obj || !obj.createdAt || Date.now() - obj.createdAt >= EXPIRATION_MS) {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (e) {}
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sos-dark via-sos-dark to-purple-900/10 p-4 md:p-6">
      <div className="container mx-auto max-w-3xl">
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Gemini Emergency Chat</h1>
            <div className="text-sm text-gray-300">Talk to the assistant when helpers are offline</div>
          </div>

          <div ref={boxRef} className="h-96 overflow-auto p-4 bg-sos-gray rounded mb-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`p-3 rounded ${m.from==='user' ? 'bg-blue-600 text-white self-end' : m.from==='gemini' ? 'bg-gray-800 text-white' : 'bg-gray-700 text-gray-200'}`}>
                <div className="text-sm">{m.text}</div>
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Send a message to Gemini (e.g., 'I need medical help at my location')" className="flex-1 p-3 rounded bg-sos-dark text-white" />
            <button onClick={send} disabled={loading} className={`px-4 py-3 rounded ${loading ? 'bg-gray-500' : 'bg-sos-red hover:bg-red-700'} text-white`}>{loading ? 'Sending...' : 'Send'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiChat;
