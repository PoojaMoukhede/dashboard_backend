const mongoose = require("mongoose");
const salarySchema = new mongoose.Schema({
  bankName: { type: String },
  bankCity: { type: String },
  ifscCode: { type: String },
  acNumber: { type: Number },
  rtgs: { type: String },
  panNumber: { type: String },
  basicSalary: { type: String },
  hra: { type: String },
  profTax: { type: String },
  pfNumber: { type: String },
  increment: { type: String },
  pfAmount: { type: String },
  dateOfIncrment:{type: Date},
  userRef: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
});

const Salary = mongoose.model("salary", salarySchema);

module.exports = Salary;
