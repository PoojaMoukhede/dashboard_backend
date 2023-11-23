const mongoose = require("mongoose");
const clearanceSchema = new mongoose.Schema({
  FormData: [
    {
      Transport_type: { type: String },
      Total_expense: { type: String },
      Fuel_in_liters: { type: Number, default: 0 },
      Food: { type: String },
      Water: { type: String },
      Hotel: { type: String },
      Other_Transport: { type: String },
      images: [
        {
          data: { type: Buffer },
          contentType: { type: String },
        },
      ],
      ImageName: { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  userRef: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
});

const Clearance = mongoose.model("clearances", clearanceSchema);
module.exports = Clearance;

