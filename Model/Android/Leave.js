const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  Leave_info:[
    {
      startDate: Date,
      endDate: Date,
      status: {type : String, default :"Pending"}, // 'pending', 'approved', 'rejected'
      numberOfDays: Number,
    }
  ],
  userRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
 
});

const Leave = mongoose.model('Leave', leaveSchema);
module.exports = Leave;