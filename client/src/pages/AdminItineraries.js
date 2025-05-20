import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosConfig';
import AdminSidebar from '../components/AdminSidebar';
import AdminItineraryForm from '../components/AdminItineraryForm';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminManageItineraries.css';

const AdminManageItineraries = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItinerary, setEditingItinerary] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchItineraries = async () => {
    try {
      const res = await axiosInstance.get('/admin/itineraries');
      setItineraries(res.data);
    } catch (err) {
      console.error("Error fetching itineraries:", err);
      setError("Unable to fetch itineraries.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this itinerary?")) {
      try {
        await axiosInstance.delete(`/admin/itineraries/${id}`);
        setItineraries(itineraries.filter(item => item._id !== id));
      } catch (error) {
        console.error("Delete failed:", error);
        setError("Deletion failed.");
      }
    }
  };

  const handleEdit = (itinerary) => {
    setEditingItinerary(itinerary);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingItinerary(null);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchItineraries();
  };

  useEffect(() => {
    fetchItineraries();
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="manage-itineraries dashboard-section">
        <h2>Manage Itineraries</h2>
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" onClick={handleAddNew}>
          Add New Itinerary
        </button>
        {loading ? (
          <p>Loading itineraries...</p>
        ) : (
          <table className="itineraries-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Places</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {itineraries.map((item) => (
                <tr key={item._id}>
                  <td>{item.title}</td>
                  <td>{item.description}</td>
                  <td>
                    {item.places && item.places.map(place => place.name).join(', ')}
                  </td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => handleEdit(item)}>
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(item._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {showForm && (
          <AdminItineraryForm
            itinerary={editingItinerary}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        )}
        <button className="btn btn-secondary" onClick={() => navigate('/admin-dashboard')}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AdminManageItineraries;
