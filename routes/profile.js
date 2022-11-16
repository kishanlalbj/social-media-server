const createHttpError = require('http-errors');
const verifyJWT = require('../middlewares/verifyJWT');
const User = require('../models/User');

const router = require('express').Router();

router.get('/me', verifyJWT, async (req, res, next) => {
  try {
    const profile = await User.findById(req.payload.id)
      .select({ password: 0 })
      .lean();

    if (!profile) throw createHttpError.NotFound('Profile not found');

    res.send(profile);
  } catch (error) {
    next(error);
  }
});

router.get('/suggestions', verifyJWT, async (req, res, next) => {
  try {
    const user = await User.findById(req.payload.id)
      .select({ following: 1 })
      .lean();

    const profiles = await User.find({
      $and: [
        { _id: { $ne: req.payload.id } },
        { _id: { $nin: user.following } },
      ],
    })
      .select({ firstName: 1, lastName: 1 })
      .lean();
    res.send(profiles.slice(0, 4));
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

router.post('/search', async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query) res.send([]);

    const profiles = await User.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
      ],
    })
      .select({ password: 0, following: 0, followers: 0, email: 0 })
      .lean();

    const result = profiles.map((item) => {
      let obj = {
        id: item._id,
        title: `${item.firstName} ${item.lastName}`,
      };

      return obj;
    });

    res.send(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
