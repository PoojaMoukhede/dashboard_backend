const express = require('express');
const router = express.Router();
const Notification = require('../../Model/Web/Notification');

// Create a new notification
router.post('/notifications', async (req, res) => {
  try {
    const { message } = req.body;
    const notification = new Notification({ message });
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Error creating notification' });
  }
});

// Get all notifications
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving notifications' });
  }
});

// Delete all notifications
router.delete('/notifications', async (req, res) => {
  try {
    await Notification.deleteMany();
    res.json({ message: 'All notifications deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting notifications' });
  }
});

module.exports = router;
