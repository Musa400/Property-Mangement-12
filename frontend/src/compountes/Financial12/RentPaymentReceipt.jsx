import React, { useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  Alert
} from '@mui/material';

const RentPaymentReceipt = ({ receiptData }) => {
  const receiptRef = useRef(null);

  // Comprehensive logging and print preparation
  useEffect(() => {
    console.group('🖨️ Rent Payment Receipt Print Diagnostics');
    console.log('Raw Receipt Data:', receiptData);
    
    // Prepare for print
    const preparePrint = () => {
      if (receiptRef.current) {
        console.log('Receipt Element:', receiptRef.current);
        console.log('Receipt Visibility:', {
          display: receiptRef.current.style.display,
          visibility: receiptRef.current.style.visibility,
          opacity: receiptRef.current.style.opacity
        });
      }
    };

    // Add print event listeners
    window.addEventListener('beforeprint', preparePrint);
    window.addEventListener('afterprint', () => console.groupEnd());

    return () => {
      window.removeEventListener('beforeprint', preparePrint);
    };
  }, [receiptData]);

  const handlePrint = () => {
    // Ensure full visibility before printing
    if (receiptRef.current) {
      receiptRef.current.style.display = 'block';
      receiptRef.current.style.visibility = 'visible';
      receiptRef.current.style.opacity = '1';
      
      // Slight delay to ensure rendering
      setTimeout(() => {
        window.print();
      }, 100);
    }
  };

  // If no receipt data, show diagnostic message
  if (!receiptData) {
    return (
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          maxWidth: 600, 
          margin: 'auto' 
        }}
      >
        <Alert severity="warning">
          No receipt data available. Please check the following:
          <ul>
            <li>Ensure all required fields are filled</li>
            <li>Verify the rent payment was successfully created</li>
            <li>Check the data passed to the RentPaymentReceipt component</li>
          </ul>
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper 
      ref={receiptRef}
      elevation={3} 
      sx={{ 
        p: 3, 
        maxWidth: 800, 
        margin: 'auto', 
        '@media print': { 
          width: '100%',
          margin: 0,
          padding: '20px',
          boxShadow: 'none', 
          border: 'none',
          display: 'block !important',
          visibility: 'visible !important',
          opacity: '1 !important'
        },
        '@page': {
          size: 'A4',
          margin: '10mm'
        }
      }}
    >
      {/* Print Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        '@media print': {
          borderBottom: '2px solid #000',
          pb: 2
        }
      }}>
        <Typography variant="h5">Property Management</Typography>
        <Typography variant="h4" align="center">Rent Payment Receipt</Typography>
        <Typography variant="body2">{new Date().toLocaleDateString()}</Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">Tenant Information</Typography>
        <Typography>Name: {receiptData.tenantName || 'N/A'}</Typography>
        <Typography>Property Address: {receiptData.propertyAddress || 'N/A'}</Typography>
        <Typography>Rent Period: {receiptData.rentPeriod || 'N/A'}</Typography>
      </Box>

      {/* Bank Check Details */}
      {(receiptData.bankName || receiptData.bankCheckNumber) && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Bank Check Details</Typography>
          <Typography>Bank Name: {receiptData.bankName || 'N/A'}</Typography>
          <Typography>Check Number: {receiptData.bankCheckNumber || 'N/A'}</Typography>
          <Typography>Check Issue Date: {receiptData.checkIssueDate || 'N/A'}</Typography>
        </Box>
      )}

      {/* Payment Details */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">Payment Details</Typography>
        <Typography>Amount Paid: ${receiptData.rentAmount || 'N/A'}</Typography>
        <Typography>Transaction Date: {receiptData.transactionDate || 'N/A'}</Typography>
        <Typography>Payment Method: {receiptData.paymentMethod || 'N/A'}</Typography>
        <Typography>Payment Status: {receiptData.paymentStatus || 'Paid'}</Typography>
      </Box>

      {/* Print Button - Hidden during print */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        '@media print': { 
          display: 'none' 
        } 
      }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handlePrint}
        >
          Print Receipt
        </Button>
      </Box>

      {/* Signature Section */}
      <Box sx={{ 
        mt: 4, 
        textAlign: 'center', 
        borderTop: '1px solid #ddd', 
        pt: 2 
      }}>
        <Typography variant="body2">
          Landlord/Management Signature: ____________________
        </Typography>
      </Box>
    </Paper>
  );
};

export default RentPaymentReceipt;