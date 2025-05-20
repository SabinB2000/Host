import React from "react";
import VendorSidebar from "../../components/VendorSidebar";
import "../../styles/VendorPage.css";

export default function Settings() {
  return (
    <div className="vendor-page">
      <VendorSidebar onLogout={() => {/* clear user */}} />
      <div className="vendor-content">
        <h1>Settings</h1>
        {/* your settings form here */}
      </div>
    </div>
  );
}
