const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { extractUserInfo, checkRole } = require('../middleware/keycloak.middleware');

// Apply user info extraction to all routes
router.use(extractUserInfo);

// User routes
router.get('/me', userController.getCurrentUser);
router.put('/me', userController.updateCurrentUser);
router.delete('/me', userController.deleteCurrentUser);

// Admin routes
router.get('/', checkRole('admin'), userController.getAllUsers);
router.get('/:id', checkRole('admin'), userController.getUserById);
router.put('/:id', checkRole('admin'), userController.updateUser);
router.delete('/:id', checkRole('admin'), userController.deleteUser);

// Role management (admin only)
router.post('/:id/roles', checkRole('admin'), userController.assignRole);
router.delete('/:id/roles/:role', checkRole('admin'), userController.removeRole);

module.exports = router;
