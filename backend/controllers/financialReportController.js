const FinancialTransaction = require('../models/FinancialTransaction');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const Property = require('../models/Property');

exports.generateFinancialReport = async (req, res) => {
  const { month, year } = req.query;
  const propertyId = req.params.id;
  
  console.log('Financial Report Request:', { 
    propertyId, 
    month, 
    year 
  });

  try {
    // Validate input
    if (!month || !year) {
      console.error('Missing month or year');
      return res.status(400).json({ 
        message: 'Month and year are required',
        details: { month, year }
      });
    }

    // Validate propertyId
    if (!propertyId) {
      console.error('Missing property ID');
      return res.status(400).json({ 
        message: 'Property ID is required' 
      });
    }

    const startDate = moment(`${year}-${month}-01`).startOf('month');
    const endDate = moment(startDate).endOf('month');

    console.log('Date Range:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    // Find transactions
    const transactions = await FinancialTransaction.find({
      date: { $gte: startDate, $lte: endDate },
      property: propertyId
    }).populate('tenant');

    console.log('Transactions Found:', transactions.length);

    // Calculate summary
    const summary = {
      totalIncome: transactions
        .filter(t => t.type === 'Income')
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: transactions
        .filter(t => t.type === 'Expense')
        .reduce((sum, t) => sum + t.amount, 0),
      totalRentPayments: transactions
        .filter(t => t.type === 'Rent Payment')
        .reduce((sum, t) => sum + t.amount, 0)
    };

    summary.balance = summary.totalIncome - summary.totalExpenses;

    // Generate CSV manually
    const csvHeader = 'Date,Type,Amount,Description,Tenant\n';
    const csvContent = transactions.map(t => 
      `${t.date.toISOString()},${t.type},${t.amount},${t.description},${t.tenant ? t.tenant.name : 'N/A'}`
    ).join('\n');
    const csvFile = csvHeader + csvContent;

    // Send response
    res.json({
      transactions,
      summary,
      csvFile,
      reportPeriod: {
        month: moment(startDate).format('MMMM'),
        year: moment(startDate).format('YYYY')
      }
    });
  } catch (error) {
    console.error('Financial Report Generation Error:', error);
    res.status(500).json({ 
      message: 'Error generating financial report', 
      error: error.message,
      stack: error.stack
    });
  }
};

exports.generateTotalFinancialReport = async (req, res) => {
  const { month, year } = req.query;
  
  console.log('Total Financial Report Request:', { 
    month, 
    year 
  });

  try {
    // Validate input
    if (!month || !year) {
      console.error('Missing month or year');
      return res.status(400).json({ 
        message: 'Month and year are required',
        details: { month, year }
      });
    }

    const startDate = moment(`${year}-${month}-01`).startOf('month');
    const endDate = moment(startDate).endOf('month');

    console.log('Date Range:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    // Find transactions across all properties
    const transactions = await FinancialTransaction.find({
      date: { $gte: startDate, $lte: endDate }
    })
    .populate('property')
    .populate('tenant');

    console.log('Total Transactions Found:', transactions.length);

    // Calculate summary
    const summary = {
      totalIncome: transactions
        .filter(t => t.type === 'Income')
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: transactions
        .filter(t => t.type === 'Expense')
        .reduce((sum, t) => sum + t.amount, 0),
      totalRentPayments: transactions
        .filter(t => t.type === 'Rent Payment')
        .reduce((sum, t) => sum + t.amount, 0)
    };

    summary.balance = summary.totalIncome - summary.totalExpenses;

    // Generate CSV manually
    const csvHeader = 'Property,Date,Type,Amount,Description,Tenant\n';
    const csvContent = transactions.map(t => 
      `${t.property?.name || 'Unknown'},${t.date.toISOString()},${t.type},${t.amount},${t.description},${t.tenant ? t.tenant.name : 'N/A'}`
    ).join('\n');
    const csvFile = csvHeader + csvContent;

    // Send response
    res.json({
      transactions,
      summary,
      csvFile,
      reportPeriod: {
        month: moment(startDate).format('MMMM'),
        year: moment(startDate).format('YYYY')
      }
    });
  } catch (error) {
    console.error('Total Financial Report Generation Error:', error);
    res.status(500).json({ 
      message: 'Error generating total financial report', 
      error: error.message,
      stack: error.stack
    });
  }
};