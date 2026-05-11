const svc = require('../services/classService');

const handle = (fn) => async (req, res) => {
  try { await fn(req, res); }
  catch (err) {
    console.error(err.message);
    if (err.message.includes('not found')) return res.status(404).json({ success: false, message: err.message });
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAll  = handle(async (req, res) => res.json({ success: true, data: await svc.getAll() }));
exports.getById = handle(async (req, res) => {
  const d = await svc.getById(req.params.id);
  if (!d) return res.status(404).json({ success: false, message: 'Class not found' });
  res.json({ success: true, data: d });
});
exports.create  = handle(async (req, res) => {
  const { class_name, schedule_day, start_time, end_time, max_capacity, class_price } = req.body;
  if (!class_name)   return res.status(400).json({ success: false, message: 'class_name is required' });
  if (!schedule_day) return res.status(400).json({ success: false, message: 'schedule_day is required' });
  if (!start_time)   return res.status(400).json({ success: false, message: 'start_time is required' });
  if (!end_time)     return res.status(400).json({ success: false, message: 'end_time is required' });
  if (!max_capacity) return res.status(400).json({ success: false, message: 'max_capacity is required' });
  if (!class_price)  return res.status(400).json({ success: false, message: 'class_price is required' });
  res.status(201).json({ success: true, data: await svc.create(req.body) });
});
exports.update  = handle(async (req, res) => res.json({ success: true, data: await svc.update(req.params.id, req.body) }));
exports.remove  = handle(async (req, res) => {
  const ok = await svc.remove(req.params.id);
  if (!ok) return res.status(404).json({ success: false, message: 'Class not found' });
  res.json({ success: true, message: 'Deleted' });
});
