import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ImageSlider from "../components/ImageSlider";
import AuthForm from "../components/AuthForm";
import PlaceModal from "../components/PlaceModal";
import { FiArrowRight, FiMapPin, FiHeart, FiCompass, FiStar, FiMail } from "react-icons/fi";
import "../styles/Home.css";

const UNSPLASH_ACCESS_KEY = "LIoaOeFaFZsQHpmN4LTFfCswzlOLjCMc27sC0ACS0gY";

const famousPlaces = [
  {
    name: "Swayambhunath",
    query: "Swayambhunath Kathmandu",
    description: "Swayambhunath, the Monkey Temple, offers panoramic views of the city and a peaceful stupa complex. This ancient religious architecture atop a hill is one of the most sacred Buddhist sites in Nepal.",
    rating: 4.8,
    tags: ["Buddhist", "Viewpoint", "Historic"],
    imageDesc: "Swayambhunath Stupa with prayer flags overlooking Kathmandu valley"
  },
  {
    name: "Pashupatinath",
    query: "Pashupatinath Kathmandu",
    description: "Pashupatinath is one of the holiest Hindu temples in the world, set on the banks of the Bagmati River. This UNESCO World Heritage Site is dedicated to Lord Shiva and attracts pilgrims from all over the world.",
    rating: 4.7,
    tags: ["Hindu", "Sacred", "Cultural"],
    imageDesc: "Pashupatinath Temple complex with Bagmati River and cremation ghats"
  },
  {
    name: "Boudhanath",
    query: "Boudhanath Stupa Kathmandu",
    description: "Boudhanath is one of the largest spherical stupas in Nepal, a center of Tibetan Buddhism. The massive mandala makes it one of the most important Tibetan Buddhist sites outside Tibet.",
    rating: 4.9,
    tags: ["Buddhist", "Peaceful", "Architecture"],
    imageDesc: "Boudhanath Stupa with eyes of Buddha and colorful prayer flags"
  },
  {
    name: "Thamel",
    query: "Thamel Kathmandu",
    description: "Thamel is a vibrant tourist district, known for its shops, restaurants, and nightlife. This bustling area is the heart of Kathmandu's tourism with narrow streets filled with hotels, cafes, and souvenir shops.",
    rating: 4.5,
    tags: ["Shopping", "Food", "Nightlife"],
    imageDesc: "Busy streets of Thamel with colorful shops and restaurants"
  },
  {
    name: "Patan Durbar Square",
    query: "Patan Durbar Square Kathmandu",
    description: "Patan Durbar Square is a marvel of Newari architecture, showcasing ancient palaces, temples, and statues. This UNESCO World Heritage Site reflects the rich cultural heritage of the Kathmandu Valley.",
    rating: 4.6,
    tags: ["Historic", "Architecture", "Cultural"],
    imageDesc: "Patan Durbar Square with ancient temples and palace complex"
  },
];

const testimonials = [
  {
    quote: "An unforgettable journey through Kathmandu—highly recommended!",
    author: "Alice",
    rating: 5,
    date: "March 2025"
  },
  {
    quote: "The personalized itinerary was spot on. Loved every moment.",
    author: "Bob",
    rating: 5,
    date: "February 2025"
  },
  {
    quote: "Easy to use and discover hidden gems. Five stars!",
    author: "Carla",
    rating: 5,
    date: "January 2025"
  }
];

