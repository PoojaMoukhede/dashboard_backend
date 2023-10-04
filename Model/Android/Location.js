const mongooose = require("mongoose");

const LocationSchema = new mongooose.Schema(
  {
    Location_info: [
      {
        startPoint: { type: String },
        endPoint: { type: String },
        timestamp: { type: Date, default: Date.now }, 
      },
    ],
    userRef: { type: mongooose.Schema.Types.ObjectId, ref: "users" },
  },
  // { timestamps: true }
);

const Location = mongooose.model("locations", LocationSchema);
module.exports = Location;
