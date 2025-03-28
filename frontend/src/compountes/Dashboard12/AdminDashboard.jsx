// import React, { useState, useEffect } from 'react';
// import { 
//   BarChart, 
//   Bar, 
//   XAxis, 
//   YAxis, 
//   CartesianGrid, 
//   Tooltip, 
//   Legend, 
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   PieChart,
//   Pie,
//   Cell
// } from 'recharts';
// import propertyService from '../../services/propertyService';
// import tenantService from '../../services/tenantService';
// import './admin.css';
// import { Card, Table, Tag, Button, Modal, Form, Input, Select } from 'antd';

// // Import icons individually
// import * as Icon from 'react-icons/bs';

// const { Option } = Select;

// const AdminDashboard = () => {
//   const [metrics, setMetrics] = useState({
//     totalProperties: 0,
//     activeTenants: 0,
//     totalPayments: 0,
//     pendingPayments: 0,
//     overduePayments: 0,
//     vacantProperties: 0,
//     underMaintenance: 0
//   });
//   const [propertyData, setPropertyData] = useState([]);
//   const [paymentData, setPaymentData] = useState([]);
//   const [tenantData, setTenantData] = useState([]);
//   const [selectedProperty, setSelectedProperty] = useState(null);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [mapCenter, setMapCenter] = useState({ lat: 25.2048, lng: 55.2708 });
//   const [mapZoom, setMapZoom] = useState(12);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       // Fetch properties
//       const properties = await propertyService.getAllProperties();
//       const vacantProperties = properties.filter(p => p.status === 'vacant').length;
//       const underMaintenance = properties.filter(p => p.status === 'maintenance').length;
      
//       // Fetch tenants
//       const tenants = await tenantService.getAllTenants();
//       const activeTenants = tenants.filter(t => t.status === 'active').length;
//       const overdueTenants = tenants.filter(t => t.paymentStatus === 'overdue').length;
      
//       // Fetch payments
//       const payments = await fetchPayments();
//       const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
//       const pendingPayments = payments.filter(p => p.status === 'pending').length;
//       const overduePayments = payments.filter(p => p.status === 'overdue').length;
      
//       setMetrics(prev => ({ 
//         ...prev, 
//         totalProperties: properties.length,
//         activeTenants,
//         totalPayments,
//         pendingPayments,
//         overduePayments,
//         vacantProperties,
//         underMaintenance
//       }));
      
//       setPropertyData(preparePropertyData(properties));
//       setPaymentData(preparePaymentData(payments));
//       setTenantData(prepareTenantData(tenants));
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//     }
//   };

//   const preparePropertyData = (properties) => {
//     return properties.map(prop => ({
//       name: prop.name,
//       status: prop.status,
//       rent: prop.rentAmount,
//       location: prop.location
//     }));
//   };

//   const preparePaymentData = (payments) => {
//     const monthlyData = {};
//     payments.forEach(payment => {
//       const date = new Date(payment.date);
//       const month = date.getMonth();
//       const year = date.getFullYear();
//       const key = `${year}-${month}`;
      
//       if (!monthlyData[key]) {
//         monthlyData[key] = { month: `${month + 1}/${year}`, amount: 0 };
//       }
//       monthlyData[key].amount += payment.amount;
//     });
    
//     return Object.values(monthlyData);
//   };

//   const prepareTenantData = (tenants) => {
//     return tenants.map(tenant => ({
//       id: tenant._id,
//       name: `${tenant.firstName} ${tenant.lastName}`,
//       status: tenant.status,
//       paymentStatus: tenant.paymentStatus,
//       property: tenant.propertyName
//     }));
//   };

//   const handlePropertySelect = (property) => {
//     setSelectedProperty(property);
//     setMapCenter({
//       lat: parseFloat(property.location.lat),
//       lng: parseFloat(property.location.lng)
//     });
//     setMapZoom(15);
//     setIsModalVisible(true);
//   };

//   const handleAssignTenant = async (propertyId, tenantId) => {
//     try {
//       await tenantService.assignTenantToProperty(tenantId, propertyId);
//       fetchDashboardData();
//     } catch (error) {
//       console.error('Error assigning tenant:', error);
//     }
//   };

//   const propertyStatusColors = {
//     occupied: '#2db7f5',
//     vacant: '#87d068',
//     maintenance: '#ff6b6b'
//   };

//   const tenantStatusColors = {
//     active: '#2db7f5',
//     overdue: '#ff6b6b',
//     pending: '#108ee9'
//   };

//   return (
//     <div className="admin-dashboard">
//       <div className="dashboard-header">
//         <h1>Admin Dashboard</h1>
//       </div>

//       {/* Metrics Section */}
//       <div className="metrics-grid">
//         <MetricCard 
//           icon={<Icon.Building />} 
//           title="Total Properties" 
//           value={metrics.totalProperties}
//         />
//         <MetricCard 
//           icon={<Icon.Person />} 
//           title="Active Tenants" 
//           value={metrics.activeTenants}
//         />
//         <MetricCard 
//           icon={<Icon.Cash />} 
//           title="Total Rent Collected" 
//           value={`${metrics.totalPayments} AED`}
//         />
//         <MetricCard 
//           icon={<Icon.ClockFill />} 
//           title="Pending Payments" 
//           value={metrics.pendingPayments}
//         />
//         <MetricCard 
//           icon={<Icon.ExclamationCircleFill />} 
//           title="Overdue Payments" 
//           value={metrics.overduePayments}
//         />
//         <MetricCard 
//           icon={<Icon.MapFill />} 
//           title="Vacant Properties" 
//           value={metrics.vacantProperties}
//         />
//         <MetricCard 
//           icon={<Icon.CalendarFill />} 
//           title="Under Maintenance" 
//           value={metrics.underMaintenance}
//         />
//       </div>

//       {/* Charts Section */}
//       <div className="charts-section">
//         {/* Payment Trends Chart */}
//         <div className="chart-container">
//           <h3>Payment Trends</h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={paymentData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="month" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Line 
//                 type="monotone" 
//                 dataKey="amount" 
//                 stroke="#8884d8" 
//                 activeDot={{ r: 8 }}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Property Status Distribution */}
//         <div className="chart-container">
//           <h3>Property Status Distribution</h3>
//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie
//                 data={[
//                   { name: 'Occupied', value: metrics.totalProperties - metrics.vacantProperties - metrics.underMaintenance },
//                   { name: 'Vacant', value: metrics.vacantProperties },
//                   { name: 'Maintenance', value: metrics.underMaintenance }
//                 ]}
//                 cx="50%"
//                 cy="50%"
//                 innerRadius={60}
//                 outerRadius={80}
//                 fill="#8884d8"
//                 paddingAngle={5}
//                 dataKey="value"
//               >
//                 {[
//                   { name: 'Occupied', color: '#2db7f5' },
//                   { name: 'Vacant', color: '#87d068' },
//                   { name: 'Maintenance', color: '#ff6b6b' }
//                 ].map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={entry.color} />
//                 ))}
//               </Pie>
//               <Tooltip />
//               <Legend />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Property Management Section */}
//       <div className="section">
//         <h2>Property Management</h2>
//         <div className="property-grid">
//           {propertyData.map((property, index) => (
//             <div key={index} className="property-card" onClick={() => handlePropertySelect(property)}>
//               <div className="property-header">
//                 <h3>{property.name}</h3>
//                 <Tag color={propertyStatusColors[property.status]}>
//                   {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
//                 </Tag>
//               </div>
//               <p>Rent: {property.rent} AED</p>
//               <p>Location: {property.location.address}</p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Tenant Management Section */}
//       <div className="section">
//         <h2>Tenant Management</h2>
//         <Table
//           dataSource={tenantData}
//           columns={[
//             {
//               title: 'Name',
//               dataIndex: 'name',
//               key: 'name',
//             },
//             {
//               title: 'Status',
//               dataIndex: 'status',
//               key: 'status',
//               render: (status) => (
//                 <Tag color={tenantStatusColors[status]}>
//                   {status.charAt(0).toUpperCase() + status.slice(1)}
//                 </Tag>
//               ),
//             },
//             {
//               title: 'Payment Status',
//               dataIndex: 'paymentStatus',
//               key: 'paymentStatus',
//               render: (status) => (
//                 <Tag color={tenantStatusColors[status]}>
//                   {status.charAt(0).toUpperCase() + status.slice(1)}
//                 </Tag>
//               ),
//             },
//             {
//               title: 'Property',
//               dataIndex: 'property',
//               key: 'property',
//             },
//             {
//               title: 'Actions',
//               key: 'actions',
//               render: (text, record) => (
//                 <Button
//                   type="primary"
//                   onClick={() => handleAssignTenant(record.propertyId, record.id)}
//                 >
//                   Assign Property
//                 </Button>
//               ),
//             },
//           ]}
//         />
//       </div>

//       {/* Modal for Property Details */}
//       <Modal
//         title={selectedProperty?.name}
//         visible={isModalVisible}
//         onCancel={() => setIsModalVisible(false)}
//         width={800}
//       >
//         <div className="property-modal-content">
//           <div className="property-map">
//             <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
//               <GoogleMap
//                 mapContainerStyle={{ width: '100%', height: '400px' }}
//                 center={mapCenter}
//                 zoom={mapZoom}
//               >
//                 <></>
//               </GoogleMap>
//             </LoadScript>
//           </div>
//           <div className="property-details">
//             <p><strong>Address:</strong> {selectedProperty?.location?.address}</p>
//             <p><strong>Rent:</strong> {selectedProperty?.rent} AED</p>
//             <p><strong>Status:</strong> {selectedProperty?.status}</p>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// const MetricCard = ({ icon, title, value }) => (
//   <div className="metric-card">
//     <div className="metric-icon">{icon}</div>
//     <div className="metric-content">
//       <h3>{title}</h3>
//       <p>{value}</p>
//     </div>
//   </div>
// );

// export default AdminDashboard;