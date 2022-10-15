const createHttpError = require('http-errors');
const { default: mongoose } = require('mongoose');
const User = require('../models/User');

const router = require('express').Router();

router.post('/follow/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id) || !id)
      throw createHttpError.BadRequest('Invalid data');

    const hasUser = await User.findById(id).lean();

    if (!hasUser) throw createHttpError.NotFound('User not found');

    const user = await User.findByIdAndUpdate(req.payload.id, {
      $push: { following: id },
    });

    const user2 = await User.findByIdAndUpdate(req.params.id, {
      $push: { followers: req.payload.id },
    });

    if (user && user2) res.send({ message: 'Followed' });
    else throw createHttpError.InternalServerError();
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post('/unfollow/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.isValidObjectId(id))
      throw createHttpError.BadRequest('Invalid data');

    const hasUser = await User.findById(id);
    if (!hasUser) throw createHttpError.NotFound('User not found');

    const user = await User.findByIdAndUpdate(req.payload.id, {
      $pull: { following: id },
    });

    const user2 = await User.findByIdAndUpdate(id, {
      $pull: { followers: req.payload.id },
    });

    if (user && user2) res.send({ message: 'UnFollowed' });
    else throw createHttpError.InternalServerError();
  } catch (error) {
    next(error);
  }
});

router.post('/edit/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName } = req.body;

    res.send({ test: 'test' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
