import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Select, 
  MenuItem, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Modal,
  IconButton
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import './Expenses.css'

const FinancialExpenses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expense, setExpense] = useState({
    expenseType: '',
    amount: '',
    date: '',
    description: '',
    propertyId: '',
    paymentMethod: ''
  });

  const [expenseList, setExpenseList] = useState([]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpense(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddExpense = () => {
    if (expense.expenseType && expense.amount && expense.date) {
      setExpenseList([...expenseList, { ...expense, id: Date.now() }]);
      // Reset form after adding
      setExpense({
        expenseType: '',
        amount: '',
        date: '',
        description: '',
        propertyId: '',
        paymentMethod: ''
      });
      handleCloseModal();
    }
  };

  // Expense types based on the requirements
  const expenseTypes = [
    { value: 'Electricity', label: 'Electricity' },
    { value: 'Water', label: 'Water' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Taxes', label: 'Taxes' },
    { value: 'Other', label: 'Other' }
  ];

  const paymentMethods = [
    { value: 'Cash', label: 'Cash' },
    { value: 'Bank', label: 'Bank Transfer' },
    { value: 'Online', label: 'Online Payment' },
    { value: 'Check', label: 'Check' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Financial Management - Expenses</Typography>
        <Button 
          variant="contained" 
          color="error" 
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
        >
          Add Expense
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Expense Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Property ID</TableCell>
              <TableCell>Payment Method</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenseList.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.expenseType}</TableCell>
                <TableCell>${item.amount}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.propertyId}</TableCell>
                <TableCell>{item.paymentMethod}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box 
          sx={{
            width: '90%',
            maxWidth: 600,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            position: 'relative'
          }}
        >
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500]
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" gutterBottom>
            Add New Expense Entry
          </Typography>
          
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Select
              name="expenseType"
              value={expense.expenseType}
              onChange={handleInputChange}
              displayEmpty
              fullWidth
            >
              <MenuItem value="" disabled>Select Expense Type</MenuItem>
              {expenseTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>

            <TextField
              name="amount"
              label="Amount"
              type="number"
              value={expense.amount}
              onChange={handleInputChange}
              fullWidth
            />

            <TextField
              name="date"
              label="Transaction Date"
              type="date"
              value={expense.date}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              name="description"
              label="Description (Optional)"
              value={expense.description}
              onChange={handleInputChange}
              fullWidth
            />

            <TextField
              name="propertyId"
              label="Property ID"
              value={expense.propertyId}
              onChange={handleInputChange}
              fullWidth
            />

            <Select
              name="paymentMethod"
              value={expense.paymentMethod}
              onChange={handleInputChange}
              displayEmpty
              fullWidth
            >
              <MenuItem value="" disabled>Select Payment Method</MenuItem>
              {paymentMethods.map((method) => (
                <MenuItem key={method.value} value={method.value}>
                  {method.label}
                </MenuItem>
              ))}
            </Select>

            <Button 
              variant="contained" 
              color="error" 
              onClick={handleAddExpense}
            >
              Add Expense
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default FinancialExpenses;