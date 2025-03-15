import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, 
  FaTimes, 
  FaUsers, 
  FaBuilding, 
  FaMoneyBillWave, 
  FaCalendarCheck,
  FaPlus,
  FaExclamationCircle,
  FaEye,
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaHome,
  FaCalendar,
  FaMoneyBill,
  FaChartBar,
  FaExclamationTriangle,
  FaFilter, 
  FaCheckCircle, 
  FaClock, 
  FaTimesCircle,
  FaTrash
} from 'react-icons/fa';
import { Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

import TenantForm from './TenantForm';
import tenantService from '../../services/tenantService';
import propertyService from '../../services/propertyService';
import rentPaymentService from '../../services/rentPaymentService';
import '../../styles/TenantList.css';

const PaymentStatusFilter = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const filterRef = useRef(null);

  // Payment status options with icons and colors
  const statusOptions = [
    { 
      value: 'All', 
      label: 'All Statuses', 
      icon: <FaFilter />, 
      color: '#6c757d' 
    },
    { 
      value: 'Paid', 
      label: 'Paid', 
      icon: <FaCheckCircle />, 
      color: '#28a745' 
    },

    { 
      value: 'Overdue', 
      label: 'Overdue', 
      icon: <FaExclamationCircle />, 
      color: '#dc3545' 
    }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    onFilterChange(status);
    setIsOpen(false);
  };

  return (
    <div className="payment-status-filter-container" ref={filterRef}>
      <button 
        className="payment-status-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {statusOptions.find(opt => opt.value === selectedStatus).icon}
        <span>{selectedStatus} Status</span>
      </button>

      {isOpen && (
        <div className="payment-status-dropdown">
          {statusOptions.map((status) => (
            <div 
              key={status.value}
              className={`payment-status-option ${selectedStatus === status.value ? 'selected' : ''}`}
              onClick={() => handleStatusSelect(status.value)}
            >
              {React.cloneElement(status.icon, { 
                color: status.color, 
                className: 'status-icon' 
              })}
              {status.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function TenantList() {
  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');

  // Ref for modal container
  const modalRef = useRef(null);

  // Handle click outside of modal
  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      closeModal();
    }
  };

  // Add event listener when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isModalOpen]);

  // Fetch tenants and properties on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [tenantsData, propertiesData] = await Promise.all([
          tenantService.getAllTenants(), // Updated this line
          propertyService.getAllProperties()
        ]);
        
        console.log('Tenants Data:', tenantsData);
        console.log('Properties Data:', propertiesData);
        
        setTenants(tenantsData);
        setProperties(propertiesData);
        
        setLoading(false);
      } catch (err) {
        console.error('Fetch Data Error:', err);
        setError(err.message || 'Failed to load tenant and property data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Search and filter logic
  useEffect(() => {
    let filtered = tenants;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(tenant => 
        tenant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.phoneNumber.includes(searchTerm)
      );
    }

    // Apply payment status filter
    if (paymentStatusFilter !== 'All') {
      filtered = filtered.filter(tenant => tenant.paymentStatus === paymentStatusFilter);
    }

    setFilteredTenants(filtered);
  }, [searchTerm, tenants, paymentStatusFilter]);

  const openAddTenantModal = () => {
    setCurrentTenant(null);
    setIsModalOpen(true);
  };

  const openEditTenantModal = (tenant) => {
    setCurrentTenant(tenant);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTenant(null);
  };

  const navigateToTenantDetails = (tenantId) => {
    navigate(`/tenants/${tenantId}`);
  };

  const handleAddTenant = async (tenantId, tenantData) => {
    try {
      // Convert FormData to a plain object
      const tenantObject = {};
      for (let [key, value] of tenantData.entries()) {
        // Skip 'tenantId' field
        if (key !== 'tenantId') {
          tenantObject[key] = value;
        }
      }

      // Add default payment status only if not provided
      if (!tenantObject.paymentStatus) {
        tenantObject.paymentStatus = 'Pending';
      }

      // Ensure propertyId is included
      if (!tenantObject.propertyId) {
        if (properties && properties.length > 0) {
          tenantObject.propertyId = properties[0]._id;
          console.log('Auto-selected first property:', properties[0]._id);
        } else {
          console.error('No properties available to assign');
          setError('Cannot add tenant: No properties available');
          return;
        }
      }

      // Ensure all required fields are present
      const requiredFields = ['firstName', 'lastName', 'phoneNumber', 'nationalId', 'leaseStartDate', 'leaseEndDate', 'monthlyRent']; // Change rentAmount to monthlyRent
      for (const field of requiredFields) {
        if (!tenantObject[field]) {
          console.error(`Missing required field: ${field}`);
          setError(`Missing required field: ${field}`);
          return;
        }
      }

      console.log('Final Tenant Data:', tenantObject);
      console.log('Rent Amount:', tenantObject.monthlyRent); // Log rentAmount for debugging

      const newTenant = await tenantService.createTenant(tenantObject);
      setTenants([...tenants, newTenant]);
      closeModal();
    } catch (error) {
      console.error('Error creating tenant:', error);
      setError(error.response ? error.response.data.message : 'Failed to create tenant');
    }
  };

  const handleEditTenant = async (id, tenantData) => {
    try {
      // Convert FormData to a plain object
      const tenantObject = {};
      for (let [key, value] of tenantData.entries()) {
        tenantObject[key] = value;
      }

      // Preserve or update payment status
      if (!tenantObject.paymentStatus) {
        tenantObject.paymentStatus = 'Pending';
      }

      // Ensure propertyId is included
      if (!tenantObject.propertyId && properties.length > 0) {
        tenantObject.propertyId = properties[0]._id;
      }

      const updatedTenant = await tenantService.updateTenant(id, tenantObject);
      
      // Update local state
      setTenants(tenants.map(tenant => 
        tenant._id === id ? updatedTenant : tenant
      ));

      // Sync rent payments if payment status changed
      if (tenantObject.paymentStatus) {
        const tenantFullName = `${updatedTenant.firstName} ${updatedTenant.lastName}`;
        
        // Sync rent payments
        await rentPaymentService.syncTenantPaymentStatus(tenantFullName, tenantObject.paymentStatus);
        
        // Dispatch global event for real-time updates
        const paymentStatusUpdateEvent = new CustomEvent('globalPaymentStatusUpdate', {
          detail: {
            tenantId: id,
            tenantName: tenantFullName,
            newStatus: tenantObject.paymentStatus
          },
          bubbles: true,
          composed: true
        });
        document.dispatchEvent(paymentStatusUpdateEvent);
      }

      closeModal();
    } catch (err) {
      console.error('Error editing tenant:', err);
      setError(err.message || 'Failed to edit tenant');
    }
  };

  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState(null);

  const confirmDeleteTenant = (tenant) => {
    setTenantToDelete(tenant);
    setIsDeleteConfirmationOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (tenantToDelete) {
      await handleDeleteTenant(tenantToDelete._id);
      setIsDeleteConfirmationOpen(false);
      setTenantToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteConfirmationOpen(false);
    setTenantToDelete(null);
  };

  const handleDeleteTenant = async (id) => {
    try {
      // Find the tenant to be deleted
      const tenantToDelete = tenants.find(tenant => tenant._id === id);
      
      if (!tenantToDelete) {
        throw new Error('Tenant not found');
      }

      // If the tenant has a property, update its status to vacant
      if (tenantToDelete.propertyId) {
        const updatedProperties = properties.map(property => 
          property._id === tenantToDelete.propertyId 
            ? { ...property, status: 'vacant' } 
            : property
        );
        
        // Update properties in the state
        setProperties(updatedProperties);
      }

      // Proceed with tenant deletion
      const response = await tenantService.deleteTenant(id);
      
      // Remove the tenant from the state
      setTenants(tenants.filter(tenant => tenant._id !== id));
      
      // Show success message
      // toast.success('Tenant deleted successfully');
    } catch (error) {
      console.error('Error deleting tenant:', error);
      // toast.error(`Failed to delete tenant: ${error.message}`);
    }
  };

  const handlePaymentStatusChange = async (tenant, newStatus) => {
    try {
      // Update tenant status
      const updatedTenant = await tenantService.updateTenant(tenant._id, { 
        paymentStatus: newStatus 
      });
      
      // Update local state
      setTenants(prevTenants => 
        prevTenants.map(t => 
          t._id === tenant._id ? { ...t, paymentStatus: newStatus } : t
        )
      );
      
      // Sync rent payments for this tenant
      const tenantFullName = `${tenant.firstName} ${tenant.lastName}`;
      await rentPaymentService.syncTenantPaymentStatus(tenantFullName, newStatus);
      
      // Dispatch custom events for real-time updates
      // 1. For rent payments page
      window.dispatchEvent(new CustomEvent('rentPaymentStatusUpdate', {
        detail: { 
          tenantName: tenantFullName, 
          paymentStatus: newStatus 
        }
      }));

      // 2. For global state management (if using context or global state)
      const paymentStatusUpdateEvent = new CustomEvent('globalPaymentStatusUpdate', {
        detail: {
          tenantId: tenant._id,
          tenantName: tenantFullName,
          newStatus: newStatus
        },
        bubbles: true,
        composed: true
      });
      document.dispatchEvent(paymentStatusUpdateEvent);

      // Optional: Toast or snackbar notification
      // You can add a toast notification here if you want to confirm the status change
    } catch (error) {
      console.error('Error updating payment status:', error);
      // Optionally show an error message to the user
    }
  };

  // Calculate overview metrics
  const calculateOverview = () => {
    if (!tenants.length) return {
      totalTenants: 0,
      paidTenants: 0,
      overdueTenants: 0,
      totalProperties: 0,
      totalMonthlyRent: 0,
      occupiedProperties: 0,
      vacantProperties: 0
    };

    return {
      totalTenants: tenants.length,
      paidTenants: tenants.filter(tenant => tenant.paymentStatus === 'Paid').length,
      overdueTenants: tenants.filter(tenant => tenant.paymentStatus === 'Overdue').length,
      totalProperties: properties.length,
      totalMonthlyRent: tenants.reduce((sum, tenant) => sum + (tenant.monthlyRent || 0), 0),
      occupiedProperties: tenants.length,
      vacantProperties: properties.length - tenants.length
    };
  };

  // Calculate expiring leases
  const expiringLeases = useMemo(() => {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    return tenants.filter(tenant => {
      if (!tenant.leaseEndDate) return false;
      
      const leaseEndDate = new Date(tenant.leaseEndDate);
      
      // Format lease end date for display
      const formattedLeaseEndDate = leaseEndDate.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      });
      
      // Check if lease is expiring within the next 3 days or has already expired
      const isExpiringSoon = leaseEndDate <= threeDaysFromNow;
      const isExpired = leaseEndDate < now;
      
      // Only return if the lease is expiring soon or has expired
      if (isExpiringSoon || isExpired) {
        return {
          ...tenant,
          formattedLeaseEndDate,
          isExpired
        };
      }
      
      return false;
    }).map(tenant => ({
      ...tenant,
      property: properties.find(prop => prop._id === tenant.propertyId)
    }));
  }, [tenants, properties]);

  // Debugging for lease expiration alerts
  useEffect(() => {
    console.log('Expiring Leases:', expiringLeases);
    console.log('Lease Details:', expiringLeases.map(lease => ({
      id: lease._id,
      tenantName: lease.firstName + ' ' + lease.lastName,
      leaseEndDate: lease.leaseEndDate,
      propertyName: lease.propertyName || 'N/A'
    })));
  }, [expiringLeases]);

  // Render search bar
  const renderSearchBar = () => {
    return (
      <div className="tenant-search-container">
        <div className="search-wrapper">
          <input 
            type="text" 
            placeholder="Search tenants by name or phone" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">
            <FaSearch />
          </span>
          {searchTerm && (
            <button 
              className="clear-search-btn" 
              onClick={() => setSearchTerm('')}
            >
              <FaTimes />
            </button>
          )}
        </div>
        {searchTerm && filteredTenants.length === 0 && (
          <div className="no-results-message">
            No tenants found matching your search
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {renderSearchBar()}

      {/* Lease Expiration Reminder Section */}
      {expiringLeases.length > 0 && (
        <div className="lease-expiration-reminder">
          <h2><FaExclamationTriangle className="warning-icon" /> Lease Expiration Alerts</h2>
          <div className="expiring-leases-grid">
            {expiringLeases.map(lease => (
              <div key={lease._id} className="expiring-lease-card">
                <div className="expiring-lease-header">
                  <FaExclamationTriangle className="warning-icon" />
                  <h3>Lease Expiring Soon</h3>
                </div>
                <div className="expiring-lease-details">
                  <p><strong>Tenant:</strong> {lease.firstName} {lease.lastName}</p>
                  {/* <p><strong>Property:</strong> {lease.property?.address || 'N/A'}</p>
                  <p><strong>Lease End Date:</strong> {lease.formattedLeaseEndDate}</p> */}
                </div>
                <button 
                  className="renew-lease-btn"
                  onClick={() => {
                    console.log('Attempting to navigate to tenant details:', lease);
                    // Use the tenant ID, not the lease ID
                    navigate(`/tenants/${lease.tenantId || lease._id}`);
                  }}
                >
                  View Tenant Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tenant-list-header">
        <h2>Tenant List</h2>
        <div className="tenant-list-actions">
          <PaymentStatusFilter 
            onFilterChange={setPaymentStatusFilter} 
          />
          <button 
            className="add-tenant-btn" 
            onClick={openAddTenantModal}
            disabled={properties.length === 0}
          >
            <FaPlus /> Add New Tenant
          </button>
        </div>
      </div>

      {loading && <div className="loading-message">Loading tenants...</div>}
      {error && (
        <div className="error-message">
          {error} {/* Display the error message */}
        </div>
      )}

      {/* Overview Section */}
      <div className="tenant-overview-section">
        
        <div className="overview-grid">
          <div className="overview-card">
            <FaUsers className="overview-icon" />
            <h3>Total Tenants</h3>
            <p>{calculateOverview().totalTenants}</p>
          </div>
          
          <div className="overview-card paid-tenants">
            <FaCheckCircle className="overview-icon" />
            <h3>Paid Tenants</h3>
            <p>{calculateOverview().paidTenants}</p>
          </div>
          
          <div className="overview-card overdue-tenants">
            <FaExclamationCircle className="overview-icon" />
            <h3>Overdue Tenants</h3>
            <p>{calculateOverview().overdueTenants}</p>
          </div>
          
          <div className="overview-card">
            <FaBuilding className="overview-icon" />
            <h3>Total Properties</h3>
            <p>{calculateOverview().totalProperties}</p>
          </div>
          
          <div className="overview-card">
            <FaMoneyBillWave className="overview-icon" />
            <h3>Total Monthly Rent</h3>
            <p>${calculateOverview().totalMonthlyRent.toLocaleString()}</p>
          </div>
          
          <div className="overview-card">
            <FaHome className="overview-icon" />
            <h3>Occupied Properties</h3>
            <p>{calculateOverview().occupiedProperties}</p>
          </div>
        </div>
      </div>

      {properties.length === 0 && (
        <div className="warning-message">
          <FaExclamationCircle /> No properties available. Please add a property before adding a tenant.
        </div>
      )}

      {properties.length > 0 && tenants.length === 0 && (
        <div className="info-message">
          <FaExclamationCircle /> You have properties, but no tenants yet. 
          Click "Add New Tenant" to get started!
        </div>
      )}

      {filteredTenants.length > 0 && (
        <table className="tenant-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
               <th>Property Type</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.map((tenant) => (
              <tr key={tenant._id}>
                <td>{tenant.firstName} {tenant.lastName}</td>
                <td>{tenant.contactInfo?.phone || 'N/A'}</td>
                <td>
                  {typeof tenant.propertyId === 'object' 
                    ? tenant.propertyId?._id || 'No Property' 
                    : tenant.propertyId || 'No Property'}
                </td>
                <td>
                  <Chip 
                    label={tenant.paymentStatus || 'Not Set'} 
                    color={
                      tenant.paymentStatus === 'Paid' ? 'success' : 
                      tenant.paymentStatus === 'Overdue' ? 'error' : 
                      'warning'
                    } 
                    size="small" 
                  />
                </td>
                
                <td>
                  <button onClick={() => navigateToTenantDetails(tenant._id)}>
                    <FaEye /> Details
                  </button>
                  <button onClick={() => openEditTenantModal(tenant)}>Edit</button>
                  <button onClick={() => confirmDeleteTenant(tenant)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {filteredTenants.length === 0 && (
        <div className="info-message">
          <FaExclamationCircle /> No tenants found. 
          Click "Add New Tenant" to get started!
        </div>
      )}

      {/* Tenant Modal */}
      {isModalOpen && (
        <div className="tenant-modal-overlay">
          <div ref={modalRef} className="tenant-modal">
            <button className="modal-close-btn" onClick={closeModal}>
              <FaTimes />
            </button>
            <TenantForm 
              tenant={currentTenant} 
              properties={properties}
              onSave={currentTenant ? handleEditTenant : handleAddTenant} 
              onCancel={closeModal} 
            />
          </div>
        </div>
      )}

      {/* Tenant Deletion Confirmation Dialog */}
      <Dialog
        open={isDeleteConfirmationOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-tenant-dialog-title"
        aria-describedby="delete-tenant-dialog-description"
      >
        <DialogTitle id="delete-tenant-dialog-title">
          Confirm Tenant Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-tenant-dialog-description">
            Are you sure you want to delete the tenant{' '}
            {tenantToDelete ? `${tenantToDelete.firstName} ${tenantToDelete.lastName}` : ''}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="secondary" 
            variant="contained"
            startIcon={<FaTrash />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default TenantList;