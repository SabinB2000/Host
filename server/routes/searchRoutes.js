const express = require('express');
const router = express.Router();

const { getSearches, createSearch } = require('../controllers/searchController');
const { authenticate } = require('../middleware/authMiddleware');

// ✅ Use authenticate to protect routes
router.get('/', authenticate, getSearches);
router.post('/', authenticate, createSearch);

module.exports = router;
