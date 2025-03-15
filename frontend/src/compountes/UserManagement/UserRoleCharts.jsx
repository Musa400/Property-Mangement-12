import React from 'react';
import PropTypes from 'prop-types';
import { 
  PieChart, 
  Pie, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const UserRoleCharts = ({ users = [] }) => {
  // Role Distribution Data
  const roleData = [
    { 
      name: 'Admin', 
      value: users.filter(u => u && u.role === 'Admin').length 
    },
    { 
      name: 'Manager', 
      value: users.filter(u => u && u.role === 'Manager').length 
    },
    { 
      name: 'Tenant', 
      value: users.filter(u => u && u.role === 'Tenant').length 
    }
  ];

  // Mock Registration Data (replace with actual backend data)
  const registrationData = [
    { month: 'Jan', registrations: 12 },
    { month: 'Feb', registrations: 19 },
    { month: 'Mar', registrations: 15 },
    { month: 'Apr', registrations: 22 },
    { month: 'May', registrations: 18 },
    { month: 'Jun', registrations: 25 }
  ];

  // Custom Tooltip for Pie Chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const totalUsers = users.length;
      return (
        <div className="custom-tooltip">
          <p>{`${data.name}: ${data.value} users`}</p>
          <p>{`Percentage: ${totalUsers > 0 ? ((data.value / totalUsers) * 100).toFixed(2) : 0}%`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Bar Chart
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p>{`${label}: ${payload[0].value} new registrations`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="user-role-charts">
      <div className="pie-chart">
        <h3>User Role Distribution</h3>
        {users.length === 0 ? (
          <div className="no-data-message">
            No user data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={roleData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {roleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      
      <div className="bar-chart">
        <h3>New User Registrations</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={registrationData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={<CustomBarTooltip />} />
            <Bar dataKey="registrations" fill="#3498db">
              {registrationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

UserRoleCharts.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape({
    role: PropTypes.string
  }))
};

export default UserRoleCharts;