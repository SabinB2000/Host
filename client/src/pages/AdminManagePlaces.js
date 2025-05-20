import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import '../styles/AdminManagePlaces.css';
import axiosInstance from '../utils/axiosConfig';

const UNSPLASH_ACCESS_KEY = "LIoaOeFaFZsQHpmN4LTFfCswzlOLjCMc27sC0ACS0gY";

const AdminManagePlaces = () => {
  const [places, setPlaces] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: 'Kathmandu',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  const [editingPlace, setEditingPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPlaces = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await axiosInstance.get('/admin/places');
      setPlaces(res.data);
    } catch (error) {
      console.error('Failed to fetch places:', error);
      setError('Unable to load places. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnsplashImage = async (query) => {
    if (!query) {
      setImagePreview('');
      setFormData(prev => ({ ...prev, image: '' }));
      return;
    }
    
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${query},Kathmandu&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1`
      );
      const data = await res.json();
      const url = data.results[0]?.urls?.regular || '';
      setImagePreview(url);
      setFormData(prev => ({ ...prev, image: url }));
    } catch (error) {
      console.error('Failed to fetch Unsplash image:', error);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchUnsplashImage(formData.title), 600);
    return () => clearTimeout(delay);
  }, [formData.title]);

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddPlace = async () => {
    if (!formData.title || !formData.description || !formData.image) {
      setError('Please fill all fields and wait for image to load');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await axiosInstance.post('/admin/places', formData);
      setFormData({ title: '', description: '', location: 'Kathmandu', image: '' });
      setImagePreview('');
      await fetchPlaces();
      
      // Show success message
      const successMsg = document.getElementById('success-message');
      successMsg.textContent = 'Place added successfully';
      successMsg.style.display = 'block';
      setTimeout(() => {
        successMsg.style.display = 'none';
      }, 3000);
    } catch (error) {
      console.error('Error adding place:', error);
      setError('Failed to add place. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this place? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axiosInstance.delete(`/admin/places/${id}`);
      await fetchPlaces();
      
      // Show success message
      const successMsg = document.getElementById('success-message');
      successMsg.textContent = 'Place deleted successfully';
      successMsg.style.display = 'block';
      setTimeout(() => {
        successMsg.style.display = 'none';
      }, 3000);
    } catch (error) {
      console.error('Delete failed:', error);
      setError('Failed to delete place. Please try again.');
    }
  };

  const handleEditClick = (place) => {
    setEditingPlace(place);
    setFormData({
      title: place.title,
      description: place.description,
      location: place.location,
      image: place.image,
    });
    setImagePreview(place.image);
    
    // Scroll to form
    document.querySelector('.add-place-form').scrollIntoView({ behavior: 'smooth' });
  };

  const handleUpdatePlace = async () => {
    if (!formData.title || !formData.description || !formData.image) {
      setError('Please fill all fields and wait for image to load');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      await axiosInstance.put(`/admin/places/${editingPlace._id}`, formData);
      setEditingPlace(null);
      setFormData({ title: '', description: '', location: 'Kathmandu', image: '' });
      setImagePreview('');
      await fetchPlaces();
      
      // Show success message
      const successMsg = document.getElementById('success-message');
      successMsg.textContent = 'Place updated successfully';
      successMsg.style.display = 'block';
      setTimeout(() => {
        successMsg.style.display = 'none';
      }, 3000);
    } catch (error) {
      console.error('Update failed:', error);
      setError('Failed to update place. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPlace(null);
    setFormData({ title: '', description: '', location: 'Kathmandu', image: '' });
    setImagePreview('');
    setError('');
  };
  
  const filteredPlaces = places.filter(place => 
    place.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-dashboard-container">
      <AdminSidebar />
      <div className="admin-dashboard-content">
        <div className="dashboard-header">
          <h1>Manage Places</h1>
          <p className="welcome-text">Add, edit or remove tourist destinations and points of interest.</p>
        </div>
        
        <div id="success-message" className="success-message"></div>
        
        {error && (
          <div className="error-alert">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="admin-card place-form-card">
          <h2 className="card-title">
            {editingPlace ? '✏️ Edit Place' : '➕ Add New Place'}
          </h2>
          
          <div className="add-place-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Place Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  placeholder="Enter place name..."
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  readOnly
                  className="readonly-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                placeholder="Write short description about this place..."
                onChange={handleChange}
                disabled={isSubmitting}
                rows="4"
              />
            </div>
            
            <div className="image-section">
              <div className="image-preview-container">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                ) : (
                  <div className="no-image">
                    <span>Image preview will appear here</span>
                    <p>Type a place name to auto-search for an image</p>
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                {editingPlace ? (
                  <>
                    <button 
                      className="update-btn" 
                      onClick={handleUpdatePlace}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Updating...' : '✏️ Update Place'}
                    </button>
                    <button 
                      className="cancel-btn" 
                      onClick={handleCancelEdit}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button 
                    className="add-btn" 
                    onClick={handleAddPlace}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Adding...' : '➕ Add Place'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card places-list-card">
          <div className="card-header">
            <h2 className="card-title">All Places</h2>
            <div className="search-container">
              <i className="search-icon">🔍</i>
              <input
                type="text"
                placeholder="Search places..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading places...</p>
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="no-results">
              <p>No places found{searchTerm ? ' matching your search' : ''}.</p>
            </div>
          ) : (
            <div className="places-grid">
              {filteredPlaces.map((place) => (
                <div key={place._id} className="place-card">
                  <div className="place-image">
                    <img src={place.image} alt={place.title} />
                    <div className="place-location">
                      <span>📍 {place.location}</span>
                    </div>
                  </div>
                  <div className="place-content">
                    <h3 className="place-title">{place.title}</h3>
                    <p className="place-description">{place.description}</p>
                    <div className="place-actions">
                      <button 
                        className="edit-btn" 
                        onClick={() => handleEditClick(place)}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDelete(place._id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManagePlaces;