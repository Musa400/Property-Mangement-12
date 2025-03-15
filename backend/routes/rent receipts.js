// const express = require('express');
// const router = express.Router();


// // Get all rent receipts with advanced filtering and pagination
// router.get('/', async (req, res) => {
//   try {
//     // Log all incoming query parameters for debugging
//     console.log('Incoming Query Parameters:', {
//       paymentMethod: req.query.paymentMethod,
//       sort: req.query.sort,
//       limit: req.query.limit,
//       page: req.query.page
//     });

//     const { 
//       paymentMethod = 'Bank Check', 
//       sort = { createdAt: -1 }, 
//       limit = 10,
//       page = 1
//     } = req.query;

//     // Ensure numeric conversion
//     const limitNum = Number(limit);
//     const pageNum = Number(page);

//     // Construct query with more flexible matching
//     const query = { 
//       paymentMethod: { 
//         $regex: new RegExp(paymentMethod, 'i') 
//       }
//     };

//     // Log constructed query
//     console.log('Constructed Query:', query);

//     // Pagination options
//     const options = {
//       sort,
//       limit: limitNum,
//       skip: (pageNum - 1) * limitNum
//     };

//     // Log pagination options
//     console.log('Pagination Options:', options);

//     // Fetch rent receipts with detailed logging
//     // const rentReceipts = await RentReceipt.find(query, null, options);
    
//     // // Count total documents for pagination
//     // const total = await RentReceipt.countDocuments(query);

//     // Log query results
//     console.log('Query Results:', {
//       rentReceiptsCount: rentReceipts.length,
//       totalDocuments: total
//     });

//     // Detailed logging of found receipts
//     console.log('Found Rent Receipts:', rentReceipts.map(receipt => ({
//       id: receipt._id,
//       tenantName: receipt.tenantName,
//       paymentMethod: receipt.paymentMethod,
//       rentAmount: receipt.rentAmount
//     })));

//     // Send response with pagination metadata
//     res.json({
//       rentReceipts,
//       totalPages: Math.ceil(total / limitNum),
//       currentPage: pageNum
//     });
//   } catch (error) {
//     console.error('Detailed Error Fetching Rent Receipts:', {
//       message: error.message,
//       stack: error.stack,
//       query: req.query
//     });

//     res.status(500).json({ 
//       message: 'Error fetching rent receipts', 
//       error: {
//         message: error.message,
//         details: error.stack
//       }
//     });
//   }
// });

// // Get single rent receipt
// router.get('/:id', async (req, res) => {
//   try {
//     const rentReceipt = await RentReceipt.findById(req.params.id);
//     if (!rentReceipt) {
//       return res.status(404).json({ message: 'Rent receipt not found' });
//     }
//     res.json(rentReceipt);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Create rent receipt
// router.post('/', async (req, res) => {
//   const rentReceipt = new RentReceipt({
//     tenantName: req.body.tenantName,
//     propertyAddress: req.body.propertyAddress,
//     rentPeriod: req.body.rentPeriod,
//     rentAmount: req.body.rentAmount,
//     paymentMethod: req.body.paymentMethod,
//     paymentStatus: req.body.paymentStatus || 'Paid',
//     bankCheckDetails: req.body.bankCheckDetails,
//     transactionDate: req.body.transactionDate || new Date()
//   });

//   try {
//     const newRentReceipt = await rentReceipt.save();
//     res.status(201).json(newRentReceipt);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// // Diagnostic route to check rent receipt data
// router.get('/diagnostics', async (req, res) => {
//   try {
//     // Get total count of all rent receipts
//     const totalCount = await RentReceipt.countDocuments();

//     // Get count of rent receipts by payment method
//     const paymentMethodCounts = await RentReceipt.aggregate([
//       { 
//         $group: { 
//           _id: '$paymentMethod', 
//           count: { $sum: 1 } 
//         } 
//       }
//     ]);

//     // Get a sample of recent rent receipts
//     const recentReceipts = await RentReceipt.find()
//       .sort({ createdAt: -1 })
//       .limit(10)
//       .select('tenantName paymentMethod rentAmount createdAt');

//     // Check for any data inconsistencies
//     const dataIntegrity = {
//       totalReceipts: totalCount,
//       paymentMethodBreakdown: paymentMethodCounts,
//       recentReceipts: recentReceipts,
//       potentialIssues: []
//     };

//     // Check for potential data issues
//     if (totalCount === 0) {
//       dataIntegrity.potentialIssues.push('No rent receipts found in the database');
//     }

//     // Check for missing required fields in recent receipts
//     const incompleteReceipts = recentReceipts.filter(receipt => 
//       !receipt.tenantName || !receipt.paymentMethod || !receipt.rentAmount
//     );

//     if (incompleteReceipts.length > 0) {
//       dataIntegrity.potentialIssues.push(`Found ${incompleteReceipts.length} incomplete receipts`);
//     }

//     res.json(dataIntegrity);
//   } catch (error) {
//     console.error('Error in rent receipt diagnostics:', error);
//     res.status(500).json({ 
//       message: 'Error running rent receipt diagnostics', 
//       error: error.message 
//     });
//   }
// });

// module.exports = router;