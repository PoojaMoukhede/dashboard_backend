const mongooose = require("mongoose");

const userSchema = new mongooose.Schema({
  // _id:{type:mongooose.Schema.Types.ObjectId}, // by this we archive useRef 
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  Emp_ID: { type: String, required: true, unique: true },
});

const User = mongooose.model("users", userSchema);

module.exports = User;
