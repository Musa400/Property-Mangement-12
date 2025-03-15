import React from 'react';
import '../../styles/PropertyCard.css';

const PropertyCard = ({ property, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'occupied':
        return '#28a745'; // Green
      case 'vacant':
        return '#ffc107'; // Yellow
      case 'maintenance':
        return '#dc3545'; // Red
      default:
        return '#6c757d'; // Gray
    }
  };

  return (
    <div className="property-card">
      <h3>{property.address}</h3>
      <p><strong>Type:</strong> {property.type}</p>
      <p><strong>Size:</strong> {property.size} sqm</p>
      <p>
        <strong>Status:</strong>{' '}
        <span style={{ color: getStatusColor(property.status) }}>{property.status}</span>
      </p>
      <div className="property-actions">
        <button onClick={() => onEdit(property)}>Edit</button>
        <button onClick={() => onDelete(property.id)}>Delete</button>
      </div>
    </div>
  );
};

export default PropertyCard;