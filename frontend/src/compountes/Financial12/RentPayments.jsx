import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Modal, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText,
  DialogActions,  
  InputAdornment,
  CircularProgress,
  IconButton,  
  Tooltip,
  Chip,
  Snackbar,
  Alert,
  Divider,
  Grid
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Add as AddIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  ErrorOutline as ErrorOutlineIcon,
  SentimentDissatisfied as SentimentDissatisfiedIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import './RentPayment.css';
import tenantService from '../../services/tenantService';
import rentPaymentService from '../../services/rentPaymentService';
import propertyService from '../../services/propertyService';
import RentPaymentReceipt from './RentPaymentReceipt';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const RentPayments = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Add userRole state
  const [userRole, setUserRole] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Form states
  const [tenantName, setTenantName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [rentPeriod, setRentPeriod] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');

  // Reference data states
  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [tenantId, setTenantId] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Payment history states
  const [paymentHistoryState, setPaymentHistoryState] = useState({
    isModalOpen: false,
    selectedTenantHistory: [],
    page: 0,
    rowsPerPage: 10
  });

  // New state for tenant details modal
  const [selectedTenantDetails, setSelectedTenantDetails] = useState(null);
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);

  // New state for delete confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  const [filteredRentPayments, setFilteredRentPayments] = useState([]);

  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);

  // Add the missing rentPaymentsList state
  const [rentPaymentsList, setRentPaymentsList] = useState([]);

  // Add these state variables near the top with other state declarations
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  // Add this near the other state declarations
  const [showMonthsDialog, setShowMonthsDialog] = useState(false);
  const [paidMonths, setPaidMonths] = useState([]);

  // Add useEffect to initialize userRole
  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const userData = JSON.parse(userString);
        setUserRole(userData.userType || '');
        
        // If user is a tenant, automatically set their information
        if (userData.userType === 'tenant' && userData.id) {
          const currentTenant = tenants.find(t => t._id === userData.id);
          if (currentTenant) {
            handleTenantSelect(currentTenant);
          }
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUserRole('');
      }
    }
  }, [tenants]); // Add tenants as dependency

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Starting data fetch...');

        const [fetchedTenants, fetchedProperties] = await Promise.all([
          tenantService.getAllTenants(),
          propertyService.getAllProperties() 
        ]);
        
        console.log('Fetched Tenants:', fetchedTenants);
        console.log('Fetched Properties:', fetchedProperties); 

        setTenants(fetchedTenants);
        setProperties(fetchedProperties); 
        
        setLoading(false);
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError(error.message);
        setLoading(false);
        setProperties([]); 
      }
    };

    fetchData();
  }, []);

  // Fetch rent payments with comprehensive error handling
  const fetchRentPayments = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      if (!token || !user) {
        console.error('Authentication required: No token or user found');
        setError('Please log in to view rent payments.');
        navigate('/login');
        return;
      }

      const response = await rentPaymentService.getRentPayments();
      console.log('Rent Payments Response:', response);
      
      // Handle different response structures
      if (response && response.rentPayments) {
        // If response has rentPayments directly
        setRentPaymentsList(response.rentPayments);
      } else if (response && response.payments) {
        // If response has payments array
        setRentPaymentsList(response.payments);
      } else if (Array.isArray(response)) {
        // If response is an array
        setRentPaymentsList(response);
      } else {
        console.error('Invalid response format:', response);
        setError('Failed to load rent payments. Invalid response format.');
      }
      
    } catch (error) {
      console.error('Error fetching rent payments:', error);
      
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        setError('Failed to fetch rent payments. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchRentPayments();
  }, []);

  useEffect(() => {
    console.log('Current rentPaymentsList state:', rentPaymentsList);
  }, [rentPaymentsList]);

  useEffect(() => {
    document.addEventListener('globalPaymentStatusUpdate', handleGlobalPaymentStatusUpdate);

    return () => {
      document.removeEventListener('globalPaymentStatusUpdate', handleGlobalPaymentStatusUpdate);
    };
  }, []);

  useEffect(() => {
    console.log('Tenants Data:', tenants.map(tenant => ({
      id: tenant._id,
      fullName: `${tenant.firstName} ${tenant.lastName}`,
      propertyId: tenant.propertyId
    })));

    console.log('Properties Data:', properties.map(property => ({
      id: property._id,
      address: property.address
    })));
  }, [tenants, properties]);

  // Function to handle global payment status updates
  const handleGlobalPaymentStatusUpdate = useCallback((event) => {
    const { tenantName, newStatus } = event.detail;
    
    console.log('Global Payment Status Update Received:', { tenantName, newStatus });

    setRentPaymentsList(prevPayments => 
      prevPayments.map(payment => 
        payment.tenantName === tenantName 
          ? { ...payment, paymentStatus: newStatus } 
          : payment
      )
    );
  }, []);

  useEffect(() => {
    // Add event listener for global payment status updates
    document.addEventListener('globalPaymentStatusUpdate', handleGlobalPaymentStatusUpdate);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('globalPaymentStatusUpdate', handleGlobalPaymentStatusUpdate);
    };
  }, [handleGlobalPaymentStatusUpdate]);

  // Fetch tenant payment history
  const fetchTenantPaymentHistory = async (tenantId) => {
    if (!tenantId) {
      console.error('No tenant ID provided for payment history fetch');
      return;
    }

    console.group('🔍 Tenant Payment History Fetch');
    console.log('Attempting to fetch payment history for Tenant ID:', tenantId);

    try {
      const history = await rentPaymentService.getTenantPaymentHistory(tenantId);
      
      console.log('Fetched Tenant Payment History:', history);
      
      setPaymentHistoryState({
        selectedTenantHistory: history.transactions || []
      });
    } catch (error) {
      console.error('Error fetching tenant payment history:', {
        tenantId,
        errorMessage: error.message,
        errorResponse: error.response?.data,
        errorStatus: error.response?.status
      });

      // Show user-friendly error notification
      enqueueSnackbar('Unable to retrieve tenant payment history', { variant: 'error' });
    } finally {
      console.groupEnd();
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Paid': return 'success';
      case 'Overdue': return 'error';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  const renderPropertyId = (propertyId) => {
    if (typeof propertyId === 'object' && propertyId !== null) {
      if (propertyId._id) return propertyId._id;
      if (propertyId.address) return propertyId.address;
      if (propertyId.title) return propertyId.title;
      
      return JSON.stringify(propertyId);
    }
    
    return propertyId || 'No Property';
  };

  const handlePropertyClick = (propertyId) => {
    const validPropertyId = typeof propertyId === 'object' 
      ? propertyId?._id 
      : propertyId;

    if (validPropertyId) {
      navigate(`/property/${validPropertyId}`);
    }
  };

  const updateTenantPaymentStatus = async (tenantName, paymentStatus) => {
    try {
      const tenant = tenants.find(t => `${t.firstName} ${t.lastName}` === tenantName);
      
      if (tenant) {
        await tenantService.updateTenant(tenant._id, { 
          paymentStatus: paymentStatus 
        });
        
        setTenants(prevTenants => 
          prevTenants.map(t => 
            t._id === tenant._id 
              ? { ...t, paymentStatus: paymentStatus } 
              : t
          )
        );
      }
    } catch (error) {
      console.error('Error updating tenant payment status:', error);
    }
  };

  // Payment method options
  const paymentMethodOptions = [
    { value: 'Cash', label: 'Cash' },
    { value: 'Bank Paid', label: 'Bank Paid' }
  ];

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'tenantName':
        setTenantName(value);
        break;
      case 'rentAmount':
        setRentAmount(value);
        break;
      case 'rentPeriod':
        setRentPeriod(value);
        break;
      case 'paymentMethod':
        setPaymentMethod(value);
        break;
      case 'propertyAddress':
        setPropertyAddress(value);
        break;
      default:
        break;
    }
  };

  // Helper function to extract payments from state
  const extractPayments = (rentPaymentsList) => {
    console.log('Extracting payments from:', rentPaymentsList);
    
    // Handle different possible structures
    if (Array.isArray(rentPaymentsList)) {
      console.log('Found direct array of payments');
      return rentPaymentsList;
    }
    
    if (rentPaymentsList?.payments) {
      console.log('Found payments in nested structure');
      return rentPaymentsList.payments;
    }
    
    if (rentPaymentsList?.rentPayments) {
      console.log('Found rentPayments in nested structure');
      return rentPaymentsList.rentPayments;
    }
    
    console.log('No valid payment structure found');
    return [];
  };

  const availableTenants = useMemo(() => {
    if (!rentPeriod) return tenants;
    
    // Use the new extraction method
    const payments = extractPayments(rentPaymentsList);
    
    return tenants.filter(tenant => {
      const fullName = `${tenant.firstName} ${tenant.lastName}`.trim();
      const isPaidOrOverdueForPeriod = payments.some(
        payment => 
          (payment.tenantName === fullName || 
           payment.tenantDisplayName === fullName) && 
          payment.rentPeriod === rentPeriod &&
          (payment.paymentStatus === 'Paid' || payment.paymentStatus === 'Overdue')
      );
      return !isPaidOrOverdueForPeriod;
    });
  }, [tenants, rentPeriod, rentPaymentsList]);

  const getPropertiesForTenant = (tenantName) => {
    console.group('🔍 Property Selection Diagnostics');
    console.log('Selected Tenant Name:', tenantName);
    
    // Find the tenant with multiple matching strategies
    const matchingTenants = tenants.filter(tenant => 
      `${tenant.firstName} ${tenant.lastName}` === tenantName ||
      `${tenant.lastName} ${tenant.firstName}` === tenantName 
      
    );

    console.log('Matching Tenants:', matchingTenants);

    if (matchingTenants.length === 0) {
      console.warn('❌ No tenant found matching the name');
      console.groupEnd();
      return [];
    }

    // Collect properties for all matching tenants
    const tenantProperties = matchingTenants.flatMap(tenant => {
      // Handle different property ID formats
      const tenantPropertyId = 
        // If propertyId is an object with _id, use that
        tenant.propertyId?._id || 
        // If propertyId is a string, use it directly
        tenant.propertyId || 
        // Fallback to null if no property ID found
        null;

      console.log('Tenant Property ID Processing:', {
        originalPropertyId: tenant.propertyId,
        processedPropertyId: tenantPropertyId
      });

      // Find properties matching the processed property ID
      return properties.filter(property => {
        const isMatch = property._id === tenantPropertyId;
        console.log('Property Match Check:', {
          propertyId: property._id,
          tenantPropertyId: tenantPropertyId,
          isMatch: isMatch
        });
        return isMatch;
      });
    });

    console.log('Final Tenant Properties:', tenantProperties);

    if (tenantProperties.length === 0) {
      console.warn('❌ No properties found for matching tenants');
    }

    console.groupEnd();
    return tenantProperties;
  };

  const handlePropertyChange = (event) => {
    const selectedPropertyId = event.target.value;
    setSelectedPropertyId(selectedPropertyId);
    const selectedProperty = properties.find(property => property._id === selectedPropertyId);
    if (selectedProperty) {
      setPropertyAddress(selectedProperty.address);
      setSelectedProperty(selectedPropertyId);
    }
  };

  const renderPropertyDropdown = () => {
    // Get properties for the selected tenant
    const tenantProperties = getPropertiesForTenant(tenantName);

    if (tenantProperties.length === 0) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          p: 2,
          border: '1px solid red',
          borderRadius: 2
        }}>
          <Typography color="error" variant="h6" align="center" sx={{ mb: 2 }}>
            Property Selection Issue
          </Typography>
          <Typography color="error" variant="body1" align="center">
            No properties found for "{tenantName}"
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            Possible reasons:
            - Tenant not assigned to a property
            - Property data not loaded
            - Incorrect tenant name
          </Typography>
          <Button 
            variant="outlined" 
            color="error" 
            sx={{ mt: 2 }}
            onClick={() => {
              console.log('Current Tenants:', tenants);
              console.log('Current Properties:', properties);
            }}
          >
            Show Diagnostic Info
          </Button>
        </Box>
      );
    }

    return (
      <Select
        fullWidth
        label="Property"
        value={selectedPropertyId}
        onChange={handlePropertyChange}
        required
      >
        {tenantProperties.map((property) => (
          <MenuItem key={property._id} value={property._id}>
            {property.address}
          </MenuItem>
        ))}
      </Select>
    );
  };

  // Helper function to extract tenant name
  const extractTenantName = (payment) => {
    console.log('🔍 Extracting Tenant Name from Payment:', payment);

    let tenantName;

    // Direct tenantName and tenantDisplayName checks
    tenantName = payment.tenantName;
    console.log('✅ Tenant Name from direct tenantName:', tenantName);
    if (!tenantName) {
        tenantName = payment.tenantDisplayName;
        console.log('✅ Tenant Name from direct tenantDisplayName:', tenantName);
    }

    // Check tenant object with first and last name
    if (!tenantName && payment.tenant) {
        console.log('🕵️ Examining Tenant Object:', payment.tenant);
        const firstName = payment.tenant.firstName || '';
        const lastName = payment.tenant.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        if (fullName) {
            tenantName = fullName;
            console.log('✅ Tenant Name from first/last name:', tenantName);
        }
    }

    // Fallback to username or email
    if (!tenantName && payment.tenant) {
        tenantName = payment.tenant.username || payment.tenant.email;
        console.log('✅ Tenant Name from username/email:', tenantName);
    }

    // Fallback to property-level information
    if (!tenantName && payment.property) {
        console.log('🏠 Examining Property Object:', payment.property);
        tenantName = payment.property.tenantName || 
            (payment.property.tenant?.firstName && payment.property.tenant?.lastName 
                ? `${payment.property.tenant.firstName} ${payment.property.tenant.lastName}`.trim() 
                : null);
        console.log('✅ Tenant Name from property:', tenantName);
    }

    // Aggressive fallback strategies
    if (!tenantName) {
        const constructedName = [
            payment.tenant?.firstName,
            payment.tenant?.lastName,
            payment.tenant?.username,
            payment.tenant?.email?.split('@')[0]
        ].filter(Boolean).join(' ').trim();

        if (constructedName) {
            tenantName = constructedName;
            console.log('✅ Tenant Name from aggressive construction:', tenantName);
        }
    }

    // Final fallback with extensive logging
    if (!tenantName) {
        console.warn('⚠️ NO TENANT NAME FOUND');
        console.log('Fallback Diagnostic Information:', {
            hasDirectTenantName: !!payment.tenantName,
            hasTenantDisplayName: !!payment.tenantDisplayName,
            hasTenantObject: !!payment.tenant,
            hasPropertyObject: !!payment.property
        });
    }

    // Final fallback
    tenantName = tenantName || 'Unknown Tenant';

    console.log('🏁 FINAL Extracted Tenant Name:', tenantName);
    return tenantName;
  };

  const safePrepareRentPaymentsList = useCallback(() => {
    console.group('🔍 Tenant Payment History Management');
    console.log('📋 Original Payments List:', rentPaymentsList);

    // Extract rentPayments array
    const paymentsArray = extractPayments(rentPaymentsList);
    console.log('Extracted payments array:', paymentsArray);

    // Comprehensive tenant payment tracking
    const tenantPaymentHistoryMap = new Map();
    const processedPaymentIds = new Set();
    const processedPaymentKeys = new Set();

    // Detailed payment processing
    paymentsArray.forEach(payment => {
      // Create a comprehensive unique key for duplicate detection
      const paymentKey = `${payment.tenant?._id || payment.tenant}-${payment.amount}-${payment.rentPeriod}-${new Date(payment.paymentDate).toDateString()}`;

      // Skip already processed payments
      if (processedPaymentIds.has(payment._id) || processedPaymentKeys.has(paymentKey)) {
        console.log('🚫 Duplicate Payment Detected:', {
          id: payment._id,
          key: paymentKey
        });
        return;
      }

      // Extract tenant name with comprehensive strategy
      const tenantName = extractTenantName(payment);

      // Initialize tenant payment history if not exists
      if (!tenantPaymentHistoryMap.has(tenantName)) {
        tenantPaymentHistoryMap.set(tenantName, {
          payments: [],
          totalAmount: 0
        });
      }

      // Get tenant's payment history
      const tenantHistory = tenantPaymentHistoryMap.get(tenantName);

      // Comprehensive duplicate detection
      const isDuplicate = tenantHistory.payments.some(existingPayment => 
        existingPayment._id === payment._id ||
        (
          existingPayment.amount === payment.amount &&
          existingPayment.rentPeriod === payment.rentPeriod &&
          new Date(existingPayment.paymentDate).toDateString() === 
          new Date(payment.paymentDate).toDateString()
        )
      );

      // Process unique payment
      if (!isDuplicate) {
        // Create processed payment object
        const processedPayment = {
          ...payment,
          tenantName,
          tenantDisplayName: tenantName,
          paymentKey
        };

        // Add to tenant's payment history
        tenantHistory.payments.push(processedPayment);
        tenantHistory.totalAmount += payment.amount;

        // Track processed payment
        processedPaymentIds.add(payment._id);
        processedPaymentKeys.add(paymentKey);
      }
    });

    // Compile final payments list, preserving full history
    const consolidatedPayments = [];
    tenantPaymentHistoryMap.forEach((history, tenantName) => {
      // Sort payments chronologically (oldest to newest)
      const sortedTenantPayments = history.payments.sort(
        (a, b) => new Date(a.paymentDate) - new Date(b.paymentDate)
      );

      consolidatedPayments.push(...sortedTenantPayments);
    });

    console.log('✅ Consolidated Payments:', consolidatedPayments);
    console.log('📊 Processing Details:', {
      originalListLength: paymentsArray.length,
      consolidatedPaymentsLength: consolidatedPayments.length,
      uniqueTenants: tenantPaymentHistoryMap.size,
      uniqueTransactions: processedPaymentIds.size
    });
    console.groupEnd();

    return consolidatedPayments;
  }, [rentPaymentsList]);

  useEffect(() => {
    const validPayments = safePrepareRentPaymentsList();
    
    // Additional logging to track state changes
    console.log('Current Rent Payments List State:', {
      originalListLength: rentPaymentsList?.payments?.length || 0,
      validPaymentsLength: validPayments.length
    });

    // Update the filtered payments state
    setFilteredRentPayments(validPayments);
  }, [rentPaymentsList, safePrepareRentPaymentsList]);

  // Utility function to format payment method
  const formatPaymentMethod = (method) => {
    if (!method) return 'Not Specified';
    
    // Handle special cases like 'CREDIT_CARD' or 'BANK_TRANSFER'
    const formattedMethod = method
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    return formattedMethod;
  };

  // Function to handle opening tenant details modal or navigating to tenant page
  const handleOpenTenantDetails = async (tenantName) => {
    try {
      setIsTenantModalOpen(true);
      setSelectedTenantDetails(null); // Reset details while loading

      // Find tenant in the existing tenants list
      const tenant = tenants.find(t => 
        `${t.firstName} ${t.lastName}` === tenantName.trim()
      );
      
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Fetch full tenant details
      const response = await tenantService.getTenantById(tenant._id);
      if (!response) {
        throw new Error('Failed to fetch tenant details');
      }

      setSelectedTenantDetails(response);
    } catch (error) {
      console.error('Error fetching tenant details:', error);
      enqueueSnackbar(
        `Error loading tenant details: ${error.message}`, 
        { variant: 'error' }
      );
      handleCloseTenantDetailsModal();
    }
  };

  // Function to close tenant details modal
  const handleCloseTenantDetailsModal = () => {
    setIsTenantModalOpen(false);
    setSelectedTenantDetails(null);
  };

  // Function to handle viewing rent payment details for a specific tenant
  const handleViewRentPayment = async (payment) => {
    try {
      console.log('📊 Viewing Rent Payment Details');
      console.log('📋 Tenant Details:', payment);

      // Reset any existing payment history
      setPaymentHistory([]);
      
      // Get tenant payment history
      const history = await rentPaymentService.getTenantPaymentHistory(payment.tenant._id, {
        page: 1,
        limit: 50,
        sortBy: 'paymentDate',
        sortOrder: 'desc'
      });

      console.log('📋 Payment History:', history);

      // Filter out the deleted payment from history if it exists
      const filteredHistory = history.paymentTransactions?.filter(
        transaction => transaction._id !== payment._id
      ) || [];

      // Update state with payment details and filtered history
      setSelectedPayment(payment);
      setPaymentHistory(filteredHistory);
      setShowPaymentDetails(true);

      // Show success message if history was found
      if (filteredHistory.length > 0) {
        enqueueSnackbar('Payment history loaded successfully', {
          variant: 'success',
          autoHideDuration: 3000
        });
      } else {
        enqueueSnackbar('No payment history found for this tenant', {
          variant: 'info',
          autoHideDuration: 3000
        });
      }
    } catch (error) {
      console.error('❌ Error Fetching Payment History');
      console.error(' Detailed Error:', {
        message: error.message,
        tenantName: payment.tenant?.name || 'Unknown Tenant',
        fullError: error,
        errorStack: error.stack
      });

      // Reset states on error
      setPaymentHistory([]);
      setSelectedPayment(null);
      setShowPaymentDetails(false);

      // Show error message to user
      enqueueSnackbar('Failed to load payment history. Please try again.', {
        variant: 'error',
        autoHideDuration: 5000
      });
    }
  };

  const handlePaymentHistoryPageChange = (event, newPage) => {
    setPaymentHistoryState(prev => ({ ...prev, page: newPage }));
  };

  const handlePaymentHistoryRowsPerPageChange = (event) => {
    setPaymentHistoryState(prev => ({ ...prev, rowsPerPage: parseInt(event.target.value, 10) }));
    setPaymentHistoryState(prev => ({ ...prev, page: 0 }));
  };

  const handleClosePaymentHistoryModal = () => {
    setPaymentHistoryState(prev => ({ ...prev, isModalOpen: false }));
    setPaymentHistoryState(prev => ({ ...prev, selectedTenantHistory: [] }));
  };

  // Function to handle printing payment history
  const handlePrintPaymentHistory = () => {
    // Calculate total amount
    const totalAmount = paymentHistoryState.selectedTenantHistory.reduce(
      (total, payment) => total + (payment?.amount || 0), 0
    );

    // Get tenant name from the first transaction
    const tenantName = paymentHistoryState.selectedTenantHistory.length > 0 
      ? `${paymentHistoryState.selectedTenantHistory[0].tenant?.firstName || ''} ${paymentHistoryState.selectedTenantHistory[0].tenant?.lastName || ''}`.trim() 
      : 'Unknown Tenant';

    // Get property name from the first transaction
    const propertyName = paymentHistoryState.selectedTenantHistory.length > 0 
      ? paymentHistoryState.selectedTenantHistory[0].property?.address || 'Unknown Property'
      : 'Unknown Property';

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Construct HTML for printing
    const printContent = `
      <html>
        <head>
          <title>Payment History for ${tenantName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            h1 { 
              text-align: center; 
              color: #333; 
              margin-bottom: 30px;
            }
            .header-info {
              margin-bottom: 20px;
              padding: 10px;
              background-color: #f5f5f5;
              border-radius: 5px;
            }
            .header-info p {
              margin: 5px 0;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f2f2f2; 
              font-weight: bold; 
            }
            .total-section {
              text-align: right;
              margin-top: 20px;
              padding: 15px;
              background-color: #f8f8f8;
              border-radius: 5px;
            }
            .total-amount {
              font-size: 1.2em;
              font-weight: bold;
              color: #2e7d32;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
            }
            @media print {
              body { margin: 0; }
              table { page-break-inside: avoid; }
              .header-info, .total-section {
                background-color: white !important;
                border: 1px solid #ddd;
              }
            }
          </style>
        </head>
        <body>
          <h1>Payment History Report</h1>
          
          <div class="header-info">
            <p><strong>Tenant:</strong> ${tenantName}</p>
            <p><strong>Property:</strong> ${propertyName}</p>
            <p><strong>Generated Date:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Period</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${paymentHistoryState.selectedTenantHistory
                .sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate))
                .map(payment => `
                <tr>
                  <td>${new Date(payment.paymentDate).toLocaleDateString()}</td>
                  <td>$${payment.amount?.toFixed(2) || '0.00'}</td>
                  <td>${payment.rentPeriod || 'Not Set'}</td>
                  <td>${formatPaymentMethod(payment.paymentMethod)}</td>
                  <td>${payment.status || 'Completed'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <p><strong>Total Amount Paid:</strong> <span class="total-amount">$${totalAmount.toFixed(2)}</span></p>
          </div>

          <div class="footer">
            <p>This is a computer-generated report. No signature is required.</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;

    // Write content to print window
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Trigger print dialog
    printWindow.print();
  };

  const handlePrintTotalPaid = () => {
    const printContent = `Total Paid: ${paymentHistoryState.selectedTenantHistory.reduce(
      (total, payment) => total + (payment?.amount || 0), 0
    ).toFixed(2)}`;
    const newWindow = window.open('', '_blank');
    newWindow.document.write('<html><head><title>Print</title></head><body>');
    newWindow.document.write('<pre>' + printContent + '</pre>');
    newWindow.document.write('</body></html>');
    newWindow.print();
  };

  // Function to handle delete confirmation
  const handleDeletePayment = async () => {
    if (!paymentToDelete) {
      console.error('No payment selected for deletion');
      return;
    }

    try {
      // Reset any previous errors
      setError(null);

      // Call delete service method
      await rentPaymentService.deleteRentPayment(paymentToDelete._id);

      // Clear all payment history states
      setPaymentHistory([]);
      setPaymentHistoryState(prev => ({
        ...prev,
        selectedTenantHistory: [],
        isModalOpen: false
      }));

      // Update rent payments list by removing the deleted payment
      setRentPaymentsList(prevPayments => {
        const updatedPayments = Array.isArray(prevPayments) 
          ? prevPayments.filter(payment => payment._id !== paymentToDelete._id)
          : prevPayments.rentPayments?.filter(payment => payment._id !== paymentToDelete._id) || [];
        
        return Array.isArray(prevPayments) ? updatedPayments : { ...prevPayments, rentPayments: updatedPayments };
      });

      // Update filtered payments list
      setFilteredRentPayments(prevPayments => 
        prevPayments.filter(payment => payment._id !== paymentToDelete._id)
      );

      // Close all modals
      setIsDeleteModalOpen(false);
      setShowPaymentDetails(false);
      setShowMonthsDialog(false);
      setIsTenantModalOpen(false);

      // Reset all related states
      setPaymentToDelete(null);
      setSelectedPayment(null);
      setPaidMonths([]);
      setSelectedTenantDetails(null);

      // Show success message
      enqueueSnackbar('Payment and associated history deleted successfully', { 
        variant: 'success',
        autoHideDuration: 3000
      });

      // Refresh the payments list
      await fetchRentPayments();

    } catch (error) {
      console.error('Payment Deletion Error:', error);
      
      if (error.response?.status === 404) {
        enqueueSnackbar('Payment not found', { 
          variant: 'error',
          autoHideDuration: 3000
        });
      } else if (error.response?.status === 403) {
        enqueueSnackbar('You are not authorized to delete this payment', { 
          variant: 'error',
          autoHideDuration: 3000
        });
      } else {
        enqueueSnackbar(error.message || 'Failed to delete payment', { 
          variant: 'error',
          autoHideDuration: 6000
        });
      }
    }
  };

  // Function to open delete confirmation modal
  const handleOpenDeleteModal = (payment) => {
    setPaymentToDelete(payment);
    setIsDeleteModalOpen(true);
  };

  // Function to close delete confirmation modal
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPaymentToDelete(null);
  };

  const handleViewPaymentHistory = () => {
    navigate('/financial-rent/payment-history');
  };

  const renderRentPaymentsContent = () => {
    // If loading, show loading indicator
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      );
    }

    // If error, show error message
    if (error) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="300px">
          <ErrorOutlineIcon color="error" style={{ fontSize: 80, marginBottom: 16 }} />
          <Typography variant="h6" color="error">
            Failed to Load Rent Payments
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {error.message || 'An unexpected error occurred'}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => window.location.reload()}
            style={{ marginTop: 16 }}
          >
            Retry
          </Button>
        </Box>
      );
    }

    // Get user data from localStorage
    const userString = localStorage.getItem('user');
    let userData;
    try {
      userData = JSON.parse(userString);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="300px">
          <Typography variant="h6" color="error">
            Session Error
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Please log in again to view payments.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/login')}
            style={{ marginTop: 16 }}
          >
            Log In
          </Button>
        </Box>
      );
    }

    // Filter payments based on user role
    const paymentsToShow = filteredRentPayments.filter(payment => {
      if (userData.userType === 'admin') {
        return true; // Admin sees all payments
      }
      
      if (userData.userType === 'tenant') {
        // Tenants see only their own payments
        return payment.tenant?._id === userData.id || 
               payment.tenant === userData.id ||
               payment.createdBy === userData.id;
      }
      
      if (userData.userType === 'property_manager') {
        // Property managers see payments for their managed properties
        return payment.property?.manager === userData.id ||
               payment.createdBy === userData.id;
      }
      
      return false; // Default deny for unknown roles
    });

    if (paymentsToShow.length === 0) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="300px">
          <SentimentDissatisfiedIcon style={{ fontSize: 80, color: '#888' }} />
          <Typography variant="h6" color="textSecondary" style={{ marginTop: 16 }}>
            No Rent Payments Found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {userData.userType === 'admin' 
              ? 'There are no rent payments in the system.'
              : userData.userType === 'tenant'
              ? 'You have no rent payments recorded.'
              : 'No payments found for your managed properties.'}
          </Typography>
        </Box>
      );
    }

    // Render payment table if payments exist
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tenant Name</TableCell>
              <TableCell>Latest Payment</TableCell>
              {userData.userType === 'admin' && <TableCell>Total Amount</TableCell>}
              {userData.userType === 'admin' && <TableCell>Payment History</TableCell>}
              <TableCell>Property</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paymentsToShow.map((item) => (
              <TableRow key={item._id || item.id || Math.random().toString()}>
                <TableCell>
                  {userData.userType === 'admin' ? (
                    <Button 
                      onClick={() => handleOpenTenantDetails(item.tenantName)}
                      style={{ textTransform: 'none' }}
                    >
                      {item.tenantName || 'Unknown Tenant'}
                    </Button>
                  ) : (
                    <Typography>{item.tenantName || 'Unknown Tenant'}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {new Intl.NumberFormat('en-US', { 
                        style: 'currency', 
                        currency: 'USD' 
                      }).format(item.amount || 0)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatPaymentPeriod(item.rentPeriod)}
                    </Typography>
                  </Box>
                </TableCell>
                {userData.userType === 'admin' && (
                  <TableCell>
                    {new Intl.NumberFormat('en-US', { 
                      style: 'currency', 
                      currency: 'USD' 
                    }).format(item.totalAmount || 0)}
                  </TableCell>
                )}
                {userData.userType === 'admin' && (
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {item.paymentCount || 0} payments
                      </Typography>
                    </Box>
                  </TableCell>
                )}
                <TableCell>
                  {item.property?.address || 
                   (typeof item.property === 'string' ? item.property : 'Not Specified')}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={item.status || 'Completed'}
                    color={
                      item.status === 'Completed' ? 'success' :
                      item.status === 'Pending' ? 'warning' :
                      'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton 
                    onClick={() => handleViewRentPayment(item)}
                    color="primary"
                    size="small"
                  >
                    <HistoryIcon />
                  </IconButton>
                  {userData.userType === 'admin' && (
                    <IconButton 
                      onClick={() => handleOpenDeleteModal(item)}
                      color="secondary"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  useEffect(() => {
    if (selectedTenant) {
      fetchTenantPaymentHistory(selectedTenant.id);
    }
  }, [selectedTenant]);

  // Method to open payment history modal
  const handleOpenPaymentHistoryModal = async (tenant) => {
    try {
      // Fetch payment history for the selected tenant
      const paymentHistory = await rentPaymentService.getTenantPaymentHistory(tenant.id);
      
      setPaymentHistoryState({
        isModalOpen: true,
        selectedTenantHistory: paymentHistory.transactions || []
      });
    } catch (error) {
      console.error('Error fetching payment history:', error);
      alert('Failed to fetch payment history');
    }
  };

  // Render payment history modal
  const renderPaymentHistoryModal = () => {
    // Calculate total paid
    const totalPaid = paymentHistoryState.selectedTenantHistory.reduce(
      (total, payment) => total + (payment?.amount || 0), 0
    );

    // Specific tenant name for the title
    const tenantName = paymentHistoryState.selectedTenantHistory.length > 0 
      ? `${paymentHistoryState.selectedTenantHistory[0].tenant?.firstName || ''} ${paymentHistoryState.selectedTenantHistory[0].tenant?.lastName || ''}`.trim() 
      : 'Unknown Tenant';

    // Get property name from the first transaction
    const propertyName = paymentHistoryState.selectedTenantHistory.length > 0 
      ? paymentHistoryState.selectedTenantHistory[0].property?.address || 'Unknown Property'
      : 'Unknown Property';

    return (
      <Dialog
        open={paymentHistoryState.isModalOpen}
        onClose={() => setPaymentHistoryState(prev => ({ ...prev, isModalOpen: false }))}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Payment History of {tenantName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Print Full History">
                <IconButton 
                  onClick={handlePrintPaymentHistory}
                  color="primary"
                  size="small"
                >
                  <PrintIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Print Total Paid">
                <Button 
                  onClick={handlePrintTotalPaid} 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<PrintIcon />}
                  size="small"
                >
                  Print Total
                </Button>
              </Tooltip>
              <IconButton
                aria-label="close"
                onClick={() => setPaymentHistoryState(prev => ({ ...prev, isModalOpen: false }))}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {paymentHistoryState.selectedTenantHistory.length === 0 ? (
            <Typography variant="body2" color="textSecondary" align="center">
              No payment history found
            </Typography>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Period</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paymentHistoryState.selectedTenantHistory
                      .sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate))
                      .map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {new Date(transaction.paymentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          ${transaction.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {formatPaymentPeriod(transaction.rentPeriod)}
                        </TableCell>
                        <TableCell>
                          {formatPaymentMethod(transaction.paymentMethod)}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={transaction.status || 'Completed'}
                            color={
                              transaction.status === 'Completed' ? 'success' : 
                              transaction.status === 'Pending' ? 'warning' : 
                              transaction.status === 'Failed' ? 'error' : 
                              'default'
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                mt: 2, 
                pr: 2,
                alignItems: 'center',
                backgroundColor: '#f0f0f0',
                borderRadius: 2,
                p: 1
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: 'primary.main',
                    mr: 2
                  }}
                >
                  Total Paid:
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: 'success.main',
                    mr: 2
                  }}
                >
                  ${totalPaid.toFixed(2)}
                </Typography>
                <Button 
                  onClick={handlePrintTotalPaid} 
                  variant="contained" 
                  color="primary" 
                  startIcon={<PrintIcon />}
                  size="small"
                >
                  Print Total
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  const handleCloseSuccessSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSuccessSnackbar(false);
  };

  // Method to handle tenant selection
  const handleTenantSelect = (tenant) => {
    console.log('Selected Tenant:', tenant); // Log the selected tenant object
    setSelectedTenant(tenant);
    setTenantName(`${tenant.firstName} ${tenant.lastName}`);
    setTenantId(tenant._id); // Ensure tenant ID is set
    console.log('Tenant ID set to:', tenant._id); // Log the tenant ID being set
  };

  // Method to handle property selection
  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
    setPropertyAddress(property.address);
    setSelectedPropertyId(property._id); // Ensure property ID is set
  };

  // Add a function to close payment details
  const handleClosePaymentDetails = () => {
    setShowPaymentDetails(false);
    setSelectedPayment(null);
    setPaymentHistory([]);
  };

  // Add the payment details modal to the JSX
  const renderPaymentDetailsModal = () => {
    // Calculate total amount from payment history
    const totalAmount = paymentHistory.reduce(
      (total, payment) => total + (payment?.amount || 0), 0
    );

    const handlePrintDetails = () => {
      const printWindow = window.open('', '_blank');
      
      const printContent = `
        <html>
          <head>
            <title>د تادیاتو توضیحات</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 20px; 
              }
              h1, h2 { 
                color: #333; 
                margin-bottom: 20px;
              }
              .header-info {
                margin-bottom: 20px;
                padding: 10px;
                background-color: #f5f5f5;
                border-radius: 5px;
              }
              .header-info p {
                margin: 5px 0;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 20px 0; 
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left; 
              }
              th { 
                background-color: #f2f2f2; 
              }
              .total-section {
                margin-top: 20px;
                padding: 15px;
                background-color: #f8f8f8;
                border-radius: 5px;
                text-align: right;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 0.9em;
                color: #666;
              }
              .signature-section {
                margin-top: 50px;
                display: flex;
                justify-content: space-between;
                padding: 20px 50px;
              }
              .signature-box {
                text-align: center;
                min-width: 200px;
              }
              .signature-line {
                border-top: 1px solid #000;
                margin-top: 40px;
                margin-bottom: 5px;
              }
              .principles-section {
                margin-top: 30px;
                padding: 15px;
                background-color: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 5px;
                direction: rtl;
                text-align: right;
              }
              .principles-list {
                margin: 10px 0;
                padding-right: 20px;
                padding-left: 0;
                list-style-position: inside;
              }
              .principles-list li {
                margin-bottom: 10px;
                font-size: 1.1em;
                line-height: 1.6;
              }
              h3 {
                font-family: Arial, sans-serif;
                color: #333;
                margin-bottom: 15px;
                text-align: right;
              }
              @media print {
                .header-info, .total-section, .principles-section {
                  background-color: white !important;
                  border: 1px solid #ddd;
                }
                .signature-section {
                  page-break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <h1>Payment Details Report</h1>
            
            <div class="header-info">
              <p><strong>Tenant:</strong> ${selectedPayment?.tenantName || 'Unknown Tenant'}</p>
              <p><strong>Property:</strong> ${selectedPayment?.property?.address || 'Not Specified'}</p>
              <p><strong>Current Payment Amount:</strong> $${selectedPayment?.amount?.toFixed(2) || '0.00'}</p>
              <p><strong>Payment Date:</strong> ${selectedPayment ? new Date(selectedPayment.paymentDate).toLocaleDateString() : 'Not Specified'}</p>
              <p><strong>Payment Method:</strong> ${formatPaymentMethod(selectedPayment?.paymentMethod)}</p>
            </div>

            <h2>Payment History</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Period</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${paymentHistory.map(transaction => `
                  <tr>
                    <td>${new Date(transaction.paymentDate).toLocaleDateString()}</td>
                    <td>$${transaction.amount?.toFixed(2) || '0.00'}</td>
                    <td>${formatPaymentPeriod(transaction.rentPeriod)}</td>
                    <td>${formatPaymentMethod(transaction.paymentMethod)}</td>
                    <td>${transaction.status || 'Completed'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="total-section">
              <h3> $${totalAmount.toFixed(2)}ټول تادیه شوی مقدار </h3>
            </div>

            <div class="principles-section">
              <h3 style="text-align: right;">مالي اصول</h3>
              <ol class="principles-list" style="text-align: right; direction: rtl; padding-left: 0; padding-right: 20px;">
                <li>ټول تادیات باید د موافقه شوي شرایطو او شرایطو سره سم ترسره شي.</li>
                <li>د تادیاتو رسیدونه باید د ریکارډ ساتلو لپاره لږترلږه د دریو کلونو لپاره وساتل شي موخې.</li>
                <li>د تادیاتو په اړه هر ډول شخړې باید د لیږد نیټې څخه د 30 ورځو دننه راپور شي.</li>
                <li>ناوخته تادیات ممکن د اضافي فیسونو تابع وي لکه څنګه چې د کرایې په تړون کې مشخص شوي.</li>
                <li>ټولې مالي معاملې باید د محلي بانکدارۍ او املاکو مقرراتو سره مطابقت ولري.</li>
              </ol>
            </div>

            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-line"></div>
                <p>د کرایه کونکي لاسلیک</p>
                <p> _________________:نیټه</p>
              </div>
              <div class="signature-box">
                <div class="signature-line"></div>
                <p>د ملکیت مدیر لاسلیک</p>
                <p> _________________:نیټه</p>
              </div>
            </div>

            <div class="footer">
              <p>Generated on: ${new Date().toLocaleString()}</p>
              <p>This is a computer-generated document.</p>
              <p>Valid with authorized signatures only.</p>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    };

    return (
      <Dialog
        open={showPaymentDetails}
        onClose={handleClosePaymentDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Payment Details</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Print Details">
                <IconButton
                  onClick={handlePrintDetails}
                  color="primary"
                  size="small"
                >
                  <PrintIcon />
                </IconButton>
              </Tooltip>
              <IconButton
                onClick={handleClosePaymentDetails}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedPayment && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Tenant Name
                  </Typography>
                  <Typography>
                    {selectedPayment.tenantName || 'Unknown Tenant'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Property
                  </Typography>
                  <Typography>
                    {selectedPayment.property?.address || 'Not Specified'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Amount
                  </Typography>
                  <Typography>
                    ${selectedPayment.amount?.toFixed(2) || '0.00'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Payment Date
                  </Typography>
                  <Typography>
                    {new Date(selectedPayment.paymentDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Payment Method
                  </Typography>
                  <Typography>
                    {formatPaymentMethod(selectedPayment.paymentMethod) || 'Not Specified'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Payment Status
                  </Typography>
                  <Chip 
                    label={selectedPayment.status || 'Completed'}
                    color={
                      selectedPayment.status === 'Completed' ? 'success' : 
                      selectedPayment.status === 'Pending' ? 'warning' : 
                      selectedPayment.status === 'Failed' ? 'error' : 
                      'default'
                    }
                    size="small"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Payment History
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => {
                      const months = paymentHistory
                        .map(payment => payment.rentPeriod)
                        .filter(Boolean)
                        .sort((a, b) => {
                          const monthOrder = ['حمل', 'ثور', 'جوزا', 'سرطان', 'اسد', 'سنبله', 
                                           'میزان', 'عقرب', 'قوس', 'جدی', 'دلو', 'حوت'];
                          return monthOrder.indexOf(a) - monthOrder.indexOf(b);
                        });
                      const uniqueMonths = [...new Set(months)];
                      setPaidMonths(uniqueMonths);
                      setShowMonthsDialog(true);
                    }}
                  >
                    View Paid Months
                  </Button>
                  <Typography variant="subtitle1" sx={{ color: 'primary.main' }}>
                    Total Transactions: {paymentHistory.length}
                  </Typography>
                </Box>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Period</TableCell>
                      <TableCell>Payment Method</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paymentHistory.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {new Date(transaction.paymentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          ${transaction.amount?.toFixed(2) || '0.00'}
                        </TableCell>
                        <TableCell>{formatPaymentPeriod(transaction.rentPeriod)}</TableCell>
                        <TableCell> {formatPaymentMethod(transaction.paymentMethod) || 'Not Specified'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={transaction.status || 'Completed'}
                            color={
                              transaction.status === 'Completed' ? 'success' : 
                              transaction.status === 'Pending' ? 'warning' : 
                              transaction.status === 'Failed' ? 'error' : 
                              'default'
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="h6" className="total-paid">Total Paid: ${totalAmount.toFixed(2)}</Typography>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  // Add this before the return statement
  const renderMonthsDialog = () => {
    const monthOrder = ['حمل', 'ثور', 'جوزا', 'سرطان', 'اسد', 'سنبله', 
                     'میزان', 'عقرب', 'قوس', 'جدی', 'دلو', 'حوت'];
    
    // Convert YYYY-MM format to month names if needed
    const normalizedPaidMonths = paidMonths.map(period => {
      if (period.match(/^\d{4}-\d{2}$/)) {
        const monthIndex = parseInt(period.split('-')[1]) - 1;
        return monthOrder[monthIndex];
      }
      return period;
    });

    return (
      <Dialog
        open={showMonthsDialog}
        onClose={() => setShowMonthsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Paid Months for {selectedPayment?.tenantName}
            </Typography>
            <IconButton onClick={() => setShowMonthsDialog(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={1}>
            {monthOrder.filter(month => normalizedPaidMonths.includes(month)).map((month) => (
              <Grid item xs={6} sm={4} key={month}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 1,
                    textAlign: 'center',
                    bgcolor: 'success.light',
                    color: 'common.white',
                    '&:hover': {
                      bgcolor: 'success.main',
                    }
                  }}
                >
                  <Typography variant="body2">
                    {month}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Summary:
            </Typography>
            <Typography variant="body2">
              • Total Months Paid: {normalizedPaidMonths.length}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  };

  // Update the formatPaymentPeriod function
  const formatPaymentPeriod = (period) => {
    if (!period) return 'Not Set';
    
    // If it's already a month name, return as is
    const monthNames = ['حمل', 'ثور', 'جوزا', 'سرطان', 'اسد', 'سنبله', 
                                           'میزان', 'عقرب', 'قوس', 'جدی', 'دلو', 'حوت'];
    if (monthNames.includes(period)) {
      return period;
    }

    // If it's in YYYY-MM format, convert to month name
    if (period.match(/^\d{4}-\d{2}$/)) {
      const monthIndex = parseInt(period.split('-')[1]) - 1;
      return monthNames[monthIndex];
    }

    return 'Not Set';
  };

  // Add renderTenantDropdown function
  const renderTenantDropdown = () => {
    // Get current user data
    const userString = localStorage.getItem('user');
    let currentUser;
    try {
      currentUser = JSON.parse(userString);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }

    // If user is a tenant, automatically set their information and show disabled field
    if (currentUser?.userType === 'tenant') {
      // Find the current tenant in the tenants array
      const currentTenant = tenants.find(t => t._id === currentUser.id);
      if (currentTenant) {
        const fullName = `${currentTenant.firstName} ${currentTenant.lastName}`;
        
        // Set tenant data in the form
        setTenantName(fullName);
        setTenantId(currentUser.id);
        
        // If tenant has a property, set it
        if (currentTenant.propertyId) {
          const propertyId = typeof currentTenant.propertyId === 'object' 
            ? currentTenant.propertyId._id 
            : currentTenant.propertyId;
          
          setSelectedPropertyId(propertyId);
          const property = properties.find(p => p._id === propertyId);
          if (property) {
            setPropertyAddress(property.address);
          }
        }

        return (
          <>
            <TextField
              fullWidth
              label="Tenant Name"
              value={fullName}
              disabled
              required
            />
            <TextField
              fullWidth
              label="Property"
              value={propertyAddress || 'No property assigned'}
              disabled
              required
            />
          </>
        );
      }
    }

    // For admin and property manager, show tenant dropdown
    return (
      <>
        <FormControl fullWidth required>
          <InputLabel>Tenant</InputLabel>
          <Select
            value={tenantName}
            onChange={(e) => {
              const selectedTenant = tenants.find(
                t => `${t.firstName} ${t.lastName}` === e.target.value
              );
              if (selectedTenant) {
                handleTenantSelect(selectedTenant);
                
                // Set property when tenant is selected
                if (selectedTenant.propertyId) {
                  const propertyId = typeof selectedTenant.propertyId === 'object' 
                    ? selectedTenant.propertyId._id 
                    : selectedTenant.propertyId;
                  
                  setSelectedPropertyId(propertyId);
                  const property = properties.find(p => p._id === propertyId);
                  if (property) {
                    setPropertyAddress(property.address);
                  }
                }
              }
            }}
          >
            {availableTenants.map((tenant) => (
              <MenuItem 
                key={tenant._id} 
                value={`${tenant.firstName} ${tenant.lastName}`}
              >
                {`${tenant.firstName} ${tenant.lastName}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="Property"
          value={propertyAddress || 'No property assigned'}
          disabled
          required
        />
      </>
    );
  };

  // Enhanced method to handle rent payment creation with duplicate prevention
  const handleCreateRentPayment = async () => {
    try {
      console.group('Creating Rent Payment');
      
      // Get current user from localStorage
      const userString = localStorage.getItem('user');
      if (!userString) {
        throw new Error('Authentication required. Please log in again.');
      }

      let currentUser;
      try {
        currentUser = JSON.parse(userString);
      } catch (error) {
        console.error('Error parsing user data:', error);
        throw new Error('Invalid user data. Please log in again.');
      }

      console.log('Current User:', currentUser);

      // For tenant users, get their tenant record
      let finalPropertyId = selectedPropertyId;
      let finalTenantId = tenantId;

      if (currentUser.userType === 'tenant') {
        // Check if tenants are loaded
        if (!tenants || tenants.length === 0) {
          console.log('Tenants not loaded yet, fetching...');
          try {
            const fetchedTenants = await tenantService.getAllTenants();
            setTenants(fetchedTenants);
            console.log('Fetched tenants:', fetchedTenants);
          } catch (error) {
            console.error('Error fetching tenants:', error);
            throw new Error('Failed to load tenant information. Please try again.');
          }
        }

        // Log all available tenants with their complete details
        console.log('All Available Tenants (Complete Details):', tenants.map(t => ({
          id: t._id,
          email: t.email,
          userId: t.userId,
          username: t.username,
          name: `${t.firstName} ${t.lastName}`,
          propertyId: t.propertyId,
          rawTenant: t // Log the complete tenant object
        })));

        // Log current user details for comparison
        console.log('Current User Details:', {
          id: currentUser.id,
          email: currentUser.email,
          username: currentUser.username,
          userType: currentUser.userType
        });

        let currentTenant;
        
        // Try each matching strategy with detailed logging
        console.log('Attempting tenant lookup with multiple strategies...', {
          currentUser,
          availableTenants: tenants,
          timestamp: new Date().toISOString()
        });

        // 1. Try matching by email (most reliable)
        if (!currentTenant) {
          const emailMatch = tenants.find(t => 
            t.email?.toLowerCase() === currentUser.email?.toLowerCase()
          );
          console.log('Email match attempt:', {
            userEmail: currentUser.email?.toLowerCase(),
            foundMatch: !!emailMatch,
            matchedTenant: emailMatch ? {
              id: emailMatch._id,
              email: emailMatch.email,
              name: emailMatch.name
            } : undefined
          });
          if (emailMatch) currentTenant = emailMatch;
        }

        // 2. Try matching by ID
        if (!currentTenant) {
          const idMatch = tenants.find(t => 
            t._id === currentUser.id || 
            t.userId === currentUser.id
          );
          console.log('ID match attempt:', {
            userId: currentUser.id,
            foundMatch: !!idMatch,
            matchedTenant: idMatch ? {
              id: idMatch._id,
              email: idMatch.email,
              name: idMatch.name
            } : undefined
          });
          if (idMatch) currentTenant = idMatch;
        }

        // 3. Try matching by username
        if (!currentTenant) {
          const usernameMatch = tenants.find(t => 
            t.username === currentUser.username
          );
          console.log('Username match attempt:', {
            username: currentUser.username,
            foundMatch: !!usernameMatch,
            matchedTenant: usernameMatch ? {
              id: usernameMatch._id,
              email: usernameMatch.email,
              name: usernameMatch.name
            } : undefined
          });
          if (usernameMatch) currentTenant = usernameMatch;
        }

        console.log('Final tenant match result:', currentTenant ? {
          id: currentTenant._id,
          email: currentTenant.email,
          name: currentTenant.name,
          propertyId: currentTenant.propertyId
        } : undefined);
        
        if (!currentTenant) {
          // Log available tenants for debugging (without sensitive info)
          const sanitizedTenants = tenants.map(t => ({
            id: t._id,
            email: t.email,
            name: t.name
          }));

          console.error('Tenant lookup failed. Debug information:', {
            availableTenants: sanitizedTenants,
            lookupCriteria: {
              email: currentUser.email,
              id: currentUser.id,
              username: currentUser.username
            },
            timestamp: new Date().toISOString()
          });

          throw new Error(
            'Your tenant profile could not be found. Please ensure your account is properly linked to a tenant profile and try again. ' +
            'If the issue persists, contact support with reference time: ' + 
            new Date().toLocaleTimeString()
          );
        }

        // Set property ID from matched tenant
        finalPropertyId = currentTenant.propertyId;
        if (!finalPropertyId) {
          throw new Error('No property is associated with your tenant profile. Please contact your administrator.');
        }

        finalTenantId = currentTenant._id;
      }

      console.log('Form State Before Submission:', {
        tenantId: finalTenantId,
        selectedPropertyId: finalPropertyId,
        rentAmount,
        rentPeriod,
        paymentDate,
        paymentMethod
      });

      // Validate required fields
      if (!finalPropertyId || !rentAmount || !rentPeriod || !paymentDate || !paymentMethod) {
        throw new Error('All fields are required: Property, Amount, Rent Period, Payment Date, and Payment Method.');
      }

      // Validate amount
      const amount = parseFloat(rentAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount greater than zero.');
      }

      // Create payment data
      const paymentData = {
        tenant: finalTenantId,
        property: finalPropertyId,
        amount: amount,
        rentPeriod: rentPeriod,
        paymentDate: paymentDate,
        paymentMethod: paymentMethod,
        notes: notes || '',
        createdBy: currentUser.id,
        status: currentUser.userType === 'tenant' ? 'Pending' : 'Completed'
      };

      console.log('Sending payment data:', paymentData);

      // Make the API call
      const response = await rentPaymentService.createRentPayment(paymentData);
      console.log('Rent payment created successfully:', response);
      
      // Show success message based on user role
      const successMessage = currentUser.userType === 'tenant' 
        ? 'Payment submitted for approval!' 
        : 'Rent payment processed successfully!';
      
      enqueueSnackbar(successMessage, { variant: 'success' });
      setOpenSuccessSnackbar(true);
      
      // Reset form and close modal
      handleCloseModal();
      
      // Refresh the payments list
      await fetchRentPayments();

      // Reset form fields
      setRentAmount('');
      setSelectedProperty('');
      setRentPeriod('');
      setPaymentDate('');
      setPaymentMethod('');
      setNotes('');
      
      console.groupEnd();
    } catch (error) {
      console.error('Error creating rent payment:', error);
      enqueueSnackbar(error.response?.data?.message || error.message || 'Failed to create rent payment', { 
        variant: 'error',
        autoHideDuration: 6000
      });
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return (
      <Dialog open={!!error} onClose={() => setError(null)}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {error.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setError(null)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">د کرایې تادیاتو مدیریت</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleOpenModal}
            
            >
              د کرایې تادیه اضافه کړئ

            </Button>
        
          </Box>
        </Box>

        {renderRentPaymentsContent()}
        
        {renderPaymentHistoryModal()}
        
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
              maxHeight: '90vh', 
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              position: 'relative',
              overflowY: 'auto', 
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#555',
              }
            }}
          >
            <IconButton
              aria-label="close"
              onClick={handleCloseModal}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>

            <Typography variant="h6" gutterBottom>
            د کرایې تادیه اضافه کړئ
            </Typography>

            <Box 
              component="form" 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2,
                maxHeight: '70vh', 
                overflowY: 'auto'
              }}
            >
              {renderTenantDropdown()}

              <TextField
                fullWidth
                name="rentAmount"
                label="rent Amount"
                type="number"
                value={rentAmount}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />

              <TextField
                type="date"
                fullWidth
                label="د تادیې نیټه"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <FormControl fullWidth required>
                <InputLabel> د کرایې موده</InputLabel>
                <Select
                  name="rentPeriod"
                  value={rentPeriod}
                  onChange={handleInputChange}
                >
                  {Array.from({ length: 12 }, (_, monthIndex) => {
                    const currentYear = new Date().getFullYear();
                    const monthNames = ['حمل', 'ثور', 'جوزا', 'سرطان', 'اسد', 'سنبله', 
                                           'میزان', 'عقرب', 'قوس', 'جدی', 'دلو', 'حوت'];
                    // Only generate one entry per month, using current year
                    const month = (monthIndex + 1).toString().padStart(2, '0');
                    const period = `${currentYear}-${month}`;
                    return (
                      <MenuItem key={period} value={period}>
                        {monthNames[monthIndex]}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>د تادیاتو ډول</InputLabel>
                <Select
                  name="paymentMethod"
                  value={paymentMethod}
                  onChange={handleInputChange}
                >
                  {paymentMethodOptions.map((method) => (
                    <MenuItem key={method.value} value={method.value}>
                      {formatPaymentMethod(method.value)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {tenantName && renderPropertyDropdown()}

              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleCreateRentPayment}
                fullWidth
              >
                Add Rent Payment
              </Button>
            </Box>
          </Box>
        </Modal>
        
        {/* Tenant Details Modal */}
        <Modal
          open={isTenantModalOpen}
          onClose={handleCloseTenantDetailsModal}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box 
            sx={{
              width: '90%',
              maxWidth: 500,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              position: 'relative'
            }}
          >
            <IconButton
              aria-label="close"
              onClick={handleCloseTenantDetailsModal}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>

            {selectedTenantDetails ? (
              <>
                <Typography variant="h5" gutterBottom>
                  Tenant Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Full Name
                      </Typography>
                      <Typography>
                        {selectedTenantDetails.firstName && selectedTenantDetails.lastName 
                          ? `${selectedTenantDetails.firstName} ${selectedTenantDetails.lastName}`
                          : 'Not provided'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Email
                      </Typography>
                      <Typography>
                        {selectedTenantDetails.email || 'Not provided'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Phone
                      </Typography>
                      <Typography>
                        {selectedTenantDetails.phone || selectedTenantDetails.phoneNumber || 'Not provided'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Property
                      </Typography>
                      <Typography>
                        {selectedTenantDetails.propertyId?.address || 
                         selectedTenantDetails.property?.address || 
                         'No property assigned'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Lease Details
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography gutterBottom>
                          Lease Start: {selectedTenantDetails.leaseStartDate 
                            ? new Date(selectedTenantDetails.leaseStartDate).toLocaleDateString() 
                            : 'Not set'}
                        </Typography>
                        <Typography>
                          Lease End: {selectedTenantDetails.leaseEndDate 
                            ? new Date(selectedTenantDetails.leaseEndDate).toLocaleDateString() 
                            : 'Not set'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography>Loading tenant details...</Typography>
              </Box>
            )}
          </Box>
        </Modal>
        
        {/* Delete Confirmation Modal */}
        <Dialog
          open={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          aria-labelledby="delete-payment-dialog-title"
          aria-describedby="delete-payment-dialog-description"
        >
          <DialogTitle id="delete-payment-dialog-title">
            {"Confirm Payment Deletion"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-payment-dialog-description">
              Are you sure you want to delete this rent payment for 
              {paymentToDelete 
                ? ` ${paymentToDelete.tenantName} (${paymentToDelete.rentPeriod})` 
                : ' this payment'}?
              
              {error && (
                <Box color="error.main" mt={2}>
                  <ErrorOutlineIcon /> {error.message}
                </Box>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setIsDeleteModalOpen(false)} 
              color="primary"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeletePayment} 
              color="secondary" 
              variant="contained"
              startIcon={<DeleteIcon />}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        {renderPaymentDetailsModal()}
        {renderMonthsDialog()}
      </Box>
      <Snackbar
        open={openSuccessSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSuccessSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSuccessSnackbar} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Rent payment added successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default RentPayments;