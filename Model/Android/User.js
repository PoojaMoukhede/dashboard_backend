const mongooose = require("mongoose");

const userSchema = new mongooose.Schema({
  password: { type: String, required: true },
  Emp_ID: { type: String, unique: true },
  Emp_name: { type: String},
  email: { type: String ,unique: true},
  Emp_contact_No: { type: String},
  Emp_department: { type: String},
  Emp_city: { type: String},
  Emp_state: { type: String},
  Emp_DOB: { type: String},
  Emp_joining_date: { type: String},
  Emp_blood_group:{type:String},
  Emp_qualification:{type:String},
  Emp_expertise:{type:String},
  Emp_country:{type:String},
  Emp_designation:{type:String},
});

const User = mongooose.model("users", userSchema);
 
module.exports = User;
  