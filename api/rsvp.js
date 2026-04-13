const fs = require('fs');
const path = require('path');

const DATA_PATH = '/tmp/rsvps.json';

function loadRSVPs() {
  try {
    if (!fs.existsSync(DATA_PATH)) return [];
    const data = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function saveRSVPs(data) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Save failed:', e.message);
  }
}

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const rsvps = loadRSVPs();
      res.status(200).json({ count: rsvps.length, rsvps });
    } catch (e) {
      res.status(200).json({ count: 0, rsvps: [], error: e.message });
    }
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { name, attending, guests, dietary, message } = JSON.parse(body);

        if (!name) {
          res.status(400).json({ error: 'Name is required' });
          return;
        }

        const rsvps = loadRSVPs();
        const newRSVP = {
          id: Date.now(),
          name,
          attending: attending === 'yes' ? 'Joyfully Accept' : 'Regretfully Decline',
          guests: parseInt(guests) || 1,
          dietary: dietary || 'Vegetarian',
          message: message || '',
          timestamp: new Date().toISOString()
        };

        rsvps.push(newRSVP);
        saveRSVPs(rsvps);

        res.status(200).json({ success: true, rsvp: newRSVP });
      } catch (e) {
        res.status(500).json({ error: 'Failed to process RSVP: ' + e.message });
      }
    });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
