import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaTimes
} from 'react-icons/fa';
import { Box, Typography } from '@mui/material';
import { 
  Business as BusinessIcon, 
  House as HouseIcon, 
  Store as StoreIcon, 
  Landscape as LandscapeIcon 
} from '@mui/icons-material';
import '../../styles/PropertyList.css';
import PropertyForm from './PropertyForm';
import { propertyService } from '../../services/propertyService';

const PropertiesList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProperties, setFilteredProperties] = useState([]);

  // State for type filtering
  const [selectedPropertyType, setSelectedPropertyType] = useState(null);
  const [selectedOverviewFilter, setSelectedOverviewFilter] = useState(null);

  // State for modals
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
  const [isEditPropertyModalOpen, setIsEditPropertyModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const navigate = useNavigate();

  // Debug property status values
  useEffect(() => {
    console.log('Properties status values:', properties.map(p => ({ id: p._id, status: p.status })));
    console.log('Vacant properties:', properties.filter(p => p.status?.toLowerCase() === 'vacant').length);
    console.log('Occupied properties:', properties.filter(p => p.status?.toLowerCase() === 'occupied').length);
    console.log('Maintenance properties:', properties.filter(p => p.status?.toLowerCase() === 'maintenance').length);
  }, [properties]);

  // Fetch properties on component mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const fetchedProperties = await propertyService.getAllProperties();
        setProperties(fetchedProperties);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError(err.message || 'Failed to load properties');
        setLoading(false);
      }
    };

    fetchProperties();

    // Add event listener for property status updates
    const handlePropertyStatusUpdate = async (event) => {
      const { propertyId, newStatus } = event.detail;
      try {
        const updatedProperties = await propertyService.getAllProperties();
        setProperties(updatedProperties);
      } catch (error) {
        console.error('Error updating properties:', error);
      }
    };

    // Listen for property status updates
    document.addEventListener('propertyStatusUpdate', handlePropertyStatusUpdate);

    // Cleanup event listener
    return () => {
      document.removeEventListener('propertyStatusUpdate', handlePropertyStatusUpdate);
    };
  }, []);

  // Search functionality
  useEffect(() => {
    // If no search term, show all properties
    if (!searchTerm) {
      setFilteredProperties(properties);
      return;
    }

    // Filter properties based on search term
    const filtered = properties.filter(property => 
      property.province.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property._id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredProperties(filtered);
  }, [searchTerm, properties]);

  // Filter properties based on type and overview filter
  const filteredPropertiesList = useMemo(() => {
    let filtered = filteredProperties; // Use filteredProperties instead of properties

    // First, filter by property type
    if (selectedPropertyType) {
      filtered = filtered.filter((property) => property.type === selectedPropertyType);
    }

    // Then, apply overview filter
    if (selectedOverviewFilter) {
      switch (selectedOverviewFilter) {
        case 'Total':
          // No additional filtering needed
          break;
        case 'Vacant':
          filtered = filtered.filter((prop) => prop.status === 'vacant');
          break;
        case 'Occupied':
          filtered = filtered.filter((prop) => prop.status === 'occupied');
          break;
        case 'Maintenance':
          filtered = filtered.filter((prop) => prop.status === 'maintenance');
          break;
        default:
          break;
      }
    }

    return filtered;
  }, [filteredProperties, selectedPropertyType, selectedOverviewFilter]);

  // Calculate property type sizes with filtering logic
  const calculatePropertyTypeSizes = () => {
    const typeSizes = {
      'تاسيسات': 0,
      'زراعتی': 0,
      'تجارتی': 0,
      'للمی': 0
    };

    properties.forEach((property) => {
      if (typeSizes.hasOwnProperty(property.type)) {
        typeSizes[property.type] += property.size || 0;
      }
    });

    return typeSizes;
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedPropertyType(null);
    setSelectedOverviewFilter(null);
  };

  // Property creation handler
  const handleAddProperty = async (newProperty) => {
    try {
      const transformedProperty = {
        title: newProperty.title,
        province: newProperty.province,
        description: newProperty.description || '',
        address: newProperty.address,
        type: newProperty.type,
        size: newProperty.size || 0,
        status: newProperty.status || 'vacant',
        location: {
          latitude: newProperty.location.latitude || null,
          longitude: newProperty.location.longitude || null,
        },
        neighborhood: newProperty.neighborhood || '',
        city: newProperty.city || '',
        country: newProperty.country || ''
      };

      const createdProperty = await propertyService.createProperty(transformedProperty);
      setProperties([...properties, createdProperty]);
      console.log('Properties state after adding tenant:', properties);
      setIsAddPropertyModalOpen(false);
    } catch (err) {
      console.error('Error adding property:', err.response ? err.response.data : err);
      alert(`Failed to add property: ${err.response ? err.response.data.message : err.message}`);
    }
  };

  // Property update handler
  const handleUpdateProperty = async (updatedProperty) => {
    try {
      const transformedProperty = {
        title: updatedProperty.title || `${
          updatedProperty.propertyType === 'Apartment' ? 'Apartment' :
          updatedProperty.propertyType === 'House' ? 'House' :
          updatedProperty.propertyType === 'Commercial' ? 'Commercial' :
          updatedProperty.propertyType === 'Land' ? 'Land' :
          updatedProperty.propertyType
        } in ${updatedProperty.province}`,
        province: updatedProperty.province,
        description: updatedProperty.description || '',
        address: updatedProperty.address,
        type: updatedProperty.propertyType === 'Apartment' ? 'تاسيسات' :
              updatedProperty.propertyType === 'House' ? 'زراعتی' :
              updatedProperty.propertyType === 'Commercial' ? 'تجارتی' :
              updatedProperty.propertyType === 'Land' ? 'للمی' :
              updatedProperty.propertyType,
        size: updatedProperty.area,
        status: updatedProperty.status || 'vacant',
        location: {
          latitude: updatedProperty.latitude,
          longitude: updatedProperty.longitude,
        },
        neighborhood: updatedProperty.neighborhood || '',
        city: updatedProperty.city || '',
        country: updatedProperty.country || ''
      };

      console.log('Transformed Property for Update:', transformedProperty);

      const result = await propertyService.updateProperty(selectedProperty._id, transformedProperty);
      
      // Update properties list
      const updatedProperties = properties.map(prop => 
        prop._id === selectedProperty._id ? result : prop
      );
      
      setProperties(updatedProperties);
      setIsEditPropertyModalOpen(false);
      setSelectedProperty(null);
    } catch (err) {
      console.error('Error updating property:', err.response ? err.response.data : err);
      alert(`Failed to update property: ${err.response ? err.response.data.message : err.message}`);
    }
  };

  // Edit property handler
  const handleEdit = (property) => {
    setSelectedProperty(property);
    setIsEditPropertyModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this property?');

    if (confirmDelete) {
      try {
        await propertyService.deleteProperty(id);
        const updatedProperties = properties.filter((prop) => prop._id !== id);
        setProperties(updatedProperties);
      } catch (err) {
        console.error('Error deleting property:', err);
        alert('Failed to delete property');
      }
    }
  };

  const handleDetails = (property) => {
    navigate(`/property/${property._id}`);
  };

  const handleCloseModal = () => {
    setIsAddPropertyModalOpen(false);
    setIsEditPropertyModalOpen(false);
    setSelectedProperty(null);
  };

  const handleAddPropertyClick = () => {
    setIsAddPropertyModalOpen(true);
  };

  // Handle property card click to navigate to details
  const handlePropertyCardClick = (propertyId) => {
    navigate(`/property-details/${propertyId}`);
  };

  // Handle property overview card click to navigate to filtered properties list
  const handleOverviewCardClick = (section) => {
    let filterType = 'type';
    let filterValue = section;

    // Check if section is a status
    const statusOptions = ['Total', 'Vacant', 'Occupied', 'Maintenance'];
    if (statusOptions.includes(section)) {
      filterType = 'status';
      filterValue = section.toLowerCase();
    }

    console.log(`Navigating with filter: ${filterType} = ${filterValue}`);

    navigate('/properties-filtered', { 
      state: { 
        filterType,
        filterValue
      } 
    });
  };

  if (loading) return <div>Loading properties...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="properties-list-page">
      {/* Add Property Modal */}
      {isAddPropertyModalOpen && (
        <div 
          className="modal-overlay open animate-in"
          onClick={handleCloseModal}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <PropertyForm
              onSave={handleAddProperty}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}

      {/* Edit Property Modal */}
      {isEditPropertyModalOpen && (
        <div 
          className="modal-overlay open animate-in"
          onClick={handleCloseModal}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <PropertyForm
              property={selectedProperty}
              onSave={handleUpdateProperty}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}

      {/* Overview Section */}
      <div className="overview-section">
        <div className="overview-grid-container">
          <div className="overview-grid">
            <div 
              className="overview-card"
            >
              <h3>ټول ملکیتونه</h3>
              <p>{properties.length}</p>
            </div>
            <div 
              className="overview-card"
            >
              <h3>اشغال شوی</h3>
              <p>{properties.filter((prop) => prop.status?.toLowerCase()?.toLowerCase() === 'occupied').length}</p>
            </div>
            <div 
              className="overview-card"
            >
               <h3>خالی</h3>
               <p>{properties.filter((prop) => prop.status?.toLowerCase()?.toLowerCase() === 'vacant').length}</p>
            </div>
            <div 
              className="overview-card"
            >
              <h3>د ساتنې لاندې</h3>
              <p>{properties.filter((prop) => prop.status?.toLowerCase()?.toLowerCase() === 'maintenance').length}</p>
            </div>
          </div>
          
          {!loading && (
            <div className="property-type-cards">
              {Object.entries(calculatePropertyTypeSizes()).map(([type, size]) => {
                const cardStyles = {
                  'تاسيسات': {
                    gradient: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                    icon: <BusinessIcon sx={{ fontSize: 50, color: 'white', opacity: 0.7 }} />
                  },
                  'زراعتی': {
                    gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
                    icon: <HouseIcon sx={{ fontSize: 50, color: 'white', opacity: 0.7 }} />
                  },
                  'تجارتی': {
                    gradient: 'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)',
                    icon: <StoreIcon sx={{ fontSize: 50, color: 'white', opacity: 0.7 }} />
                  },
                  'للمی': {
                    gradient: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)',
                    icon: <LandscapeIcon sx={{ fontSize: 50, color: 'white', opacity: 0.7 }} />
                  }
                };

                const style = cardStyles[type];

                return (
                  <div 
                    key={type} 
                    className={`property-type-card ${type} ${selectedPropertyType === type ? 'active' : ''}`}
                    onClick={() => handleOverviewCardClick(type)}
                  >
                    <div className="card-content">
                      <div className="card-title">{type}</div>
                      <div className="card-value">{size.toLocaleString()} m²</div>
                    </div>
                    <div className="card-icon">{style.icon}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Reset Filters Button */}
      {(selectedPropertyType || selectedOverviewFilter) && (
        <div className="reset-filters-container">
          <button 
            className="reset-filters-btn"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>
      )}

      <div className="add-property-container">
        <button
          className="add-property-btn"
          onClick={handleAddPropertyClick}
        >
          + Add Property
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search properties by ID, Province, Type, or Status" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button 
            className="clear-search-btn" 
            onClick={() => setSearchTerm('')}
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Property List Section */}
      <div className="property-list-section">
        <div className="properties-list-header">
          <h2>د ملکیت لیست</h2>
        </div>
        <table className="property-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ولايت</th>
              <th>ځمکه ډول</th>
              <th>Size(sq ft)</th>
              <th>طول البلد</th>
              <th>
              عرض البلد</th>
              <th>حالت</th>
              <th>عمل</th>
            </tr>
          </thead>
          <tbody>
            {filteredPropertiesList.map((property) => (
              <tr key={property._id}>
                <td>{property._id}</td>
                <td>{property.province}</td>
                <td>{property.type}</td>
                <td>{property.size}</td>
                <td> {property.location && property.location.longitude != null ? property.location.longitude : 'Longitude not available'}</td>
                <td>{property.location.latitude}</td>
                <td>
                  <span
                    className={`status-badge ${property.status.toLowerCase()}`}
                  >
                    {property.status}
                  </span>
                </td>
                <td className="actions-column">
                  <div className="action-buttons">
                    <button
                      className="details-btn"
                      onClick={() => handleDetails(property)}
                    >
                      جزیات
                    </button>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(property)}
                    >
                      سمول
                    </button>
                    <button
                      className="delete-btn desktop-delete-btn"
                      onClick={() => handleDelete(property._id)}
                    >
                      ختمول
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPropertiesList.length === 0 && (
          <div className="no-properties-message">
            {selectedPropertyType 
              ? `No ${selectedPropertyType} properties found` 
              : selectedOverviewFilter
              ? `No ${selectedOverviewFilter} properties found`
              : searchTerm
              ? 'No properties match your search'
              : 'No properties available'}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesList;