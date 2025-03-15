import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { propertyService } from '../services/propertyService';
import '../styles/PropertyDetails.css';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State for property details
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Fetch property details on component mount
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const fetchedProperty = await propertyService.getPropertyById(id);

        // Extensive logging for debugging
        console.group('Property Details Debug');
        console.log('Fetched Property:', fetchedProperty);
        console.log('Property Keys:', Object.keys(fetchedProperty));
        console.log('Latitude:', fetchedProperty.location?.latitude);
        console.log('Longitude:', fetchedProperty.location?.longitude);
        console.groupEnd();

        // Set document title to property province
        document.title = fetchedProperty.province || 'Property Details';

        setProperty(fetchedProperty);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching property details:', err);
        setError(err.message || 'Failed to fetch property details');
        setLoading(false);
      }
    };

    fetchPropertyDetails();

    // Clean up document title when component unmounts
    return () => {
      document.title = 'Property Management';
    };
  }, [id]);

  // Memoized status color function
  const getStatusColor = useMemo(() => {
    return (status) => {
      switch (status) {
        case 'occupied': return '#28a745'; // Green
        case 'vacant': return '#ffc107';   // Yellow
        case 'maintenance': return '#dc3545'; // Red
        default: return '#6c757d';         // Gray
      }
    };
  }, []);

  // Memoized map container style
  const mapContainerStyle = useMemo(() => ({
    width: '100%',
    height: '400px'
  }), []);

  // Memoized center coordinates
  const center = useMemo(() => {
    // Check if location exists, if not use default coordinates or fallback values
    const latitude = property?.location?.latitude ?? property?.latitude ?? 0;
    const longitude = property?.location?.longitude ?? property?.longitude ?? 0;
    return { lat: latitude, lng: longitude };
  }, [property]);

  // Safely get location or fallback to empty object
  const location = useMemo(() =>
    property?.location ?? {
      latitude: property?.latitude ?? 'N/A',
      longitude: property?.longitude ?? 'N/A'
    }, [property]);

  // Callback for marker click
  const onMarkerClick = useCallback(() => {
    setSelectedPlace(property);
  }, [property]);

  // Handle back button click
  const handleBack = useCallback(() => {
    navigate('/properties');
  }, [navigate]);

  // Open location in Google Maps
  const openInGoogleMaps = useCallback((latitude, longitude) => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(googleMapsUrl, '_blank');
  }, []);

  // Retrieve Google Maps API key from environment variable
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!property) return <div>Property not found</div>;

  // Ensure description is always a string, with fallback
  const propertyDescription = property.description
    ? String(property.description).trim()
    : 'No description available.';

  // Debug logging
  console.group('Property Details Debug');
  console.log('Raw Property:', property);
  console.log('Description:', property.description);
  console.log('Processed Description:', propertyDescription);
  console.groupEnd();

  return (
    <div className="property-details-page">
      {/* Back Button */}
      <div className="property-details-header">
        <button
          className="back-button"
          onClick={handleBack}
        >
          ← Back to Properties
        </button>
        <h1>Property Details</h1>
      </div>

      {/* Property Information Section */}
      <div className="section">
        <h2>Property Information</h2>
        <div className="info-grid">
          <p><strong>عنوان:</strong> {property.title || 'Untitled Property'}</p>
          <p><strong>ولايت:</strong> {property.province}</p>
          <p><strong>ادرس:</strong> {property.address}</p>
          <p><strong>ځمکه ډول:</strong> {property.type}</p>
          <p><strong>اندازه:</strong> {property.size} sq ft</p>
          <p><strong>حالت:</strong> <span style={{ color: getStatusColor(property.status) }}>{property.status}</span></p>
          <p>
            <strong>Property Value:</strong> 
            {property.propertyValue ? (
              <span style={{ 
                color: '#2ecc71', 
                fontWeight: 'bold' 
              }}>
                ${property.propertyValue.toLocaleString()}
              </span>
            ) : (
              'Value not specified'
            )}
          </p>
          <p><strong>Longitude:</strong> {property.location && property.location.longitude != null ? property.location.longitude : 'Longitude not available'}</p>
          <p><strong>Latitude:</strong> {property.location && property.location.latitude != null ? property.location.latitude : 'Latitude not available'}</p>
        </div>
      </div>

      {/* Optional: Create a more visually appealing property summary */}
      <div className="property-summary">
        <div className="summary-item">
          <span className="summary-icon">🏠</span>
          <div className="summary-details">
            <h3>{property.size} sq ft</h3>
            <p>Property Size</p>
          </div>
        </div>
        {/* <div className="summary-item">
          <span className="summary-icon">🛏️</span>
          <div className="summary-details">
            <h3>{property.bedrooms}</h3>
            <p>Bedrooms</p>
          </div>
        </div> */}
        {/* <div className="summary-item">
          <span className="summary-icon">🚿</span>
          <div className="summary-details">
            <h3>{property.bathrooms}</h3>
            <p>Bathrooms</p>
          </div>
        </div> */}
      </div>

      {/* Description Section */}
      {propertyDescription && (
        <div className="section description-section">
          <h2>Description</h2>
          <p>{property.description}</p>
        </div>
      )}

      {/* Google Satellite Map Section */}
      <div className="section map-section">
        <div className="map-header">
          <h2>Property Location</h2>
          <button
            className="open-in-maps-btn"
            onClick={() => openInGoogleMaps(
              location.latitude,
              location.longitude
            )}
            disabled={location.latitude === 'N/A' || location.longitude === 'N/A'}
          >
            Open in Google Maps
          </button>
        </div>
        <div className="map-container">
          <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={15}
              mapTypeId="satellite"
            >
              <Marker
                position={center}
                onClick={onMarkerClick}
              />

              {selectedPlace && (
                <InfoWindow
                  position={center}
                  onCloseClick={() => setSelectedPlace(null)}
                >
                  <div className="map-info-window">
                    <h3>{property.address}</h3>
                    <p>{property.neighborhood}</p>
                    <p>{property.city}, {property.country}</p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;