import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ICONS = [
  { key: 'medical', label: 'Medical', emoji: '🩺' },
  { key: 'food', label: 'Food', emoji: '🍱' },
  { key: 'water', label: 'Water', emoji: '💧' },
  { key: 'shelter', label: 'Shelter', emoji: '🏠' },
  { key: 'evacuate', label: 'Evacuate', emoji: '🚨' },
];

const DisasterControl = () => {
  const [disasters, setDisasters] = useState([]);
  const [form, setForm] = useState({ title: '', message: '', severity: 'low', icon: ICONS[0].key });

  const fetchDisasters = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/features/disasters`);
      setDisasters(res.data.disasters || []);
    } catch (err) {
      console.error(err);
    }
  };

  const create = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/features/disasters`, form);
      setForm({ title: '', message: '', severity: 'low', icon: ICONS[0].key });
      fetchDisasters();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchDisasters(); }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-white text-2xl font-bold mb-4">Disaster Control</h2>
      <p className="text-gray-300 mb-4">Create and view disaster notifications and safety guidelines.</p>

      <form onSubmit={create} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input className="col-span-2 p-2 rounded bg-sos-gray text-white" placeholder="Title" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} />
        <select className="p-2 rounded bg-sos-gray text-white" value={form.severity} onChange={(e)=>setForm({...form,severity:e.target.value})}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <textarea className="col-span-2 p-2 rounded bg-sos-gray text-white" placeholder="Message" value={form.message} onChange={(e)=>setForm({...form,message:e.target.value})} />

        <div className="p-2 rounded bg-sos-gray text-white">
          <div className="text-sm text-gray-300 mb-2">Select Icon</div>
          <div className="flex space-x-2">
            {ICONS.map(ic => (
              <button key={ic.key} type="button" onClick={() => setForm({...form, icon: ic.key})} className={`p-2 rounded ${form.icon===ic.key? 'bg-sos-red text-white':'bg-sos-dark text-white'}`}>
                <div className="text-xl">{ic.emoji}</div>
                <div className="text-xs mt-1">{ic.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-end">
          <button className="px-4 py-2 bg-sos-red text-white rounded">Publish</button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {disasters.map(d=> (
          <div key={d._id} className="bg-gradient-to-br from-red-600 to-yellow-400 p-4 rounded-lg text-black shadow-lg">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{d.title}</div>
              <div className="text-3xl">{(ICONS.find(i=>i.key===d.icon) || {}).emoji}</div>
            </div>
            <div className="mt-2 text-sm">{d.message}</div>
            <div className="mt-3 text-xs text-black/70">{new Date(d.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DisasterControl;
