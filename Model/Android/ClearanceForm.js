const mongoose = require("mongoose");

const clearanceSchema = new mongoose.Schema({
  FormData: [
    {
      Transport_type: { type: String },
      Total_expense: { type: String },
      Fuel_in_liters: { type: Number, default: 0 },
      images: {
        data: Buffer,
        contentType: String,
      },
      ImageName: { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  userRef: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
});

const Clearance = mongoose.model("clearances", clearanceSchema);
module.exports = Clearance;