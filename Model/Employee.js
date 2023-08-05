const mongooose = require("mongoose");

const employeeSchema = new mongooose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  contact_no: { type: String, required: true },
  DOB: { type: String, required: true },
  joining_date: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  department: { type: String, required: true },
});

const Employee = mongooose.model("employees", employeeSchema);

module.exports = Employee;
