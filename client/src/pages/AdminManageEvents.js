import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosConfig';
import AdminSidebar from '../components/AdminSidebar';
import AdminEventForm from '../components/AdminEventForm';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/AdminManageEvents.css';

const AdminManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/admin/events');
      setEvents(res.data);
      setError('');
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Unable to fetch events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id, title) => {
    const result = await Swal.fire({
      title: "Delete Event?",
      text: `You are about to delete "${title}". This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
      backdrop: `rgba(0,0,0,0.4)`
    });
    
    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/admin/events/${id}`);
        setEvents(events.filter(event => event._id !== id));
        Swal.fire({
          title: "Deleted!",
          text: "Event has been deleted successfully.",
          icon: "success",
          confirmButtonColor: "#10b981"
        });
      } catch (err) {
        console.error("Error deleting event:", err);
        Swal.fire({
          title: "Error!",
          text: "Unable to delete event. Please try again.",
          icon: "error",
          confirmButtonColor: "#ef4444"
        });
      }
    }
  };

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderLoadingSkeleton = () => {
    return Array(5).fill(0).map((_, index) => (
      <div key={`skeleton-${index}`} className="event-card skeleton">
        <div className="event-content">
          <div className="skeleton-line title"></div>
          <div className="skeleton-line description"></div>
          <div className="event-meta">
            <div className="skeleton-line date"></div>
            <div className="skeleton-line location"></div>
          </div>
        </div>
        <div className="event-actions">
          <div className="skeleton-button"></div>
          <div className="skeleton-button"></div>
        </div>
      </div>
    ));
  };

  return (
    <div className="admin-events-container">
      <AdminSidebar />
      <main className="admin-events-content">
        <header className="events-header">
          <div>
            <h1>Event Management</h1>
            <p className="subtitle">Create and manage all events in the system</p>
          </div>
          <button 
            className="btn back-btn"
            onClick={() => navigate('/admin-dashboard')}
          >
            ← Back to Dashboard
          </button>
        </header>

        <div className="events-card">
          <div className="events-toolbar">
            <div className="search-box">
              <svg className="search-icon" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className="btn primary-btn"
              onClick={() => {
                setEditingEvent(null);
                setShowForm(true);
              }}
            >
              <svg className="plus-icon" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Add New Event
            </button>
          </div>

          {error && (
            <div className="alert error">
              <svg className="alert-icon" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {error}
            </div>
          )}

          <div className="events-list">
            {loading ? (
              renderLoadingSkeleton()
            ) : filteredEvents.length === 0 ? (
              <div className="empty-state">
                <svg className="empty-icon" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                  <path d="M12 18c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6zm0-10c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4z"/>
                </svg>
                <h3>No events found</h3>
                <p>Create your first event to get started</p>
                <button 
                  className="btn primary-btn"
                  onClick={() => {
                    setEditingEvent(null);
                    setShowForm(true);
                  }}
                >
                  Create Event
                </button>
              </div>
            ) : (
              filteredEvents.map(event => (
                <div key={event._id} className="event-card">
                  <div className="event-content">
                    <h3 className="event-title">{event.title}</h3>
                    <p className="event-description">{event.description}</p>
                    <div className="event-meta">
                      <div className="event-date">
                        <svg className="icon" viewBox="0 0 24 24">
                          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
                        </svg>
                        {formatDate(event.date)}
                      </div>
                      <div className="event-location">
                        <svg className="icon" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        {event.location}
                      </div>
                    </div>
                  </div>
                  <div className="event-actions">
                    <button 
                      className="btn secondary-btn"
                      onClick={() => {
                        setEditingEvent(event);
                        setShowForm(true);
                      }}
                    >
                      <svg className="icon" viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                      Edit
                    </button>
                    <button 
                      className="btn danger-btn"
                      onClick={() => handleDelete(event._id, event.title)}
                    >
                      <svg className="icon" viewBox="0 0 24 24">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {showForm && (
          <div className="events-card">
            <AdminEventForm
              event={editingEvent}
              onSuccess={() => {
                setShowForm(false);
                fetchEvents();
                Swal.fire({
                  title: "Success!",
                  text: "Event saved successfully.",
                  icon: "success",
                  confirmButtonColor: "#10b981",
                  timer: 2000
                });
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminManageEvents;