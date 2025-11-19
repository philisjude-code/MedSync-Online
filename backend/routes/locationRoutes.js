// backend/routes/locationRoutes.js
const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
// const auth = require('../middleware/auth'); // optional

// If using token auth, you can protect the route with auth middleware
router.post('/update', /*auth,*/ locationController.updateLocation);

module.exports = router;
