const mongooose = require("mongoose");

const complaintSchema = new mongooose.Schema(
  {
    Message: [
      {
        message: { type: String },
        status: { type: String, default: 'Pending' },
      },
    ],
    userRef: { type: mongooose.Schema.Types.ObjectId, ref: "users" },
    
  },
  { timestamps: true }
);

const Complaint = mongooose.model("complaints", complaintSchema);
module.exports = Complaint;
