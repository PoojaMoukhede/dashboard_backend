const mongooose = require('mongoose')

const employeeSchema = new mongooose.Schema({
    Emp_name: { type: String, required: true},
    Emp_email: { type: String, required: true },
    Emp_contact_No: { type: String, required: true},
    Emp_department: { type: String, required: true },
    Emp_city: { type: String, required: true},
    Emp_state: { type: String, required: true },
    Emp_DOB: { type: String, required: true},
    Emp_joining_date: { type: String, required: true },
})

const Employee = mongooose.model('employees', employeeSchema);

module.exports = Employee;