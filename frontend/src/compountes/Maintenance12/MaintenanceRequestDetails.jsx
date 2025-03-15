import React from 'react';
import './MaintenanceManagement.css';

const MaintenanceRequestDetails = ({ request, onUpdateStatus }) => {
  return (
    <div className="maintenance-request-details">
      <h2>Request Details</h2>
      <p>Description: {request.description}</p>
      <p>Urgency: {request.urgency}</p>
      <p>Status: {request.status}</p>
      <button onClick={() => onUpdateStatus(request.id, 'In Progress')}>Mark as In Progress</button>
      <button onClick={() => onUpdateStatus(request.id, 'Completed')}>Mark as Completed</button>
    </div>
  );
};

export default MaintenanceRequestDetails;