import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { format } from 'date-fns';
import { useParams } from 'react-router-dom';
import { rentPaymentService } from '../../services/rentPaymentService';

const TenantPaymentHistory = () => {
  const { tenantId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchPaymentHistory();
  }, [tenantId]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await rentPaymentService.getTenantPaymentHistory(tenantId);
      
      if (response.success) {
        // Sort transactions by date (oldest to newest)
        const sortedTransactions = response.data.paymentTransactions.sort(
          (a, b) => new Date(a.paymentDate) - new Date(b.paymentDate)
        );

        // Calculate summary statistics
        const summaryData = {
          totalTransactions: sortedTransactions.length,
          totalPaidAmount: sortedTransactions.reduce((sum, transaction) => sum + transaction.amount, 0),
          firstPaymentDate: sortedTransactions[0]?.paymentDate,
          lastPaymentDate: sortedTransactions[sortedTransactions.length - 1]?.paymentDate,
          paymentMethods: [...new Set(sortedTransactions.map(t => t.paymentMethod))],
          averageAmount: sortedTransactions.length > 0 
            ? sortedTransactions.reduce((sum, t) => sum + t.amount, 0) / sortedTransactions.length 
            : 0
        };

        setPaymentHistory({
          ...response.data,
          paymentTransactions: sortedTransactions
        });
        setSummary(summaryData);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch payment history');
      console.error('Error fetching payment history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!paymentHistory) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No payment history found for this tenant
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Tenant Details */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Tenant Information
        </Typography>
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">Name</Typography>
            <Typography>{paymentHistory.tenantDetails.name}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">Email</Typography>
            <Typography>{paymentHistory.tenantDetails.email}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
            <Typography>{paymentHistory.tenantDetails.phone}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Payment Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Payment Summary
        </Typography>
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">Total Transactions</Typography>
            <Typography variant="h6">{summary.totalTransactions}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">Total Amount Paid</Typography>
            <Typography variant="h6">{formatCurrency(summary.totalPaidAmount)}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">Average Payment</Typography>
            <Typography variant="h6">{formatCurrency(summary.averageAmount)}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">Payment Methods</Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {summary.paymentMethods.map(method => (
                <Chip key={method} label={method} size="small" />
              ))}
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">First Payment</Typography>
            <Typography>
              {summary.firstPaymentDate ? format(new Date(summary.firstPaymentDate), 'MMM dd, yyyy') : 'N/A'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">Last Payment</Typography>
            <Typography>
              {summary.lastPaymentDate ? format(new Date(summary.lastPaymentDate), 'MMM dd, yyyy') : 'N/A'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Payment History Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Payment History
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Period</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paymentHistory.paymentTransactions.map((transaction) => (
                <TableRow key={transaction.rentPayment}>
                  <TableCell>
                    {format(new Date(transaction.paymentDate), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>{transaction.rentPeriod}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>{transaction.paymentMethod}</TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.status}
                      color={getStatusColor(transaction.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{transaction.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default TenantPaymentHistory; 