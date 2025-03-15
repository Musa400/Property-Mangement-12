import React, { useState, useEffect, useRef } from 'react';
import { 
  pdf, 
  Page, 
  Text, 
  View, 
  Document, 
  StyleSheet
} from '@react-pdf/renderer';
import * as XLSX from 'xlsx';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  FaFilePdf, 
  FaFileExcel, 
  FaFilter, 
  FaPrint 
} from 'react-icons/fa';

import rentPaymentService from '../../services/rentPaymentService';

const FinancialReport = () => {
  const [reportData, setReportData] = useState({
    totalRentCollected: 0,
    outstandingPayments: 0,
    maintenanceCosts: 0,
    netProfit: 0,
    totalExpenses: 0,
    propertyIncomeBreakdown: [],
    monthlyTrends: []
  });

  const [filters, setFilters] = useState({
    period: 'monthly', // monthly, quarterly, yearly
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date()
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchFinancialReportData();
  }, [filters]);

  const fetchFinancialReportData = async () => {
    setIsLoading(true);
    try {
      const rentPaymentsData = await rentPaymentService.getRentPayments(filters);
      
      const totalRentCollected = rentPaymentsData.reduce((total, payment) => 
        total + parseFloat(payment.rentAmount || 0), 0);
      
      const outstandingPayments = rentPaymentsData.reduce((total, payment) => 
        total + (payment.paymentStatus !== 'Paid' ? parseFloat(payment.rentAmount || 0) : 0), 0);
      
      const maintenanceCosts = rentPaymentsData.reduce((total, payment) => 
        total + parseFloat(payment.maintenanceCost || 0), 0);
      
      const propertyIncomeBreakdown = processPropertyIncomeBreakdown(rentPaymentsData);
      const monthlyTrends = processMonthlyTrends(rentPaymentsData);

      setReportData({
        totalRentCollected,
        outstandingPayments,
        maintenanceCosts,
        netProfit: totalRentCollected - maintenanceCosts,
        totalExpenses: maintenanceCosts,
        propertyIncomeBreakdown,
        monthlyTrends
      });
    } catch (error) {
      console.error('Error fetching financial report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processPropertyIncomeBreakdown = (payments) => {
    console.log('Raw Payments Data:', payments); // Log raw payments for debugging
    const propertyMap = {};
    payments.forEach(payment => {
      // Log each payment's details to understand why they're Unassigned
      console.log('Payment Details:', {
        rentAmount: payment.rentAmount,
        propertyAddress: payment.propertyAddress,
        paymentDate: payment.paymentDate
      });

      const propertyKey = payment.propertyAddress || 'Unassigned';
      if (!propertyMap[propertyKey]) {
        propertyMap[propertyKey] = { 
          property: propertyKey, 
          totalRent: 0, 
          maintenanceCost: 0 
        };
      }
      propertyMap[propertyKey].totalRent += parseFloat(payment.rentAmount || 0);
      propertyMap[propertyKey].maintenanceCost += parseFloat(payment.maintenanceCost || 0);
    });

    const processedBreakdown = Object.values(propertyMap);
    
    // If all properties are Unassigned, log a warning
    if (processedBreakdown.length === 1 && processedBreakdown[0].property === 'Unassigned') {
      console.warn('All rent payments are categorized as Unassigned. This might indicate a data issue.');
    }

    return processedBreakdown;
  };

  const processMonthlyTrends = (payments) => {
    const monthlyData = {};
    payments.forEach(payment => {
      const month = new Date(payment.paymentDate).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlyData[month]) {
        monthlyData[month] = { 
          month, 
          revenue: 0, 
          expenses: 0 
        };
      }
      monthlyData[month].revenue += parseFloat(payment.rentAmount || 0);
      monthlyData[month].expenses += parseFloat(payment.maintenanceCost || 0);
    });
    return Object.values(monthlyData).slice(-6); // Last 6 months
  };

  const exportToPDF = async () => {
    const MyDocument = (
      <Document>
        <Page style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Financial Report</Text>
            <Text style={styles.subtitle}>
              {filters.startDate.toLocaleDateString()} - {filters.endDate.toLocaleDateString()}
            </Text>
          </View>
          <View>
            <Text>Total Rent Collected: ${reportData.totalRentCollected.toLocaleString()}</Text>
            <Text>Outstanding Payments: ${reportData.outstandingPayments.toLocaleString()}</Text>
            <Text>Maintenance Costs: ${reportData.maintenanceCosts.toLocaleString()}</Text>
            <Text>Net Profit: ${reportData.netProfit.toLocaleString()}</Text>
          </View>
        </Page>
      </Document>
    );

    // Generate PDF
    const blob = await pdf(MyDocument).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'financial_report.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData.propertyIncomeBreakdown);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Property Income');
    XLSX.writeFile(workbook, 'financial_report.xlsx');
  };

  return (
    <div className="financial-report-container">
      <div className="report-header">
        <h1>Financial Report</h1>
        <div className="report-actions">
          <button onClick={() => setFilters(prev => ({ ...prev, period: 'monthly' }))}>
            Monthly
          </button>
          <button onClick={() => setFilters(prev => ({ ...prev, period: 'quarterly' }))}>
            Quarterly
          </button>
          <button onClick={() => setFilters(prev => ({ ...prev, period: 'yearly' }))}>
            Yearly
          </button>
          <button onClick={exportToPDF}>
            <FaFilePdf /> PDF
          </button>
          <button onClick={exportToExcel}>
            <FaFileExcel /> Excel
          </button>
          <button onClick={window.print}>
            <FaPrint /> Print
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="report-content">
          <div className="financial-summary">
            <div className="summary-card">
              <h3>Total Rent Collected</h3>
              <p>${reportData.totalRentCollected.toLocaleString()}</p>
            </div>
            <div className="summary-card">
              <h3>Outstanding Payments</h3>
              <p>${reportData.outstandingPayments.toLocaleString()}</p>
            </div>
            <div className="summary-card">
              <h3>Maintenance Costs</h3>
              <p>${reportData.maintenanceCosts.toLocaleString()}</p>
            </div>
            <div className="summary-card">
              <h3>Net Profit</h3>
              <p>${reportData.netProfit.toLocaleString()}</p>
            </div>
          </div>

          <div className="report-charts">
            <div className="chart-card">
              <h3>Monthly Revenue Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#3498db" name="Revenue" />
                  <Bar dataKey="expenses" fill="#e74c3c" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Property Income Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.propertyIncomeBreakdown}
                    dataKey="totalRent"
                    nameKey="property"
                    fill="#8884d8"
                  >
                    {reportData.propertyIncomeBreakdown.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`hsl(${index * 360 / reportData.propertyIncomeBreakdown.length}, 70%, 50%)`} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="property-income-table">
            <h3>Property Income Details</h3>
            <table>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Total Rent</th>
                  <th>Maintenance Cost</th>
                  <th>Net Income</th>
                </tr>
              </thead>
              <tbody>
                {reportData.propertyIncomeBreakdown.map((property, index) => (
                  <tr key={index}>
                    <td>{property.property}</td>
                    <td>${property.totalRent.toLocaleString()}</td>
                    <td>${property.maintenanceCost.toLocaleString()}</td>
                    <td>${(property.totalRent - property.maintenanceCost).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialReport;

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: 12,
    color: '#666'
  }
});