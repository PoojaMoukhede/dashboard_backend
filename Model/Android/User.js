const mongooose = require("mongoose");

const userSchema = new mongooose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  Emp_ID: { type: String, unique: true },
});

const User = mongooose.model("users", userSchema);

module.exports = User;
