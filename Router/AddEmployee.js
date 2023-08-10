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
// try {
//     const { email } = req.body;

//     if (!validator.isEmail(email)) {
//         return res.status(400).json({ message: 'Invalid email format' });
//     }

//     const existingEmployee = await Employee.findOne({ email });

//     if (existingEmployee) {
//         return res.status(400).json({ message: 'Email already exists' });
//     }

//     const newEmployee = await Employee.create({
//         ...req.body
//     });

//     res.status(201).json(newEmployee);
// }  

router.put('/putEmployee/:id', async (req, res) => {

  try {
      const data = req.body;
      const employee = await Employee.updateOne({ _id: req.params.id }, data);
      res.json({ result: employee });
  }
  catch (e) {
      res.status(400).json({ message: e.message });
  }

});

//delete
router.delete("/deleteEmployee/:id", async (req, res) => {
  const ID = req.params.id;
  const employee = await Employee.findOneAndDelete({ _id: ID });
  res.send("Employee's data has been Deleted");
  
})


module.exports = router;