const Search = require('../models/Search');

// ✅ GET recent searches
const getSearches = async (req, res) => {
  try {
    const searches = await Search.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({
      success: true,
      count: searches.length,
      data: searches
    });
  } catch (err) {
    console.error('Error fetching searches:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// ✅ POST a new search
const createSearch = async (req, res) => {
  try {
    const newSearch = await Search.create({
      user: req.user.id,
      query: req.body.query
    });

    res.status(201).json({
      success: true,
      data: newSearch
    });
  } catch (err) {
    console.error('Error saving search:', err);
    res.status(500).json({
      success: false,
      error: 'Could not save search'
    });
  }
};

module.exports = { getSearches, createSearch };
