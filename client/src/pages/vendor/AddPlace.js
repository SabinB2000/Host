import React from "react";
import VendorSidebar from "../../components/VendorSidebar";
import "../../styles/VendorPage.css";

export default function AddPlace() {
  return (
    <div className="vendor-page">
      <VendorSidebar onLogout={() => {/* clear user */}} />
      <div className="vendor-content">
        <h1>Add New Place</h1>
        {/* your form here */}
      </div>
    </div>
  );
}
