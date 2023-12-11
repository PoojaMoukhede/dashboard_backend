const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema(
  {
    Location_info:[
     {
      startPoint: {
        startPointname: { type: String },
        startLatitude: { type: String },
        startLongitude: { type: String },
      },
      endPoint: {
        endPointname: { type: String },
        endLatitude: { type: String },
        endLongitude: { type: String },
      },
      distance: { type: Number },
      timestamp: { type: Date, default: Date.now },
     }
    ],
    userRef: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
);

const Location = mongoose.model("locations", LocationSchema);
module.exports = Location;