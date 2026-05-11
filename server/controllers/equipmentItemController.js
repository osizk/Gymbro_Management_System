const svc = require('../services/equipmentItemService');

const handle = (fn) => async (req, res) => {
  try { await fn(req, res); }
  catch (err) {
    console.error(err.message);
    if (err.message.includes('not found')) return res.status(404).json({ success: false, message: err.message });
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAll                  = handle(async (req, res) => res.json({ success: true, data: await svc.getAll() }));
exports.getById                 = handle(async (req, res) => {
  const d = await svc.getById(req.params.id);
  if (!d) return res.status(404).json({ success: false, message: 'Equipment not found' });
  res.json({ success: true, data: d });
});
exports.create                  = handle(async (req, res) => {
  const { equipment_name, category_id, purchase_date, status } = req.body;
  if (!equipment_name) return res.status(400).json({ success: false, message: 'equipment_name is required' });
  if (!category_id)    return res.status(400).json({ success: false, message: 'category_id is required' });
  if (!purchase_date)  return res.status(400).json({ success: false, message: 'purchase_date is required' });
  if (!status)         return res.status(400).json({ success: false, message: 'status is required' });
  res.status(201).json({ success: true, data: await svc.create(req.body) });
});
exports.update                  = handle(async (req, res) => res.json({ success: true, data: await svc.update(req.params.id, req.body) }));
exports.remove                  = handle(async (req, res) => {
  const ok = await svc.remove(req.params.id);
  if (!ok) return res.status(404).json({ success: false, message: 'Equipment not found' });
  res.json({ success: true, message: 'Deleted' });
});
exports.getAllEquipmentCategories = handle(async (req, res) => res.json({ success: true, data: await svc.getAllEquipmentCategories() }));
