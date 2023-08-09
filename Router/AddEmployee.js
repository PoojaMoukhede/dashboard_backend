const express = require("express");
const router = express.Router();
const Employee = require('../Model/AddEmployee')


// To get/view all employees
router.get('/get', async (req, res) => {  
    try {
        const results = await Employee.find();
        res.json(results);
        // console.log( "result in get" ,results )
    } catch (e) {
        res.status(400).json({ message: e.message });
        console.log(e);
    }
   
})

// To add new employee
router.post('/add', async (req, res) => { 
    try {
        let Employee_data = await Employee.create({
            ...req.body
        });
        //    console.log("Employee_data" ,Employee_data)
        res.status(201).json(Employee_data);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
   
})

router.get('/details/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id); // Convert the URL parameter to an integer
    const employee = await Employee.findOne({ employee_id: id });

    if (employee) {
      res.json(employee);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});




// router.post('/add', async (req, res) => {
//     try {
//       // Get the last assigned employee ID from your storage (e.g., another collection/document)
//       const lastEmployee = await Employee.findOne().sort({ employee_id: -1 });
//       const newEmployeeID = lastEmployee ? lastEmployee.employee_id + 1 : 120;
  
//       const newEmployee = new Employee({
//         employee_id: newEmployeeID,
//         Emp_name: req.body.Emp_name,
//         Emp_email: req.body.Emp_email,
//         Emp_contact_No: req.body.Emp_contact_No,
//         Emp_DOB: req.body.Emp_DOB,
//         Emp_joining_date: req.body.Emp_joining_date,
//         Emp_city: req.body.Emp_city,
//         Emp_state: req.body.Emp_state,
//         Emp_department: req.body.Emp_department,
//       });
  
//       await newEmployee.save();
//       res.json(newEmployee);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Server error' });
//     }
//   });


module.exports = router;