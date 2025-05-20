import React, { useEffect, useState } from "react";
import VendorSidebar from "../../components/VendorSidebar";
import "../../styles/VendorPage.css";

export default function ManageEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // fetch vendor events...
  }, []);

  return (
    <div className="vendor-page">
      <VendorSidebar onLogout={() => {/* clear user */}} />
      <div className="vendor-content">
        <h1>Manage Events</h1>
        {/* list or table of events */}
      </div>
    </div>
  );
}
