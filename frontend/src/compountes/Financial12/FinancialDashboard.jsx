import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, 
  ComposedChart, Line, Area, 
  PieChart, Pie, Cell, Sector,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LabelList
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion'; // Corrected import
import { 
  FaWallet, FaChartLine, FaReceipt, 
  FaHome, FaChartPie, FaFileInvoiceDollar 
} from 'react-icons/fa';
import './DashBoard.css';
import rentPaymentService from '../../services/rentPaymentService';

// Advanced Custom Tooltip
const AdvancedTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          border: 'none',
          minWidth: '250px'
        }}
      >
        <h4 style={{ 
          marginBottom: '15px', 
          color: '#2c3e50', 
          borderBottom: '2px solid #f1f3f5',
          paddingBottom: '10px'
        }}>
          {label}
        </h4>
        {payload.map((entry, index) => (
          <div 
            key={`item-${index}`}
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                backgroundColor: entry.color,
                borderRadius: '50%'
              }}/>
              <span style={{ color: '#718096' }}>{entry.name}</span>
            </div>
            <strong style={{ color: entry.color }}>
              ${entry.value.toLocaleString()}
            </strong>
          </div>
        ))}
      </motion.div>
    );
  }
  return null;
};

// Animated Pie Chart with Active Sector
const AnimatedPieChart = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const COLORS = [
    '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
    '#9b59b6', '#1abc9c', '#34495e'
  ];

  const renderActiveShape = (props) => {
    const { 
      cx, cy, midAngle, innerRadius, outerRadius, 
      startAngle, endAngle, fill, payload, percent 
    } = props;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 20}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.8}
        />
        <text 
          x={cx} 
          y={cy} 
          dy={-10} 
          textAnchor="middle" 
          fill="#2c3e50"
          style={{ fontWeight: 'bold' }}
        >
          {payload.name}
        </text>
        <text 
          x={cx} 
          y={cy} 
          dy={20} 
          textAnchor="middle" 
          fill="#718096"
        >
          {`${(percent * 100).toFixed(1)}%`}
        </text>
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={data}
          innerRadius={60}
          outerRadius={90}
          fill="#8884d8"
          dataKey="value"
          onMouseEnter={onPieEnter}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
            />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

