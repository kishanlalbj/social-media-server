const createHttpError = require('http-errors');
const { default: mongoose } = require('mongoose');
const User = require('../models/User');

const router = require('express').Router();

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select({ password: -1 }).lean();

    if (!user) throw createHttpError.NotFound('User not found');

    res.send(user);
  } catch (error) {
    next(error);
  }
});

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

    if (user && user2) res.send(hasUser);
    else throw createHttpError.InternalServerError();
  } catch (error) {
    next(error);
  }
});

router.post('/unfollow/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.isValidObjectId(id))
      throw createHttpError.BadRequest('Invalid data');

    const hasUser = await User.findById(id).lean();
    if (!hasUser) throw createHttpError.NotFound('User not found');

    const user = await User.findByIdAndUpdate(req.payload.id, {
      $pull: { following: id },
    });

    const user2 = await User.findByIdAndUpdate(id, {
      $pull: { followers: req.payload.id },
    });

    if (user && user2) res.send(hasUser);
    else throw createHttpError.InternalServerError();
  } catch (error) {
    next(error);
  }
});

router.patch('/edit/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      {
        $set: { firstName, lastName },
      },
      { new: 1 }
    ).lean();

    if (!user) throw createHttpError.NotFound('User not found');
    res.send(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
