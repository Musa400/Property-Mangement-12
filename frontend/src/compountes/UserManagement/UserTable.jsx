import React from 'react';
import { FaEdit, FaTrash, FaKey } from 'react-icons/fa';
import PropTypes from 'prop-types';

const UserTable = ({ 
  users = [], 
  onEditUser = () => {}, 
  onDeleteUser = () => {}, 
  onResetPassword = () => {} 
}) => {
  const handleDelete = (user) => {
    if (window.confirm(`Are you sure you want to delete user ${user.name}?`)) {
      onDeleteUser(user.id);
    }
  };

  return (
    <div className="user-table-container">
      <table className="user-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Position</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id || Math.random()} className={`user-row ${user.status?.toLowerCase() || ''}`}>
              <td>{user.id || 'N/A'}</td>
              <td>{user.name || 'Unknown'}</td>
              <td>{user.email || 'No email'}</td>
              <td>{user.role || 'Unassigned'}</td>
              <td>{user.position || 'N/A'}</td>
              <td>
                <span className={`status-badge ${user.status?.toLowerCase() || ''}`}>
                  {user.status || 'Unknown'}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button 
                    onClick={() => onEditUser(user)} 
                    title="Edit User"
                    className="edit-btn"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => handleDelete(user)} 
                    title="Delete User"
                    className="delete-btn"
                  >
                    <FaTrash />
                  </button>
                  <button 
                    onClick={() => onResetPassword(user.id)} 
                    title="Reset Password"
                    className="reset-btn"
                  >
                    <FaKey />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="no-users-message">
          No users found. Try adjusting your search or filters.
        </div>
      )}
    </div>
  );
};

UserTable.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
    position: PropTypes.string,
    status: PropTypes.string
  })),
  onEditUser: PropTypes.func,
  onDeleteUser: PropTypes.func,
  onResetPassword: PropTypes.func
};

export default UserTable;