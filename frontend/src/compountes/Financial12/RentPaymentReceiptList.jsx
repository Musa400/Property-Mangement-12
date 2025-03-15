import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  Box,
  Snackbar,
  Alert,
  Button,
  CircularProgress,
  Pagination
} from '@mui/material';
import axios from 'axios';

const RentReceiptList = () => {
  // Update state to include pagination
  const [rentReceiptsData, setRentReceiptsData] = useState({
    rentReceipts: [],
    totalPages: 0,
    currentPage: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReceiptNotification, setNewReceiptNotification] = useState(null);
  
  // Ref to track the latest receipt for comparison
  const latestReceiptRef = useRef(null);

  // Fetch rent receipts with comprehensive error handling
  const fetchRentReceipts = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get('/api/rent-receipts', {
        params: { 
          paymentMethod: 'Bank Paid',
          sort: { createdAt: -1 }, 
          limit: 10, // Reduced limit for better performance
          page: page
        }
      });
      
      // Log fetched receipts for diagnostics
      console.group('🧾 Rent Receipts Fetch');
      console.log('Fetched Receipts:', response.data);
      console.groupEnd();

      // Check for new receipts
      const { rentReceipts, totalPages, currentPage } = response.data;
      
      if (rentReceipts.length > 0) {
        const mostRecentReceipt = rentReceipts[0];
        
        // Compare with previous latest receipt
        if (
          !latestReceiptRef.current || 
          mostRecentReceipt._id !== latestReceiptRef.current._id
        ) {
          // New receipt detected
          if (latestReceiptRef.current) {
            setNewReceiptNotification({
              tenantName: mostRecentReceipt.tenantName,
              rentPeriod: mostRecentReceipt.rentPeriod
            });
          }
          
          // Update latest receipt ref
          latestReceiptRef.current = mostRecentReceipt;
        }
      }

      // Update state with full response data
      setRentReceiptsData({
        rentReceipts,
        totalPages,
        currentPage
      });
      
      setError(null);
    } catch (error) {
      console.error('Error fetching rent receipts:', error);
      setError('Failed to load rent receipts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Setup polling for real-time updates
  useEffect(() => {
    // Initial fetch
    fetchRentReceipts();

    // Set up polling interval
    const pollInterval = setInterval(fetchRentReceipts, 30000); // Every 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  }, [fetchRentReceipts]);

  // Handle page change
  const handlePageChange = (event, value) => {
    fetchRentReceipts(value);
  };

  // Handle manual refresh
  const handleManualRefresh = () => {
    fetchRentReceipts(rentReceiptsData.currentPage);
  };

  // Close new receipt notification
  const handleCloseNotification = () => {
    setNewReceiptNotification(null);
  };

  // Render loading state
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading rent receipts...</Typography>
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleManualRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* New Receipt Notification */}
      <Snackbar
        open={!!newReceiptNotification}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          New Rent Receipt Added: {newReceiptNotification?.tenantName} 
          ({newReceiptNotification?.rentPeriod})
        </Alert>
      </Snackbar>

      {/* Page Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2 
      }}>
        <Typography variant="h4" gutterBottom>
          Bank Paid Rent Receipts
        </Typography>
        <Button 
          variant="outlined" 
          onClick={handleManualRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Empty State */}
      {rentReceiptsData.rentReceipts.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          No bank paid rent receipts found.
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tenant Name</TableCell>
                  <TableCell>Property Address</TableCell>
                  <TableCell>Rent Period</TableCell>
                  <TableCell>Bank Check Number</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rentReceiptsData.rentReceipts.map((receipt) => (
                  <TableRow 
                    key={receipt._id} 
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      transition: 'background-color 0.3s',
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                    }}
                  >
                    <TableCell>{receipt.tenantName}</TableCell>
                    <TableCell>{receipt.propertyAddress}</TableCell>
                    <TableCell>{receipt.rentPeriod}</TableCell>
                    <TableCell>{receipt.bankCheckDetails?.bankCheckNumber || 'N/A'}</TableCell>
                    <TableCell>${receipt.rentAmount}</TableCell>
                    <TableCell>
                      {new Date(receipt.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 3 
          }}>
            <Pagination
              count={rentReceiptsData.totalPages}
              page={rentReceiptsData.currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default RentReceiptList;