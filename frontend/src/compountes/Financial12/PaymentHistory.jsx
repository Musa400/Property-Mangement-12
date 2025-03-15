import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// import rentPaymentService from '../../services/rentPaymentService';
import tenantService from '../../services/tenantService';

const PaymentHistory = () => {
  const location = useLocation();
  const [tenantPayments, setTenantPayments] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [tenants, setTenants] = useState([]);
  const [rentPaymentsList, setRentPaymentsList] = useState([]);

  useEffect(() => {
    const fetchTenantsAndPayments = async () => {
      try {
        // Fetch all tenants
        const allTenants = await tenantService.getAllTenants();
        
        // Fetch all rent payments
        const payments = await rentPaymentService.getRentPayments();
        
        // Get unique tenant names from payments
        const tenantsWithPayments = [...new Set(
          payments.map(payment => payment.tenantName)
        )];
        
        // Filter tenants to only include those with payments
        const filteredTenants = allTenants.filter(tenant => 
          tenantsWithPayments.includes(`${tenant.firstName} ${tenant.lastName}`)
        );

        setTenants(filteredTenants);
        setRentPaymentsList(payments);

        // Check if a tenant was passed via navigation state
        const preSelectedTenant = location.state?.tenantName;
        if (preSelectedTenant) {
          setSelectedTenant(preSelectedTenant);
          await handleTenantSelect(preSelectedTenant);
        }
      } catch (error) {
        console.error('Error fetching tenants and payments:', error);
      }
    };

    fetchTenantsAndPayments();
  }, [location.state]);

  const handleTenantSelect = async (tenantName) => {
    try {
      // Fetch full payment history for the selected tenant
      const paymentHistory = await rentPaymentService.getRentPaymentHistory(tenantName);
      
      // Use the original payment history without sorting or filtering
      setTenantPayments(paymentHistory.paymentHistory);
      setSelectedTenant(tenantName);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      alert('Failed to fetch payment history');
    }
  };

  return (
    <div className="payment-history-container">
      <h2>Payment History</h2>
      
      <div className="tenant-selector">
        <label htmlFor="tenant-select">Select Tenant:</label>
        <select 
          id="tenant-select"
          value={selectedTenant}
          onChange={(e) => handleTenantSelect(e.target.value)}
        >
          <option value="">-- Select a Tenant --</option>
          {tenants.map((tenant) => (
            <option 
              key={tenant._id} 
              value={`${tenant.firstName} ${tenant.lastName}`}
            >
              {`${tenant.firstName} ${tenant.lastName}`}
            </option>
          ))}
        </select>
      </div>

      {selectedTenant && (
        <div className="payment-history-table">
          <h3>Payment History for {selectedTenant}</h3>
          <table>
            <thead>
              <tr>
                <th>Rent Period</th>
                <th>Amount</th>
                <th>Payment Date</th>
                <th>Payment Method</th>
              </tr>
            </thead>
            <tbody>
              {tenantPayments.map((payment, index) => (
                <tr key={index}>
                  <td>{payment.rentPeriod}</td>
                  <td>${payment.rentAmount.toFixed(2)}</td>
                  <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                  <td>{payment.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;