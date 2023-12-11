const mongoose = require("mongoose");
const propertySchema = new mongoose.Schema({
  ID_card: { type: String },
  Phone: { type: String },
  laptop: { type: String },
  mouse: { type: String },
  carryBag: { type: String },
  blazer: { type: String },
  toolkit: { type: String },
  mBatch: { type: String },
  trollyBag: { type: String },
  Brochure: { type: String },
  Catalog: { type: String },
  hardware: { type: String },
  userRef: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
});

const CompanyProperty = mongoose.model("properties", propertySchema);

module.exports = CompanyProperty;
