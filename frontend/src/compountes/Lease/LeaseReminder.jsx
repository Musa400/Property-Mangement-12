import React, { useEffect } from 'react';

const LeaseReminder = ({ lease }) => {
  useEffect(() => {
    const reminderDate = new Date(lease.endDate);
    reminderDate.setDate(reminderDate.getDate() - 30); // 30 days before expiration

    const now = new Date();
    if (now >= reminderDate) {
      alert(`Lease for ${lease.tenantName} is expiring soon!`);
    }
  }, [lease]);

  return null;
};

export default LeaseReminder;