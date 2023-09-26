const mongooose = require("mongoose");

const userSchema = new mongooose.Schema({
  // _id:mongooose.Schema.Types.ObjectId, // by this we archive useRef  but now cleared
  // name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  Emp_ID: { type: String, unique: true },
});

const User = mongooose.model("users", userSchema);

module.exports = User;
