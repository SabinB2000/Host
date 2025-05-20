// src/pages/Reviews.js
import React, { useState } from 'react';
import '../styles/Reviews.css';

const Reviews = () => {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: "John Doe",
      rating: 5,
      comment: "Amazing experience! Kathmandu is a must-visit destination with rich culture and history.",
      date: "2023-10-15",
      avatar: "JD"
    },
    {
      id: 2,
      name: "Jane Smith",
      rating: 4,
      comment: "I enjoyed exploring the temples and local markets. The vibe of the city is unique.",
      date: "2023-09-22",
      avatar: "JS"
    },
    {
      id: 3,
      name: "Alex Johnson",
      rating: 3,
      comment: "A decent trip overall, although I expected a bit more organization. Still worth it!",
      date: "2023-08-05",
      avatar: "AJ"
    },
  ]);

  const [newReview, setNewReview] = useState({
    name: "",
    rating: "",
    comment: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview((prevReview) => ({
      ...prevReview,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!newReview.name || !newReview.rating || !newReview.comment) {
      alert("Please fill in all fields.");
      return;
    }

    const newReviewObj = {
      id: Date.now(),
      name: newReview.name,
      rating: parseInt(newReview.rating),
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0],
      avatar: newReview.name.split(' ').map(n => n[0]).join('').toUpperCase()
    };

    setReviews([...reviews, newReviewObj]);
    setNewReview({
      name: "",
      rating: "",
      comment: ""
    });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < rating ? "star filled" : "star"}>★</span>
    ));
  };

  return (
    <div className="reviews-page">
      <header className="reviews-header">
        <h1>Traveler Reviews</h1>
        <p className="subtitle">Read authentic reviews from travelers who have explored Nepal with our platform.</p>
      </header>

      <div className="reviews-content">
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="avatar">{review.avatar}</div>
                <div className="review-meta">
                  <h3>{review.name}</h3>
                  <div className="review-date">{review.date}</div>
                </div>
              </div>
              <div className="review-rating">
                {renderStars(review.rating)}
                <span className="rating-text">{review.rating}/5</span>
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))}
        </div>

        <div className="review-form-container">
          <div className="review-form-card">
            <h2>Share Your Experience</h2>
            <p>We'd love to hear about your journey!</p>
            
            <form onSubmit={handleSubmit} className="review-form">
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  value={newReview.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <select
                  name="rating"
                  value={newReview.rating}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select your rating</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>

              <div className="form-group">
                <textarea
                  name="comment"
                  value={newReview.comment}
                  onChange={handleInputChange}
                  placeholder="Tell us about your experience..."
                  rows="5"
                  className="form-textarea"
                ></textarea>
              </div>

              <button type="submit" className="submit-btn">
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;