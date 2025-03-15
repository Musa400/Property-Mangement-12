import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import '../../styles/PropertyList.css';
import { propertyService } from '../../services/propertyService';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button
} from '@mui/material';

const PropertyFilteredList = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [propertyToDelete, setPropertyToDelete] = useState(null);
    
    // New state for search
    const [searchTerm, setSearchTerm] = useState('');

    // Extract filter criteria from navigation state
    const { filterType, filterValue } = location.state || {};

    useEffect(() => {
        const fetchFilteredProperties = async () => {
            try {
                // Fetch all properties
                const allProperties = await propertyService.getAllProperties();

                // Apply filtering based on type and value
                let filteredProps = allProperties;

                if (filterType === 'type') {
                    filteredProps = allProperties.filter(prop => prop.type === filterValue);
                } else if (filterType === 'status') {
                    filteredProps = allProperties.filter(prop => prop.status === filterValue);
                }

                setProperties(filteredProps);
                setFilteredProperties(filteredProps);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchFilteredProperties();
    }, [filterType, filterValue]);

    // Search functionality
    useEffect(() => {
        if (!searchTerm) {
            setFilteredProperties(properties);
            return;
        }

        const lowercasedSearch = searchTerm.toLowerCase();
        const filtered = properties.filter(property => 
            property.province.toLowerCase().includes(lowercasedSearch) ||
            property.type.toLowerCase().includes(lowercasedSearch) ||
            property.status.toLowerCase().includes(lowercasedSearch) ||
            property._id.toLowerCase().includes(lowercasedSearch)
        );

        setFilteredProperties(filtered);
    }, [searchTerm, properties]);

    const handleDetails = (property) => {
        navigate(`/property-details/${property._id}`);
    };

    const handleEdit = (property) => {
        navigate(`/edit-property/${property._id}`);
    };

    const confirmDelete = (property) => {
        setPropertyToDelete(property);
        setDeleteConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!propertyToDelete) return;

        try {
            await propertyService.deleteProperty(propertyToDelete._id);
            const updatedProperties = properties.filter(prop => prop._id !== propertyToDelete._id);
            setProperties(updatedProperties);
            setFilteredProperties(updatedProperties);
            setDeleteConfirmOpen(false);
            setPropertyToDelete(null);
        } catch (err) {
            console.error('Error deleting property:', err);
        }
    };

    const handleCloseDeleteDialog = () => {
        setDeleteConfirmOpen(false);
        setPropertyToDelete(null);
    };

    // Add print functionality
    const tableRef = useRef(null);

    const handlePrint = () => {
        const printWindow = window.open('', '', 'width=900,height=700');
        
        // Determine the print title dynamically based on filterType and filterValue
        const printTitle = filterType === 'type' 
            ? `${filterValue} Properties` 
            : filterType === 'status' 
            ? `${filterValue} Status Properties` 
            : 'Properties';
        
        printWindow.document.write('<html><head><title>Property List</title>');
        
        // Add some basic styling for print
        printWindow.document.write(`
            <style>
                body {
                    font-family: Arial, sans-serif;
                }
                h1 {
                    text-align: center;
                    margin-bottom: 20px;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                }
                th, td { 
                    border: 1px solid #ddd; 
                    padding: 8px; 
                    text-align: left; 
                }
                th { 
                    background-color: #f2f2f2; 
                }
                .status-badge { 
                    padding: 4px 8px; 
                    border-radius: 4px; 
                    display: inline-block;
                }
                .vacant { background-color: #e7f3fe; }
                .occupied { background-color: #dff0d8; }
            </style>
        `);
        
        printWindow.document.write('</head><body>');
        printWindow.document.write(`<h1>${printTitle}</h1>`);
        
        // Create a clone of the table to modify for printing
        const printTable = tableRef.current.cloneNode(true);
        
        // Remove ID and Actions columns from the cloned table
        const printTableRows = printTable.querySelectorAll('tr');
        
        printTableRows.forEach(row => {
            // Remove first (ID) and last (Actions) columns
            const cells = row.querySelectorAll('td, th');
            if (cells.length) {
                cells[0].remove(); // Remove ID column/header
                cells[cells.length - 1].remove(); // Remove Actions column/header
            }
        });
        
        printWindow.document.body.appendChild(printTable);
        printWindow.document.write('</body></html>');
        
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
    };

    if (loading) return <div>Loading properties...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="properties-list-page">
            <div className="add-property-container">
                <button
                    className="back-btn"
                    onClick={() => navigate('/properties')}
                >
                    ← Back to Properties
                </button>
                <button
                    className="print-btn"
                    onClick={handlePrint}
                >
                    🖨️ Print
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
            </div>

            <div className="property-list-section">
                <h2>
                    {filterType === 'type' 
                        ? `${filterValue} Properties` 
                        : filterType === 'status' 
                        ? `${filterValue} Status Properties` 
                        : 'Properties'}
                </h2>
                <table ref={tableRef} className="property-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Province</th>
                            <th>Type</th>
                            <th>Size(sq ft)</th>
                            <th>Longitude</th>
                            <th>Latitude</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProperties.map((property) => (
                            <tr key={property._id}>
                                <td>{property._id}</td>
                                <td>{property.province}</td>
                                <td>{property.type}</td>
                                <td>{property.size}</td>
                                <td>{property.location && property.location.longitude != null ? property.location.longitude : 'Longitude not available'}</td>
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
                                        <Link to={`/property/${property._id}`}>
                                            <button
                                                className="details-btn"
                                                onClick={() => handleDetails(property)}
                                            >
                                                Details
                                            </button>
                                        </Link>

                                        <button
                                            className="delete-btn desktop-delete-btn"
                                            onClick={() => confirmDelete(property)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredProperties.length === 0 && (
                    <div className="no-properties-message">
                        No properties found
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title">
                    Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description">
                        Are you sure you want to delete this property?
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color="secondary" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default PropertyFilteredList;