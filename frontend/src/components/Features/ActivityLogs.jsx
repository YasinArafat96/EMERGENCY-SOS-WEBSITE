import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { FaRegCopy } from 'react-icons/fa';

const ActivityLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  const fetchLogs = async () => {
    try {
      const base = `${process.env.REACT_APP_API_URL}/features/logs`;
      const url = user ? `${base}?user=${user.id || user._id}` : base;
      const res = await axios.get(url);
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to fetch activity logs', err);
    }
  };

  useEffect(() => {
    // fetch logs on mount; if user becomes available, refetch
    fetchLogs();
  }, []);

  useEffect(() => {
    if (user) fetchLogs();
  }, [user]);

  const renderDetails = (details) => {
    if (!details) return <div className="text-gray-400">No details available.</div>;

    // If it's a string, try to parse JSON
    if (typeof details === 'string') {
      try {
        const parsed = JSON.parse(details);
        return renderObject(parsed);
      } catch (e) {
        return <div className="text-gray-300">{details}</div>;
      }
    }

    if (typeof details === 'object') {
      return renderObject(details);
    }

    return <div className="text-gray-300">{String(details)}</div>;
  };

  const renderObject = (obj) => {
    // If it's an array, show list
    if (Array.isArray(obj)) {
      return (
        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
          {obj.map((it, i) => (
            <li key={i}>{typeof it === 'object' ? JSON.stringify(it) : String(it)}</li>
          ))}
        </ul>
      );
    }

    // Plain object: show key-value pairs, hide empty values
    const entries = Object.entries(obj).filter(([,v]) => v !== undefined && v !== null && v !== '');
    if (entries.length === 0) return <div className="text-gray-400">No details available.</div>;

    return (
      <div className="text-sm text-gray-300 space-y-1">
        {entries.map(([k, v]) => (
          <div key={k} className="flex items-start space-x-2">
            <div className="w-28 text-xs text-gray-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}</div>
            <div className="flex-1">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</div>
          </div>
        ))}
      </div>
    );
  };

  const copyDetails = async (id, details) => {
    try {
      const text = typeof details === 'string' ? details : JSON.stringify(details, null, 2);
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const typeBadge = (action) => {
    // simple heuristics
    const a = (action || '').toLowerCase();
    if (a.includes('sos') || a.includes('alert')) return <Badge variant="danger">Emergency</Badge>;
    if (a.includes('book') || a.includes('ride')) return <Badge variant="info">Transport</Badge>;
    if (a.includes('donat')) return <Badge variant="success">Donation</Badge>;
    if (a.includes('post') || a.includes('community')) return <Badge variant="default">Post</Badge>;
    return <Badge variant="default">Activity</Badge>;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-white text-2xl font-bold">Activity Logs</h2>
          <p className="text-gray-300">Recent user activities (bookings, SOS, donations, posts).</p>
        </div>
        <div>
          <Button onClick={fetchLogs}>Refresh</Button>
        </div>
      </div>

      <div className="space-y-3">
        {logs.length === 0 ? (
          <Card className="text-center text-gray-400">No activity logs found.</Card>
        ) : (
          logs.map((l) => (
            <Card key={l._id} className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-3">
                      {l.user && (l.user.avatar ? (
                        <img src={l.user.avatar.startsWith('http') ? l.user.avatar : `${process.env.REACT_APP_API_URL}${l.user.avatar}`} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold" style={{backgroundColor: '#6b7280'}}>{(l.user.name||'U').charAt(0).toUpperCase()}</div>
                      ))}
                      <div className="text-sm text-gray-400">{new Date(l.createdAt).toLocaleString()}</div>
                      <div className="text-white font-semibold">{l.action}</div>
                      {typeBadge(l.action)}
                    </div>
                  </div>
                </div>

                <div className="mt-2">{renderDetails(l.details)}</div>
              </div>

              <div className="flex items-center space-x-2 md:flex-col md:items-end md:justify-start">
                <Button variant="secondary" onClick={() => copyDetails(l._id, l.details)}>
                  <span className="flex items-center space-x-2"><FaRegCopy /> <span className="text-sm">{copiedId === l._id ? 'Copied' : 'Copy'}</span></span>
                </Button>
                {l.ip && <div className="text-xs text-gray-400">IP: {l.ip}</div>}
                {l.userAgent && <div className="text-xs text-gray-400">UA: {String(l.userAgent).slice(0,40)}{String(l.userAgent).length>40?'...':''}</div>}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
