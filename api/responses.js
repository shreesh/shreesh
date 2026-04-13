module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { execSync } = require('child_process');
  const formId = '1tTxvDRTKWrPiXi-ydLFl-mVP4tvNKIO_PlgT90uqL-E';
  const gogPath = '/home/linuxbrew/.linuxbrew/Cellar/gogcli/0.12.0/bin/gog';

  try {
    const output = execSync(
      `HOME=/home/shreesh ${gogPath} --account kaushiksdigitalfriend@gmail.com --json --results-only forms responses list ${formId}`,
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    );
    const data = JSON.parse(output);
    res.status(200).json({ responses: data });
  } catch (e) {
    res.status(200).json({ responses: [], error: e.message });
  }
};