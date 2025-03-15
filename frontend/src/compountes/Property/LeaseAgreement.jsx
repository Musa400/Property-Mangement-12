import React from 'react';
import '../../styles/LeaseAgreement.css';

const LeaseAgreement = () => {
  // Mock data for the lease agreement
  const leaseDetails = {
    tenantName: 'John Doe',
    tenantEmail: 'johndoe@example.com',
    tenantPhone: '+1234567890',
    propertyAddress: '123 Main St',
    propertyType: 'Apartment',
    leaseStartDate: '2023-11-01',
    leaseEndDate: '2024-11-01',
    monthlyRent: '$1200',
    securityDeposit: '$1000',
    paymentDueDate: '5th of every month',
    status: 'Active',
  };

  return (
    <div className="lease-agreement-page">
      {/* Header */}
      <h1>Lease Agreement Details</h1>

      {/* Tenant Information Section */}
      <div className="section">
        <h2>Tenant Information</h2>
        <div className="info-grid">
          <p><strong>Name:</strong> {leaseDetails.tenantName}</p>
          <p><strong>Email:</strong> {leaseDetails.tenantEmail}</p>
          <p><strong>Phone:</strong> {leaseDetails.tenantPhone}</p>
        </div>
      </div>

      {/* Property Information Section */}
      <div className="section">
        <h2>Property Information</h2>
        <div className="info-grid">
          <p><strong>Address:</strong> {leaseDetails.propertyAddress}</p>
          <p><strong>Type:</strong> {leaseDetails.propertyType}</p>
        </div>
      </div>

      {/* Lease Details Section */}
      <div className="section">
        <h2>Lease Details</h2>
        <div className="info-grid">
          <p><strong>Start Date:</strong> {leaseDetails.leaseStartDate}</p>
          <p><strong>End Date:</strong> {leaseDetails.leaseEndDate}</p>
          <p><strong>Monthly Rent:</strong> {leaseDetails.monthlyRent}</p>
          <p><strong>Security Deposit:</strong> {leaseDetails.securityDeposit}</p>
          <p><strong>Payment Due Date:</strong> {leaseDetails.paymentDueDate}</p>
          <p><strong>Status:</strong> <span className={`status ${leaseDetails.status.toLowerCase()}`}>{leaseDetails.status}</span></p>
        </div>
      </div>
    </div>
  );
};

export default LeaseAgreement;