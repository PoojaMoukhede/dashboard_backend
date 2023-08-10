const express = require("express");
const router = express.Router();
const Manager = require('../Model/Manager')
const validator = require('validator');


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

// To add new Manager
router.post('/addmanager', async (req, res) => { 
    try {
        const { email } = req.body;

        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const existingManager = await Manager.findOne({ email });

        if (existingManager) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const newManager = await Manager.create({
            ...req.body
        });

        res.status(201).json(newManager);
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


module.exports= router