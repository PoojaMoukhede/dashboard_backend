// const mongoose = require("mongoose");

// const attandanceSchema = new mongoose.Schema(
//   {
//     Employee_attandance: [
//       {
//         Emp_status: { type: String },
//         timer :{type:Number},
//         punch_in:{ type: Date, default: Date.now }, 
//         // punch_out:{type: Date, default: Date.now }
        
//       }, 
//       //  { timestamps: true }
//     ],
//     userRef: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
//   },

// );
// const Attandance = mongoose.model("attandances", attandanceSchema);

// module.exports = Attandance;

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