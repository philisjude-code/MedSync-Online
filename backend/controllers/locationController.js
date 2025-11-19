// backend/controllers/locationController.js
const User = require('../models/user'); // adjust path

exports.updateLocation = async (req, res) => {
  try {
    // if you use auth middleware, use req.user.id
    const userId = req.body.userId || (req.user && req.user.id);
    const { lat, lng } = req.body;
    if (!userId || lat == null || lng == null) {
      return res.status(400).json({ message: 'Missing userId or coordinates' });
    }

    await User.findByIdAndUpdate(userId, {
      $set: {
        location: { lat: Number(lat), lng: Number(lng), updatedAt: new Date() }
      }
    }, { new: true });

    return res.json({ message: 'Location updated' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
