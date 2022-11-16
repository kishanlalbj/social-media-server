const router = require('express').Router();
const createHttpError = require('http-errors');
const Notification = require('../models/Notification');

router.get('/all', async (req, res, next) => {
  try {
    const notifys = await Notification.find({
      receiverId: req.payload.id,
      isRead: false,
    })
      .populate('senderId', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.send(notifys);
  } catch (error) {
    next(createHttpError(error));
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { receiverId, text, url } = req.body;

    if (req.payload.id === receiverId)
      return res.status(202).json({ message: 'You are the owner' });

    const newNotification = new Notification({
      senderId: req.payload.id,
      receiverId,
      text,
      url,
    });

    const savedNotification = await (
      await newNotification.save()
    ).populate('senderId', 'firstName lastName');

    res.send(savedNotification);
  } catch (error) {
    next(createHttpError(error));
  }
});

router.delete('/all', async (req, res, next) => {
  try {
    await Notification.deleteMany({ receiverId: req.payload.id });

    res.json({ message: 'all notifications deleted' });
  } catch (error) {
    next(createHttpError(error));
  }
});

router.patch('/read/:id', async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { isRead: true } },
      { new: 1 }
    );

    res.send(notification);
  } catch (error) {
    next(createHttpError(error));
  }
});

module.exports = router;
