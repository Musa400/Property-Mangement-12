import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaIdCard, 
  FaEnvelope, 
  FaPhone, 
  FaHome, 
  FaCalendar, 
  FaMoneyBill,
  FaArrowLeft,
  FaFileAlt, 
  FaDownload, 
  FaCloudUploadAlt 
} from 'react-icons/fa';
import tenantService from '../../services/tenantService';
import propertyService from '../../services/propertyService';
import '../../styles/tenentdetails.css';

function TenateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    const fetchTenantDetails = async () => {
      try {
        // Fetch tenant details
        const tenantData = await tenantService.getTenantById(id);
        setTenant(tenantData);

        // Fetch property details if propertyId exists
        if (tenantData.propertyId) {
          console.log('Attempting to fetch property with ID:', tenantData.propertyId);
          
          // Ensure propertyId is a string
          const propertyId = typeof tenantData.propertyId === 'object' 
            ? tenantData.propertyId._id || tenantData.propertyId.toString() 
            : tenantData.propertyId;

          console.log('Normalized Property ID:', propertyId);

          if (propertyId) {
            const propertyData = await propertyService.getPropertyById(propertyId);
            setProperty(propertyData);
          } else {
            console.warn('No valid property ID found');
          }
        } else {
          console.warn('No propertyId found in tenant data');
        }

        // Fetch documents for the tenant
        try {
          const fetchedDocuments = await tenantService.getTenantDocuments(tenantData._id);
          console.log('Fetched Documents:', fetchedDocuments);
          setDocuments(fetchedDocuments);
        } catch (docError) {
          console.error('Error fetching tenant documents:', docError);
        }

        setLoading(false);
      } catch (err) {
        console.error('Full Error Details:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load tenant details');
        setLoading(false);
      }
    };

    fetchTenantDetails();
  }, [id]);

  const goBackToTenantList = () => {
    navigate('/tenant-list');
  };

  const handleDocumentUpload = async (file, documentType) => {
    try {
      // Log file details before upload
      console.log('Attempting to upload file:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType || 'Other');

      // Log FormData contents for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`FormData - ${key}:`, value);
      }

      const uploadedDocument = await tenantService.uploadTenantDocument(tenant._id, formData);
      
      // Add the new document to the list
      setDocuments(prevDocuments => [...prevDocuments, uploadedDocument.document]);
      setUploadError(null);
    } catch (error) {
      // Detailed error logging
      console.error('Document Upload Error:', {
        message: error.message,
        type: error.type,
        response: error.response,
        status: error.status
      });

      // User-friendly error handling
      let errorMessage = 'Failed to upload document';
      switch (error.type) {
        case 'FILE_SIZE_ERROR':
          errorMessage = 'File is too large. Maximum size is 5MB.';
          break;
        case 'FILE_TYPE_ERROR':
          errorMessage = 'Invalid file type. Allowed types are: JPEG, PNG, PDF, DOC, DOCX.';
          break;
        case 'VALIDATION_ERROR':
          errorMessage = 'Invalid document details. Please check your input.';
          break;
        case 'UPLOAD_ERROR':
          errorMessage = 'Failed to upload to cloud storage. Please try again.';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred during upload.';
      }
      
      setUploadError(errorMessage);
    }
  };

  if (loading) return <div className="tenant-details-loading">Loading tenant details...</div>;
  if (error) return <div className="tenant-details-error">{error}</div>;
  if (!tenant) return <div className="tenant-details-error">No tenant found</div>;

  return (
    <div className="tenant-details-container">
      <div className="tenant-details-header">
        <h1>Tenant Details</h1>
        <button onClick={goBackToTenantList} className="back-button">
          <FaArrowLeft /> Back to Tenant List
        </button>
      </div>

      <div className="tenant-details-content">
        <div className="tenant-personal-info">
          <div className="tenant-details-section-title">
            <FaIdCard /> Personal Information
          </div>
          <dl className="tenant-details-info-grid">
            <dt>Tenant ID</dt>
            <dd>{tenant._id}</dd>
            
            <dt>Property ID</dt>
            <dd>{tenant.propertyId || 'N/A'}</dd>
            
            <dt>Full Name</dt>
            <dd>{tenant.firstName} {tenant.lastName}</dd>
            
           
            
            <dt>Phone Number</dt>
            <dd>{tenant.contactInfo?.phone || 'N/A'}</dd>
            
            <dt>National ID</dt>
            <dd>{tenant.nationalId}</dd>
            
           
          </dl>
        </div>

        <div className="tenant-property-info">
          <div className="tenant-details-section-title">
            <FaHome /> Property Details
          </div>
          {property ? (
            <dl className="tenant-details-info-grid">
              <dt>Property Name</dt>
              <dd>{property.title || 'N/A'}</dd>
              
              <dt>Property Address</dt>
              <dd>{property.address}</dd>
              
              <dt>Property Type</dt>
              <dd>{property.type || 'N/A'}</dd>
              
              <dt>Unit Details</dt>
              <dd>
                {property.bedrooms > 0 || property.bathrooms > 0 
                  ? `${property.bedrooms > 0 ? `${property.bedrooms} Bedroom` : ''} 
                     ${property.bathrooms > 0 ? ` ${property.bathrooms} Bathroom` : ''}`.trim()
                  : (
                    property.size 
                      ? `Property Size: ${property.size} sq. ft.`
                      : 'No specific unit details available'
                  )
                }
              </dd>
              
              {(property.city || property.neighborhood) && (
                <dt>Location</dt>
              )}
              <dd>
                {property.neighborhood ? `${property.neighborhood}, ` : ''}
                {property.city || 'N/A'}
              </dd>
            </dl>
          ) : (
            <p>No property information available</p>
          )}

          <div className="tenant-lease-status">
            <span>Lease Status</span>
            <span 
              className={`lease-status-badge ${
                new Date(tenant.leaseEndDate) > new Date() ? 'active' : 'expired'
              }`}
            >
              {new Date(tenant.leaseEndDate) > new Date() ? 'Active' : 'Expired'}
            </span>
          </div>

          <div className="tenant-payment-status">
            <span>Payment Status</span>
            <span 
              style={{
                color: 
                  tenant.paymentStatus === 'Overdue' ? 'red' :
                  tenant.paymentStatus === 'Partial' ? 'orange' :
                  tenant.paymentStatus === 'Paid' ? 'green' :
                  'default',
                fontWeight: 'bold',
                padding: '5px 10px',
                borderRadius: '4px',
                backgroundColor: 
                  tenant.paymentStatus === 'Overdue' ? '#ffebee' :
                  tenant.paymentStatus === 'Partial' ? '#fff3e0' :
                  tenant.paymentStatus === 'Paid' ? '#e8f5e9' :
                  '#f5f5f5'
              }}
            >
              {tenant.paymentStatus || 'Pending'}
            </span>
          </div>

          <dl className="tenant-details-info-grid">
            <dt>Monthly Rent</dt>
            <dd>{tenant.monthlyRent ?? 'N/A'}</dd>

            {/* <dt>Security Deposit</dt>
            <dd>${tenant.securityDeposit}</dd> */}

            <dt>Lease Start Date</dt>
            <dd>{new Date(tenant.leaseStartDate).toLocaleDateString()}</dd>
            
            <dt>Lease End Date</dt>
            <dd>{new Date(tenant.leaseEndDate).toLocaleDateString()}</dd>
          </dl>
        </div>

        {/* <div className="tenant-documents-section">
          <div className="section-header">
            <FaFileAlt /> Documents
            <label className="upload-document-btn">
              <FaCloudUploadAlt /> Upload Document
              <input 
                type="file" 
                hidden 
                onChange={(event) => handleDocumentUpload(event.target.files[0], prompt('Enter document type (Lease/ID/Proof of Income/Other):'))} 
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </label>
          </div>
          
          {uploadError && <div className="error-message">{uploadError}</div>}
          
          {documents.length === 0 ? (
            <p>No documents uploaded yet</p>
          ) : (
            <div className="documents-grid">
              {documents.map((doc, index) => (
                <div key={index} className="document-card">
                  <div className="document-info">
                    <FaFileAlt className="document-icon" />
                    <div>
                      <h4>{doc.name}</h4>
                      <p>Type: {doc.documentType}</p>
                      <p>Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <a 
                    href={doc.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="download-btn"
                  >
                    <FaDownload /> Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
}

export default TenateDetails;