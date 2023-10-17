const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
    userRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
  availableLeave: Number, // Field to store available leave days for the user
});

const LeaveBalance = mongoose.model('LeaveBalance', leaveBalanceSchema);
module.exports = LeaveBalance;