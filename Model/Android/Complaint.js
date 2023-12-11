const mongooose = require("mongoose");

const complaintSchema = new mongooose.Schema(
  {
    Message: [
      {
        message: { type: String },
        status: { type: String, default: 'Pending'},
        timestamp: { type: Date, default: Date.now }, 
      },
    ],
    userRef: { type: mongooose.Schema.Types.ObjectId, ref: "users" },
    
  },
);

const Complaint = mongooose.model("complaints", complaintSchema);
module.exports = Complaint;
