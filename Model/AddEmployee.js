const mongooose = require('mongoose')

const employeeSchema = new mongooose.Schema({
    // employee_id: Number,
    Emp_name: { type: String},
    Emp_email: { type: String ,unique: true},
    Emp_contact_No: { type: String},
    Emp_department: { type: String},
    Emp_city: { type: String},
    Emp_state: { type: String},
    Emp_DOB: { type: String},
    Emp_joining_date: { type: String},
})
// const employeeSchema = new mongooose.Schema({
//     Emp_name: { type: String, required: true },
//     Emp_email: { type: String, unique: true, required: true },
//     Emp_contact_No: { type: String, required: true },
//     Emp_department: { type: String, required: true },
//     Emp_city: { type: String },
//     Emp_state: { type: String },
//     Emp_DOB: { type: String, required: true },
//     Emp_joining_date: { type: String, required: true },
// });

const Employee = mongooose.model('employees', employeeSchema);

module.exports = Employee;