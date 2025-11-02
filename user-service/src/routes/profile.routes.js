const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { extractUserInfo } = require('../middleware/keycloak.middleware');

// Apply user info extraction to all routes
router.use(extractUserInfo);

// Profile routes
router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);

// Address routes
router.get('/addresses', profileController.getAddresses);
router.post('/addresses', profileController.createAddress);
router.put('/addresses/:id', profileController.updateAddress);
router.delete('/addresses/:id', profileController.deleteAddress);
router.put('/addresses/:id/default', profileController.setDefaultAddress);

module.exports = router;
