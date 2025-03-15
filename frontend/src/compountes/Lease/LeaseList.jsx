import React from 'react';
import LeaseItem from './LeaseItem';

const LeaseList = ({ leases, onRenew, onTerminate }) => {
  return (
    <div className="lease-list">
      {leases.map((lease) => (
        <LeaseItem
          key={lease.id}
          lease={lease}
          onRenew={onRenew}
          onTerminate={onTerminate}
        />
      ))}
    </div>
  );
};

export default LeaseList;