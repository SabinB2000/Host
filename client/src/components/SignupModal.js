import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import Swal from "sweetalert2";

const SignupModal = ({ closeModal }) => {
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/auth/register", signupData);

      Swal.fire({
        title: "Success!",
        text: "Account created successfully! You can now log in.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });

      closeModal(); // ✅ Close signup modal after success
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Signup failed!",
        icon: "error",
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <button className="close-btn" onClick={closeModal}>✖</button>
        <h2>Sign Up</h2>
        <form onSubmit={handleSignup}>
          <input type="text" placeholder="Full Name" onChange={(e) => setSignupData({ ...signupData, name: e.target.value })} required />
          <input type="email" placeholder="Email" onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} required />
          <input type="password" placeholder="Password" onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} required />
          <button type="submit">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default SignupModal;
