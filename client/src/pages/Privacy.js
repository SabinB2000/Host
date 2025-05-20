import React from "react";
import "../styles/Page.css";

export default function Privacy() {
  return (
    <div className="page-container">
      <h1>Privacy Policy</h1>

      <p>
        Guide Nepal (“we”, “us”, “our”) respects your privacy. This Privacy
        Policy explains how we collect, use, disclose, and safeguard your
        information when you visit our website or use our services.
      </p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li>
          <strong>Personal Data:</strong> name, email, password when you sign
          up.
        </li>
        <li>
          <strong>Vendor Data:</strong> business name, contact info for vendor
          accounts.
        </li>
        <li>
          <strong>Usage Data:</strong> pages visited, features used, device and
          log information.
        </li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To provide and maintain our services.</li>
        <li>To authenticate and manage your account.</li>
        <li>To personalize your experience and recommend content.</li>
        <li>To communicate updates, promotions, and support.</li>
      </ul>

      <h2>3. Sharing Your Data</h2>
      <p>
        We do not sell your personal data. We may share with:
        <ul>
          <li>Service providers who help operate our platform.</li>
          <li>Law enforcement if required by law.</li>
        </ul>
      </p>

      <h2>4. Cookies & Tracking</h2>
      <p>
        We use cookies and similar technologies to collect usage data and
        improve our services. You can disable cookies in your browser, but
        some features may not work properly.
      </p>

      <h2>5. Data Security</h2>
      <p>
        We implement industry-standard security measures to protect your data.
        However, no online transmission is 100% secure.
      </p>

      <h2>6. Your Rights</h2>
      <p>
        You may access, update, or delete your personal information by editing
        your profile. For data requests, contact us at privacy@guidenepal.com.
      </p>

      <h2>7. Children’s Privacy</h2>
      <p>
        Our services are not directed to children under 13. We do not knowingly
        collect data from children.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy. We’ll post changes here with a new
        “Last updated” date.
      </p>

      <p>Last updated: April 2025</p>
    </div>
  );
}
