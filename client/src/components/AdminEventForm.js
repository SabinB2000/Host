// src/components/AdminEventForm.js
import React, { useState } from 'react';
import axiosInstance from '../utils/axiosConfig';
import '../styles/AdminEventForm.css';

const AdminEventForm = ({ event, onSuccess, onCancel }) => {
  // Pre-fill fields if editing
  const [title, setTitle] = useState(event ? event.title : '');
  const [description, setDescription] = useState(event ? event.description : '');
  const [date, setDate] = useState(event ? event.date.split("T")[0] : ''); // ISO format date, split to get yyyy-mm-dd
  const [location, setLocation] = useState(event ? event.location : '');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { title, description, date, location };

    try {
      if (event) {
        // Update existing event
        await axiosInstance.put(`/admin/events/${event._id}`, payload);
      } else {
        // Create new event
        await axiosInstance.post('/admin/events', payload);
      }
      onSuccess();
    } catch (err) {
      console.error("Error saving event:", err);
      setError("Error saving event.");
    }
  };

  return (
    <div className="event-form-modal">
      <div className="event-form-container">
        <h2>{event ? 'Edit Event' : 'Add New Event'}</h2>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title:</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            ></textarea>
          </div>
          <div className="form-group">
            <label>Date:</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Location:</label>
            <input 
              type="text" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required 
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {event ? 'Update Event' : 'Create Event'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEventForm;
