const express = require("express");
const router = express.Router();
const Manager = require('../../Model/Web/Manager')
const validator = require('validator');
const multer = require('multer');
const xlsx = require('xlsx');
const upload = multer({ dest: 'uploads/' })

// To get/view all Managers
router.get('/getmanager', async (req, res) => {  
    try {
        const results = await Manager.find();
        res.json(results);
        // console.log( "result in get" ,results )
    } catch (e) {
        res.status(400).json({ message: e.message });
        console.log(e);
    }
   
})

router.get('/getmanager/:id', async (req, res) => {  
    const managerId = req.params.id;
    try {
        const manager = await Manager.findById(managerId);

        if (!manager) {
            return res.status(404).json({ message: 'Manager not found' });
        }

        res.json(manager);
    } catch (e) {
        res.status(400).json({ message: e.message });
        console.error(e);
    }
});


// To add new Manager
router.post('/addmanager', async (req, res) => { 
    try {
        let Manager_data = await Manager.create({
            ...req.body
        });
           console.log("Employee_data" ,Manager_data)
        res.status(201).json(Manager_data);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }

   
})

//edit
router.put('/put/:id', async (req, res) => {

    try {
        const data = req.body;
        const Manager_data = await Manager.updateOne({ _id: req.params.id }, data);
        res.json({ result: Manager_data });
    }
    catch (e) {
        res.status(400).json({ message: e.message });
    }

});

//delete
router.delete("/delete/:id", async (req, res) => {
    const ID = req.params.id;
    const Manager_data = await Manager.findOneAndDelete({ _id: ID });
    res.send("Manager's data has been Deleted");
    
})

router.delete("/deleteAll", async (req, res) => {
    const selectedUser= req.body._id;
    const Manager_data = await Manager.deleteMany({ _id: selectedUser });
    res.send("Manager's data has been Deleted");
    
})



router.post('/importmanager', upload.single('file'), async (req, res) => {
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
  
      await Manager.insertMany(importedData);
      // console.log(`Manager : ${Manager}`)
      
      res.status(200).json({ message: 'Data imported successfully' });
    } catch (error) {
      console.error('Error importing data:', error);
      res.status(500).json({ message: 'Error importing data' });
    }
  });



module.exports= router