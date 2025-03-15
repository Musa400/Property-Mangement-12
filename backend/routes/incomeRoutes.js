const express = require('express');
const router = express.Router();
const Income = require('../models/Income');

// Create a new income entry
router.post('/add', async (req, res) => {
  try {
    const newIncome = new Income(req.body);
    const savedIncome = await newIncome.save();
    res.status(201).json(savedIncome);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all income entries
router.get('/list', async (req, res) => {
  try {
    const incomes = await Income.find().populate('propertyId');
    res.status(200).json(incomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;