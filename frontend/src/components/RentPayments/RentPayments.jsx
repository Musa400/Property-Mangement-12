import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import rentPaymentService from '../../services/rentPaymentService';
import { format } from 'date-fns';

const RentPayments = () => {
  // State management
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [formData, setFormData] = useState({
    tenant: '',
    property: '',
    amount: '',
    rentPeriod: '',
    paymentDate: new Date(),
    paymentMethod: '',
    notes: ''
  });

  // Fetch payments on component mount
  useEffect(() => {
    fetchPayments();
  }, []);

  // Fetch all payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await rentPaymentService.getRentPayments();
      setPayments(response.data.payments);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle date change
  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      paymentDate: date
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingPayment) {
        await rentPaymentService.updateRentPayment(editingPayment._id, formData);
        setSuccess('Payment updated successfully');
      } else {
        await rentPaymentService.createRentPayment(formData);
        setSuccess('Payment created successfully');
      }
      setOpenDialog(false);
      fetchPayments();
      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to save payment');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit payment
  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      tenant: payment.tenant._id,
      property: payment.property._id,
      amount: payment.amount,
      rentPeriod: payment.rentPeriod,
      paymentDate: new Date(payment.paymentDate),
      paymentMethod: payment.paymentMethod,
      notes: payment.notes || ''
    });
    setOpenDialog(true);
  };

  // Handle delete payment
  const handleDelete = async (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        setLoading(true);
        await rentPaymentService.deleteRentPayment(paymentId);
        setSuccess('Payment deleted successfully');
        fetchPayments();
      } catch (err) {
        setError(err.message || 'Failed to delete payment');
      } finally {
        setLoading(false);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      tenant: '',
      property: '',
      amount: '',
      rentPeriod: '',
      paymentDate: new Date(),
      paymentMethod: '',
      notes: ''
    });
    setEditingPayment(null);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Rent Payments
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Add Payment
            </Button>
          </Box>
        </Grid>

        {/* Payments Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tenant</TableCell>
                        <TableCell>Property</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Period</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Method</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment._id}>
                          <TableCell>{payment.tenant.name}</TableCell>
                          <TableCell>{payment.property.name}</TableCell>
                          <TableCell>${payment.amount.toFixed(2)}</TableCell>
                          <TableCell>{payment.rentPeriod}</TableCell>
                          <TableCell>{format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{payment.paymentMethod}</TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleEdit(payment)} color="primary">
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(payment._id)} color="error">
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add/Edit Payment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPayment ? 'Edit Payment' : 'Add New Payment'}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tenant"
                  name="tenant"
                  value={formData.tenant}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Property"
                  name="property"
                  value={formData.property}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Rent Period"
                  name="rentPeriod"
                  value={formData.rentPeriod}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Payment Date"
                    value={formData.paymentDate}
                    onChange={handleDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Payment Method"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  <MenuItem value="Check">Check</MenuItem>
                  <MenuItem value="Online Payment">Online Payment</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RentPayments; 