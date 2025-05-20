import React from 'react';

const Notifications = ({ notifications }) => (
  <div className="notifications-list">
    {notifications.map(notification => (
      <div key={notification._id} className="notification-item">
        <span>🔔</span>
        <p>{notification.message}</p>
      </div>
    ))}
  </div>
);

export default Notifications;