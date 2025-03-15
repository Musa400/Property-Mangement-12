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
import './Income.css'

const FinancialManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [income, setIncome] = useState({
    incomeType: '',
    amount: '',
    date: '',
    description: '',
    propertyId: '',
    paymentMethod: ''
  });

  const [incomeList, setIncomeList] = useState([]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setIncome(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddIncome = () => {
    if (income.incomeType && income.amount && income.date) {
      setIncomeList([...incomeList, { ...income, id: Date.now() }]);
      // Reset form after adding
      setIncome({
        incomeType: '',
        amount: '',
        date: '',
        description: '',
        propertyId: '',
        paymentMethod: ''
      });
      handleCloseModal();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Financial Management - Income</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
        >
          Add Income
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Income Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Property ID</TableCell>
              <TableCell>Payment Method</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incomeList.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.incomeType}</TableCell>
                <TableCell>{item.amount}</TableCell>
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
            Add New Income Entry
          </Typography>
          
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Select
              name="incomeType"
              value={income.incomeType}
              onChange={handleInputChange}
              displayEmpty
            >
              <MenuItem value="" disabled>Select Income Type</MenuItem>
              <MenuItem value="Rent">Rent</MenuItem>
              <MenuItem value="Services">Services</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>

            <TextField
              name="amount"
              label="Amount"
              type="number"
              value={income.amount}
              onChange={handleInputChange}
              fullWidth
            />

            <TextField
              name="date"
              label="Transaction Date"
              type="date"
              value={income.date}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              name="description"
              label="Description (Optional)"
              value={income.description}
              onChange={handleInputChange}
              fullWidth
            />

            <TextField
              name="propertyId"
              label="Property ID"
              value={income.propertyId}
              onChange={handleInputChange}
              fullWidth
            />

            <Select
              name="paymentMethod"
              value={income.paymentMethod}
              onChange={handleInputChange}
              displayEmpty
            >
              <MenuItem value="" disabled>Select Payment Method</MenuItem>
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Bank">Bank</MenuItem>
              <MenuItem value="Online">Online</MenuItem>
              <MenuItem value="Check">Check</MenuItem>
            </Select>

            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleAddIncome}
            >
              Add Income
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default FinancialManagement;