import React from 'react';
import './MaintenanceManagement.css';

const MaintenanceRequestList = ({ requests, onAssign }) => {
  return (
    <div className="maintenance-request-list">
      <h2>Maintenance Requests</h2>
      <ul>
        {requests.map(request => (
          <li key={request.id}>
            <span>{request.description} - Urgency: {request.urgency}</span>
            <button onClick={() => onAssign(request.id)}>Assign</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MaintenanceRequestList;