import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Button, 
  Dropdown, 
  Menu, 
  Typography 
} from 'antd';
import { 
  UserOutlined, 
  HomeOutlined, 
  DollarOutlined, 
  PlusOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import './admaindashboard.css';

const { Title } = Typography;

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    occupiedProperties: 0,
    totalTenants: 0,
    totalRevenue: 0
  });

  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [payments, setPayments] = useState([]);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Fetch user role from token or backend
    const fetchUserRole = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/user/role', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserRole(response.data.userType);
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    if (!userRole) return;

    const fetchData = async () => {
      try {
        // Determine API endpoints based on user role
        const propertiesEndpoint = userRole === 'admin' 
          ? '/api/properties/admin' 
          : '/api/properties';
        
        const tenantsEndpoint = userRole === 'admin'
          ? '/api/tenants/admin'
          : '/api/tenants';
        
        const paymentsEndpoint = userRole === 'admin'
          ? '/api/payments/admin'
          : '/api/payments';

        // Fetch properties
        const propertiesResponse = await axios.get(propertiesEndpoint, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          }
        });
        setProperties(propertiesResponse.data);

        // Fetch tenants
        const tenantsResponse = await axios.get(tenantsEndpoint, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          }
        });
        setTenants(tenantsResponse.data);

        // Fetch payments
        const paymentsResponse = await axios.get(paymentsEndpoint, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          }
        });
        setPayments(paymentsResponse.data);

        // Calculate statistics
        setStats({
          totalProperties: propertiesResponse.data.length,
          occupiedProperties: propertiesResponse.data.filter(p => p.status === 'occupied').length,
          totalTenants: tenantsResponse.data.length,
          totalRevenue: paymentsResponse.data.reduce((sum, payment) => sum + payment.amount, 0)
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [userRole]);

  const propertyColumns = [
    {
      title: 'Property Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span 
          style={{ 
            color: status === 'occupied' ? 'green' : 'red',
            fontWeight: 'bold'
          }}
        >
          {status.toUpperCase()}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Dropdown 
          overlay={
            <Menu>
              <Menu.Item key="edit">Edit Property</Menu.Item>
              <Menu.Item key="details">View Details</Menu.Item>
            </Menu>
          }
        >
          <Button>Actions</Button>
        </Dropdown>
      ),
    },
  ];

  const tenantColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Contact',
      dataIndex: 'contact',
      key: 'contact',
    },
    {
      title: 'Property',
      dataIndex: 'propertyRented',
      key: 'propertyRented',
      render: (property) => property?.name || 'No Property'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Dropdown 
          overlay={
            <Menu>
              <Menu.Item key="edit">Edit Tenant</Menu.Item>
              <Menu.Item key="details">View Details</Menu.Item>
            </Menu>
          }
        >
          <Button>Actions</Button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="admin-dashboard">
      <Title level={2}>
        {userRole === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}
      </Title>
      
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Properties"
              value={stats.totalProperties}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Occupied Properties"
              value={stats.occupiedProperties}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Tenants"
              value={stats.totalTenants}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card 
            title="Properties" 
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
              >
                Add Property
              </Button>
            }
          >
            <Table 
              columns={propertyColumns} 
              dataSource={properties} 
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            title="Tenants" 
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
              >
                Add Tenant
              </Button>
            }
          >
            <Table 
              columns={tenantColumns} 
              dataSource={tenants} 
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;