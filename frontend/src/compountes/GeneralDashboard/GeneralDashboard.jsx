import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Button, 
  Progress, 
  Alert,
  Typography,
  Badge,
  Spin
} from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  SafetyOutlined,
  DollarOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/plots';
import './GeneralDashboard.css';

const { Title, Text } = Typography;

const GeneralDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalProperties: 0,
    occupiedProperties: 0,
    securityClearance: 0,
    maintenanceRequests: 0,
    totalRevenue: 0,
    propertyUtilization: 0,
    securityIncidents: 0,
    complianceRate: 98.5
  });

  const [propertyData, setPropertyData] = useState([]);
  const [securityData, setSecurityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { metrics: newMetrics, stats, incidents } = await dashboardService.refreshDashboard();

      // Ensure we have valid data before updating state
      if (newMetrics?.data && stats?.data && incidents?.data) {
        setMetrics(newMetrics.data);
        setPropertyData(stats.data || []);
        setSecurityData(incidents.data || []);
        setLastUpdated(new Date().toLocaleString());
      } else {
        throw new Error('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Memoize chart configurations to prevent unnecessary re-renders
  const propertyUtilizationConfig = useMemo(() => ({
    data: propertyData || [],
    xField: 'month',
    yField: 'utilization',
    smooth: true,
    meta: {
      utilization: {
        min: 0,
        max: 100,
        formatter: (v) => `${v}%`
      }
    },
    xAxis: {
      label: {
        autoRotate: true,
        autoHide: false,
        autoEllipsis: true
      }
    },
    yAxis: {
      label: {
        formatter: (v) => `${v}%`
      }
    },
    point: {
      size: 5,
      shape: 'diamond',
      style: {
        fill: '#1890ff',
        stroke: '#1890ff',
        lineWidth: 2
      }
    },
    tooltip: {
      showMarkers: true,
      formatter: (datum) => {
        return { name: 'Utilization', value: `${datum.utilization}%` };
      }
    },
    state: {
      active: {
        style: {
          shadowBlur: 4,
          stroke: '#000',
          fill: '#1890ff'
        }
      }
    },
    theme: {
      geometries: {
        point: {
          diamond: {
            active: {
              style: {
                shadowBlur: 4,
                stroke: '#000',
                fill: '#1890ff'
              }
            }
          }
        }
      }
    }
  }), [propertyData]);

  const securityIncidentsConfig = useMemo(() => ({
    data: securityData || [],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    legend: {
      layout: 'horizontal',
      position: 'bottom'
    },
    label: {
      type: 'outer',
      content: '{name}: {value}',
      style: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      formatter: (datum) => {
        return { name: datum.type, value: `${datum.value} incidents` };
      }
    },
    interactions: [
      {
        type: 'element-active'
      }
    ],
    theme: {
      colors10: [
        '#FF4D4F',
        '#FFA940',
        '#FFC53D',
        '#73D13D',
        '#40A9FF',
        '#597EF7',
        '#9254DE',
        '#F759AB',
        '#FFD666',
        '#BAE637'
      ]
    },
    animation: {
      appear: {
        animation: 'fade-in',
        duration: 1000
      }
    }
  }), [securityData]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" />
        <Text>Loading Dashboard Data...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        className="dashboard-error"
        action={
          <Button type="primary" onClick={fetchDashboardData}>
            Retry
          </Button>
        }
      />
    );
  }

  const renderCharts = () => {
    if (!propertyData?.length || !securityData?.length) {
      return (
        <Alert
          message="No Data Available"
          description="Chart data is currently unavailable"
          type="info"
          showIcon
        />
      );
    }

    return (
      <Row gutter={[24, 24]} className="charts-row">
        <Col xs={24} lg={14}>
          <Card 
            title="Property Utilization Trend" 
            className="chart-card"
            extra={
              <Badge 
                status={propertyData.length > 0 ? "processing" : "default"} 
                text={propertyData.length > 0 ? "Live Data" : "No Data"} 
              />
            }
          >
            <div style={{ height: 400 }}>
              <Line {...propertyUtilizationConfig} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card 
            title="Security Incidents Distribution" 
            className="chart-card"
            extra={
              <Badge 
                status={metrics.securityIncidents > 0 ? "warning" : "success"} 
                text={`${metrics.securityIncidents} Active Incidents`} 
              />
            }
          >
            <div style={{ height: 400 }}>
              <Pie {...securityIncidentsConfig} />
            </div>
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div className="general-dashboard">
      <div className="dashboard-header">
        <Title level={2}>Ministry of Defense Property Management Dashboard</Title>
        <Text type="secondary">
          Last Updated: {lastUpdated}
        </Text>
      </div>

      <Row gutter={[24, 24]} className="metrics-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card">
            <Statistic
              title="Total Properties"
              value={metrics.totalProperties}
              prefix={<HomeOutlined />}
              className="metric-statistic"
            />
            <Progress 
              percent={metrics.propertyUtilization} 
              status="active"
              strokeColor="#1890ff"
              format={percent => `${percent?.toFixed(1) || 0}% Utilized`}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card security">
            <Statistic
              title="Security Clearance Rate"
              value={metrics.securityClearance}
              prefix={<SafetyOutlined />}
              suffix="%"
              className="metric-statistic"
              valueStyle={{ color: metrics.securityClearance >= 90 ? '#52c41a' : '#faad14' }}
            />
            <Progress 
              percent={metrics.securityClearance} 
              status={metrics.securityClearance >= 90 ? "success" : "active"}
              strokeColor={metrics.securityClearance >= 90 ? "#52c41a" : "#faad14"}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card occupancy">
            <Statistic
              title="Occupancy Rate"
              value={((metrics.occupiedProperties / metrics.totalProperties * 100) || 0).toFixed(1)}
              prefix={<UserOutlined />}
              suffix="%"
              className="metric-statistic"
            />
            <Progress 
              percent={(metrics.occupiedProperties / metrics.totalProperties * 100) || 0} 
              status="active"
              strokeColor="#722ed1"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card compliance">
            <Statistic
              title="Compliance Rate"
              value={metrics.complianceRate}
              prefix={<CheckCircleOutlined />}
              suffix="%"
              className="metric-statistic"
              valueStyle={{ color: metrics.complianceRate >= 95 ? '#13c2c2' : '#faad14' }}
            />
            <Progress 
              percent={metrics.complianceRate} 
              status={metrics.complianceRate >= 95 ? "success" : "active"}
              strokeColor={metrics.complianceRate >= 95 ? "#13c2c2" : "#faad14"}
            />
          </Card>
        </Col>
      </Row>

      {renderCharts()}

      <Row gutter={[24, 24]} className="alerts-row">
        <Col xs={24}>
          <Card 
            title={
              <span>
                <WarningOutlined style={{ marginRight: 8 }} />
                Critical Alerts
              </span>
            } 
            className="alerts-card"
          >
            <div className="alerts-container">
              {metrics.securityIncidents > 0 && (
                <Alert
                  message="Security Incidents Requiring Attention"
                  description={`${metrics.securityIncidents} active security incidents need review`}
                  type="warning"
                  showIcon
                  className="alert-item"
                />
              )}
              {metrics.maintenanceRequests > 0 && (
                <Alert
                  message="Pending Maintenance Requests"
                  description={`${metrics.maintenanceRequests} maintenance requests awaiting processing`}
                  type="info"
                  showIcon
                  className="alert-item"
                />
              )}
              {metrics.complianceRate < 95 && (
                <Alert
                  message="Compliance Alert"
                  description="Compliance rate is below the required threshold of 95%"
                  type="warning"
                  showIcon
                  className="alert-item"
                />
              )}
              <Alert
                message="System Status"
                description="All systems operational"
                type="success"
                showIcon
                className="alert-item"
              />
            </div>
          </Card>
        </Col>
      </Row>

      <div className="dashboard-footer">
        <Button 
          type="primary" 
          icon={<SyncOutlined />} 
          onClick={fetchDashboardData}
          loading={loading}
        >
          Refresh Dashboard
        </Button>
        <Text type="secondary">
          Security Status: 
          <Badge 
            status={metrics.securityClearance >= 90 ? "success" : "warning"} 
            text={metrics.securityClearance >= 90 ? "Secure" : "Review Required"} 
            style={{ marginLeft: 8 }} 
          />
        </Text>
      </div>
    </div>
  );
};

export default GeneralDashboard;
