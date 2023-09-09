const mongooose = require('mongoose')

const employeeSchema = new mongooose.Schema({
    // employee_id: Number,
    // _id:mongooose.Schema.Types.ObjectId,
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
})

const Employee = mongooose.model('employees', employeeSchema);

module.exports = Employee;