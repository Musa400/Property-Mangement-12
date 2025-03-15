import React from 'react';
import '../../styles/TenantInfo.css';

const TenantInfo = () => {
  // Mock data for tenant information
  const tenantDetails = {
    name: 'John Doe',
    email: 'johndoe@example.com',
    phone: '+1234567890',
    address: '123 Main St',
    propertyType: 'Apartment',
    leaseStartDate: '2023-11-01',
    leaseEndDate: '2024-11-01',
    monthlyRent: '$1200',
    securityDeposit: '$1000',
    paymentDueDate: '5th of every month',
    status: 'Active',
  };

  return (
    <div className="tenant-info-page">
      {/* Header */}
      <h1>Tenant Information</h1>

      {/* Tenant Details Section */}
      <div className="section">
        <h2>Tenant Details</h2>
        <div className="info-grid">
          <p><strong>Name:</strong> {tenantDetails.name}</p>
          <p><strong>Email:</strong> {tenantDetails.email}</p>
          <p><strong>Phone:</strong> {tenantDetails.phone}</p>
          <p><strong>Address:</strong> {tenantDetails.address}</p>
        </div>
      </div>

      {/* Lease Information Section */}
      <div className="section">
        <h2>Lease Information</h2>
        <div className="info-grid">
          <p><strong>Property Type:</strong> {tenantDetails.propertyType}</p>
          <p><strong>Lease Start Date:</strong> {tenantDetails.leaseStartDate}</p>
          <p><strong>Lease End Date:</strong> {tenantDetails.leaseEndDate}</p>
          <p><strong>Monthly Rent:</strong> {tenantDetails.monthlyRent}</p>
          <p><strong>Security Deposit:</strong> {tenantDetails.securityDeposit}</p>
          <p><strong>Payment Due Date:</strong> {tenantDetails.paymentDueDate}</p>
          <p><strong>Status:</strong> <span className={`status ${tenantDetails.status.toLowerCase()}`}>{tenantDetails.status}</span></p>
        </div>
      </div>
    </div>
  );
};

export default TenantInfo;