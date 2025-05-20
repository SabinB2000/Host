import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import axiosInstance from '../utils/axiosConfig';
import AdminSidebar from '../components/AdminSidebar';
import AdminItineraryForm from '../components/AdminItineraryForm';
import '../styles/AdminManageItineraries.css';

export default function AdminManageItineraries() {
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItinerary, setEditingItinerary] = useState(null);

  const fetchItineraries = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/admin/itineraries');
      setItineraries(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching itineraries:', err);
      setError('Unable to fetch itineraries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    const result = await Swal.fire({
      title: 'Delete Itinerary?',
      html: `<p>Are you sure you want to delete <strong>"${title}"</strong>?</p><p>This action cannot be undone.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#e74c3c',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      await axiosInstance.delete(`/admin/itineraries/${id}`);
      setItineraries(itineraries.filter(i => i._id !== id));
      Swal.fire('Deleted!', 'The itinerary has been deleted.', 'success');
    } catch (err) {
      console.error('Delete failed:', err);
      Swal.fire('Error', 'Failed to delete itinerary.', 'error');
    }
  };

  const handleEdit = (it) => {
    setEditingItinerary(it);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingItinerary(null);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchItineraries();
    Swal.fire('Success!', 'Itinerary saved successfully.', 'success');
  };

  useEffect(() => {
    fetchItineraries();
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-content">
        <div className="manage-itineraries-container">
          <div className="page-header">
            <button className="back-btn" onClick={() => navigate('/admin-dashboard')}>
              <FiArrowLeft size={20} />
              Back to Dashboard
            </button>
            <div className="header-content">
              <h1>Manage Itineraries</h1>
              <button className="primary-btn" onClick={handleAddNew}>
                <FiPlus size={18} />
                New Itinerary
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading itineraries...</p>
            </div>
          ) : itineraries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-content">
                <h3>No Itineraries Found</h3>
                <p>Create your first itinerary to get started</p>
                <button className="primary-btn" onClick={handleAddNew}>
                  <FiPlus size={18} />
                  Create Itinerary
                </button>
              </div>
            </div>
          ) : (
            <div className="itineraries-table-container">
              <div className="table-responsive">
                <table className="itineraries-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Days</th>
                      <th>Activities</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itineraries.map(it => {
                      const dayCount = it.days?.length || 0;
                      const actCount = it.days?.reduce(
                        (sum, d) => sum + (d.activities?.length || 0),
                        0
                      );
                      return (
                        <tr key={it._id}>
                          <td className="title-cell">{it.title}</td>
                          <td className="description-cell">
                            {it.description || <span className="no-description">No description</span>}
                          </td>
                          <td className="count-cell">{dayCount}</td>
                          <td className="count-cell">{actCount}</td>
                          <td className="actions-cell">
                            <button 
                              className="edit-btn"
                              onClick={() => handleEdit(it)}
                            >
                              <FiEdit2 size={16} />
                              Edit
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleDelete(it._id, it.title)}
                            >
                              <FiTrash2 size={16} />
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {showForm && (
            <AdminItineraryForm
              itinerary={editingItinerary}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}