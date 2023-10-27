const mongoose = require("mongoose");

const attandanceSchema = new mongoose.Schema({
  Employee_attandance: [
    {
      action: { type: String, enum: ["Punch In", "Punch Out"] },
      Emp_status: { type: String },
      timer: { type: Number },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  userRef: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
});

const Attandance = mongoose.model("attandances", attandanceSchema);

module.exports = Attandance;