import React, { useState } from 'react';
import './MaintenanceManagement.css';

const MaintenanceRequestForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    description: '',
    urgency: 'Low', // Default urgency
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ description: '', urgency: 'Low' }); // Reset form
  };

  return (
    <form onSubmit={handleSubmit} className="maintenance-request-form">
      <h2>Submit Maintenance Request</h2>
      <textarea
        name="description"
        placeholder="Describe the issue..."
        value={formData.description}
        onChange={handleChange}
        required
      />
      <select name="urgency" value={formData.urgency} onChange={handleChange}>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <button type="submit">Submit Request</button>
    </form>
  );
};

export default MaintenanceRequestForm;