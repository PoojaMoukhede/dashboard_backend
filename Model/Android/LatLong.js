const mongooose = require("mongoose");

const LatLongSchema = new mongooose.Schema(
  {
    Details_location: [
      {
        latitude: { type: String },
        longitude: { type: String },
        distance: { type: String },
      },
    ],
    userRef: { type: mongooose.Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true }
);

const LatLong = mongooose.model("locations", LatLongSchema);
module.exports = LatLong;
