const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificatioSchema = new Schema(
  {
    senderId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      requried: true,
    },
    url: {
      type: String,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', NotificatioSchema);

module.exports = Notification;
