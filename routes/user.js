const createHttpError = require('http-errors');
const User = require('../models/User');

const router = require('express').Router();

router.post('/follow/:id', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.payload.user, {
      $push: { following: req.params.id },
    });

    const user2 = await User.findByIdAndUpdate(req.params.id, {
      $push: { followers: req.payload.user },
    });

    if (user && user2) res.send({ message: 'Followed' });
    else throw createHttpError.InternalServerError();
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
