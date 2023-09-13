const express = require("express");
const router = express.Router();
const Employee = require('../Model/AddEmployee')
const multer = require('multer');
const xlsx = require('xlsx');
const upload = multer({ dest: 'uploads/' })


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

router.get('/getemployee/:id', async (req, res) => {  
  const employeeId = req.params.id;
  try {
      const employee = await Employee.findById(employeeId);

      if (!employee) {
          return res.status(404).json({ employee: 'Employee not found' });
      }

      res.json(employee);
  } catch (e) {
      res.status(400).json({ message: e.message });
      console.error(e);
  }
});

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

router.put('/putEmployee/:id', async (req, res) => {

  try {
      const data = req.body;
      const employee = await Employee.findOneAndUpdate({ _id: req.params.id }, data);
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
// router.delete("/deleteEmployee", async (req, res) => {
//   const ID = req.params.id;
//   const employee = await Employee.({ _id: ID });
//   res.send("Employee's data has been Deleted");
  
// })


// for importing file and save data into database
router.post('/importdata', upload.single('file'), async (req, res) => {
    try {
        console.log("inside importdata backend")
      if (!req.file) {
        console.log("No file uploaded")
        return res.status(400).json({ message: 'No file uploaded' });
      }
  
      const workbook = xlsx.readFile(req.file.path);
      console.log(`Workbook : ${workbook}`)
      const sheetName = workbook.SheetNames; // Assuming data is in the first sheet
      console.log(`sheetName : ${sheetName}`)
      const importedData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      console.log(`importedData : ${importedData}`)
  
      await Employee.insertMany(importedData);
      // console.log(`Employee : ${Employee}`)
      
      res.status(200).json({ message: 'Data imported successfully' });
    } catch (error) {
      console.error('Error importing data:', error);
      res.status(500).json({ message: 'Error importing data' });
    }
  });



module.exports = router;