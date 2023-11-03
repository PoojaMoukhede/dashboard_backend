const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userRef: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  message: String,
  status:{type:String, default: 'pending'},
  timestamp: { type: Date, default: Date.now },
});

const Notification = mongoose.model("notification", notificationSchema);
module.exports = Notification;
