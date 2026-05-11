const svc = require('../services/maintenanceTicketService');

const handle = (fn) => async (req, res) => {
  try { await fn(req, res); }
  catch (err) {
    console.error(err.message);
    if (err.message.includes('not found')) return res.status(404).json({ success: false, message: err.message });
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAll        = handle(async (req, res) => res.json({ success: true, data: await svc.getAll() }));
exports.getById       = handle(async (req, res) => {
  const d = await svc.getById(req.params.id);
  if (!d) return res.status(404).json({ success: false, message: 'Ticket not found' });
  res.json({ success: true, data: d });
});
exports.create        = handle(async (req, res) => {
  const { equipment_id, report_date, issue_description, technician_id, status } = req.body;
  if (!equipment_id)       return res.status(400).json({ success: false, message: 'equipment_id is required' });
  if (!report_date)        return res.status(400).json({ success: false, message: 'report_date is required' });
  if (!issue_description)  return res.status(400).json({ success: false, message: 'issue_description is required' });
  if (!technician_id)      return res.status(400).json({ success: false, message: 'technician_id is required' });
  if (!status)             return res.status(400).json({ success: false, message: 'status is required' });
  res.status(201).json({ success: true, data: await svc.create(req.body) });
});
exports.update        = handle(async (req, res) => res.json({ success: true, data: await svc.update(req.params.id, req.body) }));
exports.remove        = handle(async (req, res) => {
  const ok = await svc.remove(req.params.id);
  if (!ok) return res.status(404).json({ success: false, message: 'Ticket not found' });
  res.json({ success: true, message: 'Deleted' });
});
exports.getAllEquipment = handle(async (req, res) => res.json({ success: true, data: await svc.getAllEquipment() }));
exports.getAllStaff    = handle(async (req, res) => res.json({ success: true, data: await svc.getAllStaff() }));
