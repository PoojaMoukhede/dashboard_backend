const mongoose = require("mongoose");
const customerSchema = new mongoose.Schema({
  customerName: { type: String, unique: true },
  customerPhone: { type: Number },
  customerEmail: { type: String, unique: true },
  customerAddress: { type: String },
  industryType:{type:String},
  reason: { type: String },
});

const Customer = mongoose.model("customers", customerSchema);

module.exports = Customer;
