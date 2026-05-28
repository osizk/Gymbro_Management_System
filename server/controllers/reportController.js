const service = require('../services/reportService');

async function getReportGroups(req, res) {
  try {
    const data = await service.getReportGroups();
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getReportGroups]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getReportById(req, res) {
  try {
    const data = await service.getReportById(req.params.reportId, req.query);
    if (!data) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getReportById]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getReportGroups,
  getReportById,
};
