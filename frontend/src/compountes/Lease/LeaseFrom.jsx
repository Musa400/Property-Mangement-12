import React, { useState } from 'react';
import axios from 'axios';
import './Lease Management.css';
const LeaseForm = ({ leaseData, onSubmit }) => {
  const [formData, setFormData] = useState(leaseData || {
    tenantName: '',
    propertyName: '',
    startDate: '',
    endDate: '',
    agreementLink: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="lease-form">
      <h2>{leaseData ? 'Edit Lease' : 'Create Lease'}</h2>
      <input
        type="text"
        name="tenantName"
        placeholder="Tenant Name"
        value={formData.tenantName}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="propertyName"
        placeholder="Property Name"
        value={formData.propertyName}
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="startDate"
        value={formData.startDate}
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="endDate"
        value={formData.endDate}
        onChange={handleChange}
        required
      />
      <input
        type="url"
        name="agreementLink"
        placeholder="Agreement Link"
        value={formData.agreementLink}
        onChange={handleChange}
      />
      <button type="submit">{leaseData ? 'Update Lease' : 'Create Lease'}</button>
    </form>
  );
};

export default LeaseForm;