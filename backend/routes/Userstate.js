const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/today-stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const registrationsToday = await User.countDocuments({
      createdAt: { 
        $gte: today 
      }
    });

    const loginsToday = await User.countDocuments({
      lastLoginAt: { 
        $gte: today 
      }
    });

    res.json({
      registrationsToday,
      loginsToday
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user stats', error });
  }
});

module.exports = router;