const FinancialDashboard = () => {
  const [financialData, setFinancialData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    outstandingPayments: 0,
    maintenanceCosts: 0,
    occupancyRate: 0,
    totalRentPayments: 0
  });

  const [monthlyData, setMonthlyData] = useState([]);
  const [expenseCategoriesData, setExpenseCategoriesData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [rentPayments, setRentPayments] = useState([]);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const rentPaymentsData = await rentPaymentService.getRentPayments();
        console.log('Raw Rent Payments:', rentPaymentsData);

        if (!rentPaymentsData || rentPaymentsData.length === 0) {
          console.warn('No rent payments data received');
          return;
        }

        setRentPayments(rentPaymentsData);

        // Calculate comprehensive financial metrics
        const totalRentPayments = rentPaymentsData.reduce((total, payment) => 
          total + parseFloat(payment.rentAmount || 0), 0);
        
        const maintenanceCosts = rentPaymentsData.reduce((total, payment) => 
          total + parseFloat(payment.maintenanceCost || 0), 0);
        
        const outstandingPayments = rentPaymentsData.reduce((total, payment) => 
          total + (payment.paymentStatus !== 'Paid' ? parseFloat(payment.rentAmount || 0) : 0), 0);
        
        const totalProperties = new Set(rentPaymentsData.map(p => p.propertyId)).size;
        const occupiedProperties = new Set(rentPaymentsData.filter(p => p.paymentStatus === 'Paid').map(p => p.propertyId)).size;
        const occupancyRate = totalProperties > 0 ? (occupiedProperties / totalProperties) * 100 : 0;

        setFinancialData(prevData => ({
          ...prevData,
          totalIncome: totalRentPayments,
          maintenanceCosts: maintenanceCosts,
          outstandingPayments: outstandingPayments,
          netProfit: totalRentPayments - maintenanceCosts,
          occupancyRate: occupancyRate.toFixed(1),
          totalRentPayments: totalRentPayments
        }));

        const monthlyRentData = processMonthlyRentData(rentPaymentsData);
        console.log('Processed Monthly Data:', monthlyRentData);
        setMonthlyData(monthlyRentData);

        const expenseCategories = processExpenseCategories(rentPaymentsData);
        console.log('Processed Expense Categories:', expenseCategories);
        setExpenseCategoriesData(expenseCategories);

        const rentTransactions = rentPaymentsData.map(payment => ({
          date: payment.paymentDate || new Date().toISOString(),
          description: `Rent - ${payment.tenantName}`,
          category: 'Rent',
          amount: parseFloat(payment.rentAmount || 0),
          type: 'income'
        }));

        setTransactions(rentTransactions);

      } catch (error) {
        console.error('Error fetching financial data:', error);
      }
    };

    fetchFinancialData();
  }, []);

  const processMonthlyRentData = (payments) => {
    const monthlyData = {};
    
    payments.forEach(payment => {
      const paymentDate = payment.paymentDate ? new Date(payment.paymentDate) : new Date();
      
      const monthKey = paymentDate instanceof Date && !isNaN(paymentDate) 
        ? paymentDate.toLocaleString('default', { month: 'short', year: 'numeric' }) 
        : 'Unknown';
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, revenue: 0 };
      }
      
      monthlyData[monthKey].revenue += parseFloat(payment.rentAmount || 0);
    });

    return Object.values(monthlyData).slice(-5);
  };

  const processExpenseCategories = (payments) => {
    const categoryMap = {};
    const colors = [
      '#3498db',  // Vibrant Blue
      '#2ecc71',  // Emerald Green
      '#e74c3c',  // Bright Red
      '#f39c12',  // Sunflower Yellow
      '#9b59b6',  // Amethyst Purple
      '#1abc9c',  // Turquoise
      '#34495e'   // Dark Blue-Gray
    ];

    payments.forEach(payment => {
      const category = payment.propertyAddress || payment.propertyId || 'Uncategorized';
      
      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }
      
      categoryMap[category] += parseFloat(payment.rentAmount || 0);
    });

    return Object.entries(categoryMap).map(([name, value], index) => ({
      name, 
      value, 
      color: colors[index % colors.length]
    }));
  };

  // Enhanced data preparation
  const prepareAdvancedChartData = () => {
    if (monthlyData.length === 0) return [];

    return monthlyData.map(item => ({
      month: item.month,
      revenue: item.revenue,
      projectedRevenue: item.revenue * 1.05,
      expenses: item.revenue * 0.3,
      netProfit: item.revenue * 0.7,
      riskFactor: Math.random() * 10 // Simulated risk assessment
    }));
  };

  const advancedChartData = prepareAdvancedChartData();

  return (
    <div className="financial-dashboard">
      <div className="dashboard-grid">
        <div className="metrics-container">
          <div className="metric-card income">
            <div className="metric-header">
              <FaWallet className="metric-icon" />
              <h3>Total Income</h3>
            </div>
            <p className="metric-value">${financialData.totalIncome.toLocaleString()}</p>
          </div>
          <div className="metric-card expenses">
            <div className="metric-header">
              <FaChartPie className="metric-icon" />
              <h3>Total Expenses</h3>
            </div>
            <p className="metric-value">${financialData.maintenanceCosts.toLocaleString()}</p>
          </div>
          <div className="metric-card occupancy">
            <div className="metric-header">
              <FaFileInvoiceDollar className="metric-icon" />
              <h3>Occupancy Rate</h3>
            </div>
            <p className="metric-value">{financialData.occupancyRate}%</p>
          </div>
          <div className="metric-card total-rent-payments">
            <div className="metric-header">
              <FaWallet className="metric-icon" />
              <h3>Total Rent Payments</h3>
            </div>
            <p className="metric-value">${financialData.totalRentPayments.toLocaleString()}</p>
          </div>
        </div>

        <div className="charts-container">
          {/* Advanced Composed Chart */}
          <motion.div 
            className="chart-card financial-overview"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3>Comprehensive Financial Insights</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={advancedChartData}>
                <CartesianGrid 
                  stroke="#f0f0f0" 
                  strokeDasharray="3 3" 
                  vertical={false}
                />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#718096', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#718096', fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip content={<AdvancedTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  iconType="circle"
                />
                <Bar 
                  dataKey="revenue" 
                  barSize={40} 
                  fill="#3498db" 
                  name="Actual Revenue"
                  radius={[10, 10, 0, 0]}
                />
                <Line 
                  type="monotone" 
                  dataKey="projectedRevenue" 
                  stroke="#2ecc71" 
                  name="Projected Revenue"
                  strokeWidth={3}
                  dot={false}
                />
                <Area 
                  type="monotone" 
                  dataKey="netProfit" 
                  fill="#9b59b6" 
                  name="Net Profit"
                  opacity={0.3}
                />
                <Line 
                  type="monotone" 
                  dataKey="riskFactor" 
                  stroke="#e74c3c" 
                  name="Risk Factor"
                  strokeDasharray="5 5"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Animated Expense Breakdown */}
          <motion.div 
            className="chart-card expense-breakdown"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3>Expense Distribution</h3>
            <AnimatedPieChart data={expenseCategoriesData} />
          </motion.div>

          {/* Monthly Rent Revenue */}
          <div className="chart-card bar-chart">
            <h3>Monthly Rent Revenue</h3>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid 
                    stroke="#f0f0f0" 
                    strokeDasharray="3 3" 
                    vertical={false} 
                  />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#718096', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#718096', fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }} 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                    }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="#3498db" 
                    radius={[10, 10, 0, 0]} 
                    barSize={40}
                  >
                    <LabelList 
                      dataKey="revenue" 
                      position="top" 
                      fill="#718096" 
                      formatter={(value) => `$${value.toFixed(0)}`}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>No monthly data available</p>
            )}
          </div>

          {/* Rent by Property */}
          <div className="chart-card pie-chart">
            <h3>Rent by Property</h3>
            {expenseCategoriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseCategoriesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseCategoriesData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke="none"
                      />
                    ))}
                    <LabelList 
                      dataKey="name" 
                      position="outside" 
                      fill="#718096"
                      fontSize={12}
                    />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p>No property data available</p>
            )}
          </div>
        </div>

        <div className="transactions-container">
          <div className="transactions-card">
            <h3>Recent Transactions</h3>
            {transactions.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, index) => (
                    <tr key={index}>
                      <td>{transaction.date}</td>
                      <td>{transaction.description}</td>
                      <td>{transaction.category}</td>
                      <td className={`amount ${transaction.type}`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No transactions found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
