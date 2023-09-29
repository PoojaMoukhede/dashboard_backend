const mongoose = require("mongoose");

const attandanceSchema = new mongoose.Schema(
  {
    Employee_attandance: [
      {
        Emp_status: { type: String },
        timer :{type:Number}
      }, 
       { timestamps: true }
    ],
    userRef: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },

);
const Attandance = mongoose.model("attandances", attandanceSchema);

module.exports = Attandance;

