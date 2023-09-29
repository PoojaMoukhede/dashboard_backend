const mongoose = require("mongoose");

const attandanceSchema = new mongoose.Schema(
  {
    Employee_attandance: [
      {
        Emp_status: { type: String },
      },
    ],
    userRef: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true }
);
const Attandance = mongoose.model("attandances", attandanceSchema);

module.exports = Attandance;

