import React, { useState, useRef, useEffect } from 'react';
import { 
  FaSave, 
  FaTimes, 
  FaIdCard, 
  FaCalendar, 
  FaFileUpload 
} from 'react-icons/fa';
import '../../styles/TenantForm.css';

function TenantForm({ tenant, properties = [], onSave, onCancel }) {
  // Add state for properties
  const [displayedProperties, setDisplayedProperties] = useState(properties);

  // Filter properties based on status
  const displayProperties = tenant 
    ? displayedProperties  // Show all properties when editing
    : displayedProperties.filter(property => property.status?.toLowerCase() === 'vacant');
  
  // Log the properties for debugging
  console.log('Total properties:', displayedProperties.length);
  console.log('Displaying properties:', displayProperties.length);
  console.log('All properties status:', displayedProperties.map(p => ({ id: p._id, status: p.status })));
  console.log('Filtered properties status:', displayProperties.map(p => ({ id: p._id, status: p.status })));

  // Listen for property status updates
  useEffect(() => {
    const handlePropertyStatusUpdate = async (event) => {
      const { propertyId, newStatus } = event.detail;
      try {
        const updatedProperties = await propertyService.getAllProperties();
        setDisplayedProperties(updatedProperties);
      } catch (error) {
        console.error('Error updating properties:', error);
      }
    };

    document.addEventListener('propertyStatusUpdate', handlePropertyStatusUpdate);
    return () => {
      document.removeEventListener('propertyStatusUpdate', handlePropertyStatusUpdate);
    };
  }, []);

  // Update displayed properties when props change
  useEffect(() => {
    setDisplayedProperties(properties);
  }, [properties]);

  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    // Tenant Personal Information
    tenantId: tenant?.tenantId || 'AUTO-GENERATE', // Auto-generated
    firstName: tenant?.firstName || '',
    lastName: tenant?.lastName || '',
    phoneNumber: tenant?.phoneNumber || '',
    nationalId: tenant?.nationalId || '',
    // address: {
    //   street: tenant?.address?.street || '',
    //   city: tenant?.address?.city || '',
    //   state: tenant?.address?.state || '',
    //   zip: tenant?.address?.zip || ''
    // },
    // Lease Details
    propertyId: tenant?.propertyId || '',
    leaseStartDate: tenant?.leaseStartDate || '',
    leaseEndDate: tenant?.leaseEndDate || '',
    monthlyRent: tenant?.monthlyRent || '',
    paymentStatus: tenant?.paymentStatus || 'Due', // Changed default to 'Due'
    leaseAgreementDocument: tenant?.leaseAgreementDocument || null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'leaseAgreementDocument' && files) {
      setFormData((prev) => ({
        ...prev,
        leaseAgreementDocument: files[0]
      }));
    } else if (name.includes('address')) {
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [name.split('.')[1]]: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create FormData for file upload
    const submissionData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'address') {
        Object.keys(formData[key]).forEach(addressKey => {
          if (formData[key][addressKey]) {
            submissionData.append(`address.${addressKey}`, formData[key][addressKey]);
          }
        });
      } else if (formData[key] !== null && formData[key] !== undefined && key !== 'tenantId') {
        submissionData.append(key, formData[key]); // Omit tenantId from submission
      }
    });

    // Create contactInfo object and set it in submissionData
    const contactInfo = {
        phone: formData.phoneNumber
    };
    submissionData.set('contactInfo', JSON.stringify(contactInfo));

    // Add other required fields to submissionData
    submissionData.set('firstName', formData.firstName);
    submissionData.set('lastName', formData.lastName);
    submissionData.set('nationalId', formData.nationalId);
    submissionData.set('propertyId', formData.propertyId);
    submissionData.set('leaseStartDate', formData.leaseStartDate);
    submissionData.set('leaseEndDate', formData.leaseEndDate);
    submissionData.set('rentAmount', Number(formData.monthlyRent));
    submissionData.set('paymentStatus', formData.paymentStatus);
    submissionData.set('name', `${formData.firstName} ${formData.lastName}`);

    // If no property selected and properties exist, select first property
    const availableProperties = displayProperties || [];
    if (!submissionData.get('propertyId')) {
      if (availableProperties.length > 0) {
        submissionData.set('propertyId', availableProperties[0]._id);
      } else {
        alert('Cannot submit form: No properties available');
        return;
      }
    }

    // Ensure payment status is valid
    const { paymentStatus } = formData;
    if (!["Due", "Paid", "Overdue"].includes(paymentStatus)) {
        console.error("Invalid payment status:", paymentStatus);
        return; // Prevent submission if status is invalid
    }

    // Convert monthlyRent to a number before submission
    submissionData.set('monthlyRent', Number(formData.monthlyRent));
    console.log('Monthly Rent before submission:', Number(formData.monthlyRent)); // Added this line to log monthlyRent

    // Log the complete submission data
    console.log('Complete Submission Data:', Object.fromEntries(submissionData));

    // Logging the submission data
    console.log('Submission Data before sending:', Object.fromEntries(submissionData));

    // Call onSave with the correct submissionData
    try {
      onSave(null, submissionData); // Pass null for tenantId when creating a new tenant
    } catch (error) {
      console.error('Tenant Submission Error:', error);
      alert(`Failed to save tenant: ${error.message}`);
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="tenant-form-module">
      <div className="tenant-form-header">
        <h2 className="tenant-form-title">
          {tenant ? 'Edit Tenant' : 'Add New Tenant'}
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="tenant-form-content">
          {/* Personal Information Section */}
          <div className="tenant-form-section-title">
            <FaIdCard /> Personal Information
          </div>

          <div className="tenant-form-group">
            <label htmlFor="tenantId">Tenant ID</label>
            <input
              type="text"
              id="tenantId"
              name="tenantId"
              value={formData.tenantId}
              readOnly
              disabled
            />
          </div>

          <div className="tenant-form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="tenant-form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="tenant-form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="tenant-form-group">
            <label htmlFor="nationalId">National ID/Passport</label>
            <input
              type="text"
              id="nationalId"
              name="nationalId"
              value={formData.nationalId}
              onChange={handleChange}
              required
            />
          </div>

          {/* Lease Details Section */}
          <div className="tenant-form-section-title">
            <FaCalendar /> Lease Details
          </div>

          <div className="tenant-form-group">
            <label htmlFor="propertyId">Property</label>
            <select
              id="propertyId"
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
              required
            >
              <option value="">Select Property</option>
              {displayProperties.map(property => (
                <option key={property._id} value={property._id}>
                  {property.title || property.name || property.address || `Property ${property._id}`}
                  {' - ' + (property.status || 'N/A')}
                </option>
              ))}
            </select>
            {displayProperties.length === 0 && (
              <p className="error-message">No vacant properties available</p>
            )}
          </div>

          <div className="tenant-form-group">
            <label htmlFor="leaseStartDate">Lease Start Date</label>
            <input
              type="date"
              id="leaseStartDate"
              name="leaseStartDate"
              value={formData.leaseStartDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="tenant-form-group">
            <label htmlFor="leaseEndDate">Lease End Date</label>
            <input
              type="date"
              id="leaseEndDate"
              name="leaseEndDate"
              value={formData.leaseEndDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="tenant-form-group">
            <label htmlFor="monthlyRent">Monthly Rent</label>
            <input
              type="number"
              id="monthlyRent"
              name="monthlyRent"
              value={formData.monthlyRent}
              onChange={handleChange}
              required
            />
          </div>

          <div className="tenant-form-group">
            <label htmlFor="paymentStatus">Payment Status</label>
            <select
              id="paymentStatus"
              name="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleChange}
              required
            >
              <option value="">Select Payment Status</option>
              {/* <option value="Due">Due</option> */}
              {/* <option value="Paid">Paid</option> */}
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <div className="tenant-form-group full-width">
            <label htmlFor="leaseAgreementDocument">
              <FaFileUpload /> Lease Agreement Document
            </label>
            <div className="file-upload-container">
              <input
                type="file"
                id="leaseAgreementDocument"
                name="leaseAgreementDocument"
                ref={fileInputRef}
                onChange={handleChange}
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx"
              />
              <button 
                type="button" 
                className="file-upload-btn"
                onClick={handleFileUploadClick}
              >
                <FaFileUpload /> Upload Document
              </button>
              {formData.leaseAgreementDocument && (
                <span className="file-name">
                  {formData.leaseAgreementDocument.name}
                </span>
              )}
            </div>
          </div>

          <div className="tenant-form-actions">
            <button 
              type="submit" 
              className="tenant-form-btn tenant-form-btn-primary"
            >
              <FaSave /> Save Tenant
            </button>
            <button 
              type="button" 
              className="tenant-form-btn tenant-form-btn-secondary" 
              onClick={onCancel}
            >
              <FaTimes /> Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default TenantForm;