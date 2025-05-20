const express = require('express');
const { getAllUsers, deleteUser } = require('../controllers/userController'); // ✅ Import controllers
const { authenticate, isAdmin } = require('../middleware/authMiddleware'); // ✅ Import middleware

const router = express.Router();

// ✅ Admin-only routes
router.get('/', authenticate, isAdmin, getAllUsers);
router.delete('/:id', authenticate, isAdmin, deleteUser);

module.exports = router;
