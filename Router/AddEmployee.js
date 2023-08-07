const express = require("express");
const router = express.Router();
const Employee = require('../Model/AddEmployee')


// To add new employee
router.get('/get', async (req, res) => {  
    try {
        const results = await Employee.find();
        res.json(results);
        console.log( "result in get" ,results )
    } catch (e) {
        res.status(400).json({ message: e.message });
        console.log(e);
    }
   
})


// To get/view all employees
router.post('/add', async (req, res) => { 
    try {
        let Employee_data = await Employee.create({
            ...req.body
        });
           console.log("Employee_data" ,Employee_data)
        res.status(201).json(Employee_data);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
   
})
module.exports = router;