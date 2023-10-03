const mongooose = require("mongoose");

const userSchema = new mongooose.Schema({
  // _id:mongooose.Schema.Types.ObjectId, // by this we archive useRef  but now cleared
  // name: { type: String },
  // email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  Emp_ID: { type: String, unique: true },
  Emp_name: { type: String},
  Emp_email: { type: String ,unique: true},
  Emp_contact_No: { type: String},
  Emp_department: { type: String},
  Emp_city: { type: String},
  Emp_state: { type: String},
  Emp_DOB: { type: String},
  Emp_joining_date: { type: String},
  Emp_blood_group:{type:String},
  Emp_qualification:{type:String},
  Emp_expertise:{type:String}
});

const User = mongooose.model("users", userSchema);

module.exports = User;
