const ActivityLog = require('../models/ActivityLog');
const Disaster = require('../models/Disaster');
const SafeZone = require('../models/SafeZone');

exports.createLog = async (req, res) => {
  try {
    const { user, action, details } = req.body;
    const log = new ActivityLog({ user, action, details });
    await log.save();
    res.status(201).json({ message: 'Activity logged', log });
  } catch (error) {
    console.error('Create log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const { user } = req.query;
    const query = {};
    if (user) query.user = user;
    const logs = await ActivityLog.find(query).sort({ createdAt: -1 }).limit(200).populate('user', 'name userId avatar');
    res.json({ logs });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createDisaster = async (req, res) => {
  try {
    const { title, message, severity, icon, startsAt, endsAt } = req.body;
    const d = new Disaster({ title, message, severity, icon, startsAt, endsAt });
    await d.save();
    res.status(201).json({ message: 'Disaster saved', disaster: d });
  } catch (error) {
    console.error('Create disaster error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDisasters = async (req, res) => {
  try {
    const disasters = await Disaster.find().sort({ startsAt: -1 }).limit(50);
    res.json({ disasters });
  } catch (error) {
    console.error('Get disasters error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createSafeZone = async (req, res) => {
  try {
    const { name, description, location, radius, createdBy } = req.body;
    const sz = new SafeZone({ name, description, location, radius, createdBy });
    await sz.save();

    // create activity log
    try {
      const ActivityLog = require('../models/ActivityLog');
      if (createdBy) {
        await ActivityLog.create({ user: createdBy, action: 'User created a safe zone', details: { safeZoneId: sz._id } });
      }
    } catch (logErr) {
      console.warn('Failed to create activity log for safe zone:', logErr.message);
    }

    res.status(201).json({ message: 'Safe zone created', safeZone: sz });
  } catch (error) {
    console.error('Create safe zone error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSafeZones = async (req, res) => {
  try {
    const safeZones = await SafeZone.find().sort({ createdAt: -1 }).limit(200);
    res.json({ safeZones });
  } catch (error) {
    console.error('Get safe zones error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteSafeZone = async (req, res) => {
  try {
    const { id } = req.params;
    const sz = await SafeZone.findByIdAndDelete(id);
    if (!sz) return res.status(404).json({ message: 'Safe zone not found' });
    res.json({ message: 'Safe zone removed' });
  } catch (error) {
    console.error('Delete safe zone error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
