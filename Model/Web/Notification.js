const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userRef: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  title: { type: String, require: true },
  message: String,
  timestamp: { type: Date, default: Date.now },
});
module.exports = mongoose.model("notification", notificationSchema);
