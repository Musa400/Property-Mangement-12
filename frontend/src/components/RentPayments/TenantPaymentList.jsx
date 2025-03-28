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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { ExpandMore, ExpandLess, Add as AddIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import rentPaymentService from '../../services/rentPaymentService';

const TenantPaymentList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [expandedTenant, setExpandedTenant] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    rentPeriod: '',
    paymentMethod: '',
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
    status: ''
  });

  // Fetch tenant payments
  const fetchTenantPayments = async () => {
    try {
      setLoading(true);
      const response = await rentPaymentService.getRentPayments();
      
      // Process payments to group by tenant
      const tenantMap = new Map();
      
      response.rentPayments.forEach(payment => {
        const tenantId = payment.tenant._id;
        if (!tenantMap.has(tenantId)) {
          tenantMap.set(tenantId, {
            _id: tenantId,
            name: `${payment.tenant.name}`,
            email: payment.tenant.email,
            phone: payment.tenant.phone,
            propertyId: payment.property._id,
            propertyName: payment.property.name,
            paymentHistory: [],
            totalPaidAmount: 0,
            lastPaymentDate: null
          });
        }
        
        const tenant = tenantMap.get(tenantId);
        tenant.paymentHistory.push(payment);
        tenant.totalPaidAmount += payment.amount;
        tenant.lastPaymentDate = new Date(payment.paymentDate);
      });

      // Convert map to array and sort by last payment date
      const tenantsArray = Array.from(tenantMap.values());
      tenantsArray.sort((a, b) => b.lastPaymentDate - a.lastPaymentDate);
      
      setTenants(tenantsArray);
      setError(null);
    } catch (err) {
      console.error('Error fetching tenant payments:', err);
      setError('Failed to fetch tenant payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantPayments();
  }, []);

  // Handle payment creation
  const handleCreatePayment = async () => {
    try {
      if (!selectedTenant) {
        setError('Please select a tenant first');
        return;
      }

      const payment = await rentPaymentService.createRentPayment({
        tenant: selectedTenant._id, 
        property: selectedTenant.propertyId,
        amount: paymentData.amount,
        rentPeriod: paymentData.rentPeriod,
        paymentDate: paymentData.paymentDate,
        paymentMethod: paymentData.paymentMethod, 
        notes: paymentData.notes,
        status: paymentData.status
      });

      // Refresh the list
      await fetchTenantPayments();
      setOpenDialog(false);
      setPaymentData({
        amount: '',
        rentPeriod: '',
        paymentMethod: '',
        paymentDate: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
        status: ''
      });
    } catch (err) {
      console.error('Error creating payment:', err);
      // Check for specific error types
      if (err.response?.data?.message === 'A payment for this period already exists') {
        setError('A payment for this rent period already exists. Please check the payment history or choose a different period.');
      } else {
        setError(err.message || 'Failed to create payment');
      }
    }
  };

  // Handle dialog open/close
  const handleOpenDialog = (tenant) => {
    setSelectedTenant(tenant);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTenant(null);
    setPaymentData({
      amount: '',
      rentPeriod: '',
      paymentMethod: '',
      paymentDate: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
      status: ''
    });
  };

  // Handle payment data changes
  const handlePaymentDataChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle tenant expansion
  const toggleTenantExpansion = (tenantId) => {
    setExpandedTenant(expandedTenant === tenantId ? null : tenantId);
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
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Tenant Payment History
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tenant</TableCell>
              <TableCell>Property</TableCell>
              <TableCell align="right">Total Paid</TableCell>
              <TableCell>Last Payment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.map((tenant) => (
              <React.Fragment key={tenant._id}>
                <TableRow>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <IconButton
                        size="small"
                        onClick={() => toggleTenantExpansion(tenant._id)}
                      >
                        {expandedTenant === tenant._id ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                      <Box>
                        <Typography variant="subtitle1">{tenant.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {tenant.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{tenant.propertyName}</TableCell>
                  <TableCell align="right">
                    ${tenant.totalPaidAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {tenant.lastPaymentDate && format(tenant.lastPaymentDate, 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenDialog(tenant)}
                    >
                      Add Payment
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                    <Collapse in={expandedTenant === tenant._id} timeout="auto" unmountOnExit>
                      <Box margin={1}>
                        <Typography variant="h6" gutterBottom component="div">
                          Payment History
                        </Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Period</TableCell>
                              <TableCell align="right">Amount</TableCell>
                              <TableCell>Method</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {tenant.paymentHistory
                              .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
                              .map((payment) => (
                                <TableRow key={payment._id}>
                                  <TableCell>
                                    {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                                  </TableCell>
                                  <TableCell>{payment.rentPeriod}</TableCell>
                                  <TableCell align="right">
                                    ${payment.amount.toLocaleString()}
                                  </TableCell>
                                  <TableCell>{payment.paymentMethod}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={payment.status}
                                      color={payment.status === 'Completed' ? 'success' : 'default'}
                                      size="small"
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Payment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Payment</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={paymentData.amount}
              onChange={handlePaymentDataChange}
              required
              fullWidth
            />
            <TextField
              label="Rent Period"
              name="rentPeriod"
              value={paymentData.rentPeriod}
              onChange={handlePaymentDataChange}
              required
              fullWidth
              helperText="Format: Month/Year (e.g., March/2024)"
            />
            <TextField
              label="Payment Method"
              name="paymentMethod"
              select
              value={paymentData.paymentMethod}
              onChange={handlePaymentDataChange}
              required
              fullWidth
            >
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
              <MenuItem value="Check">Check</MenuItem>
              <MenuItem value="Online Payment">Online Payment</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
            <TextField
              label="Payment Date"
              name="paymentDate"
              type="date"
              value={paymentData.paymentDate}
              onChange={handlePaymentDataChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Notes"
              name="notes"
              value={paymentData.notes}
              onChange={handlePaymentDataChange}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Status"
              name="status"
              value={paymentData.status}
              onChange={handlePaymentDataChange}
              required
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleCreatePayment}
            variant="contained"
            color="primary"
            disabled={!paymentData.amount || !paymentData.rentPeriod || !paymentData.paymentMethod || !paymentData.status}
          >
            Create Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenantPaymentList; 