export default function Home() {
  const [showAuth, setShowAuth] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const navigate = useNavigate();

  const openAuth = () => setShowAuth(true);
  const closeAuth = () => setShowAuth(false);

  const openPlace = (place) => setSelectedPlace(place);
  const closePlace = () => setSelectedPlace(null);

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <div className="home">
      {/* Hero */}
      <header className="hero">
        <ImageSlider
          accessKey={UNSPLASH_ACCESS_KEY}
          query="Kathmandu city"
          slides={5}
          className="hero-slider"
          showDescriptions={true}
        />
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>Discover the Soul of Nepal</h1>
            <p>Your gateway to authentic Himalayan adventures and cultural treasures</p>
            <div className="hero-buttons">
              <button className="primary-btn" onClick={openAuth}>
                Explore Kathmandu <FiArrowRight />
              </button>
              <button className="secondary-btn" onClick={() => scrollTo("places")}>
                Popular Destinations
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sub-nav */}
      <nav className="subnav">
        <button onClick={() => scrollTo("places")}>
          <FiMapPin /> Places
        </button>
        <button onClick={() => scrollTo("services")}>
          <FiCompass /> Services
        </button>
        <button onClick={() => scrollTo("reviews")}>
          <FiStar /> Reviews
        </button>
      </nav>

      {/* Famous Places */}
      <section id="places" className="section places">
        <div className="section-header">
          <h2>Discover Kathmandu's Treasures</h2>
          <p>Explore the most iconic destinations in the Valley of Gods</p>
        </div>
        <div className="places-grid">
          {famousPlaces.map((p) => (
            <div
              key={p.name}
              className="place-card"
              onClick={() => openPlace(p)}
            >
              <div className="place-image">
                <ImageSlider
                  accessKey={UNSPLASH_ACCESS_KEY}
                  query={p.query}
                  slides={1}
                  className="place-img"
                  showDescriptions={true}
                  description={p.imageDesc}
                />
                <div className="rating-badge">
                  <FiStar /> {p.rating}
                </div>
              </div>
              <div className="place-info">
                <h3>{p.name}</h3>
                <div className="place-tags">
                  {p.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What We Do */}
      <section id="services" className="section services">
        <div className="section-header">
          <h2>Our Premium Services</h2>
          <p>Tailored experiences for every traveler</p>
        </div>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">
              <FiMapPin />
            </div>
            <h3>Personalized Itineraries</h3>
            <p>Create trips tailored to your budget and interests with our expert local guides.</p>
          </div>
          <div className="service-card">
            <div className="service-icon">
              <FiHeart />
            </div>
            <h3>Vendor Collaboration</h3>
            <p>Connect with trusted local businesses for authentic cultural experiences.</p>
          </div>
          <div className="service-card">
            <div className="service-icon">
              <FiCompass />
            </div>
            <h3>Real-time Navigation</h3>
            <p>Stay on track with live maps and offline support in remote areas.</p>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="section reviews">
        <div className="section-header">
          <h2>Traveler Experiences</h2>
          <p>What our guests say about their journeys</p>
        </div>
        <div className="reviews-grid">
          {testimonials.map((review, index) => (
            <div className="review-card" key={index}>
              <div className="stars">
                {[...Array(review.rating)].map((_, i) => (
                  <FiStar key={i} className="star-filled" />
                ))}
              </div>
              <p className="review-text">"{review.quote}"</p>
              <div className="review-footer">
                <p className="author">— {review.author}</p>
                <p className="date">{review.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="section about">
        <div className="about-content">
          <div className="about-text">
            <h2>Our Story</h2>
            <p>
              Founded by local travel enthusiasts, Guide Nepal is dedicated to showcasing the true essence of our homeland. 
              We go beyond typical tourist routes to connect you with Nepal's hidden gems, ancient traditions, and breathtaking landscapes.
            </p>
            <p>
              Our team of certified guides and travel experts are passionate about creating meaningful experiences that support 
              local communities while respecting our cultural heritage.
            </p>
            <button className="primary-btn" onClick={() => navigateTo("/contact")}>
              <FiMail /> Contact Us
            </button>
          </div>
          <div className="about-image">
            <ImageSlider
              accessKey={UNSPLASH_ACCESS_KEY}
              query="Nepal culture"
              slides={1}
              showDescriptions={true}
              description="Traditional Nepalese cultural performance"
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section cta">
        <div className="cta-content">
          <h2>Ready for Your Nepal Adventure?</h2>
          <p>Start planning your personalized journey today</p>
          <button className="primary-btn" onClick={openAuth}>
            Begin Exploration
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>Guide Nepal</h3>
            <p>Your trusted travel companion in the Himalayas</p>
            <div className="social-links">
              <a href="#"><i className="fab fa-facebook"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
            </div>
          </div>
          <div className="footer-links">
            <h4>Explore</h4>
            <a href="#" onClick={() => scrollTo("places")}>Destinations</a>
            <a href="#" onClick={() => scrollTo("services")}>Services</a>
            <a href="#" onClick={() => scrollTo("about")}>About Us</a>
          </div>
          <div className="footer-links">
            <h4>Support</h4>
            <a href="#" onClick={() => navigateTo("/contact")}>Contact Us</a>
            <a href="#" onClick={() => navigateTo("/terms")}>Terms</a>
            <a href="#" onClick={() => navigateTo("/privacy")}>Privacy</a>
            <a href="#">FAQ</a>
          </div>
          <div className="footer-newsletter">
            <h4>Stay Updated</h4>
            <p>Subscribe for travel tips and special offers</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Your email" />
              <button>Subscribe</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © 2025 Guide Nepal. All rights reserved.
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuth && <AuthForm closeAuth={closeAuth} />}

      {/* Place Detail Modal */}
      {selectedPlace && (
        <PlaceModal place={selectedPlace} onClose={closePlace} />
      )}
    </div>
  );
}