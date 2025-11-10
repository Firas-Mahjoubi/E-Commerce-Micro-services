const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { requireRole } = require('../middleware/jwt.middleware');

// User routes (authenticated users)
router.get('/me', userController.getCurrentUser);
router.put('/me', userController.updateCurrentUser);
router.delete('/me', userController.deleteCurrentUser);

// Admin routes (require admin role)
router.get('/', requireRole('admin'), userController.getAllUsers);
router.get('/:id', requireRole('admin'), userController.getUserById);
router.put('/:id', requireRole('admin'), userController.updateUser);
router.delete('/:id', requireRole('admin'), userController.deleteUser);

// Role management (admin only)
router.post('/:id/roles', requireRole('admin'), userController.assignRole);
router.delete('/:id/roles/:role', requireRole('admin'), userController.removeRole);

module.exports = router;
