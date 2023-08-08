const mongooose = require('mongoose')

const employeeSchema = new mongooose.Schema({
    Emp_name: { type: String},
    Emp_email: { type: String ,unique: true},
    Emp_contact_No: { type: String},
    Emp_department: { type: String },
    Emp_city: { type: String},
    Emp_state: { type: String },
    Emp_DOB: { type: String},
    Emp_joining_date: { type: String },
})

const Employee = mongooose.model('employees', employeeSchema);

module.exports = Employee;