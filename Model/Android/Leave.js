const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  userRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  startDate: Date,
  endDate: Date,
  status: String, // 'pending', 'approved', 'rejected'
  numberOfDays: Number
});

const Leave = mongoose.model('Leave', leaveSchema);
module.exports = Leave;