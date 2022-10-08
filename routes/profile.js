const createHttpError = require('http-errors');
const verifyJWT = require('../middlewares/verifyJWT');
const User = require('../models/User');

const router = require('express').Router();

router.get('/me', verifyJWT, async (req, res, next) => {
  try {
    const profile = await User.findById(req.payload.user)
      .select({ password: 0 })
      .lean();

    if (!profile) throw createHttpError.NotFound('Profile not found');

    res.send(profile);
  } catch (error) {
    next(error);
  }
});

router.get('/suggesstions', verifyJWT, async (req, res, next) => {
  try {
    const user = await User.findById(req.payload.user)
      .select({ following: 1 })
      .lean();

    const profiles = await User.find({
      $and: [
        { _id: { $ne: req.payload.user } },
        { _id: { $nin: user.following } },
      ],
    })
      .select({ password: 0 })
      .lean();
    res.send(profiles);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await User.findById(id)
      .select({ password: 0 })
      .populate('following')
      .populate('followers');

    res.send(profile);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
