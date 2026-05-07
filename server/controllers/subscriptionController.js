const service = require('../services/subscriptionService');

async function getAllSubscriptions(req, res) {
  try {
    const data = await service.getAllSubscriptions();
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getAllSubscriptions]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getSubscriptionById(req, res) {
  try {
    const data = await service.getSubscriptionById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Subscription not found' });
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getSubscriptionById]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function createSubscription(req, res) {
  try {
    const { subscription_date, member_id, status, line_items } = req.body;
    if (!subscription_date) return res.status(400).json({ success: false, message: 'subscription_date is required' });
    if (!member_id) return res.status(400).json({ success: false, message: 'member_id is required' });
    if (!status) return res.status(400).json({ success: false, message: 'status is required' });
    if (!Array.isArray(line_items) || line_items.length === 0)
      return res.status(400).json({ success: false, message: 'At least one line item is required' });

    const data = await service.createSubscription({ subscription_date, member_id, status, line_items });
    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('[createSubscription]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateSubscription(req, res) {
  try {
    const { subscription_date, member_id, status, line_items } = req.body;
    if (!subscription_date) return res.status(400).json({ success: false, message: 'subscription_date is required' });
    if (!member_id) return res.status(400).json({ success: false, message: 'member_id is required' });
    if (!status) return res.status(400).json({ success: false, message: 'status is required' });
    if (!Array.isArray(line_items) || line_items.length === 0)
      return res.status(400).json({ success: false, message: 'At least one line item is required' });

    const data = await service.updateSubscription(req.params.id, { subscription_date, member_id, status, line_items });
    res.json({ success: true, data });
  } catch (err) {
    console.error('[updateSubscription]', err.message);
    if (err.message.includes('not found')) return res.status(404).json({ success: false, message: err.message });
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteSubscription(req, res) {
  try {
    const deleted = await service.deleteSubscription(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Subscription not found' });
    res.json({ success: true, message: 'Subscription deleted successfully' });
  } catch (err) {
    console.error('[deleteSubscription]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getAllPackages(req, res) {
  try {
    const data = await service.getAllPackages();
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getAllPackages]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getAllPackages,
};